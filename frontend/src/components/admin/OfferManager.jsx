import React, { useState, useMemo } from 'react';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Trash2,
    Edit3,
    ArrowRight,
    ExternalLink,
    Clock,
    CheckCircle,
    XCircle,
    Calendar,
    ChevronDown,
    X,
    Info
} from 'lucide-react';

const INITIAL_COUPONS = [
    { id: 1, name: 'Welcome Discount 2026', code: 'WELCOME50', discount: '50% Off', redeemed: 1205, limit: 2000, status: 'Active', startDate: '2026-01-01', endDate: '2026-06-30' },
    { id: 2, name: 'Free Shipping Campaign', code: 'FREESHIP', discount: 'Free Shipping', redeemed: 850, limit: 1000, status: 'Active', startDate: '2026-03-01', endDate: '2026-05-15' },
    { id: 3, name: 'Summer End Clearance', code: 'SUMMER20', discount: '20% Off', redeemed: 500, limit: 500, status: 'Expired', startDate: '2026-02-01', endDate: '2026-03-01' },
    { id: 4, name: 'New Gadget Launch Promo', code: 'TECHSAVY', discount: '₹100 Off', redeemed: 0, limit: 100, status: 'Scheduled', startDate: '2026-08-01', endDate: '2026-08-10' },
];

