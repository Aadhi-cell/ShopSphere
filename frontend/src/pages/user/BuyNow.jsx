import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { getUser } from '../../auth';
import {
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  Package,
  Truck,
  CreditCard,
  CheckCircle2
} from 'lucide-react';
import { getImageUrl } from '../../utils/imageConfig';

const formatINR = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);

export default function BuyNow() {
  const navigate = useNavigate();
  const { cart, getCartTotal, getCartCount } = useCart();
  const currentUser = getUser();

  useEffect(() => {
    // Admin cannot purchase
    if (currentUser?.role === 'admin') {
      navigate('/admin', { replace: true });
      return;
    }
    if (cart.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [cart.length, navigate, currentUser?.role]);

  if (currentUser?.role === 'admin' || cart.length === 0) return null;

  const total = getCartTotal();
  const itemCount = getCartCount();

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-8 md:py-16">
      <div className="max-w-[1000px] mx-auto">
        {/* Navigation Breadcrumb-style Back Button */}
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center gap-2 text-slate-500 hover:text-[#2874f0] font-black text-[12px] uppercase tracking-wider mb-8 transition-all group"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Shopping Cart
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">

          {/* Left Column: Product Review */}
          <div className="space-y-6">
            <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-slate-200/60 transition-all hover:shadow-md">
              <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#2874f0]">
                    <Package size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Review Items</h2>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                      {itemCount} Item{itemCount > 1 ? 's' : ''} in your order
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
                {cart.map((item) => (
                  <div key={item._id || item.id} className="flex gap-5 group items-center">
                    <div className="w-24 h-24 bg-slate-50 rounded-[20px] border border-slate-100 p-3 flex-shrink-0 relative overflow-hidden">
                      <img
                        src={getImageUrl(item.imageUrl)}
                        alt={item.name}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[15px] font-extrabold text-slate-800 line-clamp-1 group-hover:text-[#2874f0] transition-colors leading-tight">
                        {item.name}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {item.selectedSize && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold uppercase whitespace-nowrap">Size: {item.selectedSize}</span>
                        )}
                        {item.selectedColor && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold uppercase whitespace-nowrap">Color: {item.selectedColor}</span>
                        )}
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-[12px] text-slate-500 font-bold tracking-tight">
                          Qty: <span className="text-slate-900 font-black">{item.quantity}</span> × {formatINR(item.price)}
                        </div>
                        <div className="text-[16px] font-black text-slate-900">
                          {formatINR(item.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust Banner */}
            <div className="bg-[#f0f9ff] border border-blue-100 rounded-[24px] p-5 flex gap-4">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#2874f0] shrink-0">
                <ShieldCheck size={22} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black text-slate-900 tracking-tight">Purchase Protection</p>
                <p className="text-[12px] text-slate-600 font-medium leading-relaxed">
                  Your order is protected by our secure systems. In the next step, you will be prompted to enter your delivery address and complete payment.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="sticky top-12">
            <div className="bg-white rounded-[40px] p-8 md:p-10 shadow-premium border border-white relative overflow-hidden">
              {/* Background Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#2874f0]/[0.03] rounded-bl-[100px] -mr-10 -mt-10"></div>

              <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tighter relative z-10">
                Order <span className="text-[#2874f0]">Summary</span>
              </h2>

              <div className="space-y-5 mb-10 relative z-10">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase tracking-[2px] text-[10px]">Price ({itemCount} Item{itemCount > 1 ? 's' : ''})</span>
                  <span className="text-slate-900 font-black text-[15px]">{formatINR(total)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase tracking-[2px] text-[10px]">Delivery</span>
                  <span className="text-[#388e3c] font-black text-[11px] uppercase tracking-widest bg-[#388e3c]/10 px-2 py-0.5 rounded-md">Free</span>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-100">
                  <div className="flex justify-between items-end pb-1">
                    <span className="text-slate-500 font-black uppercase tracking-[3px] text-[11px]">Grand Total</span>
                    <span className="text-[32px] font-black text-slate-900 leading-none tracking-tighter">
                      {formatINR(total)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full h-[72px] bg-[#2874f0] text-white rounded-[24px] font-black text-[17px] shadow-[0_20px_40px_rgba(40,116,240,0.25)] hover:bg-[#1260e0] hover:translate-y-[-2px] active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 uppercase tracking-wider group relative z-10"
              >
                Continue to Payment
                <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform duration-300" />
              </button>

              <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-center gap-8 saturate-0 opacity-30 grayscale transition-all hover:opacity-100 hover:saturate-100 hover:grayscale-0 relative z-10">
                <Truck size={20} />
                <CreditCard size={18} />
                <CheckCircle2 size={18} />
              </div>
            </div>

            {/* Quick Support Badge */}
            <div className="mt-6 text-center">
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Need help? <span className="text-[#2874f0] cursor-pointer hover:underline">Contact Support</span></p>
            </div>
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .shadow-premium {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.02);
        }
      `}} />
    </div>
  );
}


