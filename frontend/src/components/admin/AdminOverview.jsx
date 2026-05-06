import React, { useState, useEffect } from 'react';
import {
    TrendingUp, TrendingDown, Users, ShoppingBag, IndianRupee, 
    Package, Store, Activity, CreditCard, ArrowRightLeft, 
    RefreshCcw, Calendar, Filter
} from 'lucide-react';
import { getAdminStats } from '../../api/adminApi';
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
        { label: 'Total Revenue', value: formatINR(data.overview?.totalRevenue || 0), desc: 'Paid successful orders only', icon: IndianRupee },
        { label: 'Net Revenue', value: formatINR(data.overview?.netRevenue || 0), desc: 'After processing refunds', icon: Activity },
        { label: 'Platform Earnings', value: formatINR(data.overview?.platformEarnings || 0), desc: 'Platform Commission (10%)', icon: CreditCard },
        { label: 'Total Orders', value: (data.overview?.totalOrders || 0).toLocaleString(), desc: 'Processing / Shipped / Delivered', icon: ShoppingBag },
    ];

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
                {primaryCards.map((stat, i) => <StatCard key={i} stat={stat} />)}
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
                <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-slate-50 flex justify-between items-center">
                        <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">Top Sellers</h2>
                        <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg uppercase tracking-wider">By Revenue</span>
                    </div>
                    <div className="p-2">
                        {data.leaderboards?.topSellers?.slice(0, 5).map((s, i) => (
                            <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                                <span className="text-sm font-bold text-slate-700 truncate max-w-[150px]">{s.name}</span>
                                <span className="text-sm font-black text-slate-900">{formatINR(s.revenue)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-slate-50 flex justify-between items-center">
                        <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">Top Products</h2>
                        <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg uppercase tracking-wider">By Revenue</span>
                    </div>
                    <div className="p-2">
                        {data.leaderboards?.topProductsRev?.slice(0, 5).map((p, i) => (
                            <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                                <span className="text-sm font-bold text-slate-700 truncate max-w-[150px]">{p.name}</span>
                                <span className="text-sm font-black text-slate-900">{formatINR(p.revenue)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Category Breakdown */}
                <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-slate-50 flex justify-between items-center">
                        <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">Category Stats</h2>
                        <span className="text-[10px] font-black bg-amber-50 text-amber-600 px-2.5 py-1 rounded-lg uppercase tracking-wider">Volume Flow</span>
                    </div>
                    <div className="p-2">
                        {data.charts?.categoryBreakdown?.slice(0, 5).map((c, i) => (
                            <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                                <span className="text-sm font-bold text-slate-700">{c.name}</span>
                                <span className="text-sm font-black text-slate-900">{formatINR(c.revenue)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
}

// --- Components ---

function StatCard({ stat }) {
    return (
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group cursor-default relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="flex items-start justify-between relative z-10">
                <div className="p-3 bg-gray-50 border border-gray-100 rounded-2xl group-hover:bg-gray-900 transition-all">
                    <stat.icon size={22} className="text-gray-900 group-hover:text-white transition-all" strokeWidth={2.5} />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-right max-w-[50%] leading-tight group-hover:text-gray-900 transition-colors">{stat.label}</p>
            </div>
            <div className="mt-8 relative z-10">
                <h3 className="text-[32px] font-black text-gray-900 tracking-tighter leading-none mb-2">{stat.value}</h3>
                <p className="text-[12px] text-gray-500 font-bold">{stat.desc}</p>
            </div>
        </div>
    );
}
