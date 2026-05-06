import React, { useState, useEffect } from 'react';
import { getSellerProducts, toggleProductPause } from '../../api/sellerApi';
import InventoryTab from '../../components/seller/InventoryTab';

export default function MyProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await getSellerProducts();
            setProducts(data);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePause = async (id) => {
        try {
            const res = await toggleProductPause(id);
            setProducts(products.map(p => p._id === id || p.id === id ? { ...p, status: res.status } : p));
        } catch (error) {
            console.error('Failed to toggle product status:', error);
            alert(error.response?.data?.message || 'Action failed');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="p-8 max-w-[1400px] mx-auto min-h-screen bg-[#f8fafc]">
            <div className="mb-8">
                <h1 className="text-[32px] font-[1000] text-slate-900 mb-2 tracking-tight">
                    Inventory Management
                </h1>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                    Professional Catalog Scale & Stock Control
                </p>
            </div>

            <InventoryTab 
                products={products}
                loading={loading}
                onToggleStatus={handleTogglePause}
                formatCurrency={formatCurrency}
            />
        </div>
    );
}

