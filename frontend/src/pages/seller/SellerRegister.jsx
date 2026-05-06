import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    saveOnboardingStep1, 
    saveOnboardingStep2, 
    saveOnboardingStep3, 
    saveOnboardingStep4, 
    getOnboardingStatus,
    sendSellerOTP, 
    verifySellerOTP 
} from '../../api/sellerApi';
import { getUser, logout } from '../../auth';
import useMobile from '../../hooks/useMobile';
import {
    CheckCircle,
    ShieldAlert,
    AlertTriangle,
    LogOut,
    ArrowLeft,
    ChevronRight,
    ChevronLeft,
    Upload,
    File,
    Trash2,
    ImageIcon
} from 'lucide-react';
import Logo from '../../components/common/Logo';

export default function SellerRegister() {
    const navigate = useNavigate();
    const isMobile = useMobile();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [restrictedUser, setRestrictedUser] = useState(null);

    const [otpSent, setOtpSent] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);

    const [aadhaarFile, setAadhaarFile] = useState(null);
    const [aadhaarPreview, setAadhaarPreview] = useState(null);
    const [panFile, setPanFile] = useState(null);
    const [panPreview, setPanPreview] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        businessName: '',
        gstNumber: '',
        panNumber: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'India'
        },
        bankDetails: {
            accountNumber: '',
            ifscCode: '',
            accountHolderName: '',
            bankName: ''
        }
    });

    useEffect(() => {
        const user = getUser();
        if (user && user.role === 'admin') {
            setRestrictedUser(user);
        }
        
        // Fetch draft status if token exists
        const token = localStorage.getItem('sellerToken');
        if (token) {
            fetchStatus();
        }
    }, []);

    const fetchStatus = async () => {
        try {
            const res = await getOnboardingStatus();
            if (res.success) {
                setStep(res.step || 1);
                // Pre-fill data if available (Optional, can just resume step)
            }
        } catch (err) {
            console.error('Failed to fetch onboarding status');
        }
    };

    const handleLogoutAndRegister = () => {
        logout();
        window.location.reload();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('File size exceeds 5MB limit');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'aadhaar') {
                    setAadhaarFile(file);
                    setAadhaarPreview(reader.result);
                } else {
                    setPanFile(file);
                    setPanPreview(reader.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const removeFile = (type) => {
        if (type === 'aadhaar') {
            setAadhaarFile(null);
            setAadhaarPreview(null);
        } else {
            setPanFile(null);
            setPanPreview(null);
        }
    };

    const validateStep = () => {
        setError('');
        if (step === 1) {
            if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
                setError('All fields are required');
                return false;
            }
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                return false;
            }
        }
        if (step === 2) {
            if (!formData.businessName || !formData.address.street || !formData.address.city || !formData.address.state || !formData.address.zipCode) {
                setError('Business details and complete address are required');
                return false;
            }
        }
        if (step === 3) {
            if (!aadhaarFile || !panFile) {
                setError('Please upload both Aadhaar and PAN Card images');
                return false;
            }
        }
        if (step === 4) {
            const bd = formData.bankDetails;
            if (!bd.accountNumber || !bd.ifscCode || !bd.accountHolderName || !bd.bankName) {
                setError('Full bank details are required');
                return false;
            }
        }
        return true;
    };

    const handleNext = async () => {
        if (!validateStep()) return;
        setLoading(true);
        setError('');

        try {
            if (step === 1) {
                if (!emailVerified) {
                    setOtpLoading(true);
                    try {
                        await sendSellerOTP(formData.email);
                        setOtpSent(true);
                        setLoading(false);
                        return;
                    } catch (err) {
                        setError(err.response?.data?.message || 'Failed to send OTP.');
                        setLoading(false);
                        return;
                    } finally {
                        setOtpLoading(false);
                    }
                }
                const res = await saveOnboardingStep1({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password
                });
                if (res.success) {
                    localStorage.setItem('sellerToken', res.token);
                    setStep(2);
                }
            } else if (step === 2) {
                const res = await saveOnboardingStep2({
                    businessName: formData.businessName,
                    address: formData.address,
                    gstNumber: formData.gstNumber,
                    panNumber: formData.panNumber
                });
                if (res.success) setStep(3);
            } else if (step === 3) {
                const data = new FormData();
                data.append('aadhaar', aadhaarFile);
                data.append('panCard', panFile);
                const res = await saveOnboardingStep3(data);
                if (res.success) setStep(4);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save progress.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otpCode) {
            setError('Please enter the OTP code');
            return;
        }
        setOtpLoading(true);
        setError('');
        try {
            await verifySellerOTP(formData.email, otpCode);
            setEmailVerified(true);
            setOtpSent(false);
            
            // Auto trigger step 1 save
            const res = await saveOnboardingStep1({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password
            });
            if (res.success) {
                localStorage.setItem('sellerToken', res.token);
                setStep(2);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Incorrect OTP');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleBack = () => {
        setStep(step - 1);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep()) return;
        setLoading(true);
        setError('');
        try {
            const res = await saveOnboardingStep4(formData.bankDetails);
            if (res.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/seller-login');
                }, 3000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    if (restrictedUser) {
        return (
            <div className={`min-h-screen flex items-center justify-center bg-bg-primary ${isMobile ? 'px-4' : 'px-5'}`}>
                <div className="glass-panel w-full max-w-[420px] rounded-[28px] px-9 py-10 text-center" style={{ boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.3)' }}>
                    <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <ShieldAlert size={32} className="text-red-500" />
                    </div>
                    <h2 className="text-xl font-[900] text-text-main mb-3">Identity Conflict</h2>
                    <p className="text-[13px] text-text-muted mb-8 font-medium leading-relaxed">
                        Hello **{restrictedUser.name}**, you are currently logged in as an **Admin**.
                        Seller registration requires a separate session.
                    </p>
                    <div className="flex flex-col gap-3">
                        <button onClick={() => navigate('/admin')} className="w-full py-3.5 bg-text-main text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                            <ArrowLeft size={16} /> Dashboard
                        </button>
                        <button onClick={handleLogoutAndRegister} className="w-full py-3.5 border border-red-200 text-red-500 rounded-xl font-bold text-sm hover:bg-red-50 transition-colors">
                            Logout & Register
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg-primary p-5">
                <div className="glass-panel w-full max-w-[400px] rounded-[28px] p-10 text-center" style={{ boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.3)' }}>
                    <div className="w-20 h-20 bg-emerald-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100">
                        <CheckCircle size={40} className="text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-[900] text-text-main mb-3 tracking-tight italic">Onboarding <span className="text-emerald-500 not-italic">Complete!</span></h2>
                    <p className="text-[13px] text-text-muted font-bold leading-relaxed">
                        Your application is now under review.
                    </p>
                    <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest leading-loose">
                            Redirecting to login...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen flex items-center justify-center bg-bg-primary ${isMobile ? 'px-4 py-8' : 'px-5 py-12'}`}>
            <div
                className={`glass-panel w-full max-w-[440px] rounded-[28px] box-border transition-all duration-500 ${isMobile ? 'px-6 py-8' : 'px-10 py-10'}`}
                style={{ boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.3)' }}
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <Logo className="justify-center mb-2" textClassName="text-[18px] uppercase" iconSize={32} />
                    <h2 className={`font-[900] text-text-main tracking-tight ${isMobile ? 'text-xl' : 'text-[24px]'}`}>
                        Become a <span className="text-primary">Seller</span>
                    </h2>
                    <div className="flex items-center justify-center gap-1.5 mt-2">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`h-1 rounded-full transition-all duration-300 ${step >= i ? 'w-6 bg-primary' : 'w-2 bg-slate-200'}`} />
                        ))}
                    </div>
                    <p className="text-[11px] text-text-muted font-bold uppercase tracking-widest mt-2 opacity-60">Step {step} of 4</p>
                </div>

                <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="flex flex-col gap-4">

                    {step === 1 && (
                        <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                            <div>
                                <div className="text-[10px] text-text-muted font-[800] uppercase tracking-wider mb-1 ml-1">Full Name</div>
                                <input disabled={otpSent} name="name" value={formData.name} onChange={handleChange} placeholder="Account holder name" className="w-full px-5 py-3 rounded-xl border border-glass-border bg-white text-[13px] text-text-main outline-none focus:border-primary" />
                            </div>
                            <div>
                                <div className="text-[10px] text-text-muted font-[800] uppercase tracking-wider mb-1 ml-1">Email</div>
                                <input disabled={otpSent} name="email" value={formData.email} onChange={handleChange} type="email" placeholder="Business email" className="w-full px-5 py-3 rounded-xl border border-glass-border bg-white text-[13px] text-text-main outline-none focus:border-primary" />
                            </div>
                            <div>
                                <div className="text-[10px] text-text-muted font-[800] uppercase tracking-wider mb-1 ml-1">Phone Number</div>
                                <input disabled={otpSent} name="phone" value={formData.phone} onChange={handleChange} type="tel" placeholder="+91 XXXXXXXXXX" className="w-full px-5 py-3 rounded-xl border border-glass-border bg-white text-[13px] text-text-main outline-none focus:border-primary" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <div className="text-[10px] text-text-muted font-[800] uppercase tracking-wider mb-1 ml-1">Password</div>
                                    <input disabled={otpSent} name="password" value={formData.password} onChange={handleChange} type="password" placeholder="••••••••" className="w-full px-5 py-3 rounded-xl border border-glass-border bg-white text-[13px] text-text-main outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <div className="text-[10px] text-text-muted font-[800] uppercase tracking-wider mb-1 ml-1">Confirm</div>
                                    <input disabled={otpSent} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} type="password" placeholder="••••••••" className="w-full px-5 py-3 rounded-xl border border-glass-border bg-white text-[13px] text-text-main outline-none focus:border-primary" />
                                </div>
                            </div>

                            {otpSent && (
                                <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-2xl animate-in zoom-in-95 duration-300">
                                    <div className="text-[10px] text-primary font-[900] uppercase tracking-wider mb-2 ml-1">Enter 6-Digit OTP</div>
                                    <input 
                                        name="otp" 
                                        value={otpCode} 
                                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                                        placeholder="XXXXXX" 
                                        className="w-full px-5 py-3 rounded-xl border border-primary bg-white text-[18px] text-center font-bold tracking-[8px] text-text-main outline-none" 
                                    />
                                    <button 
                                        type="button" 
                                        disabled={otpLoading}
                                        onClick={handleVerifyOTP}
                                        className="w-full mt-3 py-3 bg-primary text-white font-bold text-sm rounded-xl"
                                        style={{ background: '#2874f0' }}
                                    >
                                        {otpLoading ? 'VERIFYING...' : 'VERIFY EMAIL'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                            <div>
                                <div className="text-[10px] text-text-muted font-[800] uppercase tracking-wider mb-1 ml-1">Business Name</div>
                                <input name="businessName" value={formData.businessName} onChange={handleChange} placeholder="Your legal business name" className="w-full px-5 py-3 rounded-xl border border-glass-border bg-white text-[13px] text-text-main outline-none focus:border-primary" />
                            </div>
                            <div>
                                <div className="text-[10px] text-text-muted font-[800] uppercase tracking-wider mb-1 ml-1">Street Address</div>
                                <input name="address.street" value={formData.address.street} onChange={handleChange} placeholder="Registered office address" className="w-full px-5 py-3 rounded-xl border border-glass-border bg-white text-[13px] text-text-main outline-none focus:border-primary" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <div className="text-[10px] text-text-muted font-[800] uppercase tracking-wider mb-1 ml-1">City</div>
                                    <input name="address.city" value={formData.address.city} onChange={handleChange} placeholder="City" className="w-full px-5 py-3 rounded-xl border border-glass-border bg-white text-[13px] text-text-main outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <div className="text-[10px] text-text-muted font-[800] uppercase tracking-wider mb-1 ml-1">State</div>
                                    <input name="address.state" value={formData.address.state} onChange={handleChange} placeholder="State" className="w-full px-5 py-3 rounded-xl border border-glass-border bg-white text-[13px] text-text-main outline-none focus:border-primary" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <div className="text-[10px] text-text-muted font-[800] uppercase tracking-wider mb-1 ml-1">Pincode</div>
                                    <input name="address.zipCode" value={formData.address.zipCode} onChange={handleChange} placeholder="ZIP" className="w-full px-5 py-3 rounded-xl border border-glass-border bg-white text-[13px] text-text-main outline-none focus:border-primary" />
                                </div>
                                <div>
                                    <div className="text-[10px] text-text-muted font-[800] uppercase tracking-wider mb-1 ml-1">GSTIN (Optional)</div>
                                    <input name="gstNumber" value={formData.gstNumber} onChange={handleChange} placeholder="Tax Identifier" className="w-full px-5 py-3 rounded-xl border border-glass-border bg-white text-[13px] text-text-main outline-none focus:border-primary uppercase" />
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] text-text-muted font-[800] uppercase tracking-wider mb-1 ml-1">PAN Number</div>
                                <input name="panNumber" value={formData.panNumber} onChange={handleChange} placeholder="ABCDE1234F" className="w-full px-5 py-3 rounded-xl border border-glass-border bg-white text-[13px] text-text-main outline-none focus:border-primary uppercase" />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                            {/* Aadhaar Upload */}
                            <div>
                                <div className="text-[10px] text-text-muted font-[800] uppercase tracking-wider mb-1 ml-1">Aadhaar Card Image</div>
                                {!aadhaarPreview ? (
                                    <div 
                                        onClick={() => document.getElementById('aadhaar-upload').click()}
                                        className="border-2 border-dashed border-slate-200 rounded-[20px] p-6 flex flex-col items-center justify-center gap-2 bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-all"
                                    >
                                        <Upload size={24} className="text-slate-400" />
                                        <p className="text-[12px] font-bold text-text-main">Upload Aadhaar</p>
                                        <input id="aadhaar-upload" type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'aadhaar')} className="hidden" />
                                    </div>
                                ) : (
                                    <div className="relative rounded-[20px] overflow-hidden border border-slate-200 h-[140px]">
                                        <img src={aadhaarPreview} alt="Aadhaar" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => removeFile('aadhaar')} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg"><Trash2 size={16} /></button>
                                    </div>
                                )}
                            </div>

                            {/* PAN Upload */}
                            <div>
                                <div className="text-[10px] text-text-muted font-[800] uppercase tracking-wider mb-1 ml-1">PAN Card Image</div>
                                {!panPreview ? (
                                    <div 
                                        onClick={() => document.getElementById('pan-upload').click()}
                                        className="border-2 border-dashed border-slate-200 rounded-[20px] p-6 flex flex-col items-center justify-center gap-2 bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-all"
                                    >
                                        <Upload size={24} className="text-slate-400" />
                                        <p className="text-[12px] font-bold text-text-main">Upload PAN</p>
                                        <input id="pan-upload" type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'pan')} className="hidden" />
                                    </div>
                                ) : (
                                    <div className="relative rounded-[20px] overflow-hidden border border-slate-200 h-[140px]">
                                        <img src={panPreview} alt="PAN" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => removeFile('pan')} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg"><Trash2 size={16} /></button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                            <div>
                                <div className="text-[10px] text-text-muted font-[800] uppercase tracking-wider mb-1 ml-1">Account Holder Name</div>
                                <input name="bankDetails.accountHolderName" value={formData.bankDetails.accountHolderName} onChange={handleChange} placeholder="Legal name as per bank" className="w-full px-5 py-3 rounded-xl border border-glass-border bg-white text-[13px] text-text-main outline-none focus:border-primary" />
                            </div>
                            <div>
                                <div className="text-[10px] text-text-muted font-[800] uppercase tracking-wider mb-1 ml-1">Bank Name</div>
                                <input name="bankDetails.bankName" value={formData.bankDetails.bankName} onChange={handleChange} placeholder="e.g. State Bank of India" className="w-full px-5 py-3 rounded-xl border border-glass-border bg-white text-[13px] text-text-main outline-none focus:border-primary" />
                            </div>
                            <div>
                                <div className="text-[10px] text-text-muted font-[800] uppercase tracking-wider mb-1 ml-1">Account Number</div>
                                <input name="bankDetails.accountNumber" value={formData.bankDetails.accountNumber} onChange={handleChange} placeholder="Enter account number" className="w-full px-5 py-3 rounded-xl border border-glass-border bg-white text-[13px] text-text-main outline-none focus:border-primary" />
                            </div>
                            <div>
                                <div className="text-[10px] text-text-muted font-[800] uppercase tracking-wider mb-1 ml-1">IFSC Code</div>
                                <input name="bankDetails.ifscCode" value={formData.bankDetails.ifscCode} onChange={handleChange} placeholder="XXXX0000000" className="w-full px-5 py-3 rounded-xl border border-glass-border bg-white text-[13px] text-text-main outline-none focus:border-primary uppercase" />
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-500/10 text-red-600 p-3 rounded-xl text-[12px] text-center font-bold border border-red-500/20">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 mt-4">
                        {step > 1 && (
                            <button
                                type="button"
                                onClick={handleBack}
                                className="flex-1 p-[14px] bg-white border border-glass-border text-text-main rounded-xl text-sm font-[800] flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                            >
                                <ChevronLeft size={16} /> BACK
                            </button>
                        )}
                        {!otpSent && (
                            <button
                                type="submit"
                                disabled={loading || otpLoading}
                                className={`flex-[2] p-[14px] text-white border-none rounded-xl text-sm font-[800] shadow-[0_20px_40px_rgba(40,116,240,0.25)] transition-all flex items-center justify-center gap-2 ${(loading || otpLoading) ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5'}`}
                                style={{ background: '#2874f0', color: '#ffffff', opacity: (loading || otpLoading) ? 0.7 : 1 }}
                            >
                                {(loading || otpLoading) ? 'PROCESSING...' : step === 4 ? 'SUBMIT FOR VERIFICATION' : 'CONTINUE'}
                                {step < 4 && !(loading || otpLoading) && <ChevronRight size={16} />}
                            </button>
                        )}
                    </div>
                </form>

                <div className={`text-center text-[12px] text-text-muted font-semibold mt-8`}>
                    Already have a seller account?{' '}
                    <Link to="/seller-login" className="text-primary font-[800] no-underline ml-1">
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}
