import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginWithCredentials, isAuthenticated } from '../../auth';
import { apiClient } from '../../api/axiosInstance';
import useMobile from '../../hooks/useMobile';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Logo from '../../components/common/Logo';

export default function Signup() {
  const navigate = useNavigate();
  const isMobile = useMobile();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Redirect if authenticated ...
  React.useEffect(() => {
    if (isAuthenticated()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);


  async function onSubmit(e) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/api/register', { name, email, password });
      setSuccess(true);

      // Auto-login after registration
      setTimeout(async () => {
        try {
          await loginWithCredentials(email, password);
          navigate('/', { replace: true });
        } catch (loginErr) {
          setError("Account created, but auto-login failed. Please sign in manually.");
          setLoading(false);
        }
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || err.message || "Registration failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center bg-bg-primary ${isMobile ? 'px-4 py-5' : 'px-5 py-10'}`}>
      <div
        className={`glass-panel w-full max-w-[390px] rounded-[28px] box-border transition-all duration-500 ${isMobile ? 'px-6 py-6' : 'px-9 py-8'}`}
        style={{ boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.3), 0 18px 36px -18px rgba(0, 0, 0, 0.35), 0 -2px 10px 0 rgba(0, 0, 0, 0.05)' }}
      >
        <div className={`text-center ${isMobile ? 'mb-4' : 'mb-5'}`}>
          <Logo className="justify-center mb-2" textClassName="text-[18px]" iconSize={32} />
          <h2 className={`font-[900] text-text-main tracking-tight ${isMobile ? 'text-lg' : 'text-[22px]'}`}>
            Create <span className="text-primary">Account</span>
          </h2>
          <p className="text-text-muted text-[11px] mt-0.5 font-medium">Join the ShopSphere community today</p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div>
            <div className="text-[10px] text-text-muted font-[800] uppercase tracking-wider mb-1 ml-1">Full Name</div>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your full name"
              type="text"
              className="w-full px-5 py-3 rounded-xl border border-glass-border bg-white text-[13px] text-text-main outline-none transition-all duration-300 focus:border-primary focus:shadow-md"
            />
          </div>
          <div>
            <div className="text-[10px] text-text-muted font-[800] uppercase tracking-wider mb-1 ml-1">Email</div>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              type="email"
              className="w-full px-5 py-3 rounded-xl border border-glass-border bg-white text-[13px] text-text-main outline-none transition-all duration-300 focus:border-primary focus:shadow-md"
            />
          </div>

          <div>
            <div className="text-[10px] text-text-muted font-[800] uppercase tracking-wider mb-1 ml-1">Password</div>
            <div className="relative">
              <input
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Create a strong password"
                type={showPassword ? 'text' : 'password'}
                className="w-full px-5 py-3 pr-12 rounded-xl border border-glass-border bg-white text-[13px] text-text-main outline-none transition-all duration-300 focus:border-primary focus:shadow-md"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border-none p-0 flex items-center justify-center text-text-muted hover:text-primary transition-colors cursor-pointer"
                style={{ background: 'none', border: 'none', padding: 0 }}
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <div className="text-[10px] text-text-muted font-[800] uppercase tracking-wider mb-1 ml-1">Confirm</div>
            <div className="relative">
              <input
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat your password"
                type={showConfirm ? 'text' : 'password'}
                className="w-full px-5 py-3 pr-12 rounded-xl border border-glass-border bg-white text-[13px] text-text-main outline-none transition-all duration-300 focus:border-primary focus:shadow-md"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirm(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border-none p-0 flex items-center justify-center text-text-muted hover:text-primary transition-colors cursor-pointer"
                style={{ background: 'none', border: 'none', padding: 0 }}
              >
                {showConfirm ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="glass-card bg-red-500/10 text-red-600 p-3 rounded-xl text-[13px] text-center font-semibold border border-red-500/20">
              {error}
            </div>
          )}
          {success && (
            <div className="glass-card bg-emerald-500/10 text-emerald-600 p-3 rounded-xl text-[13px] text-center font-semibold border border-emerald-500/20">
              Account created. Signing you in...
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-[14px] text-white border-none rounded-xl text-sm font-[800] mt-1 shadow-[0_20px_40px_rgba(40,116,240,0.25)] transition-all ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5'}`}
            style={{
              background: '#2874f0',
              color: '#ffffff',
              display: 'block',
              visibility: 'visible',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'CREATING...' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <div className={`text-center text-[12px] text-text-muted font-semibold ${isMobile ? 'mt-4' : 'mt-5'}`}>
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-[800] no-underline ml-1">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
