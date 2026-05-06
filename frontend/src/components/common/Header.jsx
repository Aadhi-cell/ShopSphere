import React, { useState, useEffect } from 'react';
import { Search, X, Bell, LayoutGrid, User } from 'lucide-react';
import { getActiveAnnouncements } from '../../api/userApi';
import { getProducts } from '../../api/productApi';
import Logo from './Logo';
import { getImageUrl } from '../../utils/imageConfig';

const Header = ({
    isMobile,
    menuOpen,
    setMenuOpen,
    profileOpen,
    setProfileOpen,
    setSearchOverlayOpen,
    user,
    cartCount,
    goHome,
    navigate,
    handleLogout
}) => {
    const [announcements, setAnnouncements] = useState([]);
    const [currentAnnouncement, setCurrentAnnouncement] = useState(0);
    const [showBar, setShowBar] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const data = await getActiveAnnouncements();
                setAnnouncements(data);
            } catch (err) {
                console.error('Failed to fetch announcements:', err);
            }
        };
        fetchAnnouncements();
    }, []);

    useEffect(() => {
        if (announcements.length > 1) {
            const timer = setInterval(() => {
                setCurrentAnnouncement(prev => (prev + 1) % announcements.length);
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [announcements.length]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.trim().length > 1) {
                try {
                    const data = await getProducts({ search: searchQuery });
                    setSuggestions(data.slice(0, 8)); // Limit to 8 suggestions
                    setShowSuggestions(true);
                } catch (err) {
                    console.error('Failed to fetch suggestions:', err);
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300); // 300ms debounce
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Handle outside click to close suggestions
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.search-container')) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const activeAnn = announcements[currentAnnouncement];

    return (
        <>
            {showBar && activeAnn && (
                <div className={`fixed top-0 left-0 right-0 z-[1300] h-9 px-4 flex items-center justify-center transition-all duration-500 overflow-hidden ${activeAnn.type === 'warning' ? 'bg-amber-100 text-amber-900 border-b border-amber-200' :
                    activeAnn.type === 'error' ? 'bg-rose-100 text-rose-900 border-b border-rose-200' :
                        activeAnn.type === 'success' ? 'bg-emerald-100 text-emerald-900 border-b border-emerald-200' :
                            'bg-slate-900 text-white'
                    }`}>
                    <div className="flex items-center gap-2 max-w-screen-xl mx-auto w-full">
                        <div className="flex-1 flex items-center justify-center gap-3 animate-in fade-in slide-in-from-top-1">
                            <Bell size={14} className={activeAnn.type === 'info' ? 'text-primary' : ''} />
                            <p className="text-[11px] font-[900] tracking-wider uppercase truncate">
                                {activeAnn.message}
                            </p>
                        </div>
                        <button onClick={() => setShowBar(false)} className="hover:opacity-70 transition-opacity">
                            <X size={14} />
                        </button>
                    </div>
                </div>
            )}
            <header
                style={{ top: showBar && activeAnn ? '36px' : '0' }}
                className="glass-panel fixed left-0 right-0 h-[var(--header-height)] z-[1200] flex items-center justify-center p-0 rounded-none shadow-sm transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] border-b border-glass-border bg-white/90 backdrop-blur-[20px]"
            >
                <div className="w-full h-full flex items-center justify-between p-0 box-border gap-2 sm:gap-5 transition-none">
                    <div
                        className="flex items-center transition-none gap-3 sm:gap-6 pl-5 sm:pl-[calc(var(--sidebar-collapsed)+var(--layout-gutter))]"
                    >
                        <button
                            aria-label="Toggle Navigation"
                            onClick={() => setMenuOpen(prev => !prev)}
                            style={{ backgroundColor: '#2874f0' }}
                            className="z-[5000] border-none cursor-pointer w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_4px_20px_rgba(40,116,240,0.2)] relative mr-1 sm:mr-2 sm:absolute sm:left-[calc(var(--sidebar-collapsed)/2)] sm:-translate-x-1/2"
                        >
                            <div className="w-[18px] sm:w-[22px] h-[2.5px] bg-white rounded-[4px]"></div>
                            <div className="w-[18px] sm:w-[22px] h-[2.5px] bg-white rounded-[4px]"></div>
                            <div className="w-[18px] sm:w-[22px] h-[2.5px] bg-white rounded-[4px]"></div>
                        </button>
                        <div className="z-[4500]">
                            <Logo onClick={goHome} to="/" />
                        </div>
                    </div>

                    {/* Absolutely Centered Search Bar */}
                    <div
                        className="hidden lg:block search-container absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] max-w-[500px] z-[1300]"
                    >
                        <div className="relative w-full">
                            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-dim" />
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search products, brands..."
                                className="w-full py-3 pl-[42px] pr-4 rounded-2xl border border-glass-border text-[15px] bg-bg-secondary text-text-main outline-none transition-all duration-200 focus:border-primary/50 focus:bg-white focus:shadow-premium-sm"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
                                            navigate(`/products/${suggestions[selectedIndex]._id}`);
                                            setShowSuggestions(false);
                                            setSearchQuery('');
                                        } else if (searchQuery.trim()) {
                                            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                                            setShowSuggestions(false);
                                        }
                                    } else if (e.key === 'ArrowDown') {
                                        setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
                                    } else if (e.key === 'ArrowUp') {
                                        setSelectedIndex(prev => Math.max(prev - 1, -1));
                                    }
                                }}
                                onFocus={() => searchQuery.trim().length > 1 && setShowSuggestions(true)}
                            />

                            {/* Suggestions Dropdown */}
                            {showSuggestions && (suggestions.length > 0 || searchQuery.length > 1) && (
                                <div className="glass-panel absolute top-[calc(100%+8px)] left-0 right-0 rounded-2xl p-2 shadow-premium overflow-hidden border border-glass-border animate-in fade-in slide-in-from-top-2">
                                    {suggestions.length > 0 ? (
                                        <div className="max-h-[400px] overflow-y-auto">
                                            {suggestions.map((item, idx) => (
                                                <div
                                                    key={item._id}
                                                    onClick={() => {
                                                        navigate(`/products/${item._id}`);
                                                        setShowSuggestions(false);
                                                        setSearchQuery('');
                                                    }}
                                                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${idx === selectedIndex ? 'bg-[#2874f0]/10 border-l-4 border-[#2874f0]' : 'hover:bg-slate-50'}`}
                                                >
                                                    <div className="w-10 h-10 bg-slate-50 rounded-lg flex-shrink-0 flex items-center justify-center p-1">
                                                        <img
                                                            src={getImageUrl(item.imageUrl)}
                                                            alt=""
                                                            className="w-full h-full object-contain mix-blend-multiply"
                                                            onError={(e) => e.target.src = 'https://via.placeholder.com/40'}
                                                        />
                                                    </div>
                                                    <div className="flex-1 overflow-hidden">
                                                        <div className="text-[14px] font-bold text-slate-800 truncate">{item.name}</div>
                                                        <div className="text-[11px] text-[#2874f0] font-black uppercase tracking-tighter opacity-70">{item.brand || 'Premium'}</div>
                                                    </div>
                                                    <div className="text-[13px] font-black text-slate-400">₹{item.price}</div>
                                                </div>
                                            ))}
                                            <div
                                                onClick={() => navigate(`/search?q=${encodeURIComponent(searchQuery)}`)}
                                                className="p-3 mt-1 text-center text-[12px] font-black text-[#2874f0] cursor-pointer hover:bg-blue-50/50 rounded-xl"
                                            >
                                                SEE ALL RESULTS FOR "{searchQuery.toUpperCase()}"
                                            </div>
                                        </div>
                                    ) : (
                                        searchQuery.length > 1 && (
                                            <div className="p-8 text-center">
                                                <Search size={32} className="mx-auto text-slate-200 mb-2" />
                                                <div className="text-sm text-slate-500 font-bold">No quick matches found</div>
                                                <button
                                                    onClick={() => navigate(`/search?q=${encodeURIComponent(searchQuery)}`)}
                                                    className="mt-3 text-xs font-black text-primary underline bg-transparent border-none cursor-pointer"
                                                >
                                                    SEARCH ALL PRODUCTS
                                                </button>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right-side Group */}
                    <div className="flex items-center gap-1 sm:gap-4 pr-5 sm:pr-[var(--layout-gutter)]">
                        <button
                            onClick={() => setSearchOverlayOpen(true)}
                            className="lg:hidden flex items-center justify-center p-2 text-text-main hover:bg-black/5 rounded-full cursor-pointer transition-colors"
                        >
                            <Search size={20} />
                        </button>

                        <nav className="flex items-center gap-2 sm:gap-4">
                            {(!user?.role || user?.role === 'customer') && (
                                <button
                                    onClick={() => navigate('/seller-register')}
                                    className="hidden md:flex h-11 px-6 bg-[#2874f0]/8 text-[#2874f0] text-sm font-extrabold rounded-xl cursor-pointer items-center justify-center transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] border border-[#2874f0]/10 hover:bg-[#2874f0]/10"
                                >
                                    Become a Seller
                                </button>
                            )}

                            <div className="relative">
                                <button
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    className="h-10 w-10 md:h-11 md:w-auto bg-transparent border border-glass-border cursor-pointer flex items-center justify-center md:justify-start gap-3 md:pl-1.5 md:pr-4 rounded-[22px] transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-black/5">
                                    <div className="w-[30px] h-[30px] md:w-[34px] md:h-[34px] rounded-full text-white flex items-center justify-center font-extrabold shrink-0"
                                        style={{ background: 'linear-gradient(135deg, #2874f0, #008ecc)' }}>
                                        <User size={16} strokeWidth={2.5} />
                                    </div>
                                    <span className="hidden md:block text-sm font-bold text-text-main truncate max-w-[100px]">{user?.name ? user.name.split(' ')[0] : 'Account'}</span>
                                </button>

                                {profileOpen && (
                                    <div className="glass-panel absolute top-[calc(100%+12px)] right-0 rounded-[20px] p-2.5 min-w-[220px] z-[2000]">
                                        <div className="p-3 border-b border-glass-border mb-2">
                                            <div className="font-extrabold text-text-main text-[15px]">{user?.name || 'Guest User'}</div>
                                            <div className="text-xs text-text-muted">{user?.email || 'Premium Member'}</div>
                                            {user?.role && user.role !== 'customer' && (
                                                <span className={`inline-block mt-1.5 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${user.role === 'admin' ? 'bg-red-100 text-red-600' :
                                                    user.role === 'seller' ? 'bg-blue-100 text-blue-600' :
                                                        'bg-gray-100 text-gray-500'
                                                    }`}>{user.role}</span>
                                            )}
                                        </div>
                                        {user?.role === 'seller' && (
                                            <button onClick={() => { navigate('/seller'); setProfileOpen(false); }} className="w-full text-left p-3 bg-transparent border-none text-text-main font-bold cursor-pointer rounded-xl hover:bg-black/5">Seller Dashboard</button>
                                        )}
                                        <button onClick={handleLogout} className="w-full text-left p-3 bg-transparent border-none text-[#ef4444] font-bold cursor-pointer rounded-xl hover:bg-red-50">Logout</button>
                                    </div>
                                )}
                            </div>
                        </nav>
                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;
