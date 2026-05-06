import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginSeller as apiLoginSeller, logoutSeller as apiLogoutSeller, getSellerProfile } from '../api/sellerApi';

const SellerAuthContext = createContext();

export const useSellerAuth = () => {
    const context = useContext(SellerAuthContext);
    if (!context) {
        throw new Error('useSellerAuth must be used within SellerAuthProvider');
    }
    return context;
};

export const SellerAuthProvider = ({ children }) => {
    const [seller, setSeller] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('sellerToken'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('sellerToken');
            if (storedToken) {
                try {

                    const response = await getSellerProfile();
                    setSeller(response.seller);
                    setToken(storedToken);
                } catch (error) {
                    console.error('Failed to fetch seller profile:', error);
                    localStorage.removeItem('sellerToken');
                    setToken(null);
                    setSeller(null);
                }
            }
            setLoading(false);
        };

        const handleAuthChange = () => {
            const newToken = localStorage.getItem('sellerToken');
            if (!newToken) {
                setSeller(null);
                setToken(null);
            }
        };

        initAuth();
        window.addEventListener('seller-auth-change', handleAuthChange);
        return () => window.removeEventListener('seller-auth-change', handleAuthChange);
    }, []);

    const loginSeller = async (credentials) => {
        try {
            const response = await apiLoginSeller(credentials);
            const { token: newToken, seller: sellerData } = response;

            localStorage.setItem('sellerToken', newToken);
            setToken(newToken);
            setSeller(sellerData);


            return response;
        } catch (error) {
            throw error;
        }
    };

    const logoutSeller = async () => {
        try {
            await apiLogoutSeller();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('sellerToken');
            setToken(null);
            setSeller(null);

        }
    };

    const updateSeller = (updatedData) => {
        setSeller(prev => ({ ...prev, ...updatedData }));
    };

    const value = {
        seller,
        token,
        loading,
        loginSeller,
        logoutSeller,
        updateSeller,
        isAuthenticated: !!token && !!seller
    };

    return (
        <SellerAuthContext.Provider value={value}>
            {children}
        </SellerAuthContext.Provider>
    );
};

export default SellerAuthContext;
