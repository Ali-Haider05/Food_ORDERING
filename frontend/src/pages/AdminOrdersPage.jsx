import React, { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';
import { useToast } from '../context/ToastContext';
import { 
  Search, 
  MapPin, 
  Eye, 
  ArrowLeft, 
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { TableRowSkeleton } from '../components/common/Skeleton';
import { formatPrice } from '../utils/format';

const FALLBACK_FOOD_IMG = 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80';

const ORDER_STATUSES = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { addToast } = useToast();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getAllOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
      addToast({
        title: 'Status Updated',
        message: `Order #${orderId} changed to "${newStatus}".`,
        type: 'success',
      });
    } catch (err) {
      addToast({
        title: 'Update Failed',
        message: err.message || 'Could not update order status',
        type: 'error',
      });
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Pending': return 'amber';
      case 'Preparing': return 'purple';
      case 'Out for Delivery': return 'blue';
      case 'Delivered': return 'green';
      case 'Cancelled': return 'rose';
      default: return 'default';
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    const matchesSearch =
      !search.trim() ||
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.userName?.toLowerCase().includes(search.toLowerCase()) ||
      order.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
      order.deliveryAddress?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-theme-white bg-theme-canvas">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-theme-lavender/10 pb-6">
        <div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-black text-theme-lavender hover:text-white mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl sm:text-5xl font-black text-theme-white tracking-tight">
            Customer Orders Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-theme-lavender mt-1.5 font-medium">
            Dispatch management, delivery timeline telemetry, and customer receipts.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadOrders}
          className="text-xs font-bold gap-1.5 border-theme-lavender/30 self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Pipeline
        </Button>
      </div>

      {/* Filter Tabs and Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-theme-purple p-4 rounded-2xl border border-theme-lavender/20 shadow-purple-card">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-theme-lavender absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order #, customer, address..."
            className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-xl bg-theme-purple-dark border border-theme-lavender/20 text-theme-white placeholder:text-theme-lavender/50 focus:outline-none focus:ring-2 focus:ring-theme-violet"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {['All', ...ORDER_STATUSES].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition ${
                statusFilter === st
                  ? 'bg-theme-violet text-white shadow-violet-glow'
                  : 'bg-theme-purple-dark text-theme-lavender hover:text-white border border-theme-lavender/15'
              }`}
            >
              {st} ({
                st === 'All'
                  ? orders.length
                  : orders.filter((o) => o.status === st).length
              })
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-theme-purple rounded-3xl border border-theme-lavender/20 shadow-purple-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-theme-purple-dark border-b border-theme-lavender/15 text-theme-lavender uppercase tracking-widest text-[11px] font-black">
                <th className="py-4 px-4">Order ID & Date</th>
                <th className="py-4 px-4">Customer Details</th>
                <th className="py-4 px-4">Order Items</th>
                <th className="py-4 px-4">Delivery Address</th>
                <th className="py-4 px-4">Total & Payment</th>
                <th className="py-4 px-4">Current Status</th>
                <th className="py-4 px-4 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-lavender/10">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRowSkeleton key={i} columns={7} />
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-theme-lavender font-medium">
                    No orders found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-theme-purple-light/50 transition">
                    <td className="py-4 px-4">
                      <p className="font-black text-theme-white text-sm">#{order.id}</p>
                      <p className="text-[11px] text-theme-lavender font-medium mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </td>

                    <td className="py-4 px-4">
                      <p className="font-black text-theme-white">{order.userName}</p>
                      <p className="text-[11px] text-theme-lavender font-medium">{order.userEmail}</p>
                      {order.userPhone && (
                        <p className="text-[11px] text-theme-lavender font-medium">{order.userPhone}</p>
                      )}
                    </td>

                    <td className="py-4 px-4 text-theme-white-muted font-medium max-w-xs">
                      <p className="line-clamp-2">
                        {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </p>
                    </td>

                    <td className="py-4 px-4 text-theme-white font-medium max-w-xs">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-4 h-4 text-theme-violet-light shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{order.deliveryAddress}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <p className="font-bold text-white text-sm">
                        {formatPrice(order.total)}
                      </p>
                      <p className="text-[11px] text-theme-lavender font-medium">{order.paymentMethod || 'Cash on Delivery'}</p>
                    </td>

                    <td className="py-4 px-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`text-xs font-black rounded-xl px-3 py-1.5 border cursor-pointer focus:outline-none focus:ring-2 focus:ring-theme-violet ${
                          order.status === 'Pending'
                            ? 'bg-amber-950/70 text-amber-300 border-amber-500/40'
                            : order.status === 'Preparing'
                            ? 'bg-theme-purple-dark text-theme-lavender border-theme-lavender/40'
                            : order.status === 'Out for Delivery'
                            ? 'bg-sky-950/70 text-sky-300 border-sky-500/40'
                            : order.status === 'Delivered'
                            ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
                            : 'bg-rose-950/70 text-rose-300 border-rose-500/40'
                        }`}
                      >
                        {ORDER_STATUSES.map((st) => (
                          <option key={st} value={st} className="bg-theme-purple text-white">
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-theme-lavender hover:text-white hover:bg-theme-purple-light rounded-xl transition"
                        title="View Full Order Receipt"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Modal
          isOpen={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          title={`Order #${selectedOrder.id}`}
          subtitle={`Placed on ${new Date(selectedOrder.createdAt).toLocaleString()}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-6 text-xs text-theme-white">
            {/* Customer & Status Bar */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-theme-purple-dark border border-theme-lavender/20">
              <div>
                <p className="font-black text-theme-white text-base">{selectedOrder.userName}</p>
                <p className="text-theme-lavender font-medium mt-0.5">{selectedOrder.userEmail} • {selectedOrder.userPhone}</p>
              </div>
              <Badge variant={getStatusBadgeVariant(selectedOrder.status)} dot size="lg">
                {selectedOrder.status}
              </Badge>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <span className="font-black text-theme-lavender uppercase tracking-wider text-[11px]">
                Delivery Destination:
              </span>
              <p className="p-3.5 bg-theme-purple-dark rounded-2xl border border-theme-lavender/20 text-theme-white font-medium">
                {selectedOrder.deliveryAddress}
              </p>
            </div>

            {/* Order Items */}
            <div className="space-y-2">
              <span className="font-black text-theme-lavender uppercase tracking-wider text-[11px]">
                Ordered Culinary Items:
              </span>
              <div className="divide-y divide-theme-lavender/10 border border-theme-lavender/20 rounded-2xl p-2 bg-theme-purple-dark">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="py-2.5 px-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 rounded-xl object-cover border border-theme-lavender/25"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = FALLBACK_FOOD_IMG;
                        }}
                      />
                      <div>
                        <p className="font-bold text-white">
                          <span className="text-theme-lavender mr-1.5">{item.quantity}x</span>
                          {item.name}
                        </p>
                        {item.customization?.notes && (
                          <p className="text-[11px] text-theme-white-muted italic">
                            "{item.customization.notes}"
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-white">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financials breakdown */}
            <div className="space-y-2 p-4 rounded-2xl bg-[#0B0F19] border border-theme-lavender/20 text-theme-white-muted">
              <div className="flex justify-between font-medium">
                <span>Subtotal</span>
                <span className="font-bold text-white">{formatPrice(selectedOrder.subtotal)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Discount</span>
                  <span>-{formatPrice(selectedOrder.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-medium">
                <span>Delivery across Rawalpindi</span>
                <span className="font-bold text-white">{formatPrice(selectedOrder.deliveryFee)}</span>
              </div>
              <div className="border-t border-theme-lavender/15 pt-2 flex justify-between text-sm font-black text-white">
                <span>Total Amount</span>
                <span className="text-white text-base font-black">
                  {formatPrice(selectedOrder.total)}
                </span>
              </div>
            </div>

            {/* Change Status Inside Modal */}
            <div className="pt-2 flex items-center justify-between border-t border-theme-lavender/10">
              <span className="font-black text-theme-white">Quick Status Transition:</span>
              <div className="flex gap-2">
                {['Preparing', 'Out for Delivery', 'Delivered'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(selectedOrder.id, st)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-theme-purple hover:bg-theme-violet hover:text-white border border-theme-lavender/20 transition"
                  >
                    Set {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default AdminOrdersPage;
