import api from './api.js';

const transitions = { pending: ['preparing', 'cancelled'], preparing: ['delivered', 'cancelled'] };
export const statusLabel = (status) => status ? status[0].toUpperCase() + status.slice(1) : '';
export const nextStatuses = (status) => transitions[status] || [];

function normalizeOrder(order) {
  return {
    ...order,
    deliveryAddress: order.address,
    subtotal: order.total,
    items: order.items.map((item) => ({ ...item, id: item.menuItemId, price: item.unitPrice })),
  };
}

export const orderService = {
  async getAllOrders() {
    return (await api.get('/orders')).data.orders.map(normalizeOrder);
  },
  async getMyOrders() {
    return (await api.get('/orders/my')).data.orders.map(normalizeOrder);
  },
  async createOrder({ address, items }) {
    const quantities = new Map();
    for (const item of items) {
      quantities.set(item.id, (quantities.get(item.id) || 0) + item.quantity);
    }
    const { data } = await api.post('/orders', {
      address,
      items: Array.from(quantities, ([menuItemId, quantity]) => ({ menuItemId, quantity })),
    });
    return normalizeOrder(data.order);
  },
  async updateStatus(id, status) {
    const { data } = await api.put('/orders/' + encodeURIComponent(id) + '/status', { status });
    return normalizeOrder(data.order);
  },
};
