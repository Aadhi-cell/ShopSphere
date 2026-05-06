import React, { useState, useEffect } from 'react';
import { getAdminProducts, blockProduct, unblockProduct, approveProductAdmin, rejectProductAdmin } from '../../api/adminApi';
import { Package, Search, Edit3, X, CheckCircle2, ShieldAlert, ShieldCheck, Clock, RefreshCcw, RefreshCw, XCircle, Eye, Info, Calendar, Hash, Store } from 'lucide-react';
import { getImageUrl } from '../../utils/imageConfig';

const formatINR = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

export default function ProductManager({ activeSubTab }) {
    const [activeTab, setActiveTab] = useState('all-products'); // 'all-products', 'approvals', 'rejected', 'blocked'
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal States
    const [viewProduct, setViewProduct] = useState(null);
    const [rejectingProduct, setRejectingProduct] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        loadProducts();
    }, []);

    useEffect(() => {
        if (activeSubTab === 'products-moderation') setActiveTab('approvals');
        else if (activeSubTab === 'products-blocked') setActiveTab('blocked');
        else setActiveTab('all-products');
    }, [activeSubTab]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await getAdminProducts();
            setProducts(data);
        } catch (error) {
            console.error('Failed to load products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBlock = async (id) => {
        if (!window.confirm('Are you sure you want to BLOCK this product?')) return;
        try {
            setActionLoading(true);
            await blockProduct(id);
            setProducts(prev => prev.map(p => (p.id === id || p._id === id) ? { ...p, status: 'blocked' } : p));
        } catch (error) {
            alert('Failed to block product');
        } finally {
            setActionLoading(false);
        }
    };

    const handleUnblock = async (id) => {
        if (!window.confirm('Are you sure you want to UNBLOCK this product?')) return;
        try {
            setActionLoading(true);
            await unblockProduct(id);
            setProducts(prev => prev.map(p => (p.id === id || p._id === id) ? { ...p, status: 'active' } : p));
        } catch (error) {
            alert('Failed to unblock product');
        } finally {
            setActionLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            setActionLoading(true);
            await approveProductAdmin(id);
            // Real-time local state update
            setProducts(prev => prev.map(p => (p.id === id || p._id === id) ? { ...p, isApproved: true, status: 'active', rejectionReason: null } : p));
        } catch (error) {
            alert('Failed to approve product');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectSubmit = async () => {
        if (!rejectionReason.trim()) return alert('Please provide a reason for rejection.');
        try {
            setActionLoading(true);
            await rejectProductAdmin(rejectingProduct.id || rejectingProduct._id, rejectionReason);
            // Real-time local state update
            setProducts(prev => prev.map(p => (p.id === rejectingProduct.id || p._id === rejectingProduct.id || p.id === rejectingProduct._id || p._id === rejectingProduct._id) ? { ...p, status: 'rejected', isApproved: false, rejectionReason } : p));
            setRejectingProduct(null);
            setRejectionReason('');
        } catch (error) {
            alert('Failed to reject product');
        } finally {
            setActionLoading(false);
        }
    };

    // Filter sequences
    const allActiveProducts = products.filter(p => p.isApproved && p.status !== 'blocked');
    const pendingProducts = products.filter(p => !p.isApproved && p.status !== 'blocked' && p.status !== 'rejected');
    const rejectedProducts = products.filter(p => p.status === 'rejected');
    const blockedProducts = products.filter(p => p.status === 'blocked');

    const getFilteredList = (list) => {
        if (!searchQuery) return list;
        const q = searchQuery.toLowerCase();
        return list.filter(p =>
            p.name?.toLowerCase().includes(q) ||
            p.seller_id?.businessName?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q) ||
            String(p._id || p.id).toLowerCase().includes(q)
        );
    };

    return (
        <div className="flex flex-col h-full animate-fade-in pb-20">
            {/* Header Section */}
            <div className="mb-8">
                <h2 className="text-2xl font-[1000] text-slate-900 mb-1 tracking-tight">Product Moderation</h2>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Live Catalog Moderation</p>
                </div>
            </div>

            {/* Controls Section */}
            <div className="bg-white/50 backdrop-blur-xl p-4 rounded-3xl border border-white shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex bg-slate-100 p-1 rounded-2xl w-full sm:w-auto overflow-x-auto hide-scrollbar">
                    <TabButton active={activeTab === 'all-products'} onClick={() => setActiveTab('all-products')} count={allActiveProducts.length}>
                        All Products
                    </TabButton>
                    <TabButton active={activeTab === 'approvals'} onClick={() => setActiveTab('approvals')} count={pendingProducts.length} highlight>
                        Pending
                    </TabButton>
                    <TabButton active={activeTab === 'rejected'} onClick={() => setActiveTab('rejected')} count={rejectedProducts.length}>
                        Rejected
                    </TabButton>
                    <TabButton active={activeTab === 'blocked'} onClick={() => setActiveTab('blocked')} count={blockedProducts.length}>
                        Blocked
                    </TabButton>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Find by name, ID or seller..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                <X size={16} />
                            </button>
                        )}
                    </div>
                    <button
                        onClick={loadProducts}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm shrink-0"
                    >
                        <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Content Container */}
            <div className="bg-white rounded-[24px] shadow-sm border border-slate-200/60 overflow-hidden relative min-h-[500px]">
                {loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
                        <RefreshCw className="animate-spin text-blue-600 mb-4" size={40} />
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Syncing Catalog...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto hide-scrollbar">
                        {activeTab === 'all-products' && <ProductsTable products={getFilteredList(allActiveProducts)} onBlock={handleBlock} onView={setViewProduct} />}
                        {activeTab === 'approvals' && <ModerationTable products={getFilteredList(pendingProducts)} onApprove={handleApprove} onReject={setRejectingProduct} onView={setViewProduct} />}
                        {activeTab === 'rejected' && <ModerationTable products={getFilteredList(rejectedProducts)} onApprove={handleApprove} statusType="rejected" onView={setViewProduct} />}
                        {activeTab === 'blocked' && <ProductsTable products={getFilteredList(blockedProducts)} onBlock={handleUnblock} blockActionName="Unblock" onView={setViewProduct} />}
                    </div>
                )}
            </div>

            {/* View Details Modal */}
            {viewProduct && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-[1000px] max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col border border-slate-200/50 translate-y-14">
                        {/* Premium Header */}
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-blue-600 text-white rounded-[20px] flex items-center justify-center shadow-lg shadow-blue-200 ring-4 ring-blue-50">
                                    <Info size={24} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-[1000] text-slate-900 tracking-tight leading-none">Product Inspection</h3>
                                    <p className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-1.5">Review quality & technical specifications</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setViewProduct(null)}
                                className="w-11 h-11 flex items-center justify-center hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-slate-900"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-8 py-10 scrollbar-hide">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                                {/* Left Side: Product Visuals & Meta (5 cols) */}
                                <div className="lg:col-span-5 space-y-8">
                                    <div className="group relative aspect-square bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all hover:border-blue-400/50 hover:bg-blue-50/30">
                                        <img src={getImageUrl(viewProduct.imageUrl)} alt="" className="w-full h-full object-contain p-8 transition-all duration-500" />
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full border border-slate-200 text-[10px] font-black text-slate-500 tracking-widest uppercase">Master Image</div>
                                    </div>

                                    {/* Secondary Images if any */}
                                    {viewProduct.images && viewProduct.images.length > 0 && (
                                        <div className="grid grid-cols-4 gap-3">
                                            {viewProduct.images.map((img, idx) => (
                                                <div key={idx} className="aspect-square bg-slate-50 rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:border-blue-500 transition-colors">
                                                    <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="p-5 bg-slate-50 rounded-[24px] border border-slate-100 flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-200 shadow-sm">
                                                <Hash size={18} />
                                            </div>
                                            <div>
                                                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">System Record ID</span>
                                                <p className="text-[13px] font-mono font-bold text-slate-800 tracking-tighter">{viewProduct._id || viewProduct.id}</p>
                                            </div>
                                        </div>
                                        <div className="p-5 bg-slate-50 rounded-[24px] border border-slate-100 flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-200 shadow-sm">
                                                <Calendar size={18} />
                                            </div>
                                            <div>
                                                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Listing Timestamp</span>
                                                <p className="text-[13px] font-bold text-slate-800">{new Date(viewProduct.createdAt).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Product Intelligence (7 cols) */}
                                <div className="lg:col-span-7 space-y-10">
                                    <div className="space-y-4">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border border-blue-100">
                                            {viewProduct.category}
                                        </div>
                                        <h2 className="text-3xl font-[1000] text-slate-900 tracking-tight leading-tight">{viewProduct.name}</h2>
                                        <p className="text-lg font-bold text-slate-500 tracking-tight">By {viewProduct.seller_id?.businessName || 'Verified Merchant Account'}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="relative group p-6 bg-slate-900 rounded-[28px] overflow-hidden shadow-xl shadow-slate-200">
                                            <div className="relative z-10">
                                                <span className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Platform Pricing</span>
                                                <span className="text-3xl font-black text-white">{formatINR(viewProduct.price)}</span>
                                            </div>
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <Edit3 size={48} className="text-white" />
                                            </div>
                                        </div>
                                        <div className="relative p-6 bg-emerald-50 rounded-[28px] border border-emerald-100 shadow-sm">
                                            <span className="block text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-2">Inventory Status</span>
                                            <span className={`text-3xl font-black ${viewProduct.stock > 0 ? 'text-emerald-700' : 'text-rose-500'}`}>
                                                {viewProduct.stock} <span className="text-lg font-bold">Units</span>
                                            </span>
                                            <div className="mt-2 flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${viewProduct.stock > 5 ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                                <span className="text-[11px] font-bold text-emerald-600/70 uppercase tracking-widest">{viewProduct.stock > 5 ? 'Stable' : 'Low Stock'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-[12px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                            <Package size={14} className="text-blue-500" />
                                            Detailed Manifest
                                        </h4>
                                        <div className="p-6 bg-slate-50 rounded-[28px] border border-slate-100 text-sm font-medium text-slate-600 leading-relaxed min-h-[160px]">
                                            {viewProduct.description || 'The merchant has not provided a technical description for this listing.'}
                                        </div>
                                    </div>

                                    {viewProduct.status === 'rejected' && (
                                        <div className="p-6 bg-rose-50/80 backdrop-blur rounded-[28px] border border-rose-100 flex gap-4">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-rose-500 shadow-sm shrink-0 border border-rose-100">
                                                <XCircle size={24} />
                                            </div>
                                            <div>
                                                <h4 className="text-[11px] font-black text-rose-500 uppercase tracking-[0.2em] mb-1">Rejection Audit Log</h4>
                                                <p className="text-[14px] font-bold text-rose-700 italic leading-relaxed">"{viewProduct.rejectionReason}"</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Quick Moderation Actions Footer */}
                        <div className="px-8 py-6 bg-slate-50/80 backdrop-blur border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Clock size={16} />
                                <span className="text-[11px] font-bold uppercase tracking-widest">Decision Pending</span>
                            </div>
                            <div className="flex items-center gap-4">
                                {!viewProduct.isApproved && viewProduct.status !== 'rejected' ? (
                                    <>
                                        <button
                                            onClick={() => { setViewProduct(null); setRejectingProduct(viewProduct); }}
                                            className="px-8 py-3.5 rounded-2xl bg-white border border-slate-200 text-rose-600 text-[13px] font-black hover:bg-rose-50 hover:border-rose-200 transition-all cursor-pointer shadow-sm active:scale-95"
                                        >
                                            Reject listing
                                        </button>
                                        <button
                                            onClick={() => { handleApprove(viewProduct.id || viewProduct._id); setViewProduct(null); }}
                                            disabled={actionLoading}
                                            className="px-10 py-3.5 rounded-2xl bg-emerald-500 text-white text-[13px] font-black hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 active:scale-95 cursor-pointer disabled:opacity-50"
                                        >
                                            {actionLoading ? 'Approving...' : 'Approve for Web'}
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setViewProduct(null)}
                                        className="px-10 py-3.5 rounded-2xl bg-slate-900 text-white text-[13px] font-black hover:bg-slate-800 transition-all shadow-lg active:scale-95 cursor-pointer"
                                    >
                                        Close Audit
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Reason Modal */}
            {rejectingProduct && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-[440px] rounded-[32px] shadow-2xl p-8 border border-slate-100 animate-in fade-in slide-in-from-bottom-4">
                        <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-3xl flex items-center justify-center mb-6">
                            <XCircle size={32} />
                        </div>
                        <h3 className="text-xl font-[1000] text-slate-900 mb-2">Why Reject this Product?</h3>
                        <p className="text-sm font-semibold text-slate-500 mb-6 leading-relaxed">The seller will see this reason in their dashboard. Please be specific to help them fix the listing.</p>

                        <textarea
                            className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-bold outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/5 transition-all mb-6 min-h-[120px] placeholder:text-slate-400"
                            placeholder="e.g., Image quality is low, incorrect category, or prohibited item..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                        />

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => { setRejectingProduct(null); setRejectionReason(''); }}
                                className="w-full py-3.5 rounded-2xl bg-white border border-slate-200 text-sm font-black text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRejectSubmit}
                                disabled={actionLoading}
                                className="w-full py-3.5 rounded-2xl bg-rose-500 text-white text-sm font-black hover:bg-rose-600 transition-all shadow-lg shadow-rose-200 active:scale-95 disabled:opacity-50 cursor-pointer"
                            >
                                {actionLoading ? 'Processing...' : 'Confirm Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}

// -------------------------------------------------------------
// Component: Products Table (Used for All & Blocked)
// -------------------------------------------------------------
function ProductsTable({ products, onBlock, blockActionName = "Block", onView }) {
    if (products.length === 0) return <EmptyState tabName="Matched Products" />;

    return (
        <table className="w-full text-left border-separate border-spacing-0">
            <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Product Intelligence</th>
                    <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Ownership</th>
                    <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Valuation</th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Moderation</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                    <tr key={product._id || product.id} className="hover:bg-slate-50/80 transition-all group">
                        <td className="px-8 py-5 align-middle">
                            <div className="flex items-center gap-5">
                                <div
                                    className="w-16 h-16 rounded-2xl border border-slate-200 bg-white overflow-hidden shrink-0 flex items-center justify-center p-1.5 cursor-pointer hover:border-blue-500 hover:shadow-lg hover:shadow-blue-100 transition-all duration-300"
                                    onClick={() => onView(product)}
                                >
                                    <img src={getImageUrl(product.imageUrl)} alt="" className="w-full h-full object-contain" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span
                                        className="font-[900] text-slate-900 text-[15px] cursor-pointer hover:text-blue-600 transition-colors tracking-tight leading-tight"
                                        onClick={() => onView(product)}
                                    >
                                        {product.name}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-md border border-slate-200">
                                            {product.category}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-5 text-center align-middle">
                            <div className="flex flex-col items-center">
                                <span className="text-[13px] font-[800] text-slate-700">{product.seller_id?.businessName || 'Verified Store'}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Merchant Profile</span>
                            </div>
                        </td>
                        <td className="px-6 py-5 text-center align-middle">
                            <div className="flex flex-col">
                                <span className="font-black text-slate-900 text-lg tracking-tighter">{formatINR(product.price)}</span>
                                <span className={`text-[11px] font-bold ${product.stock > 0 ? 'text-slate-400' : 'text-rose-400'} uppercase tracking-widest`}>
                                    {product.stock} Units Available
                                </span>
                            </div>
                        </td>
                        <td className="px-8 py-5 text-right align-middle">
                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={() => onView(product)}
                                    className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100"
                                    title="Quick View"
                                >
                                    <Eye size={20} />
                                </button>
                                <button
                                    onClick={() => onBlock(product.id || product._id)}
                                    className={`h-10 px-5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all border ${blockActionName === 'Unblock' ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200' : 'bg-white text-rose-500 border-slate-200 hover:border-rose-200 hover:bg-rose-50 shadow-sm'}`}
                                >
                                    {blockActionName}
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

// -------------------------------------------------------------
// Component: Moderation Table (Used for Pending & Rejected)
// -------------------------------------------------------------
function ModerationTable({ products, onApprove, onReject, statusType = 'pending', onView }) {
    if (products.length === 0) return <EmptyState tabName={statusType === 'pending' ? 'Pending Moderation' : 'Rejected Items'} />;

    return (
        <table className="w-full text-left border-separate border-spacing-0">
            <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Listing Preview</th>
                    <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Timeline</th>
                    <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Audit Status</th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Moderation Flow</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                    <tr key={product._id || product.id} className="hover:bg-slate-50/80 transition-all group">
                        <td className="px-8 py-5 align-middle">
                            <div className="flex items-center gap-5">
                                <button
                                    onClick={() => onView(product)}
                                    className="w-16 h-16 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-100 transition-all duration-300 shrink-0 p-1.5 flex items-center justify-center ring-4 ring-transparent hover:ring-blue-50"
                                >
                                    <img src={getImageUrl(product.imageUrl)} alt="" className="w-full h-full object-contain" />
                                </button>
                                <div className="flex flex-col gap-1">
                                    <span
                                        className="font-[900] text-slate-900 text-[15px] line-clamp-1 hover:text-blue-600 cursor-pointer tracking-tight leading-tight"
                                        onClick={() => onView(product)}
                                    >
                                        {product.name}
                                    </span>
                                    <span className="text-[11px] font-bold text-slate-400 tracking-tight">By {product.seller_id?.businessName || 'Public Merchant'}</span>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-5 text-center align-middle">
                            <div className="flex flex-col items-center">
                                <span className="text-[13px] font-bold text-slate-600">{new Date(product.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">Date Lodged</span>
                            </div>
                        </td>
                        <td className="px-6 py-5 text-center align-middle">
                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${statusType === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200 animate-pulse' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                                {statusType === 'pending' ? <Clock size={12} /> : <XCircle size={12} />} {statusType}
                            </span>
                        </td>
                        <td className="px-8 py-5 text-right align-middle">
                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={() => onView(product)}
                                    className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100"
                                    title="Full Audit"
                                >
                                    <Eye size={20} />
                                </button>
                                <button
                                    onClick={() => onApprove(product.id || product._id)}
                                    className="h-10 px-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[12px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-100 flex items-center gap-2 active:scale-95 border-none cursor-pointer"
                                >
                                    <CheckCircle2 size={16} /> Approve
                                </button>
                                {statusType === 'pending' && (
                                    <button
                                        onClick={() => onReject(product)}
                                        className="w-10 h-10 flex items-center justify-center bg-white text-rose-500 hover:bg-rose-50 rounded-xl transition-all border border-slate-200 hover:border-rose-200 cursor-pointer shadow-sm"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

// -------------------------------------------------------------
// Helper Components
// -------------------------------------------------------------
function TabButton({ children, active, onClick, count, highlight }) {
    return (
        <button
            onClick={onClick}
            className={`
                relative px-6 py-2.5 rounded-xl text-[12px] font-black tracking-wide transition-all min-w-[120px] whitespace-nowrap flex items-center justify-center gap-2 border-none cursor-pointer
                ${active
                    ? 'bg-white text-blue-700 shadow-sm border border-slate-200/50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}
            `}
        >
            {children}
            {count !== undefined && (
                <span className={`
                    text-[10px] px-2 py-0.5 rounded-full font-black
                    ${active ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'}
                    ${highlight && !active && count > 0 ? 'bg-amber-100 text-amber-700 animate-pulse' : ''}
                `}>
                    {count}
                </span>
            )}
        </button>
    );
}

function EmptyState({ tabName }) {
    return (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-slate-50/30">
            <div className="w-16 h-16 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-center text-slate-200 mb-6">
                <Package size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Queue Clear!</h3>
            <p className="text-sm font-semibold text-slate-400 max-w-[240px]">No records found for <span className="text-slate-800">{tabName}</span> at the moment.</p>
        </div>
    );
}

