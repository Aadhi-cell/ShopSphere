import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPromotionRequest } from '../../api/promotionApi';
import { ArrowLeft, Save, Megaphone, Tag, X, Info, Layout, Palette } from 'lucide-react';

export default function RequestPromotion() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        bannerTitle: '',
        bannerSubtitle: '',
        offerDetails: '',
        preferredStartDate: '',
        preferredEndDate: '',
        bannerType: 'Homepage',
        productId: '',
        paymentAmount: 500, // Base price
        budget: 500,
        campaignType: 'Fixed',
        notes: '',
        needsProfessionalDesign: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;

        let newFormData = { ...formData, [name]: val };

        // Dynamic price calculation logic
        if (name === 'preferredStartDate' || name === 'preferredEndDate' || name === 'needsProfessionalDesign') {
            const start = new Date(name === 'preferredStartDate' ? value : formData.preferredStartDate);
            const end = new Date(name === 'preferredEndDate' ? value : formData.preferredEndDate);
            if (start && end && end >= start) {
                const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
                let price = days * 500; // 500 per day
                if (newFormData.needsProfessionalDesign) price += 1500; // Professional design fee
                newFormData.paymentAmount = price;
                newFormData.budget = price;
            }
        }

        setFormData(newFormData);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic frontend validation
        if (!formData.preferredStartDate || !formData.preferredEndDate) {
            setError('Please select both start and end dates');
            return;
        }

        if (new Date(formData.preferredStartDate) > new Date(formData.preferredEndDate)) {
            setError('Start date cannot be after end date');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const data = new FormData();

            // Collect and combine notes first
            let finalNotes = formData.notes || '';
            if (formData.needsProfessionalDesign) {
                finalNotes += (finalNotes ? ' ' : '') + "[REQUIRES PROFESSIONAL DESIGN]";
            }

            // Append all fields except notes and potentially empty IDs
            Object.keys(formData).forEach(key => {
                if (key === 'notes' || key === 'needsProfessionalDesign') return;

                // DON'T append empty productId or categoryId strings to avoid backend casting errors
                if ((key === 'productId' || key === 'categoryId') && !formData[key]) {
                    return;
                }
                data.append(key, formData[key]);
            });

            // Append the processed notes
            if (finalNotes) {
                data.append('notes', finalNotes);
            }

            data.append('status', 'Requested'); // New professional workflow status
            data.append('paymentStatus', 'Pending');

            if (imageFile && !formData.needsProfessionalDesign) {
                data.append('image', imageFile);
            }

            await createPromotionRequest(data);
            navigate('/seller', { state: { activeTab: 'promotions' } });
        } catch (err) {
            const backendError = err.response?.data;
            if (backendError?.errors) {
                setError(`${backendError.message}: ${backendError.errors.join(', ')}`);
            } else {
                setError(backendError?.message || 'Failed to submit request');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header - Completely Static & Simple */}
            <div className="bg-white border-b border-slate-200 py-6 px-6">
                <div className="max-w-[1000px] mx-auto">
                    <button
                        onClick={() => navigate('/seller')}
                        className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mb-3 flex items-center gap-2"
                    >
                        <ArrowLeft size={12} /> Dashboard
                    </button>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                <Megaphone size={24} className="text-[#2874f0]" /> Request Promotion
                            </h1>
                            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-wide mt-1">Increase your product reach with targeted promotion campaigns.</p>
                        </div>
                        <div className="hidden md:block text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Daily Rate</p>
                            <p className="text-xl font-black text-slate-900 leading-none">₹500</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1000px] mx-auto px-6 py-8">
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-8 space-y-8">
                    {/* Error Box - Fixed */}
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl font-black text-[10px] uppercase tracking-wider border border-red-100">
                            Error: {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Section 1: Data */}
                        <div className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Promotion Title</label>
                                <input
                                    type="text" name="bannerTitle" required value={formData.bannerTitle} onChange={handleChange}
                                    placeholder="Enter headline..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-[#2874f0]"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sub-Headline</label>
                                <input
                                    type="text" name="bannerSubtitle" value={formData.bannerSubtitle} onChange={handleChange}
                                    placeholder="Brief marketing text..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-[#2874f0]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Date</label>
                                    <input
                                        type="date" name="preferredStartDate" required min={new Date().toISOString().split('T')[0]} value={formData.preferredStartDate} onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-black text-slate-900"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End Date</label>
                                    <input
                                        type="date" name="preferredEndDate" required min={formData.preferredStartDate || new Date().toISOString().split('T')[0]} value={formData.preferredEndDate} onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-black text-slate-900"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Creative */}
                        <div className="space-y-6">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Palette size={18} className="text-[#2874f0]" />
                                    <p className="text-[10px] font-black uppercase text-slate-900">Request Design Aid (+₹1500)</p>
                                </div>
                                <input
                                    type="checkbox" name="needsProfessionalDesign"
                                    checked={formData.needsProfessionalDesign} onChange={handleChange}
                                    className="w-5 h-5 accent-[#2874f0] cursor-pointer"
                                />
                            </div>

                            <div className="min-h-[160px] flex flex-col">
                                {!formData.needsProfessionalDesign ? (
                                    <div className="space-y-2 flex-1 flex flex-col">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Creative Asset (21:9)</label>
                                        <div
                                            className="flex-1 border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50 cursor-pointer"
                                            onClick={() => document.getElementById('promotion-banner-upload').click()}
                                        >
                                            <input type="file" id="promotion-banner-upload" accept="image/*" onChange={handleFileChange} className="hidden" />
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                                            ) : (
                                                <div className="text-center">
                                                    <Layout size={24} className="text-slate-300 mx-auto mb-2" />
                                                    <p className="text-[9px] font-black text-slate-400 uppercase">Upload master design</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2 flex-1 flex flex-col">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Design Brief</label>
                                        <textarea
                                            name="notes" value={formData.notes} onChange={handleChange}
                                            placeholder="Describe theme, text, and brand colors..."
                                            className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-[#2874f0] resize-none"
                                        ></textarea>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex flex-col">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Estimated Total Cost</p>
                            <p className="text-2xl font-black text-[#2874f0] italic">₹{formData.paymentAmount}</p>
                        </div>
                        <div className="flex gap-4">
                            <button
                                type="button" onClick={() => navigate('/seller')}
                                className="px-4 py-2 text-slate-400 font-black text-[10px] uppercase tracking-widest"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit" disabled={loading}
                                className="px-8 py-4 bg-[#2874f0] text-white rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-100"
                            >
                                {loading ? 'Processing...' : <><Save size={14} strokeWidth={3} /> Submit Launch Request</>}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <div className="max-w-[1000px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { icon: Info, title: "Audit Phase", text: "Verified within 24h." },
                    { icon: Palette, title: "Design Consistency", text: "Platform-standard UI." },
                    { icon: Layout, title: "High Slot", text: "Top search inventory." }
                ].map((card, i) => (
                    <div key={i} className="bg-white p-5 rounded-xl border border-slate-100 flex gap-4 items-center shadow-sm">
                        <div className="p-2 bg-blue-50 text-[#2874f0] rounded-lg">
                            <card.icon size={16} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-900 leading-none mb-1">{card.title}</p>
                            <p className="text-[9px] text-slate-500 font-bold leading-tight">{card.text}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};;
