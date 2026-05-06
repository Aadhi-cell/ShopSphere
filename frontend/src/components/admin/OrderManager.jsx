import React, { useState, useEffect } from 'react';
import { getAdminOrders, updateOrderStatusAdmin, handleOrderReturnAdmin } from '../../api/adminApi';
import { ShoppingBag, Search, X, Package, Clock, RefreshCcw, FileText, CheckCircle2, XCircle, AlertCircle, RefreshCw, User, MapPin, CreditCard, Truck, Receipt, ExternalLink, Download, ArrowLeft, MoreVertical, Edit2, Globe } from 'lucide-react';
import { getImageUrl } from '../../utils/imageConfig';

const formatINR = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

export default function OrderManager({ activeSubTab }) {
    const [activeTab, setActiveTab] = useState('all-orders');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        loadOrders();
    }, []);

    useEffect(() => {
        if (activeSubTab === 'orders-status') setActiveTab('status-control');
        else if (activeSubTab === 'orders-returns') setActiveTab('returns');
        else setActiveTab('all-orders');
    }, [activeSubTab]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await getAdminOrders();
            setOrders(data);
        } catch (error) {
            console.error('Failed to load orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus, tracking) => {
        try {
            await updateOrderStatusAdmin(orderId, newStatus, tracking);
            setOrders(prev => prev.map(o => o.id === orderId ? {
                ...o,
                status: newStatus,
                tracking: tracking || o.tracking,
                payment: newStatus === 'Delivered' ? { ...o.payment, status: 'Paid' } : o.payment
            } : o));
            if (selectedOrder?.id === orderId) {
                setSelectedOrder(prev => ({
                    ...prev,
                    status: newStatus,
                    tracking: tracking || prev.tracking,
                    payment: newStatus === 'Delivered' ? { ...prev.payment, status: 'Paid' } : prev.payment
                }));
            }
        } catch (error) {
            alert('Failed to update order status');
        }
    };

    const handleReturnAction = async (orderId, actionData) => {
        try {
            const response = await handleOrderReturnAdmin(orderId, actionData);
            if (response && response.success && response.order) {
                // Normalize the returned order to ensure it has an 'id' field for consistent matching
                const updatedOrder = {
                    ...response.order,
                    id: response.order.id || response.order._id?.toString()
                };
                setOrders(prev => prev.map(o => {
                    const oId = (o.id || o._id)?.toString();
                    return oId === orderId?.toString() ? updatedOrder : o;
                }));
                if (selectedOrder && (selectedOrder.id || selectedOrder._id)?.toString() === orderId?.toString()) {
                    setSelectedOrder(updatedOrder);
                }
            } else {
                // Fallback: apply changes locally
                setOrders(prev => prev.map(o => {
                    const oId = (o.id || o._id)?.toString();
                    if (oId === orderId?.toString()) {
                        return {
                            ...o,
                            return: {
                                ...o.return,
                                status: actionData.returnStatus || o.return?.status,
                                refundStatus: actionData.refundStatus || o.return?.refundStatus,
                                rejectionReason: actionData.rejectionReason || o.return?.rejectionReason
                            }
                        };
                    }
                    return o;
                }));
            }
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to process return/refund');
        }
    };

    // Derived data
    const filteredOrders = orders.filter(o =>
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeOrders = filteredOrders.filter(o => !['Delivered', 'Cancelled'].includes(o.status));
    const returnRequests = filteredOrders.filter(o => o.return && o.return.status && o.return.status !== 'None');

    return (
        <div className="animate-in fade-in duration-500 max-w-[1400px] mx-auto">
            {/* Header section with Tabs and Search */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-8">
                <div>
                    <h2 className="text-3xl font-[1000] text-slate-900 tracking-tight flex items-center gap-3">
                        <ShoppingBag className="text-blue-600" size={32} />
                        Order Management
                    </h2>
                    <p className="text-slate-500 font-semibold mt-2">Monitor fulfillments, update tracking status, and process returns.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full sm:w-auto overflow-x-auto shadow-inner border border-slate-200">
                        <TabButton
                            active={activeTab === 'all-orders'}
                            onClick={() => { setActiveTab('all-orders'); setSelectedOrder(null); }}
                            count={orders.length}
                        >
                            All Orders
                        </TabButton>
                        <TabButton
                            active={activeTab === 'status-control'}
                            onClick={() => { setActiveTab('status-control'); setSelectedOrder(null); }}
                            count={activeOrders.length}
                        >
                            Status Control
                        </TabButton>
                        <TabButton
                            active={activeTab === 'returns'}
                            onClick={() => { setActiveTab('returns'); setSelectedOrder(null); }}
                            count={returnRequests.filter(r => r.return.status === 'Requested').length}
                            highlight={true}
                        >
                            Returns & Refunds
                        </TabButton>
                    </div>

                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by Order ID, Customer..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <button
                        onClick={loadOrders}
                        className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm"
                        title="Sync Data"
                    >
                        <RefreshCcw size={20} />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[24px] shadow-sm border border-slate-200/60 overflow-hidden relative min-h-[500px]">
                {loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
                        <RefreshCw className="animate-spin text-blue-600 mb-4" size={40} />
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Aggregate Logistics...</span>
                    </div>
                ) : selectedOrder ? (
                    <OrderDetailsView order={selectedOrder} onBack={() => setSelectedOrder(null)} onUpdateStatus={handleUpdateStatus} />
                ) : (
                    <div className="overflow-x-auto">
                        {activeTab === 'all-orders' && <AllOrdersTable orders={filteredOrders} onViewDetails={setSelectedOrder} />}
                        {activeTab === 'status-control' && <StatusControlTable orders={activeOrders} onUpdateStatus={handleUpdateStatus} />}
                        {activeTab === 'returns' && <ReturnsTable requests={returnRequests} onAction={handleReturnAction} />}
                    </div>
                )}
            </div>
        </div>
    );
}

function TabButton({ children, active, onClick, count, highlight }) {
    return (
        <button
            onClick={onClick}
            className={`relative px-6 py-2.5 rounded-xl text-[13px] font-bold tracking-wide transition-all min-w-[120px] whitespace-nowrap flex items-center justify-center gap-2
                ${active
                    ? 'bg-white text-blue-700 shadow-sm border border-slate-200/50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 border border-transparent'}
            `}
        >
            {children}
            {count !== undefined && (
                <span className={`text-[11px] px-2 py-0.5 rounded-full
                    ${active ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'}
                    ${highlight && !active && count > 0 ? 'bg-amber-100 text-amber-700' : ''}
                `}>
                    {count}
                </span>
            )}
        </button>
    );
}

function AllOrdersTable({ orders, onViewDetails }) {
    if (orders.length === 0) return <EmptyState tabName="Orders" />;

    return (
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Order ID</th>
                    <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                    <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Items</th>
                    <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                    <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Payment</th>
                    <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                    <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Ordered Date</th>
                    <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
                {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-blue-50/30 transition-colors group cursor-pointer" onClick={() => onViewDetails(order)}>
                        <td className="px-6 py-4">
                            <span className="font-bold text-slate-900 text-[13px] font-mono tracking-tight group-hover:text-blue-600 transition-colors">
                                #{order.id.toString().slice(-8).toUpperCase()}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-500 shrink-0 capitalize">
                                    {(order.customerName || 'G')[0]}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="font-bold text-slate-800 text-[13px] truncate">{order.customerName || 'Guest User'}</span>
                                    <span className="text-[11px] text-slate-400 font-semibold truncate lowercase">{order.customerEmail || 'no-email'}</span>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center justify-center px-2 py-0.5 bg-slate-100 rounded-md text-slate-600 font-bold text-[11px] border border-slate-200">
                                {order.items?.length || 0}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex flex-col">
                                <span className="font-black text-slate-900 text-[14px]">{formatINR(order.pricing?.grandTotal || order.total)}</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{order.payment?.method || order.payment_method || 'COD'}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border
                                    ${(order.payment?.status || order.payment_status) === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                        (order.payment?.status || order.payment_status) === 'Failed' ? 'bg-red-50 text-red-600 border-red-100' :
                                            'bg-amber-50 text-amber-700 border-amber-100'}
                                `}>
                                    {order.payment?.status || order.payment_status || 'Pending'}
                                </span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <OrderStatusBadge status={order.status} />
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex flex-col">
                                <span className="text-[12px] font-bold text-slate-700">{new Date(order.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                <span className="text-[10px] text-slate-400 font-semibold">{new Date(order.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <button
                                onClick={(e) => { e.stopPropagation(); onViewDetails(order); }}
                                className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                            >
                                <ExternalLink size={16} />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function StatusControlTable({ orders, onUpdateStatus }) {
    if (orders.length === 0) return <EmptyState tabName="Active Orders" icon={<CheckCircle2 size={48} className="text-emerald-500 mb-4" />} message="No active orders pending fulfillment." />;

    return (
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[12px] font-black text-slate-500 uppercase tracking-widest">Order ID</th>
                    <th className="px-6 py-4 text-[12px] font-black text-slate-500 uppercase tracking-widest">Customer</th>
                    <th className="px-6 py-4 text-[12px] font-black text-slate-500 uppercase tracking-widest text-center">Current Status</th>
                    <th className="px-6 py-4 text-[12px] font-black text-slate-500 uppercase tracking-widest text-right">Update Status</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4">
                            <span className="font-bold text-slate-900 text-[15px]">#{order.id.toString().slice(-6).toUpperCase()}</span>
                        </td>
                        <td className="px-6 py-4">
                            <span className="font-bold text-slate-800 text-[14px]">{order.customerName || 'Guest User'}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <OrderStatusBadge status={order.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                                <select
                                    value={order.status}
                                    onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-[13px] font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 cursor-pointer shadow-sm"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Processing">Processing</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function ReturnsTable({ requests, onAction }) {
    const [rejectingOrderId, setRejectingOrderId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    const handleReject = (orderId) => {
        if (!rejectReason.trim()) return alert('Provide a rejection reason');
        onAction(orderId, { returnStatus: 'Rejected', refundStatus: 'Failed', rejectionReason: rejectReason });
        setRejectingOrderId(null);
        setRejectReason('');
    };

    if (requests.length === 0) return <EmptyState tabName="Return Requests" icon={<CheckCircle2 size={48} className="text-emerald-500 mb-4" />} message="No pending return or refund requests." />;

    return (
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[12px] font-black text-slate-500 uppercase tracking-widest">Order Info</th>
                    <th className="px-6 py-4 text-[12px] font-black text-slate-500 uppercase tracking-widest">Return Reason & Proofs</th>
                    <th className="px-6 py-4 text-[12px] font-black text-slate-500 uppercase tracking-widest">Refund Info</th>
                    <th className="px-6 py-4 text-[12px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                    <th className="px-6 py-4 text-[12px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {requests.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4 align-top">
                            <div className="flex flex-col">
                                <span className="font-bold text-slate-900 text-[14px]">#{order.id.toString().slice(-6).toUpperCase()}</span>
                                <span className="text-[12px] text-slate-500 font-medium mt-1">{order.customerName || 'Guest User'}</span>
                                <span className="text-[11px] text-slate-400 font-bold mt-1">
                                    Req: {order.return?.requestedAt ? new Date(order.return.requestedAt).toLocaleDateString('en-GB') : 'N/A'}
                                </span>
                            </div>
                        </td>
                        <td className="px-6 py-4 align-top">
                            <div className="flex flex-col gap-2 max-w-xs">
                                <div className="flex gap-2 items-start">
                                    <div className="mt-0.5 flex-shrink-0 text-amber-500"><AlertCircle size={14} /></div>
                                    <span className="text-[13px] text-slate-600 font-medium leading-relaxed">
                                        {order.return?.reason || 'No reason provided'}
                                    </span>
                                </div>
                                {order.return?.status === 'Rejected' && order.return?.rejectionReason && (
                                    <div className="flex gap-2 items-start px-3 py-2 bg-red-50 rounded-lg border border-red-100 mt-1">
                                        <div className="mt-0.5 flex-shrink-0 text-red-500"><XCircle size={14} /></div>
                                        <span className="text-[12px] text-red-700 font-medium leading-relaxed">
                                            <span className="font-bold block text-[10px] uppercase tracking-wider mb-0.5">Admin Note (Rejection)</span>
                                            {order.return.rejectionReason}
                                        </span>
                                    </div>
                                )}
                                {order.return?.proofImages && order.return.proofImages.length > 0 && (
                                    <div className="flex gap-2 mt-2 flex-wrap">
                                        {order.return.proofImages.map((img, i) => (
                                            <a key={i} href={getImageUrl(img)} target="_blank" rel="noreferrer" className="w-12 h-12 rounded border border-slate-200 overflow-hidden hover:border-blue-500 hover:shadow shadow-sm transition-all block">
                                                <img src={getImageUrl(img)} alt="proof" className="w-full h-full object-cover" />
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </td>
                        <td className="px-6 py-4 align-top">
                            <div className="flex flex-col gap-1">
                                <span className="font-black text-slate-900 text-[15px]">{formatINR(order.pricing?.grandTotal || order.total)}</span>
                                <span className="text-[11px] font-bold text-slate-500 uppercase">{order.return?.refundMethod || 'Original Method'}</span>
                                {order.return?.refundDetails && Object.keys(order.return.refundDetails).length > 0 && (
                                    <div className="mt-1 bg-slate-50 border border-slate-200 p-2 rounded-lg text-[10px] font-mono text-slate-600 word-break">
                                        {Object.entries(order.return.refundDetails).map(([k, v]) => (
                                            <div key={k} className="flex justify-between gap-2 overflow-hidden">
                                                <span className="font-bold">{k}:</span>
                                                <span className="truncate" title={v}>{v}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-center align-top">
                            <div className="flex flex-col items-center gap-1.5">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border
                                    ${['Approved', 'Pickup Scheduled', 'Picked Up', 'Completed'].includes(order.return?.status) ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                        ['Rejected', 'Quality Check Failed'].includes(order.return?.status) ? 'bg-red-50 text-red-700 border-red-200' :
                                            'bg-amber-50 text-amber-700 border-amber-200 animate-pulse-slow'}
                                `}>
                                    Return: {order.return?.status}
                                </span>
                                {['Approved', 'Pickup Scheduled', 'Picked Up', 'Completed'].includes(order.return?.status) && (
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border
                                        ${order.return?.refundStatus === 'Refunded' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-600 border-slate-200'}
                                    `}>
                                        Refund: {order.return?.refundStatus}
                                    </span>
                                )}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-right align-top">
                            {order.return?.status === 'Requested' && (
                                <div className="flex flex-col items-end gap-2">
                                    <button
                                        onClick={() => onAction(order.id, { returnStatus: 'Approved', refundStatus: 'Pending' })}
                                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[11px] font-bold tracking-wide transition-all shadow-sm flex items-center justify-center gap-1 w-[100px]"
                                    >
                                        <CheckCircle2 size={14} /> Approve
                                    </button>

                                    {rejectingOrderId === order.id ? (
                                        <div className="flex flex-col gap-2 mt-2 w-48 text-left bg-white p-2 rounded-xl shadow-lg border border-slate-200 absolute right-10 z-10">
                                            <input type="text" placeholder="Reason for rejection" value={rejectReason} onChange={e => setRejectReason(e.target.value)} className="w-full text-xs px-2 py-1 border border-slate-200 rounded text-slate-800" />
                                            <div className="flex gap-2 justify-end">
                                                <button onClick={() => setRejectingOrderId(null)} className="text-[10px] px-2 py-1 text-slate-500 hover:bg-slate-100 rounded">Cancel</button>
                                                <button onClick={() => handleReject(order.id)} className="text-[10px] px-2 py-1 bg-red-500 text-white rounded font-bold">Confirm Reject</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setRejectingOrderId(order.id)}
                                            className="px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-[11px] font-bold tracking-wide transition-all shadow-sm flex items-center justify-center gap-1 w-[100px]"
                                        >
                                            <XCircle size={14} /> Reject
                                        </button>
                                    )}
                                </div>
                            )}

                            {order.return?.status === 'Approved' && (
                                <button onClick={() => onAction(order.id, { returnStatus: 'Pickup Scheduled' })} className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-[11px] font-bold transition-all shadow-sm w-[120px]">
                                    Schedule Pickup
                                </button>
                            )}

                            {order.return?.status === 'Pickup Scheduled' && (
                                <button onClick={() => onAction(order.id, { returnStatus: 'Picked Up' })} className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[11px] font-bold transition-all shadow-sm w-[120px]">
                                    Mark Picked Up
                                </button>
                            )}

                            {order.return?.status === 'Picked Up' && (
                                <div className="flex flex-col gap-2 items-end">
                                    <button onClick={() => onAction(order.id, { returnStatus: 'Completed', refundStatus: 'Initiated' })} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[11px] font-bold transition-all shadow-sm w-[120px]">
                                        QC Pass & Init
                                    </button>
                                    <button onClick={() => onAction(order.id, { returnStatus: 'Quality Check Failed', refundStatus: 'Failed' })} className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[11px] font-bold transition-all shadow-sm w-[120px]">
                                        QC Failed
                                    </button>
                                </div>
                            )}

                            {order.return?.status === 'Completed' && order.return?.refundStatus !== 'Refunded' && (
                                <button
                                    onClick={() => onAction(order.id, { returnStatus: 'Completed', refundStatus: 'Refunded' })}
                                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[12px] font-bold tracking-wide transition-all shadow-md shadow-blue-500/20 w-[120px] mt-2"
                                >
                                    Confirm Refund
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function OrderDetailsView({ order, onBack, onUpdateStatus }) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [trackingInfo, setTrackingInfo] = useState({
        courierName: order.tracking?.courierName || '',
        trackingNumber: order.tracking?.trackingNumber || ''
    });

    const handleStatusChange = async (newStatus) => {
        try {
            setIsUpdating(true);
            await onUpdateStatus(order.id, newStatus, trackingInfo);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-500 hover:text-slate-900 border border-slate-100">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                            Order <span className="text-blue-600">#{order.id.toString().slice(-8).toUpperCase()}</span>
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <Clock size={10} /> {new Date(order.date).toLocaleString('en-GB')}
                            </span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest">{order.payment?.method || order.payment_method || 'COD'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-1 items-end mr-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Update Workflow</label>
                        <select
                            disabled={isUpdating}
                            value={order.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-[13px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer appearance-none min-w-[160px]"
                        >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-[13px] font-bold transition-all shadow-sm">
                        <Receipt size={16} className="text-slate-400" /> Invoice
                    </button>
                </div>
            </div>

            <div className="p-8 max-w-[1400px] mx-auto grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-8">
                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
                        <h4 className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                            <Truck size={14} /> Logistics Timeline
                        </h4>
                        <div className="flex justify-between relative">
                            <div className="absolute top-[18px] left-[40px] right-[40px] h-1 bg-slate-100 z-0"></div>
                            <div className={`absolute top-[18px] left-[40px] h-1 bg-blue-500 z-0 transition-all duration-1000`} style={{
                                width: order.status === 'Pending' || order.status === 'Ordered' ? '0%' :
                                    order.status === 'Processing' ? '25%' :
                                        order.status === 'Shipped' ? '65%' :
                                            order.status === 'Delivered' ? '100%' : '0%'
                            }}></div>

                            <TimelineStep label="Placed" active={true} completed={true} date={order.timeline?.placedAt} />
                            <TimelineStep label="Processed" active={['Processing', 'Shipped', 'Delivered'].includes(order.status)} completed={['Shipped', 'Delivered'].includes(order.status)} date={order.timeline?.confirmedAt} />
                            <TimelineStep label="Shipped" active={['Shipped', 'Delivered'].includes(order.status)} completed={order.status === 'Delivered'} date={order.timeline?.shippedAt} />
                            <TimelineStep label="Delivered" active={order.status === 'Delivered'} completed={order.status === 'Delivered'} date={order.timeline?.deliveredAt} />
                        </div>
                    </div>

                    {(order.status === 'Shipped' || order.status === 'Processing') && (
                        <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
                            <Truck className="absolute -bottom-6 -right-6 text-white/10 w-48 h-48 rotate-[-15deg]" />
                            <div className="relative z-10">
                                <h4 className="text-[12px] font-black text-blue-100 uppercase tracking-widest mb-4">Shipping & Tracking Label</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[11px] font-bold text-blue-200 mb-1 block">Courier Partner</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. BlueDart, Delhivery"
                                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm font-bold placeholder:text-blue-300 outline-none focus:bg-white/20 transition-all"
                                                value={trackingInfo.courierName}
                                                onChange={(e) => setTrackingInfo(p => ({ ...p, courierName: e.target.value }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-bold text-blue-200 mb-1 block">Tracking ID / AWB</label>
                                            <input
                                                type="text"
                                                placeholder="Enter tracking number"
                                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm font-bold placeholder:text-blue-300 outline-none focus:bg-white/20 transition-all"
                                                value={trackingInfo.trackingNumber}
                                                onChange={(e) => setTrackingInfo(p => ({ ...p, trackingNumber: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleStatusChange(order.status === 'Processing' ? 'Shipped' : order.status)}
                                        className="bg-white text-blue-700 hover:bg-blue-50 h-[52px] rounded-xl font-black text-sm transition-all px-8 border-none shadow-xl flex items-center justify-center gap-2 group"
                                    >
                                        Update Tracking <Truck size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-8 py-5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                            <h4 className="text-[12px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Package size={16} /> Order Manifest ({order.items?.length || 0})
                            </h4>
                            <span className="text-[11px] font-black text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200 tracking-widest uppercase">Inventory Check</span>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {order.items?.map((item, idx) => (
                                <div key={idx} className="p-8 hover:bg-slate-50/50 transition-colors group">
                                    <div className="flex gap-6">
                                        <div className="w-24 h-24 bg-slate-100 border border-slate-200 rounded-2xl overflow-hidden shrink-0 group-hover:shadow-md transition-all">
                                            {item.imageUrl ? (
                                                <img src={getImageUrl(item.imageUrl)} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <Package size={32} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h5 className="font-black text-slate-900 text-lg group-hover:text-blue-600 transition-colors">{item.name}</h5>
                                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: #{item.productId || item._id || item.id || 'N/A'}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-lg font-black text-slate-900">{formatINR(item.priceAtPurchase || item.price)}</div>
                                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Price at purchase</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 mt-4">
                                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-lg border border-slate-200 shadow-sm">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty</span>
                                                        <span className="text-[14px] font-black text-slate-800">{item.quantity || item.qty}</span>
                                                    </div>
                                                    <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                                                        <User size={12} className="text-slate-400" />
                                                        Seller: <span className="text-blue-600 cursor-pointer hover:underline">{(item.sellerId?.businessName || item.seller_id?.businessName || 'Platform Seller')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="pt-4 mt-4 border-t border-slate-100 border-dashed flex justify-between items-center text-[13px]">
                                                <span className="text-slate-500 font-bold">Item Subtotal</span>
                                                <span className="font-black text-slate-900">{formatINR(item.lineTotal || (item.priceAtPurchase || item.price || 0) * (item.quantity || item.qty || 1))}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                        <Receipt className="absolute -top-4 -right-4 text-white/5 w-32 h-32" />
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Payout Breakdown</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400 font-bold">Subtotal</span>
                                <span className="font-bold">{formatINR(order.pricing?.subtotal || order.total)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400 font-bold">GST / Tax</span>
                                <span className="font-bold text-emerald-400">+{formatINR(order.pricing?.tax || 0)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400 font-bold">Shipping Fee</span>
                                <span className="font-bold">{formatINR(order.pricing?.shippingFee || 0)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400 font-bold">Discount</span>
                                <span className="font-bold text-rose-400">-{formatINR(order.pricing?.discount || 0)}</span>
                            </div>
                            <div className="h-px bg-white/10 my-4 border-dashed border-t"></div>
                            <div className="flex justify-between items-end">
                                <span className="text-[11px] font-black text-blue-400 uppercase tracking-widest mb-1">Grand Total</span>
                                <span className="text-3xl font-black">{formatINR(order.pricing?.grandTotal || order.total)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <User size={14} /> Profile Overview
                        </h4>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl font-black text-blue-600 shadow-inner">
                                {(order.customerName || 'G')[0]}
                            </div>
                            <div className="min-w-0">
                                <h5 className="font-black text-slate-900 truncate">{order.customerName || 'Guest User'}</h5>
                                <p className="text-[12px] font-bold text-blue-600 truncate">{order.customerEmail || 'no-email'}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-slate-50 items-start">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">User ID</span>
                                <span className="text-[13px] font-mono font-bold text-slate-700 bg-slate-50 px-2 rounded">{order.user_id?._id || order.user_id || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-50">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Phone</span>
                                <span className="text-[13px] font-bold text-slate-700">{order.customer?.phone || order.address?.mobile || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                        <MapPin className="absolute -top-4 -right-4 text-slate-50 w-24 h-24" />
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Truck size={14} /> Shipping Destination
                        </h4>
                        <div className="space-y-4 relative z-10">
                            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
                                <p className="font-black text-slate-800 mb-1">{order.address?.fullName || order.customerName}</p>
                                <p className="text-[13px] text-slate-600 font-semibold leading-relaxed">
                                    {order.address?.line1}<br />
                                    {order.address?.line2 && <>{order.address.line2}<br /></>}
                                    {order.address?.city}, {order.address?.state}<br />
                                    <span className="text-slate-900 font-black">{order.address?.postalCode}</span>, {order.address?.country || 'India'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <CreditCard size={14} /> Settlement Record
                        </h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                        <Globe size={14} className="text-blue-600" />
                                    </div>
                                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-tighter">Gateway</span>
                                </div>
                                <span className="text-[13px] font-black text-slate-800">{order.payment?.provider || order.payment_provider || 'N/A'}</span>
                            </div>
                            <div className="space-y-3 px-1">
                                <p className="flex justify-between items-center text-[12px]">
                                    <span className="text-slate-400 font-bold">Verification</span>
                                    <span className={`font-black uppercase tracking-widest px-2 py-0.5 rounded text-[9px] ${(order.payment?.status || order.payment_status) === 'Paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                        {order.payment?.status || order.payment_status || 'Pending'}
                                    </span>
                                </p>
                                <p className="flex justify-between items-center text-[12px]">
                                    <span className="text-slate-400 font-bold">Settled At</span>
                                    <span className="font-bold text-slate-700">{order.payment?.paidAt ? new Date(order.payment.paidAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : (order.timeline?.placedAt ? new Date(order.timeline.placedAt).toLocaleString('en-GB') : 'N/A')}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TimelineStep({ label, active, completed, date }) {
    return (
        <div className="flex flex-col items-center gap-3 relative z-10">
            <div className={`w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all duration-500
                ${completed ? 'bg-blue-600 border-white text-white shadow-lg shadow-blue-500/40' :
                    active ? 'bg-white border-blue-600 text-blue-600 animate-pulse-slow' : 'bg-white border-slate-100 text-slate-300'}
            `}>
                {completed ? <CheckCircle2 size={18} /> : active ? <RefreshCw size={18} className="animate-spin-slow" /> : <Package size={18} />}
            </div>
            <div className="text-center">
                <p className={`text-[11px] font-black uppercase tracking-widest ${active || completed ? 'text-slate-900' : 'text-slate-400'}`}>{label}</p>
                {date && <p className="text-[9px] font-bold text-slate-400 mt-0.5">{new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>}
            </div>
        </div>
    );
}

function OrderStatusBadge({ status }) {
    const config = {
        'Pending': { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
        'Ordered': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
        'Processing': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
        'Shipped': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
        'Delivered': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
        'Cancelled': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
        'Returned': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    };

    const style = config[status] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };

    return (
        <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider border ${style.bg} ${style.text} ${style.border}`}>
            {status}
        </span>
    );
}

function EmptyState({ tabName, icon, message }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            {icon || <Search size={48} className="text-slate-300 mb-4" />}
            <h3 className="text-xl font-bold text-slate-800 mb-2">No {tabName} Found</h3>
            <p className="text-slate-500 font-medium">{message || "There are no records matching your current filter."}</p>
        </div>
    );
}
