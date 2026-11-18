import React, { createContext, useContext, useState, useEffect } from 'react';
import { menuService } from '../services/menuService';
import { useToast } from './ToastContext';

const CartContext = createContext(null);
const CART_STORAGE_KEY = 'biit_foodhub_cart_v2';

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      const records = saved ? JSON.parse(saved) : [];
      return Array.isArray(records) ? records.filter((item) =>
        /^[A-Za-z0-9]{16}$/.test(item?.id) && !item.customization &&
        Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 99) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (product, quantity = 1, customization = null) => {
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (i) => i.id === product.id && JSON.stringify(i.customization) === JSON.stringify(customization)
      );

      if (existingIndex > -1) {
        const next = [...prevItems];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: Math.min(99, next[existingIndex].quantity + quantity),
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
            return newQty > 0 ? { ...item, quantity: Math.min(99, newQty) } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const addMultipleToCart = async (orderItems) => {
    const results = await Promise.allSettled(orderItems.map(async (line) => ({
      item: await menuService.getById(line.id), quantity: line.quantity,
    })));
    let added = 0;
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.item.isAvailable) {
        addToCart(result.value.item, result.value.quantity);
        added += 1;
      }
    }
    if (added !== orderItems.length) {
      addToast({ title: 'Some items could not be reordered', message: 'Check the live menu for availability.', type: 'warning' });
    }
  };

  // Calculations
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const total = subtotal;

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
        total: Number(total.toFixed(2)),
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
