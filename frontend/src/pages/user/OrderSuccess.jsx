import React, { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { getOrderById } from '../../api/userApi';

export default function OrderSuccess() {
    const params = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { clearCart } = useCart();

    const [order, setOrder] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [orderId, setOrderId] = React.useState(null); // Assuming orderId state exists

    const redirectStatus = searchParams.get('redirect_status');

    useEffect(() => {
        if (redirectStatus === 'failed') {
            navigate('/payment-failure?reason=Payment authentication failed.');
            return;
        }
        clearCart();
    }, [clearCart, redirectStatus, navigate]);

    useEffect(() => {
        // If we already have the full order object, no need to do anything
        if (order) return;

        // Case 1: Direct access via Order ID (e.g. history)
        if (params.orderId && params.orderId !== 'pending') {
            setLoading(true);
            getOrderById(params.orderId)
                .then(data => {
                    setOrder(data);
                    setOrderId(data.id);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Failed to fetch order", err);
                    setError("Could not retrieve order details.");
                    setLoading(false);
                });
            return;
        }

        // Case 3: No ID -> Invalid
        if (!params.orderId || params.orderId === 'pending') {
            setError("Invalid order details");
            setLoading(false);
        }

    }, [params.orderId, order]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-primary px-6 py-[60px]">
            <div className="glass-panel max-w-[650px] w-full rounded-[32px] text-center p-[60px]">
                <div className="w-[100px] h-[100px] bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-500 border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                    <CheckCircle size={48} strokeWidth={3} />
                </div>

                <h1 className="text-[36px] font-[900] text-white mb-3 tracking-tight">
                    Order <span className="text-emerald-500">Placed Successfully</span>
                </h1>

                <p className="text-base text-text-muted mb-10 font-[500]">
                    Thank you for your purchase. Your items are being prepared for shipment.
                </p>

                {error ? (
                    <div className="text-red-500 mb-8 text-[14px] bg-red-500/10 p-4 rounded-xl border border-red-500/20 font-semibold">
                        {error}
                    </div>
                ) : loading ? (
                    <div className="flex flex-col items-center gap-4 p-10">
                        <div className="w-10 h-10 border-[3px] border-surface border-t-emerald-500 rounded-full animate-spin"></div>
                        <span className="text-[14px] text-text-muted font-[600] uppercase tracking-wider">Confirming Your Order...</span>
                    </div>
                ) : order ? (
                    <div className="glass-card text-left p-8 mb-10 rounded-3xl">
                        <div className="flex justify-between mb-6 pb-6 border-b border-glass-border">
                            <div>
                                <div className="text-[11px] text-text-muted uppercase tracking-[2px] font-[900] mb-2">Order Number</div>
                                <div className="font-mono font-[800] text-primary text-[15px]">#{order.id.slice(-12).toUpperCase()}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[11px] text-text-muted uppercase tracking-[2px] font-[900] mb-2">Total Paid</div>
                                <div className="font-[900] text-white text-2xl">₹{order.total.toLocaleString()}</div>
                            </div>
                        </div>

                        {order.address && (
                            <div className="mb-6">
                                <div className="text-[11px] text-text-muted uppercase tracking-[2px] font-[900] mb-3">Shipping Address</div>
                                <div className="text-[15px] text-white leading-relaxed font-[500]">
                                    {order.address.fullName}<br />
                                    <span className="text-text-muted">{order.address.line1}, {order.address.city}</span><br />
                                    <span className="text-text-muted">{order.address.state} - {order.address.postalCode}</span>
                                </div>
                            </div>
                        )}

                        {order.items && order.items.length > 0 && (
                            <div>
                                <div className="text-[11px] text-text-muted uppercase tracking-[2px] font-[900] mb-4">Order Summary</div>
                                <div className="flex flex-col gap-3">
                                    {order.items.map((item, i) => (
                                        <div key={i} className="flex justify-between text-sm font-semibold">
                                            <span className="text-white">{item.quantity}x {item.name}</span>
                                            <span className="text-primary font-[800]">₹{(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}

                <div className="flex gap-5">
                    <button
                        onClick={() => navigate('/')}
                        className="glass-card flex-1 p-[18px] bg-primary text-white border-none rounded-2xl text-[15px] font-[800] cursor-pointer flex items-center justify-center gap-3 shadow-[0_10px_20px_rgba(99,102,241,0.2)] hover:-translate-y-0.5 transition-all"
                    >
                        <ShoppingBag size={20} /> CONTINUE SHOPPING
                    </button>

                    <button
                        onClick={() => navigate('/orders')}
                        className="glass-card flex-1 p-[18px] bg-bg-primary text-white border-none rounded-2xl text-[15px] font-[800] cursor-pointer flex items-center justify-center gap-3 hover:bg-white/5 transition-all"
                    >
                        TRACK SHIPMENT <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
