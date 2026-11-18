import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import OrderCard from '../components/orders/OrderCard';
import OrderTracker from '../components/orders/OrderTracker';
import EmptyState from '../components/common/EmptyState';
import { Package, Clock, RefreshCw, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';

const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const navigate = useNavigate();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getMyOrders(user?.id);
      setOrders(data);
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user]);

  const handleAdvanceSimulation = (orderId) => {
    const updated = orderService.advanceSimulationStep(orderId);
    if (updated) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, ...updated } : o))
      );
    }
  };

  const activeOrders = orders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled');
  const latestActiveOrder = activeOrders[0];

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'All') return true;
    if (statusFilter === 'Active') return o.status !== 'Delivered' && o.status !== 'Cancelled';
    if (statusFilter === 'Delivered') return o.status === 'Delivered';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-white bg-theme-canvas">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Order Status & History
          </h1>
          <p className="text-xs sm:text-sm text-theme-lavender mt-1 font-normal">
            Real-time delivery progress across BIIT Campus and Rawalpindi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadOrders}
            className="text-xs font-bold gap-1.5 border-theme-lavender/30 shadow-none"
          >
            <RefreshCw className="w-3.5 h-3.5 text-theme-lavender" />
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/')}
            className="text-xs font-bold gap-1.5 shadow-none"
          >
            <span>Order New Dish</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Featured Active Tracker (if there's an ongoing active order) */}
      {latestActiveOrder && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-theme-lavender">
            <Clock className="w-4 h-4 text-amber-300" />
            <span>Active Order In Progress</span>
          </div>
          <OrderTracker
            order={latestActiveOrder}
            onAdvanceSimulation={handleAdvanceSimulation}
          />
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-theme-lavender/10 pb-4">
        {['All', 'Active', 'Delivered'].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === tab
                ? 'bg-theme-violet text-white border border-theme-lavender/30'
                : 'bg-[#131A2B] text-theme-white-muted hover:text-white hover:bg-[#1E2842] border border-theme-lavender/15'
            }`}
          >
            {tab} Orders ({
              tab === 'All'
                ? orders.length
                : tab === 'Active'
                ? activeOrders.length
                : orders.filter((o) => o.status === 'Delivered').length
            })
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          <div className="h-44 bg-[#131A2B] rounded-3xl animate-pulse border border-theme-lavender/15" />
          <div className="h-44 bg-[#131A2B] rounded-3xl animate-pulse border border-theme-lavender/15" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders found"
          description={
            statusFilter === 'Active'
              ? "You don't have any meals currently being prepared."
              : "You haven't placed any food orders yet. Pick from our campus specials!"
          }
          actionLabel="Explore Menu"
          onAction={() => navigate('/')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onAdvanceSimulation={handleAdvanceSimulation}
            />
          ))}
        </div>
      )}

    </div>
  );
};

export default OrdersPage;
