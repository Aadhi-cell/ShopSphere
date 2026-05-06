import React from 'react';

const EmptyState = ({ title, description, icon: Icon }) => (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in duration-700">
        <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center text-slate-300 mb-6 border border-slate-100">
            <Icon size={40} strokeWidth={1.5} />
        </div>
        <h3 className="text-xl font-[1000] text-slate-900 mb-2 tracking-tight">{title}</h3>
        <p className="text-slate-500 max-w-[320px] text-sm font-bold leading-relaxed">{description}</p>
    </div>
);

export default EmptyState;
