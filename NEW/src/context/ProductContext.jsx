// src/context/ProductContext.jsx

import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { useUI } from './UIContext';
// NEW: We no longer need initialProducts or useProfile here
// import initialProducts from '../assets/data.json';
// import { useProfile } from './ProfileContext';

export const ProductContext = createContext();
export const useProducts = () => useContext(ProductContext);

export const ProductProvider = ({ children }) => {
    const { showToast } = useUI();

    // NEW: The 'products' state is removed. Components will fetch their own product data.
    // const [products, setProducts] = useState([]);

    // The wishlist can remain a client-side feature for now
    const [wishlist, setWishlist] = useState(() => {
        try {
            const saved = localStorage.getItem('wishlist');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error("Failed to load wishlist", error);
            return [];
        }
    });

    // NEW: The useEffect for loading products from data.json is removed.

    useEffect(() => {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }, [wishlist]);
    
    // NEW: The addProduct, markAsSold, and deleteProduct functions are removed.
    // These actions will now be handled directly within the components that need them
    // (e.g., MyListings.jsx will have a button that calls supabase.from('listings').delete()...)

    const toggleWishlist = useCallback((productId) => {
        setWishlist(prev => {
            const isWishlisted = prev.includes(productId);
            if (isWishlisted) {
                showToast("Removed from wishlist", "info");
                return prev.filter(id => id !== productId);
            } else {
                showToast("Added to wishlist!", "success");
                return [...prev, productId];
            }
        });
    }, [showToast]);

    // NEW: Sorting logic is removed as each component will fetch and can order its data
    // directly from Supabase (e.g., .order('productPrice')).

    // NEW: The value provided by the context is now much simpler.
    const value = { wishlist, toggleWishlist };

    return (
        <ProductContext.Provider value={value}>
            {children}
        </ProductContext.Provider>
    );
};