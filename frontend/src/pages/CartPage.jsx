import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { orderService } from '../services/orderService';
import confetti from 'canvas-confetti';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  Tag, 
  MapPin, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Clock 
} from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import EmptyState from '../components/common/EmptyState';
import { formatPrice } from '../utils/format';

const FALLBACK_FOOD_IMG = 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80';

const CartPage = () => {
  const { 
    items, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    subtotal, 
    deliveryFee, 
    discount, 
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon
  } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState(
    user?.address || 'Hostel #4, BIIT Campus, Shamsabad, Murree Road, Rawalpindi'
  );
  const [contactPhone, setContactPhone] = useState(user?.phone || '+92 301 5551234');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user?.address) {
      setDeliveryAddress(user.address);
    }
    if (user?.phone) {
      setContactPhone(user.phone);
    }
  }, [user]);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const ok = applyCoupon(couponInput);
    if (ok) setCouponInput('');
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!deliveryAddress.trim()) {
      setErrors({ address: 'Please enter delivery address in Rawalpindi' });
      addToast({
        title: 'Missing Address',
        message: 'Please enter your room/hostel/dept at BIIT or address in Rawalpindi.',
        type: 'warning',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        userId: user?.id || `guest-${Date.now()}`,
        userName: user?.name || 'Hamza Abbasi (BIIT Student)',
        userEmail: user?.email || 'student@biit.edu.pk',
        userPhone: contactPhone || '+92 301 5551234',
        deliveryAddress: deliveryAddress.trim(),
        paymentMethod,
        notes: orderNotes.trim() || undefined,
        items: items.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
          customization: i.customization,
        })),
        subtotal,
        discount,
        deliveryFee,
        tax: 0,
        total,
      };

      const placedOrder = await orderService.createOrder(orderData);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#DDD6FE', '#10B981', '#F59E0B']
      });

      addToast({
        title: 'Order Placed Successfully! 🥗',
        message: `Order #${placedOrder.id} dispatched to the kitchen.`,
        type: 'success',
        duration: 4000,
      });

      clearCart();
      navigate('/orders', { state: { newOrderId: placedOrder.id } });
    } catch (err) {
      addToast({
        title: 'Order Placement Error',
        message: err.message || 'Could not place order',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center max-w-7xl mx-auto px-4 py-16 text-white bg-theme-canvas">
        <EmptyState
          icon={ShoppingBag}
          title="Your Food Tray is Empty"
          description="You haven't added any dishes yet. Explore our handcrafted campus menu featuring smash burgers, zinger feasts, and piping hot biryani."
          actionLabel="Explore Campus Menu"
          onAction={() => navigate('/')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-white bg-theme-canvas">
      
      {/* Page Title & Back */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-theme-lavender hover:text-white mb-2 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Browsing Menu
          </Link>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Review Order & Checkout
          </h1>
        </div>

        <div className="flex items-center gap-2.5 text-xs text-theme-lavender bg-[#131A2B] px-4 py-2 rounded-2xl border border-theme-lavender/20 shadow-sm">
          <Clock className="w-4 h-4 text-amber-300" />
          <span>Delivery to BIIT Rawalpindi: <strong className="text-white font-black">15 - 25 minutes</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Cart Items & Delivery Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Selected Dishes Box */}
          <div className="bg-[#131A2B] rounded-3xl p-5 sm:p-6 border border-theme-lavender/15 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-theme-lavender/10 pb-4">
              <h3 className="font-black text-white text-lg sm:text-xl flex items-center gap-2.5">
                <span>Selected Items</span>
                <span className="text-xs bg-theme-lavender/15 text-theme-lavender border border-theme-lavender/25 font-bold px-2.5 py-0.5 rounded-full">
                  {items.length} dishes
                </span>
              </h3>
              <button
                onClick={clearCart}
                className="text-xs text-theme-lavender hover:text-rose-400 font-bold transition"
              >
                Clear Cart
              </button>
            </div>

            <div className="divide-y divide-theme-lavender/10">
              {items.map((item) => (
                <div
                  key={`${item.id}-${JSON.stringify(item.customization)}`}
                  className="py-3.5 flex gap-3.5 items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover shrink-0 border border-theme-lavender/20"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_FOOD_IMG;
                      }}
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs font-black text-theme-lavender mt-0.5">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      {item.customization?.notes && (
                        <p className="text-[11px] text-theme-white-muted italic truncate mt-0.5">
                          "{item.customization.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center border border-theme-lavender/20 rounded-xl bg-theme-purple-dark overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, -1, item.customization)}
                        className="px-2.5 py-1 text-theme-lavender hover:text-white hover:bg-theme-midnight-surface transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-black text-white min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1, item.customization)}
                        className="px-2.5 py-1 text-theme-lavender hover:text-white hover:bg-theme-midnight-surface transition"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id, item.customization)}
                      className="p-1.5 text-theme-lavender hover:text-rose-400 transition"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Details Box */}
          <div className="bg-[#131A2B] rounded-3xl p-5 sm:p-6 border border-theme-lavender/15 shadow-sm space-y-4">
            <h3 className="font-black text-white text-lg sm:text-xl flex items-center gap-2">
              <MapPin className="w-5 h-5 text-theme-lavender" />
              <span>Delivery Details (Rawalpindi)</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-theme-lavender uppercase tracking-wider mb-1.5">
                  Delivery Location / Campus Hostel / Dept
                </label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => {
                    setDeliveryAddress(e.target.value);
                    if (errors.address) setErrors({});
                  }}
                  placeholder="e.g. Hostel #4, BIIT Campus, Shamsabad, Murree Road, Rawalpindi"
                  className="w-full text-xs sm:text-sm p-3 rounded-xl bg-theme-purple-dark border border-theme-lavender/20 text-white placeholder:text-theme-white-muted/60 focus:outline-none focus:ring-1 focus:ring-theme-lavender"
                />
                {errors.address && (
                  <p className="text-xs text-rose-400 mt-1">{errors.address}</p>
                )}
              </div>

              {/* Quick Preset Location Buttons */}
              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="text-theme-white-muted font-semibold self-center">Quick Presets:</span>
                {[
                  'Hostel #4, BIIT Campus, Rawalpindi',
                  'CS Dept Lab 3, BIIT Campus',
                  'Commercial Market, Satellite Town',
                  '6th Road Metro Station, Rawalpindi'
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDeliveryAddress(preset)}
                    className="px-2.5 py-1 rounded-lg bg-[#0B0F19] text-theme-lavender border border-theme-lavender/20 hover:border-theme-lavender transition text-[11px]"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-theme-lavender uppercase tracking-wider mb-1.5">
                    Contact Phone (Pakistani Mobile)
                  </label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+92 301 5551234"
                    className="w-full text-xs sm:text-sm p-3 rounded-xl bg-theme-purple-dark border border-theme-lavender/20 text-white placeholder:text-theme-white-muted/60 focus:outline-none focus:ring-1 focus:ring-theme-lavender"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-theme-lavender uppercase tracking-wider mb-1.5">
                    Rider Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="e.g. Call upon reaching BIIT Gate #2"
                    className="w-full text-xs sm:text-sm p-3 rounded-xl bg-theme-purple-dark border border-theme-lavender/20 text-white placeholder:text-theme-white-muted/60 focus:outline-none focus:ring-1 focus:ring-theme-lavender"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-[#131A2B] rounded-3xl p-5 sm:p-6 border border-theme-lavender/15 shadow-sm space-y-4">
            <h3 className="font-black text-white text-lg sm:text-xl flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-300" />
              <span>Payment Method</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'Cash on Delivery', label: 'Cash on Delivery (COD)', desc: 'Pay at hostel or doorstep', icon: Banknote },
                { id: 'SadaPay / Nayapay', label: 'SadaPay / Nayapay', desc: 'Instant 0% fee transfer', icon: Smartphone },
                { id: 'JazzCash / Easypaisa', label: 'JazzCash / Easypaisa', desc: 'Mobile wallet transfer', icon: Smartphone },
              ].map((method) => {
                const Icon = method.icon;
                const isSelected = paymentMethod === method.id;
                return (
                  <div
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition flex flex-col gap-1.5 ${
                      isSelected
                        ? 'border-theme-lavender bg-theme-violet/20 text-white font-bold'
                        : 'border-theme-lavender/15 bg-theme-purple-dark text-theme-white-muted hover:border-theme-lavender/30'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-theme-lavender' : 'text-theme-lavender/60'}`} />
                      <span className="text-xs font-bold text-white">{method.label}</span>
                    </div>
                    <span className="text-[10px] text-theme-white-muted">{method.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Order Summary & Coupon (5 cols) */}
        <div className="lg:col-span-5 space-y-6 sticky top-28">
          
          {/* Coupon Code Section */}
          <div className="bg-[#131A2B] rounded-3xl p-5 sm:p-6 border border-theme-lavender/15 shadow-sm space-y-3.5">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Tag className="w-4 h-4 text-theme-lavender" />
              <span>Discount Voucher</span>
            </div>

            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#0B0F19] border border-theme-lavender/30 text-xs">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <div>
                    <p className="font-black text-white uppercase">{appliedCoupon.code}</p>
                    <p className="text-theme-lavender text-[11px] font-medium">{appliedCoupon.description}</p>
                  </div>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs font-bold text-rose-400 hover:text-rose-300 px-2 py-1"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="BIIT20, FREEDEL, or RAWALPINDI"
                  className="flex-1 uppercase text-xs font-mono font-bold p-2.5 rounded-xl bg-theme-purple-dark border border-theme-lavender/20 text-white placeholder:text-theme-white-muted/60 focus:outline-none focus:ring-1 focus:ring-theme-lavender"
                />
                <Button variant="primary" size="sm" type="submit" className="shrink-0 font-bold shadow-none">
                  Apply
                </Button>
              </form>
            )}

            <div className="flex flex-wrap gap-2 text-xs text-theme-lavender font-medium">
              <span className="text-theme-white-muted">Try Coupons: </span>
              <button
                type="button"
                onClick={() => applyCoupon('BIIT20')}
                className="font-mono text-white font-bold hover:underline"
              >
                BIIT20 (20%)
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => applyCoupon('FREEDEL')}
                className="font-mono text-white font-bold hover:underline"
              >
                FREEDEL
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => applyCoupon('RAWALPINDI')}
                className="font-mono text-white font-bold hover:underline"
              >
                RAWALPINDI
              </button>
            </div>
          </div>

          {/* Pricing Breakdown Card */}
          <div className="bg-[#131A2B] rounded-3xl p-5 sm:p-6 border border-theme-lavender/15 shadow-sm space-y-4">
            <h3 className="font-black text-white text-lg border-b border-theme-lavender/10 pb-3">
              Order Bill Summary
            </h3>

            <div className="space-y-2.5 text-xs text-theme-white-muted">
              <div className="flex justify-between font-medium">
                <span>Items Subtotal</span>
                <span className="font-bold text-white">{formatPrice(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Voucher Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}

              <div className="flex justify-between font-medium">
                <span>Delivery across Rawalpindi</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-400 font-black uppercase text-[11px]">Free Delivery</span>
                  ) : (
                    formatPrice(deliveryFee)
                  )}
                </span>
              </div>

              <div className="border-t border-theme-lavender/15 pt-3 flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-black text-white block">Total Payable</span>
                  <span className="text-[10px] text-theme-white-muted font-medium">No hidden fees, GST included</span>
                </div>
                <span className="text-xl sm:text-2xl font-black text-white">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            {/* Place Order CTA */}
            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                className="w-full font-bold text-sm sm:text-base shadow-none"
                isLoading={isSubmitting}
                onClick={handlePlaceOrder}
              >
                Confirm Order • {formatPrice(total)}
              </Button>

              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-theme-lavender text-center font-medium">
                <ShieldCheck className="w-4 h-4 text-theme-lavender" />
                <span>BIIT Campus Express Delivery</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default CartPage;
