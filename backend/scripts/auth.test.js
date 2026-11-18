const assert = require('node:assert/strict');
const { spawn, spawnSync } = require('node:child_process');
const { randomBytes } = require('node:crypto');
const { once } = require('node:events');
const fs = require('node:fs');
const path = require('node:path');
const bcrypt = require('bcrypt');
const express = require('express');
const jwt = require('jsonwebtoken');
const { test } = require('node:test');

const backend = path.resolve(__dirname, '..');
const credentials = { email: 'ali@example.test', password: 'StrongPass123!' };
const expectedUser = { name: 'Ali', email: credentials.email, role: 'user' };

async function startBackend(env) {
  const child = spawn(process.execPath, ['server.js'], {
    cwd: backend,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const closed = once(child, 'close');
  let stderr = '';
  child.stderr.on('data', (chunk) => { stderr += chunk; });
  child.stdout.setEncoding('utf8');

  let port;
  try {
    for await (const chunk of child.stdout) {
      port = /listening on port (\d+)/.exec(chunk)?.[1];
      if (port) break;
    }
    assert.ok(port, stderr || 'Backend did not announce a listening port');
  } catch (error) {
    child.kill();
    await closed;
    throw error;
  }

  return {
    base: 'http://127.0.0.1:' + port,
    async stop() {
      child.kill();
      await closed;
      assert.equal(stderr, '');
    },
  };
}

async function request(base, route, status, { body, token, method } = {}) {
  const response = await fetch(base + route, {
    method: method || (body === undefined ? 'GET' : 'POST'),
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(token === undefined ? {} : { Authorization: 'Bearer ' + token }),
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
    signal: AbortSignal.timeout(5000),
  });
  const payload = await response.json();
  assert.equal(response.status, status, route + ': ' + JSON.stringify(payload));
  if (status >= 400) {
    assert.deepEqual(Object.keys(payload).sort(), ['message', 'success']);
    assert.equal(payload.success, false);
  }
  assert.doesNotMatch(JSON.stringify(payload), /"password"|\$2[aby]\$/);
  return payload;
}

test('Phase 2 authentication with isolated NeDB files', { timeout: 30000 }, async (t) => {
  const directory = fs.mkdtempSync(path.join(backend, 'data', 'auth-test-'));
  const secret = randomBytes(32).toString('hex');
  const env = { ...process.env, PORT: '0', DATA_DIR: directory, JWT_SECRET: secret };
  let server;
  let user;
  let token;
  const signup = '/api/auth/signup';
  const login = '/api/auth/login';
  const profile = '/api/auth/me';

  try {
    await t.test('startup rejects an empty JWT secret and both placeholders', () => {
      for (const invalid of ['', 'replace_with_a_secure_random_secret', 'replace_with_your_generated_jwt_secret']) {
        const child = spawnSync(process.execPath, ['server.js'], {
          cwd: backend, env: { ...env, JWT_SECRET: invalid }, encoding: 'utf8', timeout: 5000,
        });
        assert.equal(child.status, 1);
        assert.match(child.stderr, /Set JWT_SECRET/);
        assert.doesNotMatch(child.stdout, /listening/);
      }
    });

    server = await startBackend(env);
    await t.test('signup, normalization, public role restriction, and JWT claims', async () => {
      const data = await request(server.base, signup, 201, {
        body: { name: ' Ali ', email: ' ALI@example.test ', password: credentials.password, role: 'admin' },
      });
      assert.ok(data.user.id);
      user = { id: data.user.id, ...expectedUser };
      token = data.token;
      assert.deepEqual(data, { success: true, message: 'User registered successfully', token, user });
      const claims = jwt.verify(token, secret, { algorithms: ['HS256'] });
      assert.deepEqual(Object.keys(claims).sort(), ['exp', 'iat', 'sub']);
      assert.equal(claims.sub, user.id);
      assert.equal(claims.exp - claims.iat, 7 * 24 * 60 * 60);
    });

    await t.test('signup validation and duplicate rejection', async () => {
      await request(server.base, signup, 400, { body: {} });
      await request(server.base, signup, 400, { body: { name: 'Ali', ...credentials, email: 'invalid' } });
      await request(server.base, signup, 400, { body: { name: 'Ali', ...credentials, password: 'short' } });
      await request(server.base, signup, 400, { body: { name: 'Ali', ...credentials, password: '\u00e9'.repeat(37) } });
      await request(server.base, signup, 409, { body: { name: 'Other', ...credentials, email: ' ALI@EXAMPLE.TEST ' } });

      const body = { name: 'Concurrent', ...credentials, email: 'concurrent@example.test' };
      const results = await Promise.all([body, body].map((payload) => fetch(server.base + signup, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      })));
      assert.deepEqual(results.map((response) => response.status).sort(), [201, 409]);
      for (const response of results) await response.json();
    });

    await t.test('login succeeds and incorrect or unknown credentials match', async () => {
      const data = await request(server.base, login, 200, { body: credentials });
      assert.equal(data.message, 'Login successful');
      assert.ok(data.token);
      assert.deepEqual(data.user, user);
      const wrong = await request(server.base, login, 401, { body: { ...credentials, password: 'incorrect' } });
      const unknown = await request(server.base, login, 401, { body: { ...credentials, email: 'unknown@example.test' } });
      assert.deepEqual(wrong, unknown);
      assert.equal(wrong.message, 'Invalid email or password');
    });

    await t.test('profile accepts a valid token and rejects missing, invalid, expired or deleted-user tokens', async () => {
      assert.deepEqual(await request(server.base, profile, 200, { token }), { success: true, user });
      await request(server.base, profile, 401);
      await request(server.base, profile, 401, { token: 'invalid' });
      await request(server.base, profile, 401, { token: jwt.sign({ sub: user.id }, secret, { expiresIn: -1 }) });
      await request(server.base, profile, 401, { token: jwt.sign({ sub: 'deleted-user' }, secret, { expiresIn: '7d' }) });
    });

    await t.test('health, JSON 404, and malformed JSON handling', async () => {
      assert.deepEqual(await request(server.base, '/api/health', 200), {
        success: true, message: 'Food Ordering Backend is running', database: 'NeDB',
      });
      await request(server.base, '/api/auth/missing', 404);
      await request(server.base, signup, 400, { body: '{' });
    });

    await t.test('user and JWT survive a restart and the stored password is a 12-round bcrypt hash', async () => {
      await server.stop();
      server = undefined;
      const contents = fs.readFileSync(path.join(directory, 'users.db'), 'utf8');
      assert.ok(!contents.includes(credentials.password));
      const stored = contents.trim().split('\n').map(JSON.parse).find((entry) => entry._id === user.id);
      assert.ok(stored);
      assert.equal(stored.createdAt, new Date(stored.createdAt).toISOString());
      assert.equal(bcrypt.getRounds(stored.password), 12);
      assert.ok(await bcrypt.compare(credentials.password, stored.password));
      server = await startBackend(env);
      const data = await request(server.base, login, 200, { body: credentials });
      assert.deepEqual(data.user, user);
      assert.deepEqual(await request(server.base, profile, 200, { token }), { success: true, user });
    });

    await t.test('non-admin gets 403 even with an admin role claim', async () => {
      await server.stop();
      server = undefined;
      process.env.DATA_DIR = directory;
      process.env.JWT_SECRET = secret;
      const User = require('../models/User');
      await User.ready;
      const authenticate = require('../middleware/authMiddleware');
      const { isAdmin } = require('../middleware/roleMiddleware');
      const app = express();
      app.get('/admin-test', authenticate, isAdmin, (_req, res) => res.json({ success: true }));
      const fixture = app.listen(0, '127.0.0.1');
      await once(fixture, 'listening');
      try {
        const base = 'http://127.0.0.1:' + fixture.address().port;
        const roleClaim = jwt.sign({ sub: user.id, role: 'admin' }, secret, { expiresIn: '7d' });
        await request(base, '/admin-test', 403, { token: roleClaim });
      } finally {
        await new Promise((resolve) => fixture.close(resolve));
      }
    });
  } finally {
    if (server) await server.stop();
    for (const entry of fs.readdirSync(directory)) fs.unlinkSync(path.join(directory, entry));
    fs.rmdirSync(directory);
  }
});
