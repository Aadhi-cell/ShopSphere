import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSellerAuth } from '../../contexts/SellerAuthContext';
import useMobile from '../../hooks/useMobile';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Logo from '../../components/common/Logo';

export default function SellerLogin() {
    const navigate = useNavigate();
    const isMobile = useMobile();
    const { loginSeller } = useSellerAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            setError('Enter email and password');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await loginSeller(formData);
            navigate('/seller');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Check credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center bg-bg-primary ${isMobile ? 'px-4 py-5' : 'px-5 py-10'}`}>
            <div
                className={`glass-panel w-full max-w-[380px] rounded-[28px] box-border transition-all duration-500 ${isMobile ? 'px-6 py-6' : 'px-9 py-8'}`}
                style={{ boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.3), 0 18px 36px -18px rgba(0, 0, 0, 0.35), 0 -2px 10px 0 rgba(0, 0, 0, 0.05)' }}
            >
                {/* Header */}
                <div className={`text-center ${isMobile ? 'mb-4' : 'mb-5'}`}>
                    <div className="inline-flex items-center justify-center gap-2 mb-2 w-full">
                        <Logo showText={false} iconSize={32} />
                        <span className="text-[18px] font-[900] text-text-main tracking-tight uppercase mt-1">SHOPSPHERE SELLER</span>
                    </div>
                    <h2 className={`font-[900] text-text-main tracking-tight ${isMobile ? 'text-lg' : 'text-[22px]'}`}>
                        Seller <span className="text-primary border-b-2 border-primary">Login</span>
                    </h2>
                    <p className="text-text-muted text-[11px] mt-0.5 font-medium">Access your seller command center</p>
                </div>
 
                <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                    <div>
                        <div className="text-[10px] text-text-muted font-[800] uppercase tracking-wider mb-1 ml-1">Email</div>
                        <input
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            type="email"
                            className="w-full px-5 py-3 rounded-xl border border-glass-border bg-gray-50 text-[13px] text-gray-900 outline-none transition-all duration-300 focus:bg-white focus:border-primary focus:shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
                        />
                    </div>
 
                    <div>
                        <div className="text-[10px] text-text-muted font-[800] uppercase tracking-wider mb-1 ml-1">Password</div>
                        <div className="relative">
                            <input
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                type={showPassword ? 'text' : 'password'}
                                className="w-full px-5 py-3 pr-12 rounded-xl border border-glass-border bg-gray-50 text-[13px] text-gray-900 outline-none transition-all duration-300 focus:bg-white focus:border-primary focus:shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border-none p-0 flex items-center justify-center text-gray-400 hover:text-primary transition-colors cursor-pointer"
                                style={{ background: 'none', border: 'none', padding: 0 }}
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
                            background: '#2874f0',
                            color: '#ffffff',
                            display: 'block',
                            visibility: 'visible',
                            opacity: loading ? 0.7 : 1,
                            boxShadow: '0 20px 40px rgba(40,116,240,0.25)'
                        }}
                    >
                        {loading ? 'LOGGING IN...' : 'LOGIN'}
                    </button>
                </form>
 
                <div className={`text-center text-sm text-text-muted font-semibold ${isMobile ? 'mt-6' : 'mt-8'}`}>
                    New to Selling?{' '}
                    <Link to="/seller-register" className="text-primary border-b border-primary font-[900] no-underline ml-1.5 hover:text-blue-700">
                        Become a Seller
                    </Link>
                </div>
 
                <div className="text-center mt-4">
                    <Link to="/" className="text-[11px] text-text-muted font-bold no-underline hover:text-primary transition-colors">
                        ← Back to Mall
                    </Link>
                </div>
            </div>
        </div>
    );
}
