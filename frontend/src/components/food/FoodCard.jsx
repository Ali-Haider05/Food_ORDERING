import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { Clock, Flame, Plus, Check, Eye } from 'lucide-react';
import { formatPrice } from '../../utils/format';

const FALLBACK_FOOD_IMG = 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80';

const FoodCard = ({ dish, onQuickView }) => {
  const { items, addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  // Check if item is already in cart
  const cartItem = items.find((i) => i.id === dish.id);
  const inCartCount = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(dish, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <div
      onClick={() => onQuickView && onQuickView(dish)}
      className="group relative royal-card rounded-3xl p-4 transition-all duration-200 flex flex-col h-full cursor-pointer hover:-translate-y-1 hover:border-theme-lavender/40 text-theme-white"
    >
      {/* Image Container with Floating Badges */}
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-theme-purple-dark mb-4 border border-theme-lavender/10">
        <img
          src={dish.image}
          alt={dish.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FALLBACK_FOOD_IMG;
          }}
        />

        {/* Tag (Bestseller, Campus Special, etc.) */}
        {dish.tag && (
          <div className="absolute top-2.5 left-2.5">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#0B0F19]/90 text-theme-lavender border border-theme-lavender/30 backdrop-blur-md">
              {dish.tag}
            </span>
          </div>
        )}

        {/* Veg / Non-Veg Indicator */}
        <div className="absolute top-2.5 right-2.5">
          <div
            className={`w-6 h-6 rounded-lg bg-[#0B0F19]/90 backdrop-blur-md border flex items-center justify-center ${
              dish.isVeg ? 'border-emerald-400' : 'border-rose-500'
            }`}
            title={dish.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                dish.isVeg ? 'bg-emerald-400' : 'bg-rose-500'
              }`}
            />
          </div>
        </div>

        {/* Quick View Button Hover Overlay */}
        <div className="absolute inset-0 bg-[#0B0F19]/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="px-3.5 py-1.5 rounded-full bg-white text-[#0B0F19] text-xs font-black shadow-lg flex items-center gap-1.5 transform scale-95 group-hover:scale-100 transition-transform">
            <Eye className="w-3.5 h-3.5 text-theme-violet" />
            Quick Inspect
          </span>
        </div>
      </div>

      {/* Dish Meta info */}
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="font-bold text-theme-lavender bg-theme-midnight-surface border border-theme-lavender/20 px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider">
          {dish.category}
        </span>
      </div>

      {/* Dish Title & Description - Crystal Clear High Contrast */}
      <h3 className="font-extrabold text-white text-base sm:text-lg mb-1 leading-snug group-hover:text-theme-lavender transition-colors tracking-tight">
        {dish.name}
      </h3>
      <p className="text-xs text-theme-white-muted font-normal line-clamp-2 mb-3.5 leading-relaxed">
        {dish.description}
      </p>

      {/* Cooking Info Chips */}
      <div className="flex items-center gap-3 text-xs text-theme-lavender font-semibold mb-4">
        {dish.prepTime && (
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-theme-lavender" />
            {dish.prepTime}
          </span>
        )}
        {dish.calories && (
          <span className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            {dish.calories}
          </span>
        )}
      </div>

      {/* Price & Action Button Footer */}
      <div className="mt-auto pt-3 border-t border-theme-lavender/15 flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] text-theme-lavender uppercase tracking-widest block font-bold">Price</span>
          <span className="text-lg sm:text-xl font-black text-white">
            {formatPrice(dish.price)}
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={dish.isAvailable === false}
          className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs transition-all duration-150 active:scale-95 ${
            dish.isAvailable === false
              ? 'bg-theme-purple-dark text-theme-lavender/40 cursor-not-allowed border border-theme-lavender/10'
              : justAdded
              ? 'bg-emerald-600 text-white shadow-md'
              : inCartCount > 0
              ? 'bg-theme-purple-dark text-theme-lavender border border-theme-lavender/40 hover:bg-theme-purple-light'
              : 'bg-theme-violet hover:bg-theme-violet-hover text-white shadow-sm'
          }`}
          aria-label={`Add ${dish.name} to cart`}
        >
          {dish.isAvailable === false ? (
            <span>Sold Out</span>
          ) : justAdded ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Added!</span>
            </>
          ) : inCartCount > 0 ? (
            <>
              <span className="w-4 h-4 rounded-full bg-theme-violet text-white font-black text-[10px] flex items-center justify-center">
                {inCartCount}
              </span>
              <span>In Cart</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FoodCard;
