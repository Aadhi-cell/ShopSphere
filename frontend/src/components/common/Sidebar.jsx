import React from 'react';
import { useLocation } from 'react-router-dom';
import { Home, ShoppingBag, ShoppingCart, Package, Heart, User, Store, HelpCircle } from 'lucide-react';

const Sidebar = ({
    isMobile,
    menuOpen,
    setMenuOpen,
    user,
    cartCount,
    isActive,
    navigate,
    goHome
}) => {
    const location = useLocation();
    if (isMobile) return null;

    const navItems = [
        { label: 'Home', icon: Home, action: goHome, path: '/' },
        { label: 'Shop', icon: ShoppingBag, action: () => { navigate('/'); setTimeout(() => document.getElementById('product-section')?.scrollIntoView({ behavior: 'smooth' }), 100); }, path: '/#shop' },
        { label: 'Cart', icon: ShoppingCart, action: () => navigate('/cart'), path: '/cart' },
        { label: 'Orders', icon: Package, action: () => navigate('/orders'), path: '/orders' },
        { label: 'Wishlist', icon: Heart, action: () => navigate('/wishlist'), path: '/wishlist' },
        { label: 'Profile', icon: User, action: () => navigate('/profile'), path: '/profile' },
        { label: 'Help', icon: HelpCircle, action: () => navigate('/help'), path: '/help' },
        ...(user?.role === 'seller' ? [{ label: 'Seller Dashboard', icon: Store, action: () => navigate('/seller'), path: '/seller' }] : []),
    ];

    return (
        <div
            className={`glass-panel fixed flex flex-col py-6 box-border gap-2 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-[1250] overflow-x-hidden overflow-y-auto bg-white/85 backdrop-blur-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] border-r border-glass-border
                ${isMobile ? (menuOpen ? 'left-0 rounded-none' : '-left-[300px] rounded-none') : 'left-2.5 top-[85px] bottom-2 rounded-[24px] border border-glass-border shadow-[0_10px_30px_rgba(40,116,240,0.03)]'}
            `}
            style={{
                width: menuOpen ? 'var(--nav-width-expanded)' : 'var(--nav-width-collapsed)',
            }}
        >
            <nav className="flex flex-col gap-1.5 w-full px-3 box-border">
                {navItems.map((item) => {
                    const IconComponent = item.icon;
                    const active = isActive(item.path) || (item.label === 'Shop' && location.pathname === '/' && location.hash === '#shop');
                    return (
                        <button
                            key={item.label}
                            onClick={() => { item.action(); setMenuOpen(false); }}
                            title={!menuOpen ? item.label : ''}
                            className={`w-full h-[50px] rounded-2xl border-none cursor-pointer flex items-center transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] text-sm gap-3 relative ${active ? 'bg-primary/12 text-primary font-bold' : 'bg-transparent text-text-muted font-medium'} ${menuOpen ? 'justify-start px-2.5' : 'justify-center p-0'}`}
                        >
                            <div className="relative flex items-center justify-center">
                                <IconComponent size={21} className="min-w-[21px]" />
                                {item.label === 'Cart' && cartCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white px-0.5">
                                        {cartCount > 99 ? '99+' : cartCount}
                                    </span>
                                )}
                            </div>
                            {menuOpen && <span>{item.label}</span>}
                        </button>
                    )
                })}
            </nav>
        </div>
    );
};

export default Sidebar;
