import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001';

const STATUS_COLORS = {
    'Open': { bg: '#dbeafe', color: '#2563eb' },
    'In Progress': { bg: '#fef9c3', color: '#ca8a04' },
    'Resolved': { bg: '#dcfce7', color: '#16a34a' },
    'Closed': { bg: '#f1f5f9', color: '#475569' },
};
const RESOLUTION_ICONS = {
    'Approve Refund': '💰',
    'Approve Replacement': '🔄',
    'Rejected': '❌',
    'Need More Info': '❓',
};

const fmtDate = (d) => d ? new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
}) : '';

function getUser() {
    try { return JSON.parse(localStorage.getItem('shopsphere_user') || 'null'); } catch { return null; }
}

export default function MyTickets() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);
    const [openTicket, setOpenTicket] = useState(null);

    // Auto-fill email from logged-in user
    useEffect(() => {
        const user = getUser();
        if (user?.email) {
            setEmail(user.email);
            // Auto-fetch on mount if logged in
            handleFetch(user.email);
        }
    }, []);

    const handleFetch = async (emailOverride) => {
        const query = emailOverride || email;
        if (!query.trim()) { setError('Please enter your email.'); return; }
        setLoading(true);
        setError('');
        setOpenTicket(null);
        try {
            const res = await axios.get(`${API_URL}/api/support/tickets/my?email=${encodeURIComponent(query.trim())}`);
            setTickets(res.data);
            setSearched(true);
            if (res.data.length === 0) setError('No tickets found for this email.');
        } catch {
            setError('Failed to load tickets. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: 100 }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(to bottom, var(--bg-secondary), transparent)',
                padding: '80px 24px 50px',
                textAlign: 'center',
                borderBottom: '1px solid var(--glass-border)'
            }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-primary)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
                    Support Center
                </div>
                <h1 style={{ fontSize: 44, fontWeight: 900, letterSpacing: '-2px', color: 'var(--text-main)', marginBottom: 12 }}>
                    My <span style={{ color: 'var(--color-primary)' }}>Tickets</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: 17, fontWeight: 500, marginBottom: 36 }}>
                    View your support tickets and admin replies
                </p>

                {/* Email Search */}
                <form onSubmit={e => { e.preventDefault(); handleFetch(); }} style={{ maxWidth: 560, margin: '0 auto', display: 'flex', gap: 10 }}>
                    <input
                        type="email"
                        value={email}
                        onChange={e => { setEmail(e.target.value); setError(''); }}
                        placeholder="Enter your email address..."
                        style={{
                            flex: 1, padding: '14px 20px',
                            background: 'var(--surface)', border: '1px solid var(--glass-border)',
                            borderRadius: 14, color: 'var(--text-main)', fontSize: 15, outline: 'none',
                            fontFamily: 'inherit'
                        }}
                    />
                    <button type="submit" disabled={loading} style={{
                        padding: '14px 28px', background: 'var(--color-primary)', color: '#fff',
                        border: 'none', borderRadius: 14, fontWeight: 800, fontSize: 15, cursor: 'pointer',
                        whiteSpace: 'nowrap', opacity: loading ? 0.7 : 1
                    }}>
                        {loading ? '⏳' : '🔍 View Tickets'}
                    </button>
                </form>

                {error && <p style={{ color: '#ef4444', marginTop: 16, fontSize: 14, fontWeight: 600 }}>{error}</p>}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
                    <button onClick={() => navigate('/help')} style={{
                        padding: '10px 22px', background: 'var(--surface)', color: 'var(--text-muted)',
                        border: '1px solid var(--glass-border)', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer'
                    }}>
                        🎫 Raise New Ticket
                    </button>
                    <button onClick={() => navigate(-1)} style={{
                        padding: '10px 22px', background: 'transparent', color: 'var(--text-muted)',
                        border: '1px solid var(--glass-border)', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer'
                    }}>
                        ← Go Back
                    </button>
                </div>
            </div>

            {/* Ticket List + Detail */}
            {searched && tickets.length > 0 && (
                <div style={{ maxWidth: 1100, margin: '40px auto', padding: '0 24px', display: 'grid', gridTemplateColumns: openTicket ? '360px 1fr' : '1fr', gap: 24 }}>
                    {/* Ticket List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                            {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} found
                        </div>
                        {tickets.map(t => {
                            const sc = STATUS_COLORS[t.status] || STATUS_COLORS['Open'];
                            const isOpen = openTicket?._id === t._id;
                            const hasAdminReply = t.replies?.some(r => r.sender === 'admin');
                            return (
                                <div
                                    key={t._id}
                                    onClick={() => setOpenTicket(isOpen ? null : t)}
                                    className="glass-panel"
                                    style={{
                                        padding: '18px 22px', borderRadius: 16, cursor: 'pointer',
                                        border: isOpen ? '1.5px solid var(--color-primary)' : '1px solid var(--glass-border)',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {/* Row 1: ID + Status */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                        <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-primary)', background: 'rgba(99,102,241,0.1)', padding: '3px 10px', borderRadius: 20 }}>
                                            #{t.ticketId}
                                        </span>
                                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                            {hasAdminReply && (
                                                <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: 20 }}>
                                                    ✉️ Admin Replied
                                                </span>
                                            )}
                                            <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 20, background: sc.bg, color: sc.color }}>
                                                {t.status}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Row 2: Subject */}
                                    <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-main)', marginBottom: 4 }}>{t.subject}</div>
                                    {/* Row 3: Category + Date */}
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 12 }}>
                                        <span>📂 {t.category}</span>
                                        {t.orderId && <span>🛒 {t.orderId}</span>}
                                        <span>📅 {fmtDate(t.createdAt)}</span>
                                    </div>
                                    {/* Resolution badge */}
                                    {t.resolution && (
                                        <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: '#7c3aed', background: '#f5f3ff', display: 'inline-block', padding: '3px 10px', borderRadius: 20 }}>
                                            {RESOLUTION_ICONS[t.resolution]} {t.resolution}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Ticket Thread (when opened) */}
                    {openTicket && (
                        <div className="glass-panel" style={{ borderRadius: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '80vh' }}>
                            {/* Thread Header */}
                            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--glass-border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-primary)', marginBottom: 4 }}>#{openTicket.ticketId}</div>
                                        <div style={{ fontWeight: 900, fontSize: 18, color: 'var(--text-main)', marginBottom: 4 }}>{openTicket.subject}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{openTicket.category} • Created {fmtDate(openTicket.createdAt)}</div>
                                    </div>
                                    <button onClick={() => setOpenTicket(null)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
                                </div>
                                {openTicket.resolution && (
                                    <div style={{ marginTop: 10, padding: '8px 14px', background: '#f5f3ff', border: '1px solid #e9d5ff', borderRadius: 10, fontSize: 13, fontWeight: 700, color: '#7c3aed' }}>
                                        {RESOLUTION_ICONS[openTicket.resolution]} Resolution: {openTicket.resolution}
                                        {openTicket.resolutionNote && <span style={{ fontWeight: 500, color: '#6b21a8', marginLeft: 8 }}>— {openTicket.resolutionNote}</span>}
                                    </div>
                                )}
                            </div>

                            {/* Thread Messages (public only — no internalNotes shown to user) */}
                            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {/* Original message */}
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'var(--color-primary)', flexShrink: 0, fontSize: 14 }}>
                                        {(openTicket.senderName || 'U')[0].toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 5 }}>
                                            <strong style={{ color: 'var(--text-main)' }}>You</strong> • {fmtDate(openTicket.createdAt)}
                                        </div>
                                        <div style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: '0 14px 14px 14px', padding: '12px 16px', fontSize: 14, color: 'var(--text-main)', lineHeight: 1.7 }}>
                                            {openTicket.message}
                                        </div>
                                    </div>
                                </div>

                                {/* Public Admin Replies only — internalNotes are hidden from user */}
                                {openTicket.replies?.filter(r => !r.isInternal).map((r, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 12, flexDirection: r.sender === 'admin' ? 'row-reverse' : 'row' }}>
                                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: r.sender === 'admin' ? 'var(--color-primary)' : 'var(--surface)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: r.sender === 'admin' ? '#fff' : 'var(--color-primary)', flexShrink: 0, fontSize: 13 }}>
                                            {r.sender === 'admin' ? '🛡' : (r.senderName || 'U')[0].toUpperCase()}
                                        </div>
                                        <div style={{ flex: 1, maxWidth: '80%' }}>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 5, textAlign: r.sender === 'admin' ? 'right' : 'left' }}>
                                                <strong style={{ color: r.sender === 'admin' ? 'var(--color-primary)' : 'var(--text-main)' }}>
                                                    {r.sender === 'admin' ? '🛡️ Support Team' : 'You'}
                                                </strong> • {fmtDate(r.createdAt)}
                                            </div>
                                            <div style={{
                                                background: r.sender === 'admin' ? 'var(--color-primary)' : 'var(--surface)',
                                                color: r.sender === 'admin' ? '#fff' : 'var(--text-main)',
                                                border: r.sender === 'admin' ? 'none' : '1px solid var(--glass-border)',
                                                borderRadius: r.sender === 'admin' ? '14px 0 14px 14px' : '0 14px 14px 14px',
                                                padding: '12px 16px', fontSize: 14, lineHeight: 1.7
                                            }}>{r.message}</div>
                                        </div>
                                    </div>
                                ))}

                                {openTicket.replies?.filter(r => !r.isInternal).length === 0 && (
                                    <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)', fontSize: 14 }}>
                                        ⏳ Our support team will reply within 24 hours
                                    </div>
                                )}
                            </div>

                            {/* Raise another ticket link */}
                            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--glass-border)', textAlign: 'center' }}>
                                <button onClick={() => navigate('/help')} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                                    + Raise a new ticket
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Empty state before search */}
            {!searched && !loading && (
                <div style={{ maxWidth: 500, margin: '80px auto', textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: 72, marginBottom: 20 }}>🎫</div>
                    <h3 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-main)', marginBottom: 10 }}>Track Your Support Tickets</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>Enter your email above to view all your submitted tickets and see admin replies.</p>
                </div>
            )}
        </div>
    );
}
