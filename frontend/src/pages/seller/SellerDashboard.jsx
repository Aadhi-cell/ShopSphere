import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getDashboardStats, getSellerProducts, toggleProductPause, getSellerOrders, updateOrderStatus, updateOrderTracking, handleOrderReturn, getNotifications, markNotificationsRead } from '../../api/sellerApi';
import { useSellerAuth } from '../../contexts/SellerAuthContext';
import {
    Package,
    IndianRupee,
    ShoppingCart,
    TrendingUp,
    AlertCircle,
    Clock,
    CheckCircle,
    XCircle,
    Plus,
    BarChart3,
    ArrowRight,
    Search,
    Filter,
    Layers,
    History,
    ChevronRight,
    LayoutGrid,
    Settings,
    ShieldCheck,
    Edit,
    Trash2,
    Truck,
    MapPin,
    User,
    Calendar,
    CreditCard,
    MoreVertical,
    Landmark,
    Wallet,
    Star,
    LogOut,
    Store,
    Bell,
    X,
    MessageSquare,
    Menu,
    CheckCircle2,
    ShieldAlert
} from 'lucide-react';

import StatsCard from '../../components/seller/StatsCard';
import SectionHeader from '../../components/seller/SectionHeader';
import OrderStatusBadge from '../../components/seller/OrderStatusBadge';
import EmptyState from '../../components/seller/EmptyState';
import SellerSupport from '../../components/seller/SellerSupport';
import InventoryTab from '../../components/seller/InventoryTab';
import PromotionsTab from '../../components/seller/PromotionsTab';
import Logo from '../../components/common/Logo';
import { getImageUrl } from '../../utils/imageConfig';
import { socket } from '../../utils/socket';

