import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const getCartKey = (u) => u ? `shopsphere_cart_${u.email}` : 'shopsphere_cart_guest';

  const [cart, setCart] = useState(() => {
    const currentUser = JSON.parse(localStorage.getItem('shopsphere_user') || 'null');
    const key = getCartKey(currentUser);
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  });

  // Load cart on auth changes
  useEffect(() => {
    const loadCart = () => {
      const currentUser = JSON.parse(localStorage.getItem('shopsphere_user') || 'null');
      const key = getCartKey(currentUser);
      const savedCart = localStorage.getItem(key);
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart);
          // Only update if different to avoid unnecessary cycles
          setCart(prev => JSON.stringify(prev) !== savedCart ? parsed : prev);
        } catch (e) {
          console.error('Failed to load cart', e);
        }
      } else {
        setCart([]);
      }
    };

    const handleAuthChange = () => loadCart();
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  // Save cart whenever it changes
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('shopsphere_user') || 'null');
    const key = getCartKey(currentUser);
    localStorage.setItem(key, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const productId = product._id || product.id;
      const selectedColor = product.selectedColor || '';
      const selectedSize = product.selectedSize || '';
      const quantityToAdd = product.quantity || 1;
      const isOutOfStock = (product.stock <= 0) || (product.status === 'out-of-stock');

      if (isOutOfStock) return prevCart;

      // Unique identifier for variation
      const existingItem = prevCart.find((item) => 
        String(item._id || item.id) === String(productId) && 
        (item.selectedColor || '') === selectedColor && 
        (item.selectedSize || '') === selectedSize
      );

      if (existingItem) {
        return prevCart.map((item) =>
          (String(item._id || item.id) === String(productId) && 
           (item.selectedColor || '') === selectedColor && 
           (item.selectedSize || '') === selectedSize)
            ? { ...item, quantity: item.quantity + quantityToAdd }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: quantityToAdd }];
    });
  };

  const removeFromCart = (productId) => {
    const normalizedId = String(productId);
    setCart((prevCart) => prevCart.filter((item) => String(item._id || item.id) !== normalizedId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const normalizedId = String(productId);
    setCart((prevCart) =>
      prevCart.map((item) =>
        String(item._id || item.id) === normalizedId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

