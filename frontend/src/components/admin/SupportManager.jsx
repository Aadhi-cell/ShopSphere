import React, { useState, useEffect } from 'react';
import {
    getTickets,
    getTicketById,
    replyToTicket,
    updateTicketStatus,
    deleteTicket,
    getMessages,
    getMessageById,
    replyToMessage,
    deleteMessage,
    addInternalNote,
    resolveTicket
} from '../../api/adminApi';
import {
    Search,
    Filter,
    MessageSquare,
    Ticket as TicketIcon,
    Clock,
    CheckCircle2,
    AlertCircle,
    MoreVertical,
    Send,
    Paperclip,
    User,
    ChevronRight,
    Trash2,
    Shield,
    Info,
    RefreshCw,
    Package
} from 'lucide-react';

export default function SupportManager() {
    const [activeTab, setActiveTab] = useState('tickets');
    const [tickets, setTickets] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [replyText, setReplyText] = useState('');
    const [internalNote, setInternalNote] = useState('');
    const [isReplying, setIsReplying] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'tickets') {
                const data = await getTickets({ status: statusFilter, search: searchQuery });
                setTickets(data);
            } else {
                const data = await getMessages();
                setMessages(data);
            }
        } catch (error) {
            console.error('Failed to fetch support data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchData();
        setIsRefreshing(false);
    };

    const handleSelectItem = async (item) => {
        setLoading(true);
        try {
            if (activeTab === 'tickets') {
                const fullTicket = await getTicketById(item._id);
                setSelectedItem(fullTicket);
            } else {
                const fullMsg = await getMessageById(item._id);
                setSelectedItem(fullMsg);
            }
        } catch (error) {
            console.error('Failed to fetch details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async () => {
        if (!replyText.trim()) return;
        setIsReplying(true);
        try {
            if (activeTab === 'tickets') {
                await replyToTicket(selectedItem._id, replyText);
                const updated = await getTicketById(selectedItem._id);
                setSelectedItem(updated);
            } else {
                await replyToMessage(selectedItem._id, replyText);
                const updated = await getMessageById(selectedItem._id);
                setSelectedItem(updated);
            }
            setReplyText('');
        } catch (error) {
            console.error('Reply failed:', error);
        } finally {
            setIsReplying(false);
        }
    };

    const handleUpdateStatus = async (status) => {
        try {
            await updateTicketStatus(selectedItem._id, status);
            const updated = await getTicketById(selectedItem._id);
            setSelectedItem(updated);
            setTickets(tickets.map(t => t._id === updated._id ? updated : t));
        } catch (error) {
            console.error('Status update failed:', error);
        }
    };

    const handleResolve = async (resolution, note) => {
        try {
            await resolveTicket(selectedItem._id, resolution, note);
            const updated = await getTicketById(selectedItem._id);
            setSelectedItem(updated);
            setTickets(tickets.map(t => t._id === updated._id ? updated : t));
        } catch (error) {
            console.error('Resolution failed:', error);
        }
    };

    const handleAddNote = async () => {
        if (!internalNote.trim()) return;
        try {
            await addInternalNote(selectedItem._id, internalNote);
            const updated = await getTicketById(selectedItem._id);
            setSelectedItem(updated);
            setInternalNote('');
        } catch (error) {
            console.error('Failed to add note:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Open': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'In Progress': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Resolved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Closed': return 'bg-slate-100 text-slate-600 border-slate-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    function items() {
        if (activeTab === 'tickets') return tickets;
        return messages;
    }

    function getAllInteractions() {
        if (!selectedItem) return [];
        const items = [];

        if (selectedItem.internalNotes) {
            selectedItem.internalNotes.forEach(note => items.push({ ...note, isInternal: true }));
        }

        if (selectedItem.replies) {
            selectedItem.replies.forEach(reply => items.push({ ...reply, isInternal: reply.isInternal }));
        }

        return items.sort((a, b) => new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date));
    }

    return (
        <div className="flex h-[calc(100vh-140px)] bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
            {/* Sidebar List */}
            <div className="w-[400px] border-r border-slate-100 flex flex-col bg-slate-50/30">
                <div className="p-6 border-b border-slate-100 bg-white">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Support Hub</h2>
                        <button
                            onClick={handleRefresh}
                            className={`p-2 rounded-xl border border-slate-100 bg-white text-slate-500 hover:text-primary transition-all active:scale-95 ${isRefreshing ? 'animate-spin' : ''}`}
                        >
                            <RefreshCw size={18} />
                        </button>
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
                        <button
                            onClick={() => { setActiveTab('tickets'); setSelectedItem(null); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'tickets' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <TicketIcon size={16} /> Tickets
                        </button>
                        <button
                            onClick={() => { setActiveTab('messages'); setSelectedItem(null); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'messages' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <MessageSquare size={16} /> Messages
                        </button>
                    </div>

                    <div className="relative">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchData()}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none">
                    {loading && !items().length ? (
                        <div className="flex flex-col items-center justify-center py-20 animate-pulse text-slate-300">
                            <Clock size={40} className="mb-4" />
                            <p className="text-xs font-black uppercase tracking-widest">Hydrating Inbox...</p>
                        </div>
                    ) : items().length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <Info size={40} className="mb-4 opacity-20" />
                            <p className="text-sm font-bold">No {activeTab} found</p>
                        </div>
                    ) : (
                        items().map((item) => (
                            <div
                                key={item._id}
                                onClick={() => handleSelectItem(item)}
                                className={`p-4 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden ${selectedItem?._id === item._id
                                    ? 'bg-white border-primary shadow-lg shadow-primary/5 ring-1 ring-primary'
                                    : 'bg-white border-transparent hover:border-slate-200'}`}
                            >
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${activeTab === 'tickets' ? (item.status === 'Open' ? 'bg-blue-500' : 'bg-slate-300') : (item.isRead ? 'bg-slate-300' : 'bg-blue-500')}`} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            {activeTab === 'tickets' ? `#${item.ticketId}` : 'DM Thread'}
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400">
                                        {formatDate(item.createdAt).split(',')[0]}
                                    </span>
                                </div>
                                <div className="font-extrabold text-slate-900 text-sm mb-1 truncate group-hover:text-primary transition-colors">
                                    {item.subject}
                                </div>
                                <div className="text-xs text-slate-500 font-bold mb-3 line-clamp-1">
                                    {activeTab === 'tickets' ? item.message : item.content}
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                                        <User size={12} /> {item.senderName}
                                    </span>
                                    {activeTab === 'tickets' && (
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${getStatusColor(item.status)}`}>
                                            {item.status}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat/Detail View */}
            <div className="flex-1 flex flex-col bg-white">
                {!selectedItem ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center text-primary mb-8 animate-bounce transition-all duration-1000">
                            <Shield size={48} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Select a Conversation</h3>
                        <p className="text-slate-500 font-bold text-sm max-w-sm leading-relaxed">
                            Click on any ticket or message on the left to view the thread and respond to user inquiries.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Detail Header */}
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-black text-lg">
                                    {selectedItem.senderName[0].toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 tracking-tight">{selectedItem.subject}</h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                                            {selectedItem.senderEmail}
                                        </span>
                                        <span className="text-slate-200">•</span>
                                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 lowercase">
                                            via {selectedItem.senderType} portal
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {activeTab === 'tickets' && (
                                    <div className="flex items-center gap-2 mr-4">
                                        <select
                                            value={selectedItem.status}
                                            onChange={(e) => handleUpdateStatus(e.target.value)}
                                            className={`text-xs font-black px-4 py-2 rounded-xl border outline-none transition-all ${getStatusColor(selectedItem.status)}`}
                                        >
                                            <option value="Open">Open</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Resolved">Resolved</option>
                                            <option value="Closed">Closed</option>
                                        </select>
                                    </div>
                                )}
                                <button className="p-2.5 rounded-xl border border-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                                    <Trash2 size={18} />
                                </button>
                                <button className="p-2.5 rounded-xl border border-slate-100 text-slate-400 hover:bg-slate-50 transition-all">
                                    <MoreVertical size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Thread View */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/20 scrollbar-none">
                            {/* Original Content */}
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400 shadow-sm shrink-0">
                                    U
                                </div>
                                <div className="max-w-[80%]">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-xs font-black text-slate-900">{selectedItem.senderName}</span>
                                        <span className="text-[10px] font-bold text-slate-400">{formatDate(selectedItem.createdAt)}</span>
                                    </div>
                                    <div className="bg-white border border-slate-100 p-5 rounded-2xl rounded-tl-none text-slate-700 text-sm font-medium leading-relaxed shadow-sm">
                                        {activeTab === 'tickets' ? selectedItem.message : selectedItem.content}
                                    </div>
                                    {activeTab === 'tickets' && selectedItem.orderId && (
                                        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 text-[10px] font-black uppercase tracking-widest">
                                            <Package size={12} /> Related Order: {selectedItem.orderId}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Replies & Notes */}
                            {getAllInteractions().map((item, idx) => (
                                <div key={idx} className={`flex items-start gap-4 ${item.sender === 'admin' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black shadow-sm shrink-0 ${item.isInternal
                                        ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                        : item.sender === 'admin'
                                            ? 'bg-primary text-white'
                                            : 'bg-white border border-slate-100 text-slate-400'}`}>
                                        {item.sender === 'admin' ? 'A' : (item.senderName?.[0] || 'U')}
                                    </div>
                                    <div className={`max-w-[80%] ${item.sender === 'admin' ? 'text-right' : ''}`}>
                                        <div className={`flex items-center gap-3 mb-2 ${item.sender === 'admin' ? 'justify-end' : ''}`}>
                                            <span className={`text-xs font-black ${item.isInternal ? 'text-amber-700' : 'text-slate-900'}`}>
                                                {item.isInternal ? '🛡️ Internal Note' : item.senderName || 'Admin'}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400">{formatDate(item.createdAt || item.date)}</span>
                                        </div>
                                        <div className={`p-5 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${item.isInternal
                                            ? 'bg-amber-50 border border-amber-100 text-amber-900 italic'
                                            : item.sender === 'admin'
                                                ? 'bg-primary text-white rounded-tr-none'
                                                : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'}`}>
                                            {item.message || item.content}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Reply Input */}
                        <div className="p-6 bg-white border-t border-slate-100 space-y-4">
                            {/* Actions bar */}
                            {activeTab === 'tickets' && (
                                <div className="flex items-center gap-2 pb-2 overflow-x-auto no-scrollbar">
                                    <button
                                        onClick={() => handleResolve('Approve Refund', 'Standard refund policy applied.')}
                                        className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all active:scale-95 whitespace-nowrap"
                                    >
                                        Approve Refund
                                    </button>
                                    <button
                                        onClick={() => handleResolve('Need More Info', 'Please provide supporting documents.')}
                                        className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all active:scale-95 whitespace-nowrap"
                                    >
                                        Request Info
                                    </button>
                                    <button
                                        onClick={() => handleResolve('Rejected', 'Request does not meet our guidelines.')}
                                        className="px-4 py-2 bg-red-50 text-red-700 border border-red-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all active:scale-95 whitespace-nowrap"
                                    >
                                        Reject Request
                                    </button>
                                    <div className="w-px h-6 bg-slate-100 mx-2" />
                                    <div className="flex-1 flex items-center gap-2">
                                        <input
                                            placeholder="Internal Note (Admin only)..."
                                            value={internalNote}
                                            onChange={(e) => setInternalNote(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                                            className="flex-1 text-[11px] font-bold bg-amber-50/50 border border-amber-100 rounded-xl px-4 py-2 outline-none focus:border-amber-400 transition-all"
                                        />
                                        <button
                                            onClick={handleAddNote}
                                            className="p-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all"
                                        >
                                            <Shield size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="relative group">
                                <textarea
                                    rows={3}
                                    placeholder={`Reply to ${selectedItem.senderName}...`}
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-6 pr-24 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-semibold resize-none"
                                />
                                <div className="absolute right-4 bottom-4 flex items-center gap-2">
                                    <button className="p-3 text-slate-400 hover:text-primary transition-colors">
                                        <Paperclip size={20} />
                                    </button>
                                    <button
                                        onClick={handleReply}
                                        disabled={isReplying || !replyText.trim()}
                                        className={`p-4 rounded-2xl shadow-lg transition-all active:scale-95 ${replyText.trim() ? 'bg-primary text-white shadow-primary/25' : 'bg-slate-200 text-white'}`}
                                    >
                                        {isReplying ? <RefreshCw size={20} className="animate-spin" /> : <Send size={20} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
