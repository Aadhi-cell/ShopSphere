import React, { useState, useEffect } from 'react';
import { getBanners, createBanner, updateBanner, deleteBanner } from '../../api/adminApi';
import {
    Plus,
    Trash2,
    Edit,
    Image as ImageIcon,
    ExternalLink,
    Calendar,
    MoveUp,
    MoveDown,
    Save,
    X,
    Eye
} from 'lucide-react';
import { getImageUrl } from '../../utils/imageConfig';

export default function BannerManager() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingBanner, setEditingBanner] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [previewBanner, setPreviewBanner] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [form, setForm] = useState({
        title: '',
        subtitle: '',
        imageUrl: '',
        buttonText: 'Shop Now',
        redirectLink: '/',
        status: 'Active',
        startDate: '',
        endDate: '',
        order: 0
    });

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        setLoading(true);
        try {
            const data = await getBanners();
            setBanners(data);
        } catch (error) {
            console.error('Failed to fetch banners:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            Object.keys(form).forEach(key => formData.append(key, form[key]));
            if (imageFile) {
                formData.append('imageFile', imageFile);
            }

            if (editingBanner) {
                await updateBanner(editingBanner._id, formData);
            } else {
                await createBanner(formData);
            }
            setShowForm(false);
            setEditingBanner(null);
            resetForm();
            fetchBanners();
        } catch (error) {
            console.error('Failed to save banner:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this banner?')) return;
        try {
            await deleteBanner(id);
            fetchBanners();
        } catch (error) {
            console.error('Failed to delete banner:', error);
        }
    };

    const resetForm = () => {
        setForm({
            title: '',
            subtitle: '',
            imageUrl: '',
            buttonText: 'Shop Now',
            redirectLink: '/',
            status: 'Active',
            startDate: '',
            endDate: '',
            order: banners.length
        });
        setImageFile(null);
    };

    const handleEdit = (banner) => {
        setEditingBanner(banner);
        setForm({
            ...banner,
            startDate: banner.startDate ? banner.startDate.split('T')[0] : '',
            endDate: banner.endDate ? banner.endDate.split('T')[0] : ''
        });
        setImageFile(null);
        setShowForm(true);
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Loading Banners...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-[1000] text-slate-900">Promotional Banners</h3>
                <button
                    onClick={() => { resetForm(); setEditingBanner(null); setShowForm(true); }}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                    <Plus size={16} strokeWidth={3} /> Add New Banner
                </button>
            </div>

            {showForm && (
                <div className="bg-white border-2 border-primary/10 rounded-[32px] p-8 shadow-xl animate-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-8">
                        <h4 className="text-lg font-[900] text-slate-900">{editingBanner ? 'Edit Banner' : 'Create New Banner'}</h4>
                        <button type="button" onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Banner Title</label>
                                <input
                                    required
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-primary"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Subtitle / Description</label>
                                <input
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-primary"
                                    value={form.subtitle}
                                    onChange={e => setForm({ ...form, subtitle: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Button Text</label>
                                    <input
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-primary"
                                        value={form.buttonText}
                                        onChange={e => setForm({ ...form, buttonText: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Redirect Link</label>
                                    <input
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-primary"
                                        value={form.redirectLink}
                                        onChange={e => setForm({ ...form, redirectLink: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="flex items-center justify-between text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">
                                    <span>Banner Image</span>
                                    <span className="text-[9px] text-primary bg-primary/10 px-2 py-0.5 rounded-full lowercase tracking-normal font-bold">Recommended: Transparent PNG</span>
                                </label>

                                {/* File Upload Area */}
                                <div className="relative border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 p-6 flex flex-col items-center justify-center transition-all hover:border-primary/50 hover:bg-slate-100/50 group">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => {
                                            if (e.target.files && e.target.files[0]) {
                                                setImageFile(e.target.files[0]);
                                                // Create local preview URL
                                                setForm({ ...form, imageUrl: URL.createObjectURL(e.target.files[0]) });
                                            }
                                        }}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />

                                    {!form.imageUrl && !imageFile ? (
                                        <div className="text-center space-y-3 pointer-events-none">
                                            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto text-slate-400 group-hover:text-primary group-hover:scale-110 transition-all">
                                                <ImageIcon size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-700">Click or drag banner image here</p>
                                                <p className="text-[11px] font-medium text-slate-400 mt-1">PNG, JPG up to 5MB</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full flex items-center gap-4 relative z-20">
                                            <div className="w-24 h-24 rounded-[1rem] border border-slate-200 overflow-hidden shrink-0 bg-white flex items-center justify-center p-2 shadow-sm">
                                                <img
                                                    src={getImageUrl(form.imageUrl)}
                                                    alt="Preview"
                                                    className="w-full h-full object-contain drop-shadow"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-800 truncate">
                                                    {imageFile ? imageFile.name : 'Current Image'}
                                                </p>
                                                <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                                                    {imageFile ? `${(imageFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Uploaded'}
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setImageFile(null);
                                                        setForm({ ...form, imageUrl: '' });
                                                    }}
                                                    className="mt-2 text-[11px] font-black text-red-500 uppercase tracking-widest hover:text-red-600 transition-colors"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                            <div className="absolute inset-0 w-full h-full cursor-pointer z-10" title="Click to choose a different file"></div>
                                        </div>
                                    )}
                                </div>

                                <div className="text-center pt-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">— OR —</span>
                                </div>

                                <input
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-primary"
                                    value={form.imageUrl && !form.imageUrl.startsWith('blob:') ? form.imageUrl : ''}
                                    onChange={e => {
                                        setImageFile(null); // Clear file if URL is provided manually
                                        setForm({ ...form, imageUrl: e.target.value })
                                    }}
                                    placeholder="Paste Web URL instead"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-primary"
                                        value={form.startDate}
                                        onChange={e => setForm({ ...form, startDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-primary"
                                        value={form.endDate}
                                        onChange={e => setForm({ ...form, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                                <select
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-primary"
                                    value={form.status}
                                    onChange={e => setForm({ ...form, status: e.target.value })}
                                >
                                    <option>Active</option>
                                    <option>Inactive</option>
                                    <option>Scheduled</option>
                                </select>
                            </div>
                        </div>
                        <div className="md:col-span-2 pt-4 flex gap-4">
                            <button type="submit" className="flex-1 py-4.5 bg-primary text-white rounded-2xl font-[1000] text-sm uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all">
                                {editingBanner ? 'Update Banner' : 'Publish Banner'}
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} className="px-10 py-4.5 border-2 border-slate-200 text-slate-500 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6">
                {banners.map((banner, index) => (
                    <div key={banner._id} className="group bg-white rounded-[32px] border border-slate-100 p-6 flex items-center gap-8 hover:shadow-xl hover:border-primary/20 transition-all duration-500">
                        <div className="w-48 h-28 rounded-2xl bg-slate-50 overflow-hidden border border-slate-100 shrink-0 flex items-center justify-center p-2">
                            <img src={getImageUrl(banner.imageUrl)} alt="" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                                <h4 className="text-lg font-[900] text-slate-900 tracking-tight">{banner.title}</h4>
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${banner.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                    {banner.status}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 font-bold leading-relaxed">{banner.subtitle}</p>
                            <div className="flex items-center gap-6 pt-2">
                                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <Calendar size={12} /> {banner.startDate ? new Date(banner.startDate).toLocaleDateString() : 'Immediate'} → {banner.endDate ? new Date(banner.endDate).toLocaleDateString() : 'Forever'}
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-widest underline decoration-2 underline-offset-4">
                                    <ExternalLink size={12} /> {banner.redirectLink}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 pr-4">
                            <button onClick={() => handleEdit(banner)} className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-primary hover:border-primary hover:shadow-lg transition-all"><Edit size={20} /></button>
                            <button onClick={() => handleDelete(banner._id)} className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-red-500 hover:border-red-500 hover:shadow-lg transition-all"><Trash2 size={20} /></button>
                        </div>
                    </div>
                ))}

                {banners.length === 0 && !showForm && (
                    <div className="py-20 text-center text-slate-400 space-y-4">
                        <ImageIcon size={48} className="mx-auto opacity-10" />
                        <p className="font-bold">No banners created yet. Create your first campaign banner.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
