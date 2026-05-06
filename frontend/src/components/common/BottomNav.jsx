import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, ShoppingCart, Package, User } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

export default function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const { getCartCount } = useCart();
    const cartCount = getCartCount();

    const tabs = [
        { label: 'Home', icon: Home, path: '/' },
        { label: 'Shop', icon: ShoppingBag, path: '/#shop' },
        { label: 'Cart', icon: ShoppingCart, path: '/cart' },
        { label: 'Orders', icon: Package, path: '/orders' },
        { label: 'Profile', icon: User, path: '/profile' },
    ];

    const isActive = (path) => {
        if (path === '/shop') return location.pathname === '/' && location.hash === '#shop';
        return location.pathname === path;
    };

    return (
        <nav
            className="glass-panel hide-desktop fixed bottom-space-4 left-space-4 right-space-4 h-bottom-nav z-[1500] flex items-center justify-around px-space-2 rounded-[24px] border border-glass-border bg-white/90 backdrop-blur-[20px] shadow-premium animate-[slideUp_0.5s_cubic-bezier(0.16,1,0.3,1)]"
        >
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = isActive(tab.path);
                return (
                    <button
                        key={tab.label}
                        onClick={() => {
                            if (tab.label === 'Shop') {
                                navigate('/');
                                setTimeout(() => {
                                    const el = document.getElementById('product-section');
                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                }, 100);
                            } else {
                                navigate(tab.path);
                            }
                        }}
                        className={`flex flex-col items-center justify-center gap-1 bg-transparent border-none p-2 transition-all duration-200 flex-1 relative ${active ? 'text-primary' : 'text-text-muted'}`}
                    >
                        <div className={`p-1.5 rounded-xl flex items-center justify-center transition-all duration-200 relative ${active ? 'bg-primary/10' : 'bg-transparent'}`}>
                            <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                            {tab.label === 'Cart' && cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white px-0.5">
                                    {cartCount > 99 ? '99+' : cartCount}
                                </span>
                            )}
                        </div>
                        <span className={`text-[10px] letter-spacing-[0.02em] ${active ? 'font-bold' : 'font-medium'}`}>
                            {tab.label}
                        </span>
                        {active && (
                            <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary" />
                        )}
                    </button>
                );
            })}
        </nav>
    );
}
