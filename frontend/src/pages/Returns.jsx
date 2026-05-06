import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserOrders, returnOrder } from '../api/userApi';
import { Undo2, Package, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import useMobile from '../hooks/useMobile';
import { getImageUrl } from '../utils/imageConfig';

export default function Returns() {
    const [orders, setOrders] = useState([]);
    const [returnTracking, setReturnTracking] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [reason, setReason] = useState('');
    const [proofImages, setProofImages] = useState([]);
    const [refundMethod, setRefundMethod] = useState('');
    const [upiId, setUpiId] = useState('');
    const [bankAccount, setBankAccount] = useState('');
    const [ifsc, setIfsc] = useState('');
    
    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const navigate = useNavigate();
    const isMobile = useMobile();

    useEffect(() => {
        async function fetchOrders() {
            try {
                const data = await getUserOrders();
                const now = new Date();
                
                // Active returns tracking
                const tracking = data.filter(o => o.return && o.return.status && o.return.status !== 'None');
                setReturnTracking(tracking);

                // Returnable: Delivered, within 7 days, and no active return
                const returnable = data.filter(o => {
                    if (o.status?.toLowerCase() !== 'delivered') return false;
                    if (o.return && o.return.status && o.return.status !== 'None') return false;
                    
                    if (o.timeline?.deliveredAt) {
                        const deliveredDate = new Date(o.timeline.deliveredAt);
                        const diffDays = Math.ceil(Math.abs(now - deliveredDate) / (1000 * 60 * 60 * 24));
                        if(diffDays > 7) return false;
                    }
                    return true;
                });
                setOrders(returnable);
            } catch (err) {
                console.error('Failed to load orders for return:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchOrders();
    }, []);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 3) {
            alert('Maximum 3 images allowed');
            return;
        }
        setProofImages(files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedOrder || !reason) return;

        try {
            setSubmitting(true);
            const oid = selectedOrder._id || selectedOrder.id;
            
            const formData = new FormData();
            formData.append('reason', reason);
            
            proofImages.forEach(file => {
                formData.append('proofImages', file);
            });

            const isCOD = selectedOrder.payment?.method === 'Cash' || selectedOrder.payment?.provider === 'COD';
            let methodToSave = isCOD ? refundMethod : 'Original Method';
            formData.append('refundMethod', methodToSave);

            if (isCOD) {
                if (refundMethod === 'UPI') {
                    formData.append('refundDetails', JSON.stringify({ upiId }));
                } else if (refundMethod === 'Bank Transfer') {
                    formData.append('refundDetails', JSON.stringify({ bankAccount, ifsc }));
                } else {
                    return alert("Please select a refund method for your Cash on Delivery order.");
                }
            }

            // Using standard axios put instead of the wrapper if it doesn't support FormData
            // We'll update userApi returnOrder to handle FormData if it didn't, we will assume apiClient handles it if passed
            await returnOrder(oid, formData);
            
            setSuccessMsg('Return request submitted successfully. We will verify and schedule a pickup.');
            
            // Move to tracking
            const updatedOrder = { ...selectedOrder, return: { status: 'Requested', refundStatus: 'Pending', reason } };
            setReturnTracking([updatedOrder, ...returnTracking]);
            setOrders(orders.filter(o => (o._id || o.id) !== oid));
            
            setSelectedOrder(null);
            setReason('');
            setProofImages([]);
            setRefundMethod('');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit return request');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-bg-primary flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className={`min-h-[80vh] bg-bg-primary ${isMobile ? 'px-4 py-8' : 'px-8 py-12'}`}>
            <div className="max-w-[1000px] mx-auto">
                <div className="mb-10 pb-6 border-b border-slate-200 flex flex-col md:flex-row justify-between md:items-end gap-4">
                    <div>
                        <h1 className="text-3xl font-[900] text-slate-900 tracking-tight flex items-center gap-3">
                            <Undo2 size={32} className="text-primary" /> Returns & Refunds
                        </h1>
                        <p className="text-slate-500 mt-2 font-medium">Initiate a new return or track your existing requests.</p>
                    </div>
                </div>

                {successMsg && (
                    <div className="mb-8 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl flex items-center gap-3 font-semibold shadow-sm">
                        <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                        {successMsg}
                    </div>
                )}

                {/* Return Tracking Section */}
                {returnTracking.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-xl font-bold text-slate-800 mb-6">Track Your Returns</h2>
                        <div className="grid gap-4">
                            {returnTracking.map((order) => {
                                const ret = order.return;
                                const isRejected = ret.status === 'Rejected';
                                const statuses = ['Requested', 'Approved', 'Pickup Scheduled', 'Picked Up', 'Completed'];
                                let currentIndex = statuses.indexOf(ret.status);
                                if (currentIndex === -1) currentIndex = isRejected ? 0 : 4; // fallback

                                return (
                                    <div key={order._id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <div className="font-black text-slate-900 border-b border-slate-100 pb-2 mb-2">Order #{order._id?.slice(-8).toUpperCase()}</div>
                                                <div className="text-sm text-slate-500"><span className="font-semibold text-slate-700">Reason:</span> {ret.reason}</div>
                                                {isRejected && ret.rejectionReason && (
                                                    <div className="text-sm text-red-600 mt-1 bg-red-50 px-3 py-1.5 rounded-md inline-block font-medium">Reject Reason: {ret.rejectionReason}</div>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-sm font-bold px-3 py-1 rounded-full ${isRejected ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                                                    {ret.status}
                                                </div>
                                                <div className="text-xs font-semibold text-slate-400 mt-2">Refund: {ret.refundStatus}</div>
                                            </div>
                                        </div>

                                        {!isRejected && (
                                            <div className="w-full bg-slate-50 rounded-xl p-6 border border-slate-100">
                                                <div className="relative">
                                                    <div className="absolute top-1/2 left-0 w-full h-1.5 bg-slate-200 rounded-full -translate-y-1/2"></div>
                                                    <div className="absolute top-1/2 left-0 h-1.5 bg-primary rounded-full transition-all duration-500" style={{ width: `${(currentIndex / 4) * 100}%` }}></div>
                                                    
                                                    <div className="relative flex justify-between">
                                                        {statuses.map((step, idx) => (
                                                            <div key={idx} className="flex flex-col items-center">
                                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] z-10 transition-colors ${idx <= currentIndex ? 'bg-primary text-white ring-4 ring-blue-50' : 'bg-slate-200 text-slate-400 border-2 border-white'}`}>
                                                                    {idx <= currentIndex ? '✓' : idx + 1}
                                                                </div>
                                                                <div className={`text-[10px] sm:text-xs font-bold mt-2 text-center absolute top-8 w-24 -ml-12 ${idx <= currentIndex ? 'text-slate-800' : 'text-slate-400'}`}>
                                                                    {step}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="h-8"></div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Initiate New Return Section */}
                <h2 className="text-xl font-bold text-slate-800 mb-6">Eligible for Return</h2>
                
                {orders.length === 0 ? (
                    <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center shadow-sm">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package size={32} className="text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">No eligible orders found</h3>
                        <p className="text-slate-500 mb-6">You don't have any recently delivered orders that are eligible for return (within 7 days).</p>
                        <button onClick={() => navigate('/orders')} className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors">
                            View Order History
                        </button>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-[1fr_400px] gap-8">
                        <div className="space-y-4">
                            {orders.map((order) => {
                                const oid = order._id || order.id;
                                const isSelected = selectedOrder && (selectedOrder._id || selectedOrder.id) === oid;
                                return (
                                    <div
                                        key={oid}
                                        onClick={() => setSelectedOrder(order)}
                                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${isSelected ? 'border-primary bg-blue-50/50 shadow-md shadow-primary/10' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <div className="text-xs font-bold text-slate-500 mb-1">Delivered on {order.timeline?.deliveredAt ? new Date(order.timeline.deliveredAt).toLocaleDateString() : 'Unknown'}</div>
                                                <div className="font-black text-slate-900">Order #{oid.slice(-8).toUpperCase()}</div>
                                            </div>
                                            <div className="font-bold text-slate-900">₹{order.pricing?.grandTotal || order.total}</div>
                                        </div>
                                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                                            {order.items?.map((item, idx) => (
                                                <div key={idx} className="w-12 h-12 rounded border border-slate-200 bg-white p-1 flex-shrink-0">
                                                    <img src={getImageUrl(item.imageUrl)} alt="item" className="w-full h-full object-contain" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div>
                            <div className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24 ${!selectedOrder && 'opacity-50 pointer-events-none'}`}>
                                <h2 className="text-lg font-black text-slate-800 mb-4">Return Details</h2>
                                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Reason for return *</label>
                                        <select
                                            required
                                            value={reason}
                                            onChange={e => setReason(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-sm font-medium outline-none focus:border-primary focus:bg-white transition-colors"
                                        >
                                            <option value="">Select a reason</option>
                                            <option value="Defective or damaged item">Defective or damaged item</option>
                                            <option value="Wrong item sent">Wrong item sent</option>
                                            <option value="Item doesn't match description">Item doesn't match description</option>
                                            <option value="Missing parts or accessories">Missing parts or accessories</option>
                                            <option value="No longer needed">No longer needed</option>
                                            <option value="Quality issue">Quality issue</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Proof Images (Optional, Max 3)</label>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                                        />
                                    </div>

                                    {selectedOrder && (selectedOrder.payment?.method === 'Cash' || selectedOrder.payment?.provider === 'COD') ? (
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-2">
                                            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Refund Destination for COD</label>
                                            <div className="flex gap-4 mb-4">
                                                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                                                    <input type="radio" value="UPI" checked={refundMethod === 'UPI'} onChange={() => setRefundMethod('UPI')} className="accent-primary" />
                                                    UPI ID
                                                </label>
                                                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                                                    <input type="radio" value="Bank Transfer" checked={refundMethod === 'Bank Transfer'} onChange={() => setRefundMethod('Bank Transfer')} className="accent-primary" />
                                                    Bank Transfer
                                                </label>
                                            </div>

                                            {refundMethod === 'UPI' && (
                                                <input 
                                                    type="text" 
                                                    placeholder="Enter UPI ID (e.g., number@upi)" 
                                                    value={upiId} onChange={e => setUpiId(e.target.value)} 
                                                    required 
                                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-sm outline-none focus:border-primary"
                                                />
                                            )}
                                            {refundMethod === 'Bank Transfer' && (
                                                <div className="space-y-3">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Account Number" 
                                                        value={bankAccount} onChange={e => setBankAccount(e.target.value)} 
                                                        required 
                                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-sm outline-none focus:border-primary"
                                                    />
                                                    <input 
                                                        type="text" 
                                                        placeholder="IFSC Code" 
                                                        value={ifsc} onChange={e => setIfsc(e.target.value)} 
                                                        required 
                                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-sm outline-none focus:border-primary uppercase"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-xs text-slate-600 font-medium leading-relaxed mt-2 bg-emerald-50 text-emerald-800 p-3 rounded-lg border border-emerald-100 flex items-start gap-2">
                                            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                                            Refund will automatically be credited to your original payment method within 5-7 business days after QC.
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={submitting || !reason || (selectedOrder?.payment?.method === 'Cash' && !refundMethod)}
                                        className="w-full mt-4 py-3.5 bg-[#FFD814] hover:bg-[#F7CA00] text-slate-900 border border-[#FCD200] rounded-xl font-bold text-sm shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? 'Submitting...' : 'Confirm Return Request'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
