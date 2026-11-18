import React, { createContext, useContext, useState, useEffect } from 'react';
import { VALID_COUPONS } from '../services/mockData';
import { useToast } from './ToastContext';

const CartContext = createContext(null);
const CART_STORAGE_KEY = 'biit_foodhub_cart_v2';
const COUPON_STORAGE_KEY = 'biit_foodhub_active_coupon_v2';

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem(COUPON_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem(COUPON_STORAGE_KEY);
    }
  }, [appliedCoupon]);

  const addToCart = (product, quantity = 1, customization = null) => {
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (i) => i.id === product.id && JSON.stringify(i.customization) === JSON.stringify(customization)
      );

      if (existingIndex > -1) {
        const next = [...prevItems];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      } else {
        return [
          ...prevItems,
          {
            id: product.id,
            name: product.name,
            price: Number(product.price),
            image: product.image,
            category: product.category,
            quantity,
            customization,
          },
        ];
      }
    });

    addToast({
      title: 'Added to Cart',
      message: `${quantity}x ${product.name} added!`,
      type: 'success',
      duration: 2500,
    });
  };

  const removeFromCart = (itemId, customization = null) => {
    setItems((prev) =>
      prev.filter(
        (i) => !(i.id === itemId && JSON.stringify(i.customization) === JSON.stringify(customization))
      )
    );
  };

  const updateQuantity = (itemId, delta, customization = null) => {
    setItems((prev) => {
      return prev
        .map((item) => {
          if (item.id === itemId && JSON.stringify(item.customization) === JSON.stringify(customization)) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const addMultipleToCart = (orderItems) => {
    setItems((prev) => {
      const next = [...prev];
      orderItems.forEach((orderItem) => {
        const existingIdx = next.findIndex((i) => i.id === orderItem.id);
        if (existingIdx > -1) {
          next[existingIdx].quantity += orderItem.quantity;
        } else {
          next.push({
            id: orderItem.id,
            name: orderItem.name,
            price: Number(orderItem.price),
            image: orderItem.image,
            quantity: orderItem.quantity,
          });
        }
      });
      return next;
    });

    addToast({
      title: 'Order Re-added!',
      message: `${orderItems.length} items loaded into your cart.`,
      type: 'success',
    });
  };

  // Calculations
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Delivery fee: Rs. 100 base across Rawalpindi, free over Rs. 1,500 or with coupon
  let deliveryFee = subtotal >= 1500 || subtotal === 0 ? 0 : 100;
  if (appliedCoupon?.freeDelivery && subtotal > 0) {
    deliveryFee = 0;
  }

  // Discount calculation
  let discount = 0;
  if (appliedCoupon && subtotal > 0) {
    if (appliedCoupon.discountPercent) {
      discount = Math.round((subtotal * appliedCoupon.discountPercent) / 100);
    } else if (appliedCoupon.discountAmount) {
      discount = Math.min(subtotal, appliedCoupon.discountAmount);
    }
  }

  // No arbitrary tax for campus students, clean round total in PKR
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = 0;

  const total = Math.max(0, taxableAmount + deliveryFee);

  const applyCoupon = (code) => {
    const cleanCode = code?.trim().toUpperCase();
    const found = VALID_COUPONS[cleanCode];

    if (!found) {
      addToast({
        title: 'Invalid Coupon',
        message: 'Coupon code not recognized. Try BIIT20, FREEDEL, or RAWALPINDI',
        type: 'error',
      });
      return false;
    }

    if (found.minOrder && subtotal < found.minOrder) {
      addToast({
        title: 'Minimum Order Not Met',
        message: `This coupon requires a minimum subtotal of Rs. ${found.minOrder}.`,
        type: 'warning',
      });
      return false;
    }

    setAppliedCoupon(found);
    addToast({
      title: 'Coupon Applied! 🎉',
      message: `${found.description} has been applied to your order!`,
      type: 'success',
    });
    return true;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    addToast({
      title: 'Coupon Removed',
      message: 'Discount has been removed.',
      type: 'info',
    });
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        addMultipleToCart,
        totalItems,
        subtotal: Number(subtotal.toFixed(2)),
        deliveryFee: Number(deliveryFee.toFixed(2)),
        discount: Number(discount.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        total: Number(total.toFixed(2)),
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
