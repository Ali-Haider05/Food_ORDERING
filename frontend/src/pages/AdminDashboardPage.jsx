import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { statusLabel } from '../services/orderService';
import { statsService } from '../services/statsService';
import StatCard from '../components/dashboard/StatCard';
import RevenueChart from '../components/dashboard/RevenueChart';
import StatusDonutChart from '../components/dashboard/StatusDonutChart';
import { StatCardSkeleton } from '../components/common/Skeleton';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import BackendStatusPill from '../components/common/BackendStatusPill';
import { 
  ShoppingBag, 
  Clock, 
  Utensils, 
  ArrowRight,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { formatPrice } from '../utils/format';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await statsService.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'pending': return 'amber';
      case 'preparing': return 'purple';
      case 'delivered': return 'green';
      default: return 'default';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-white bg-theme-canvas">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-theme-lavender/10 pb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-theme-lavender bg-[#131A2B] border border-theme-lavender/25 px-2.5 py-0.5 rounded-full">
              Kitchen HQ • BIIT Rawalpindi
            </span>
            <BackendStatusPill />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Kitchen Operations & Live Analytics
          </h1>
          <p className="text-xs sm:text-sm text-theme-lavender mt-1 font-normal">
            Real-time telemetry, transaction metrics, and food preparation pipeline.
          </p>
        </div>

        {/* Quick Management Shortcuts */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="text-xs font-bold gap-1.5 border-theme-lavender/30 shadow-none"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/admin/menu')}
            className="text-xs font-bold gap-1.5 shadow-none"
          >
            <Utensils className="w-3.5 h-3.5" />
            Menu Manager
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/admin/orders')}
            className="text-xs font-bold gap-1.5 shadow-none"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Manage Orders
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      {loadError && <p role="alert" className="text-sm text-rose-300">{loadError}</p>}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : stats && !loadError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Delivered Revenue (PKR)"
            value={stats?.totalRevenue ? `Rs. ${stats.totalRevenue.toLocaleString('en-PK', { maximumFractionDigits: 2 })}` : 'Rs. 0'}
            icon={TrendingUp}
            colorScheme="purple"
          />

          <StatCard
            title="Total Campus Orders"
            value={stats?.totalOrders || 0}
            icon={ShoppingBag}
            colorScheme="purple"
          />

          <StatCard
            title="Pending Orders"
            value={stats.pendingOrders}
            trendLabel="active kitchen jobs"
            icon={Clock}
            colorScheme="purple"
          />

          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Utensils}
            colorScheme="purple"
          />
        </div>
      )}

      {/* Visual Analytics Charts */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <RevenueChart data={stats.revenueByDay} />
          </div>
          <div className="lg:col-span-4">
            <StatusDonutChart data={stats.categoryDistribution} title={`Menu Categories (${stats.totalMenuItems} items)`} />
          </div>
        </div>
      )}

      {/* Recent Orders Section */}
      <div className="bg-[#131A2B] rounded-3xl p-5 sm:p-6 border border-theme-lavender/15 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-theme-lavender/10 pb-4">
          <div>
            <h3 className="font-black text-white text-lg tracking-tight">Recent Campus Orders</h3>
            <p className="text-xs text-theme-lavender mt-0.5 font-normal">
              Latest orders and recorded statuses
            </p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-theme-lavender hover:text-white flex items-center gap-1 group"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-theme-lavender/15 text-theme-lavender uppercase tracking-widest text-[10px] font-bold">
                <th className="py-2.5 px-3">Order ID</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Dishes</th>
                <th className="py-2.5 px-3">Total</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-lavender/10">
              {stats?.recentOrders?.map((order) => (
                <tr key={order.id} className="hover:bg-[#1E2842]/50 transition">
                  <td className="py-3 px-3 font-bold text-white">
                    #{order.id}
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-bold text-white">{order.userId}</p>
                  </td>
                  <td className="py-3 px-3 text-theme-white-muted font-normal max-w-xs truncate">
                    {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                  </td>
                  <td className="py-3 px-3 font-black text-white text-xs">
                    {formatPrice(order.total)}
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant={getStatusBadgeVariant(order.status)} dot>
                      {statusLabel(order.status)}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => navigate('/admin/orders')}
                      className="px-2.5 py-1 text-xs font-bold text-theme-lavender bg-[#0B0F19] hover:bg-theme-violet hover:text-white border border-theme-lavender/25 rounded-xl transition"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboardPage;
