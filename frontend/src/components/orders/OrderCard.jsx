import { statusLabel } from '../../services/orderService';
import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  RotateCcw, 
  MapPin, 
  Clock
} from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';
import Modal from '../common/Modal';
import OrderTracker from './OrderTracker';
import { formatPrice, getDishImage } from '../../utils/format';

const FALLBACK_FOOD_IMG = 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80';

const STATUS_BADGE_MAP = {
  pending: { variant: 'amber', label: 'Order Received' },
  preparing: { variant: 'purple', label: 'Kitchen Preparing' },
  delivered: { variant: 'green', label: 'Delivered' },
  cancelled: { variant: 'rose', label: 'Cancelled' },
};

const OrderCard = ({ order }) => {
  const { addMultipleToCart } = useCart();
  const navigate = useNavigate();
  const [trackerModalOpen, setTrackerModalOpen] = useState(false);

  const statusConfig = STATUS_BADGE_MAP[order.status] || {
    variant: 'default',
    label: statusLabel(order.status),
  };

  const handleReorder = () => {
    addMultipleToCart(order.items);
    navigate('/cart');
  };

  return (
    <>
      <div className="bg-[#131A2B] rounded-3xl p-5 sm:p-6 border border-theme-lavender/15 shadow-sm hover:border-theme-lavender/30 transition-all space-y-4 text-white">
        {/* Order Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-theme-lavender/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-theme-violet text-white flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-base tracking-tight">
                  #{order.id}
                </span>
                <Badge variant={statusConfig.variant} dot>
                  {statusConfig.label}
                </Badge>
              </div>
              <p className="text-xs text-theme-lavender mt-0.5 font-medium">
                {new Date(order.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                at{' '}
                {new Date(order.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-theme-lavender uppercase tracking-widest block font-bold">Total Paid</span>
            <span className="text-lg sm:text-xl font-black text-white">
              {formatPrice(order.total)}
            </span>
          </div>
        </div>

        {/* Items List Preview */}
        <div className="space-y-2">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs py-1">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={getDishImage(item)}
                  alt={item.name}
                  className="w-10 h-10 rounded-xl object-cover border border-theme-lavender/15 shrink-0"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_FOOD_IMG;
                  }}
                />
                <div className="min-w-0">
                  <p className="font-bold text-white truncate">
                    <span className="text-theme-lavender font-black mr-1.5">
                      {item.quantity}x
                    </span>
                    {item.name}
                  </p>
                  {item.customization?.notes && (
                    <p className="text-[10px] text-theme-white-muted italic truncate">
                      "{item.customization.notes}"
                    </p>
                  )}
                </div>
              </div>
              <span className="font-bold text-white ml-2">
                {formatPrice(item.subtotal)}
              </span>
            </div>
          ))}
        </div>

        {/* Address and details */}
        <div className="text-xs text-theme-white-muted pt-3 border-t border-theme-lavender/10 flex items-center gap-2 font-medium">
          <MapPin className="w-4 h-4 text-theme-lavender shrink-0" />
          <span className="truncate">{order.deliveryAddress}</span>
        </div>

        {/* Action Buttons */}
        <div className="pt-1 flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTrackerModalOpen(true)}
            className="text-xs font-bold gap-1.5 border-theme-lavender/30 hover:border-theme-lavender shadow-none"
          >
            <Clock className="w-3.5 h-3.5 text-theme-lavender" />
            Track Live Status
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleReorder}
            className="text-xs font-bold gap-1.5 shadow-none"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reorder Dish
          </Button>
        </div>
      </div>

      {/* Tracker Modal */}
      <Modal
        isOpen={trackerModalOpen}
        onClose={() => setTrackerModalOpen(false)}
        maxWidth="max-w-3xl"
      >
        <OrderTracker
          order={order}
        />
      </Modal>
    </>
  );
};

export default OrderCard;
