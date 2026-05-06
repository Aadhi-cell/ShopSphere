import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { Check, Clock, Package, ArrowRight, ShoppingBag } from 'lucide-react';

export default function OrderSuccessModal({ show, orderId, paymentIntentId, onClose, variant = 'success' }) {
    const navigate = useNavigate();
    const { clearCart } = useCart();

    if (!show) return null;

    const handleNavigate = (path) => {
        clearCart(); // Clear cart when leaving the modal
        navigate(path);
    };

    const isDelayed = variant === 'delayed';

    // Generate a reference ID from payment intent if order ID is missing
    const referenceId = orderId || (paymentIntentId ? `REF-PI_${paymentIntentId.slice(-8).toUpperCase()}` : 'PENDING...');

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[4px] flex items-center justify-center z-[2000] animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-white rounded-3xl w-[90%] max-w-[450px] p-[40px_32px] text-center shadow-2xl relative animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)]">
                {/* Animation Circle */}
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 relative ${isDelayed ? 'bg-amber-50' : 'bg-emerald-50'}`}>
                    <div className={`animate-[scaleIn_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)] ${isDelayed ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {isDelayed ? <Clock size={40} strokeWidth={3} /> : <Check size={40} strokeWidth={3} />}
                    </div>
                    {/* Pulse Effect */}
                    <div className={`absolute inset-0 rounded-full border-2 animate-ping opacity-20 ${isDelayed ? 'border-amber-600' : 'border-emerald-600'}`} />
                </div>

                <h2 className="m-0 mb-3 text-2xl font-[800] text-slate-900 tracking-tight">
                    {isDelayed ? 'Payment Successful' : 'Order Placed Successfully!'}
                </h2>

                <p className="m-0 mb-6 text-[15px] text-slate-500 leading-relaxed font-medium">
                    {isDelayed
                        ? 'Your payment was received, but order confirmation is taking longer than usual. It will appear in your history shortly.'
                        : 'Thank you for your purchase. Your order has been securely processed.'}
                </p>

                <div className="bg-slate-50 rounded-xl p-4 mb-8 border border-slate-200">
                    <div className="text-[12px] text-slate-500 uppercase tracking-wider mb-1 font-bold">{orderId ? 'Order ID' : 'Payment Reference'}</div>
                    <div className="text-[18px] font-bold text-slate-800 font-mono tracking-tight">{referenceId}</div>
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => handleNavigate('/orders')}
                        className="w-full p-4 border-none rounded-xl text-base font-[800] cursor-pointer transition-all flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(40,116,240,0.2)]"
                        style={{ background: '#2874f0', color: '#ffffff' }}
                    >
                        <Package size={18} /> Tracking & Details
                    </button>

                    <button
                        onClick={() => handleNavigate('/')}
                        className="w-full p-4 bg-transparent text-slate-500 border border-slate-200 rounded-xl text-base font-[700] cursor-pointer transition-all hover:bg-slate-50 hover:text-slate-900 flex items-center justify-center gap-2"
                    >
                        <ShoppingBag size={18} /> Continue Shopping
                    </button>
                </div>

                {/* Global Styles for Keyframes - Keeping them for the custom animations */}
                <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes scaleIn { from { transform: scale(0); } to { transform: scale(1); } }
        `}</style>
            </div>
        </div>
    );
}
