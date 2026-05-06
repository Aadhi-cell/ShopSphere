import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, RefreshCw, MessageCircle } from 'lucide-react';

export default function PaymentFailure() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const reason = searchParams.get('reason') || 'An unexpected error occurred during payment processing.';
    const paymentId = searchParams.get('paymentId');

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-primary px-5 py-10">
            <div className="glass-panel max-w-[550px] w-full rounded-[32px] text-center px-10 py-[60px]">
                <div className="w-[100px] h-[100px] bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 text-red-500 border border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.3)]">
                    <XCircle size={48} strokeWidth={3} />
                </div>

                <h1 className="text-[36px] font-[900] text-white mb-3 tracking-tighter">
                    Payment <span className="text-red-500">Rejected</span>
                </h1>

                <p className="text-base text-text-muted mb-10 font-[500] leading-relaxed">
                    The transaction protocol was interrupted. Your payment could not be validated at this time.
                </p>

                <div className="glass-card text-[15px] text-red-500 mb-10 p-6 rounded-[20px] font-semibold bg-red-500/5">
                    {reason}
                </div>

                {paymentId && (
                    <div className="text-[13px] text-text-muted mb-10 font-[700] uppercase tracking-wider">
                        REFERENCE ID: <span className="font-mono text-primary bg-surface px-2.5 py-1 rounded-lg">{paymentId}</span>
                    </div>
                )}

                <div className="flex gap-5">
                    <button
                        onClick={() => navigate('/checkout')}
                        className="glass-card flex-1 p-[18px] bg-primary text-white border-none rounded-2xl text-[15px] font-[800] flex items-center justify-center gap-3 cursor-pointer hover:-translate-y-0.5 transition-all"
                    >
                        <RefreshCw size={20} />
                        RETRY SESSION
                    </button>

                    <button
                        onClick={() => navigate('/help')}
                        className="glass-card flex-1 p-[18px] bg-bg-primary text-white border-none rounded-2xl text-[15px] font-[800] flex items-center justify-center gap-3 cursor-pointer hover:bg-white/5 transition-all"
                    >
                        <MessageCircle size={20} /> SUPPORT HUB
                    </button>
                </div>
            </div>
        </div>
    );
}
