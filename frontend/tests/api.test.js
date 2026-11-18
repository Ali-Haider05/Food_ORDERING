import assert from 'node:assert/strict';
import { test } from 'node:test';
import api, { SESSION_EXPIRED, TOKEN_KEY } from '../src/services/api.js';
import { authService } from '../src/services/authService.js';
import { categoryService, menuService } from '../src/services/menuService.js';
import { nextStatuses, orderService } from '../src/services/orderService.js';
import { statsService } from '../src/services/statsService.js';

const storage = new Map();
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  },
});
globalThis.window = new EventTarget();

function respond(handler) {
  api.defaults.adapter = async (config) => {
    const data = await handler(config, config.data ? JSON.parse(config.data) : undefined);
    return { data, status: 200, headers: {}, config };
  };
}

const user = { id: 'user-1', name: 'Test account', role: 'user' };
const dish = { id: 'dish-1', name: 'Burger', description: 'Grilled', category: 'cat-1',
  available: false, price: 4.25, image: 'https://example.test/dish.png' };
const order = { id: 'order-1', userId: user.id, total: 8.5, address: '12 Test Street',
  status: 'pending', items: [{ menuItemId: dish.id, name: dish.name, unitPrice: 4.25, quantity: 2, subtotal: 8.5 }] };

test('signup and login send only supported credentials and profile uses the issued token', async () => {
  respond((request, body) => {
    if (request.url === '/auth/me') {
      assert.equal(request.method, 'get');
      assert.equal(request.headers.Authorization, 'Bearer test-token');
      return { success: true, user };
    }
    assert.equal(request.method, 'post');
    assert.equal(request.headers.Authorization, undefined);
    const credentials = { email: 'user@example.test', password: 'fixture-password' };
    if (request.url === '/auth/signup') assert.deepEqual(body, { ...credentials, name: user.name });
    else {
      assert.equal(request.url, '/auth/login');
      assert.deepEqual(body, credentials);
    }
    return { success: true, user, token: 'test-token' };
  });
  await authService.signup({ ...user, email: 'user@example.test', password: 'fixture-password' });
  await authService.login('user@example.test', 'fixture-password');
  assert.deepEqual(await authService.getCurrentUser(), user);
  assert.deepEqual([...storage], [[TOKEN_KEY, 'test-token']]);
});

test('a protected 401 clears only the token used for that request and emits expiry', async () => {
  let expired = 0;
  window.addEventListener(SESSION_EXPIRED, () => { expired += 1; }, { once: true });
  respond((config) => {
    throw Object.assign(new Error('Unauthorized'), { config, response: { status: 401, data: { message: 'Sign in' } } });
  });
  await assert.rejects(authService.getCurrentUser(), /Sign in/);
  assert.equal(authService.getToken(), null);
  assert.equal(expired, 1);
});

test('menu follows subsequent pages, passes filters and unwraps details', async () => {
  const pages = [];
  respond((config) => {
    if (config.url === '/menu/dish-1') return { item: dish };
    assert.equal(config.url, '/menu');
    assert.equal(config.params.search, 'burger');
    assert.equal(config.params.category, dish.category);
    assert.equal(config.params.limit, 100);
    pages.push(config.params.page);
    return { items: [config.params.page === 1 ? dish : { ...dish, id: 'dish-2', available: true }],
      pagination: { totalPages: 2 } };
  });
  const items = await menuService.getAll({ search: 'burger', category: dish.category });
  assert.deepEqual(pages, [1, 2]);
  assert.deepEqual(items.map(({ isAvailable }) => isAvailable), [false, true]);
  assert.equal((await menuService.getById(dish.id)).isAvailable, false);
});

test('admin menu and category writes use backend routes and allowlisted payloads', async () => {
  const writes = [];
  respond(({ method, url, headers }, body) => {
    writes.push([method, url, body]);
    assert.equal(headers.Authorization, 'Bearer admin-token');
    return { item: dish, category: { id: dish.category, name: 'Burgers' } };
  });
  localStorage.setItem(TOKEN_KEY, 'admin-token');
  const form = { ...dish, isAvailable: false, price: '4.25', rating: 5 };
  const payload = { name: dish.name, description: dish.description, category: dish.category,
    price: 4.25, image: dish.image, available: false };
  await menuService.create(form);
  await menuService.update(dish.id, form);
  await menuService.delete(dish.id);
  await categoryService.save('Burgers');
  await categoryService.save('Burgers', dish.category);
  await categoryService.delete(dish.category);
  assert.deepEqual(writes, [
    ['post', '/menu', payload], ['put', '/menu/dish-1', payload], ['delete', '/menu/dish-1', undefined],
    ['post', '/categories', { name: 'Burgers' }], ['put', '/categories/cat-1', { name: 'Burgers' }],
    ['delete', '/categories/cat-1', undefined],
  ]);
});

test('checkout sends IDs, quantities and address and displays the server-confirmed amount', async () => {
  respond(({ method, url }, body) => {
    assert.equal(method, 'post');
    assert.equal(url, '/orders');
    assert.deepEqual(body, { address: order.address, items: [{ menuItemId: dish.id, quantity: 2 }] });
    return { order };
  });
  const confirmed = await orderService.createOrder({ address: order.address, total: 0,
    items: [{ id: dish.id, quantity: 1, price: 0 }, { id: dish.id, quantity: 1, price: 0 }] });
  assert.equal(confirmed.total, 8.5);
  assert.equal(confirmed.items[0].subtotal, 8.5);
  assert.equal(confirmed.deliveryAddress, order.address);
});

test('history and admin updates use the correct routes and status progression', async () => {
  const calls = [];
  respond(({ method, url }, body) => {
    calls.push([method, url, body]);
    return method === 'get' ? { orders: [order] } : { order: { ...order, status: body.status } };
  });
  await orderService.getMyOrders();
  await orderService.getAllOrders();
  const updated = await orderService.updateStatus(order.id, 'preparing');
  assert.equal(updated.status, 'preparing');
  assert.deepEqual(calls, [
    ['get', '/orders/my', undefined], ['get', '/orders', undefined],
    ['put', '/orders/order-1/status', { status: 'preparing' }],
  ]);
  assert.deepEqual(nextStatuses('pending'), ['preparing', 'cancelled']);
  assert.deepEqual(nextStatuses('preparing'), ['delivered', 'cancelled']);
  assert.deepEqual(nextStatuses('delivered'), []);
  assert.deepEqual(nextStatuses('cancelled'), []);
});

test('dashboard uses server totals and derives charts from delivered orders', async () => {
  const now = new Date().toISOString();
  const stats = { totalOrders: 2, deliveredRevenue: order.total, pendingOrders: 1, totalUsers: 2, totalMenuItems: 1 };
  respond(({ url }) => ({
    '/admin/stats': { stats },
    '/orders': { orders: [order, { ...order, id: 'order-2', status: 'delivered', updatedAt: now }] },
    '/menu': { items: [dish], pagination: { totalPages: 1 } },
    '/categories': { categories: [{ id: dish.category, name: 'Burgers' }] },
  })[url]);
  const live = await statsService.getDashboardStats();
  assert.equal(live.totalRevenue, order.total);
  assert.equal(live.totalUsers, 2);
  assert.equal(live.revenueByDay.reduce((sum, day) => sum + day.revenue, 0), order.total);
  assert.deepEqual(live.categoryDistribution, [{ category: 'Burgers', count: 1, percentage: 100 }]);
});
