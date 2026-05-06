import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { WishlistProvider } from './contexts/WishlistContext';
import { useCart } from './contexts/CartContext';
import Footer from './components/common/Footer';
import BottomNav from './components/common/BottomNav';
import SearchOverlay from './components/common/SearchOverlay';
import useMobile from './hooks/useMobile';
import { logout, getUser } from './auth';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';

export default function App() {
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
    const [user, setUser] = useState(getUser());
    const isMobile = useMobile();
    const { getCartCount } = useCart();
    const cartCount = getCartCount();
    const isActive = (path) => location.pathname === path;

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const goHome = () => {
        navigate('/');
    };

    return (
        <WishlistProvider>
            <div className="flex min-h-screen w-full bg-bg-primary bg-[radial-gradient(at_0%_0%,rgba(40,116,240,0.02)_0px,transparent_50%),radial-gradient(at_100%_100%,rgba(0,142,240,0.02)_0px,transparent_50%)] text-text-main">

                <Header
                    isMobile={isMobile}
                    menuOpen={menuOpen}
                    setMenuOpen={setMenuOpen}
                    profileOpen={profileOpen}
                    setProfileOpen={setProfileOpen}
                    setSearchOverlayOpen={setSearchOverlayOpen}
                    user={user}
                    cartCount={cartCount}
                    goHome={goHome}
                    navigate={navigate}
                    handleLogout={handleLogout}
                />

                <Sidebar
                    isMobile={isMobile}
                    menuOpen={menuOpen}
                    setMenuOpen={setMenuOpen}
                    user={user}
                    cartCount={cartCount}
                    isActive={isActive}
                    navigate={navigate}
                    goHome={goHome}
                />

                <main
                    className={`main-content flex-1 ml-0 min-h-screen min-w-0 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${isMobile ? 'pt-[var(--mobile-header-height)] pb-[calc(var(--bottom-nav-height)+var(--space-10))]' : 'pt-space-10 pb-0'}`}
                >
                    <div
                        className={`flex-1 ${isMobile ? 'px-[var(--mobile-gutter)]' : 'pl-[calc(var(--sidebar-collapsed)+var(--layout-gutter))] pr-[var(--layout-gutter)]'}`}
                    >
                        <Outlet />
                    </div>
                    <div className="mt-space-10">
                        <Footer isMenuOpen={menuOpen} />
                    </div>
                </main>

                <SearchOverlay
                    isOpen={searchOverlayOpen}
                    onClose={() => setSearchOverlayOpen(false)}
                    onSearch={(query) => {
                        setSearchOverlayOpen(false);
                        navigate(`/search?q=${encodeURIComponent(query)}`);
                    }}
                />
                <BottomNav />
            </div>
        </WishlistProvider>
    );
}
