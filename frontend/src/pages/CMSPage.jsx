import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCMSPage } from '../api/userApi';
import { FileText, ChevronLeft, Calendar, Info } from 'lucide-react';

export default function CMSPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPage = async () => {
            setLoading(true);
            try {
                const data = await getCMSPage(slug);
                if (data) {
                    setPage(data);
                } else {
                    setError('Page not found');
                }
            } catch (err) {
                setError('Failed to load page content');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPage();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <div className="loader"></div>
            </div>
        );
    }

    if (error || !page) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                    <Info size={40} className="text-slate-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">{error || 'Page Not Available'}</h2>
                <p className="text-slate-500 mb-8 max-w-md">The page you are looking for might have been moved or is currently unpublished.</p>
                <button
                    onClick={() => navigate('/')}
                    className="px-8 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/25"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-[70vh] max-w-4xl mx-auto py-12 px-6">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-500 hover:text-primary font-bold mb-10 transition-colors group"
            >
                <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                Back
            </button>

            <article className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <header className="mb-12">
                    <div className="flex items-center gap-3 text-primary font-black text-[10px] uppercase tracking-[0.2em] mb-4">
                        <FileText size={16} />
                        Official Content
                    </div>
                    <h1 className="text-5xl font-[1000] text-slate-900 tracking-tighter leading-none mb-6">
                        {page.title}
                    </h1>
                    <div className="flex items-center gap-6 text-slate-400 font-bold text-xs uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                            <Calendar size={14} />
                            Updated {new Date(page.updatedAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                            Verified Content
                        </div>
                    </div>
                </header>

                <div
                    className="prose prose-slate prose-lg max-w-none 
                    prose-headings:text-slate-900 prose-headings:font-black prose-headings:tracking-tight
                    prose-p:text-slate-600 prose-p:leading-relaxed prose-p:font-medium
                    prose-strong:text-slate-900 prose-strong:font-bold
                    prose-li:text-slate-600 prose-li:font-medium
                    p-10 bg-white border-2 border-slate-100 rounded-[40px] shadow-2xl shadow-slate-100/50"
                    dangerouslySetInnerHTML={{ __html: page.content }}
                />
            </article>

            <footer className="mt-20 pt-10 border-t border-slate-100 flex items-center justify-between text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                <span>© {new Date().getFullYear()} ShopSphere Inc.</span>
                <div className="flex gap-10">
                    <span className="hover:text-primary cursor-pointer transition-colors">Safety Center</span>
                    <span className="hover:text-primary cursor-pointer transition-colors">Help Desk</span>
                </div>
            </footer>
        </div>
    );
}
