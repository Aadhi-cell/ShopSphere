import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaFacebookF,
    FaTwitter,
    FaInstagram,
    FaLinkedinIn,
    FaShieldAlt
} from 'react-icons/fa';
import { IoMailOutline, IoLocationOutline, IoCallOutline, IoTimeOutline } from 'react-icons/io5';
import useMobile from '../../hooks/useMobile';
import Logo from './Logo';

export default function Footer({ isMenuOpen }) {
    const navigate = useNavigate();
    const isMobile = useMobile();

    const goCategory = (cat) => {
        navigate(`/?category=${cat}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const goPage = (path) => {
        navigate(path);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Responsive padding logic
    const paddingLeft = isMobile
        ? 'px-mobile-gutter'
        : isMenuOpen
            ? 'pl-[calc(var(--sidebar-expanded)+var(--layout-gutter))]'
            : 'pl-[calc(var(--sidebar-collapsed)+var(--layout-gutter))]';

    return (
        <footer className={`bg-surface border-t border-glass-border w-full box-border ${isMobile ? 'pt-6 mt-6' : 'pt-20 mt-[100px]'}`}>
            <div className={`w-full grid grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-x-4 gap-y-8 sm:gap-10 lg:gap-8 pb-6 sm:pb-10 ${isMobile ? 'px-5' : 'pr-10 lg:pr-10'} ${paddingLeft}`}>

                {/* Column 1: Brand & Desc */}
                <div className="flex flex-col col-span-2 lg:col-span-1 border-b sm:border-none border-glass-border pb-6 sm:pb-0 items-center sm:items-start text-center sm:text-left">
                    <div className="scale-90 origin-center sm:scale-100 sm:origin-left">
                        <Logo className="mb-2 sm:mb-4" />
                    </div>
                    <p className="text-[12px] sm:text-[13px] text-text-muted mb-4 sm:mb-6 max-w-sm lg:max-w-[280px]">
                        Next-generation e-commerce platform built for speed and precision. Secure, fast, and futuristic.
                    </p>
                    <div className="flex justify-center sm:justify-start gap-3 sm:gap-4 lg:gap-3">
                        {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn].map((Icon, idx) => (
                            <div key={idx} className="w-8 h-8 sm:w-10 sm:h-10 lg:w-9 lg:h-9 rounded-[10px] sm:rounded-xl lg:rounded-[10px] bg-bg-secondary flex items-center justify-center border border-glass-border text-text-muted cursor-pointer transition-all duration-300 hover:text-primary hover:-translate-y-[3px]">
                                <Icon size={14} className="sm:w-4 sm:h-4" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Column 2: Marketplace */}
                <div className="flex flex-col col-span-1 items-center sm:items-start text-center sm:text-left">
                    <h4 className="text-[15px] sm:text-base font-[800] text-text-main mb-3 sm:mb-5 lg:mb-6">Marketplace</h4>
                    <ul className="list-none p-0 m-0">
                        {['Mobiles', 'Accessories', 'Furniture', 'Watches'].map((name) => (
                            <li key={name} onClick={() => goCategory(name.replace('s', ''))} className="text-[13px] sm:text-sm mb-2.5 sm:mb-3.5 lg:mb-3 text-text-muted cursor-pointer transition-all duration-300 hover:text-primary hover:translate-x-1">
                                {name}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Column 3: Information */}
                <div className="flex flex-col col-span-1 items-center sm:items-start text-center sm:text-left">
                    <h4 className="text-[15px] sm:text-base font-[800] text-text-main mb-3 sm:mb-5 lg:mb-6">Information</h4>
                    <ul className="list-none p-0 m-0">
                        {[
                            { name: 'Return Policy', path: '/returns' },
                            { name: 'Support', path: '/help' },
                            { name: 'Privacy', path: '/privacy' }
                        ].map((item) => (
                            <li key={item.name} onClick={() => goPage(item.path)} className="text-[13px] sm:text-sm mb-2.5 sm:mb-3.5 lg:mb-3 text-text-muted cursor-pointer transition-all duration-300 hover:text-primary hover:translate-x-1">
                                {item.name}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Column 4: Contact */}
                <div className="flex flex-col col-span-2 lg:col-span-1 border-t sm:border-none border-glass-border pt-5 sm:pt-0 mt-2 sm:mt-0 items-center sm:items-start text-center sm:text-left">
                    <h4 className="text-[15px] sm:text-base font-[800] text-text-main mb-3 sm:mb-5 lg:mb-6">Contact Us</h4>
                    <div className="flex flex-col sm:grid sm:grid-cols-2 lg:flex lg:flex-col gap-2 sm:gap-3.5 lg:gap-3 items-center sm:items-start">
                        <div className="text-[12px] sm:text-[13px] text-text-dim flex items-center justify-center sm:justify-start gap-2.5 sm:gap-3 lg:gap-2"><IoLocationOutline size={16} className="text-primary sm:w-[18px] sm:h-[18px]" /> Headquarters</div>
                        <div className="text-[12px] sm:text-[13px] text-text-dim flex items-center justify-center sm:justify-start gap-2.5 sm:gap-3 lg:gap-2"><IoCallOutline size={16} className="text-primary sm:w-[18px] sm:h-[18px]" /> +91-000-000</div>
                        <div className="text-[12px] sm:text-[13px] text-text-dim flex items-center justify-center sm:justify-start gap-2.5 sm:gap-3 lg:gap-2"><IoMailOutline size={16} className="text-primary sm:w-[18px] sm:h-[18px]" /> support@shopsphere.ai</div>
                    </div>
                </div>
            </div>

            <div className={`border-t border-glass-border py-4 sm:py-6 ${isMobile ? 'px-5' : `pr-10 ${paddingLeft}`}`}>
                <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-3 sm:gap-4 text-center sm:text-left">
                    <div className="text-[12px] sm:text-[13px] text-text-dim">
                        © {new Date().getFullYear()} <span className="text-text-main font-bold">ShopSphere Inc.</span>
                    </div>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-6">
                        <div className="text-[9px] sm:text-[10px] font-[900] text-text-dim flex items-center gap-1.5"><FaShieldAlt size={10} className="sm:w-3 sm:h-3" /> SECURE GATEWAY</div>
                        <div className="text-[9px] sm:text-[10px] font-[900] text-text-dim flex items-center gap-1.5"><IoTimeOutline size={10} className="sm:w-3 sm:h-3" /> 24/7 ACTIVE</div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

