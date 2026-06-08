import React, { useState, useEffect } from 'react';
import {
    TrendingUp, TrendingDown, Users, ShoppingBag, IndianRupee, 
    Package, Store, Activity, CreditCard, ArrowRightLeft, 
    RefreshCcw, Calendar, Filter, X, Search, RefreshCw, ShieldCheck
} from 'lucide-react';
import { getAdminStats, getAdminOrders } from '../../api/adminApi';
import { getImageUrl } from '../../utils/imageConfig';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const formatINR = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

export default function AdminOverview({ setActiveTab }) {
    const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString());
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('This Month');
    
    // Revenue Details States
    const [showRevenueModal, setShowRevenueModal] = useState(false);
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [ordersSearch, setOrdersSearch] = useState('');
    const [showChargeHistoryModal, setShowChargeHistoryModal] = useState(false);

    const handleRevenueCardClick = async () => {
        setShowRevenueModal(true);
        if (orders.length === 0) {
            try {
                setOrdersLoading(true);
                const ordersData = await getAdminOrders();
                // Filter for revenue orders (excluding Cancelled and Returned)
                const revenueOrders = ordersData.filter(o => 
                    o.status !== 'Cancelled' && 
                    o.status !== 'Returned'
                );
                setOrders(revenueOrders);
            } catch (err) {
                console.error('Failed to load revenue orders:', err);
            } finally {
                setOrdersLoading(false);
            }
        }
    };
    const [showCommissionModal, setShowCommissionModal] = useState(false);
    const [commissionSearch, setCommissionSearch] = useState('');

    const handlePlatformEarningsClick = async () => {
        setShowCommissionModal(true);
        if (orders.length === 0) {
            try {
                setOrdersLoading(true);
                const ordersData = await getAdminOrders();
                // Filter for revenue orders (excluding Cancelled and Returned)
                const revenueOrders = ordersData.filter(o => 
                    o.status !== 'Cancelled' && 
                    o.status !== 'Returned'
                );
                setOrders(revenueOrders);
            } catch (err) {
                console.error('Failed to load revenue orders:', err);
            } finally {
                setOrdersLoading(false);
            }
        }
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const statsData = await getAdminStats(dateRange);
                setData(statsData);
                setLastSync(new Date().toLocaleTimeString());
            } catch (err) {
                console.warn('Could not fetch admin stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
        const interval = setInterval(() => setLastSync(new Date().toLocaleTimeString()), 60000);
        return () => clearInterval(interval);
    }, [dateRange]);

    if (loading && !data) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <Activity className="animate-pulse text-blue-600" size={48} />
                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest animate-pulse">Analyzing Platform Data...</p>
            </div>
        );
    }

    if (!data) return <div className="text-center p-8 text-slate-500 font-bold">Failed to load platform analytics. Please refresh.</div>;

    const primaryCards = [
        { 
            label: 'Total Revenue', 
            value: formatINR(data.overview?.totalRevenue || 0), 
            desc: 'Paid successful orders only', 
            icon: IndianRupee,
            onClick: handleRevenueCardClick
        },
        { label: 'Net Revenue', value: formatINR(data.overview?.netRevenue || 0), desc: 'After processing refunds', icon: Activity },
        { 
            label: 'Platform Earnings', 
            value: formatINR(data.overview?.platformEarnings || 0), 
            desc: `Platform Commission (${data.settings?.platformCommissionRate !== undefined ? data.settings.platformCommissionRate : 10}%) - Click to view calculations`, 
            icon: CreditCard,
            onClick: handlePlatformEarningsClick
        },
        { label: 'Total Orders', value: (data.overview?.totalOrders || 0).toLocaleString(), desc: 'Processing / Shipped / Delivered', icon: ShoppingBag }
    ];

    // Filter orders by search query
    const filteredRevenueOrders = orders.filter(o => {
        const query = ordersSearch.toLowerCase();
        const customerName = (o.customerName || '').toLowerCase();
        const customerEmail = (o.customerEmail || '').toLowerCase();
        const orderId = (o.id || '').toLowerCase();
        const hasMatchingProduct = o.items && o.items.some(item => (item.name || '').toLowerCase().includes(query));
        return customerName.includes(query) || customerEmail.includes(query) || orderId.includes(query) || hasMatchingProduct;
    });

    const filteredCommissionOrders = orders.filter(o => {
        const query = commissionSearch.toLowerCase();
        const customerName = (o.customerName || '').toLowerCase();
        const orderId = (o.id || '').toLowerCase();
        const hasMatchingProduct = o.items && o.items.some(item => (item.name || '').toLowerCase().includes(query));
        return customerName.includes(query) || orderId.includes(query) || hasMatchingProduct;
    });

    const secondaryCards = [
        { label: 'Avg Order Value (AOV)', value: formatINR(data.overview?.aov || 0), desc: 'Based on successful orders', icon: TrendingUp },
        { label: 'Platform Users', value: (data.overview?.totalUsers || 0).toLocaleString(), desc: 'Registered Customers', icon: Users },
        { label: 'Active Sellers', value: (data.overview?.totalSellers || 0).toLocaleString(), desc: 'Verified Merchant accounts', icon: Store },
    ];

    return (
        <div className="space-y-6 font-sans pb-12 animate-fade-in">
            {/* Header & Filters */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-[1000] text-slate-900 tracking-tight">Revenue Analytics</h1>
                    <p className="text-sm text-slate-500 mt-1 font-bold">Real-time financial performance and platform insights.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group cursor-pointer inline-flex items-center gap-2 bg-white px-4 py-2.5 rounded-[12px] border border-gray-100 text-[13px] text-gray-900 font-bold shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:bg-gray-50 transition-colors">
                        <Calendar size={16} className="text-gray-900" />
                        {dateRange}
                        <Filter size={14} className="ml-2 text-gray-900" />
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white/90 backdrop-blur-xl border border-gray-100 rounded-[12px] shadow-[0_12px_48px_rgba(0,0,0,0.1)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 py-2">
                            {['All Time', 'Today', 'Last 7 Days', 'This Month', 'Last Month'].map(t => (
                                <button key={t} onClick={() => setDateRange(t)} className="w-full text-left px-5 py-2.5 text-[13px] text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-bold transition-colors">{t}</button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-white px-3 py-2.5 rounded-[12px] border border-gray-100 text-xs text-gray-500 font-bold shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        <span>Synced: {lastSync}</span>
                    </div>
                </div>
            </div>

            {/* Row 1: Primary Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {primaryCards.map((stat, i) => <StatCard key={i} stat={stat} onClick={stat.onClick} />)}
            </div>

            {/* Row 2: Secondary Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {secondaryCards.map((stat, i) => (
                    <div key={i} className="bg-white px-6 py-5 rounded-[24px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex items-center gap-4 group hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)] transition-all">
                        <div className="p-3 bg-gray-50 border border-gray-100 rounded-[16px] group-hover:bg-blue-600 transition-all">
                            <stat.icon size={20} className="text-gray-700 group-hover:text-white transition-colors" strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            <h3 className="text-[22px] font-black text-gray-900 tracking-tight leading-tight mt-0.5">{stat.value}</h3>
                            <p className="text-[11px] text-gray-400 font-bold mt-0.5">{stat.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Middle Section: Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Revenue Trend - Fixed Rendering */}
                <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-3xl -z-10"></div>
                    <div className="mb-8">
                        <h2 className="text-xl font-[1000] text-slate-900 tracking-tight">Monthly Revenue Trend</h2>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Growth trajectories</p>
                    </div>
                    <div style={{ width: '100%', height: 300 }}>
                        {data.charts?.monthlyRevenue && data.charts.monthlyRevenue.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.charts.monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} tickFormatter={(val) => `₹${val/1000}k`} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                        formatter={(val) => [formatINR(val), 'Revenue']}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" animationDuration={1500} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : <div className="h-full flex items-center justify-center text-slate-400 font-bold">No history available</div>}
                    </div>
                </div>

                {/* Category Revenue Breakdown - Fixed Rendering */}
                <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-full blur-3xl -z-10"></div>
                    <div className="mb-8">
                        <h2 className="text-xl font-[1000] text-slate-900 tracking-tight">Category Volume Splice</h2>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Earnings by vertical</p>
                    </div>
                    <div style={{ width: '100%', height: 300 }}>
                        {data.charts?.categoryBreakdown && data.charts.categoryBreakdown.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.charts.categoryBreakdown.slice(0, 6)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }} tickFormatter={(val) => `₹${val/1000}k`} />
                                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} formatter={(val) => [formatINR(val), 'Revenue']} />
                                    <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} animationDuration={1500} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <div className="h-full flex items-center justify-center text-slate-400 font-bold">No vertical data</div>}
                    </div>
                </div>
            </div>

            {/* Bottom Section: Tables Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Sellers */}
                <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Top Sellers</h2>
                        <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg uppercase tracking-widest">By Revenue</span>
                    </div>
                    <div className="p-3 space-y-1">
                        {data.leaderboards?.topSellers?.slice(0, 5).map((s, i) => (
                            <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50/80 rounded-xl transition-all gap-3 group">
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${
                                        i === 0 ? 'bg-amber-100 text-amber-800' :
                                        i === 1 ? 'bg-slate-100 text-slate-700' :
                                        i === 2 ? 'bg-amber-50 text-amber-700' :
                                        'bg-slate-50 text-slate-400'
                                    }`}>
                                        {i + 1}
                                    </span>
                                    <span className="text-xs font-bold text-slate-700 truncate group-hover:text-slate-900 transition-colors">{s.name}</span>
                                </div>
                                <span className="text-xs font-black text-slate-900 shrink-0">{formatINR(s.revenue)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Top Products</h2>
                        <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg uppercase tracking-widest">By Revenue</span>
                    </div>
                    <div className="p-3 space-y-1">
                        {data.leaderboards?.topProductsRev?.slice(0, 5).map((p, i) => (
                            <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50/80 rounded-xl transition-all gap-3 group">
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${
                                        i === 0 ? 'bg-amber-100 text-amber-800' :
                                        i === 1 ? 'bg-slate-100 text-slate-700' :
                                        i === 2 ? 'bg-amber-50 text-amber-700' :
                                        'bg-slate-50 text-slate-400'
                                    }`}>
                                        {i + 1}
                                    </span>
                                    <span className="text-xs font-bold text-slate-700 truncate group-hover:text-slate-900 transition-colors" title={p.name}>{p.name}</span>
                                </div>
                                <span className="text-xs font-black text-slate-900 shrink-0">{formatINR(p.revenue)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Category Stats */}
                <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all">
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Category Stats</h2>
                        <span className="text-[9px] font-black bg-amber-50 text-amber-600 px-2.5 py-1 rounded-lg uppercase tracking-widest">Volume Flow</span>
                    </div>
                    <div className="p-3 space-y-1">
                        {data.charts?.categoryBreakdown?.slice(0, 5).map((c, i) => (
                            <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50/80 rounded-xl transition-all gap-3 group">
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${
                                        i === 0 ? 'bg-amber-100 text-amber-800' :
                                        i === 1 ? 'bg-slate-100 text-slate-700' :
                                        i === 2 ? 'bg-amber-50 text-amber-700' :
                                        'bg-slate-50 text-slate-400'
                                    }`}>
                                        {i + 1}
                                    </span>
                                    <span className="text-xs font-bold text-slate-700 truncate group-hover:text-slate-900 transition-colors">{c.name}</span>
                                </div>
                                <span className="text-xs font-black text-slate-900 shrink-0">{formatINR(c.revenue)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Revenue Purchase Details Modal */}
            {showRevenueModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[999] flex items-start justify-center p-4 pt-10 md:pt-[6vh] transition-all duration-300 animate-fade-in">
                    <div className="bg-white border border-slate-200/80 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-full max-w-5xl h-[78vh] flex flex-col overflow-hidden animate-slide-up">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/40">
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl">
                                        <IndianRupee size={22} className="stroke-[2.5]" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-[1000] text-slate-900 tracking-tight">Revenue Purchase Details</h3>
                                        <p className="text-xs text-slate-500 font-bold mt-0.5">List of users and products contributing to platform revenue.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Search Input Wrapper with matching height */}
                                <div className="relative w-full sm:w-64 h-10">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search user, product, order ID..."
                                        value={ordersSearch}
                                        onChange={(e) => setOrdersSearch(e.target.value)}
                                        className="w-full h-full pl-10 pr-8 rounded-xl bg-white border border-slate-200 text-xs font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                                    />
                                    {ordersSearch && (
                                        <button onClick={() => setOrdersSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>

                                {/* Close Button with matching height/width */}
                                <button
                                    onClick={() => setShowRevenueModal(false)}
                                    className="w-10 h-10 shrink-0 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl border border-slate-200 flex items-center justify-center transition-all hover:rotate-90 duration-300 cursor-pointer"
                                    title="Close"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                            {ordersLoading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <RefreshCw className="animate-spin text-blue-600" size={40} />
                                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">Compiling purchases ledger...</p>
                                </div>
                            ) : filteredRevenueOrders.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
                                        <ShoppingBag size={32} />
                                    </div>
                                    <h4 className="text-slate-800 font-extrabold text-base">No Matching Purchases</h4>
                                    <p className="text-slate-400 text-xs font-semibold mt-1 max-w-xs mx-auto">We couldn't find any successful purchases matching your search query.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto border border-slate-100 rounded-[20px] shadow-sm">
                                    <table className="w-full text-left border-collapse table-fixed">
                                        <thead>
                                            <tr className="bg-slate-50/60 border-b border-slate-100">
                                                <th className="px-6 py-4 w-[25%] text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Details</th>
                                                <th className="px-6 py-4 w-[15%] text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Info</th>
                                                <th className="px-6 py-4 w-[35%] text-[10px] font-black text-slate-400 uppercase tracking-widest">Purchased Products</th>
                                                <th className="px-6 py-4 w-[13%] text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment</th>
                                                <th className="px-6 py-4 w-[12%] text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total Paid</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredRevenueOrders.map((order) => {
                                                const avatarColors = [
                                                    'bg-gradient-to-tr from-blue-500 to-indigo-500 text-white',
                                                    'bg-gradient-to-tr from-emerald-500 to-teal-500 text-white',
                                                    'bg-gradient-to-tr from-rose-500 to-pink-500 text-white',
                                                    'bg-gradient-to-tr from-amber-500 to-orange-500 text-white',
                                                    'bg-gradient-to-tr from-purple-500 to-fuchsia-500 text-white'
                                                ];
                                                const hash = (order.customerName || 'G').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                                                const avatarClass = avatarColors[hash % avatarColors.length];

                                                return (
                                                    <tr key={order.id} className="hover:bg-slate-50/40 transition-colors group">
                                                        {/* Customer Details - Vertically top-aligned with start-aligned flex items */}
                                                        <td className="px-6 py-5 align-top">
                                                            <div className="flex items-start gap-3">
                                                                <div className={`w-9 h-9 rounded-full ${avatarClass} flex items-center justify-center text-[12px] font-extrabold shadow-sm shrink-0 uppercase mt-0.5`}>
                                                                    {(order.customerName || 'G')[0]}
                                                                </div>
                                                                <div className="flex flex-col min-w-0">
                                                                    <span className="font-extrabold text-slate-800 text-[13px] truncate">{order.customerName || 'Guest User'}</span>
                                                                    <span className="text-[11px] text-slate-400 font-semibold truncate lowercase mt-0.5">{order.customerEmail || 'no-email'}</span>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Order Info - Vertically top-aligned */}
                                                        <td className="px-6 py-5 align-top">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-slate-900 text-[12px] font-mono tracking-tight group-hover:text-blue-600 transition-colors mt-0.5">
                                                                    #{order.id.toString().slice(-8).toUpperCase()}
                                                                </span>
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                                    {new Date(order.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                                                </span>
                                                            </div>
                                                        </td>

                                                        {/* Products - Vertically top-aligned, clean structured cards */}
                                                        <td className="px-6 py-5 align-top max-w-sm">
                                                            <div className="flex flex-col gap-2">
                                                                {order.items?.map((item, idx) => (
                                                                    <div key={idx} className="flex items-center gap-2 bg-slate-50 border border-slate-100 p-1.5 rounded-xl">
                                                                        {item.imageUrl ? (
                                                                            <img 
                                                                                src={getImageUrl(item.imageUrl)} 
                                                                                alt={item.name} 
                                                                                className="w-8 h-8 rounded-lg object-cover shrink-0 border border-slate-200" 
                                                                                onError={(e) => { e.target.style.display = 'none'; }}
                                                                            />
                                                                        ) : (
                                                                            <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                                                                                <Package size={14} />
                                                                            </div>
                                                                        )}
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-[11px] font-bold text-slate-700 truncate" title={item.name}>{item.name}</p>
                                                                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                                                                {item.quantity} x <span className="font-mono">{formatINR(item.priceAtPurchase || item.price)}</span>
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </td>

                                                        {/* Payment - Vertically top-aligned */}
                                                        <td className="px-6 py-5 align-top">
                                                            <div className="flex flex-col gap-1.5 mt-0.5">
                                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                                                                    {order.payment?.method || order.payment_method || 'COD'}
                                                                </span>
                                                                <span className={`inline-flex self-start px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border
                                                                    ${(order.payment?.status || order.payment_status) === 'Paid' || order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}
                                                                `}>
                                                                    {(order.payment?.status || order.payment_status) === 'Paid' || order.status === 'Delivered' ? 'Paid' : 'Pending'}
                                                                </span>
                                                            </div>
                                                        </td>

                                                        {/* Total Paid - Vertically top-aligned, font-black for maximum weight */}
                                                        <td className="px-6 py-5 align-top text-right">
                                                            <span className="font-black text-slate-900 text-[14px] font-mono block mt-0.5">
                                                                {formatINR(order.pricing?.grandTotal || order.total)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center px-8 shrink-0">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                Showing {filteredRevenueOrders.length} of {orders.length} purchases
                            </span>
                            <button 
                                onClick={() => setShowRevenueModal(false)}
                                className="px-5 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer border-none"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Platform Charges Change History Modal */}
            {showChargeHistoryModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[999] flex items-start justify-center p-4 pt-10 md:pt-[6vh] transition-all duration-300 animate-fade-in">
                    <div className="bg-white border border-slate-200/80 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-full max-w-2xl h-[75vh] flex flex-col overflow-hidden animate-slide-up">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl">
                                    <ShieldCheck size={22} className="stroke-[2.5]" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-[1000] text-slate-900 tracking-tight">Platform Charges History</h3>
                                    <p className="text-xs text-slate-500 font-bold mt-0.5">Logs of all commission rate & checkout fee adjustments.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowChargeHistoryModal(false)}
                                className="w-10 h-10 shrink-0 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl border border-slate-200 flex items-center justify-center transition-all hover:rotate-90 duration-300 cursor-pointer"
                                title="Close"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                            {/* Current Active Charges Summary */}
                            <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-50 border border-slate-100 p-4 rounded-[20px] shadow-sm">
                                <div className="text-center py-1">
                                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Active Commission</span>
                                    <span className="block text-2xl font-[1000] text-blue-600 mt-2 leading-none font-mono">
                                        {data.settings?.platformCommissionRate !== undefined ? data.settings.platformCommissionRate : 10}%
                                    </span>
                                </div>
                                <div className="text-center py-1 border-l border-slate-200">
                                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Active Checkout Fee</span>
                                    <span className="block text-2xl font-[1000] text-emerald-600 mt-2 leading-none font-mono">
                                        ₹{data.settings?.platformFee !== undefined ? data.settings.platformFee : 7}
                                    </span>
                                </div>
                            </div>

                            {(!data.settings?.chargeHistory || data.settings.chargeHistory.length === 0) ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
                                        <Activity size={32} />
                                    </div>
                                    <h4 className="text-slate-800 font-extrabold text-base">No History Logs</h4>
                                    <p className="text-slate-400 text-xs font-semibold mt-1 max-w-xs mx-auto">No platform charge changes have been made yet. Default settings are active.</p>
                                </div>
                            ) : (
                                <div className="relative pl-6 border-l-2 border-slate-200 ml-4 space-y-6 py-2">
                                    {data.settings.chargeHistory.slice().reverse().map((item, idx) => {
                                        const commissionDiff = item.newCommissionRate - item.oldCommissionRate;
                                        const feeDiff = item.newFee - item.oldFee;
                                        const isCommissionChanged = commissionDiff !== 0 || item.oldCommissionRate === item.newCommissionRate; // support initial state too
                                        const isFeeChanged = feeDiff !== 0 || item.oldFee === item.newFee;

                                        return (
                                            <div key={item._id || idx} className="relative group">
                                                {/* Bullet dot on timeline */}
                                                <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-4 border-white bg-blue-600 shadow-sm transition-transform group-hover:scale-125 duration-300"></span>

                                                <div className="bg-slate-50/50 hover:bg-slate-100/70 border border-slate-100/80 rounded-2xl p-4 transition-all duration-300 shadow-sm">
                                                    {/* Meta detail */}
                                                    <div className="flex items-center justify-between mb-3 text-[10px] font-black text-slate-400 tracking-wider">
                                                        <span>{new Date(item.updatedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200/50 uppercase text-[9px] tracking-widest font-bold">Admin: {item.updatedBy || 'System'}</span>
                                                    </div>

                                                    <div className="space-y-3">
                                                        {/* Commission update log */}
                                                        {isCommissionChanged && (
                                                            <div className="flex flex-col gap-1 border-b border-dashed border-slate-200/60 pb-2">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Platform Commission</span>
                                                                    {commissionDiff !== 0 && (
                                                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${commissionDiff > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                                            {commissionDiff > 0 ? 'Hiked 📈' : 'Reduced 📉'}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-[13px] font-bold text-slate-800">
                                                                    {commissionDiff === 0 ? (
                                                                        <span>Commission initialized at <span className="text-blue-600 font-extrabold">{item.newCommissionRate}%</span></span>
                                                                    ) : (
                                                                        <span>Commission changed from <span className="text-blue-600 font-extrabold">{item.oldCommissionRate}%</span> to <span className="text-emerald-600 font-extrabold">{item.newCommissionRate}%</span></span>
                                                                    )}
                                                                </p>
                                                                {commissionDiff !== 0 && (
                                                                    <p className="text-[10px] text-slate-400 font-bold">
                                                                        Adjustment rate: <span className={commissionDiff > 0 ? 'text-rose-600' : 'text-emerald-600'}>{commissionDiff > 0 ? `+${commissionDiff}% Increase` : `${commissionDiff}% Decrease`}</span>
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Platform Fee update log */}
                                                        {isFeeChanged && (
                                                            <div className="flex flex-col gap-1">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Checkout Platform Fee</span>
                                                                    {feeDiff !== 0 && (
                                                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${feeDiff > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                                            {feeDiff > 0 ? 'Hiked 📈' : 'Reduced 📉'}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-[13px] font-bold text-slate-800">
                                                                    {feeDiff === 0 ? (
                                                                        <span>Checkout Fee initialized at <span className="text-blue-600 font-extrabold">₹{item.newFee}</span></span>
                                                                    ) : (
                                                                        <span>Checkout Fee changed from <span className="text-blue-600 font-extrabold">₹{item.oldFee}</span> to <span className="text-emerald-600 font-extrabold">₹{item.newFee}</span></span>
                                                                    )}
                                                                </p>
                                                                {feeDiff !== 0 && (
                                                                    <p className="text-[10px] text-slate-400 font-bold">
                                                                        Adjustment rate: <span className={feeDiff > 0 ? 'text-rose-600' : 'text-emerald-600'}>{feeDiff > 0 ? `+₹${feeDiff} Increase` : `-₹${Math.abs(feeDiff)} Decrease`}</span>
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end px-8 shrink-0">
                            <button
                                onClick={() => setShowChargeHistoryModal(false)}
                                className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer border-none"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Platform Commission Earnings Modal */}
            {showCommissionModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[999] flex items-start justify-center p-4 pt-10 md:pt-[6vh] transition-all duration-300 animate-fade-in">
                    <div className="bg-white border border-slate-200/80 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-full max-w-5xl h-[78vh] flex flex-col overflow-hidden animate-slide-up">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/40">
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl">
                                        <CreditCard size={22} className="stroke-[2.5]" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-[1000] text-slate-900 tracking-tight">Platform Commission Ledger</h3>
                                        <p className="text-xs text-slate-500 font-bold mt-0.5">Calculated commission earned from every product sale transaction.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="relative w-full sm:w-64 h-10">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search customer, product, order ID..."
                                        value={commissionSearch}
                                        onChange={(e) => setCommissionSearch(e.target.value)}
                                        className="w-full h-full pl-10 pr-8 rounded-xl bg-white border border-slate-200 text-xs font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                                    />
                                    {commissionSearch && (
                                        <button onClick={() => setCommissionSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>

                                <button
                                    onClick={() => setShowCommissionModal(false)}
                                    className="w-10 h-10 shrink-0 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl border border-slate-200 flex items-center justify-center transition-all hover:rotate-90 duration-300 cursor-pointer"
                                    title="Close"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                            {ordersLoading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <RefreshCw className="animate-spin text-blue-600" size={40} />
                                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">Compiling commission ledger...</p>
                                </div>
                            ) : filteredCommissionOrders.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
                                        <Package size={32} />
                                    </div>
                                    <h4 className="text-slate-800 font-extrabold text-base">No Commission Records</h4>
                                    <p className="text-slate-400 text-xs font-semibold mt-1 max-w-xs mx-auto">We couldn't find any transaction calculations matching your search.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto border border-slate-100 rounded-[20px] shadow-sm">
                                    <table className="w-full text-left border-collapse table-fixed">
                                        <thead>
                                            <tr className="bg-slate-50/60 border-b border-slate-100">
                                                <th className="px-6 py-4 w-[20%] text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer & Order ID</th>
                                                <th className="px-6 py-4 w-[30%] text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Info</th>
                                                <th className="px-6 py-4 w-[15%] text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Price</th>
                                                <th className="px-6 py-4 w-[12%] text-[10px] font-black text-slate-400 uppercase tracking-widest">Commission Rate</th>
                                                <th className="px-6 py-4 w-[11%] text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Earned</th>
                                                <th className="px-6 py-4 w-[12%] text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Seller Share</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredCommissionOrders.map((order) => {
                                                const commRate = data.settings?.platformCommissionRate !== undefined ? data.settings.platformCommissionRate : 10;
                                                
                                                return order.items?.map((item, idx) => {
                                                    const itemPrice = item.priceAtPurchase || item.price || 0;
                                                    const lineTotal = itemPrice * item.quantity;
                                                    const commissionEarned = lineTotal * (commRate / 100);
                                                    const sellerPayout = lineTotal - commissionEarned;

                                                    return (
                                                        <tr key={`${order.id}-${idx}`} className="hover:bg-slate-50/40 transition-colors group">
                                                            {/* Customer Details */}
                                                            <td className="px-6 py-4 align-top">
                                                                <div className="flex flex-col">
                                                                    <span className="font-extrabold text-slate-800 text-[13px]">{order.customerName || 'Guest User'}</span>
                                                                    <span className="text-[11px] text-slate-400 font-semibold font-mono mt-0.5">#{order.id.toString().slice(-8).toUpperCase()}</span>
                                                                </div>
                                                            </td>

                                                            {/* Purchased Product */}
                                                            <td className="px-6 py-4 align-top max-w-xs">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                                                        <Package size={14} />
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="text-[12px] font-bold text-slate-700 truncate" title={item.name}>{item.name}</p>
                                                                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">Seller: {item.sellerId?.businessName || item.seller_id?.businessName || 'Platform Seller'}</p>
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            {/* Product Price & Qty */}
                                                            <td className="px-6 py-4 align-top">
                                                                <div className="flex flex-col">
                                                                    <span className="font-extrabold text-slate-900 text-[13px] font-mono">{formatINR(itemPrice)}</span>
                                                                    <span className="text-[10px] text-slate-400 font-semibold mt-0.5">Qty: {item.quantity} (Total: {formatINR(lineTotal)})</span>
                                                                </div>
                                                            </td>

                                                            {/* Commission Rate */}
                                                            <td className="px-6 py-4 align-top">
                                                                <span className="inline-flex px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-black uppercase tracking-wider font-mono border border-blue-100/50">
                                                                    {commRate}%
                                                                </span>
                                                            </td>

                                                            {/* Commission Earned (₹) */}
                                                            <td className="px-6 py-4 align-top">
                                                                <span className="font-black text-rose-600 text-[14px] font-mono">
                                                                    {formatINR(commissionEarned)}
                                                                </span>
                                                            </td>

                                                            {/* Seller Share (₹) */}
                                                            <td className="px-6 py-4 align-top text-right">
                                                                <span className="font-extrabold text-slate-900 text-[13px] font-mono">
                                                                    {formatINR(sellerPayout)}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                });
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center px-8 shrink-0">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                Platform Earnings Details
                            </span>
                            <button
                                onClick={() => setShowCommissionModal(false)}
                                className="px-5 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer border-none"
                            >
                                Close Ledger
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slide-up { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
                .animate-slide-up { animation: slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>
        </div>
    );
}

// --- Components ---

function StatCard({ stat, onClick }) {
    const isClickable = !!onClick;
    return (
        <div 
            onClick={onClick}
            className={`bg-white p-6 rounded-[24px] border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)] transition-all flex flex-col justify-between group relative overflow-hidden ${isClickable ? 'cursor-pointer hover:-translate-y-1 hover:border-blue-200 active:scale-[0.98]' : 'cursor-default'}`}
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="flex items-start justify-between relative z-10">
                <div className={`p-3 bg-gray-50 border border-gray-100 rounded-2xl transition-all ${isClickable ? 'group-hover:bg-blue-600' : 'group-hover:bg-gray-900'}`}>
                    <stat.icon size={22} className="text-gray-900 group-hover:text-white transition-all" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col items-end">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-right max-w-[100%] leading-tight group-hover:text-gray-900 transition-colors">{stat.label}</p>
                    {isClickable && (
                        <span className="text-[9px] font-black text-blue-500 mt-1 uppercase tracking-widest group-hover:underline">Click for details</span>
                    )}
                </div>
            </div>
            <div className="mt-8 relative z-10">
                <h3 className="text-[28px] xl:text-[32px] font-black text-gray-900 tracking-tight leading-none mb-2">{stat.value}</h3>
                <p className="text-[12px] text-gray-500 font-bold">{stat.desc}</p>
            </div>
        </div>
    );
}
