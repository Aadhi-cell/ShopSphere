import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSellerAuth } from '../contexts/SellerAuthContext';

export default function SellerRoute() {
    const { isAuthenticated, loading } = useSellerAuth();

    if (loading) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f8fafc',
                color: '#64748b',
                fontSize: '18px',
                fontWeight: '600'
            }}>
                Verifying seller session...
            </div>
        );
    }

    if (!isAuthenticated) {
        console.warn('⚠️ Access denied: Not authenticated as seller. Redirecting...');
        return <Navigate to="/seller-login" replace />;
    }

    return <Outlet />;
}
