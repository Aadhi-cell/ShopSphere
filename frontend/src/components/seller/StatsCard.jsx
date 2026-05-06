import React from 'react';
import { Clock } from 'lucide-react';

const StatsCard = ({ title, value, icon: Icon, color, subtext, trend }) => (
    <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.04)] transition-all group flex flex-col justify-between cursor-default">
        <div>
            <div className="flex items-start justify-between mb-8">
                <div className="p-3 bg-gray-50 border border-gray-100 rounded-2xl group-hover:bg-gray-900 transition-all">
                    <Icon size={22} className="text-gray-900 group-hover:text-white transition-all" strokeWidth={2.5} />
                </div>
                {trend && (
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right max-w-[50%] leading-tight group-hover:text-gray-900 transition-colors">
                        {trend}
                    </div>
                )}
            </div>
            <div>
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">{title}</p>
                <h3 className="text-[32px] font-black text-gray-900 tracking-tighter leading-none mb-2">{value}</h3>
                {subtext && <p className="text-[12px] text-gray-500 font-semibold">{subtext}</p>}
            </div>
        </div>
    </div>
);

export default StatsCard;



