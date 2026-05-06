import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Package,
    Search,
    Filter,
    Edit,
    MoreVertical,
    AlertCircle,
    CheckCircle,
    XCircle,
    Pause,
    Play,
    TrendingUp,
    Layers,
    ArrowUpDown,
    Plus,
    ExternalLink
} from 'lucide-react';
import { getImageUrl } from '../../utils/imageConfig';
import EmptyState from './EmptyState';

const InventoryTab = ({ products, loading, onToggleStatus, formatCurrency }) => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterStock, setFilterStock] = useState('All');

    const categories = ['All', ...new Set(products.map(p => p.category))];

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || product.category === filterCategory;
        const matchesStock = filterStock === 'All' ||
            (filterStock === 'Low Stock' && product.stock > 0 && product.stock <= 10) ||
            (filterStock === 'Out of Stock' && product.stock === 0) ||
            (filterStock === 'In Stock' && product.stock > 10);

        return matchesSearch && matchesCategory && matchesStock;
    });

    const getStockStatus = (stock) => {
        if (stock === 0) return { label: 'Out of Stock', color: 'text-red-500 bg-red-50 border-red-100', icon: AlertCircle };
        if (stock <= 10) return { label: 'Low Stock', color: 'text-amber-500 bg-amber-50 border-amber-100', icon: AlertCircle };
        return { label: 'In Stock', color: 'text-emerald-500 bg-emerald-50 border-emerald-100', icon: CheckCircle };
    };

    return (
        <div className="space-y-6">
            {/* Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                {[
                    { label: 'Total Products', value: products.length, icon: Package, color: 'text-blue-600 bg-blue-50' },
                    { label: 'Active Listings', value: products.filter(p => p.status === 'active').length, icon: Play, color: 'text-emerald-600 bg-emerald-50' },
                    { label: 'Low Stock', value: products.filter(p => p.stock > 0 && p.stock <= 10).length, icon: AlertCircle, color: 'text-amber-600 bg-amber-50' },
                    { label: 'Out of Stock', value: products.filter(p => p.stock === 0).length, icon: XCircle, color: 'text-red-600 bg-red-50' },
                    { label: 'Rejected', value: products.filter(p => p.status === 'rejected').length, icon: XCircle, color: 'text-rose-600 bg-rose-50' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm">
                        <div className={`p-2.5 rounded-xl ${stat.color}`}>
                            <stat.icon size={20} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
                            <div className="text-xl font-black text-slate-900">{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col md:flex-row gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by product name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-primary transition-all outline-none"
                        />
                    </div>

                    <div className="flex gap-2">
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 outline-none focus:border-primary transition-all"
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>

                        <select
                            value={filterStock}
                            onChange={(e) => setFilterStock(e.target.value)}
                            className="px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 outline-none focus:border-primary transition-all"
                        >
                            <option value="All">All Stock</option>
                            <option value="In Stock">In Stock</option>
                            <option value="Low Stock">Low Stock</option>
                            <option value="Out of Stock">Out of Stock</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 px-6">
                                <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                                <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                                <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                                <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock</th>
                                <th className="text-left py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="text-right py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredProducts.map((product) => {
                                const stockInfo = getStockStatus(product.stock);
                                return (
                                    <tr key={product._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                                                    <img
                                                        src={getImageUrl(product.imageUrl)}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-sm font-black text-slate-900 truncate mb-0.5">{product.name}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold font-mono tracking-tight uppercase">
                                                        ID: {product._id.slice(-8).toUpperCase()}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-500 border border-slate-200">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="text-sm font-black text-slate-900">
                                                {formatCurrency(product.price)}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col gap-1.5">
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border w-fit ${stockInfo.color}`}>
                                                    <stockInfo.icon size={12} />
                                                    {product.stock} Units
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col gap-1.5">
                                                <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border w-fit shadow-sm 
                                                    ${product.status === 'rejected' ? 'bg-rose-600 text-white border-rose-500 shadow-rose-100' :
                                                      !product.isApproved ? 'bg-amber-500 text-white border-amber-400 animate-pulse' :
                                                      product.status === 'active' ? 'bg-emerald-500 text-white border-emerald-400' : 
                                                      'bg-red-500 text-white border-red-400'}`}>
                                                    {product.status === 'rejected' ? 'Rejected' : (!product.isApproved ? 'Pending Review' : product.status)}
                                                </div>
                                                {product.status === 'rejected' && product.rejectionReason && (
                                                    <div className="text-[10px] font-bold text-rose-500 mt-1 max-w-[150px] leading-tight italic">
                                                        "{product.rejectionReason}"
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/seller/edit-product/${product._id}`)}
                                                    className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all active:scale-95"
                                                    title="Edit Product"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => onToggleStatus(product._id)}
                                                    disabled={product.status === 'blocked'}
                                                    className={`p-2.5 border rounded-xl transition-all active:scale-95 ${product.status === 'blocked'
                                                            ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                                                            : product.status === 'active'
                                                                ? 'bg-white border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-100'
                                                                : 'bg-white border-slate-200 text-emerald-500 hover:bg-emerald-50 hover:border-emerald-100'
                                                        }`}
                                                    title={product.status === 'active' ? 'Pause Product' : 'Resume Product'}
                                                >
                                                    {product.status === 'active' ? <Pause size={16} /> : <Play size={16} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredProducts.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-4">
                            <Layers size={32} />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 mb-1">No products found</h3>
                        <p className="text-sm text-slate-400 font-bold mb-6">Try adjusting your search or filters</p>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterCategory('All');
                                setFilterStock('All');
                            }}
                            className="text-primary font-black text-xs uppercase tracking-widest hover:underline"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}

                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Showing {filteredProducts.length} of {products.length} Products
                    </div>
                    {/* Pagination could go here */}
                </div>
            </div>
        </div>
    );
};

export default InventoryTab;
