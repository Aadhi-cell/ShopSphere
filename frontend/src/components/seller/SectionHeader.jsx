import React from 'react';

const SectionHeader = ({ title, action, icon: Icon }) => (
    <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
            {Icon && <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><Icon size={20} /></div>}
            <h2 className="text-2xl font-[1000] text-slate-900 tracking-tight">{title}</h2>
        </div>
        {action}
    </div>
);

export default SectionHeader;
