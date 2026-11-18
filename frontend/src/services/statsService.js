import api from './api.js';
import { orderService } from './orderService.js';
import { categoryService, menuService } from './menuService.js';

export const statsService = {
  async getDashboardStats() {
    const [{ data }, orders, items, categories] = await Promise.all([
      api.get('/admin/stats'), orderService.getAllOrders(), menuService.getAll(), categoryService.list(),
    ]);
    const delivered = orders.filter(({ status }) => status === 'delivered');
    const revenueByDay = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setUTCDate(date.getUTCDate() - 6 + index);
      const key = date.toISOString().slice(0, 10);
      const matching = delivered.filter(({ updatedAt }) => updatedAt?.slice(0, 10) === key);
      return {
        day: date.toLocaleDateString('en', { weekday: 'short', timeZone: 'UTC' }),
        revenue: matching.reduce((sum, order) => sum + order.total, 0),
        orders: matching.length,
      };
    });
    return {
      ...data.stats,
      totalRevenue: data.stats.deliveredRevenue,
      preparingOrders: orders.filter(({ status }) => status === 'preparing').length,
      deliveredOrders: delivered.length,
      cancelledOrders: orders.filter(({ status }) => status === 'cancelled').length,
      avgOrderValue: delivered.length ? data.stats.deliveredRevenue / delivered.length : 0,
      activeMenuItemsCount: items.filter(({ isAvailable }) => isAvailable).length,
      revenueByDay,
      categoryDistribution: categories.map(({ id, name }) => {
        const count = items.filter(({ category }) => category === id).length;
        return { category: name, count, percentage: items.length ? Math.round(count / items.length * 100) : 0 };
      }),
      recentOrders: orders.slice(0, 5),
    };
  },
};
