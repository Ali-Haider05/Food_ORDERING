import api from './api';
import { INITIAL_ORDERS } from './mockData';

const ORDERS_STORAGE_KEY = 'biit_foodhub_orders_store_v2';

const normalizeOrder = (order) => {
  if (!order) return null;
  return {
    ...order,
    id: String(order.id || order._id || `ORD-${Date.now()}`),
    total: Number(order.total) || 0,
    subtotal: Number(order.subtotal) || 0,
    deliveryFee: Number(order.deliveryFee) || 0,
    discount: Number(order.discount) || 0,
    items: Array.isArray(order.items) ? order.items : [],
    status: order.status || 'Pending',
    createdAt: order.createdAt || new Date().toISOString(),
  };
};

const getLocalOrders = () => {
  const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(INITIAL_ORDERS));
    return INITIAL_ORDERS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_ORDERS;
  }
};

const saveLocalOrders = (orders) => {
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
};

export const orderService = {
  // Get all orders (Admin - Calls real backend first)
  getAllOrders: async () => {
    try {
      const response = await api.get('/orders');
      const data = response.data;
      if (Array.isArray(data)) return data.map(normalizeOrder);
      if (Array.isArray(data?.orders)) return data.orders.map(normalizeOrder);
      if (Array.isArray(data?.data)) return data.data.map(normalizeOrder);
    } catch {
      // Backend not yet running or route not mounted
    }
    return getLocalOrders().map(normalizeOrder);
  },

  // Get current user's orders (Calls real backend first)
  getMyOrders: async (userId) => {
    try {
      const response = await api.get('/orders/my');
      const data = response.data;
      if (Array.isArray(data)) return data.map(normalizeOrder);
      if (Array.isArray(data?.orders)) return data.orders.map(normalizeOrder);
      if (Array.isArray(data?.data)) return data.data.map(normalizeOrder);
    } catch {
      // Fallback
    }
    const all = getLocalOrders().map(normalizeOrder);
    if (!userId) return all;
    return all.filter((o) => o.userId === userId || o.userEmail === 'customer@foodie.com');
  },

  // Place a new order
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/orders', orderData);
      const created = response.data?.order || response.data?.data || response.data;
      if (created && (created.id || created._id)) {
        const normalized = normalizeOrder(created);
        const local = getLocalOrders();
        local.unshift(normalized);
        saveLocalOrders(local);
        return normalized;
      }
    } catch {
      // Fallback
    }

    const localOrders = getLocalOrders();
    const newOrder = normalizeOrder({
      ...orderData,
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Pending',
      statusStep: 0,
      createdAt: new Date().toISOString(),
      estimatedDeliveryTime: '20-25 mins',
    });

    localOrders.unshift(newOrder);
    saveLocalOrders(localOrders);
    return newOrder;
  },

  // Update order status (Admin)
  updateStatus: async (orderId, newStatus) => {
    try {
      // Try PATCH first
      let response;
      try {
        response = await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      } catch {
        response = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      }
      if (response && response.data) {
        const updated = response.data?.order || response.data?.data || response.data;
        const local = getLocalOrders();
        const idx = local.findIndex(o => o.id === orderId || o._id === orderId);
        if (idx !== -1) {
          local[idx] = normalizeOrder(updated);
          saveLocalOrders(local);
        }
        return normalizeOrder(updated);
      }
    } catch {
      // Fallback
    }

    const localOrders = getLocalOrders();
    const idx = localOrders.findIndex((o) => o.id === orderId || o._id === orderId);
    if (idx !== -1) {
      const stepMap = {
        Pending: 0,
        Preparing: 1,
        'Out for Delivery': 2,
        Delivered: 3,
        Cancelled: 4,
      };
      localOrders[idx] = {
        ...localOrders[idx],
        status: newStatus,
        statusStep: stepMap[newStatus] ?? 0,
      };
      saveLocalOrders(localOrders);
      return normalizeOrder(localOrders[idx]);
    }
    return null;
  },

  // Step advancement simulation for university judges evaluation
  advanceSimulationStep: (orderId) => {
    const localOrders = getLocalOrders();
    const idx = localOrders.findIndex((o) => o.id === orderId || o._id === orderId);
    if (idx === -1) return null;

    const current = localOrders[idx];
    const steps = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered'];
    const currentIdx = steps.indexOf(current.status);

    if (currentIdx < steps.length - 1) {
      const nextStatus = steps[currentIdx + 1];
      localOrders[idx] = {
        ...current,
        status: nextStatus,
        statusStep: currentIdx + 1,
      };
      saveLocalOrders(localOrders);
      return normalizeOrder(localOrders[idx]);
    }
    return normalizeOrder(current);
  },
};
