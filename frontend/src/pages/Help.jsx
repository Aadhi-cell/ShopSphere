import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken } from '../auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001';

const CATEGORIES = [
    'Order Issue',
    'Payment Problem',
    'Refund Request',
    'Damaged Product',
    'Account Issue',
    'Other'
];

const faqData = [
    {
        category: 'Order Support',
        icon: '📦',
        questions: [
            { q: 'How do I track my order?', a: 'You can track your order by visiting the "Orders" section in your profile. Click on "Track Order" to see real-time updates.' },
            { q: 'Can I cancel my order?', a: 'Yes, you can cancel your order within 24 hours of placing it. Go to "My Orders", select the order, and click "Cancel".' },
            { q: 'My order is delayed. What should I do?', a: 'We apologize for the delay. Please check the tracking status for the latest updates. If it has been stuck for more than 48 hours, please contact support.' },
        ]
    },
    {
        category: 'Payment & Refunds',
        icon: '💳',
        questions: [
            { q: 'What payment methods do you accept?', a: 'We accept Credit/Debit cards, UPI (GPay, PhonePe), Net Banking, and Cash on Delivery (COD).' },
            { q: 'How do I request a refund?', a: 'To request a refund, go to "My Orders", select the item, and click "Return/Refund". Refunds are processed within 5-7 business days.' },
            { q: 'My payment failed but money was deducted.', a: "Don't worry! If the amount was deducted, it will be automatically refunded to your source account within 3-5 business days." },
        ]
    },
    {
        category: 'Account Assistance',
        icon: '👤',
        questions: [
            { q: 'How do I reset my password?', a: 'Go to the Login page and click "Forgot Password". Follow the instructions sent to your email to reset it.' },
            { q: 'Can I change my shipping address?', a: 'Yes, you can update your address in the "Profile" section under "Saved Address".' },
        ]
    },
    {
        category: 'Delivery Information',
        icon: '🚚',
        questions: [
            { q: 'Do you ship internationally?', a: 'Currently, we only ship within India. We are working on expanding our services globally.' },
            { q: 'What are the delivery charges?', a: 'Delivery is free for orders above ₹499. For orders below that, a nominal fee of ₹40 applies.' },
        ]
    }
];

