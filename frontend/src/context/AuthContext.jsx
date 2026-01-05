import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [wishlist, setWishlist] = useState(() => {
        try {
            const stored = localStorage.getItem('wishlist');
            return stored ? JSON.parse(stored) : [];
        } catch (err) {
            return [];
        }
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const API_BASE_URL = 'http://127.0.0.1:8000';

    // Check if user is logged in on mount
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const email = localStorage.getItem('userEmail');
        const username = localStorage.getItem('userName');
        const full_name = localStorage.getItem('userFullName');

        if (token && email) {
            setUser({ email, username, full_name, token });
            fetchWishlist(token); // Load wishlist on restore
        }
        setLoading(false);
    }, []);

    // Persist wishlist to localStorage
    useEffect(() => {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    // Fetch user's wishlist
    const fetchWishlist = async (token) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/user/wishlist`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                // Map to format expected (just ID logic usually, or depends on data)
                // sheets.get_user_wishlist returns [{product_id, added_at}]
                // Client wishlist expects [{product_id}] or similar?
                // Let's check `isInWishlist`. usage: item.product_id
                setWishlist(data.wishlist || []);
            }
        } catch (error) {
            console.error("Error fetching wishlist", error);
        }
    };


    // Login function
    const login = async (email, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: email, password })
            });

            if (response.ok) {
                const data = await response.json();

                const userData = data.user || {};
                const fullName = userData.full_name || data.full_name;
                const username = userData.username || data.username || '';

                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userEmail', data.email);
                localStorage.setItem('userName', username);
                localStorage.setItem('profileComplete', data.profile_complete);
                if (fullName) localStorage.setItem('userFullName', fullName);

                setUser({
                    email: data.email,
                    username: username,
                    full_name: fullName,
                    token: data.token
                });

                // Fetch wishlist immediately
                fetchWishlist(data.token);



                return { success: true, profileComplete: data.profile_complete };
            } else {
                const error = await response.json();
                return { success: false, error: error.detail || 'Login failed' };
            }
        } catch (error) {
            return { success: false, error: 'Network error' };
        }
    };

    // Logout function
    const logout = async () => {
        try {
            await fetch(`${API_BASE_URL}/api/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });
        } catch (error) {
            console.error('Logout error:', error);
        }

        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('profileComplete');
        localStorage.removeItem('profileComplete');
        localStorage.removeItem('wishlist');
        localStorage.removeItem('cart'); // Clear cart as well per user request "error functionality after login and logout"

        setUser(null);
        setWishlist([]);
        navigate('/login');
    };

    // Update user function
    const updateUser = (userData) => {
        const newUser = { ...user, ...userData };
        setUser(newUser);

        if (userData.username) localStorage.setItem('userName', userData.username);
        if (userData.email) localStorage.setItem('userEmail', userData.email);
        // Persist other fields if needed for session restoration, though usually just minimal needed
        // For Header display we need full_name too if we want it to persist across refreshes without api call
        if (userData.full_name) localStorage.setItem('userFullName', userData.full_name);
    };

    // Add to wishlist
    const addToWishlist = async (productId) => {
        // No login check required for local storage wishlist (usually)
        // But typically wishlist IS user specific. 
        // Prompt: "add card not save any place... make same functionality for wishlist"
        // Cart works WITHOUT login usually. 
        // I will remove login check to match Cart behavior "Add card [Cart] ... make same functionality".

        if (isInWishlist(productId)) return { success: true };

        setWishlist(prev => [...prev, { product_id: productId }]);
        return { success: true };
    };

    // Remove from wishlist
    const removeFromWishlist = async (productId) => {
        setWishlist(prev => prev.filter(item => item.product_id !== productId));
        return { success: true };
    };

    // Check if product is in wishlist
    const isInWishlist = (productId) => {
        return wishlist.some(item => item.product_id === productId);
    };

    const value = {
        user,
        wishlist,
        loading,
        login,
        logout,
        updateUser,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
