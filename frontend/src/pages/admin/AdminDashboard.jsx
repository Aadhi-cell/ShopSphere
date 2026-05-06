import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getAdminUser } from '../../auth';
import { getAdminOrders, getPendingProducts, getAdminSellers, getAdminNotifications, markAdminNotificationsRead } from '../../api/adminApi';
import AdminOverview from '../../components/admin/AdminOverview';
import ProductManager from '../../components/admin/ProductManager';
import OrderManager from '../../components/admin/OrderManager';
import UserManager from '../../components/admin/UserManager';

import AnalyticsManager from '../../components/admin/AnalyticsManager';
import SupportManager from '../../components/admin/SupportManager';
import SettingsManager from '../../components/admin/SettingsManager';
import FinanceManager from '../../components/admin/FinanceManager';
import PromotionManager from '../../components/admin/PromotionManager';
import Logo from '../../components/common/Logo';
import {
    LayoutDashboard,
    Users,
    ShoppingBag,
    Package,
    TrendingUp,
    CreditCard,
    Bell,
    FileText,
    Headphones,
    Settings,
    LogOut,
    Menu,
    Search,
    Megaphone
} from 'lucide-react';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [stats, setStats] = useState({ pendingOrders: 0, pendingProducts: 0, pendingSellers: 0 });
    const [notifications, setAdminNotifications] = useState([]);
    const [bellOpen, setBellOpen] = useState(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        const user = getAdminUser();
        if (!user || user.role !== 'admin') {
            console.warn('Unauthorized access to admin panel. Redirecting...');
            navigate('/admin/login');
            return;
        }
    }, [navigate]);

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const [ordersData, pendingProductsData, sellersData] = await Promise.all([
                    getAdminOrders(),
                    getPendingProducts(),
                    getAdminSellers()
                ]);

                const pendingOrders = ordersData.filter(o => o.status === 'Ordered' || o.status === 'Processing').length;
                const pendingProducts = pendingProductsData.filter(p => p.status !== 'blocked').length;
                const pendingSellers = sellersData.filter(s => s.status === 'pending').length;

                setStats({
                    pendingOrders,
                    pendingProducts,
                    pendingSellers
                });
            } catch (err) {
                console.warn('Silent fail for stats:', err);
            }
        };

        const fetchNotifications = async () => {
            try {
                const notifs = await getAdminNotifications();
                setAdminNotifications(notifs);
            } catch (err) {
                console.warn('Silent fail for notifications:', err);
            }
        };

        fetchStats();
        fetchNotifications();
        const interval = setInterval(() => {
            fetchStats();
            fetchNotifications();
        }, 30000); // Update every 30s
        return () => clearInterval(interval);
    }, []);

    const handleSearch = () => {
        if (searchText.trim()) {
            setActiveTab('products-all');
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/admin/login');
    };

    const renderContent = () => {
        if (activeTab === 'dashboard') return <AdminOverview setActiveTab={setActiveTab} />;
        if (activeTab === 'users') return <UserManager />;
        if (activeTab.startsWith('orders')) return <OrderManager activeSubTab={activeTab} />;
        if (activeTab.startsWith('products')) {
            return <ProductManager activeSubTab={activeTab} />;
        }
        if (activeTab.startsWith('analytics')) return <AnalyticsManager activeSubTab={activeTab} />;
        if (activeTab.startsWith('settings')) return <SettingsManager />;
        if (activeTab.startsWith('finance')) return <FinanceManager activeSubTab={activeTab} />;

        if (activeTab === 'promotions') return <PromotionManager />;
        if (activeTab === 'support') return <SupportManager />;
        return <AdminOverview setActiveTab={setActiveTab} />;
    };

    const menuStructure = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'orders', label: 'Orders', icon: ShoppingBag },
        { id: 'products', label: 'Products', icon: Package },
        { id: 'analytics', label: 'Analytics', icon: TrendingUp },
        { id: 'finance', label: 'Finance', icon: CreditCard },
        { id: 'promotions', label: 'Promotions', icon: Megaphone },

        { id: 'support', label: 'Support', icon: Headphones },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[45] md:hidden transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Clean White Sidebar */}
            <aside
                className={`
                    ${isSidebarOpen ? 'translate-x-0 w-[260px] md:w-[280px]' : '-translate-x-[150%] md:translate-x-0 w-[80px]'}
                    bg-white/95 backdrop-blur-xl shadow-premium
                    transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
                    flex flex-col fixed left-4 top-[96px] bottom-4 z-50 rounded-[24px] border border-slate-200/60 overflow-hidden
                `}
            >
                {/* Nav Links */}
                <nav className="flex-1 py-6 px-3 overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-24">
                    <div className={`text-[11px] font-bold text-slate-400 mb-3 px-3 tracking-wider uppercase ${!isSidebarOpen && 'hidden'}`}>
                        Navigation
                    </div>

                    {menuStructure.map(item => {
                        const isActive = activeTab === item.id || activeTab.startsWith(item.id);

                        return (
                            <div key={item.id} className="mb-1">
                                <button
                                    onClick={() => {
                                        setActiveTab(item.id);
                                        setIsSidebarOpen(false);
                                    }}
                                    className={`
                                        w-full flex items-center gap-3 py-2.5 px-3 rounded-lg cursor-pointer transition-all
                                        ${isActive ? 'bg-gray-100 text-gray-900 font-bold' : 'hover:bg-gray-50 text-gray-500 font-semibold'}
                                        ${!isSidebarOpen && 'justify-center w-11 h-11 mx-auto'}
                                    `}
                                >
                                    <item.icon size={18} className={`shrink-0 ${isActive ? 'text-gray-900' : 'text-gray-400'}`} />
                                    {isSidebarOpen && <span className="text-sm truncate">{item.label}</span>}
                                    {isSidebarOpen && item.id === 'orders' && stats.pendingOrders > 0 && (
                                        <span className="ml-auto text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">
                                            {stats.pendingOrders}
                                        </span>
                                    )}
                                    {isSidebarOpen && item.id === 'products' && stats.pendingProducts > 0 && (
                                        <span className="ml-auto text-[10px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded font-bold">
                                            {stats.pendingProducts}
                                        </span>
                                    )}
                                    {isSidebarOpen && item.id === 'users' && stats.pendingSellers > 0 && (
                                        <span className="ml-auto text-[10px] bg-gray-900 text-white px-1.5 py-0.5 rounded font-bold">
                                            {stats.pendingSellers}
                                        </span>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </nav>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-slate-100 flex flex-col gap-2 bg-white w-full shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                    <button
                        onClick={() => {
                            handleLogout();
                            setIsSidebarOpen(false);
                        }}
                        className={`
                            w-full flex items-center gap-3 py-2.5 px-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors
                            ${!isSidebarOpen && 'justify-center w-11 h-11 mx-auto'}
                        `}
                        title="Logout"
                    >
                        <LogOut size={18} className="shrink-0" />
                        {isSidebarOpen && <span className="text-sm font-semibold">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content - Constant Margin Match to Collapsed Sidebar + Gap */}
            <main className="flex-1 ml-0 md:ml-[112px] transition-all duration-300 min-w-0 h-screen overflow-y-auto flex flex-col">
                {/* Full Width Professional Navbar - Stationary & Full Width */}
                <header className="h-[70px] md:h-[80px] bg-white border-b border-slate-100 fixed top-0 left-0 right-0 z-[60] flex items-center justify-between px-4 md:px-8 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center gap-6">
                        {/* Toggle Button - Premium Style */}
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gray-900 text-white flex items-center justify-center transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:bg-black hover:scale-105 active:scale-95 border-none cursor-pointer shrink-0"
                            title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
                        >
                            <Menu size={22} />
                        </button>

                        {/* Branding */}
                        <div className="flex items-center gap-4 shrink-0">
                            <Logo iconSize={32} textClassName="text-[18px] hidden sm:inline" />
                            <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
                            <div className="hidden sm:block">
                                <div className="text-[18px] font-[1000] text-slate-900 tracking-tight leading-none">Admin</div>
                                <div className="text-slate-400 text-[11px] font-bold mt-0.5">Manage platform operations</div>
                            </div>
                        </div>
                    </div>

                    {/* Absolutely Centered Search Bar */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[35%] max-w-[460px] hidden md:block">
                        <div className="relative w-full">
                            <Search
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                placeholder="Search products, orders, users..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 rounded-[12px] border border-gray-200 bg-gray-50/50 text-[15px] font-semibold outline-none text-gray-900 transition-all hover:bg-gray-50 focus:bg-white focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 placeholder:text-gray-400"
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="relative">
                            <button
                                onClick={async () => {
                                    setBellOpen(!bellOpen);
                                    if (!bellOpen && notifications.some(n => !n.isRead)) {
                                        await markAdminNotificationsRead();
                                        const notifs = await getAdminNotifications();
                                        setAdminNotifications(notifs);
                                    }
                                }}
                                className="relative p-2 text-slate-400 hover:text-slate-900 transition-colors rounded-full hover:bg-slate-100 md:mt-1 md:mr-2"
                            >
                                <Bell size={22} className="md:w-6 md:h-6" />
                                {notifications.filter(n => !n.isRead).length > 0 && (
                                    <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                                )}
                            </button>

                            {bellOpen && (
                                <div className="absolute right-[-60px] sm:right-0 top-full mt-3 w-[300px] sm:w-80 bg-white rounded-[16px] shadow-premium border border-slate-100 z-50 overflow-hidden transform origin-top-right transition-all">
                                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                        <span className="font-extrabold text-[13px] text-slate-900 uppercase tracking-widest">Notifications</span>
                                        {notifications.length > 0 && (
                                            <button onClick={() => setAdminNotifications([])} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors">Clear all</button>
                                        )}
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-6 text-center">
                                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No notifications yet</p>
                                            </div>
                                        ) : (
                                            notifications.map(notif => (
                                                <div key={notif._id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors ${!notif.isRead ? 'bg-blue-50/30' : ''}`}>
                                                    <div className="flex gap-3">
                                                        <div className="w-2 h-2 mt-1.5 rounded-full shrink-0 flex items-center justify-center">
                                                            {!notif.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-sm font-bold text-slate-900 truncate">{notif.title}</h4>
                                                            <p className="text-xs font-medium text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{notif.message}</p>
                                                            <span className="text-[10px] font-bold text-slate-400 mt-2 block uppercase tracking-widest">{new Date(notif.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div
                            className="flex items-center gap-3 cursor-pointer group px-2 py-1"
                            onClick={() => setActiveTab('settings-admin')}
                            title="Manage Admin Accounts"
                        >
                            <div className="text-right hidden sm:block">
                                <div className="text-sm font-bold text-gray-900 leading-tight group-hover:text-black transition-colors">Admin User</div>
                                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Manage Profile</div>
                            </div>
                            <div className="w-10 h-10 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600 group-hover:bg-gray-900 group-hover:text-white group-hover:border-gray-900 transition-all shadow-sm">
                                A
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="p-3 sm:p-5 md:p-8 max-w-[1600px] w-full mx-auto flex-1 h-auto relative mt-[70px] md:mt-[80px]">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none"></div>
                    <div className="relative z-10">
                        {renderContent()}
                    </div>
                </div>
            </main>
        </div >
    );
}

