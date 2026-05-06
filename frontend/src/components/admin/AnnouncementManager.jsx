import React, { useState, useEffect } from 'react';
import { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../../api/adminApi';
import {
    Plus,
    Trash2,
    Edit,
    Bell,
    Info,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Save,
    X,
    Clock,
    Calendar
} from 'lucide-react';

export default function AnnouncementManager() {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingAnn, setEditingAnn] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        message: '',
        type: 'info',
        status: 'Active',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const data = await getAnnouncements();
            setAnnouncements(data);
        } catch (error) {
            console.error('Failed to fetch announcements:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAnn) {
                await updateAnnouncement(editingAnn._id, form);
            } else {
                await createAnnouncement(form);
            }
            setShowForm(false);
            setEditingAnn(null);
            setForm({ message: '', type: 'info', status: 'Active', startDate: '', endDate: '' });
            fetchAnnouncements();
        } catch (error) {
            console.error('Failed to save announcement:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this announcement?')) return;
        try {
            await deleteAnnouncement(id);
            fetchAnnouncements();
        } catch (error) {
            console.error('Failed to delete announcement:', error);
        }
    };

    const handleEdit = (ann) => {
        setEditingAnn(ann);
        setForm({
            ...ann,
            startDate: ann.startDate ? ann.startDate.split('T')[0] : '',
            endDate: ann.endDate ? ann.endDate.split('T')[0] : ''
        });
        setShowForm(true);
    };

    const toggleStatus = async (ann) => {
        try {
            const newStatus = ann.status === 'Active' ? 'Inactive' : 'Active';
            await updateAnnouncement(ann._id, { status: newStatus });
            fetchAnnouncements();
        } catch (error) {
            console.error('Toggle failed:', error);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Loading Announcements...</div>;

    const TypeIcon = ({ type }) => {
        switch (type) {
            case 'warning': return <AlertTriangle size={20} className="text-amber-500" />;
            case 'success': return <CheckCircle size={20} className="text-emerald-500" />;
            case 'error': return <XCircle size={20} className="text-red-500" />;
            default: return <Info size={20} className="text-blue-500" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-[1000] text-slate-900 tracking-tight">Announcement Bar</h3>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Manage top header notifications</p>
                </div>
                <button
                    onClick={() => { setForm({ message: '', type: 'info', status: 'Active', startDate: '', endDate: '' }); setEditingAnn(null); setShowForm(true); }}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                >
                    <Plus size={16} strokeWidth={3} /> Create Notice
                </button>
            </div>

            {showForm && (
                <div className="bg-white border-2 border-primary/10 rounded-[32px] p-8 shadow-xl animate-in fade-in duration-200">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-lg font-[900]">{editingAnn ? 'Edit Notification' : 'New Notification'}</h4>
                        <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Announcement Message</label>
                            <input
                                required
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-primary"
                                value={form.message}
                                onChange={e => setForm({ ...form, message: e.target.value })}
                                placeholder="e.g. Free shipping on orders over ₹499!"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
                                <select
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-primary"
                                    value={form.type}
                                    onChange={e => setForm({ ...form, type: e.target.value })}
                                >
                                    <option value="info">Info (Blue)</option>
                                    <option value="warning">Warning (Amber)</option>
                                    <option value="success">Success (Green)</option>
                                    <option value="error">Error (Red)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                                <input type="date" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-primary" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                                <input type="date" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-primary" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
                            </div>
                        </div>
                        <div className="pt-4 flex gap-4">
                            <button type="submit" className="flex-1 py-4.5 bg-primary text-white rounded-2xl font-[1000] text-sm uppercase tracking-[0.2em] shadow-xl shadow-primary/20">
                                {editingAnn ? 'Save Announcement' : 'Launch Announcement'}
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} className="px-10 py-4.5 border-2 border-slate-200 text-slate-500 rounded-2xl font-black text-sm uppercase tracking-widest">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                {announcements.map((ann) => (
                    <div key={ann._id} className="bg-white border border-slate-100 rounded-[28px] p-6 flex items-center justify-between group hover:border-primary/20 transition-all">
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                                <TypeIcon type={ann.type} />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 text-[15px] tracking-tight">{ann.message}</h4>
                                <div className="flex items-center gap-4 mt-1">
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${ann.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                        {ann.status}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <Calendar size={12} /> {ann.startDate ? new Date(ann.startDate).toLocaleDateString() : 'Always'} → {ann.endDate ? new Date(ann.endDate).toLocaleDateString() : 'Forever'}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => toggleStatus(ann)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${ann.status === 'Active' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'}`}
                            >
                                {ann.status === 'Active' ? 'ON' : 'OFF'}
                            </button>
                            <button onClick={() => handleEdit(ann)} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-primary transition-all"><Edit size={16} /></button>
                            <button onClick={() => handleDelete(ann._id)} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}

                {announcements.length === 0 && !showForm && (
                    <div className="py-20 text-center text-slate-400 space-y-4">
                        <Bell size={48} className="mx-auto opacity-10" />
                        <p className="font-bold uppercase text-[10px] tracking-widest">No Active Announcements</p>
                    </div>
                )}
            </div>
        </div>
    );
}
