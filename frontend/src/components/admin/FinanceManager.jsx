import React, { useState, useEffect } from 'react';
import {
    CreditCard, ArrowRightLeft, Landmark, Wallet, Receipt,
    RefreshCw, Loader2, CheckCircle2, Clock, XCircle, Activity, ShieldCheck
} from 'lucide-react';
import { getAdminFinanceData, getAdminPayouts, approvePayoutAdmin } from '../../api/adminApi';

const formatINR = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value || 0);

// Professional Status Badge Component
const StatusBadge = ({ status }) => {
    let colorClass = 'bg-slate-100 text-slate-700 border-slate-200';
    let icon = null;

    if (['Paid', 'Completed', 'Successful', 'Approved', 'Delivered'].includes(status)) {
        colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        icon = <CheckCircle2 size={12} />;
    } else if (['Pending', 'Processing'].includes(status)) {
        colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
        icon = <Clock size={12} />;
    } else if (['Cancelled', 'Failed', 'Rejected', 'FailedOrCancelled'].includes(status)) {
        colorClass = 'bg-rose-50 text-rose-700 border-rose-200';
        icon = <XCircle size={12} />;
    } else if (status === 'Adjustment') {
        colorClass = 'bg-purple-50 text-purple-700 border-purple-200';
        icon = <RefreshCw size={12} />;
    }

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider border ${colorClass} shadow-sm transition-all duration-300 hover:scale-105`}>
            {icon} {status}
        </span>
    );
};

// Premium Summary Card Component
const SummaryCard = ({ title, value, subValue, icon: Icon, colorClass }) => (
    <div className="relative overflow-hidden group rounded-3xl bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 ease-out p-6 transform hover:-translate-y-1">
        <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-5 ${colorClass.bg} group-hover:scale-[2.5] transition-transform duration-700 ease-out`} />
        <div className={`absolute -left-10 -bottom-10 w-24 h-24 rounded-full opacity-[0.03] ${colorClass.bg} group-hover:scale-[2] transition-transform duration-700 ease-out`} />

        <div className="relative z-10 flex items-start justify-between">
            <div className="flex flex-col gap-1">
                <h3 className="text-slate-500/80 text-[11px] font-[800] uppercase tracking-[0.2em]">{title}</h3>
                <h2 className="text-3xl font-[900] tracking-tight text-slate-800 drop-shadow-sm mt-1">{value}</h2>
                {subValue && <p className="text-xs font-bold text-slate-400 mt-1">{subValue}</p>}
            </div>
            <div className={`p-3.5 rounded-2xl ${colorClass.bg} ${colorClass.text} shadow-sm group-hover:rotate-12 transition-transform duration-500 ring-4 ring-white`}>
                <Icon size={24} strokeWidth={2.5} />
            </div>
        </div>
    </div>
);

// Empty State Helper
function EmptyState({ label }) {
    return (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-white/50 backdrop-blur-xl rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/50 pointer-events-none"></div>
            <div className="p-6 bg-slate-50 rounded-full mb-6 relative z-10 ring-8 ring-white shadow-sm">
                <Receipt size={32} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-[900] tracking-tight text-slate-800 mb-2 relative z-10">No {label} Found</h3>
            <p className="text-sm font-bold text-slate-400 relative z-10 max-w-sm">There are currently no financial records matching this criteria in the database.</p>
        </div>
    );
}

// -------------------------------------------------------------------------
// TABS COMPONENTS
// -------------------------------------------------------------------------

