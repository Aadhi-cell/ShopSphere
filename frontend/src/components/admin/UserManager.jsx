import React, { useState, useEffect } from 'react';
import { getAdminUsers, getAdminSellers, updateSellerStatusAdmin, updateUserStatusAdmin, updateSellerActiveStatusAdmin } from '../../api/adminApi';
import {
    Users, Search, Activity, AlertCircle, ShieldOff, CheckCircle2,
    MoreVertical, X, Clock, Store, ShieldCheck, XCircle,
    CreditCard, MapPin, Building, FileText, CheckCircle,
    ShieldAlert, ExternalLink, Info, Landmark
} from 'lucide-react';
import { getImageUrl } from '../../utils/imageConfig';

export default function UserManager() {
    const [activeTab, setActiveTab] = useState('all-users'); // 'all-users', 'sellers', 'requests'
    const [requestFilter, setRequestFilter] = useState('pending'); // 'pending', 'rejected'

    // Data state
    const [users, setUsers] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [viewSeller, setViewSeller] = useState(null);
    const [rejectSeller, setRejectSeller] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersData, sellersData] = await Promise.all([
                getAdminUsers(),
                getAdminSellers()
            ]);
            setUsers(usersData);
            setSellers(sellersData);
        } catch (err) {
            console.error('Failed to load data:', err);
            setError('Failed to fetch data from the server.');
        } finally {
            setLoading(false);
        }
    };

    // User Actions
    const handleUserToggleBlock = async (userId, currentStatus) => {
        try {
            const newStatus = currentStatus === 'Blocked' ? 'Active' : 'Blocked';
            await updateUserStatusAdmin(userId, newStatus);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
        } catch (error) {
            alert('Failed to update user status');
        }
    };

    // Seller Actions
    const handleSellerToggleBlock = async (sellerId, currentIsActive) => {
        try {
            const newIsActive = !currentIsActive;
            await updateSellerActiveStatusAdmin(sellerId, newIsActive);
            setSellers(prev => prev.map(s => s.id === sellerId ? { ...s, isActive: newIsActive } : s));
        } catch (error) {
            alert('Failed to update seller status');
        }
    };

    const handleSellerApproval = async (sellerId, newStatus, reason = null) => {
        try {
            await updateSellerStatusAdmin(sellerId, newStatus, reason);
            setSellers(prev => prev.map(s => s.id === sellerId ? { ...s, status: newStatus, rejectionReason: reason } : s));
            setRejectSeller(null);
            setRejectionReason('');
            if (viewSeller?.id === sellerId) setViewSeller(null);
        } catch (error) {
            alert(`Failed to ${newStatus} seller`);
        }
    };

    // Filtered Data
    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const approvedSellers = sellers.filter(s =>
        s.status === 'approved' &&
        (s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.email?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const sellerRequests = sellers.filter(s =>
        s.status === requestFilter &&
        (s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.businessName?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (error) {
        return (
            <div className="bg-red-50 text-red-600 p-8 rounded-2xl flex flex-col items-center justify-center text-center border border-red-100 shadow-sm animate-in fade-in">
                <AlertCircle size={48} className="mb-4" />
                <h3 className="text-xl font-bold mb-2">Error Loading Data</h3>
                <p className="font-medium">{error}</p>
                <button onClick={fetchData} className="mt-6 px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition">
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500 max-w-[1400px] mx-auto">
            {/* Header section with Tabs and Search */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-8">
                <div>
                    <h2 className="text-3xl font-[1000] text-slate-900 tracking-tight flex items-center gap-3">
                        <Users className="text-blue-600" size={32} />
                        User And Seller Management
                    </h2>
                    <p className="text-slate-500 font-semibold mt-2">Manage all registered users, merchants, and approval requests.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    {/* Minimal Tabs */}
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full sm:w-auto overflow-x-auto shadow-inner border border-slate-200">
                        <TabButton
                            active={activeTab === 'all-users'}
                            onClick={() => setActiveTab('all-users')}
                            count={users.length}
                        >
                            All Users
                        </TabButton>
                        <TabButton
                            active={activeTab === 'sellers'}
                            onClick={() => setActiveTab('sellers')}
                            count={approvedSellers.length}
                        >
                            Sellers
                        </TabButton>
                        <TabButton
                            active={activeTab === 'requests'}
                            onClick={() => setActiveTab('requests')}
                            count={sellers.filter(s => s.status === 'pending').length}
                            highlight={sellers.some(s => s.status === 'pending')}
                        >
                            Requests
                        </TabButton>
                    </div>

                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Sub-filters for Requests */}
            {activeTab === 'requests' && (
                <div className="flex items-center gap-2 mb-6 animate-in slide-in-from-top-4 duration-300">
                    <button
                        onClick={() => setRequestFilter('pending')}
                        className={`px-4 py-2 rounded-xl text-[12px] font-bold tracking-wide transition-all border ${requestFilter === 'pending' ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                    >
                        Pending Requests ({sellers.filter(s => s.status === 'pending').length})
                    </button>
                    <button
                        onClick={() => setRequestFilter('rejected')}
                        className={`px-4 py-2 rounded-xl text-[12px] font-bold tracking-wide transition-all border ${requestFilter === 'rejected' ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-100' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                    >
                        Rejected Applications ({sellers.filter(s => s.status === 'rejected').length})
                    </button>
                </div>
            )}

            {/* Content Container */}
            <div className="bg-white rounded-[24px] shadow-sm border border-slate-200/60 overflow-hidden relative min-h-[500px]">
                {loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
                        <Activity className="animate-spin text-blue-600 mb-4" size={40} />
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Loading Directory...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        {activeTab === 'all-users' && <AllUsersTable users={filteredUsers} onToggleBlock={handleUserToggleBlock} />}
                        {activeTab === 'sellers' && <SellersTable sellers={approvedSellers} onToggleBlock={handleSellerToggleBlock} />}
                        {activeTab === 'requests' && (
                            <SellerRequestsTable
                                requests={sellerRequests}
                                onApprove={(id) => handleSellerApproval(id, 'approved')}
                                onReject={(seller) => setRejectSeller(seller)}
                                onViewDetails={(seller) => setViewSeller(seller)}
                                isRejectedPage={requestFilter === 'rejected'}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            {viewSeller && (
                <SellerDetailsModal
                    seller={viewSeller}
                    onClose={() => setViewSeller(null)}
                    onApprove={() => handleSellerApproval(viewSeller.id, 'approved')}
                    onReject={() => setRejectSeller(viewSeller)}
                />
            )}

            {rejectSeller && (
                <RejectReasonModal
                    seller={rejectSeller}
                    reason={rejectionReason}
                    setReason={setRejectionReason}
                    onClose={() => {
                        setRejectSeller(null);
                        setRejectionReason('');
                    }}
                    onConfirm={() => handleSellerApproval(rejectSeller.id, 'rejected', rejectionReason)}
                />
            )}
        </div>
    );
}

// -------------------------------------------------------------
// Component: Tab Button
// -------------------------------------------------------------
function TabButton({ children, active, onClick, count, highlight }) {
    return (
        <button
            onClick={onClick}
            className={`
                relative px-6 py-2.5 rounded-xl text-[13px] font-bold tracking-wide transition-all min-w-[120px] whitespace-nowrap flex items-center justify-center gap-2
                ${active
                    ? 'bg-white text-blue-700 shadow-sm border border-slate-200/50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 border border-transparent'}
            `}
        >
            {children}
            {count !== undefined && (
                <span className={`
                    text-[11px] px-2 py-0.5 rounded-full
                    ${active ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'}
                    ${highlight && !active && count > 0 ? 'bg-red-100 text-red-600' : ''}
                `}>
                    {count}
                </span>
            )}
        </button>
    );
}

// -------------------------------------------------------------
// Tab 1: All Users Table
// -------------------------------------------------------------
function AllUsersTable({ users, onToggleBlock }) {
    if (users.length === 0) return <EmptyState tabName="Users" />;

    return (
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[12px] font-black text-slate-500 uppercase tracking-widest">User Details</th>
                    <th className="px-6 py-4 text-[12px] font-black text-slate-500 uppercase tracking-widest hidden sm:table-cell">Joined Date</th>
                    <th className="px-6 py-4 text-[12px] font-black text-slate-500 uppercase tracking-widest text-center">Total Orders</th>
                    <th className="px-6 py-4 text-[12px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                    <th className="px-6 py-4 text-[12px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-black border border-blue-100 shadow-sm">
                                    {user.name?.[0]?.toUpperCase()}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-900 text-[15px]">{user.name}</span>
                                    <span className="text-[13px] text-slate-500 font-medium">{user.email}</span>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                            <span className="text-[14px] font-semibold text-slate-700">
                                {user.joinedDate ? new Date(user.joinedDate).toLocaleDateString('en-GB') : 'N/A'}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 bg-slate-100 rounded-lg text-slate-700 font-black text-[14px] border border-slate-200">
                                {user.totalOrders || 0}
                            </span>
                        </td>
                        <td className="px-6 py-4 pb-[18px] text-center">
                            <StatusBadge isActive={user.status !== 'Blocked'} text={user.status || 'Active'} />
                        </td>
                        <td className="px-6 py-4 text-right">
                            <button
                                onClick={() => onToggleBlock(user.id, user.status)}
                                className={`
                                    px-4 py-2 rounded-xl text-[12px] font-bold tracking-wide transition-all shadow-sm border
                                    ${user.status === 'Blocked'
                                        ? 'text-red-600 bg-white border-red-200 hover:bg-red-50'
                                        : 'text-emerald-600 bg-white border-emerald-200 hover:bg-emerald-50'}
                                `}
                            >
                                {user.status === 'Blocked' ? 'Unblock' : 'Block'}
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

// -------------------------------------------------------------
// Tab 2: Sellers Table
// -------------------------------------------------------------
function SellersTable({ sellers, onToggleBlock }) {
    if (sellers.length === 0) return <EmptyState tabName="Sellers" />;

    return (
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[12px] font-black text-slate-500 uppercase tracking-widest">Shop & Seller</th>
                    <th className="px-6 py-4 text-[12px] font-black text-slate-500 uppercase tracking-widest hidden md:table-cell">Joined</th>
                    <th className="px-6 py-4 text-[12px] font-black text-slate-500 uppercase tracking-widest text-center">Products</th>
                    <th className="px-6 py-4 text-[12px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                    <th className="px-6 py-4 text-[12px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {sellers.map((seller) => (
                    <tr key={seller.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black border border-indigo-100 shadow-sm">
                                    <Store size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-900 text-[15px]">{seller.businessName}</span>
                                    <span className="text-[13px] text-slate-500 font-medium">by {seller.name} &bull; {seller.email}</span>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                            <span className="text-[14px] font-semibold text-slate-700">
                                {seller.createdAt ? new Date(seller.createdAt).toLocaleDateString('en-GB') : 'N/A'}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 bg-slate-100 rounded-lg text-slate-700 font-black text-[14px] border border-slate-200">
                                {seller.totalProducts || 0}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <StatusBadge isActive={seller.isActive !== false} text={seller.isActive === false ? 'Blocked' : 'Active'} />
                        </td>
                        <td className="px-6 py-4 text-right">
                            <button
                                onClick={() => onToggleBlock(seller.id, seller.isActive)}
                                className={`
                                    px-4 py-2 rounded-xl text-[12px] font-bold tracking-wide transition-all shadow-sm border
                                    ${seller.isActive === false
                                        ? 'text-red-600 bg-white border-red-200 hover:bg-red-50'
                                        : 'text-emerald-600 bg-white border-emerald-200 hover:bg-emerald-50'}
                                `}
                            >
                                {seller.isActive === false ? 'Unblock' : 'Block'}
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

// -------------------------------------------------------------
// Tab 3: Seller Requests Table
// -------------------------------------------------------------
function SellerRequestsTable({ requests, onApprove, onReject, onViewDetails, isRejectedPage }) {
    if (requests.length === 0) {
        return (
            <EmptyState
                tabName={isRejectedPage ? "Rejected Applications" : "Seller Requests"}
                icon={isRejectedPage ? <ShieldOff size={48} className="text-slate-300 mb-4" /> : <ShieldCheck size={48} className="text-emerald-500 mb-4" />}
                message={isRejectedPage ? "No rejected applications found." : "No pending seller requests. Everything is up to date!"}
            />
        );
    }

    return (
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[12px] font-black text-slate-500 uppercase tracking-widest">Applicant Details</th>
                    <th className="px-6 py-4 text-[12px] font-black text-slate-500 uppercase tracking-widest">Contact</th>
                    <th className="px-6 py-4 text-[12px] font-black text-slate-500 uppercase tracking-widest">Applied Date</th>
                    <th className="px-6 py-4 text-[12px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                    <th className="px-6 py-4 text-[12px] font-black text-slate-500 uppercase tracking-widest text-right">Decision</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {requests.map((request) => (
                    <tr key={request.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black border shadow-sm ${isRejectedPage ? 'bg-red-50 text-red-700 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse-slow'}`}>
                                    {request.businessName?.[0]?.toUpperCase()}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-900 text-[15px]">{request.businessName}</span>
                                    <span className="text-[13px] text-slate-500 font-medium">by {request.name}</span>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex flex-col">
                                <span className="font-bold text-slate-700 text-[14px]">{request.email}</span>
                                <span className="text-[13px] text-slate-500 font-medium">{request.phone}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-[14px] font-bold text-slate-700">
                                <Clock size={16} className="text-slate-400" />
                                {request.createdAt ? new Date(request.createdAt).toLocaleDateString('en-GB') : 'N/A'}
                            </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                            {isRejectedPage ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-[11px] font-black uppercase tracking-wider">
                                    Rejected
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-black uppercase tracking-wider">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                    </span>
                                    Pending
                                </span>
                            )}
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                                <button
                                    onClick={() => onViewDetails(request)}
                                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[12px] font-bold transition-all flex items-center gap-2"
                                >
                                    <Info size={16} /> Details
                                </button>

                                {!isRejectedPage && (
                                    <>
                                        <button
                                            onClick={() => onReject(request)}
                                            className="p-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors border border-transparent hover:border-red-200"
                                            title="Reject Request"
                                        >
                                            <XCircle size={20} strokeWidth={2.5} />
                                        </button>
                                        <button
                                            onClick={() => onApprove(request.id)}
                                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[12px] font-bold tracking-wide transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                                        >
                                            <CheckCircle2 size={16} strokeWidth={3} /> Approve
                                        </button>
                                    </>
                                )}
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

// -------------------------------------------------------------
// Component: Seller Details Modal
// -------------------------------------------------------------
function SellerDetailsModal({ seller, onClose, onApprove, onReject }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white w-full max-w-3xl rounded-[32px] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] translate-y-14">
                {/* Modal Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">
                            <Store size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900">{seller.businessName}</h3>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Seller Application Profile</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>

                {/* Modal Body - Scrollable */}
                <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
                    {/* Basic Info Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InfoItem icon={<Users size={18} />} label="Owner Name" value={seller.name} />
                        <InfoItem icon={<FileText size={18} />} label="Email Address" value={seller.email} />
                        <InfoItem icon={<Clock size={18} />} label="Phone Number" value={seller.phone} />
                        <InfoItem icon={<Clock size={18} />} label="Applied On" value={new Date(seller.createdAt).toLocaleDateString('en-GB')} />
                    </div>

                    <div className="h-px bg-slate-100"></div>

                    {/* Tax & Business Identity */}
                    <div className="space-y-4">
                        <h4 className="text-[13px] font-black text-slate-400 uppercase tracking-[0.2em]">Business Identity</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DocumentCard label="GST Number" number={seller.gstNumber || 'Not Provided'} />
                            <DocumentCard label="PAN Number" number={seller.panNumber || 'Not Provided'} />
                        </div>
                    </div>

                    {/* Bank Details */}
                    <div className="space-y-4">
                        <h4 className="text-[13px] font-black text-slate-400 uppercase tracking-[0.2em]">Bank Account Details</h4>
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-y-4">
                            <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Account Holder</span>
                                <span className="font-bold text-slate-700">{seller.bankDetails?.accountHolder || 'N/A'}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bank Name</span>
                                <span className="font-bold text-slate-700">{seller.bankDetails?.bankName || 'N/A'}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Account Number</span>
                                <span className="font-black text-blue-600 font-mono tracking-wider">{seller.bankDetails?.accountNumber || 'N/A'}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">IFSC Code</span>
                                <span className="font-black text-slate-700">{seller.bankDetails?.ifscCode || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* ID Proof Display */}
                    <div className="space-y-4">
                        <h4 className="text-[13px] font-black text-slate-400 uppercase tracking-[0.2em]">Identity Verification</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block ml-1">Aadhaar Card</span>
                                <div className="bg-slate-100 rounded-2xl h-48 border border-slate-200 flex flex-col items-center justify-center overflow-hidden relative shadow-sm">
                                    {seller.aadhaarUrl || seller.idProofUrl ? (
                                        <img src={getImageUrl(seller.aadhaarUrl || seller.idProofUrl)} alt="Aadhaar Card" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-[13px] font-bold text-slate-400">No Aadhaar Document</span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block ml-1">PAN Card</span>
                                <div className="bg-slate-100 rounded-2xl h-48 border border-slate-200 flex flex-col items-center justify-center overflow-hidden relative shadow-sm">
                                    {seller.panCardUrl ? (
                                        <img src={getImageUrl(seller.panCardUrl)} alt="PAN Card" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-[13px] font-bold text-slate-400">No PAN Document</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                {seller.status === 'pending' && (
                    <div className="p-6 bg-white border-t border-slate-100 flex items-center justify-end gap-3">
                        <button
                            onClick={onReject}
                            className="px-6 py-3 rounded-xl border border-red-100 text-red-600 font-bold text-sm hover:bg-red-50 transition-all"
                        >
                            Reject Application
                        </button>
                        <button
                            onClick={onApprove}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-xl shadow-blue-200 transition-all flex items-center gap-2"
                        >
                            <ShieldCheck size={18} /> Approve Seller
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// -------------------------------------------------------------
// Component: Reject Reason Modal
// -------------------------------------------------------------
function RejectReasonModal({ seller, reason, setReason, onClose, onConfirm }) {
    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose}></div>
            <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 pb-4 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-6">
                        <ShieldAlert size={32} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">Reject Application?</h3>
                    <p className="text-slate-500 font-semibold mb-6 italic">Specifically for {seller.businessName}</p>
                </div>

                <div className="px-8 pb-8 space-y-4">
                    <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest block ml-1">Rejection Reason (Required)</label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="e.g., GST document is expired, Bank account name mismatch..."
                        className="w-full h-32 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all resize-none"
                    ></textarea>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3.5 rounded-2xl text-[13px] font-black text-slate-600 hover:bg-slate-100 transition-all border border-slate-200"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={!reason.trim()}
                            onClick={onConfirm}
                            className="flex-1 py-3.5 bg-red-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl text-[13px] font-black shadow-lg shadow-red-200 hover:bg-red-700 transition-all"
                        >
                            Confirm Rejection
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// -------------------------------------------------------------
// UI Helpers
// -------------------------------------------------------------
function InfoItem({ icon, label, value }) {
    return (
        <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                {icon}
            </div>
            <div className="flex flex-col">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
                <span className="font-bold text-slate-700 text-[14px]">{value}</span>
            </div>
        </div>
    );
}

function DocumentCard({ label, number }) {
    return (
        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between group hover:border-blue-200 hover:bg-white transition-all">
            <div className="flex flex-col">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wide">{label}</span>
                <span className="font-black text-slate-800 text-[15px] group-hover:text-blue-600 transition-colors uppercase">{number}</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-300 group-hover:text-blue-400 border border-slate-100 shadow-sm transition-all">
                <ShieldCheck size={16} />
            </div>
        </div>
    );
}

// -------------------------------------------------------------
// Helper Components
// -------------------------------------------------------------
function StatusBadge({ isActive, text }) {
    return (
        <span className={`
            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider border
            ${isActive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-red-50 text-red-700 border-red-200'}
        `}>
            {isActive ? <CheckCircle2 size={12} strokeWidth={3} /> : <ShieldOff size={12} strokeWidth={2.5} />}
            {text}
        </span>
    );
}

function EmptyState({ tabName, icon, message }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            {icon || <Search size={48} className="text-slate-300 mb-4" />}
            <h3 className="text-xl font-bold text-slate-800 mb-2">No {tabName}</h3>
            <p className="text-slate-500 font-medium whitespace-pre-line">{message || "There are no records matching your current filter."}</p>
        </div>
    );
}