export default function OfferManager() {
    const [coupons, setCoupons] = useState(INITIAL_COUPONS);
    const [activeTab, setActiveTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest'); // newest, expiry
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState(null);

    const filteredCoupons = useMemo(() => {
        let result = coupons.filter(c => {
            const matchesTab = activeTab === 'All' || c.status === activeTab;
            const matchesSearch = c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesTab && matchesSearch;
        });

        if (sortBy === 'newest') {
            result.sort((a, b) => b.id - a.id);
        } else if (sortBy === 'expiry') {
            result.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
        }

        return result;
    }, [coupons, activeTab, searchQuery, sortBy]);

    const handleDelete = (id) => {
        const coupon = coupons.find(c => c.id === id);
        if (!coupon) return;

        if (coupon.status === 'Expired') {
            if (window.confirm('Delete this promotion record permanently?')) {
                setCoupons(prev => prev.filter(c => c.id !== id));
            }
        } else {
            if (window.confirm('Are you sure you want to end this promotion?')) {
                setCoupons(prev => prev.map(c => c.id === id ? { ...c, status: 'Expired' } : c));
            }
        }
    };

    const handleCreatePromotion = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newCoupon = {
            id: coupons.length + 1,
            name: formData.get('name'),
            code: formData.get('code'),
            discount: formData.get('discount'),
            redeemed: 0,
            limit: parseInt(formData.get('limit')),
            status: 'Active',
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate')
        };
        setCoupons([newCoupon, ...coupons]);
        setShowCreateModal(false);
        alert('Promotion created successfully!');
    };

    return (
        <div className="p-6 bg-white min-h-screen relative">
            {/* Premium Breadcrumb/Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    <span>Advertising</span>
                    <ArrowRight size={12} />
                    <span className="font-medium text-slate-900">Promotions</span>
                </div>
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-900">Manage Promotions</h1>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#FF9900] hover:bg-[#E68A00] text-black rounded-md font-bold text-[13px] shadow-sm transition-colors border border-[#CC7A00]"
                    >
                        <Plus size={16} strokeWidth={3} />
                        Create a promotion
                    </button>
                </div>
            </div>

            {/* Top Stats/Filters Ribbon */}
            <div className="flex border-b border-slate-200 mb-6 overflow-x-auto scrollbar-hide">
                {['All', 'Active', 'Scheduled', 'Expired'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === tab
                            ? 'border-[#FF9900] text-slate-900'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        {tab}
                        {tab === 'All' && <span className="ml-2 px-2 py-0.5 bg-slate-100 rounded text-[11px] font-bold text-slate-600">{coupons.length}</span>}
                    </button>
                ))}
            </div>

            {/* Search and Action Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4 items-center justify-between">
                <div className="relative w-full sm:w-80 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search by name or code..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded border border-slate-300 text-sm focus:border-[#FF9900] focus:ring-1 focus:ring-[#FF9900] outline-none shadow-inner bg-[#F7F7F7]"
                    />
                </div>
                <div className="flex gap-2 text-sm relative">
                    <button
                        onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                        className="px-3 py-2 border border-slate-300 rounded hover:bg-slate-50 font-medium flex items-center gap-2 bg-white shadow-sm"
                    >
                        <Filter size={14} /> Filter <ChevronDown size={14} />
                    </button>
                    {showFilterDropdown && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-md shadow-lg z-50 p-2">
                            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest p-2">Sort by</div>
                            <button
                                onClick={() => { setSortBy('newest'); setShowFilterDropdown(false); }}
                                className={`w-full text-left px-3 py-2 hover:bg-slate-50 rounded text-sm font-medium ${sortBy === 'newest' ? 'text-blue-600 bg-blue-50' : 'text-slate-700'}`}
                            >
                                Newest First
                            </button>
                            <button
                                onClick={() => { setSortBy('expiry'); setShowFilterDropdown(false); }}
                                className={`w-full text-left px-3 py-2 hover:bg-slate-50 rounded text-sm font-medium ${sortBy === 'expiry' ? 'text-blue-600 bg-blue-50' : 'text-slate-700'}`}
                            >
                                Near Expiry
                            </button>
                            <button className="w-full text-left px-3 py-2 hover:bg-slate-50 rounded text-sm text-slate-700 font-bold text-[#FF9900]" onClick={() => setShowFilterDropdown(false)}>Close</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Table Content */}
            <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse bg-white min-w-[800px]">
                    <thead className="bg-[#F8F9FA] border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-3 text-[12px] font-bold text-slate-600 uppercase tracking-wider">Promotion Name & Code</th>
                            <th className="px-4 py-3 text-[12px] font-bold text-slate-600 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-[12px] font-bold text-slate-600 uppercase tracking-wider">Effectiveness</th>
                            <th className="px-4 py-3 text-[12px] font-bold text-slate-600 uppercase tracking-wider">Duration</th>
                            <th className="px-4 py-3 text-[12px] font-bold text-slate-600 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredCoupons.length > 0 ? filteredCoupons.map((coupon) => (
                            <tr key={coupon.id} className="hover:bg-[#FDFDFD] transition-colors group">
                                <td className="px-4 py-4">
                                    <div className="flex flex-col">
                                        <span onClick={() => setSelectedCoupon(coupon)} className="font-bold text-slate-900 group-hover:text-blue-600 cursor-pointer">{coupon.name}</span>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[11px] font-black bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 uppercase">{coupon.code}</span>
                                            <span className="text-[12px] text-slate-500">&bull; {coupon.discount}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-sm">
                                    <StatusBadge status={coupon.status} />
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex justify-between text-[11px] font-bold">
                                            <span className="text-slate-500">Redemptions</span>
                                            <span className="text-slate-900">{coupon.redeemed} / {coupon.limit}</span>
                                        </div>
                                        <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                            <div
                                                className={`h-full ${coupon.redeemed >= coupon.limit ? 'bg-slate-400' : 'bg-emerald-500'}`}
                                                style={{ width: `${Math.min(100, (coupon.redeemed / coupon.limit) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex flex-col text-[12px] text-slate-600 gap-1">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={12} className="text-slate-400" />
                                            <span>Start: {new Date(coupon.startDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={12} className="text-slate-400" />
                                            <span>End: {new Date(coupon.endDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => setSelectedCoupon(coupon)} className="text-[13px] font-bold text-blue-600 hover:text-blue-800 hover:underline px-2 py-1">View Details</button>
                                        <div className="h-4 w-[1px] bg-slate-200" />
                                        <button
                                            onClick={() => handleDelete(coupon.id)}
                                            className="text-[13px] font-bold text-slate-500 hover:text-red-600 px-2 py-1"
                                        >
                                            {coupon.status === 'Expired' ? 'Delete' : 'End'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="px-4 py-12 text-center">
                                    <div className="flex flex-col items-center">
                                        <Search size={40} className="text-slate-200 mb-4" />
                                        <p className="font-bold text-slate-800">No promotions found</p>
                                        <p className="text-sm text-slate-500 mt-1">Try changing your search or filter settings.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Modal Placeholder */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-lg shadow-xl animate-in fade-in zoom-in duration-200">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="font-bold text-lg">Create New Promotion</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreatePromotion} className="p-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Promotion Name</label>
                                <input name="name" required className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:border-[#FF9900] outline-none" placeholder="e.g. Flash Sale" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Coupon Code</label>
                                <input name="code" required className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:border-[#FF9900] outline-none" placeholder="UPTO50" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Discount</label>
                                    <input name="discount" required className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:border-[#FF9900] outline-none" placeholder="20% Off" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Limit</label>
                                    <input name="limit" type="number" required className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:border-[#FF9900] outline-none" placeholder="500" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Start Date</label>
                                    <input name="startDate" type="date" required className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:border-[#FF9900] outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">End Date</label>
                                    <input name="endDate" type="date" required className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:border-[#FF9900] outline-none" />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 border border-slate-300 rounded font-bold text-sm bg-slate-50 hover:bg-slate-100 transition-colors">Cancel</button>
                                <button type="submit" className="flex-2 px-6 py-2 bg-[#FF9900] text-black rounded font-bold text-sm border border-[#CC7A00] hover:bg-[#E68A00] transition-colors">Create Promotion</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Details Overlay Placeholder */}
            {selectedCoupon && (
                <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white border-l border-slate-200 shadow-2xl z-[101] p-6 animate-in slide-in-from-right duration-300">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-bold">Promotion Details</h2>
                        <button onClick={() => setSelectedCoupon(null)} className="p-2 hover:bg-slate-100 rounded-full"><X size={24} /></button>
                    </div>
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                            <div className="p-3 bg-white rounded-lg shadow-sm"><Info className="text-blue-600" size={24} /></div>
                            <div>
                                <div className="text-sm font-bold text-slate-400 uppercase">Code</div>
                                <div className="text-lg font-black text-slate-900">{selectedCoupon.code}</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <DetailItem label="Status" value={<StatusBadge status={selectedCoupon.status} />} />
                            <DetailItem label="Discount" value={selectedCoupon.discount} />
                            <DetailItem label="Redeemed" value={`${selectedCoupon.redeemed} Orders`} />
                            <DetailItem label="Limit" value={`${selectedCoupon.limit} Total`} />
                        </div>
                        <div className="border-t border-slate-100 pt-6">
                            <DetailItem label="Duration" value={`${new Date(selectedCoupon.startDate).toLocaleDateString()} - ${new Date(selectedCoupon.endDate).toLocaleDateString()}`} />
                        </div>
                        <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold mt-8 hover:bg-slate-800 transition-colors">Download Performance Report</button>
                    </div>
                </div>
            )}

            {/* Information Tip Box */}
            <div className="mt-8 bg-[#F0F2F2] border border-[#D5D9D9] p-4 rounded-lg flex gap-4">
                <div className="mt-1"><ExternalLink size={20} className="text-slate-500" /></div>
                <div>
                    <h4 className="font-bold text-sm text-slate-900">Need help with your promotions?</h4>
                    <p className="text-sm text-slate-600 mt-1">Visit our <span className="text-blue-600 hover:underline cursor-pointer">Promotion Guidelines</span> to learn more about how to maximize your sales performance. Note that ending a promotion will immediately prevent new customers from redeeming it.</p>
                </div>
            </div>
        </div>
    );
}

function DetailItem({ label, value }) {
    return (
        <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</div>
            <div className="font-bold text-slate-800">{value}</div>
        </div>
    );
}

function StatusBadge({ status }) {
    const config = {
        Active: { icon: <CheckCircle size={12} />, bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        Expired: { icon: <XCircle size={12} />, bg: 'bg-slate-50 text-slate-600 border-slate-200' },
        Scheduled: { icon: <Clock size={12} />, bg: 'bg-amber-50 text-amber-700 border-amber-200' }
    };

    const { icon, bg } = config[status] || { icon: null, bg: 'bg-slate-50 text-slate-600' };

    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[11px] font-bold uppercase tracking-wide ${bg}`}>
            {icon}
            {status}
        </span>
    );
}