export default function SellerDashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const { seller, logoutSeller, updateSeller } = useSellerAuth();
    const queryParams = new URLSearchParams(location.search);

    const tabParam = queryParams.get('tab');
    const [activeTab, setActiveTab] = useState(tabParam || location.state?.activeTab || 'overview');
    const [profileOpen, setProfileOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const profileRef = useRef(null);
    const [notifications, setNotifications] = useState([]);
    const [bellOpen, setBellOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const bellRef = useRef(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
            if (bellRef.current && !bellRef.current.contains(e.target)) {
                setBellOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const fetchNotifications = async () => {
        try {
            const data = await getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    useEffect(() => {
        if (!seller?._id) return;
        fetchNotifications();
    }, [seller?._id, activeTab]);

    // Real-time admin message notifications
    useEffect(() => {
        if (!seller?._id) return;
        const handleNewAdminMessage = (data) => {
            fetchNotifications();
            const notif = { ...data, id: Date.now(), isRead: false, title: data.subject, message: data.preview };
            setToast(notif);
            setTimeout(() => setToast(null), 5000);
        };
        socket.on('newAdminMessage', handleNewAdminMessage);
        return () => socket.off('newAdminMessage', handleNewAdminMessage);
    }, [seller?._id]);

    const handleLogout = async () => {
        await logoutSeller();
        navigate('/seller/login');
    };
    const [stats, setStats] = useState(null);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [orderFilter, setOrderFilter] = useState('All');

    const fetchData = async () => {
        try {
            if (activeTab === 'overview') {
                const data = await getDashboardStats();
                setStats(data);
            } else if (activeTab === 'products') {
                const data = await getSellerProducts();
                setProducts(data);
            } else if (activeTab === 'orders') {
                const data = await getSellerOrders();
                setOrders(data);
            } else if (activeTab === 'analytics') {
                const [ordersData, productsData, statsData] = await Promise.all([
                    getSellerOrders(), getSellerProducts(), getDashboardStats()
                ]);
                setOrders(ordersData);
                setProducts(productsData);
                setStats(statsData);
            }
        } catch (error) {
            console.error(`Failed to fetch ${activeTab} data:`, error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchData();
    }, [activeTab]);

    // Real-time Dashboard Sync
    useEffect(() => {
        if (!seller?._id) return;

        // Join global seller room for new orders
        socket.emit('joinSellerRoom', seller._id);

        const handleRefresh = () => {
            fetchData();
        };

        const handleNewOrder = (data) => {
            fetchData();
            const notif = {
                type: 'order',
                id: Date.now(),
                title: 'New Order Received! 🎉',
                message: data.message || 'You have a new order to process.',
                orderId: data.orderId
            };
            setToast(notif);
            setTimeout(() => setToast(null), 5000);
            
            // Also refresh notifications if you store order notifs in DB
            fetchNotifications(); 
        };

        const handleStatusUpdate = (data) => {
            updateSeller({ status: data.status, rejectionReason: data.rejectionReason });
            fetchData();
        };

        socket.on('newOrder', handleNewOrder);
        socket.on('orderStatusUpdate', handleRefresh);
        socket.on('sellerStatusUpdate', handleStatusUpdate);

        return () => {
            socket.off('newOrder', handleNewOrder);
            socket.off('orderStatusUpdate', handleRefresh);
            socket.off('sellerStatusUpdate', handleStatusUpdate);
        };
    }, [seller?._id, activeTab]);

    const handleTogglePause = async (id) => {
        try {
            const res = await toggleProductPause(id);
            setProducts(products.map(p => p._id === id ? { ...p, status: res.status } : p));
        } catch (error) {
            console.error('Failed to toggle product status:', error);
            alert(error.response?.data?.message || 'Action failed. Please try again.');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const handleUpdateStatus = async (orderId, status) => {
        if (!status) {
            alert('Invalid status transition');
            return;
        }
        try {
            const res = await updateOrderStatus(orderId, status);
            setOrders(orders.map(o => o._id === orderId ? { ...o, status: res.status, timeline: res.timeline } : o));
        } catch (error) {
            console.error('Failed to update status:', error);
            alert(error.response?.data?.message || 'Failed to update status');
        }
    };

    const handleAddTracking = async (orderId) => {
        const trackingId = prompt('Enter Tracking ID:');
        if (!trackingId) return;
        try {
            await updateOrderTracking(orderId, trackingId);
            setOrders(orders.map(o => o._id === orderId ? { ...o, tracking: { ...o.tracking, trackingNumber: trackingId } } : o));
        } catch (error) {
            console.error('Failed to add tracking:', error);
        }
    };

    const nextStatusMap = {
        'Pending': 'Confirmed',
        'Confirmed': 'Packed',
        'Packed': 'Shipped',
        'Shipped': 'Delivered'
    };

    const statusColors = {
        'Pending': 'bg-amber-500',
        'Confirmed': 'bg-blue-500',
        'Packed': 'bg-indigo-500',
        'Shipped': 'bg-cyan-500',
        'Delivered': 'bg-emerald-500',
        'Cancelled': 'bg-red-500',
        'Returned': 'bg-rose-500'
    };

    const filteredOrders = orders.filter(order => {
        if (orderFilter === 'All') return true;
        if (orderFilter === 'Processing') return ['Confirmed', 'Packed'].includes(order.status);
        if (orderFilter === 'Pending') return order.status === 'Pending';
        if (orderFilter === 'Shipped') return order.status === 'Shipped';
        if (orderFilter === 'Delivered') return order.status === 'Delivered';
        if (orderFilter === 'Cancelled') return order.status === 'Cancelled';
        if (orderFilter === 'Returned') return order.status === 'Returned' || (order.return && order.return.status !== 'None');
        return true;
    });

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20">
            {/* Mobile Sidebar Overlay */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[110] md:hidden transition-opacity"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            {/* Mobile Navigation Sidebar */}
            <aside
                className={`
                    ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                    fixed top-0 left-0 bottom-0 w-[260px] bg-white z-[120] shadow-2xl transition-transform duration-300 md:hidden flex flex-col
                `}
            >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <Logo iconSize={32} textClassName="text-[18px]" onClick={() => navigate('/')} />
                    <button onClick={() => setIsMenuOpen(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-4 flex-1 overflow-y-auto">
                    <div className="text-[10px] font-bold text-slate-400 mb-3 px-2 tracking-wider uppercase">Navigation</div>
                    <div className="flex flex-col gap-1">
                        {[
                            { id: 'overview', icon: BarChart3, label: 'Performance' },
                            { id: 'products', icon: Package, label: 'Inventory' },
                            { id: 'orders', icon: History, label: 'Operations' },
                            { id: 'analytics', icon: TrendingUp, label: 'Insights' },
                            { id: 'support', icon: ShieldCheck, label: 'Support' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setIsMenuOpen(false); }}
                                className={`px-4 py-3 rounded-xl font-bold text-sm transition-colors flex items-center gap-3 w-full text-left ${activeTab === tab.id
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                    }`}
                            >
                                <tab.icon size={18} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </aside>
            {/* Toast Notification */}
            {toast && (
                <div className="fixed bottom-6 left-6 right-6 sm:left-auto sm:right-6 z-[200] sm:w-full sm:max-w-sm animate-in slide-in-from-bottom-4 duration-300">
                    <div className={`bg-white rounded-2xl shadow-2xl shadow-slate-900/15 border border-slate-200 p-4 flex items-start gap-3 ${toast.type === 'order' ? 'border-l-4 border-l-emerald-500' : ''}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${toast.type === 'order' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                            {toast.type === 'order' ? <Package size={18} /> : <MessageSquare size={18} />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="text-[12px] font-black text-slate-900">
                                    {toast.type === 'order' ? toast.title : `New reply from ${toast.senderName || 'Admin'}`}
                                </span>
                                <button onClick={() => setToast(null)} className="text-slate-300 hover:text-slate-500 shrink-0"><X size={14} /></button>
                            </div>
                            {toast.type === 'order' ? (
                                <>
                                    <p className="text-[11px] font-bold text-emerald-600 mb-0.5 truncate">{toast.message}</p>
                                    <p className="text-[11px] text-slate-500 font-medium line-clamp-1">ID: {toast.orderId}</p>
                                    <button
                                        onClick={() => { setActiveTab('orders'); setToast(null); }}
                                        className="mt-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline"
                                    >View Order →</button>
                                </>
                            ) : (
                                <>
                                    <p className="text-[11px] font-bold text-blue-600 mb-0.5 truncate">{toast.subject}</p>
                                    <p className="text-[11px] text-slate-500 font-medium line-clamp-2">{toast.preview}</p>
                                    <button
                                        onClick={() => { setActiveTab('support'); setToast(null); }}
                                        className="mt-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                                    >View Message →</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Unified FIXED Navbar — never shakes, GPU composited */}
            <div className="fixed top-0 left-0 right-0 z-[100] bg-white border-b border-slate-200 shadow-sm">
                {/* Top Section: Branding & Actions */}
                <div className="pt-4 pb-3 px-4 md:pt-6 md:pb-4 md:px-8 border-b border-slate-100 bg-white">
                    <div className="max-w-[1400px] mx-auto">

                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 md:gap-6">
                                {/* Hamburger & Logo */}
                                <div className="flex items-center gap-3 md:pr-6 md:border-r border-slate-200">
                                    <button
                                        onClick={() => setIsMenuOpen(true)}
                                        className="md:hidden p-2 -ml-2 rounded-xl bg-slate-100/50 text-slate-900 hover:bg-slate-100 transition-colors"
                                    >
                                        <Menu size={20} strokeWidth={2.5} />
                                    </button>
                                    <div className="hidden sm:block">
                                        <Logo iconSize={36} textClassName="text-[20px]" onClick={() => navigate('/')} />
                                    </div>
                                    <div className="sm:hidden flex items-center justify-center cursor-pointer" onClick={() => navigate('/')}>
                                        <Logo iconSize={28} textClassName="hidden" />
                                    </div>
                                </div>

                                {/* Text & Status - Desktop Only */}
                                <div className="hidden md:block">
                                    <h1 className="text-[22px] font-[1000] text-slate-900 tracking-tight leading-none mb-1">
                                        Seller Workspace
                                    </h1>
                                    <p className="text-slate-500 text-[11px] font-bold">
                                        Manage listings, operations and platform scale.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                {/* Desktop Actions */}
                                <div className="hidden md:flex items-center gap-3">
                                    <button
                                        onClick={() => setActiveTab('promotions')}
                                        className="px-5 py-2.5 bg-slate-50 text-slate-600 rounded-xl font-[900] text-[11px] hover:bg-slate-100 transition-all flex items-center gap-2 border border-slate-200 uppercase tracking-widest"
                                    >
                                        <Star size={14} /> Promote
                                    </button>
                                    <button
                                        onClick={() => navigate('/seller/add-product')}
                                        className="px-6 py-2.5 bg-[#2874f0] text-white rounded-xl font-[900] text-[11px] shadow-md shadow-blue-500/20 hover:bg-[#1260e0] hover:scale-105 transition-all flex items-center gap-2 active:scale-95 uppercase tracking-widest"
                                    >
                                        <Plus size={16} strokeWidth={3} /> Launch Product
                                    </button>
                                </div>

                                {/* Notification Bell */}
                                <div className="relative" ref={bellRef}>
                                    <button
                                        onClick={async () => {
                                            setBellOpen(prev => !prev);
                                            if (!bellOpen && notifications.some(n => !n.isRead)) {
                                                await markNotificationsRead();
                                                fetchNotifications();
                                            }
                                        }}
                                        className="relative w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-all shadow-sm"
                                    >
                                        <Bell size={18} strokeWidth={2} />
                                        {notifications.filter(n => !n.isRead).length > 0 && (
                                            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center animate-bounce">
                                                {notifications.filter(n => !n.isRead).length > 9 ? '9+' : notifications.filter(n => !n.isRead).length}
                                            </span>
                                        )}
                                    </button>

                                    {bellOpen && (
                                        <div className="absolute right-[-10px] sm:right-0 top-full mt-2.5 w-[280px] sm:w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-900/10 z-50 overflow-hidden">
                                            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Bell size={14} className="text-slate-500" />
                                                    <span className="font-black text-[13px] text-slate-900">Notifications</span>
                                                </div>
                                                {notifications.length > 0 && (
                                                    <button onClick={() => setNotifications([])} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors">Clear all</button>
                                                )}
                                            </div>
                                            <div className="max-h-80 overflow-y-auto">
                                                {notifications.length === 0 ? (
                                                    <div className="py-10 text-center">
                                                        <Bell size={28} className="mx-auto text-slate-200 mb-2" />
                                                        <p className="text-slate-400 text-xs font-bold">No notifications yet</p>
                                                    </div>
                                                ) : (
                                                    notifications.map(notif => (
                                                        <div
                                                            key={notif._id || notif.id}
                                                            className={`w-full text-left px-5 py-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex items-start gap-3 ${!notif.isRead ? 'bg-blue-50/50' : ''}`}
                                                        >
                                                            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                                                                <MessageSquare size={14} className="text-blue-600" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-0.5">
                                                                    <span className="text-[11px] font-black text-slate-900 truncate">{notif.title || notif.subject || 'Admin Update'}</span>
                                                                    {!notif.isRead && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>}
                                                                </div>
                                                                <p className="text-[10px] text-slate-500 font-medium mt-0.5 line-clamp-2">{notif.message || notif.preview}</p>
                                                                <p className="text-[9px] text-slate-300 font-black mt-1 uppercase tracking-widest">
                                                                    {new Date(notif.createdAt || notif.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Seller Profile Dropdown */}
                                <div className="relative" ref={profileRef}>
                                    <button
                                        onClick={() => setProfileOpen(prev => !prev)}
                                        className="flex items-center gap-2.5 pl-2 pr-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                                            <User size={16} strokeWidth={2.5} />
                                        </div>
                                        <div className="text-left hidden md:block">
                                            <div className="text-[12px] font-black text-slate-900 leading-none">{seller?.name || 'Seller'}</div>
                                        </div>
                                        <ChevronRight size={14} className={`text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-90' : ''}`} />
                                    </button>

                                    {profileOpen && (
                                        <div className="absolute right-0 top-full mt-2.5 w-[260px] sm:w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-900/10 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                            {/* Profile Header */}
                                            <div className="px-5 py-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
                                                        <User size={22} strokeWidth={2.5} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-black text-[15px] leading-tight truncate">{seller?.name || 'Seller Account'}</div>
                                                        <div className="text-slate-400 text-[11px] font-bold truncate mt-0.5">{seller?.email}</div>
                                                        <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-blue-300 border border-white/10">
                                                            <Store size={9} /> Verified Seller
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Store Info */}
                                            {seller?.storeName && (
                                                <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-3">
                                                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-primary shrink-0">
                                                        <Store size={14} />
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Store</div>
                                                        <div className="text-[13px] font-black text-slate-900">{seller.storeName}</div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Logout */}
                                            <div className="p-3">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 font-black text-[12px] uppercase tracking-widest transition-all group"
                                                >
                                                    <div className="w-7 h-7 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                                                        <LogOut size={14} />
                                                    </div>
                                                    Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Mobile Only: Top Actions Row */}
                        <div className="md:hidden mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                            <button
                                onClick={() => setActiveTab('promotions')}
                                className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl font-black text-[11px] hover:bg-slate-100 transition-all flex items-center justify-center gap-2 border border-slate-200 uppercase tracking-widest"
                            >
                                <Star size={14} /> Promote
                            </button>
                            <button
                                onClick={() => navigate('/seller/add-product')}
                                className="flex-1 py-3 bg-[#2874f0] text-white rounded-xl font-black text-[11px] shadow-sm shadow-blue-500/20 hover:bg-[#1260e0] transition-all flex items-center justify-center gap-2 active:scale-95 uppercase tracking-widest"
                            >
                                <Plus size={16} strokeWidth={3} /> Launch
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Navigation Tabs */}
                <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-2 pb-2 md:pt-3 md:pb-3 bg-white hidden md:block">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                        {[
                            { id: 'overview', icon: BarChart3, label: 'Performance' },
                            { id: 'products', icon: Package, label: 'Inventory' },
                            { id: 'orders', icon: History, label: 'Operations' },
                            { id: 'analytics', icon: TrendingUp, label: 'Insights' },
                            { id: 'support', icon: ShieldCheck, label: 'Support' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-3 rounded-2xl font-black text-[13px] transition-colors flex items-center gap-2 shrink-0 ${activeTab === tab.id
                                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                                    : 'bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                    }`}
                            >
                                <tab.icon size={16} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Dashboard Workspace — pt-[170px] compensates for fixed header height */}
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-[160px] md:pt-[170px] pb-10">

                {/* Moderation Status Banner */}
                {seller && seller.status !== 'approved' && (
                    <div className="mb-8 animate-in slide-in-from-top-4 duration-500">
                        {seller.status === 'pending' ? (
                            <div className="bg-amber-50 border border-amber-200 rounded-[24px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm shadow-amber-100">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 animate-pulse">
                                        <Clock size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-[1000] text-amber-900 tracking-tight leading-tight mb-1">Application Under Review</h3>
                                        <p className="text-amber-700/70 text-[13px] font-bold leading-relaxed max-w-[500px]">
                                            Your seller profile is currently being verified by our compliance team. You can explore the dashboard, but product listings will go live only after approval.
                                        </p>
                                    </div>
                                </div>
                                <div className="px-5 py-2.5 bg-amber-200/50 rounded-xl text-amber-800 text-[11px] font-black uppercase tracking-widest border border-amber-200">
                                    Status: Pending Approval
                                </div>
                            </div>
                        ) : (
                            <div className="bg-red-50 border border-red-200 rounded-[24px] p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-sm shadow-red-100">
                                <div className="flex items-start gap-6">
                                    <div className="w-16 h-16 rounded-[24px] bg-red-100 text-red-600 flex items-center justify-center shrink-0 shadow-lg shadow-red-200">
                                        <ShieldAlert size={32} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-[1000] text-red-900 tracking-tight leading-tight mb-2">Application Rejected</h3>
                                        <div className="bg-white/60 rounded-2xl p-4 border border-red-100 mb-2">
                                            <span className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] block mb-1">Reason for rejection</span>
                                            <p className="text-red-800 text-[14px] font-bold leading-relaxed italic">
                                                "{seller.rejectionReason || "Common issues include invalid GST documents or bank name mismatch. Please contact support for details."}"
                                            </p>
                                        </div>
                                        <p className="text-red-700/60 text-[12px] font-bold">
                                            Please update your details and contact our support team to re-initiate the verification process.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setActiveTab('support')}
                                    className="px-8 py-4 bg-red-600 text-white rounded-2xl font-black text-[13px] uppercase tracking-widest shadow-xl shadow-red-200 hover:bg-red-700 transition-all flex items-center gap-2"
                                >
                                    <Star size={16} /> Contact Support
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div className="relative min-h-[600px]">
                    {/* Overlay spinner — does NOT shift layout height */}
                    {loading && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#f8fafc]/80 rounded-2xl">
                            <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-3"></div>
                            <p className="font-black text-xs uppercase tracking-widest text-slate-400">Syncing...</p>
                        </div>
                    )}
                    <div className="min-h-[600px]">
                        {activeTab === 'overview' && (
                            <div className="space-y-12">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                                    <StatsCard
                                        title="Gross Sales"
                                        value={formatCurrency(stats?.totalSales || 0)}
                                        icon={TrendingUp}
                                        color="#8b5cf6"
                                        trend="Total volume"
                                        subtext="Platform total"
                                    />
                                    <StatsCard
                                        title="Net Earnings"
                                        value={formatCurrency(stats?.totalEarnings || 0)}
                                        icon={IndianRupee}
                                        color="#10b981"
                                        trend="Your cut"
                                        subtext="Gross earnings"
                                    />
                                    <StatsCard
                                        title="Pending Payout"
                                        value={formatCurrency(stats?.pendingPayout || 0)}
                                        icon={Clock}
                                        color="#f59e0b"
                                        trend="Awaiting"
                                        subtext="Admin approval"
                                    />
                                    <StatsCard
                                        title="Settled Payout"
                                        value={formatCurrency(stats?.paidAmount || 0)}
                                        icon={CheckCircle}
                                        color="#3b82f6"
                                        trend="Transferred"
                                        subtext="Bank transferred"
                                    />
                                    <StatsCard
                                        title="Total Orders"
                                        value={stats?.totalOrders || 0}
                                        icon={ShoppingCart}
                                        color="#ec4899"
                                        trend="Lifetime"
                                        subtext="Total processed"
                                    />
                                    <StatsCard
                                        title="Active Listings"
                                        value={stats?.totalProducts || 0}
                                        icon={Package}
                                        color="#06b6d4"
                                        trend="Catalog size"
                                        subtext="Live products"
                                    />
                                    <StatsCard
                                        title="Low Stock Assets"
                                        value={stats?.lowStockProducts || 0}
                                        icon={AlertCircle}
                                        color="#ef4444"
                                        trend="Needs attention"
                                        subtext="Under 10 units"
                                    />
                                    <StatsCard
                                        title="Seller Rating"
                                        value={stats?.rating > 0 ? `${stats.rating.toFixed(1)} / 5.0` : 'New Seller'}
                                        icon={Star}
                                        color="#eab308"
                                        trend="Customer score"
                                        subtext="Satisfaction rate"
                                    />
                                </div>

                                {/* Middle Section: Orders & Insights */}
                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                                    {/* Recent Orders List */}
                                    <div className="xl:col-span-2 bg-white rounded-[24px] border border-slate-200 p-8 shadow-sm">
                                        <SectionHeader
                                            title="Recent Transactions"
                                            icon={ShoppingCart}
                                            action={
                                                <button
                                                    onClick={() => setActiveTab('orders')}
                                                    className="text-primary font-black text-xs uppercase tracking-widest hover:underline flex items-center gap-1.5"
                                                >
                                                    Full Log <ArrowRight size={14} />
                                                </button>
                                            }
                                        />

                                        {stats?.recentOrders?.length > 0 ? (
                                            <div className="space-y-3">
                                                {stats.recentOrders.map(order => (
                                                    <div key={order.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-2xl hover:bg-slate-50 border border-slate-100 transition-all duration-300 gap-3 sm:gap-0">
                                                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                                                                <img src={getImageUrl(order.imageUrl) || 'https://via.placeholder.com/48'} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-black text-slate-900 text-sm tracking-tight mb-0.5 truncate">{order.product_name}</div>
                                                                <div className="text-[10px] text-slate-400 font-bold flex items-center gap-2">
                                                                    <span className="text-slate-700">QTY: {order.quantity}</span>
                                                                    <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0"></span>
                                                                    <span className="truncate">{formatCurrency(order.total_price)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:gap-1.5 pl-[52px] sm:pl-0 shrink-0">
                                                            <div className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${order.status?.toLowerCase() === 'delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                                order.status?.toLowerCase() === 'cancelled' ? 'bg-red-50 text-red-600 border-red-100' :
                                                                    'bg-amber-50 text-amber-600 border-amber-100'
                                                                }`}>
                                                                {order.status}
                                                            </div>
                                                            <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest shrink-0">{order.order_date || 'Today'}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <EmptyState
                                                title="No Orders Yet"
                                                description="Once customers start buying your products, regular updates will appear here."
                                                icon={Package}
                                            />
                                        )}
                                    </div>

                                    {/* Side Widgets */}
                                    <div className="space-y-8">
                                        {/* Low Stock Alerts */}
                                        <div className={`bg-white rounded-[24px] border p-8 shadow-sm transition-all duration-300 ${stats?.lowStockProducts > 0 ? 'border-amber-200 bg-amber-50/10' : 'border-slate-200'}`}>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className={`p-2 rounded-xl ${stats?.lowStockProducts > 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                                                    <AlertCircle size={22} />
                                                </div>
                                                <h3 className="text-lg font-[1000] text-slate-900 tracking-tight">Stock Alerts</h3>
                                            </div>

                                            {stats?.lowStockProducts > 0 ? (
                                                <div>
                                                    <p className="text-sm text-slate-600 font-bold mb-6 leading-relaxed">
                                                        You have <span className="text-amber-600 font-black">{stats.lowStockProducts} products</span> running critically low on inventory.
                                                    </p>
                                                    <button
                                                        onClick={() => setActiveTab('products')}
                                                        className="text-amber-600 font-black text-xs uppercase tracking-[0.2em] flex items-center gap-1 hover:gap-3 transition-all"
                                                    >
                                                        Restock Now <ArrowRight size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-slate-400 font-bold leading-relaxed italic">
                                                    All systems nominal. Your inventory levels are looking healthy.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'products' && (
                            <InventoryTab
                                products={products}
                                loading={loading}
                                onToggleStatus={handleTogglePause}
                                formatCurrency={formatCurrency}
                            />
                        )}

                        {activeTab === 'orders' && (
                            <div className="">
                                {/* Minimalist Professional Header */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Orders</h2>
                                        <p className="text-slate-600 font-bold text-sm mt-1">Manage your recent orders and shipments.</p>
                                    </div>
                                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar bg-slate-100/50 p-1 rounded-lg border border-slate-200">
                                        {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'].map(f => (
                                            <button
                                                key={f}
                                                onClick={() => setOrderFilter(f)}
                                                className={`px-3 py-1.5 rounded-md text-sm font-black transition-all shrink-0 ${orderFilter === f
                                                    ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-800'
                                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                                    }`}
                                            >
                                                {f}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {filteredOrders.length === 0 ? (
                                    <div className="bg-white rounded-xl border border-slate-200 py-20 flex flex-col items-center justify-center text-center shadow-sm">
                                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3 border border-slate-100">
                                            <History size={20} className="text-slate-400" />
                                        </div>
                                        <h3 className="text-base font-black text-slate-900">No orders found</h3>
                                        <p className="text-sm font-bold text-slate-500 mt-1">{orderFilter === 'All' ? "You don't have any orders yet." : `No orders match the ${orderFilter} status.`}</p>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                        {/* Table Header */}
                                        <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50/80 border-b border-slate-200 text-xs font-black text-slate-600 uppercase tracking-wider">
                                            <div className="col-span-3">Order</div>
                                            <div className="col-span-3">Customer</div>
                                            <div className="col-span-2">Status</div>
                                            <div className="col-span-2 text-right">Amount</div>
                                            <div className="col-span-2 text-right">Actions</div>
                                        </div>

                                        {/* List Items */}
                                        <div className="divide-y divide-slate-100">
                                            {filteredOrders.map(order => (
                                                <div key={order._id} className="p-4 lg:p-0 transition-colors hover:bg-slate-50/30 group">
                                                    {/* Row Header Data */}
                                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:px-6 lg:py-4 items-center">
                                                        {/* Mobile Top Row: Custom Layout */}
                                                        <div className="flex flex-col gap-3 lg:hidden mb-2">
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <div className="font-black text-slate-900 text-sm">#{order._id.slice(-8).toUpperCase()}</div>
                                                                    <div className="text-[11px] font-bold text-slate-500 mt-0.5">{new Date(order.timeline?.placedAt || order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                                                                </div>
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                                                    order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                                    order.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                                                                    'bg-amber-50 text-amber-700 border-amber-200'
                                                                }`}>
                                                                    {order.status}
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center justify-between bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                                                                <div className="text-sm">
                                                                    <div className="font-black text-slate-800">{order.customer?.name || order.user_id?.name || 'Guest User'}</div>
                                                                    <div className="font-bold text-slate-500 truncate mt-0.5 text-xs max-w-[120px]">{order.customer?.email || order.user_id?.email}</div>
                                                                </div>
                                                                <div className="text-right font-black text-emerald-600 text-base">
                                                                    {formatCurrency(order.sellerTotal || 0)}
                                                                </div>
                                                            </div>

                                                            {nextStatusMap[order.status] && (
                                                                <div className="flex justify-end mt-1">
                                                                    <button
                                                                        onClick={() => handleUpdateStatus(order._id, nextStatusMap[order.status])}
                                                                        className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-slate-800 transition-all shadow-sm shadow-slate-900/10 flex items-center justify-center gap-2 uppercase tracking-widest"
                                                                    >
                                                                        <CheckCircle2 size={14} /> Mark as {nextStatusMap[order.status]}
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Desktop Columns */}
                                                        <div className="hidden lg:block col-span-3">
                                                            <div className="font-black text-slate-900 text-sm">#{order._id.slice(-8).toUpperCase()}</div>
                                                            <div className="text-xs font-bold text-slate-500 mt-0.5">{new Date(order.timeline?.placedAt || order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                                                        </div>

                                                        <div className="hidden lg:block col-span-3 text-sm">
                                                            <div className="font-black text-slate-800">{order.customer?.name || order.user_id?.name || 'Guest User'}</div>
                                                            <div className="font-bold text-slate-500 truncate mt-0.5 text-xs">{order.customer?.email || order.user_id?.email}</div>
                                                        </div>

                                                        <div className="hidden lg:flex col-span-2 items-center">
                                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-black border ${
                                                                order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                                order.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                                                                'bg-amber-50 text-amber-700 border-amber-200'
                                                            }`}>
                                                                {order.status}
                                                            </span>
                                                        </div>

                                                        <div className="hidden lg:block col-span-2 text-right font-black text-slate-900 text-sm">
                                                            {formatCurrency(order.sellerTotal || 0)}
                                                        </div>

                                                        <div className="hidden lg:flex col-span-2 items-center justify-end gap-2">
                                                            {nextStatusMap[order.status] && (
                                                                <button
                                                                    onClick={() => handleUpdateStatus(order._id, nextStatusMap[order.status])}
                                                                    className="px-3 py-1.5 bg-slate-900 text-white text-xs font-black rounded-md hover:bg-slate-800 transition-colors shadow-sm"
                                                                >
                                                                    {nextStatusMap[order.status]}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Expanded Details Inner Card */}
                                                    <div className="p-4 lg:px-6 lg:pb-6 bg-slate-50/50 border-t border-slate-100">
                                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                            
                                                            {/* Column 1: Order Items */}
                                                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                                                <h4 className="text-sm font-black text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                                                                    <Package size={16} className="text-blue-500" /> Products Ordered
                                                                </h4>
                                                                <div className="space-y-4">
                                                                    {order.items.map((item, idx) => (
                                                                        <div key={idx} className="flex gap-3 items-center">
                                                                            <div className="w-12 h-12 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden shrink-0">
                                                                                <img src={getImageUrl(item.imageUrl)} alt={item.name} className="w-full h-full object-cover" />
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <div className="text-sm font-black text-slate-900 truncate">{item.name}</div>
                                                                                <div className="text-xs font-bold text-slate-500 mt-0.5">
                                                                                    {item.quantity} units × <span className="font-black text-slate-700">{formatCurrency(item.priceAtPurchase)}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                                                                    <span className="text-sm font-black text-slate-500">Total Amount</span>
                                                                    <span className="text-base font-black text-slate-900">{formatCurrency(order.sellerTotal || 0)}</span>
                                                                </div>
                                                            </div>

                                                            {/* Column 2: Customer & Shipping */}
                                                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-5">
                                                                <div>
                                                                    <h4 className="text-sm font-black text-slate-800 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
                                                                        <User size={16} className="text-emerald-500" /> Customer Information
                                                                    </h4>
                                                                    <div className="space-y-2.5">
                                                                        <div className="flex items-start gap-2">
                                                                            <span className="text-xs font-black text-slate-500 w-16 shrink-0 mt-0.5">Name:</span>
                                                                            <span className="text-sm font-black text-slate-900">{order.customer?.name || order.user_id?.name || 'Guest User'}</span>
                                                                        </div>
                                                                        <div className="flex items-start gap-2">
                                                                            <span className="text-xs font-black text-slate-500 w-16 shrink-0 mt-0.5">Email:</span>
                                                                            <span className="text-sm font-bold text-slate-700 break-all">{order.customer?.email || order.user_id?.email || 'N/A'}</span>
                                                                        </div>
                                                                        <div className="flex items-start gap-2">
                                                                            <span className="text-xs font-black text-slate-500 w-16 shrink-0 mt-0.5">Phone:</span>
                                                                            <span className="text-sm font-black text-slate-900">{order.customer?.phone || order.address?.mobile || 'N/A'}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <h4 className="text-sm font-black text-slate-800 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
                                                                        <MapPin size={16} className="text-red-500" /> Shipping Address
                                                                    </h4>
                                                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                                        <p className="text-sm font-black text-slate-900 mb-1">{order.address?.fullName || order.customer?.name}</p>
                                                                        <p className="text-xs font-bold text-slate-700 leading-relaxed">
                                                                            {order.address?.line1 || 'No address line'}<br/>
                                                                            {[order.address?.city, order.address?.state].filter(Boolean).join(', ')}<br/>
                                                                            PIN: <span className="font-black text-slate-900">{order.address?.postalCode}</span>
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Column 3: Logistics & Action */}
                                                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                                                                <div>
                                                                    <h4 className="text-sm font-black text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                                                                        <Truck size={16} className="text-orange-500" /> Logistics Control
                                                                    </h4>
                                                                    
                                                                    <div className="mb-6">
                                                                        <div className="flex items-center justify-between mb-2">
                                                                            <span className="text-xs font-black text-slate-500">Tracking ID</span>
                                                                            <span className="text-sm font-mono font-black text-slate-900 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                                                                                {order.tracking?.trackingNumber || 'UNASSIGNED'}
                                                                            </span>
                                                                        </div>
                                                                        
                                                                        <div className="mt-4 relative">
                                                                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                                                                                <div className="bg-[#2874f0] h-full transition-all" style={{
                                                                                    width: order.status === 'Pending' ? '15%' :
                                                                                        order.status === 'Confirmed' ? '35%' :
                                                                                            order.status === 'Packed' ? '55%' :
                                                                                                order.status === 'Shipped' ? '75%' :
                                                                                                    order.status === 'Delivered' ? '100%' : '0%'
                                                                                }} />
                                                                            </div>
                                                                            <div className="flex justify-between mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                                                <span>Processing</span>
                                                                                <span>Shipped</span>
                                                                                <span>Delivered</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="flex flex-col gap-2 mt-4">
                                                                    {nextStatusMap[order.status] && (
                                                                        <button
                                                                            onClick={() => handleUpdateStatus(order._id, nextStatusMap[order.status])}
                                                                            className="w-full py-2.5 bg-slate-900 text-white text-sm font-black rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                                                                        >
                                                                            Mark as {nextStatusMap[order.status]}
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        onClick={() => handleAddTracking(order._id)}
                                                                        className="w-full py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-black rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                                                                    >
                                                                        {order.tracking?.trackingNumber ? 'Edit Tracking ID' : 'Add Tracking ID'}
                                                                    </button>
                                                                    {order.status === 'Pending' && (
                                                                        <button
                                                                            onClick={() => handleUpdateStatus(order._id, 'Cancelled')}
                                                                            className="w-full mt-1 py-2 text-red-600 border border-transparent text-xs font-black hover:bg-red-50 hover:border-red-200 rounded-lg transition-colors"
                                                                        >
                                                                            Cancel Order
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>

                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'analytics' && (
                            <div className="space-y-8">
                                {/* KPI Summary Row */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                                    {[
                                        { label: 'Total Revenue', value: formatCurrency(stats.totalSales), sub: '+12.5% vs last month', icon: IndianRupee, color: 'text-primary bg-blue-50' },
                                        { label: 'Avg. Order Value', value: formatCurrency(stats.totalOrders > 0 ? stats.totalSales / stats.totalOrders : 0), sub: 'Stable', icon: BarChart3, color: 'text-emerald-600 bg-emerald-50' },
                                        { label: 'Total Orders', value: stats.totalOrders, sub: 'Lifetime volume', icon: ShoppingCart, color: 'text-orange-600 bg-orange-50' },
                                        { label: 'Conversion Rate', value: '3.2%', sub: 'High performance', icon: TrendingUp, color: 'text-purple-600 bg-purple-50' }
                                    ].map((kpi, idx) => (
                                        <div key={idx} className="bg-white p-4 sm:p-6 rounded-[20px] border border-slate-200 shadow-sm hover:shadow-md transition-all">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${kpi.color}`}>
                                                <kpi.icon size={18} strokeWidth={2.5} />
                                            </div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</div>
                                            <div className="text-xl font-black text-slate-900 tracking-tight mb-1">{kpi.value}</div>
                                            <div className="text-[10px] font-bold text-slate-400">{kpi.sub}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Revenue Trends Chart (Large) */}
                                    <div className="lg:col-span-2 bg-white rounded-[24px] sm:rounded-[32px] border border-slate-100 p-5 sm:p-8 shadow-sm">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4 sm:gap-0">
                                            <div>
                                                <h3 className="text-xl font-[1000] text-slate-900 tracking-tight">Revenue Trends</h3>
                                                <p className="text-sm text-slate-500 font-bold">Sales performance over the last 7 days</p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg text-[10px] font-black uppercase text-slate-400">
                                                    <div className="w-2 h-2 rounded-full bg-primary"></div> Revenue
                                                </div>
                                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg text-[10px] font-black uppercase text-slate-400">
                                                    <div className="w-2 h-2 rounded-full bg-rose-500"></div> Returns
                                                </div>
                                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg text-[10px] font-black uppercase text-slate-400">
                                                    <div className="w-2 h-2 rounded-full bg-orange-400"></div> Orders
                                                </div>
                                            </div>
                                        </div>

                                        {(() => {
                                            const last7Days = [];
                                            const today = new Date();
                                            const revenueMap = {};
                                            for (let i = 6; i >= 0; i--) {
                                                const d = new Date(today);
                                                d.setDate(today.getDate() - i);
                                                const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
                                                const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                                                last7Days.push({ d: dayStr, dateKey, revenue: 0, orders: 0, returns: 0 });
                                                revenueMap[dateKey] = { revenue: 0, orders: 0, returns: 0 };
                                            }
                                            orders.forEach(order => {
                                                const d = new Date(order.createdAt);
                                                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

                                                if (revenueMap[key]) {
                                                    if (order.status !== 'Cancelled' && order.status !== 'Returned' && order.return?.status !== 'Completed') {
                                                        const rev = order.items.reduce((s, i) => s + (Number(i.priceAtPurchase || i.price) * (i.quantity || 1)), 0);
                                                        revenueMap[key].revenue += rev;
                                                        revenueMap[key].orders += 1;
                                                    } else if (order.status === 'Returned' || order.return?.status === 'Completed') {
                                                        const retValue = order.items.reduce((s, i) => s + (Number(i.priceAtPurchase || i.price) * (i.quantity || 1)), 0);
                                                        revenueMap[key].returns += retValue;
                                                    }
                                                }
                                            });
                                            last7Days.forEach(day => {
                                                day.revenue = revenueMap[day.dateKey].revenue;
                                                day.orders = revenueMap[day.dateKey].orders;
                                                day.returns = revenueMap[day.dateKey].returns;
                                            });

                                            return (
                                                <div className="w-full" style={{ height: '350px' }}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <ComposedChart data={last7Days}>
                                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                            <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 800 }} dy={10} />
                                                            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 800 }} tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                                                            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 800 }} />
                                                            <RechartsTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', backgroundColor: '#0f172a', color: '#fff' }} />
                                                            <Bar yAxisId="left" dataKey="revenue" fill="#2874f0" radius={[6, 6, 0, 0]} barSize={35} />
                                                            <Bar yAxisId="left" dataKey="returns" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={20} />
                                                            <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#f59e0b" strokeWidth={4} dot={{ r: 5, fill: '#fff', stroke: '#f59e0b', strokeWidth: 3 }} />
                                                        </ComposedChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* Status Distribution Pie Chart */}
                                    <div className="bg-white rounded-[24px] sm:rounded-[32px] border border-slate-200 p-5 sm:p-8 shadow-sm flex flex-col">
                                        <h3 className="text-lg font-black text-slate-900 tracking-tight mb-6 sm:mb-8">Order Status Mix</h3>
                                        <div className="flex-1 min-h-[250px] relative">
                                            {(() => {
                                                const statusMap = {};
                                                orders.forEach(o => { statusMap[o.status] = (statusMap[o.status] || 0) + 1; });
                                                const pieData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));
                                                const COLORS = ['#2874f0', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899'];

                                                if (pieData.length === 0) return <div className="h-full flex items-center justify-center text-slate-400 font-bold">No order data</div>;

                                                return (
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <PieChart>
                                                            <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                                                {pieData.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.5)" strokeWidth={2} />
                                                                ))}
                                                            </Pie>
                                                            <RechartsTooltip />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                );
                                            })()}
                                        </div>
                                        <div className="mt-6 flex flex-wrap gap-4 justify-center">
                                            {(() => {
                                                const statusMap = {};
                                                orders.forEach(o => { statusMap[o.status] = (statusMap[o.status] || 0) + 1; });
                                                const entries = Object.entries(statusMap);
                                                const COLORS = ['#2874f0', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899'];
                                                return entries.map(([name, count], i) => (
                                                    <div key={name} className="flex items-center gap-2">
                                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-tight">{name}: {count}</span>
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Grid: Top Performers & Low Stock */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="bg-white rounded-[24px] sm:rounded-[32px] border border-slate-100 p-5 sm:p-8 shadow-sm">
                                        <div className="flex justify-between items-center mb-6 sm:mb-8">
                                            <h3 className="text-xl font-[1000] text-slate-900 tracking-tight">Product Leaderboard</h3>
                                            <div className="w-10 h-10 bg-blue-50 text-primary rounded-xl flex items-center justify-center">
                                                <TrendingUp size={18} strokeWidth={2.5} />
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            {(() => {
                                                const productSales = {};
                                                orders.forEach(order => {
                                                    if (order.status !== 'Cancelled' && order.status !== 'Returned') {
                                                        order.items.forEach(item => {
                                                            const id = item.productId || item.product_id || item._id;
                                                            if (!productSales[id]) productSales[id] = { name: item.name, revenue: 0, image: item.imageUrl };
                                                            productSales[id].revenue += (Number(item.priceAtPurchase || item.price) * (item.quantity || 1));
                                                        });
                                                    }
                                                });
                                                const top = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 4);
                                                if (top.length === 0) return <div className="py-12 text-center text-slate-400 font-bold">No performance data yet</div>;
                                                const max = top[0].revenue;
                                                return top.map((p, i) => (
                                                    <div key={i} className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl border border-slate-100 overflow-hidden shrink-0"><img src={getImageUrl(p.image)} alt="" className="w-full h-full object-cover" /></div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-end mb-1.5">
                                                                <span className="text-sm font-black text-slate-900 truncate max-w-[140px]">{p.name}</span>
                                                                <span className="text-sm font-black text-primary">{formatCurrency(p.revenue)}</span>
                                                            </div>
                                                            <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                                                                <div className="bg-primary h-full rounded-full transition-all duration-1000 shadow-sm shadow-primary/30" style={{ width: `${(p.revenue / max) * 100}%` }}></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-[24px] sm:rounded-[32px] border border-slate-100 p-5 sm:p-8 shadow-sm">
                                        <div className="flex justify-between items-center mb-6 sm:mb-8">
                                            <h3 className="text-xl font-[1000] text-slate-900 tracking-tight">Critical Inventory</h3>
                                            <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center">
                                                <AlertCircle size={18} strokeWidth={2.5} />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            {products.filter(p => p.stock < 10).slice(0, 4).map((p, i) => (
                                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-[20px] border border-slate-100 group hover:border-red-200 transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200"><img src={getImageUrl(p.imageUrl)} alt="" className="w-full h-full object-cover" /></div>
                                                        <div>
                                                            <div className="text-sm font-black text-slate-900 leading-tight">{p.name}</div>
                                                            <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-1">Remaining: {p.stock} units</div>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => navigate(`/seller/edit-product/${p._id}`)} className="p-2 text-slate-400 hover:text-primary transition-colors">
                                                        <Plus size={18} />
                                                    </button>
                                                </div>
                                            ))}
                                            {products.filter(p => p.stock < 10).length === 0 && (
                                                <div className="py-12 flex flex-col items-center justify-center text-center">
                                                    <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-4">
                                                        <CheckCircle size={32} />
                                                    </div>
                                                    <div className="font-black text-slate-900 text-sm">Perfect Inventory</div>
                                                    <div className="text-[11px] text-slate-400 font-bold mt-1 uppercase tracking-widest">No products are low on stock.</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Actionable Insights Widget */}
                                <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#2874f0]/20 rounded-full blur-[80px]"></div>
                                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
                                                <BarChart3 size={28} className="text-blue-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-[1000] mb-2">Optimize Your Listings</h3>
                                                <p className="text-slate-400 font-bold text-sm max-w-[400px]">
                                                    Based on our AI analysis, {stats?.lowStockProducts > 0 ? stats.lowStockProducts : 'some'} of your products are running low on stock. Restocking them soon could secure up to {formatCurrency((stats?.totalSales || 10000) * 0.15)} in potential hidden revenue over the next week.
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setActiveTab('products')}
                                            className="px-6 py-3 bg-white text-slate-900 rounded-xl font-[900] text-[12px] uppercase tracking-widest hover:bg-slate-100 transition-all shrink-0 cursor-pointer"
                                        >
                                            Manage Inventory
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'support' && (
                            <div className="">
                                <SellerSupport />
                            </div>
                        )}

                        {activeTab === 'promotions' && (
                            <PromotionsTab />
                        )}
                    </div>
                </div>
            </div>

            {/* Icons Shorthand */}
            <svg style={{ display: 'none' }}>
                <symbol id="icon-chevron-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </symbol>
            </svg>
        </div>
    );
}
