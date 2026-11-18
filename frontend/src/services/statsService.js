import { orderService } from './orderService';
import { menuService } from './menuService';

export const statsService = {
  getDashboardStats: async () => {
    const orders = await orderService.getAllOrders();
    const menuItems = await menuService.getAll();

    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    
    const pendingOrders = orders.filter(o => o.status === 'Pending').length;
    const preparingOrders = orders.filter(o => o.status === 'Preparing').length;
    const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
    const cancelledOrders = orders.filter(o => o.status === 'Cancelled').length;

    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Weekly sales mock curve based on real counts
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const revenueByDay = [
      { day: 'Mon', revenue: Math.round(totalRevenue * 0.11), orders: Math.max(1, Math.round(totalOrders * 0.1)) },
      { day: 'Tue', revenue: Math.round(totalRevenue * 0.13), orders: Math.max(1, Math.round(totalOrders * 0.12)) },
      { day: 'Wed', revenue: Math.round(totalRevenue * 0.15), orders: Math.max(2, Math.round(totalOrders * 0.14)) },
      { day: 'Thu', revenue: Math.round(totalRevenue * 0.14), orders: Math.max(2, Math.round(totalOrders * 0.13)) },
      { day: 'Fri', revenue: Math.round(totalRevenue * 0.22), orders: Math.max(3, Math.round(totalOrders * 0.22)) },
      { day: 'Sat', revenue: Math.round(totalRevenue * 0.28), orders: Math.max(4, Math.round(totalOrders * 0.25)) },
      { day: 'Sun', revenue: Math.round(totalRevenue * 0.24), orders: Math.max(3, Math.round(totalOrders * 0.21)) },
    ];

    // Category distribution
    const categoryCounts = menuItems.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {});

    const categoryDistribution = Object.entries(categoryCounts).map(([cat, count]) => ({
      category: cat,
      count,
      percentage: Math.round((count / Math.max(1, menuItems.length)) * 100),
    }));

    return {
      totalOrders,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      pendingOrders,
      preparingOrders,
      deliveredOrders,
      cancelledOrders,
      avgOrderValue: Number(avgOrderValue.toFixed(2)),
      activeMenuItemsCount: menuItems.filter(i => i.isAvailable !== false).length,
      revenueByDay,
      categoryDistribution,
      recentOrders: orders.slice(0, 5),
    };
  }
};
