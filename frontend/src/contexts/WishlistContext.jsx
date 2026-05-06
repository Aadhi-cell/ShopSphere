import React, { createContext, useState, useContext, useEffect } from 'react';

const WishlistContext = createContext();

export function useWishlist() {
    return useContext(WishlistContext);
}

export function WishlistProvider({ children }) {
    const getWishlistKey = (u) => u ? `shopsphere_wishlist_${u.email}` : 'shopsphere_wishlist_guest';

    const [wishlistItems, setWishlistItems] = useState([]);

    useEffect(() => {
        const loadWishlist = () => {
            const currentUser = JSON.parse(localStorage.getItem('shopsphere_user') || 'null');
            const key = getWishlistKey(currentUser);
            try {
                const saved = localStorage.getItem(key);
                setWishlistItems(saved ? JSON.parse(saved) : []);
            } catch (e) {
                console.error("Failed to load wishlist", e);
                setWishlistItems([]);
            }
        };

        loadWishlist();
        window.addEventListener('auth-change', loadWishlist);
        return () => window.removeEventListener('auth-change', loadWishlist);
    }, []);

    useEffect(() => {
        const currentUser = JSON.parse(localStorage.getItem('shopsphere_user') || 'null');
        const key = getWishlistKey(currentUser);
        try {
            localStorage.setItem(key, JSON.stringify(wishlistItems));
        } catch (e) {
            console.error("Failed to save wishlist", e);
        }
    }, [wishlistItems]);

    const addToWishlist = (product) => {
        setWishlistItems((prev) => {
            const productId = product._id || product.id;
            if (prev.some(item => (item._id || item.id) === productId)) return prev;
            return [...prev, product];
        });
    };

    const removeFromWishlist = (productId) => {
        const normalizedId = String(productId);
        setWishlistItems((prev) => prev.filter(item => String(item._id || item.id) !== normalizedId));
    };

    const isInWishlist = (productId) => {
        const normalizedId = String(productId);
        return wishlistItems.some(item => String(item._id || item.id) === normalizedId);
    };

    const toggleWishlist = (product) => {
        const productId = product._id || product.id;
        if (isInWishlist(productId)) {
            removeFromWishlist(productId);
        } else {
            addToWishlist(product);
        }
    };

    const value = {
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
}
