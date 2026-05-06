import { Clock, Package, CheckCircle, XCircle, Truck } from 'lucide-react';

const OrderStatusBadge = ({ status }) => {
    const styles = {
        pending: { bg: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
        ordered: { bg: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
        confirmed: { bg: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle },
        processing: { bg: 'bg-blue-100 text-blue-700 border-blue-200', icon: Package },
        packed: { bg: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: Package },
        shipped: { bg: 'bg-purple-100 text-purple-700 border-purple-200', icon: Truck },
        'out for delivery': { bg: 'bg-cyan-100 text-cyan-700 border-cyan-200', icon: Truck },
        delivered: { bg: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
        cancelled: { bg: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
        returned: { bg: 'bg-slate-100 text-slate-700 border-slate-200', icon: XCircle },
    };
    const style = styles[status?.toLowerCase()] || styles.pending;
    const Icon = style.icon || Package;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-[1000] border ${style.bg} uppercase tracking-widest shadow-sm`}>
            <Icon size={12} strokeWidth={3} />
            {status}
        </span>
    );
};

export default OrderStatusBadge;