function TransactionsTab({ data }) {
    if (!data?.length) return <EmptyState label="Transactions" />;
    return (
        <div className="animate-fade-in bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/80 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 opacity-80"></div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Order & Payment Ref</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Customer & Seller</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center whitespace-nowrap">Amount & Method</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right whitespace-nowrap">Date & Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {data.map((item, i) => (
                            <tr key={item.id + i} className="hover:bg-blue-50/30 transition-all duration-300 group cursor-default">
                                <td className="px-8 py-5">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-bold text-slate-800 text-[14px] group-hover:text-blue-600 transition-colors">ORD-{item.orderId}</span>
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                            <span className="text-[11px] text-slate-400 font-bold font-mono tracking-wider">{item.paymentId !== 'N/A' ? `TXN:${item.paymentId}` : 'COD TRK'}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs ring-2 ring-white shadow-sm">
                                            {item.user.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-800 text-[13px]">{item.user}</span>
                                            <span className="text-[11px] text-slate-400 font-bold mt-0.5">via {item.seller}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-center">
                                    <div className="flex flex-col items-center">
                                        <span className="font-black text-slate-900 text-[15px]">{formatINR(item.amount)}</span>
                                        <span className="text-[9px] font-[900] uppercase tracking-[0.15em] text-slate-500 mt-1.5 px-2.5 py-1 bg-slate-100 rounded-lg">{item.method}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-right flex flex-col items-end gap-2">
                                    <StatusBadge status={item.status} />
                                    <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5">
                                        <Clock size={10} /> {new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function RefundsTab({ data }) {
    if (!data?.length) return <EmptyState label="Refund Requests" />;
    return (
        <div className="animate-fade-in bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/80 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-rose-400 to-pink-400 opacity-80"></div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Order Ref</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Reason</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Outflow Amount</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Status & Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {data.map((item, i) => (
                            <tr key={item.id + i} className="hover:bg-rose-50/30 transition-all duration-300 group cursor-default">
                                <td className="px-8 py-5 font-bold text-slate-800 text-[14px] group-hover:text-rose-600 transition-colors">ORD-{item.orderId}</td>
                                <td className="px-8 py-5 text-[13px] font-bold text-slate-500">{item.reason}</td>
                                <td className="px-8 py-5 text-center font-[900] text-[15px] text-rose-600">-{formatINR(item.amount)}</td>
                                <td className="px-8 py-5 text-right flex flex-col items-end gap-2">
                                    <StatusBadge status={item.status} />
                                    <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5">
                                        <Clock size={10} /> {new Date(item.date).toLocaleDateString('en-GB')}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function SellerPayoutsTab({ data }) {
    if (!data?.length) return <EmptyState label="Seller Payout Data" />;
    return (
        <div className="animate-fade-in bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/80 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 opacity-80"></div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Seller Name</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right whitespace-nowrap">Gross Earned</th>
                            <th className="px-8 py-5 text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] text-right whitespace-nowrap">- Platform Fee</th>
                            <th className="px-8 py-5 text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] text-right whitespace-nowrap">Net Payable</th>
                            <th className="px-8 py-5 text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] text-right whitespace-nowrap">Paid Out</th>
                            <th className="px-8 py-5 text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] text-right whitespace-nowrap">Balance Due</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {data.map((seller, i) => (
                            <tr key={seller.id + i} className="hover:bg-slate-50/80 transition-all duration-300">
                                <td className="px-8 py-5 font-[900] text-slate-800 text-[14px]">{seller.name}</td>
                                <td className="px-8 py-5 text-right font-bold text-slate-500">{formatINR(seller.totalEarnings)}</td>
                                <td className="px-8 py-5 text-right font-bold text-amber-500">-{formatINR(seller.commission)}</td>
                                <td className="px-8 py-5 text-right font-black text-blue-600 bg-blue-50/30">{formatINR(seller.payable)}</td>
                                <td className="px-8 py-5 text-right font-bold text-emerald-600 bg-emerald-50/30">{formatINR(seller.paid)}</td>
                                <td className="px-8 py-5 text-right font-black text-rose-600 bg-rose-50/30">{formatINR(seller.pending)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function SettlementsTab({ data }) {
    if (!data?.length) return <EmptyState label="Settlements History" />;
    return (
        <div className="animate-fade-in bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/80 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-80"></div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction Ref</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Seller Account</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Settled Amount</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Date & Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {data.map((item, i) => (
                            <tr key={item.id + i} className="hover:bg-emerald-50/30 transition-all duration-300">
                                <td className="px-8 py-5">
                                    <span className="text-[12px] text-slate-500 font-bold font-mono tracking-wider">{item.transactionId || 'Manual Transfer'}</span>
                                </td>
                                <td className="px-8 py-5 font-bold text-slate-800 text-[14px]">{item.seller}</td>
                                <td className="px-8 py-5 text-right font-black text-emerald-600 text-[15px]">+{formatINR(item.amount)}</td>
                                <td className="px-8 py-5 text-right flex flex-col items-end gap-2">
                                    <StatusBadge status={item.status} />
                                    <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5">
                                        <Clock size={10} /> {new Date(item.date).toLocaleDateString('en-GB')}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function PayoutsManagementTab({ payouts, onApprove }) {
    if (!payouts?.length) return <EmptyState label="Pending Payouts" />;
    return (
        <div className="animate-fade-in bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/80 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-80"></div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Order Ref</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Seller Information</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Earnings Detail</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {payouts.map((payout) => (
                            <tr key={payout._id} className="hover:bg-slate-50 transition-all duration-300">
                                <td className="px-8 py-5">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-800">ORD-{payout.orderId?._id?.slice(-6).toUpperCase() || 'N/A'}</span>
                                        <span className="text-[10px] text-slate-400 font-bold">{new Date(payout.createdAt).toLocaleDateString('en-GB')}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-800">{payout.sellerId?.businessName || payout.sellerId?.name}</span>
                                        <span className="text-[11px] text-slate-400 font-bold">{payout.sellerId?.email}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <div className="flex flex-col items-end">
                                        <span className={`font-black text-lg ${payout.sellerEarning < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            {formatINR(payout.sellerEarning)}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-bold">Fee: {formatINR(payout.platformCommission)} (10%)</span>
                                        {payout.notes && (
                                            <span className="text-[9px] text-amber-600 font-black uppercase tracking-tighter mt-1 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 italic">
                                                {payout.notes}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    {payout.payoutStatus === 'Pending' ? (
                                        <button
                                            onClick={() => onApprove(payout._id)}
                                            className="px-4 py-2 bg-slate-900 text-white text-[11px] font-black uppercase rounded-xl hover:bg-emerald-600 transition-all shadow-lg hover:shadow-emerald-600/20"
                                        >
                                            Approve Payout
                                        </button>
                                    ) : (
                                        <div className="flex flex-col items-end gap-1">
                                            <StatusBadge status="Paid" />
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Ref: {payout.reference}</span>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function OverviewLedgerTab({ ledger, logs }) {
    const totalProcessed = logs.totalProcessed || 1;
    return (
        <div className="animate-fade-in space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Commission Breakdown Card - Elegant styling */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 flex flex-col h-full relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50 -z-10 group-hover:bg-emerald-100 transition-colors duration-700"></div>

                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-100/50 text-emerald-600 rounded-2xl ring-4 ring-white shadow-sm"><Landmark size={28} strokeWidth={2.5} /></div>
                            <div>
                                <h3 className="text-xl font-[900] text-slate-800 tracking-tight">Platform Earnings</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Real-time Revenue Share</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest hidden sm:inline-block">Live Sync</span>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center space-y-8 relative z-10">
                        <div className="flex justify-between items-end border-b border-slate-50 pb-5 hover:bg-slate-50/50 p-2 rounded-xl transition-colors">
                            <span className="text-slate-500 font-bold text-sm tracking-wide">Total Platform Gross Volume</span>
                            <span className="text-2xl font-black text-slate-800">{formatINR(ledger.totalSales)}</span>
                        </div>
                        <div className="flex justify-between items-end border-b border-slate-50 pb-5 hover:bg-slate-50/50 p-2 rounded-xl transition-colors">
                            <span className="text-slate-500 font-bold text-sm tracking-wide">Net Seller Allocations</span>
                            <span className="text-2xl font-black text-slate-400">{formatINR(ledger.sellerShare)}</span>
                        </div>
                        <div className="flex justify-between items-end pt-2 p-2 relative">
                            <div className="absolute inset-0 bg-emerald-50/30 rounded-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div>
                                <span className="block text-slate-800 font-[900] tracking-tight text-lg">Net Platform Revenue</span>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg mt-2 inline-block border border-emerald-100 shadow-sm">Rate: {ledger.commissionRate} Flat</span>
                            </div>
                            <span className="text-4xl font-[900] text-emerald-600 drop-shadow-sm">{formatINR(ledger.platformCommission)}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Gateway Logs - Dark Mode Premium Panel */}
                <div className="bg-slate-900 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-800 p-8 flex flex-col h-full relative overflow-hidden group text-white">
                    <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-colors duration-700"></div>

                    <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-800 relative z-10">
                        <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl ring-4 ring-slate-800 shadow-sm"><Activity size={28} strokeWidth={2.5} /></div>
                        <div>
                            <h3 className="text-xl font-[900] tracking-tight text-white">Gateway Health Logs</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Transaction Processing Engine</p>
                        </div>
                    </div>

                    <div className="space-y-4 relative z-10 flex-1 flex flex-col justify-center">
                        <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-emerald-500/20 rounded-xl"><ShieldCheck size={20} className="text-emerald-400" /></div>
                                <span className="font-bold text-slate-300 text-sm tracking-wide">Online Secured (Paid)</span>
                            </div>
                            <div className="text-right">
                                <span className="block font-black text-xl text-white">{logs.successful}</span>
                                <span className="text-[10px] font-bold text-emerald-400 tracking-wider">{(Math.round(logs.successful / totalProcessed * 100)) || 0}% RATIO</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-amber-500/20 rounded-xl"><Clock size={20} className="text-amber-400" /></div>
                                <span className="font-bold text-slate-300 text-sm tracking-wide">Pending COD Collections</span>
                            </div>
                            <span className="font-black text-xl text-white">{logs.codPending}</span>
                        </div>

                        <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-blue-500/20 rounded-xl"><CheckCircle2 size={20} className="text-blue-400" /></div>
                                <span className="font-bold text-slate-300 text-sm tracking-wide">COD Successfully Collected</span>
                            </div>
                            <span className="font-black text-xl text-white">{logs.codCollected}</span>
                        </div>

                        <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-rose-500/20 rounded-xl"><XCircle size={20} className="text-rose-400" /></div>
                                <span className="font-bold text-slate-300 text-sm tracking-wide">Failed / Cancelled TXNs</span>
                            </div>
                            <span className="font-black text-xl text-rose-400">{logs.failedOrCancelled}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// -------------------------------------------------------------------------
// MAIN EXPORT COMPONENT
// -------------------------------------------------------------------------

function FinanceManagerCore({ activeSubTab }) {
    const [data, setData] = useState(null);
    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('transactions');

    useEffect(() => {
        fetchData();
        fetchPayouts();
        if (activeSubTab && activeSubTab !== 'finance') {
            const mapped = activeSubTab.replace('finance-', '');
            setActiveTab(mapped);
        } else {
            setActiveTab('transactions');
        }
    }, [activeSubTab]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await getAdminFinanceData();
            setData(res);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch finance data:", err);
            setError("Failed to stream secure financial data context.");
        } finally {
            setLoading(false);
        }
    };

    const fetchPayouts = async () => {
        try {
            const res = await getAdminPayouts();
            setPayouts(res);
        } catch (err) {
            console.error("Failed to fetch payouts:", err);
        }
    };

    const handleApprovePayout = async (id) => {
        try {
            const ref = `STRIPE-${Math.random().toString(36).substring(7).toUpperCase()}`;
            await approvePayoutAdmin(id, ref);
            fetchPayouts();
        } catch (err) {
            alert("Failed to approve payout");
        }
    };

    if (loading && !data) {
        return (
            <div className="flex items-center justify-center flex-1 py-32 min-h-[600px]">
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                        <Loader2 className="animate-spin text-blue-600 mb-6 relative z-10" size={56} />
                    </div>
                    <h3 className="text-slate-800 font-[900] tracking-tight text-xl">Syncing Secured Ledgers</h3>
                    <p className="text-slate-400 font-bold text-sm mt-1 uppercase tracking-widest animate-pulse">Establishing Connection...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center bg-rose-50 rounded-3xl border border-rose-100 max-w-2xl mx-auto mt-12">
                <XCircle size={48} className="text-rose-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-rose-800 mb-2">Connection Interrupted</h3>
                <p className="text-rose-600 font-medium">{error}</p>
                <button onClick={fetchData} className="mt-6 px-6 py-2 bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-colors">Retry Connection</button>
            </div>
        );
    }

    const tabs = [
        { id: 'finance-transactions', label: 'Inward Transactions', val: 'transactions' },
        { id: 'finance-payout-mgmt', label: 'Payout Management', val: 'payout-mgmt' },
        { id: 'finance-refunds', label: 'Outward Refunds', val: 'refunds' },
        { id: 'finance-payouts', label: 'Seller Payables', val: 'payouts' },
        { id: 'finance-ledger', label: 'Commission & Logs', val: 'ledger' },
    ];

    const summaryData = {
        totalTxn: data?.transactions?.length || 0,
        totalRefundAmt: data?.refunds?.reduce((acc, r) => acc + (Number(r.amount) || 0), 0) || 0,
        pendingSellerBal: data?.sellerPayouts?.reduce((acc, s) => acc + (Number(s.pending) || 0), 0) || 0
    };

    return (
        <div className="flex flex-col h-full min-h-[800px] p-2 sm:p-4 animate-fade-in font-sans">
            {/* Action Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="relative">
                    <div className="absolute -left-4 -top-4 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl"></div>
                    <div className="flex items-center gap-4 mb-2 relative z-10">
                        <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg ring-4 ring-slate-900/5">
                            <Activity size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-3xl sm:text-4xl font-[1000] text-slate-900 tracking-tight leading-none mb-1">Finance & Payments</h2>
                            <p className="text-slate-500 font-bold text-[13px] tracking-wide flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                Live Monetary Flow & Platform Accounting
                            </p>
                        </div>
                    </div>
                </div>

                <button onClick={fetchData} className="group bg-slate-900 hover:bg-slate-800 text-white px-5 py-3.5 rounded-2xl text-[13px] font-[800] tracking-wide shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 transition-all active:scale-95 border border-slate-700 whitespace-nowrap">
                    <div className="relative flex items-center justify-center">
                        {loading && <span className="absolute inline-flex h-full w-full rounded-full bg-white/30 animate-ping"></span>}
                        {loading ? <Loader2 size={18} className="animate-spin text-blue-400" /> : <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-700 text-blue-400" />}
                    </div>
                    Sync Data Stream
                </button>
            </div>

            {/* Premium Metrics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10">
                <SummaryCard title="Pending Seller Payouts" value={formatINR(summaryData.pendingSellerBal)} icon={Wallet} colorClass={{ bg: 'bg-rose-100', text: 'text-rose-600' }} />
                <SummaryCard title="Platform Commission Earned" value={formatINR(data?.commissionLedger?.platformCommission || 0)} icon={Landmark} colorClass={{ bg: 'bg-emerald-100', text: 'text-emerald-600' }} />
                <SummaryCard title="Total Refunds Outgoing" value={formatINR(summaryData.totalRefundAmt)} icon={ArrowRightLeft} colorClass={{ bg: 'bg-amber-100', text: 'text-amber-600' }} />
            </div>

            {/* High-End Tab Navigation */}
            <div className="flex gap-2.5 overflow-x-auto hide-scrollbar mb-8 p-1.5 bg-slate-100/80 backdrop-blur-md border border-slate-200/50 rounded-2xl w-full max-w-fit shadow-inner">
                {tabs.map(t => {
                    const isActive = activeTab === t.val || activeTab === t.id;
                    return (
                        <button
                            key={t.val}
                            onClick={() => setActiveTab(t.val)}
                            className={`px-6 py-3 rounded-xl text-[12px] font-[900] tracking-[0.1em] transition-all duration-300 uppercase whitespace-nowrap relative overflow-hidden flex-1 sm:flex-none text-center
                                ${isActive
                                    ? 'bg-white text-slate-900 shadow-[0_4px_12px_rgb(0,0,0,0.06)] ring-1 ring-slate-900/5 scale-100'
                                    : 'text-slate-500 hover:text-slate-800 hover:bg-white/50 scale-95 hover:scale-100'}`}
                        >
                            {isActive && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-[3px] bg-slate-900 rounded-t-full"></div>}
                            {t.label}
                        </button>
                    );
                })}
            </div>

            {/* Content Context Views */}
            <div className="flex-1 relative pb-12">
                {loading && (
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-sm z-20 flex items-center justify-center rounded-3xl transition-all duration-300">
                        <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
                            <Loader2 className="animate-spin text-blue-600" size={24} />
                            <span className="text-sm font-bold text-slate-700 tracking-wide">Syncing API...</span>
                        </div>
                    </div>
                )}

                <div className={`transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
                    {(activeTab === 'transactions' || activeTab === 'finance-transactions') && <TransactionsTab data={data?.transactions} />}
                    {(activeTab === 'payout-mgmt' || activeTab === 'finance-payout-mgmt') && <PayoutsManagementTab payouts={payouts} onApprove={handleApprovePayout} />}
                    {(activeTab === 'refunds' || activeTab === 'finance-refunds') && <RefundsTab data={data?.refunds} />}
                    {(activeTab === 'payouts' || activeTab === 'finance-payouts') && <SellerPayoutsTab data={data?.sellerPayouts} />}
                    {(activeTab === 'settlements' || activeTab === 'finance-settlements') && <SettlementsTab data={data?.settlements} />}
                    {(activeTab === 'ledger' || activeTab === 'finance-ledger') && <OverviewLedgerTab ledger={data?.commissionLedger} logs={data?.paymentLogs} />}
                </div>
            </div>

            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
}

class FinanceManagerErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        console.error("FinanceManager Crash:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 bg-rose-50 text-rose-900 rounded-3xl border border-rose-200 mt-8 font-mono text-sm max-w-4xl mx-auto shadow-sm">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><XCircle className="text-rose-500" /> Finance UI Crashed</h2>
                    <div className="bg-white p-4 rounded-xl shadow-inner overflow-auto border border-rose-100">
                        <strong className="text-rose-600 block mb-2">{this.state.error && this.state.error.toString()}</strong>
                        <pre className="text-xs text-slate-600 whitespace-pre-wrap">{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

export default function FinanceManager(props) {
    return (
        <FinanceManagerErrorBoundary>
            <FinanceManagerCore {...props} />
        </FinanceManagerErrorBoundary>
    );
}
