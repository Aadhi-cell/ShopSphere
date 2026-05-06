import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAsAdmin, isAdminAuthenticated, getAdminUser } from '../../auth';
import useMobile from '../../hooks/useMobile';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Logo from '../../components/common/Logo';

export default function AdminLogin() {
    const navigate = useNavigate();
    const isMobile = useMobile();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const user = getAdminUser();
        if (isAdminAuthenticated() && user?.role === 'admin') {
            navigate('/admin', { replace: true });
        }
    }, [navigate]);

    async function onSubmit(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await loginAsAdmin(email, password);
            window.location.href = '/admin';
        } catch (err) {
            setError(err.message || 'Admin access denied. Verify credentials.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={`min-h-screen flex items-center justify-center bg-bg-primary ${isMobile ? 'px-4 py-5' : 'px-5 py-10'}`}>
            <div
                className={`glass-panel w-full max-w-[380px] rounded-[28px] box-border transition-all duration-500 ${isMobile ? 'px-6 py-6' : 'px-9 py-8'}`}
                style={{ boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.3), 0 18px 36px -18px rgba(0, 0, 0, 0.35), 0 -2px 10px 0 rgba(0, 0, 0, 0.05)' }}
            >
                {/* Header */}
                <div className={`text-center ${isMobile ? 'mb-4' : 'mb-5'}`}>
                    <div className="inline-flex items-center justify-center gap-4 mb-2 w-full">
                        <Logo iconSize={32} textClassName="text-[18px]" />
                        <div className="w-px h-8 bg-slate-200"></div>
                        <div className="text-left">
                            <div className="text-[18px] font-[1000] text-slate-900 tracking-tight leading-none">Admin</div>
                            <div className="text-slate-400 text-[11px] font-bold mt-0.5">Secure Portal</div>
                        </div>
                    </div>
                    <h2 className={`font-[900] text-text-main tracking-tight ${isMobile ? 'text-lg' : 'text-[22px]'}`}>
                        Admin <span className="text-gray-900 border-b-2 border-gray-900">Portal</span>
                    </h2>
                    <p className="text-text-muted text-[11px] mt-0.5 font-medium">Please enter your secure credentials</p>
                </div>

                <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
                    <div>
                        <div className="text-[10px] text-text-muted font-[800] uppercase tracking-wider mb-1 ml-1">Admin Email</div>
                        <input
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="admin@site.com"
                            type="email"
                            className="w-full px-5 py-3 rounded-xl border border-glass-border bg-gray-50 text-[13px] text-gray-900 outline-none transition-all duration-300 focus:bg-white focus:shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
                            onFocus={e => e.target.style.borderColor = '#111827'}
                            onBlur={e => e.target.style.borderColor = ''}
                        />
                    </div>

                    <div>
                        <div className="text-[10px] text-text-muted font-[800] uppercase tracking-wider mb-1 ml-1">Security Key</div>
                        <div className="relative">
                            <input
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Enter security key"
                                type={showPassword ? 'text' : 'password'}
                                className="w-full px-5 py-3 pr-12 rounded-xl border border-glass-border bg-gray-50 text-[13px] text-gray-900 outline-none transition-all duration-300 focus:bg-white focus:shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
                                onFocus={e => e.target.style.borderColor = '#111827'}
                                onBlur={e => e.target.style.borderColor = ''}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border-none p-0 flex items-center justify-center text-gray-400 transition-colors cursor-pointer"
                                style={{ background: 'none', border: 'none', padding: 0 }}
                                onMouseEnter={e => e.currentTarget.style.color = '#111827'}
                                onMouseLeave={e => e.currentTarget.style.color = ''}
                            >
                                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="glass-card bg-red-500/10 text-red-600 p-3 rounded-xl text-[13px] text-center font-semibold border border-red-500/20">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full p-[18px] text-white border-none rounded-2xl text-base font-[900] mt-2 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5'}`}
                        style={{
                            background: '#111827',
                            color: '#ffffff',
                            display: 'block',
                            visibility: 'visible',
                            opacity: loading ? 0.7 : 1,
                            boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
                        }}
                    >
                        {loading ? 'AUTHENTICATING...' : 'SECURE SIGN IN'}
                    </button>
                </form>


            </div>
        </div>
    );
}
