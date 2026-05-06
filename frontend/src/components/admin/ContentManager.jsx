import React, { useState } from 'react';
import BannerManager from './BannerManager';
import PageManager from './PageManager';
import AnnouncementManager from './AnnouncementManager';
import {
    Layout,
    Image as ImageIcon,
    FileText,
    Bell,
    ChevronRight
} from 'lucide-react';

export default function ContentManager({ activeSubTab }) {
    const getInitialTab = () => {
        if (activeSubTab === 'content-banners') return 'banners';
        if (activeSubTab === 'content-pages') return 'pages';
        if (activeSubTab === 'content-announcements') return 'announcements';
        return 'banners';
    };

    const [subTab, setSubTab] = useState(getInitialTab());

    React.useEffect(() => {
        const tab = getInitialTab();
        setSubTab(tab);
    }, [activeSubTab]);

    const menuItems = [
        { id: 'banners', label: 'Banners & Sliders', icon: ImageIcon, desc: 'Manage home hero sections' },
        { id: 'pages', label: 'Static Pages', icon: FileText, desc: 'Policies, About, Contact' },
        { id: 'announcements', label: 'Announcements', icon: Bell, desc: 'Header notice bars' },
    ];

    const ActiveComponent = {
        banners: BannerManager,
        pages: PageManager,
        announcements: AnnouncementManager
    }[subTab];

    return (
        <div className="flex gap-10 min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* CMS Sidebar */}
            <div className="w-80 shrink-0 space-y-6">
                <div>
                    <h2 className="text-3xl font-[1000] text-slate-900 tracking-tighter mb-2">Content</h2>
                    <p className="text-slate-400 font-bold text-[11px] uppercase tracking-[0.2em]">Website CMS Center</p>
                </div>

                <div className="space-y-3 pt-4">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setSubTab(item.id)}
                            className={`w-full group flex items-center gap-4 p-5 rounded-[28px] transition-all duration-300 ${subTab === item.id
                                ? 'bg-white shadow-xl shadow-primary/5 border-2 border-primary/10'
                                : 'hover:bg-white/50 border-2 border-transparent'
                                }`}
                        >
                            <div className={`p-3 rounded-2xl transition-all ${subTab === item.id ? 'bg-primary text-white shadow-lg shadow-primary/30 rotate-3' : 'bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-primary'
                                }`}>
                                <item.icon size={22} strokeWidth={2.5} />
                            </div>
                            <div className="text-left flex-1">
                                <span className={`block font-[900] text-[15px] tracking-tight transition-colors ${subTab === item.id ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-900'
                                    }`}>
                                    {item.label}
                                </span>
                                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                                    {item.desc}
                                </span>
                            </div>
                            {subTab === item.id && <ChevronRight size={18} className="text-primary animate-pulse" />}
                        </button>
                    ))}
                </div>

                <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[32px] text-white overflow-hidden relative group">
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                    <div className="relative z-10 space-y-3">
                        <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center">
                            <Layout size={20} className="text-primary" />
                        </div>
                        <h4 className="font-bold text-sm tracking-tight">CMS Version 2.0</h4>
                        <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-widest">Manage frontend blocks without touching the code.</p>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1">
                <div className="bg-white/40 backdrop-blur-xl border-2 border-white/50 rounded-[48px] p-10 min-h-full shadow-2xl shadow-slate-200/50">
                    <ActiveComponent />
                </div>
            </div>
        </div>
    );
}
