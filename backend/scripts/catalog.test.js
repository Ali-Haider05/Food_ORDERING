const assert = require('node:assert/strict');
const { spawn, spawnSync } = require('node:child_process');
const { randomBytes } = require('node:crypto');
const { once } = require('node:events');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const bcrypt = require('bcrypt');
const Datastore = require('@seald-io/nedb');

const backend = path.resolve(__dirname, '..');

function sandbox(t) {
  const directory = fs.mkdtempSync(path.join(backend, 'data', 'phase3-test-'));
  t.after(() => {
    for (const file of fs.readdirSync(directory)) fs.unlinkSync(path.join(directory, file));
    fs.rmdirSync(directory);
  });
  return {
    ...process.env,
    DATA_DIR: directory,
    JWT_SECRET: randomBytes(32).toString('hex'),
    ADMIN_NAME: 'Test Admin',
    ADMIN_EMAIL: 'admin@example.test',
    ADMIN_PASSWORD: randomBytes(24).toString('hex'),
    TRUST_PROXY_HOPS: '0',
    PORT: '0',
  };
}

function seed(env) {
  return spawnSync(process.execPath, ['scripts/seed.js'], {
    cwd: backend, env, encoding: 'utf8', timeout: 10000,
  });
}

async function openData(env, file) {
  const db = new Datastore({ filename: path.join(env.DATA_DIR, file), autoload: true });
  await db.autoloadPromise;
  return db;
}

async function withBackend(env, run) {
  const child = spawn(process.execPath, ['server.js'], { cwd: backend, env });
  const closed = once(child, 'close');
  let errorOutput = '';
  child.stderr.on('data', (chunk) => { errorOutput += chunk; });
  try {
    const [output] = await Promise.race([
      once(child.stdout, 'data'),
      closed.then(() => { throw new Error(errorOutput || 'Backend exited before listening'); }),
    ]);
    const port = /listening on port (\d+)/.exec(output.toString())?.[1];
    assert.ok(port, output.toString());
    await run('http://127.0.0.1:' + port + '/api');
    assert.equal(errorOutput, '');
  } finally {
    child.kill();
    await closed;
  }
}

async function request(base, route, status, { method, body, token } = {}) {
  const response = await fetch(base + route, {
    method: method || (body === undefined ? 'GET' : 'POST'),
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(5000),
  });
  const data = await response.json();
  assert.equal(response.status, status, (method || 'GET/POST') + ' ' + route);
  assert.equal(data.success, status < 400);
  return { data, headers: response.headers };
}

test('seed creates one hashed admin, five categories and fifteen items, then preserves all records', async (t) => {
  const env = sandbox(t);
  const first = seed(env);
  assert.equal(first.status, 0, first.stderr);
  assert.match(first.stdout, /Admin created: 1. Categories created: 5. Menu items created: 15/);
  assert.ok(!first.stdout.includes(env.ADMIN_PASSWORD));

  const users = await openData(env, 'users.db');
  const categories = await openData(env, 'categories.db');
  const menu = await openData(env, 'menu.db');
  const initialUsers = await users.findAsync({});
  const initialCategories = await categories.findAsync({}).sort({ _id: 1 });
  const initialMenu = await menu.findAsync({}).sort({ _id: 1 });
  assert.equal(initialUsers.length, 1);
  assert.equal(initialUsers[0].role, 'admin');
  assert.equal(initialUsers[0].email, env.ADMIN_EMAIL);
  assert.equal(bcrypt.getRounds(initialUsers[0].password), 12);
  assert.ok(await bcrypt.compare(env.ADMIN_PASSWORD, initialUsers[0].password));
  assert.equal(initialCategories.length, 5);
  assert.equal(initialMenu.length, 15);
  const categoryIds = new Set(initialCategories.map(({ _id }) => _id));
  for (const item of initialMenu) {
    assert.ok(categoryIds.has(item.category));
    assert.equal(item.available, true);
    assert.ok(item.price > 0);
    assert.equal(new URL(item.image).protocol, 'https:');
  }
  const reseed = seed({ ...env, ADMIN_NAME: 'Changed', ADMIN_PASSWORD: randomBytes(24).toString('hex') });
  assert.equal(reseed.status, 0, reseed.stderr);
  assert.match(reseed.stdout, /Admin created: 0. Categories created: 0. Menu items created: 0/);
  assert.deepEqual(await (await openData(env, 'users.db')).findAsync({}), initialUsers);
  assert.deepEqual(await (await openData(env, 'categories.db')).findAsync({}).sort({ _id: 1 }), initialCategories);
  assert.deepEqual(await (await openData(env, 'menu.db')).findAsync({}).sort({ _id: 1 }), initialMenu);
});

