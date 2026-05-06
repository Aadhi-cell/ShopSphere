import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginWithCredentials, isAuthenticated } from '../../auth';
import useMobile from '../../hooks/useMobile';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Logo from '../../components/common/Logo';

export default function Login() {
	const navigate = useNavigate();
	const isMobile = useMobile();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [remember, setRemember] = useState(false);

	// Load remembered email ...
	useEffect(() => {
		if (isAuthenticated()) {
			navigate('/', { replace: true });
			return;
		}
		const saved = window.localStorage.getItem('shopsphere_remembered_email');
		if (saved) setEmail(saved);
	}, [navigate]);

	async function onSubmit(e) {
		e.preventDefault();
		setError(null);
		setLoading(true);

		try {
			await loginWithCredentials(email, password);
			if (remember) {
				window.localStorage.setItem('shopsphere_remembered_email', email);
			} else {
				window.localStorage.removeItem('shopsphere_remembered_email');
			}
			navigate('/', { replace: true });
		} catch (err) {
			setError(err.message || 'Access denied. Verify credentials.');
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
					<Logo className="justify-center mb-2" textClassName="text-[18px]" iconSize={32} />
					<h2 className={`font-[900] text-text-main tracking-tight ${isMobile ? 'text-lg' : 'text-[22px]'}`}>
						Welcome <span className="text-primary">Back</span>
					</h2>
					<p className="text-text-muted text-[11px] mt-0.5 font-medium">Please enter your details to sign in</p>
				</div>

				<form onSubmit={onSubmit} className="flex flex-col gap-3.5">
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
								placeholder="Enter your password"
								type={showPassword ? 'text' : 'password'}
								className="w-full px-5 py-3 pr-12 rounded-xl border border-glass-border bg-white text-[13px] text-text-main outline-none transition-all duration-300 focus:border-primary focus:shadow-md"
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border-none p-0 flex items-center justify-center text-text-muted hover:text-primary transition-colors cursor-pointer"
								style={{ background: 'none', border: 'none', padding: 0 }}
							>
								{showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
							</button>
						</div>
					</div>

					<div className="flex justify-between items-center text-[11px]">
						<label className="flex items-center gap-2 cursor-pointer text-text-muted font-semibold">
							<input
								type="checkbox"
								checked={remember}
								onChange={e => setRemember(e.target.checked)}
								className="accent-primary w-4 h-4"
							/>
							Remember me
						</label>
						<Link to="/forgot-password" className="text-primary no-underline font-bold">Forgot password?</Link>
					</div>

					{error && (
						<div className="glass-card bg-red-500/10 text-red-600 p-3 rounded-xl text-[13px] text-center font-semibold border border-red-500/20">
							{error}
						</div>
					)}

					<button
						type="submit"
						disabled={loading}
						className={`w-full p-[18px] text-white border-none rounded-2xl text-base font-[800] mt-2 shadow-[0_20px_40px_rgba(40,116,240,0.25)] transition-all ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5'}`}
						style={{
							background: '#2874f0',
							color: '#ffffff',
							display: 'block',
							visibility: 'visible',
							opacity: loading ? 0.7 : 1
						}}
					>
						{loading ? 'SIGNING IN...' : 'SIGN IN'}
					</button>
				</form>

				<div className={`text-center text-sm text-text-muted font-semibold ${isMobile ? 'mt-6' : 'mt-8'}`}>
					New to ShopSphere?{' '}
					<Link to="/signup" className="text-primary font-[800] no-underline ml-1.5">
						Create an account
					</Link>
				</div>
			</div>
		</div>
	);
}
