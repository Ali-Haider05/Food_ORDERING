import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { Plus, Minus } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { formatPrice } from '../../utils/format';

const FALLBACK_FOOD_IMG = 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80';

const FoodQuickViewModal = ({ dish, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  if (!dish) return null;

  const totalPrice = dish.price * quantity;
  const handleAdd = () => {
    if (!dish.isAvailable) return;
    addToCart(dish, quantity);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-theme-white">
        {/* Left: Dish Image */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-theme-purple-dark border border-theme-lavender/20">
            <img
              src={dish.image}
              alt={dish.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = FALLBACK_FOOD_IMG;
              }}
            />
            {dish.tag && (
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#0B0F19]/90 text-theme-lavender border border-theme-lavender/40 shadow-md">
                {dish.tag}
              </span>
            )}
          </div>

        </div>

        {/* Right: Dish Details & Customizer */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-black uppercase tracking-widest text-theme-lavender bg-theme-midnight-surface border border-theme-lavender/30 px-2.5 py-0.5 rounded-md">
                {dish.category}
              </span>

            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white mb-2 leading-tight tracking-tight">
              {dish.name}
            </h2>

            <p className="text-xs text-theme-white-muted mb-4 leading-relaxed font-normal">
              {dish.description}
            </p>

          </div>

          {/* Quantity Stepper & Add Button */}
          <div className="pt-3.5 border-t border-theme-lavender/15 flex items-center gap-3">
            <div className="flex items-center border border-theme-lavender/25 rounded-xl bg-theme-purple-dark overflow-hidden">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-2.5 text-theme-lavender hover:text-white hover:bg-theme-purple transition"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-3 text-sm font-black text-white min-w-[28px] text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                className="p-2.5 text-theme-lavender hover:text-white hover:bg-theme-purple transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <Button
              variant="primary"
              size="md"
              className="flex-1 justify-between shadow-none"
              onClick={handleAdd}
              disabled={!dish.isAvailable}
            >
              <span>{dish.isAvailable ? 'Add to Order' : 'Sold out'}</span>
              <span className="font-black text-white">
                {formatPrice(totalPrice)}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default FoodQuickViewModal;
