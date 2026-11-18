const createDatastore = require('../config/db');

const orders = createDatastore('orders.db');
const ready = (async () => {
  await orders.autoloadPromise;
  await orders.ensureIndexAsync({ fieldName: 'userId' });
  await orders.ensureIndexAsync({ fieldName: 'demoKey', unique: true, sparse: true });
})();

function publicOrder(order) {
  const { _id, userId, address, items, status, totalCents, createdAt, updatedAt } = order;
  return {
    id: _id, userId, address, status, total: totalCents / 100, createdAt, updatedAt,
    items: items.map(({ menuItemId, name, quantity, unitPriceCents }) => ({
      menuItemId, name, quantity, unitPrice: unitPriceCents / 100,
      subtotal: (unitPriceCents * quantity) / 100,
    })),
  };
}

function priceInCents(price) {
  const [digits, exponent = '0'] = String(price).split('e');
  return Math.round(Number(digits + 'e' + (Number(exponent) + 2)));
}

function checkoutItems(lines, menuById) {
  const items = lines.map(({ menuItemId, quantity }) => {
    const { name, price } = menuById.get(menuItemId);
    return { menuItemId, name, quantity, unitPriceCents: priceInCents(price) };
  });
  const totalCents = items.reduce((total, item) => total + item.unitPriceCents * item.quantity, 0);
  if (items.some(({ unitPriceCents }) => !Number.isSafeInteger(unitPriceCents) || unitPriceCents < 1) ||
      !Number.isSafeInteger(totalCents)) {
    const error = new Error('Menu prices or order total cannot be represented in cents');
    error.status = 422;
    throw error;
  }
  return { items, totalCents };
}

function create({ userId, address, items, totalCents, status = 'pending', demoKey }) {
  const now = new Date().toISOString();
  return orders.insertAsync({
    userId, address, items, totalCents, status, createdAt: now, updatedAt: now,
    ...(demoKey === undefined ? {} : { demoKey }),
  });
}

function list(query = {}) {
  return orders.findAsync(query).sort({ createdAt: -1, _id: 1 }).execAsync();
}

function findById(id) {
  return orders.findOneAsync({ _id: id });
}

function findDemo(demoKey) {
  return orders.findOneAsync({ demoKey });
}

async function updateStatus(id, previous, status) {
  const result = await orders.updateAsync(
    { _id: id, status: previous },
    { $set: { status, updatedAt: new Date().toISOString() } },
    { returnUpdatedDocs: true }
  );
  return result.affectedDocuments;
}

async function stats() {
  const records = await orders.findAsync({}, { status: 1, totalCents: 1 }).execAsync();
  let pendingOrders = 0;
  let deliveredCents = 0;
  for (const order of records) {
    if (order.status === 'pending') pendingOrders += 1;
    if (order.status === 'delivered') deliveredCents += order.totalCents;
  }
  return { totalOrders: records.length, deliveredRevenue: deliveredCents / 100, pendingOrders };
}

module.exports = { ready, publicOrder, checkoutItems, create, list, findById, findDemo, updateStatus, stats };
