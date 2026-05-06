import React, { useState, useEffect } from 'react';
import { getPages, createPage, updatePage, deletePage } from '../../api/adminApi';
import {
    Plus,
    Trash2,
    Edit,
    FileText,
    ExternalLink,
    Save,
    X,
    Globe,
    Lock,
    Eye
} from 'lucide-react';

export default function PageManager() {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingPage, setEditingPage] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        title: '',
        slug: '',
        content: '',
        published: true
    });

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        setLoading(true);
        try {
            const data = await getPages();
            setPages(data);
        } catch (error) {
            console.error('Failed to fetch pages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingPage) {
                await updatePage(editingPage._id, form);
            } else {
                await createPage(form);
            }
            setShowForm(false);
            setEditingPage(null);
            setForm({ title: '', slug: '', content: '', published: true });
            fetchPages();
        } catch (error) {
            console.error('Failed to save page:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this page?')) return;
        try {
            await deletePage(id);
            fetchPages();
        } catch (error) {
            console.error('Failed to delete page:', error);
        }
    };

    const handleEdit = (page) => {
        setEditingPage(page);
        setForm(page);
        setShowForm(true);
    };

    const generateSlug = (title) => {
        return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Loading Pages...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-[1000] text-slate-900">CMS Pages</h3>
                <button
                    onClick={() => { setForm({ title: '', slug: '', content: '', published: true }); setEditingPage(null); setShowForm(true); }}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                    <Plus size={16} strokeWidth={3} /> Create New Page
                </button>
            </div>

            {showForm && (
                <div className="bg-white border-2 border-primary/10 rounded-[32px] p-8 shadow-xl animate-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-8">
                        <h4 className="text-lg font-[900] text-slate-900">{editingPage ? 'Edit Page' : 'Create New Page'}</h4>
                        <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Page Title</label>
                                <input
                                    required
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-primary"
                                    value={form.title}
                                    onChange={e => {
                                        const title = e.target.value;
                                        setForm({ ...form, title, slug: editingPage ? form.slug : generateSlug(title) });
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">URL Slug</label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">/</span>
                                    <input
                                        required
                                        className="w-full pl-8 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-primary"
                                        value={form.slug}
                                        onChange={e => setForm({ ...form, slug: generateSlug(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Page Content (HTML supported)</label>
                            <textarea
                                required
                                rows={10}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-primary resize-none"
                                value={form.content}
                                onChange={e => setForm({ ...form, content: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className={`w-12 h-6 rounded-full relative transition-all ${form.published ? 'bg-primary' : 'bg-slate-200'}`}>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={form.published}
                                        onChange={e => setForm({ ...form, published: e.target.checked })}
                                    />
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.published ? 'left-7' : 'left-1'}`}></div>
                                </div>
                                <span className="text-sm font-black text-slate-700 uppercase tracking-widest">Published</span>
                            </label>
                        </div>
                        <div className="pt-4 flex gap-4">
                            <button type="submit" className="flex-1 py-4.5 bg-primary text-white rounded-2xl font-[1000] text-sm uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all">
                                {editingPage ? 'Save Changes' : 'Publish Page'}
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} className="px-10 py-4.5 border-2 border-slate-200 text-slate-500 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pages.map((page) => (
                    <div key={page._id} className="bg-white rounded-[40px] border border-slate-100 p-8 hover:shadow-xl hover:border-primary/20 transition-all duration-500 flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-primary">
                                <FileText size={24} />
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${page.published ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                {page.published ? 'Published' : 'Draft'}
                            </span>
                        </div>
                        <h4 className="text-xl font-[1000] text-slate-900 tracking-tight mb-2 truncate">{page.title}</h4>
                        <code className="text-[10px] font-black text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg w-fit mb-6 italic">/{page.slug}</code>

                        <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50">
                            <button onClick={() => window.open(`/${page.slug}`, '_blank')} className="text-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5 hover:gap-2.5 transition-all">
                                Preview <Eye size={14} />
                            </button>
                            <div className="flex items-center gap-1.5">
                                <button onClick={() => handleEdit(page)} className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"><Edit size={16} /></button>
                                <button onClick={() => handleDelete(page._id)} className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    </div>
                ))}

                {pages.length === 0 && !showForm && (
                    <div className="col-span-full py-20 text-center text-slate-400 space-y-4">
                        <Globe size={48} className="mx-auto opacity-10" />
                        <p className="font-bold">No custom pages found. Start building your site content.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
