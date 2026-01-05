
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        try {
            const storedCart = localStorage.getItem('cart');
            return storedCart ? JSON.parse(storedCart) : [];
        } catch (error) {
            console.error('Error loading cart from localStorage', error);
            return [];
        }
    });

    // Get auth context to track user actions
    // useAuth might be undefined if CartProvider is outside AuthProvider, but App.jsx wraps correctly.
    // However, to be safe during initial render or tests, we handle it gently.
    let auth = {};
    try {
        auth = useAuth();
    } catch (e) {
        // Ignore if used outside auth context (rare)
    }
    const { user } = auth;

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

    // Fetch cart from backend if logged in
    useEffect(() => {
        if (user && user.token) {
            fetch(`${API_BASE_URL}/user/cart`, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.cart && data.cart.length > 0) {
                        // Merge or Set? User asked for "history", implying restore.
                        // If local cart is empty, just set it.
                        // If local cart has items, we might want to keep them.
                        // For simplicity and "restore" behavior, we'll assume backend is source of truth after login.
                        // But we shouldn't wipe local work. 
                        // Let's just Add unique items from backend to local if not present.
                        setCart(prev => {
                            const newCart = [...prev];
                            data.cart.forEach(serverItem => {
                                const exists = newCart.some(local => local.id === serverItem.id);
                                if (!exists) {
                                    newCart.push(serverItem);
                                }
                            });
                            return newCart;
                        });
                    }
                })
                .catch(err => console.error("Error fetching cart history", err));
        }
    }, [user]);

    useEffect(() => {
        try {
            localStorage.setItem('cart', JSON.stringify(cart));
        } catch (error) {
            console.error('Error saving cart to localStorage', error);
        }
    }, [cart]);

    const addToCart = (product, quantity = 1, variant = '250g') => {
        setCart(prevCart => {
            const existingItemIndex = prevCart.findIndex(
                item => item.id === product.id && item.variant === variant
            );

            if (existingItemIndex > -1) {
                const newCart = [...prevCart];
                newCart[existingItemIndex].quantity += quantity;
                return newCart;
            } else {
                return [...prevCart, { ...product, quantity, variant }];
            }
        });

        // Log to backend if user is logged in
        if (user && user.token) {
            fetch(`${API_BASE_URL}/user/cart/${product.id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            }).catch(err => console.error("Failed to log cart action", err));
        }
    };

    const removeFromCart = (productId, variant) => {
        setCart(prevCart => prevCart.filter(item => !(item.id === productId && item.variant === variant)));

        // Sync removal with backend
        if (user && user.token) {
            fetch(`${API_BASE_URL}/user/cart/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            }).catch(err => console.error("Failed to remove from cart history", err));
        }
    };

    const updateQuantity = (productId, variant, newQuantity) => {
        if (newQuantity < 1) return;
        setCart(prevCart => prevCart.map(item =>
            (item.id === productId && item.variant === variant)
                ? { ...item, quantity: newQuantity }
                : item
        ));
    };

    const clearCart = () => {
        setCart([]);
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => {
            const price = item.price || 0; // Ensure price logic handles your specific data structure
            return total + (price * item.quantity);
        }, 0);
    };

    const getCartCount = () => {
        return cart.reduce((count, item) => count + item.quantity, 0);
    };

    const value = {
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
