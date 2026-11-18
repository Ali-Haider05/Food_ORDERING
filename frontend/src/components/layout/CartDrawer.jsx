import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';
import Button from '../common/Button';
import { formatPrice } from '../../utils/format';

const FALLBACK_FOOD_IMG = 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80';

const CartDrawer = () => {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    items, 
    updateQuantity, 
    removeFromCart, 
    subtotal, 
    total,
  } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0B0F19]/80 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0B0F19] shadow-2xl flex flex-col border-l border-theme-lavender/15 text-white">
          
          {/* Header */}
          <div className="p-5 border-b border-theme-lavender/10 flex items-center justify-between bg-[#131A2B]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-theme-violet text-white flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-white text-base sm:text-lg tracking-tight">Your Food Tray</h3>
                <p className="text-xs text-theme-lavender font-medium">{items.length} items in cart</p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-theme-lavender hover:text-white hover:bg-theme-midnight-surface transition"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#131A2B] border border-theme-lavender/20 flex items-center justify-center text-theme-lavender mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-black text-white text-lg mb-1 tracking-tight">Tray is empty</h4>
                <p className="text-xs text-theme-white-muted max-w-xs mb-6 font-medium">
                  Choose your favorite meals around BIIT campus & Rawalpindi.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsCartOpen(false)}
                >
                  Explore Menu
                </Button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={`${item.id}-${JSON.stringify(item.customization)}`}
                  className="flex gap-3.5 p-3 rounded-2xl bg-[#131A2B] border border-theme-lavender/15 hover:border-theme-lavender/30 transition shadow-sm"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-theme-lavender/15"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_FOOD_IMG;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="text-xs font-black text-white truncate leading-snug">
                        {item.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.id, item.customization)}
                        className="text-theme-lavender hover:text-rose-400 p-1 transition"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs font-black text-theme-lavender mt-0.5">
                      {formatPrice(item.price * item.quantity)}
                    </p>

                    {item.customization?.notes && (
                      <p className="text-[10px] text-theme-white-muted italic truncate mt-0.5">
                        "{item.customization.notes}"
                      </p>
                    )}

                    {/* Stepper */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-theme-lavender/20 rounded-xl bg-theme-purple-dark overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, -1, item.customization)}
                          className="px-2.5 py-1 text-theme-lavender hover:text-white hover:bg-theme-midnight-surface transition"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-black text-white min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1, item.customization)}
                          className="px-2.5 py-1 text-theme-lavender hover:text-white hover:bg-theme-midnight-surface transition"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {items.length > 0 && (
            <div className="p-5 border-t border-theme-lavender/10 bg-[#131A2B] space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-theme-white-muted font-medium">
                  <span>Subtotal</span>
                  <span className="font-bold text-white">{formatPrice(subtotal)}</span>
                </div>
                <div className="border-t border-theme-lavender/15 pt-2 flex justify-between text-sm font-black text-white">
                  <span>Total Amount</span>
                  <span className="text-lg font-black text-white">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full justify-between shadow-none"
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/cart');
                  }}
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
                
                <p className="text-center text-[11px] text-theme-lavender font-medium">
                  ⚡ Express delivery in 15-25 min across Shamsabad & Murree Road
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
