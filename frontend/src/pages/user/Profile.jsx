import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../auth';
import { getUserProfile, updateUserProfile } from '../../api/userApi';
import {
    User, Mail, Phone, MapPin, LogOut, Package, Heart,
    Headphones, Save, ShieldCheck, CheckCircle2, RotateCw,
    Edit2, CreditCard, Bell, ChevronRight
} from 'lucide-react';

export default function Profile() {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [profile, setProfile] = useState({
        fullName: 'Vishnu Kumar',
        email: 'vishnu@example.com',
        phone: '+91 98765 43210',
        gender: 'Male',
        address: {
            line1: '123, Tech Park Road',
            city: 'Bangalore',
            state: 'Karnataka',
            zip: '560001'
        }
    });

    useEffect(() => {
        async function fetchProfile() {
            try {
                const data = await getUserProfile();
                if (data) {
                    setProfile(prev => ({ ...prev, ...data }));
                }
            } catch (err) {
                console.error('Failed to load profile', err);
            }
        }
        fetchProfile();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateUserProfile(profile);
            setIsEditing(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            console.error('Failed to save profile', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (field, value) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    const handleAddressChange = (field, value) => {
        setProfile(prev => ({
            ...prev,
            address: { ...prev.address, [field]: value }
        }));
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const quickLinks = [
        { title: 'My Orders', icon: <Package size={18} />, path: '/orders', desc: 'Track, return, or buy things again' },
        { title: 'Wishlist', icon: <Heart size={18} />, path: '/wishlist', desc: 'Your saved items and collections' },
        { title: 'Support Tasks', icon: <Headphones size={18} />, path: '/help', desc: 'Track your inquiries and tickets' },
    ];

    const inputClasses = "w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-[14px] text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-100 placeholder-gray-400";
    const labelClasses = "block text-[12px] font-semibold text-gray-600 mb-1.5 uppercase tracking-wide";

    return (
        <div className="min-h-screen bg-gray-50/50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                            Account Settings
                        </h1>
                        <p className="mt-1 text-gray-500 text-sm">
                            Manage your profile information and preferences.
                        </p>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        disabled={isSaving}
                        className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${isEditing ? 'bg-primary text-white hover:bg-primary/90 shadow-sm' : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 shadow-sm'}`}
                    >
                        {isSaving ? (
                            <RotateCw size={16} className="animate-spin" />
                        ) : saveSuccess ? (
                            <CheckCircle2 size={16} className="text-emerald-500" />
                        ) : isEditing ? (
                            <Save size={16} />
                        ) : (
                            <Edit2 size={16} />
                        )}
                        {isSaving ? 'Saving...' : saveSuccess ? 'Saved' : isEditing ? 'Save Changes' : 'Edit Profile'}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">

                    {/* Left Column: Form Areas */}
                    <div className="space-y-8">

                        {/* Personal Information */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-100 border-dashed bg-gray-50/30">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <User className="text-gray-400" size={20} />
                                    Personal Information
                                </h2>
                            </div>

                            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="relative">
                                    <label className={labelClasses}>Full Name</label>
                                    <div className="relative">
                                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            disabled={!isEditing}
                                            value={profile.fullName}
                                            onChange={(e) => handleChange('fullName', e.target.value)}
                                            className={inputClasses}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>
                                <div className="relative">
                                    <label className={labelClasses}>Email Address</label>
                                    <div className="relative">
                                        <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            disabled={!isEditing}
                                            value={profile.email}
                                            onChange={(e) => handleChange('email', e.target.value)}
                                            className={inputClasses}
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>
                                <div className="relative">
                                    <label className={labelClasses}>Phone Number</label>
                                    <div className="relative">
                                        <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            disabled={!isEditing}
                                            value={profile.phone}
                                            onChange={(e) => handleChange('phone', e.target.value)}
                                            className={inputClasses}
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                </div>
                                <div className="relative">
                                    <label className={labelClasses}>Gender</label>
                                    <div className="relative">
                                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <select
                                            disabled={!isEditing}
                                            value={profile.gender}
                                            onChange={(e) => handleChange('gender', e.target.value)}
                                            className={inputClasses}
                                            style={{ appearance: 'none' }}
                                        >
                                            <option>Male</option>
                                            <option>Female</option>
                                            <option>Other</option>
                                            <option>Prefer not to say</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Address Information */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-100 border-dashed bg-gray-50/30">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <MapPin className="text-gray-400" size={20} />
                                    Default Shipping Address
                                </h2>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="relative">
                                    <label className={labelClasses}>Street Address</label>
                                    <div className="relative">
                                        <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            disabled={!isEditing}
                                            value={profile.address.line1}
                                            onChange={(e) => handleAddressChange('line1', e.target.value)}
                                            className={inputClasses}
                                            placeholder="123 Main St, Apt 4B"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <div className="relative">
                                        <label className={labelClasses}>City</label>
                                        <input
                                            disabled={!isEditing}
                                            value={profile.address.city}
                                            onChange={(e) => handleAddressChange('city', e.target.value)}
                                            className={`${inputClasses} pl-4`}
                                            placeholder="New York"
                                        />
                                    </div>
                                    <div className="relative">
                                        <label className={labelClasses}>State / Province</label>
                                        <input
                                            disabled={!isEditing}
                                            value={profile.address.state}
                                            onChange={(e) => handleAddressChange('state', e.target.value)}
                                            className={`${inputClasses} pl-4`}
                                            placeholder="NY"
                                        />
                                    </div>
                                    <div className="relative">
                                        <label className={labelClasses}>ZIP / Postal Code</label>
                                        <input
                                            disabled={!isEditing}
                                            value={profile.address.zip}
                                            onChange={(e) => handleAddressChange('zip', e.target.value)}
                                            className={`${inputClasses} pl-4`}
                                            placeholder="10001"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Mini Profile & Links */}
                    <div className="space-y-6">

                        {/* Profile Summary Card */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center mb-4 text-3xl font-bold tracking-tight text-primary">
                                {profile.fullName.charAt(0).toUpperCase()}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{profile.fullName}</h3>
                            <p className="text-sm text-gray-500 mb-6">{profile.email}</p>

                            <div className="w-full grid grid-cols-2 gap-4 border-t border-gray-100 pt-6">
                                <div className="flex flex-col items-center">
                                    <span className="text-2xl font-bold text-gray-900">12</span>
                                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-1">Orders</span>
                                </div>
                                <div className="flex flex-col items-center border-l border-gray-100">
                                    <span className="text-2xl font-bold text-gray-900">5</span>
                                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-1">Saved</span>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="divide-y divide-gray-100">
                                {quickLinks.map((link) => (
                                    <div
                                        key={link.title}
                                        onClick={() => navigate(link.path)}
                                        className="p-4 flex items-center gap-4 hover:bg-gray-50 cursor-pointer transition-colors group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                            {link.icon}
                                        </div>
                                        <div className="flex-1 text-left">
                                            <h4 className="text-sm font-semibold text-gray-900">{link.title}</h4>
                                            <p className="text-xs text-gray-500 mt-0.5">{link.desc}</p>
                                        </div>
                                        <ChevronRight size={18} className="text-gray-400 group-hover:text-primary transition-colors" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="w-full py-3.5 px-4 bg-white border border-red-200 text-red-600 rounded-2xl font-semibold text-sm hover:bg-red-50 hover:border-red-300 transition-all flex items-center justify-center gap-2 shadow-sm"
                        >
                            <LogOut size={18} />
                            Log Out securely
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
}
