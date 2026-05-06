import React, { useState, useEffect } from 'react';
import { getAdminPromotionRequests, verifyPromotionRequest, createPromotionBanner, deletePromotionRequest } from '../../api/adminPromotionApi';
import { CheckCircle, XCircle, Clock, Image as ImageIcon, Trash2, Info, AlertTriangle, Palette, ShieldCheck, Zap, Activity, Megaphone } from 'lucide-react';
import { getImageUrl } from '../../utils/imageConfig';

export default function PromotionManager() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [bannerTitle, setBannerTitle] = useState('');
    const [bannerSubtitle, setBannerSubtitle] = useState('');
    const [tagline, setTagline] = useState('');
    const [label, setLabel] = useState('');
    const [offer, setOffer] = useState('');
    const [bankOffer, setBankOffer] = useState('');
    const [brandColor, setBrandColor] = useState('#2874f0');
    const [redirectLink, setRedirectLink] = useState('/');
    const [verifyingId, setVerifyingId] = useState(null);
    const [verificationNote, setVerificationNote] = useState('');
    const [bannerForm, setBannerForm] = useState({
        title: '',
        subtitle: '',
        buttonText: 'Shop Now',
        redirectLink: '/',
        startDate: '',
        endDate: '',
        priority: 0,
        bannerType: 'Homepage',
        status: 'Active',
    });
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const data = await getAdminPromotionRequests();
            setRequests(data);
        } catch (error) {
            console.error('Failed to fetch promotion requests', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id, isVerified) => {
        try {
            await verifyPromotionRequest(id, isVerified, verificationNote);
            setVerifyingId(null);
            setVerificationNote('');
            fetchRequests();
        } catch (error) {
            alert(error.response?.data?.message || 'Verification failed');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to permanently delete this request? This will also remove any associated banners.')) return;
        try {
            await deletePromotionRequest(id);
            fetchRequests();
        } catch (error) {
            console.error('Delete failed', error);
            alert('Failed to delete request');
        }
    };

    const openCreateBanner = (req) => {
        setSelectedRequest(req);
        setBannerTitle(req.bannerTitle || '');
        setBannerSubtitle(req.bannerSubtitle || '');
        setTagline(req.tagline || '');
        setLabel(req.label || '');
        setOffer(req.offer || '');
        setBankOffer(req.bankOffer || '');
        setBrandColor(req.color || '#2874f0');
        setRedirectLink(req.productId ? `/product/${req.productId._id || req.productId}` : '/');
        setBannerForm({
            title: req.bannerTitle,
            subtitle: req.bannerSubtitle || '',
            buttonText: 'Shop Now',
            redirectLink: req.productId ? `/products/${req.productId._id}` : '/',
            startDate: new Date(req.preferredStartDate).toISOString().split('T')[0],
            endDate: new Date(req.preferredEndDate).toISOString().split('T')[0],
            priority: req.paymentStatus === 'Paid' ? 10 : 0,
            bannerType: req.bannerType,
            status: 'Active',
        });
    };

    const handleBannerSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('buttonText', bannerForm.buttonText);
            formData.append('startDate', bannerForm.startDate);
            formData.append('endDate', bannerForm.endDate);
            formData.append('priority', bannerForm.priority);
            formData.append('bannerType', bannerForm.bannerType);
            formData.append('status', bannerForm.status);

            formData.append('title', bannerTitle);
            formData.append('subtitle', bannerSubtitle);
            formData.append('tagline', tagline);
            formData.append('label', label);
            formData.append('offer', offer);
            formData.append('bankOffer', bankOffer);
            formData.append('color', brandColor);
            formData.append('redirectLink', redirectLink);
            if (imageFile) formData.append('imageFile', imageFile);
            formData.append('promotionRequestId', selectedRequest._id);
            if (selectedRequest.sellerId) {
                formData.append('sellerId', selectedRequest.sellerId._id || selectedRequest.sellerId);
            }

            await createPromotionBanner(formData);
            alert('Banner created! Campaign moved to Payment Pending.');
            setSelectedRequest(null);
            fetchRequests();
        } catch (error) {
            console.error('Failed to create banner', error);
            alert('Failed to create banner: ' + (error.response?.data?.message || error.message));
        }
    };

    if (loading && !requests.length) {
        return (
            <div className="flex flex-col items-center justify-center p-32 space-y-4">
                <div className="w-10 h-10 border-4 border-slate-100 border-t-primary rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading Moderation Queue</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-[1000] text-gray-900 tracking-tighter mb-1 uppercase italic">
                        Campaign <span className="border-b-4 border-gray-900 not-italic">Moderation</span>
                    </h2>
                    <p className="text-gray-500 font-bold text-[11px] uppercase tracking-widest flex items-center gap-2">
                        <Activity size={14} className="text-gray-900" /> Professional Ads & Promotion Central
                    </p>
                </div>
            </div>

            {selectedRequest ? (
                <div className="bg-white p-10 rounded-[40px] shadow-[0_32px_120px_rgba(0,0,0,0.1)] border border-gray-100 animate-in fade-in zoom-in-95 duration-500 max-w-5xl mx-auto">
                    <div className="flex justify-between items-start mb-10 pb-6 border-b border-gray-50">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-3 py-1 bg-gray-100 text-gray-900 text-[10px] font-black uppercase tracking-widest rounded-full border border-gray-200">Step 2: Creative Studio</span>
                            </div>
                            <h3 className="text-[28px] font-[1000] text-gray-900 tracking-tight leading-none mb-2">Design Ad Visuals: {selectedRequest.bannerTitle}</h3>
                            <p className="text-[13px] text-gray-500 font-bold">Your design dictates the platform aesthetic. Ensure pixel-perfection.</p>
                        </div>
                        <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-900 rounded-full transition-all">
                            <XCircle size={28} />
                        </button>
                    </div>

                    <form onSubmit={handleBannerSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Headline</label>
                                    <input
                                        type="text" value={bannerTitle} onChange={e => setBannerTitle(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-gray-900"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Sub-Headline</label>
                                    <input
                                        type="text" value={bannerSubtitle} onChange={e => setBannerSubtitle(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-gray-900"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Tagline</label>
                                    <input
                                        placeholder="e.g. SUMMER 23"
                                        type="text" value={tagline} onChange={e => setTagline(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-gray-900"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Label</label>
                                    <input
                                        placeholder="e.g. BESTSELLER"
                                        type="text" value={label} onChange={e => setLabel(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-gray-900"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Brand Color</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color" value={brandColor} onChange={e => setBrandColor(e.target.value)}
                                            className="w-12 h-10 p-1 bg-white border border-gray-200 rounded-xl cursor-pointer"
                                        />
                                        <input
                                            type="text" value={brandColor} onChange={e => setBrandColor(e.target.value)}
                                            className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-mono outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Offer Text</label>
                                    <input
                                        placeholder="e.g. FLAT 50% OFF"
                                        type="text" value={offer} onChange={e => setOffer(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-gray-900"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Bank Offer</label>
                                    <input
                                        placeholder="e.g. 10% instant discount..."
                                        type="text" value={bankOffer} onChange={e => setBankOffer(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-gray-900"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">CTA Button</label>
                                <input
                                    required type="text" value={bannerForm.buttonText} onChange={e => setBannerForm({ ...bannerForm, buttonText: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-bold text-gray-900 focus:bg-white focus:border-gray-900 outline-none transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Visual Priority (0-100)</label>
                                <input
                                    required type="number" value={bannerForm.priority} onChange={e => setBannerForm({ ...bannerForm, priority: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-bold text-gray-900 outline-none transition-all shadow-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Upload Master Visual</label>
                                <div className="relative group/upload">
                                    <input
                                        required type="file" accept="image/*" onChange={e => {
                                            if (e.target.files[0]) {
                                                setImageFile(e.target.files[0]);
                                            }
                                        }}
                                        className="w-full h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl file:hidden hover:border-gray-900 hover:bg-gray-100 transition-all cursor-pointer opacity-0 absolute inset-0 z-10"
                                    />
                                    <div className="w-full h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center transition-all group-hover/upload:border-gray-900 group-hover/upload:bg-gray-100 overflow-hidden relative">
                                        {imageFile ? (
                                            <div className="w-full h-full p-2">
                                                <img
                                                    src={URL.createObjectURL(imageFile)}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover rounded-xl shadow-lg"
                                                />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/upload:opacity-100 transition-opacity">
                                                    <p className="text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                        <CheckCircle size={14} /> Change Creative
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <ImageIcon size={32} className="mb-2 text-gray-300 group-hover/upload:scale-110 transition-transform" />
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Click to upload 21:9 creative</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button type="submit" className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-[13px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-black shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all active:scale-95 group">
                                    Prepare & Send to Seller <Zap size={18} className="group-hover:animate-bounce" />
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="bg-white rounded-[32px] shadow-2xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-400 font-black uppercase tracking-[0.15em] text-[10px] border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-6">Ad & Quality Gating</th>
                                <th className="px-8 py-6">Targeting & Schedule</th>
                                <th className="px-8 py-6">Economics</th>
                                <th className="px-8 py-6">Stage</th>
                                <th className="px-8 py-6 text-right">Moderation Controls</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {requests.map(req => {
                                const hasDesignRequest = req.notes?.includes('[REQUIRES PROFESSIONAL DESIGN]');
                                const outOfStock = req.productId ? req.productId.stock <= 0 : false;
                                const inactiveProduct = req.productId ? req.productId.status !== 'active' : false;

                                return (
                                    <tr key={req._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-7">
                                            <div className="flex items-start gap-4">
                                                <div className="w-16 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 shadow-inner group-hover:bg-white transition-colors border border-transparent group-hover:border-slate-100 overflow-hidden">
                                                    {req.bannerUrl ? (
                                                        <img
                                                            src={getImageUrl(req.bannerUrl)}
                                                            alt=""
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                e.target.nextSibling.style.display = 'flex';
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div className={`${req.bannerUrl ? 'hidden' : 'flex'} w-full h-full items-center justify-center`}>
                                                        <Palette size={20} className={hasDesignRequest ? 'text-amber-500' : ''} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="font-black text-slate-900 tracking-tight text-base mb-0.5">{req.bannerTitle}</div>
                                                    <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Seller: {req.sellerId?.businessName}</div>

                                                    <div className="flex flex-wrap items-center gap-3 mt-3">
                                                        {req.productId ? (
                                                            <div className="flex items-center gap-2 group/prod">
                                                                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden shrink-0 shadow-sm">
                                                                    <img
                                                                        src={getImageUrl(req.productId.image || req.productId.images?.[0])}
                                                                        alt=""
                                                                        className="w-full h-full object-cover group-hover/prod:scale-125 transition-transform"
                                                                    />
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    {outOfStock ? (
                                                                        <span className="flex items-center gap-1 text-[8px] font-black text-red-600 uppercase bg-red-50 px-2 py-0.5 rounded-lg border border-red-100 shadow-sm"><AlertTriangle size={10} /> OUT OF STOCK</span>
                                                                    ) : (
                                                                        <span className="flex items-center gap-1 text-[8px] font-black text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 shadow-sm"><CheckCircle size={10} /> STOCK OK ({req.productId.stock})</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="flex items-center gap-1 text-[8px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-1 rounded-lg border border-blue-100 shadow-sm"><Info size={10} /> GENERAL STORE BANNER</span>
                                                        )}
                                                        {hasDesignRequest && <span className="flex items-center gap-1 text-[8px] font-black text-amber-600 uppercase bg-amber-50 px-2 py-1 rounded-lg border border-amber-100 shadow-sm"><Palette size={10} /> DESIGN SERVICE REQ.</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7">
                                            <div className="inline-block px-3 py-1.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest mb-2 shadow-lg shadow-slate-200">
                                                {req.bannerType}
                                            </div>
                                            <div className="text-slate-500 text-[11px] font-black flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center"><Clock size={12} /></div>
                                                {new Date(req.preferredStartDate).toLocaleDateString()} - {new Date(req.preferredEndDate).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-8 py-7">
                                            <div className="text-lg font-black text-slate-900 mb-1 italic">₹{req.paymentAmount}</div>
                                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${req.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                                                }`}>
                                                <div className={`w-2 h-2 rounded-full animate-pulse ${req.paymentStatus === 'Paid' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                                {req.paymentStatus}
                                            </div>
                                        </td>
                                        <td className="px-8 py-7">
                                            <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] border shadow-sm ${req.status === 'Active' ? 'bg-emerald-600 text-white border-emerald-600' :
                                                req.status === 'Requested' ? 'bg-slate-100 text-slate-500 border-slate-200' :
                                                    req.status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                                                        'bg-blue-50 text-blue-600 border-blue-100'
                                                }`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-7 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                {(req.status === 'Requested' || req.status === 'Under Review') && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setVerifyingId(req._id)}
                                                            className="text-gray-900 font-black text-[10px] uppercase tracking-widest bg-gray-100 px-5 py-3 rounded-2xl border border-gray-200 hover:bg-gray-900 hover:text-white transition-all shadow-sm"
                                                        >
                                                            Verify Product
                                                        </button>
                                                    </div>
                                                )}

                                                {req.status === 'Verified' && (
                                                    <button
                                                        onClick={() => openCreateBanner(req)}
                                                        className="text-gray-900 font-black text-[10px] uppercase tracking-widest bg-gray-100 px-5 py-3 rounded-2xl border border-gray-200 hover:bg-gray-900 hover:text-white transition-all shadow-sm flex items-center gap-2"
                                                    >
                                                        <Palette size={14} /> Design Banner
                                                    </button>
                                                )}

                                                {req.status === 'Payment Pending' && req.paymentStatus === 'Paid' && (
                                                    <button
                                                        onClick={() => handleVerify(req._id, true)}
                                                        className="text-white font-black text-[10px] uppercase tracking-widest bg-gray-900 px-5 py-3 rounded-2xl border border-gray-900 hover:bg-black transition-all shadow-sm flex items-center gap-2"
                                                    >
                                                        <CheckCircle size={14} /> Approve & Go Live
                                                    </button>
                                                )}

                                                {req.status === 'Payment Pending' && req.paymentStatus === 'Pending' && (
                                                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100">
                                                        Awaiting Payment
                                                    </div>
                                                )}

                                                <button onClick={() => handleDelete(req._id)} className="text-gray-300 hover:text-gray-900 p-2.5 transition-all hover:bg-gray-100 rounded-xl ml-2 group-hover:bg-gray-50">
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {requests.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-8 py-32 text-center bg-slate-50/30">
                                        <div className="inline-flex flex-col items-center">
                                            <div className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center shadow-xl shadow-slate-200/50 mb-6 border border-slate-100 text-slate-200">
                                                <Megaphone size={32} />
                                            </div>
                                            <p className="text-slate-400 font-black uppercase text-[11px] tracking-[0.3em]">Moderation queue clear.</p>
                                            <p className="text-slate-300 font-bold text-[10px] mt-2">Professional Ad System is Idle</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {verifyingId && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-8 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[40px] p-10 max-w-lg w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-500">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl shadow-inner">
                                <ShieldCheck size={32} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-[1000] text-slate-900 tracking-tight">Quality Audit</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Step 1: Product Integrity Check</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Audit Notes</label>
                                <textarea
                                    className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-6 text-sm font-bold text-slate-900 focus:border-blue-500 outline-none transition-all resize-none shadow-inner min-h-[140px]"
                                    placeholder="Verify stock, authenticity, and pricing quality. This note will be visible to the seller."
                                    value={verificationNote}
                                    onChange={(e) => setVerificationNote(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleVerify(verifyingId, false)}
                                    className="flex-1 py-4 bg-red-50 text-red-600 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleVerify(verifyingId, true)}
                                    className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200"
                                >
                                    Confirm Quality
                                </button>
                            </div>
                            <button
                                onClick={() => setVerifyingId(null)}
                                className="w-full py-4 text-slate-400 font-bold text-[11px] uppercase tracking-widest hover:text-slate-600 transition-all"
                            >
                                Back to Queue
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
