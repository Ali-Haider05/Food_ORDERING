const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const runCatalogWrite = require('../config/catalogWrites');

const transitions = new Map([
  ['pending', ['preparing', 'cancelled']],
  ['preparing', ['delivered', 'cancelled']],
  ['delivered', []],
  ['cancelled', []],
]);

function hasOnlyFields(body, fields) {
  return body && typeof body === 'object' && !Array.isArray(body) &&
    Object.keys(body).every((key) => fields.includes(key));
}

function fail(response, status, message) {
  return response.status(status).json({ success: false, message });
}

async function place(request, response) {
  const body = request.body;
  if (!hasOnlyFields(body, ['items', 'address'])) {
    return fail(response, 400, 'Provide only items and address');
  }

  const { items, address } = body;
  if (typeof address !== 'string' || address.trim().length < 5 || address.trim().length > 500 ||
      !/[\p{L}\p{N}]/u.test(address) || /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(address)) {
    return fail(response, 400, 'Provide a valid delivery address of 5 to 500 characters');
  }
  if (!Array.isArray(items) || items.length < 1 || items.length > 50) {
    return fail(response, 400, 'Provide 1 to 50 order items');
  }

  const ids = new Set();
  for (const item of items) {
    if (!hasOnlyFields(item, ['menuItemId', 'quantity']) ||
        typeof item.menuItemId !== 'string' || !/^[A-Za-z0-9]{16}$/.test(item.menuItemId) ||
        !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99 ||
        ids.has(item.menuItemId)) {
      return fail(response, 400, 'Each item requires a distinct menu item ID and a quantity from 1 to 99');
    }
    ids.add(item.menuItemId);
  }

  const result = await runCatalogWrite(async () => {
    const menu = await MenuItem.findByIds([...ids]);
    if (menu.length !== ids.size) return { status: 404, message: 'A menu item was not found' };
    if (menu.some(({ available }) => available !== true)) {
      return { status: 409, message: 'A menu item is unavailable' };
    }

    const byId = new Map(menu.map((item) => [item._id, item]));
    const checkout = Order.checkoutItems(items, byId);
    const order = await Order.create({ ...checkout, userId: request.user.id, address: address.trim() });
    return { status: 201, order };
  });

  if (!result.order) return fail(response, result.status, result.message);
  return response.status(201).json({ success: true, order: Order.publicOrder(result.order) });
}

async function myOrders(request, response) {
  const orders = await Order.list({ userId: request.user.id });
  return response.status(200).json({ success: true, orders: orders.map(Order.publicOrder) });
}

async function allOrders(_request, response) {
  const orders = await Order.list();
  return response.status(200).json({ success: true, orders: orders.map(Order.publicOrder) });
}

async function changeStatus(request, response) {
  const body = request.body;
  if (!hasOnlyFields(body, ['status']) || !transitions.has(body.status)) {
    return fail(response, 400, 'Provide a valid order status');
  }

  const order = await Order.findById(request.params.id);
  if (!order) return fail(response, 404, 'Order not found');
  if (!transitions.get(order.status).includes(body.status)) {
    return fail(response, 409, 'Invalid order status transition');
  }

  const updated = await Order.updateStatus(order._id, order.status, body.status);
  if (!updated) return fail(response, 409, 'Order status changed. Reload the order and try again.');
  return response.status(200).json({ success: true, order: Order.publicOrder(updated) });
}

module.exports = { place, myOrders, allOrders, changeStatus };
