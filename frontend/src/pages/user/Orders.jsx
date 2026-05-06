import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserOrders, cancelOrder } from '../../api/userApi';
import { useCart } from '../../contexts/CartContext';
import { socket } from '../../utils/socket';
import useMobile from '../../hooks/useMobile';
import {
    Package,
    Truck,
    ChevronRight,
    RotateCcw,
    Star,
    Box,
    MapPin,
    Calendar,
    ShoppingBag,
    Clock,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    ShieldCheck,
    Undo2,
    XCircle
} from 'lucide-react';
import { getImageUrl } from '../../utils/imageConfig';

const formatINR = (value) => {
    const num = parseFloat(value || 0);
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(num);
};

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const isMobile = useMobile();
    const [cancellingId, setCancellingId] = useState(null);

    useEffect(() => {
        async function fetchOrders() {
            try {
                setLoading(true);
                const data = await getUserOrders();
                setOrders(data);
            } catch (err) {
                console.error('Failed to load orders:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchOrders();

        // Socket.io Listener for real-time updates
        socket.on('orderStatusUpdated', (data) => {

            setOrders(prevOrders =>
                prevOrders.map(order =>
                    (order._id === data.orderId || order.id === data.orderId)
                        ? { ...order, status: data.status, timeline: data.timeline }
                        : order
                )
            );
        });

        return () => {
            socket.off('orderStatusUpdated');
        };
    }, []);

    const toggleTracking = (oid) => {
        setExpandedOrderId(expandedOrderId === oid ? null : oid);
    };

    const handleBuyAgain = (order) => {
        if (!order.items || order.items.length === 0) return;
        order.items.forEach(item => {
            const product = {
                id: item.id || item.productId,
                name: item.name,
                price: item.priceAtPurchase || item.price || 0,
                imageUrl: item.imageUrl,
                category: item.category || 'General'
            };
            addToCart(product);
        });
        navigate('/cart');
    };

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;
        try {
            setCancellingId(orderId);
            await cancelOrder(orderId);
            setOrders(prev => prev.map(o =>
                (o._id === orderId || o.id === orderId)
                    ? { ...o, status: 'Cancelled' }
                    : o
            ));
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to cancel order';
            alert(msg);
        } finally {
            setCancellingId(null);
        }
    };

    const getStatusInfo = (status) => {
        const s = status?.toLowerCase() || 'pending';
        if (s === 'delivered') return { color: '#064e3b', bg: '#ecfdf5', label: 'Delivered', icon: <CheckCircle2 size={16} /> };
        if (s === 'shipped') return { color: '#075985', bg: '#f0f9ff', label: 'Shipped', icon: <Truck size={16} /> };
        if (s === 'out for delivery') return { color: '#075985', bg: '#f0f9ff', label: 'Out for Delivery', icon: <Truck size={16} /> };
        if (s === 'packed') return { color: '#92400e', bg: '#fffbeb', label: 'Packed', icon: <Package size={16} /> };
        if (s === 'confirmed') return { color: '#92400e', bg: '#fffbeb', label: 'Confirmed', icon: <CheckCircle2 size={16} /> };
        if (s === 'cancelled') return { color: '#991b1b', bg: '#fef2f2', label: 'Cancelled', icon: <CheckCircle2 size={16} /> };
        if (s === 'processing') return { color: '#92400e', bg: '#fffbeb', label: 'Processing', icon: <Clock size={16} /> };
        return { color: '#3730a3', bg: '#f5f3ff', label: s.charAt(0).toUpperCase() + s.slice(1), icon: <Box size={16} /> };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-bg-primary flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className={`min-h-screen bg-bg-primary flex flex-col items-center justify-center ${isMobile ? 'px-6' : 'px-8'}`}>
                <div className="glass-panel max-w-[500px] w-full rounded-[40px] px-8 py-16 text-center shadow-premium transform">
                    <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8">
                        <ShoppingBag size={48} strokeWidth={1} className="text-primary/40" />
                    </div>
                    <h2 className="text-3xl font-[900] text-slate-900 mb-4 tracking-tight">No orders yet</h2>
                    <p className="text-slate-500 mb-10 text-lg leading-relaxed font-medium">Explore the marketplace to place your first order.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-4.5 bg-primary text-white rounded-2xl font-black text-lg shadow-lg hover:bg-primary-hover transition-all"
                        style={{ backgroundColor: '#2874f0' }}
                    >
                        Explore Marketplace
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-[80vh] bg-bg-primary ${isMobile ? 'px-4 py-8' : 'px-8 py-12'}`}>
            <div className="max-w-[1000px] mx-auto">
                {/* Clean Header */}
                <div className="mb-10 pb-6 border-b border-slate-200">
                    <h1 className="text-3xl md:text-4xl font-[900] text-slate-900 tracking-tight">Your Orders</h1>
                    <div className="h-1 w-12 bg-primary mt-3 rounded-full"></div>
                </div>

                {/* Orders List */}
                <div className="space-y-8">
                    {orders.map((order) => {
                        const oid = order._id || order.id;
                        const statusInfo = getStatusInfo(order.status);
                        const isExpanded = expandedOrderId === oid;

                        return (
                            <div key={oid} className="bg-white rounded-xl border border-slate-300 overflow-hidden shadow-sm hover:shadow-md transition-shadow">

                                {/* Classic Header (Grey Bar) */}
                                <div className="p-4 sm:px-6 sm:py-3.5 bg-[#f0f2f2] border-b border-slate-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-10 text-[11px] sm:text-[12px] text-[#565959]">
                                    <div className="flex flex-wrap gap-6 md:gap-14">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="uppercase font-bold tracking-tight">Order Placed</span>
                                            <span className="text-slate-800 font-bold whitespace-nowrap">
                                                {order.date ? new Date(order.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : 'Recently'}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="uppercase font-bold tracking-tight">Total</span>
                                            <span className="text-slate-800 font-bold whitespace-nowrap">{formatINR(order.pricing?.grandTotal || order.total)}</span>
                                        </div>
                                        <div className="flex flex-col gap-0.5 hidden sm:flex">
                                            <span className="uppercase font-bold tracking-tight">Ship To</span>
                                            <span className="text-primary font-bold cursor-pointer hover:text-[#c45500] hover:underline underline-offset-2">
                                                {order.address?.fullName || 'User'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-start sm:items-end gap-0.5 flex-1 min-w-0">
                                        <span className="uppercase font-bold tracking-tight whitespace-nowrap">Order # {oid ? oid.slice(-12).toUpperCase() : 'PENDING'}</span>
                                        <div className="flex gap-3 text-primary font-bold">
                                            <span className="hover:text-[#c45500] hover:underline cursor-pointer border-r border-slate-400 pr-3 leading-none">View order details</span>
                                            <span className="hover:text-[#c45500] hover:underline cursor-pointer leading-none hidden sm:inline">Invoice</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Card Body */}
                                <div className="p-4 sm:p-6">
                                    {/* Delivered / Arriving Status */}
                                    <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div>
                                            <h3 className={`text-[17px] sm:text-[19px] font-black tracking-tight ${order.status?.toLowerCase() === 'delivered' ? 'text-[#064e3b]' : 'text-slate-900'}`}>
                                                {order.status?.toLowerCase() === 'delivered' ? 'Delivered ' : 'Arriving by '}
                                                {order.date ? new Date(new Date(order.date).setDate(new Date(order.date).getDate() + 5)).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : 'Soon'}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1.5 px-3 py-1 rounded-lg border w-fit font-bold text-[11px] uppercase tracking-wide" style={{ backgroundColor: statusInfo.bg, color: statusInfo.color, borderColor: statusInfo.color + '30' }}>
                                                {statusInfo.icon}
                                                {statusInfo.label}
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-2 md:mt-0">
                                            <button
                                                onClick={() => toggleTracking(oid)}
                                                className={`px-5 py-2.5 rounded-lg font-bold text-[13px] border transition-all flex items-center justify-center gap-2 ${isExpanded ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-[#F0F2F2] text-slate-800 border-[#D5D9D9] hover:bg-[#e3e6e6]'}`}
                                            >
                                                Track package
                                            </button>
                                            <button
                                                onClick={() => handleBuyAgain(order)}
                                                className="px-6 py-2.5 bg-[#FFD814] hover:bg-[#F7CA00] text-slate-900 border border-[#FCD200] rounded-lg font-bold text-[13px] shadow-sm flex items-center justify-center gap-2 active:scale-95"
                                            >
                                                <RotateCcw size={16} /> Buy it again
                                            </button>
                                            {['Pending', 'Confirmed'].includes(order.status) && (
                                                <button
                                                    onClick={() => handleCancelOrder(oid)}
                                                    disabled={cancellingId === oid}
                                                    className="px-5 py-2.5 rounded-lg font-bold text-[13px] border transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    style={{ backgroundColor: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3' }}
                                                >
                                                    <XCircle size={16} />
                                                    {cancellingId === oid ? 'Cancelling...' : 'Cancel'}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Tracking Timeline (Expandable) */}
                                    {isExpanded && (
                                        <div className="bg-slate-50/80 mb-8 p-6 sm:p-10 rounded-2xl border border-slate-200 animate-[fadeIn_0.3s_ease-out] overflow-x-auto">
                                            <div className="flex justify-between relative min-w-[320px] max-w-[500px] mx-auto">
                                                <div className="absolute top-[9px] sm:top-[11px] left-0 right-0 h-[2px] sm:h-[3px] bg-slate-200 z-0 rounded-full"></div>
                                                {(() => {
                                                    const steps = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
                                                    const currentStatus = order.status || 'Pending';
                                                    const activeIdx = steps.findIndex(s => s.toLowerCase() === currentStatus.toLowerCase());
                                                    const progressPercent = activeIdx === -1 ? 0 : (activeIdx / (steps.length - 1)) * 100;

                                                    return (
                                                        <>
                                                            <div className="absolute top-[9px] sm:top-[11px] left-0 h-[2px] sm:h-[3px] bg-emerald-500 z-0 transition-all duration-700 rounded-full" style={{ width: `${progressPercent}%` }}></div>
                                                            {steps.map((step, idx) => {
                                                                const isDone = idx <= (activeIdx === -1 ? 0 : activeIdx);
                                                                return (
                                                                    <div key={step} className="relative z-1 flex flex-col items-center gap-1.5 sm:gap-2">
                                                                        <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center transition-colors ${isDone ? 'bg-emerald-500 shadow-md' : 'bg-white border-2 border-slate-300'}`}>
                                                                            {isDone && <CheckCircle2 size={10} className="text-white sm:w-[12px] sm:h-[12px]" />}
                                                                        </div>
                                                                        <span className={`text-[9px] sm:text-[11px] font-black uppercase tracking-tighter text-center max-w-[50px] leading-tight ${isDone ? 'text-slate-900' : 'text-slate-400'}`}>{step}</span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    )}

                                    {/* Items List */}
                                    <div className="space-y-6">
                                        {order.items?.map((item, idx) => (
                                            <div key={idx} className="flex flex-col lg:flex-row gap-4 sm:gap-5 items-start lg:items-center py-4 border-t border-slate-100 first:border-none">
                                                
                                                <div className="flex flex-row gap-4 flex-1 w-full">
                                                    {/* Left: Product Image */}
                                                    <div className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] rounded-lg overflow-hidden border border-slate-100 bg-white flex-shrink-0 p-2 shadow-inner">
                                                        <img
                                                            src={getImageUrl(item.imageUrl) || `https://via.placeholder.com/200x200/f8fafc/94a3b8?text=${encodeURIComponent(item.name?.charAt(0) || 'P')}`}
                                                            alt={item.name}
                                                            className="w-full h-full object-contain"
                                                        />
                                                    </div>

                                                    {/* Center: Product Details */}
                                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                        <h4 className="text-[14px] sm:text-base font-bold text-primary hover:text-[#c45500] hover:underline cursor-pointer leading-tight mb-1 truncate line-clamp-2 sm:line-clamp-1 whitespace-normal sm:whitespace-nowrap">
                                                            {item.name}
                                                        </h4>
                                                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm font-bold text-slate-500 mb-1">
                                                            <span>Qty: {item.quantity}</span>
                                                            <span className="text-slate-900">{formatINR(item.priceAtPurchase || item.price)}</span>
                                                        </div>
                                                        <p className="text-[10px] sm:text-[12px] text-slate-400 font-medium">Eligible for return until 30 days after delivery</p>
                                                    </div>
                                                </div>

                                                {/* Right: Actions */}
                                                <div className="grid grid-cols-2 lg:flex lg:flex-col gap-2 w-full lg:w-[180px]">
                                                    <button
                                                        onClick={() => navigate(`/review/${item.productId}`)}
                                                        className="w-full h-9 bg-white border border-slate-300 rounded-lg text-[11px] sm:text-[12px] font-bold text-slate-800 hover:bg-slate-50 shadow-sm transition-all flex items-center justify-center gap-1.5 sm:gap-2"
                                                    >
                                                        <Star size={14} className="text-amber-400 fill-amber-400" /> Write a review
                                                    </button>
                                                    <button
                                                        onClick={() => navigate('/returns')}
                                                        className="w-full h-9 bg-white border border-slate-300 rounded-lg text-[11px] sm:text-[12px] font-bold text-slate-800 hover:bg-slate-50 shadow-sm transition-all flex items-center justify-center gap-1.5 sm:gap-2"
                                                    >
                                                        <Undo2 size={14} /> Return items
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
