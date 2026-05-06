import React, { useState, useEffect } from 'react';
import { getAdminAccounts, createAdminAccount, deleteAdminAccount, getSystemSettings, updateSystemSettings } from '../../api/adminApi';
import { Settings, Shield, Plus, X, Save, Edit3, Trash2, ShieldCheck, Mail, Phone, MapPin, CheckCircle2, RefreshCw } from 'lucide-react';

export default function SettingsManager() {
    const [activeTab, setActiveTab] = useState('general'); // 'general' | 'admins'
    const [admins, setAdmins] = useState([]);
    const [settings, setSettings] = useState({ siteTitle: '', logoUrl: '', supportEmail: '', phone: '', address: '' });
    const [loading, setLoading] = useState(true);
    const [showAddAdmin, setShowAddAdmin] = useState(false);
    const [newAdminData, setNewAdminData] = useState({ name: '', email: '', password: '', role: 'admin' });
    const [actionLoading, setActionLoading] = useState(false);

    const loadData = async (tab) => {
        setLoading(true);
        try {
            if (tab === 'admins') {
                const data = await getAdminAccounts();
                setAdmins(data);
            } else {
                const data = await getSystemSettings();
                if (data) setSettings(data);
            }
        } catch (err) {
            console.error('Error fetching settings data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(activeTab); }, [activeTab]);

    const handleAddAdmin = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const result = await createAdminAccount(newAdminData);
            if (result.success) {
                setAdmins([result.admin, ...admins]);
                setShowAddAdmin(false);
                setNewAdminData({ name: '', email: '', password: '', role: 'admin' });
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create admin');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteAdmin = async (id) => {
        if (!window.confirm('Are you sure you want to remove this admin?')) return;
        try {
            await deleteAdminAccount(id);
            setAdmins(admins.filter(a => a._id !== id && a.id !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete admin');
        }
    };

    const handleUpdateSettings = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const result = await updateSystemSettings(settings);
            if (result.success) setSettings(result.setting);
        } catch (err) {
            alert('Failed to update settings');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full animate-fade-in">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-2xl font-[1000] text-slate-900 mb-1 tracking-tight">Platform Settings</h2>
                <p className="text-sm font-semibold text-slate-500">Manage site configuration and administrator access.</p>
            </div>

            {/* Tab Controls */}
            <div className="bg-white/50 backdrop-blur-xl p-4 rounded-3xl border border-white shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex bg-slate-100 p-1 rounded-2xl w-full sm:w-auto">
                    <TabButton active={activeTab === 'general'} onClick={() => setActiveTab('general')}>
                        General Settings
                    </TabButton>
                    <TabButton active={activeTab === 'admins'} onClick={() => setActiveTab('admins')} count={admins.length}>
                        Admin Accounts
                    </TabButton>
                </div>
                <div className="flex items-center gap-3">
                    {activeTab === 'admins' && (
                        <button
                            onClick={() => setShowAddAdmin(!showAddAdmin)}
                            className={`px-4 py-2.5 rounded-xl text-[12px] font-bold tracking-wide transition-all shadow-sm flex items-center gap-1.5 border
                                ${showAddAdmin ? 'bg-white text-slate-600 border-slate-200' : 'bg-blue-600 text-white hover:bg-blue-700 border-transparent'}
                            `}
                        >
                            {showAddAdmin ? <X size={14} /> : <Plus size={14} />}
                            {showAddAdmin ? 'Cancel' : 'New Admin'}
                        </button>
                    )}
                    <button
                        onClick={() => loadData(activeTab)}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm shrink-0"
                        title="Refresh"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-[24px] shadow-sm border border-slate-200/60 overflow-hidden relative min-h-[500px]">
                {loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
                        <RefreshCw className="animate-spin text-blue-600 mb-4" size={40} />
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Loading...</span>
                    </div>
                ) : activeTab === 'admins' ? (
                    <div className="flex flex-col">
                        {/* Add Admin Form */}
                        {showAddAdmin && (
                            <div className="p-6 border-b border-indigo-100 bg-indigo-50/40">
                                <form onSubmit={handleAddAdmin} className="max-w-2xl bg-white p-5 rounded-2xl shadow-sm border border-indigo-100/50">
                                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Shield size={14} className="text-indigo-500" /> Create Administrator
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                                            <input required placeholder="E.g. John Doe" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold outline-none focus:bg-white focus:border-blue-500 transition-all" value={newAdminData.name} onChange={e => setNewAdminData({ ...newAdminData, name: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                                            <input required type="email" placeholder="admin@example.com" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold outline-none focus:bg-white focus:border-blue-500 transition-all" value={newAdminData.email} onChange={e => setNewAdminData({ ...newAdminData, email: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
                                            <input required type="password" placeholder="Secure passcode" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold outline-none focus:bg-white focus:border-blue-500 transition-all" value={newAdminData.password} onChange={e => setNewAdminData({ ...newAdminData, password: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Access Role</label>
                                            <div className="flex gap-2">
                                                {[
                                                    { id: 'admin', label: 'Admin' },
                                                    { id: 'super_admin', label: 'Super Admin' },
                                                    { id: 'support', label: 'Support' }
                                                ].map(role => (
                                                    <button
                                                        key={role.id}
                                                        type="button"
                                                        onClick={() => setNewAdminData({ ...newAdminData, role: role.id })}
                                                        className={`flex-1 py-2.5 rounded-xl border text-[12px] font-bold tracking-wide transition-all
                                                            ${newAdminData.role === role.id
                                                                ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm'
                                                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}
                                                        `}
                                                    >
                                                        {role.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button disabled={actionLoading} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[13px] font-bold tracking-wide transition-all flex items-center gap-2">
                                            {actionLoading ? <RefreshCw className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                                            {actionLoading ? 'Creating...' : 'Create Account'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Admin Table */}
                        <div className="overflow-x-auto hide-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-slate-200">
                                        <th className="px-6 py-4 text-[12px] font-black text-slate-400 uppercase tracking-widest">Admin User</th>
                                        <th className="px-6 py-4 text-[12px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                                        <th className="px-6 py-4 text-[12px] font-black text-slate-400 uppercase tracking-widest">Joined</th>
                                        <th className="px-6 py-4 text-[12px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {admins.map(admin => (
                                        <tr key={admin._id || admin.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 shrink-0">
                                                        {admin.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-900 text-[14px]">{admin.name}</span>
                                                        <span className="text-[12px] text-slate-500 font-medium">{admin.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border
                                                    ${admin.role === 'super_admin' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                        admin.role === 'support' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                            'bg-emerald-50 text-emerald-700 border-emerald-200'}
                                                `}>
                                                    {admin.role.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-[13px] font-semibold text-slate-600">
                                                {new Date(admin.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => handleDeleteAdmin(admin._id || admin.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Revoke Access">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {admins.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-16 text-center">
                                                <Shield size={36} className="text-slate-200 mx-auto mb-3" />
                                                <p className="text-sm font-bold text-slate-500">No Admin Accounts found.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleUpdateSettings} className="p-6 md:p-8">
                        <div className="max-w-3xl flex flex-col gap-8">
                            {/* Platform Identity */}
                            <div>
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Edit3 size={16} /> Platform Identity
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-100">
                                    <div>
                                        <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wider mb-2">Display Title</label>
                                        <input value={settings.siteTitle || ''} onChange={e => setSettings({ ...settings, siteTitle: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-[14px] font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm" placeholder="e.g. ShopSphere" />
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wider mb-2">Brand Logo URL</label>
                                        <input value={settings.logoUrl || ''} onChange={e => setSettings({ ...settings, logoUrl: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-[14px] font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm" placeholder="https://" />
                                    </div>
                                </div>
                            </div>

                            {/* Contact Directory */}
                            <div>
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Phone size={16} /> Contact Directory
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-100">
                                    <div>
                                        <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Mail size={14} className="text-slate-400" /> Support Email</label>
                                        <input value={settings.supportEmail || ''} onChange={e => setSettings({ ...settings, supportEmail: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-[14px] font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Phone size={14} className="text-slate-400" /> Office Phone</label>
                                        <input value={settings.phone || ''} onChange={e => setSettings({ ...settings, phone: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-[14px] font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5"><MapPin size={14} className="text-slate-400" /> Headquarters Address</label>
                                        <textarea value={settings.address || ''} onChange={e => setSettings({ ...settings, address: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-[14px] font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm resize-none" rows="3" />
                                    </div>
                                </div>
                            </div>

                            {/* Save button */}
                            <div className="flex justify-start">
                                <button type="submit" disabled={actionLoading} className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[14px] font-bold tracking-wide transition-all shadow-[0_8px_20px_rgba(15,23,42,0.2)] flex items-center gap-2">
                                    {actionLoading ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                                    {actionLoading ? 'Saving...' : 'Save Configuration'}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}

function TabButton({ children, active, onClick, count }) {
    return (
        <button
            onClick={onClick}
            className={`
                relative px-6 py-2.5 rounded-xl text-[13px] font-bold tracking-wide transition-all min-w-[140px] whitespace-nowrap flex items-center justify-center gap-2
                ${active
                    ? 'bg-white text-blue-700 shadow-sm border border-slate-200/50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 border border-transparent'}
            `}
        >
            {children}
            {count !== undefined && (
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${active ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'}`}>
                    {count}
                </span>
            )}
        </button>
    );
}