test('seed requires credentials and never promotes or overwrites an existing regular account', async (t) => {
  const env = sandbox(t);
  const missing = seed({ ...env, ADMIN_EMAIL: '', ADMIN_PASSWORD: '' });
  assert.equal(missing.status, 1);
  assert.match(missing.stderr, /Set ADMIN_EMAIL and ADMIN_PASSWORD/);
  assert.deepEqual(fs.readdirSync(env.DATA_DIR), []);
  const users = await openData(env, 'users.db');
  const original = await users.insertAsync({ name: 'Regular User', email: env.ADMIN_EMAIL, role: 'user' });
  const collision = seed(env);
  assert.equal(collision.status, 1);
  assert.match(collision.stderr, /belongs to a non-admin account/);
  assert.deepEqual(await (await openData(env, 'users.db')).findAsync({}), [original]);
});

test('menu and category APIs enforce access, validation, safe search and referential integrity', { timeout: 20000 }, async (t) => {
  const env = sandbox(t);
  const result = seed(env);
  assert.equal(result.status, 0, result.stderr);
  await withBackend(env, async (base) => {
    const { data: health } = await request(base, '/health', 200);
    assert.deepEqual(health, { success: true, message: 'Food Ordering Backend is running', database: 'NeDB' });
    const { data: admin } = await request(base, '/auth/login', 200, { body: {
      email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD,
    } });
    const { data: user } = await request(base, '/auth/signup', 201, { body: {
      name: 'Regular', email: 'regular@example.test', password: randomBytes(16).toString('hex'), role: 'admin',
    } });
    await request(base, '/categories', 401, { body: { name: 'Hidden' } });
    await request(base, '/categories', 403, { token: user.token, body: { name: 'Hidden' } });
    await request(base, '/menu', 403, { token: user.token, body: {} });

    const token = admin.token;
    const { data: categoryResponse } = await request(base, '/categories', 201, { token, body: { name: ' Specials ' } });
    const category = categoryResponse.category;
    assert.deepEqual(Object.keys(category).sort(), ['createdAt', 'id', 'name']);
    assert.equal(category.name, 'Specials');
    await request(base, '/categories', 409, { token, body: { name: 'SPECIALS' } });
    await request(base, '/categories/' + category.id, 409, { token, method: 'PUT', body: { name: 'Burgers' } });
    await request(base, '/categories/' + category.id, 200, { token, method: 'PUT', body: { name: 'Daily Specials' } });

    const fields = { name: 'Burger [hot]', description: 'Daily special', price: 8.5,
      image: 'https://example.test/item.png', category: category.id };
    for (const invalid of [{ price: -1 }, { price: '8.5' }, { category: '0'.repeat(16) },
      { image: 'file:///tmp/sample' }, { _id: category.id }, { available: 'false' }]) {
      await request(base, '/menu', 400, { token, body: { ...fields, ...invalid } });
    }
    const { data: created } = await request(base, '/menu', 201, { token, body: fields });
    const item = created.item;
    assert.equal(item.available, true);
    const { data: detail } = await request(base, '/menu/' + item.id, 200);
    assert.deepEqual(detail.item, item);
    const filter = '/menu?search=%5Bhot%5D&available=true&page=1&limit=1&category=' + category.id;
    const { data: listing } = await request(base, filter, 200);
    assert.deepEqual(listing.items, [item]);
    assert.deepEqual(listing.pagination, { page: 1, limit: 1, total: 1, totalPages: 1 });
    for (const invalid of ['limit=101', 'page=-1', 'available=yes', 'category=invalid']) {
      await request(base, '/menu?' + invalid, 400);
    }
    await request(base, '/menu/' + item.id, 200, { token, method: 'PUT', body: { ...fields, available: false } });
    const { data: unavailable } = await request(base, '/menu?available=false&category=' + category.id, 200);
    assert.equal(unavailable.items.length, 1);
    await request(base, '/categories/' + category.id, 409, { token, method: 'DELETE' });
    await request(base, '/menu/' + item.id, 200, { token, method: 'DELETE' });
    await request(base, '/menu/' + item.id, 404);

    const [add, remove] = await Promise.allSettled([
      request(base, '/menu', 201, { token, body: fields }),
      request(base, '/categories/' + category.id, 200, { token, method: 'DELETE' }),
    ]);
    assert.equal([add, remove].filter(({ status }) => status === 'fulfilled').length, 1);
    if (add.status === 'fulfilled') {
      assert.equal(remove.reason.actual, 409);
      await request(base, '/menu/' + add.value.data.item.id, 200, { token, method: 'DELETE' });
      await request(base, '/categories/' + category.id, 200, { token, method: 'DELETE' });
    } else {
      assert.equal(add.reason.actual, 400);
    }
  });
});

test('signup and login enforce independent IP limits and health remains available', { timeout: 15000 }, async (t) => {
  const env = sandbox(t);
  await withBackend(env, async (base) => {
    for (const [route, limit] of [['/auth/signup', 10], ['/auth/login', 20]]) {
      for (let i = 0; i < limit; i += 1) {
        await request(base, route, 400, { body: {} });
      }
      const { data, headers } = await request(base, route, 429, { body: {} });
      assert.match(data.message, /Too many attempts/);
      assert.ok(Number(headers.get('retry-after')) > 0);
      assert.ok(headers.has('ratelimit'));
    }
    await request(base, '/health', 200);
  });
});
