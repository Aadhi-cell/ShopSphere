import React, { useState, useEffect } from 'react';
import {
    TrendingUp, IndianRupee, ShoppingCart, PackageOpen, XCircle,
    ArrowUpRight, ArrowDownRight, Activity, Calendar, Tag, User,
    AlertCircle, CheckCircle2, ShoppingBag, Loader2
} from 'lucide-react';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie,
    Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { getAdminStats } from '../../api/adminApi';

const formatINR = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);
const formatNumber = (num) => new Intl.NumberFormat('en-IN').format(num || 0);

// Colors for diagrams
const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b', '#ec4899', '#14b8a6'];

// Glass Panel Card Style
const Card = ({ children, className = '' }) => (
    <div className={`bg-white/70 backdrop-blur-xl border border-slate-200/60 shadow-sm rounded-2xl p-6 ${className}`}>
        {children}
    </div>
);

// Metric Card
const MetricCard = ({ title, value, icon: Icon, trend, trendValue, colorClass }) => (
    <Card className="flex flex-col relative overflow-hidden group">
        <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 ${colorClass.bg} group-hover:scale-150 transition-transform duration-500`} />
        <div className="flex justify-between items-start mb-4 relative z-10">
            <div className={`p-3 rounded-xl ${colorClass.bg} ${colorClass.text}`}>
                <Icon size={24} strokeWidth={2} />
            </div>
            {trendValue && (
                <div className={`flex items-center gap-1 text-sm font-bold px-2.5 py-1 rounded-full ${trend === 'up' ? 'text-emerald-700 bg-emerald-100' : 'text-rose-700 bg-rose-100'}`}>
                    {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {trendValue}
                </div>
            )}
        </div>
        <div className="relative z-10">
            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">{title}</h3>
            <h2 className="text-3xl font-[900] text-slate-900 tracking-tight">{value}</h2>
        </div>
    </Card>
);

// --- TABS ---

// 1. Overview Tab
function OverviewTab({ stats }) {
    if (!stats || !stats.overview) return <div className="p-8 text-center text-slate-500 font-bold">No Data Available</div>;
    const { overview } = stats;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Financials Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard title="Total Gross Revenue" value={formatINR(overview.totalRevenue)} icon={IndianRupee} colorClass={{ bg: 'bg-blue-100', text: 'text-blue-600' }} />
                <MetricCard title="Net Revenue" value={formatINR(overview.netRevenue)} icon={TrendingUp} colorClass={{ bg: 'bg-emerald-100', text: 'text-emerald-600' }} />
                <MetricCard title="Platform Earnings" value={formatINR(overview.platformEarnings)} icon={Activity} colorClass={{ bg: 'bg-violet-100', text: 'text-violet-600' }} />
            </div>

            {/* Orders Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard title="Total Orders" value={formatNumber(overview.totalOrders)} icon={ShoppingCart} colorClass={{ bg: 'bg-slate-100', text: 'text-slate-600' }} />
                <MetricCard title="Delivered" value={formatNumber(overview.deliveredOrders)} icon={CheckCircle2} colorClass={{ bg: 'bg-emerald-100', text: 'text-emerald-600' }} />
                <MetricCard title="Processing/Shipped" value={formatNumber(overview.processingOrders)} icon={PackageOpen} colorClass={{ bg: 'bg-amber-100', text: 'text-amber-600' }} />
                <MetricCard title="Cancelled/Returned" value={formatNumber(overview.cancelledOrders)} icon={XCircle} colorClass={{ bg: 'bg-rose-100', text: 'text-rose-600' }} />
            </div>
        </div>
    );
}

// 2. Sales Analytics Tab
function SalesAnalyticsTab({ stats }) {
    if (!stats || !stats.charts) return <div className="p-8 text-center text-slate-500 font-bold">No Data Available</div>;

    const { overview, charts } = stats;

    // Formatting Status Data for Donut
    const statusData = Object.entries(overview.orderStatusCounts || {}).map(([name, value], i) => ({
        name, value, color: COLORS[i % COLORS.length]
    })).filter(s => s.value > 0);

    // Formatting Payment Data
    const paymentTotal = Object.values(overview.paymentMethodCounts || {}).reduce((a, b) => a + b, 0);

    return (
        <div className="space-y-6 animate-fade-in cursor-default">
            {/* Top Row: Trend Chart & Donut */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Line Chart */}
                <Card className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-[800] text-slate-800">Sales Trend</h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={charts.salesTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} dy={10} />
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} tickFormatter={(val) => `₹${val / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => [formatINR(value), "Revenue"]}
                                />
                                <Area yAxisId="left" type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Donut Chart */}
                <Card>
                    <h3 className="text-lg font-[800] text-slate-800 mb-6">Orders by Status</h3>
                    <div className="h-[240px] w-full relative">
                        {statusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData} cx="50%" cy="50%"
                                        innerRadius={70} outerRadius={90}
                                        paddingAngle={5} dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-slate-400 font-bold">No Order Data</div>
                        )}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-[900] text-slate-800">{overview.totalOrders}</span>
                            <span className="text-xs font-bold text-slate-400 tracking-wider">TOTAL</span>
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                        {statusData.map(s => (
                            <div key={s.name} className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                                <div className="w-3 h-3 rounded-full" style={{ background: s.color }} /> {s.name} ({Math.round((s.value / overview.totalOrders) * 100)}%)
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Bottom Row: Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-none">
                    <div>
                        <p className="text-blue-100 text-sm font-bold uppercase tracking-wider">Average Order Value</p>
                        <h4 className="text-3xl font-[900] mt-1">{formatINR(overview.aov)}</h4>
                    </div>
                    <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md">
                        <ShoppingBag size={28} className="text-white" />
                    </div>
                </Card>
                <Card className="flex items-center justify-between">
                    <div>
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Active Customers</p>
                        <h4 className="text-3xl font-[900] text-slate-900 mt-1">{formatNumber(overview.totalUsers)}</h4>
                    </div>
                    <div className="p-4 bg-emerald-100 rounded-2xl text-emerald-600">
                        <User size={28} />
                    </div>
                </Card>
                <Card className="flex flex-col justify-center">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Payment Methods</h3>
                    <div className="space-y-3">
                        {Object.entries(overview.paymentMethodCounts || {}).map(([method, count], i) => {
                            const pct = paymentTotal > 0 ? Math.round((count / paymentTotal) * 100) : 0;
                            const colors = ['bg-blue-500', 'bg-violet-500', 'bg-amber-500'];
                            return (
                                <div key={method}>
                                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1"><span>{method}</span> <span>{pct}%</span></div>
                                    <div className="w-full bg-slate-100 rounded-full h-2"><div className={`${colors[i % colors.length]} h-2 rounded-full`} style={{ width: `${pct}%` }}></div></div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>
        </div>
    );
}

// 3. Revenue & Earnings Tab
function RevenueEarningsTab({ stats }) {
    if (!stats || !stats.leaderboards) return <div className="p-8 text-center text-slate-500 font-bold">No Data Available</div>;

    const { charts, leaderboards } = stats;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue by Category Bar Chart */}
                <Card>
                    <h3 className="text-lg font-[800] text-slate-800 mb-6">Revenue by Category</h3>
                    <div className="h-[300px] w-full">
                        {charts.categoryBreakdown.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={charts.categoryBreakdown} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} tickFormatter={(val) => `₹${val / 1000}k`} />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#334155', fontWeight: 700 }} />
                                    <Tooltip
                                        cursor={{ fill: '#f1f5f9' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                        formatter={(value) => formatINR(value)}
                                    />
                                    <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex justify-center items-center h-full font-bold text-slate-400">No category sales data</div>
                        )}
                    </div>
                </Card>

                {/* Seller Revenue List */}
                <Card>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-[800] text-slate-800">Top Earning Sellers</h3>
                    </div>
                    <div className="space-y-4">
                        {leaderboards.topSellers.length > 0 ? leaderboards.topSellers.map((seller, i) => (
                            <div key={seller.name + i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 line-clamp-1">{seller.name}</h4>
                                        <p className="text-xs font-semibold text-slate-500">{seller.sales} sales completed</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-black text-slate-900">{formatINR(seller.revenue)}</div>
                                    <div className="text-xs font-bold text-emerald-600">+{formatINR(seller.revenue * 0.10)} (Platform)</div>
                                </div>
                            </div>
                        )) : <div className="py-8 text-center font-bold text-slate-400">No seller data</div>}
                    </div>
                </Card>
            </div>

            <Card>
                <h3 className="text-lg font-[800] text-slate-800 mb-6">Top 10 Highest Grossing Products</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="pb-3 text-xs font-black text-slate-400 uppercase tracking-widest">Rank</th>
                                <th className="pb-3 text-xs font-black text-slate-400 uppercase tracking-widest">Product Name</th>
                                <th className="pb-3 text-xs font-black text-slate-400 uppercase tracking-widest">Category</th>
                                <th className="pb-3 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Total Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {leaderboards.topProductsRev.length > 0 ? leaderboards.topProductsRev.map((prod, index) => (
                                <tr key={prod.name + index} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-4 font-bold text-slate-500">#{index + 1}</td>
                                    <td className="py-4 font-bold text-slate-900"><span className="line-clamp-1">{prod.name}</span></td>
                                    <td className="py-4"><span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-bold">{prod.category}</span></td>
                                    <td className="py-4 font-black text-slate-900 text-right">{formatINR(prod.revenue)}</td>
                                </tr>
                            )) : <tr><td colSpan="4" className="py-8 text-center font-bold text-slate-400">No products sold yet</td></tr>}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

// 4. Top Performance Tab
function TopPerformanceTab({ stats }) {
    if (!stats || !stats.leaderboards) return <div className="p-8 text-center text-slate-500 font-bold">No Data Available</div>;
    const { leaderboards } = stats;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-lg font-[800] text-slate-800 mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-blue-500" />
                        Products By Volume Sold (Top 10)
                    </h3>
                    <div className="space-y-4">
                        {leaderboards.topProductsQty.length > 0 ? leaderboards.topProductsQty.map((item, i) => (
                            <div key={item.name + i} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                                <div className="flex gap-3 items-center">
                                    <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm min-w-8">{i + 1}</span>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm line-clamp-1 pr-2">{item.name}</h4>
                                        <p className="text-xs text-slate-500 font-semibold">{item.category}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-slate-900">{formatNumber(item.qty)} <span className="text-xs text-slate-500 font-bold">units</span></p>
                                </div>
                            </div>
                        )) : <div className="text-center py-8 font-bold text-slate-400">No volume data</div>}
                    </div>
                </Card>

                <Card className="border-rose-100 bg-rose-50/30">
                    <h3 className="text-lg font-[800] text-slate-800 mb-6 flex items-center gap-2">
                        <AlertCircle size={20} className="text-rose-500" />
                        Low Stock / Out of Stock Alerts
                    </h3>
                    <div className="space-y-3">
                        {leaderboards.lowStockProducts.length > 0 ? leaderboards.lowStockProducts.map((item) => (
                            <div key={item.id} className="flex justify-between items-start bg-white border border-rose-100 p-3 rounded-xl shadow-sm gap-2">
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{item.name}</h4>
                                    <p className="text-xs text-slate-500 font-semibold mt-1">Seller: {item.seller}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-2 py-1 text-[10px] font-black uppercase rounded-md whitespace-nowrap ${item.stock === 0 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {item.status} ({item.stock})
                                    </span>
                                </div>
                            </div>
                        )) : <div className="text-center py-8 font-bold text-emerald-500">All products have good stock levels!</div>}
                    </div>
                </Card>
            </div>

        </div>
    );
}

// -------------------------------------------------------------
// MAIN CONTAINER & FILTERS
// -------------------------------------------------------------

function AnalyticsFilters({ activeFilter, setActiveFilter }) {

    const filters = ['All Time', 'Today', 'Last 7 Days', 'This Month', 'Last Month'];

    return (
        <div className="bg-white/50 backdrop-blur-xl p-4 rounded-3xl border border-white shadow-sm mb-8 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-slate-500" />
                    <select
                        className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm font-bold text-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        value={activeFilter}
                        onChange={(e) => setActiveFilter(e.target.value)}
                    >
                        {filters.map(f => (
                            <option key={f} value={f}>{f}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div>
                <button className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-slate-800 transition-colors pointer-events-none opacity-50">
                    Export Report (Pro)
                </button>
            </div>
        </div>
    );
}

export default function AnalyticsManager({ activeSubTab }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState('All Time');
    const [error, setError] = useState(null);
    const [localTab, setLocalTab] = useState(null);

    useEffect(() => {
        fetchStats();
    }, [dateFilter]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const data = await getAdminStats(dateFilter);
            setStats(data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch analytics:", err);
            setError("Failed to load analytics data.");
        } finally {
            setLoading(false);
        }
    };

    const titleMap = {
        'analytics-overview': { label: 'Overview', title: 'Platform Overview', sub: 'High-level snapshot of performance.' },
        'analytics-sales': { label: 'Sales', title: 'Sales Analytics', sub: 'Deep dive into transaction trends.' },
        'analytics-revenue': { label: 'Revenue', title: 'Revenue & Earnings', sub: 'Financial breakdown by categories.' },
        'analytics-performance': { label: 'Leaderboard', title: 'Top Performance', sub: 'Leaderboards and stock alerts.' }
    };

    const currentTabId = localTab || (activeSubTab && activeSubTab !== 'analytics' ? activeSubTab : 'analytics-overview');
    const headerInfo = titleMap[currentTabId] || titleMap['analytics-overview'];

    return (
        <div className="flex flex-col h-full min-h-[800px]">
            {/* Dynamic Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-[1000] text-slate-900 mb-1 tracking-tight">{headerInfo.title}</h2>
                    <p className="text-slate-500 font-semibold">{headerInfo.sub}</p>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={fetchStats} className="bg-white border-slate-200 border px-4 py-2 rounded-xl text-sm font-bold text-slate-600 shadow-sm flex items-center gap-2 hover:bg-slate-50 h-10">
                        <Activity size={16} /> Sync
                    </button>
                    <div className="h-10 bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200">
                        {Object.entries(titleMap).map(([id, info]) => (
                            <button
                                key={id}
                                onClick={() => setLocalTab(id)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${currentTabId === id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                {info.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Global Filters Bar */}
            <AnalyticsFilters activeFilter={dateFilter} setActiveFilter={setDateFilter} />

            {/* Content with Loading State */}
            {loading ? (
                <div className="flex items-center justify-center flex-1 py-32">
                    <div className="flex flex-col items-center">
                        <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
                        <h3 className="text-slate-600 font-bold text-lg animate-pulse">Calculating Realtime Metrics...</h3>
                    </div>
                </div>
            ) : error ? (
                <div className="p-8 text-center text-rose-500 font-bold">{error}</div>
            ) : (
                <>
                    {/* Tab Routing */}
                    {currentTabId === 'analytics-overview' && <OverviewTab stats={stats} />}
                    {currentTabId === 'analytics-sales' && <SalesAnalyticsTab stats={stats} />}
                    {currentTabId === 'analytics-revenue' && <RevenueEarningsTab stats={stats} />}
                    {currentTabId === 'analytics-performance' && <TopPerformanceTab stats={stats} />}
                </>
            )}

        </div>
    );
}
