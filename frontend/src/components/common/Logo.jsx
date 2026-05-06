import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ 
    className = '', 
    textClassName = 'text-[24px] lg:text-[28px]', 
    iconSize = 44, 
    showText = true, 
    to = '/', 
    onClick 
}) => {
    return (
        <Link 
            to={to} 
            onClick={onClick}
            className={`flex items-center gap-3 no-underline group cursor-pointer ${className}`}
        >
            <div className="relative flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-[1.05]"
                 style={{ width: iconSize, height: iconSize }}>
                <svg viewBox="0 0 100 100" width="100%" height="100%" className="-translate-y-[1px]">
                    <defs>
                        <linearGradient id="primary" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#60a5fa" />
                            <stop offset="50%" stopColor="#2874f0" />
                            <stop offset="100%" stopColor="#1e3a8a" />
                        </linearGradient>
                        <radialGradient id="glare" cx="30%" cy="30%" r="70%">
                            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                        </radialGradient>
                        <filter id="logoShadow">
                            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#2874f0" floodOpacity="0.4" />
                        </filter>
                    </defs>
                    
                    <g filter="url(#logoShadow)">
                        {/* Dynamic Handles */}
                        <path d="M 35 40 V 25 C 35 15 65 15 65 25 V 40" stroke="url(#primary)" strokeWidth="6" strokeLinecap="round" fill="none" />
                        
                        {/* Sleek Bag Body */}
                        <path d="M 20 40 C 20 35 25 35 30 35 H 70 C 75 35 80 35 80 40 L 85 85 C 85 92 80 95 75 95 H 25 C 20 95 15 92 15 85 Z" fill="url(#primary)" />
                        
                        {/* Soft 3D Glare */}
                        <path d="M 20 40 C 20 35 25 35 30 35 H 70 C 75 35 80 35 80 40 L 82 60 C 50 70 30 60 18 60 Z" fill="url(#glare)" />
                        
                        {/* Central Sphere marking */}
                        <circle cx="50" cy="65" r="14" fill="#ffffff" />
                        
                        {/* Inner swoosh S curve */}
                        <path d="M 46 59 C 40 59 40 65 50 65 C 60 65 60 71 54 71" stroke="#2874f0" strokeWidth="3" strokeLinecap="round" fill="none" />
                    </g>
                </svg>
            </div>
            
            {showText && (
                <span className={`tracking-[-1.2px] select-none ${textClassName}`}>
                    <span className="text-slate-900 font-[900]">Shop</span>
                    <span className="text-[#2874f0] font-[900]">Sphere</span>
                </span>
            )}
        </Link>
    );
};

export default Logo;
