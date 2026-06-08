import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken } from '../../auth';
import { useSellerAuth } from '../../contexts/SellerAuthContext';
import {
    MessageSquare,
    Ticket as TicketIcon,
    Plus,
    Clock,
    CheckCircle,
    AlertCircle,
    ChevronRight,
    Send,
    User,
    Shield,
    Search,
    Filter,
    Layers,
    LifeBuoy,
    ExternalLink,
    Inbox,
    Mail
} from 'lucide-react';
import EmptyState from './EmptyState';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001';

export default function SellerSupport() {
    const { seller } = useSellerAuth();
    const [activeTab, setActiveTab] = useState('mytickets');
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Messages state
    const [messages, setMessages] = useState([]);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [msgLoading, setMsgLoading] = useState(false);
    const [msgForm, setMsgForm] = useState({ subject: '', content: '' });
    const [msgSubmitting, setMsgSubmitting] = useState(false);
    const [msgView, setMsgView] = useState('inbox'); // 'inbox' | 'compose'

    const [form, setForm] = useState({
        category: 'Order Issue',
        subject: '',
        message: '',
        orderId: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [replyText, setReplyText] = useState('');

    useEffect(() => {
        fetchMyTickets();
    }, []);

    useEffect(() => {
        if (activeTab === 'messages') fetchMyMessages();
    }, [activeTab]);

    const fetchMyTickets = async () => {
        setLoading(true);
        try {
            const token = getToken();
            const user = JSON.parse(localStorage.getItem('shopsphere_user'));
            if (!user) return;

            const res = await axios.get(`${API_URL}/api/support/tickets/my?email=${encodeURIComponent(user.email)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setTickets(res.data);
        } catch (error) {
            console.error('Failed to fetch tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const token = getToken();
            const user = JSON.parse(localStorage.getItem('shopsphere_user'));
            await axios.post(`${API_URL}/api/support/tickets`, {
                ...form,
                senderName: user.name,
                senderEmail: user.email,
                senderType: 'seller'
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setForm({ category: 'Order Issue', subject: '', message: '', orderId: '' });
            setActiveTab('mytickets');
            fetchMyTickets();
        } catch (error) {
            console.error('Failed to create ticket:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const fetchMyMessages = async () => {
        setMsgLoading(true);
        try {
            // Seller fetches their messages by seller_id from admin endpoint
            // We use admin view but filter by seller email match
            const sellerToken = localStorage.getItem('sellerToken');
            if (!sellerToken || !seller?._id) return;
            const res = await axios.get(`${API_URL}/api/support/messages/my`, {
                headers: { 'Authorization': `Bearer ${sellerToken}` }
            });
            setMessages(res.data || []);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setMsgLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        setMsgSubmitting(true);
        try {
            const sellerToken = localStorage.getItem('sellerToken');
            await axios.post(`${API_URL}/api/support/messages`, {
                subject: msgForm.subject,
                content: msgForm.content,
                senderType: 'seller'
            }, {
                headers: { 'Authorization': `Bearer ${sellerToken}` }
            });
            setMsgForm({ subject: '', content: '' });
            setMsgView('inbox');
            await fetchMyMessages();
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setMsgSubmitting(false);
        }
    };

    const handleReply = async () => {
        if (!replyText.trim()) return;
        try {
            const token = getToken();
            await axios.post(`${API_URL}/api/admin/support/tickets/${selectedTicket._id}/reply`, {
                message: replyText
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setReplyText('');
            const res = await axios.get(`${API_URL}/api/admin/support/tickets/${selectedTicket._id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setSelectedTicket(res.data);
            // Update ticket in main list too
            setTickets(tickets.map(t => t._id === selectedTicket._id ? res.data : t));
        } catch (error) {
            console.error('Reply failed:', error);
        }
    };


    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'open': return 'bg-blue-500 text-white';
            case 'in-progress': return 'bg-amber-500 text-white';
            case 'resolved': return 'bg-emerald-500 text-white';
            case 'closed': return 'bg-slate-400 text-white';
            default: return 'bg-slate-500 text-white';
        }
    };

    const filteredTickets = tickets.filter(t => {
        const matchesSearch = t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.ticketId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="flex flex-col h-[600px] sm:h-[750px] bg-white rounded-[24px] sm:rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
            {/* Header / Tabs */}
            <div className="px-5 sm:px-8 py-5 sm:py-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 bg-white z-10">
                <div>
                    <h2 className="text-xl font-[1000] text-slate-900 tracking-tight flex items-center gap-2">
                        <LifeBuoy size={24} className="text-primary" /> Support Command Center
                    </h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Global Resolution & Assistance</p>
                </div>

                <div className="flex bg-slate-100/80 p-1 rounded-2xl overflow-x-auto no-scrollbar max-w-full">
                    <button
                        onClick={() => { setActiveTab('mytickets'); setSelectedTicket(null); }}
                        className={`px-4 sm:px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap shrink-0 ${activeTab === 'mytickets' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Tickets Log
                    </button>
                    <button
                        onClick={() => setActiveTab('new')}
                        className={`px-4 sm:px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap shrink-0 ${activeTab === 'new' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Open New
                    </button>
                    <button
                        onClick={() => { setActiveTab('messages'); }}
                        className={`px-4 sm:px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${activeTab === 'messages' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Mail size={12} /> Messages
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {activeTab === 'messages' ? (
                    <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                        {/* Messages Sidebar */}
                        <div className="w-full md:w-[340px] border-b md:border-b-0 md:border-r border-slate-100 flex flex-col bg-slate-50/20 shrink-0 h-[250px] md:h-auto">
                            <div className="px-5 sm:px-8 py-4 border-b border-slate-50 flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Direct Messages</span>
                                <button
                                    onClick={() => setMsgView('compose')}
                                    className="px-3 py-1.5 bg-[#2874f0] text-white rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5 hover:bg-[#1260e0] transition-all"
                                >
                                    <Plus size={10} /> Compose
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-slate-50">
                                {msgLoading ? (
                                    <div className="p-10 text-center animate-pulse">
                                        <p className="text-[9px] font-black tracking-widest uppercase text-slate-300">Loading...</p>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="p-10 text-center">
                                        <Inbox size={28} className="mx-auto text-slate-200 mb-2" />
                                        <p className="text-xs font-bold text-slate-400">No messages yet</p>
                                    </div>
                                ) : (
                                    messages.map(msg => (
                                        <div
                                            key={msg._id}
                                            onClick={() => { setSelectedMessage(msg); setMsgView('inbox'); }}
                                            className={`px-5 sm:px-8 py-5 cursor-pointer transition-all border-l-4 ${selectedMessage?._id === msg._id ? 'bg-white border-primary shadow-sm' : 'bg-transparent border-transparent hover:bg-white'}`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[11px] font-black text-slate-900 truncate">{msg.subject}</span>
                                                {msg.replies?.some(r => r.sender === 'admin') && (
                                                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 ml-2"></span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-bold truncate">{msg.content}</p>
                                            <p className="text-[9px] text-slate-300 font-black mt-1 uppercase">{formatDate(msg.createdAt)}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Messages Thread / Compose */}
                        <div className="flex-1 flex flex-col bg-white">
                            {msgView === 'compose' ? (
                                <div className="flex-1 overflow-y-auto p-5 sm:p-8 no-scrollbar">
                                    <h3 className="text-lg font-[1000] text-slate-900 mb-6 tracking-tight">New Message to Admin</h3>
                                    <form onSubmit={handleSendMessage} className="space-y-5 max-w-2xl">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Subject</label>
                                            <input
                                                required
                                                value={msgForm.subject}
                                                onChange={e => setMsgForm(p => ({ ...p, subject: e.target.value }))}
                                                placeholder="What do you want to discuss?"
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-primary focus:bg-white transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Message</label>
                                            <textarea
                                                required
                                                rows={6}
                                                value={msgForm.content}
                                                onChange={e => setMsgForm(p => ({ ...p, content: e.target.value }))}
                                                placeholder="Write your message here..."
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-primary focus:bg-white transition-all resize-none"
                                            />
                                        </div>
                                        <div className="flex gap-3">
                                            <button type="submit" disabled={msgSubmitting} className="px-8 py-3 bg-[#2874f0] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#1260e0] transition-all disabled:opacity-50 flex items-center gap-2">
                                                <Send size={14} /> {msgSubmitting ? 'Sending...' : 'Send Message'}
                                            </button>
                                            <button type="button" onClick={() => setMsgView('inbox')} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            ) : !selectedMessage ? (
                                <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-40">
                                    <MessageSquare size={64} strokeWidth={1} className="text-slate-200 mb-4" />
                                    <p className="text-sm font-bold text-slate-400">Select a message to view the thread</p>
                                </div>
                            ) : (
                                <div className="flex-1 overflow-y-auto p-5 sm:p-8 no-scrollbar space-y-6">
                                    <h3 className="text-base font-black text-slate-900">{selectedMessage.subject}</h3>
                                    {/* Original */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400 text-xs shrink-0">ME</div>
                                        <div className="bg-slate-50 border border-slate-100 rounded-3xl rounded-tl-none p-5 max-w-[85%]">
                                            <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">{formatDate(selectedMessage.createdAt)}</div>
                                            <p className="text-sm font-bold text-slate-700 leading-relaxed">{selectedMessage.content}</p>
                                        </div>
                                    </div>
                                    {/* Replies */}
                                    {selectedMessage.replies?.map((r, i) => (
                                        <div key={i} className={`flex items-start gap-4 ${r.sender === 'admin' ? '' : 'flex-row-reverse'}`}>
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${r.sender === 'admin' ? 'bg-[#2874f0] text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                {r.sender === 'admin' ? 'HQ' : 'ME'}
                                            </div>
                                            <div className={`p-5 rounded-3xl border max-w-[85%] ${r.sender === 'admin' ? 'bg-slate-900 border-slate-900 text-white rounded-tl-none' : 'bg-white border-slate-100 rounded-tr-none'}`}>
                                                <div className={`text-[9px] font-black uppercase tracking-widest mb-2 ${r.sender === 'admin' ? 'text-white/40' : 'text-slate-400'}`}>{formatDate(r.createdAt)}</div>
                                                <p className={`text-sm font-bold leading-relaxed ${r.sender === 'admin' ? 'text-blue-50' : 'text-slate-700'}`}>{r.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : activeTab === 'new' ? (
                    <div className="flex-1 overflow-y-auto p-4 sm:p-10 bg-slate-50/30 no-scrollbar">
                        <div className="max-w-3xl mx-auto space-y-8">
                            <div className="bg-white p-5 sm:p-8 rounded-[24px] sm:rounded-[32px] border border-slate-200 shadow-sm">
                                <h3 className="text-lg font-[1000] text-slate-900 mb-6 tracking-tight">Generate Support Ticket</h3>
                                <form onSubmit={handleCreateTicket} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Case Category</label>
                                            <select
                                                value={form.category}
                                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-primary focus:bg-white transition-all appearance-none"
                                            >
                                                <option>Order Issue</option>
                                                <option>Payment Problem</option>
                                                <option>Refund Request</option>
                                                <option>Account Issue</option>
                                                <option>Technical Bug</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Order Context (Ref)</label>
                                            <input
                                                type="text"
                                                value={form.orderId}
                                                onChange={(e) => setForm({ ...form, orderId: e.target.value })}
                                                placeholder="e.g. ORD-9981"
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-primary focus:bg-white transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject Brief</label>
                                        <input
                                            type="text"
                                            required
                                            value={form.subject}
                                            onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                            placeholder="What can we help you with today?"
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-primary focus:bg-white transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Detailed Inquiry</label>
                                        <textarea
                                            required
                                            rows={5}
                                            value={form.message}
                                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                                            placeholder="Provide a detailed explanation of the challenge you're facing..."
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-primary focus:bg-white transition-all resize-none"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full py-5 bg-[#2874f0] text-white rounded-[24px] font-[1000] text-sm uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                                    >
                                        {submitting ? 'Transmitting Case...' : 'Launch Support Case'}
                                    </button>
                                </form>
                            </div>

                            {/* Pro Tip */}
                            <div className="bg-slate-900 p-6 rounded-[24px] text-white flex items-center gap-6">
                                <div className="p-4 bg-white/10 rounded-2xl text-primary">
                                    <Shield size={24} />
                                </div>
                                <div>
                                    <h4 className="font-black text-sm mb-1 uppercase tracking-widest">Resolution Target</h4>
                                    <p className="text-xs text-slate-400 font-bold leading-relaxed">Our pro agents typically respond within <span className="text-white italic">4 business hours</span> for priority order and payment inquiries.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                        {/* Inbox Sidebar */}
                        <div className="w-full md:w-[380px] border-b md:border-b-0 md:border-r border-slate-100 flex flex-col bg-slate-50/20 shrink-0 h-[250px] md:h-auto">
                            {/* Search Tickets */}
                            <div className="px-5 sm:px-8 py-4 border-b border-slate-50 space-y-3">
                                <div className="relative">
                                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input
                                        type="text"
                                        placeholder="Search cases..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-primary transition-all"
                                    />
                                </div>
                                <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
                                    {['All', 'Open', 'In-Progress', 'Resolved', 'Closed'].map(f => (
                                        <button
                                            key={f}
                                            onClick={() => setStatusFilter(f)}
                                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all shrink-0 ${statusFilter === f ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400 hover:text-slate-600 hover:border-slate-200'}`}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-slate-50/50">
                                {loading && tickets.length === 0 ? (
                                    <div className="p-10 text-center animate-pulse">
                                        <div className="w-10 h-10 bg-slate-100 rounded-xl mx-auto mb-4"></div>
                                        <p className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-300">Syncing Cases...</p>
                                    </div>
                                ) : filteredTickets.length === 0 ? (
                                    <div className="px-5 sm:px-8 py-10 text-center">
                                        <EmptyState
                                            title="No cases found"
                                            description="Your support history is clear. If you need help, open a new ticket."
                                            icon={TicketIcon}
                                        />
                                    </div>
                                ) : (
                                    filteredTickets.map(ticket => (
                                        <div
                                            key={ticket._id}
                                            onClick={() => setSelectedTicket(ticket)}
                                            className={`px-5 sm:px-8 py-5 cursor-pointer transition-all border-l-4 ${selectedTicket?._id === ticket._id ? 'bg-white border-primary shadow-sm ring-1 ring-slate-100' : 'bg-transparent border-transparent hover:bg-white hover:border-slate-100'}`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Case #{ticket.ticketId}</span>
                                                <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${getStatusColor(ticket.status)}`}>
                                                    {ticket.status}
                                                </span>
                                            </div>
                                            <h4 className="text-sm font-black text-slate-900 truncate mb-1">{ticket.subject}</h4>
                                            <div className="flex items-center justify-between mt-3">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock size={10} className="text-slate-300" />
                                                    <span className="text-[10px] text-slate-400 font-bold">{formatDate(ticket.createdAt)}</span>
                                                </div>
                                                {ticket.replies?.length > 0 && (
                                                    <div className="flex items-center gap-1 text-[#2874f0]">
                                                        <MessageSquare size={10} strokeWidth={3} />
                                                        <span className="text-[10px] font-black">{ticket.replies.length}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Thread Console */}
                        <div className="flex-1 flex flex-col bg-white">
                            {!selectedTicket ? (
                                <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-40 grayscale">
                                    <Shield size={80} strokeWidth={1} className="text-slate-200 mb-6" />
                                    <h3 className="text-xl font-black text-slate-900 mb-2">Select Support Case</h3>
                                    <p className="text-sm font-bold max-w-xs text-slate-400">Choose a ticket from the sidebar to view full resolution tracking and correspondence history.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Thread Header */}
                                    <div className="px-5 sm:px-8 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/20 shrink-0">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${getStatusColor(selectedTicket.status)}`}>
                                                <TicketIcon size={18} strokeWidth={2.5} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h3 className="text-[15px] font-black text-slate-900 tracking-tight">{selectedTicket.subject}</h3>
                                                    <span className="text-[10px] font-black text-slate-300">#{selectedTicket.ticketId}</span>
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Category: {selectedTicket.category}</p>
                                            </div>
                                        </div>
                                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                                            <ExternalLink size={16} />
                                        </button>
                                    </div>

                                    {/* Conversation Scroll Area */}
                                    <div className="flex-1 overflow-y-auto p-5 sm:p-8 bg-slate-50/10 no-scrollbar space-y-8">
                                        {/* Original Message */}
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400 shrink-0">ME</div>
                                            <div className="bg-white p-5 rounded-3xl rounded-tl-none border border-slate-100 shadow-sm max-w-[85%]">
                                                <div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-3">Case Initiation • {formatDate(selectedTicket.createdAt)}</div>
                                                <p className="text-sm font-bold text-slate-700 leading-relaxed">{selectedTicket.message}</p>
                                                {selectedTicket.orderId && (
                                                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Linked Order:</span>
                                                        <span className="text-[10px] font-black text-[#2874f0] font-mono px-2 py-0.5 bg-blue-50 rounded-md">ID:{selectedTicket.orderId}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Reply Thread */}
                                        {selectedTicket.replies?.map((r, i) => (
                                            <div key={i} className={`flex items-start gap-4 ${r.sender === 'admin' ? '' : 'flex-row-reverse'}`}>
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black shrink-0 ${r.sender === 'admin' ? 'bg-[#2874f0] text-white shadow-xl shadow-blue-500/20' : 'bg-white border border-slate-100 text-slate-400 shadow-sm'}`}>
                                                    {r.sender === 'admin' ? 'HQ' : 'ME'}
                                                </div>
                                                <div className={`p-5 rounded-3xl border shadow-sm max-w-[85%] ${r.sender === 'admin' ? 'bg-slate-900 border-slate-900 text-white rounded-tl-none' : 'bg-white border-slate-100 text-slate-700 rounded-tr-none'}`}>
                                                    <div className={`text-[9px] font-black uppercase tracking-[0.2em] mb-3 ${r.sender === 'admin' ? 'text-white/40' : 'text-slate-400'}`}>
                                                        {r.sender === 'admin' ? '🛡️ OFFICIAL RESOLUTION' : 'Follow-up Reply'} • {formatDate(r.createdAt || r.date)}
                                                    </div>
                                                    <p className={`text-sm font-bold leading-relaxed ${r.sender === 'admin' ? 'text-blue-50' : 'text-slate-700'}`}>{r.message || r.content}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Action Bar / Reply Input */}
                                    {selectedTicket.status !== 'Closed' && selectedTicket.status !== 'Resolved' ? (
                                        <div className="px-5 sm:px-8 py-6 bg-white border-t border-slate-100">
                                            <div className="relative">
                                                <textarea
                                                    rows={1}
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    placeholder="Transmit reply to resolution team..."
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 pr-16 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-bold resize-none no-scrollbar h-16 max-h-32"
                                                />
                                                <button
                                                    onClick={handleReply}
                                                    disabled={!replyText.trim()}
                                                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-xl transition-all active:scale-95 ${replyText.trim() ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-slate-200 text-white cursor-not-allowed'}`}
                                                >
                                                    <Send size={18} strokeWidth={3} />
                                                </button>
                                            </div>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-3 ml-1">🔒 SECURE E2E ENCRYPTED TRANSMISSION</p>
                                        </div>
                                    ) : (
                                        <div className="p-8 bg-slate-50/50 border-t border-slate-100 text-center">
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                                                <CheckCircle size={14} className="text-emerald-500" />
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Case Finalized & Archive Locked</span>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