export default function Help() {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [expandedQuestion, setExpandedQuestion] = useState(null);

    // Ticket form state
    const [form, setForm] = useState({
        senderName: '',
        senderEmail: '',
        orderId: '',
        category: 'Order Issue',
        subject: '',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(null);
    const [formError, setFormError] = useState('');

    // My Tickets state
    const [myTicketsEmail, setMyTicketsEmail] = useState('');
    const [myTickets, setMyTickets] = useState([]);
    const [myTicketsLoading, setMyTicketsLoading] = useState(false);
    const [myTicketsError, setMyTicketsError] = useState('');
    const [openTicket, setOpenTicket] = useState(null);
    const [showMyTickets, setShowMyTickets] = useState(false);

    // Auto-fill if logged in
    useEffect(() => {
        const user = getUser();
        if (user) {
            setForm(f => ({
                ...f,
                senderName: user.name || '',
                senderEmail: user.email || ''
            }));
            setMyTicketsEmail(user.email || '');
        }
    }, []);

    const handleFetchMyTickets = async (e) => {
        e && e.preventDefault();
        if (!myTicketsEmail.trim()) { setMyTicketsError('Enter your email'); return; }
        setMyTicketsLoading(true);
        setMyTicketsError('');
        setOpenTicket(null);
        try {
            const res = await axios.get(`${API_URL}/api/support/tickets/my?email=${encodeURIComponent(myTicketsEmail.trim())}`);
            setMyTickets(res.data);
            setShowMyTickets(true);
            if (res.data.length === 0) setMyTicketsError('No tickets found for this email.');
        } catch (err) {
            setMyTicketsError('Failed to fetch tickets. Try again.');
        }
        setMyTicketsLoading(false);
    };

    const filteredFAQs = faqData.map(cat => ({
        ...cat,
        questions: cat.questions.filter(q =>
            q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.a.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(cat => cat.questions.length > 0);

    const toggleCategory = (category) => setExpandedCategory(expandedCategory === category ? null : category);
    const toggleQuestion = (qIndex) => setExpandedQuestion(expandedQuestion === qIndex ? null : qIndex);

    const handleFormChange = (e) => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
        setFormError('');
    };

    const handleSubmitTicket = async (e) => {
        e.preventDefault();
        if (!form.senderName.trim() || !form.senderEmail.trim() || !form.subject.trim() || !form.message.trim()) {
            setFormError('Please fill all required fields.');
            return;
        }
        setSubmitting(true);
        setFormError('');
        try {
            const token = getToken();
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const res = await axios.post(`${API_URL}/api/support/tickets`, {
                ...form,
                senderType: 'user'
            }, { headers });
            setSubmitted({ ticketId: res.data.ticketId });
            setForm({ senderName: '', senderEmail: '', orderId: '', category: 'Order Issue', subject: '', message: '' });
        } catch (err) {
            setFormError(err?.response?.data?.message || 'Failed to submit ticket. Please try again.');
        }
        setSubmitting(false);
        // After successful submit, auto-fetch tickets for that email
        if (form.senderEmail) {
            setMyTicketsEmail(form.senderEmail);
        }
    };

    const formatDate = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: 100 }}>
            {/* Hero Search Section */}
            <div style={{
                background: 'linear-gradient(to bottom, var(--bg-secondary), transparent)',
                padding: '100px 24px 60px',
                textAlign: 'center',
                borderBottom: '1px solid var(--glass-border)'
            }}>
                <h1 style={{ fontSize: 48, fontWeight: 900, marginBottom: 16, letterSpacing: '-2px', color: 'var(--text-main)' }}>Help &amp; <span style={{ color: 'var(--color-primary)' }}>Support</span></h1>
                <p style={{ color: 'var(--text-muted)', fontSize: 18, marginBottom: 40, fontWeight: 500 }}>Find answers or raise a support ticket — we're here to help</p>
                <div style={{ maxWidth: 700, margin: '0 auto', position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="Search FAQs (e.g., return, tracking, payment)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="glass-card"
                        style={{
                            width: '100%', padding: '20px 24px', paddingLeft: 60,
                            borderRadius: 20, border: '1px solid var(--glass-border)',
                            fontSize: 16, color: 'var(--text-main)', outline: 'none',
                            boxSizing: 'border-box', background: 'var(--surface)',
                        }}
                    />
                    <span style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', fontSize: 24 }}>🔍</span>
                </div>
            </div>

            <div style={{ maxWidth: 1000, margin: '0 auto', padding: '60px 24px' }}>

                {/* FAQ Sections */}
                <div style={{ display: 'grid', gap: 32 }}>
                    {filteredFAQs.length === 0 ? (
                        <div className="glass-panel" style={{ textAlign: 'center', padding: 80, borderRadius: 32 }}>
                            <div style={{ fontSize: 60, marginBottom: 24 }}>🏮</div>
                            <h3 style={{ color: 'var(--text-main)', fontSize: 24, fontWeight: 800 }}>No results for "{searchQuery}"</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Try a different search, or raise a support ticket below.</p>
                        </div>
                    ) : (
                        filteredFAQs.map((cat, catIdx) => (
                            <div key={catIdx} className="glass-panel" style={{ borderRadius: 24, overflow: 'hidden' }}>
                                <div
                                    onClick={() => toggleCategory(cat.category)}
                                    style={{ padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                        <div style={{ width: 48, height: 48, background: 'var(--surface)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, border: '1px solid var(--glass-border)' }}>{cat.icon}</div>
                                        <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>{cat.category}</h2>
                                    </div>
                                    <span style={{ color: 'var(--color-primary)', transform: expandedCategory === cat.category || searchQuery ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</span>
                                </div>
                                {(expandedCategory === cat.category || searchQuery) && (
                                    <div style={{ padding: '0 32px 32px', borderTop: '1px solid var(--glass-border)' }}>
                                        {cat.questions.map((q, qIdx) => {
                                            const uniqueId = `${catIdx}-${qIdx}`;
                                            const isOpen = expandedQuestion === uniqueId;
                                            return (
                                                <div key={qIdx} style={{ borderBottom: qIdx === cat.questions.length - 1 ? 'none' : '1px solid var(--glass-border)' }}>
                                                    <div onClick={() => toggleQuestion(uniqueId)} style={{ padding: '20px 0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, color: isOpen ? 'var(--color-primary)' : 'var(--text-main)', transition: 'color 0.3s' }}>
                                                        {q.q}
                                                        <span style={{ color: 'var(--text-dim)', fontSize: 24 }}>{isOpen ? '−' : '+'}</span>
                                                    </div>
                                                    {isOpen && <div style={{ paddingBottom: 24, color: 'var(--text-muted)', lineHeight: 1.8, fontSize: 15, fontWeight: 500 }}>{q.a}</div>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* ── RAISE A TICKET FORM ── */}
                <div style={{ marginTop: 80 }}>
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                        <h2 style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-main)', marginBottom: 12, letterSpacing: '-1px' }}>
                            Still need help? <span style={{ color: 'var(--color-primary)' }}>Raise a Ticket</span>
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: 16, fontWeight: 500 }}>
                            Our support team will respond within 24 hours
                        </p>
                    </div>

                    <div className="glass-panel" style={{ borderRadius: 28, padding: '40px 48px', maxWidth: 700, margin: '0 auto' }}>

                        {submitted ? (
                            /* ── SUCCESS STATE ── */
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <div style={{ fontSize: 72, marginBottom: 20 }}>✅</div>
                                <h3 style={{ color: 'var(--text-main)', fontSize: 24, fontWeight: 900, marginBottom: 12 }}>Ticket Submitted!</h3>
                                <div style={{
                                    display: 'inline-block',
                                    background: 'var(--color-primary)',
                                    color: '#fff',
                                    padding: '8px 24px',
                                    borderRadius: 40,
                                    fontWeight: 800,
                                    fontSize: 18,
                                    marginBottom: 20,
                                    letterSpacing: 1
                                }}>
                                    #{submitted.ticketId}
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.7, fontWeight: 500 }}>
                                    Save your ticket ID above. Our team will review and reply within 24 hours.
                                </p>
                                <button
                                    onClick={() => setSubmitted(null)}
                                    style={{ marginTop: 28, padding: '12px 32px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
                                >
                                    Raise Another Ticket
                                </button>
                            </div>
                        ) : (
                            /* ── FORM ── */
                            <form onSubmit={handleSubmitTicket} style={{ display: 'grid', gap: 20 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div>
                                        <label style={labelStyle}>Full Name <span style={{ color: '#ef4444' }}>*</span></label>
                                        <input name="senderName" value={form.senderName} onChange={handleFormChange} placeholder="Your name" required style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Email Address <span style={{ color: '#ef4444' }}>*</span></label>
                                        <input name="senderEmail" value={form.senderEmail} onChange={handleFormChange} type="email" placeholder="your@email.com" required style={inputStyle} />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div>
                                        <label style={labelStyle}>Order ID <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>(optional)</span></label>
                                        <input name="orderId" value={form.orderId} onChange={handleFormChange} placeholder="e.g. ORD-1234" style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Category <span style={{ color: '#ef4444' }}>*</span></label>
                                        <select name="category" value={form.category} onChange={handleFormChange} style={inputStyle}>
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label style={labelStyle}>Subject <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input name="subject" value={form.subject} onChange={handleFormChange} placeholder="Brief description of your issue" required style={inputStyle} />
                                </div>

                                <div>
                                    <label style={labelStyle}>Describe Your Issue <span style={{ color: '#ef4444' }}>*</span></label>
                                    <textarea
                                        name="message"
                                        value={form.message}
                                        onChange={handleFormChange}
                                        placeholder="Please provide as much detail as possible..."
                                        required
                                        rows={5}
                                        style={{ ...inputStyle, resize: 'vertical', minHeight: 130 }}
                                    />
                                </div>

                                {formError && (
                                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: 10, fontSize: 14, fontWeight: 600 }}>
                                        ⚠️ {formError}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    style={{
                                        padding: '16px 32px',
                                        background: submitting ? '#94a3b8' : 'var(--color-primary)',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: 14,
                                        fontWeight: 800,
                                        fontSize: 16,
                                        cursor: submitting ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 10,
                                        width: '100%'
                                    }}
                                >
                                    {submitting ? '⏳ Submitting...' : '🎫 Submit Support Ticket'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* ── MY TICKETS ── */}
                <div style={{ marginTop: 80, marginBottom: 20 }}>
                    <div style={{ textAlign: 'center', marginBottom: 40 }}>
                        <h2 style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-main)', marginBottom: 12, letterSpacing: '-1px' }}>
                            Track Your <span style={{ color: 'var(--color-primary)' }}>Tickets</span>
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: 16, fontWeight: 500 }}>
                            Enter your email to see all your submitted tickets and admin replies
                        </p>
                    </div>

                    {/* Email search */}
                    <form onSubmit={handleFetchMyTickets} style={{ maxWidth: 600, margin: '0 auto 32px', display: 'flex', gap: 12 }}>
                        <input
                            type="email"
                            value={myTicketsEmail}
                            onChange={e => { setMyTicketsEmail(e.target.value); setMyTicketsError(''); }}
                            placeholder="Enter your email address..."
                            style={{ ...inputStyle, flex: 1 }}
                        />
                        <button type="submit" disabled={myTicketsLoading} style={{
                            padding: '12px 24px', background: 'var(--color-primary)', color: '#fff',
                            border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 14,
                            cursor: myTicketsLoading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap'
                        }}>
                            {myTicketsLoading ? '⏳' : '🔍 View My Tickets'}
                        </button>
                    </form>

                    {myTicketsError && (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>{myTicketsError}</p>
                    )}

                    {showMyTickets && myTickets.length > 0 && (
                        <div style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gap: 16 }}>
                            {myTickets.map(ticket => (
                                <div key={ticket._id} className="glass-panel" style={{ borderRadius: 20, overflow: 'hidden', border: openTicket?._id === ticket._id ? '1.5px solid var(--color-primary)' : '1px solid var(--glass-border)' }}>
                                    {/* Ticket Header */}
                                    <div
                                        onClick={() => setOpenTicket(openTicket?._id === ticket._id ? null : ticket)}
                                        style={{ padding: '20px 28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}
                                    >
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                                <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-primary)', background: 'rgba(99,102,241,0.1)', padding: '3px 10px', borderRadius: 20 }}>#{ticket.ticketId}</span>
                                                <span style={{
                                                    fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 20,
                                                    background: ticket.status === 'Resolved' ? '#dcfce7' : ticket.status === 'In Progress' ? '#fef9c3' : '#dbeafe',
                                                    color: ticket.status === 'Resolved' ? '#16a34a' : ticket.status === 'In Progress' ? '#ca8a04' : '#2563eb'
                                                }}>{ticket.status}</span>
                                            </div>
                                            <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: 15, marginBottom: 4 }}>{ticket.subject}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{ticket.category} • {formatDate(ticket.createdAt)}</div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            {ticket.replies?.length > 0 && (
                                                <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '4px 10px', borderRadius: 20 }}>
                                                    💬 {ticket.replies.length} {ticket.replies.length === 1 ? 'reply' : 'replies'}
                                                </span>
                                            )}
                                            <span style={{ color: 'var(--color-primary)', fontSize: 20, fontWeight: 900 }}>
                                                {openTicket?._id === ticket._id ? '▲' : '▼'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Expanded Thread */}
                                    {openTicket?._id === ticket._id && (
                                        <div style={{ borderTop: '1px solid var(--glass-border)', padding: '24px 28px', display: 'grid', gap: 16, background: 'rgba(0,0,0,0.15)' }}>
                                            {/* Original message */}
                                            <div style={{ display: 'flex', gap: 12 }}>
                                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'var(--color-primary)', flexShrink: 0 }}>
                                                    {(ticket.senderName || 'U')[0].toUpperCase()}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}><strong style={{ color: 'var(--text-main)' }}>{ticket.senderName}</strong> • {formatDate(ticket.createdAt)}</div>
                                                    <div style={{ background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: '0 14px 14px 14px', padding: '14px 18px', fontSize: 14, color: 'var(--text-main)', lineHeight: 1.7 }}>{ticket.message}</div>
                                                </div>
                                            </div>

                                            {/* Replies */}
                                            {ticket.replies?.map((r, i) => (
                                                <div key={i} style={{ display: 'flex', gap: 12, flexDirection: r.sender === 'admin' ? 'row-reverse' : 'row' }}>
                                                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: r.sender === 'admin' ? 'var(--color-primary)' : 'var(--surface)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: r.sender === 'admin' ? '#fff' : 'var(--color-primary)', flexShrink: 0, fontSize: 13 }}>
                                                        {r.sender === 'admin' ? 'A' : (r.senderName || 'U')[0].toUpperCase()}
                                                    </div>
                                                    <div style={{ flex: 1, maxWidth: '75%' }}>
                                                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, textAlign: r.sender === 'admin' ? 'right' : 'left' }}>
                                                            <strong style={{ color: r.sender === 'admin' ? 'var(--color-primary)' : 'var(--text-main)' }}>{r.sender === 'admin' ? '🛡️ Support Team' : r.senderName}</strong> • {formatDate(r.createdAt)}
                                                        </div>
                                                        <div style={{
                                                            background: r.sender === 'admin' ? 'var(--color-primary)' : 'var(--surface)',
                                                            border: r.sender === 'admin' ? 'none' : '1px solid var(--glass-border)',
                                                            color: r.sender === 'admin' ? '#fff' : 'var(--text-main)',
                                                            borderRadius: r.sender === 'admin' ? '14px 0 14px 14px' : '0 14px 14px 14px',
                                                            padding: '14px 18px', fontSize: 14, lineHeight: 1.7
                                                        }}>{r.message || r.content}</div>
                                                    </div>
                                                </div>
                                            ))}

                                            {ticket.replies?.length === 0 && (
                                                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: 13 }}>
                                                    ⏳ No replies yet. Our team will respond within 24 hours.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

function getUser() {
    try {
        return JSON.parse(localStorage.getItem('shopsphere_user') || 'null');
    } catch { return null; }
}

const labelStyle = {
    display: 'block',
    fontSize: 13,
    fontWeight: 700,
    color: 'var(--text-muted)',
    marginBottom: 6,
    letterSpacing: 0.3
};

const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    background: 'var(--surface)',
    border: '1px solid var(--glass-border)',
    borderRadius: 10,
    fontSize: 14,
    color: 'var(--text-main)',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s'
};

