import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getPromotionRequests, createPromotionCheckoutSession, verifyPromotionPayment } from '../../api/promotionApi';
import { Megaphone, Plus, Clock, CreditCard, BarChart3, Palette, Info } from 'lucide-react';
import EmptyState from './EmptyState';
import { getImageUrl } from '../../utils/imageConfig';

export default function PromotionsTab() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        fetchRequests();
        checkPaymentStatus();
    }, [location.search]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const data = await getPromotionRequests();
            setRequests(data);
        } catch (error) {
            console.error('Failed to fetch promotion requests', error);
        } finally {
            setLoading(false);
        }
    };

    const checkPaymentStatus = async () => {
        const params = new URLSearchParams(location.search);
        const success = params.get('success');
        const sessionId = params.get('session_id');
        const requestId = params.get('request_id');

        if (success === 'true' && sessionId && requestId) {
            try {
                setVerifying(true);
                await verifyPromotionPayment(sessionId, requestId);
                alert('Payment verified! Your promotion is now active.');
                navigate('/seller?tab=promotions', { replace: true });
                fetchRequests();
            } catch (err) {
                console.error('Payment verification failed', err);
            } finally {
                setVerifying(false);
            }
        }
    };

    const handlePayNow = async (id) => {
        try {
            const data = await createPromotionCheckoutSession(id);
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error('Payment session creation failed', error);
            alert('Failed to initiate payment.');
        }
    };

    if (loading || verifying) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-slate-400 animate-pulse">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="font-black text-xs uppercase tracking-widest">
                    {verifying ? 'Verifying Payment...' : 'Loading Promotions...'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Megaphone size={20} className="text-[#2874f0]" /> Banner Campaigns
                    </h2>
                    <p className="text-slate-500 font-bold text-[12px] mt-1">Grow your visibility with professional banner placements.</p>
                </div>
                <button
                    onClick={() => navigate('/seller/request-promotion')}
                    className="w-full sm:w-auto justify-center px-6 py-3 bg-[#2874f0] text-white rounded-xl font-black text-[11px] flex items-center gap-2 transition-all hover:bg-[#1260e0] shadow-sm uppercase tracking-widest cursor-pointer border-none"
                >
                    <Plus size={14} strokeWidth={3} /> New Promotion
                </button>
            </div>

            {requests.length === 0 ? (
                <div className="bg-white rounded-[24px] border border-slate-200 p-12 min-h-[400px] flex items-center justify-center shadow-sm">
                    <EmptyState
                        title="No Promotions Yet"
                        description="Drive more sales by requesting a homepage banner promotion for your best products."
                        icon={Megaphone}
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {requests.map(req => {
                        const statusSteps = ['Requested', 'Verified', 'Banner Ready', 'Payment Pending', 'Approved', 'Active'];
                        const currentStepIndex = statusSteps.indexOf(req.status);
                        
                        return (
                            <div key={req._id} className="bg-white rounded-[32px] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden flex flex-col group transition-all hover:border-primary/20">
                                {/* Card Header with Analytics */}
                                <div className="p-8 pb-4">
                                    <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4 sm:gap-0">
                                        <div className="min-w-0 flex-1 w-full">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <span className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest leading-none shadow-lg shadow-slate-200">
                                                    {req.bannerType}
                                                </span>
                                                {req.paymentStatus === 'Paid' && (
                                                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                                                        LIVE & MONETIZING
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-xl font-[1000] text-slate-900 tracking-tight mb-1 truncate max-w-full sm:max-w-[280px]">
                                                {req.bannerTitle}
                                            </h3>
                                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2 flex-wrap">
                                                <Clock size={12} className="shrink-0" /> {new Date(req.preferredStartDate).toLocaleDateString()} - {new Date(req.preferredEndDate).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <div className="text-left sm:text-right shrink-0">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Campaign Value</p>
                                            <p className="text-2xl font-[1000] text-slate-900 italic leading-none">₹{req.paymentAmount}</p>
                                        </div>
                                    </div>

                                    {/* Timeline Visualizer */}
                                    <div className="relative pt-8 pb-10 px-2 overflow-x-auto no-scrollbar">
                                        <div className="min-w-[400px]">
                                            <div className="absolute top-10 left-2 right-2 h-1 bg-slate-100 rounded-full">
                                                <div 
                                                    className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                                                    style={{ width: `${Math.max(0, (currentStepIndex / (statusSteps.length - 1)) * 100)}%` }}
                                                ></div>
                                            </div>
                                            <div className="relative flex justify-between">
                                                {statusSteps.map((step, idx) => (
                                                    <div key={step} className="flex flex-col items-center">
                                                        <div className={`w-5 h-5 rounded-full border-4 transition-all duration-500 z-10 ${
                                                            idx <= currentStepIndex ? 'bg-primary border-blue-100 scale-125' : 'bg-white border-slate-100'
                                                        }`}></div>
                                                        <span className={`absolute -bottom-6 text-[8px] font-black uppercase tracking-tighter whitespace-nowrap transition-colors duration-500 ${
                                                            idx <= currentStepIndex ? 'text-primary' : 'text-slate-300'
                                                        }`}>
                                                            {step}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Banner Preview or Design Area */}
                                <div className="px-8 py-4">
                                    {req.bannerUrl ? (
                                        <div className="relative aspect-[21/9] rounded-[24px] overflow-hidden border border-slate-100 shadow-xl group/banner cursor-pointer">
                                            <img src={getImageUrl(req.bannerUrl)} alt="Campaign Ad" className="w-full h-full object-cover group-hover/banner:scale-105 transition-transform duration-1000" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/banner:opacity-100 transition-opacity flex items-end p-6">
                                                <p className="text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                    Preview Active Visual <BarChart3 size={14} />
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="aspect-[21/9] rounded-[24px] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300">
                                            <Palette size={32} className="mb-2 opacity-50" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">Admin Creative Team is Designing</p>
                                            <p className="text-[9px] font-bold text-slate-400 mt-1 italic">Professional visuals ensure 2.5x better CTR</p>
                                        </div>
                                    )}
                                </div>

                                {/* Detailed Analytics Segment */}
                                <div className="p-8 pt-4 space-y-6">
                                    {req.paymentStatus === 'Paid' ? (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-slate-50 rounded-3xl border border-slate-100 shadow-inner">
                                            <div className="text-center group/stat">
                                                <p className="text-[9px] font-black text-slate-400 uppercase mb-2 group-hover/stat:text-primary transition-colors">Reach</p>
                                                <p className="text-lg font-black text-slate-900 leading-none tracking-tighter">{req.performance?.impressions || 0}</p>
                                            </div>
                                            <div className="text-center md:border-l border-slate-200 group/stat md:pl-2">
                                                <p className="text-[9px] font-black text-slate-400 uppercase mb-2 group-hover/stat:text-primary transition-colors">Clicks</p>
                                                <p className="text-lg font-black text-slate-900 leading-none tracking-tighter">{req.performance?.clicks || 0}</p>
                                            </div>
                                            <div className="text-center border-t border-slate-200 md:border-t-0 md:border-l group/stat pt-4 md:pt-0 md:pl-2">
                                                <p className="text-[9px] font-black text-slate-400 uppercase mb-2 group-hover/stat:text-primary transition-colors">Sales</p>
                                                <p className="text-lg font-black text-emerald-600 leading-none tracking-tighter">{req.performance?.conversions || 0}</p>
                                            </div>
                                            <div className="text-center border-t border-slate-200 md:border-t-0 md:border-l group/stat pt-4 md:pt-0 md:pl-2">
                                                <p className="text-[9px] font-black text-slate-400 uppercase mb-2 group-hover/stat:text-primary transition-colors">Revenue</p>
                                                <p className="text-lg font-black text-slate-900 leading-none tracking-tighter">₹{req.performance?.revenue || 0}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-xl border ${req.status === 'Rejected' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-blue-50 text-blue-500 border-blue-100'}`}>
                                                    <Info size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-900 uppercase">Moderator Notes</p>
                                                    <p className="text-[11px] text-slate-500 font-bold italic mt-0.5">
                                                        {req.verificationNotes || 'Your campaign is currently being audited by our quality assurance team.'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Footer Action */}
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-2 gap-4 sm:gap-0">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${
                                                req.status === 'Active' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 
                                                req.status === 'Rejected' ? 'bg-red-500' : 'bg-primary animate-pulse'
                                            }`}></div>
                                            <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{req.status}</p>
                                        </div>

                                        {req.status === 'Payment Pending' && req.paymentStatus === 'Pending' ? (
                                            <button
                                                onClick={() => handlePayNow(req._id)}
                                                className="w-full sm:w-auto justify-center px-8 py-4 bg-primary text-white rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-blue-200 active:scale-95 flex items-center gap-2 group"
                                            >
                                                <CreditCard size={18} className="group-hover:animate-bounce shrink-0" /> Complete Payment
                                            </button>
                                        ) : (
                                            <div className={`w-full sm:w-auto text-center px-5 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest ${
                                                req.status === 'Requested' ? 'bg-slate-50 text-slate-400 border-slate-100' : 
                                                req.status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                                                'bg-emerald-50 text-emerald-700 border-emerald-100'
                                            }`}>
                                                {req.status === 'Requested' ? 'Awaiting Verify' : req.status === 'Rejected' ? 'Archived' : 'Verified & Live'}
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
    );
}
