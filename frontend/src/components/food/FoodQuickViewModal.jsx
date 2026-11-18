import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { Star, Clock, Flame, Plus, Minus, Check, Sparkles } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { formatPrice } from '../../utils/format';

const FALLBACK_FOOD_IMG = 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80';

const FoodQuickViewModal = ({ dish, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [selectedAddons, setSelectedAddons] = useState([]);

  if (!dish) return null;

  const sampleAddons = [
    { id: 'add-cheese', name: 'Extra Melted Cheddar Cheese', price: 120 },
    { id: 'add-sauce', name: 'Signature Garlic Herb Mayo Dip', price: 70 },
    { id: 'add-crispy', name: 'Extra Crispy Fillet Strip', price: 180 },
  ];

  const toggleAddon = (addon) => {
    if (selectedAddons.some((a) => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter((a) => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const finalUnitPrice = Number(dish.price) + addonsTotal;
  const totalPrice = finalUnitPrice * quantity;

  const handleAdd = () => {
    addToCart(
      {
        ...dish,
        price: finalUnitPrice,
      },
      quantity,
      {
        addons: selectedAddons,
        notes: notes.trim() || undefined,
      }
    );
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

          <div className="flex items-center justify-between p-3 rounded-2xl bg-theme-purple-dark border border-theme-lavender/15 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-300">
              <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
              <span>{dish.rating || 4.8}</span>
              <span className="text-theme-white-muted font-medium">({dish.reviewsCount} reviews)</span>
            </div>
            {dish.prepTime && (
              <div className="flex items-center gap-1 text-white font-semibold">
                <Clock className="w-3.5 h-3.5 text-theme-lavender" />
                <span>{dish.prepTime}</span>
              </div>
            )}
            {dish.calories && (
              <div className="flex items-center gap-1 text-white font-semibold">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>{dish.calories}</span>
              </div>
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
              <span className="text-xs text-theme-white-muted font-bold">
                {dish.isVeg ? '🌱 Vegetarian' : '🥩 Fresh Halal Protein'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white mb-2 leading-tight tracking-tight">
              {dish.name}
            </h2>

            <p className="text-xs text-theme-white-muted mb-4 leading-relaxed font-normal">
              {dish.description}
            </p>

            {/* Addons Selection */}
            <div className="space-y-2 mb-4">
              <label className="text-xs font-black uppercase tracking-wider text-theme-lavender flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Optional Add-ons
              </label>
              <div className="space-y-2">
                {sampleAddons.map((addon) => {
                  const isChecked = selectedAddons.some((a) => a.id === addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddon(addon)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition ${
                        isChecked
                          ? 'border-theme-lavender bg-theme-violet/20 text-white'
                          : 'border-theme-lavender/15 hover:border-theme-lavender/30 bg-theme-purple-dark text-theme-white-muted'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                            isChecked
                              ? 'bg-theme-violet border-theme-lavender text-white'
                              : 'border-theme-lavender/30 bg-transparent'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span>{addon.name}</span>
                      </div>
                      <span className="font-extrabold text-theme-lavender">+{formatPrice(addon.price)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Special Instructions Note */}
            <div className="mb-4">
              <label className="block text-xs font-black uppercase tracking-wider text-theme-lavender mb-1.5">
                Kitchen Instructions (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Extra spicy, sauce on the side, ring gate bell"
                className="w-full text-xs p-2.5 rounded-xl bg-theme-purple-dark border border-theme-lavender/20 text-white placeholder:text-theme-white-muted/60 focus:outline-none focus:ring-1 focus:ring-theme-lavender"
              />
            </div>
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
                onClick={() => setQuantity((q) => q + 1)}
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
            >
              <span>Add to Order</span>
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
