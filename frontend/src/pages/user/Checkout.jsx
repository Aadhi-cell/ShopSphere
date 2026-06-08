import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import OrderSuccessModal from '../../components/ui/OrderSuccessModal';
import { createCheckoutSession, confirmSession, getUserProfile, updateUserProfile, getPublicSettings } from '../../api/userApi';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  ChevronLeft,
  CreditCard,
  Phone,
  User,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Star,
  Package,
  ChevronDown
} from 'lucide-react';
import { getImageUrl } from '../../utils/imageConfig';

const formatINR = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
const formatDisplayINR = (price) => formatINR(price);

export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cart, getCartTotal, updateQuantity, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1); // 1: Login (Summary only), 2: Address, 3: Summary, 4: Payment
  const [address, setAddress] = useState(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [loadingSecret, setLoadingSecret] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalVariant, setModalVariant] = useState('success');
  const [placedOrderId, setPlacedOrderId] = useState(null);
  const [placedPaymentIntentId, setPlacedPaymentIntentId] = useState(null);
  const [platformFee, setPlatformFee] = useState(7);

  // Dynamic price calculations
  const total = getCartTotal();
  const mrpTotal = cart.reduce((acc, item) => acc + (item.price * 1.25 * item.quantity), 0);
  const totalDiscount = mrpTotal - total;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        // Fetch public settings for dynamic platform fee
        getPublicSettings().then(settings => {
          if (settings && settings.platformFee !== undefined) {
            setPlatformFee(settings.platformFee);
          }
        }).catch(err => console.error("Failed to load platform fee settings:", err));

        const profile = await getUserProfile();
        if (profile && profile.address && Object.keys(profile.address).length > 0) {
          setAddress({
            fullName: profile.fullName || '',
            phone: profile.phone || '',
            ...profile.address,
            label: 'HOME'
          });
          setCurrentStep(3); // Start at summary if address exists
        } else {
          setAddress({
            fullName: profile?.fullName || '',
            phone: profile?.phone || '',
            line1: '', line2: '', city: '', state: '', postalCode: '', label: 'HOME'
          });
          setCurrentStep(2);
          setIsEditingAddress(true);
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        // Fallback if fetch fails so user is not stuck on step 1
        setAddress({
          fullName: '',
          phone: '',
          line1: '', line2: '', city: '', state: '', postalCode: '', label: 'HOME'
        });
        setCurrentStep(2);
        setIsEditingAddress(true);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  const processingSession = useRef(false);

  useEffect(() => {
    const isSuccess = searchParams.get('success');
    const sessionId = searchParams.get('session_id');

    if (isSuccess === 'true' && !processingSession.current) {
      if (sessionId) {
        processingSession.current = true;
        setModalVariant('verifying');
        setShowSuccessModal(true);

        let retries = 0;
        const maxRetries = 5;

        const checkSession = async () => {
          try {
            const res = await confirmSession(sessionId);
            if (res && res.orderId) {
              setPlacedOrderId(res.orderId);
              setModalVariant('success');
              if (cart.length > 0) {
                clearCart();
              }
              return true;
            }
          } catch (err) {
            console.error("Session check attempt failed:", err);
          }
          return false;
        };

        const poll = async () => {
          const success = await checkSession();
          if (success) return;

          const interval = setInterval(async () => {
            retries++;
            const success = await checkSession();
            if (success || retries >= maxRetries) {
              clearInterval(interval);
              if (!success) {
                setModalVariant('delayed');
                if (cart.length > 0) {
                  clearCart();
                }
              }
            }
          }, 2000);
        };

        poll();
      } else {
        setModalVariant('success');
        setShowSuccessModal(true);
        if (cart.length > 0) clearCart();
      }
    }
  }, [searchParams, cart.length, clearCart]);

  useEffect(() => {
    if (cart.length === 0 && !showSuccessModal && searchParams.get('success') !== 'true') {
      navigate('/');
    }
  }, [cart.length, navigate, showSuccessModal, searchParams]);

  const handleProceedToPayment = async () => {
    if (!address || !cart.length) return;
    try {
      setLoadingSecret(true);
      const data = await createCheckoutSession({
        items: cart.map(i => ({ id: i.id || i._id, quantity: i.quantity })),
        address,
        domainUrl: window.location.origin
      });
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Session error:", err);
      alert(err.response?.data?.message || err.message || "Failed to initialize payment. Please try again.");
      setLoadingSecret(false);
    }
  };

  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    setIsEditingAddress(false);
    setCurrentStep(3);
    try {
      await updateUserProfile({
        address: {
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode
        }
      });
    } catch (e) { }
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F1F3F6]">
        <div className="w-10 h-10 border-4 border-[#2874f0] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F3F6] pb-12 font-sans overflow-x-hidden">
      <div className="max-w-[1248px] mx-auto px-4 pt-16 pb-8 flex flex-col lg:flex-row gap-4 items-start">

        {/* Left Column: Sections Accordion */}
        <div className="flex-1 w-full space-y-4">

          {/* Section 1: LOGIN */}
          <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between text-[#878787] font-bold">
              <div className="flex items-center gap-4">
                <span className="w-5 h-5 bg-gray-100 flex items-center justify-center text-[11px] text-[#2874f0] rounded-sm">1</span>
                <div className="flex flex-col">
                  <span className="uppercase text-[14px]">Login</span>
                  <div className="text-[13px] font-medium lowercase flex items-center gap-2 text-black mt-1">
                    <span className="font-bold">Aadhi</span> <span className="text-gray-400">|</span> <span>+91 6385577657</span>
                  </div>
                </div>
              </div>
              <button disabled className="text-[#2874f0] font-bold text-[13px] px-6 py-2 border border-blue-50 bg-blue-50/20 uppercase rounded-sm">Change</button>
            </div>
          </div>

          {/* Section 2: DELIVERY ADDRESS */}
          <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
            <div className={`px-6 py-4 flex items-center justify-between ${currentStep === 2 ? 'bg-[#2874f0]' : 'bg-white'}`}>
              <div className="flex items-center gap-4">
                <span className={`w-5 h-5 flex items-center justify-center text-[11px] rounded-sm font-bold ${currentStep === 2 ? 'bg-white text-[#2874f0]' : 'bg-gray-100 text-[#2874f0]'}`}>2</span>
                <div className="flex flex-col">
                  <h2 className={`text-sm font-bold uppercase tracking-tight ${currentStep === 2 ? 'text-white' : 'text-gray-500'}`}>Delivery Address</h2>
                  {currentStep > 2 && address && (
                    <p className="text-[13px] text-gray-900 font-medium mt-1">
                      <span className="font-bold">{address.fullName}</span>, {address.line1}, {address.city}, {address.state} - {address.postalCode}
                    </p>
                  )}
                </div>
              </div>
              {currentStep > 2 && (
                <button onClick={() => { setCurrentStep(2); setIsEditingAddress(true); }} className="text-[#2874f0] font-bold text-[13px] px-6 py-2 border border-gray-100 rounded-sm hover:shadow-sm uppercase">Change</button>
              )}
            </div>

            {currentStep === 2 && (
              <div className="p-6 bg-[#f5faff] border-t border-gray-100 animate-slide-down">
                <form onSubmit={handleUpdateAddress} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input required placeholder="Full Name" className="p-3 border rounded-sm outline-none focus:border-[#2874f0] text-[14px]" value={address.fullName} onChange={e => setAddress({ ...address, fullName: e.target.value })} />
                    <input required placeholder="Phone Number" className="p-3 border rounded-sm outline-none focus:border-[#2874f0] text-[14px]" value={address.phone} onChange={e => setAddress({ ...address, phone: e.target.value })} />
                  </div>
                  <input required placeholder="Address (House No, Building, Street, Area)" className="w-full p-3 border rounded-sm outline-none focus:border-[#2874f0] text-[14px]" value={address.line1} onChange={e => setAddress({ ...address, line1: e.target.value })} />
                  <input placeholder="Locality / Landmark (Optional)" className="w-full p-3 border rounded-sm outline-none focus:border-[#2874f0] text-[14px]" value={address.line2} onChange={e => setAddress({ ...address, line2: e.target.value })} />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input required placeholder="City" className="p-3 border rounded-sm outline-none focus:border-[#2874f0] text-[14px]" value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} />
                    <input required placeholder="State" className="p-3 border rounded-sm outline-none focus:border-[#2874f0] text-[14px]" value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })} />
                    <input required placeholder="Pincode" className="p-3 border rounded-sm outline-none focus:border-[#2874f0] text-[14px]" value={address.postalCode} onChange={e => setAddress({ ...address, postalCode: e.target.value })} />
                  </div>
                  <button type="submit" className="px-12 py-3.5 bg-[#fb641b] text-white font-black rounded-sm shadow-md hover:bg-[#f4511e] uppercase text-[15px]">Save and Deliver Here</button>
                </form>
              </div>
            )}
          </div>

          {/* Section 3: ORDER SUMMARY */}
          <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
            <div className={`px-6 py-4 flex items-center justify-between ${currentStep === 3 ? 'bg-[#2874f0]' : 'bg-white'}`}>
              <div className="flex items-center gap-4">
                <span className={`w-5 h-5 flex items-center justify-center text-[11px] rounded-sm font-bold ${currentStep === 3 ? 'bg-white text-[#2874f0]' : 'bg-gray-100 text-[#2874f0]'}`}>3</span>
                <div className="flex flex-col">
                  <h2 className={`text-sm font-bold uppercase tracking-tight ${currentStep === 3 ? 'text-white' : 'text-gray-500'}`}>Order Summary</h2>
                  {currentStep > 3 && (
                    <p className="text-[13px] text-gray-900 font-bold mt-1 uppercase tracking-tighter">{cart.length} Item{cart.length > 1 ? 's' : ''}</p>
                  )}
                </div>
              </div>
              {currentStep > 3 && (
                <button onClick={() => setCurrentStep(3)} className="text-[#2874f0] font-bold text-[13px] px-6 py-2 border border-gray-100 rounded-sm hover:shadow-sm uppercase">Change</button>
              )}
            </div>

            {currentStep === 3 && (
              <div className="divide-y divide-gray-100 animate-slide-down">
                {cart.map((item) => (
                  <div key={item._id || item.id} className="p-6 flex gap-7">
                    <div className="w-32 flex flex-col items-center gap-4">
                      <div className="w-24 h-24 flex items-center justify-center bg-white p-2">
                        <img src={getImageUrl(item.imageUrl)} alt="" className="max-w-full max-h-full object-contain" />
                      </div>
                      <div className="flex items-center border border-gray-200 rounded-full shadow-sm bg-white overflow-hidden scale-90">
                        <button onClick={() => updateQuantity(item._id || item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center font-bold text-gray-400 hover:text-black hover:bg-gray-50">-</button>
                        <span className="w-10 h-8 flex items-center justify-center text-[13px] font-black border-x border-gray-200">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item._id || item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center font-bold text-gray-400 hover:text-black hover:bg-gray-50">+</button>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-1 pr-4">
                      <h3 className="text-[15px] text-gray-900 leading-tight line-clamp-2 hover:text-[#2874f0] cursor-pointer font-medium">{item.name}</h3>
                      <p className="text-[12px] text-[#878787] font-medium">
                        {item.selectedColor && `Color: ${item.selectedColor}`}{item.selectedSize && `, Size: ${item.selectedSize}`}
                      </p>
                      <div className="flex items-center gap-2 mt-4">
                        <span className="text-[#878787] line-through text-[14px]">{formatDisplayINR(item.price * 1.25)}</span>
                        <span className="text-[18px] font-bold text-gray-900 leading-none">{formatDisplayINR(item.price)}</span>
                        <span className="text-[#388e3c] text-[13px] font-bold">20% Off</span>
                      </div>
                      <p className="text-[13px] text-gray-900 mt-5 font-medium flex items-center gap-2">
                        Delivery by Tomorrow, {new Date(Date.now() + 86400000).toLocaleDateString('en-US', { weekday: 'short' })} | <span className="text-[#388e3c] font-bold text-[13px]">FREE Delivery</span>
                      </p>
                    </div>
                  </div>
                ))}

                <div className="bg-gray-50/10 p-6 flex items-start gap-4 border-t border-gray-100">
                  <Package size={20} className="text-[#ff9f00] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[14px] text-gray-800 font-bold mb-1">Rest assured with Open Box Delivery</p>
                    <p className="text-[12px] text-gray-500 leading-normal font-medium max-w-lg">Agent will open the package so you can check for correct product, damage or missing items. Share OTP to accept the delivery.</p>
                  </div>
                </div>

                <div className="p-6 flex items-center justify-end bg-white border-t border-gray-100 shadow-[0_-4px_10px_rgba(0,0,0,0.03)] z-50">
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="px-16 py-3.5 bg-[#fb641b] text-white rounded-sm font-black text-[15px] shadow-lg hover:bg-[#f4511e] transition-all uppercase tracking-wider"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: PAYMENT OPTIONS */}
          <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
            <div className={`px-6 py-4 flex items-center gap-4 ${currentStep === 4 ? 'bg-[#2874f0]' : 'bg-white'}`}>
              <span className={`w-5 h-5 flex items-center justify-center text-[11px] rounded-sm font-bold ${currentStep === 4 ? 'bg-white text-[#2874f0]' : 'bg-gray-100 text-[#2874f0]'}`}>4</span>
              <h2 className={`text-sm font-bold uppercase tracking-tight ${currentStep === 4 ? 'text-white' : 'text-gray-500'}`}>Payment Options</h2>
            </div>
            {currentStep === 4 && (
              <div className="p-6 flex flex-col items-center justify-center text-center gap-6 animate-slide-down">
                <div>
                  <div className="w-16 h-16 bg-blue-50 text-[#2874f0] rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck size={32} />
                  </div>
                  <h3 className="text-[18px] font-black text-gray-900 mb-1">Secure Payment with Stripe</h3>
                  <p className="text-[14px] text-gray-500 font-medium">You will be redirected to Stripe's highly secure payment interface.</p>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                  <button type="button" disabled={loadingSecret} onClick={() => setCurrentStep(3)} className="px-8 py-3.5 border border-gray-200 text-gray-700 font-bold rounded-sm hover:bg-gray-50 uppercase text-sm w-full md:w-auto">
                    Back
                  </button>
                  <button
                    onClick={handleProceedToPayment}
                    disabled={loadingSecret}
                    className={`px-12 py-3.5 bg-[#fb641b] text-white rounded-sm font-black text-base shadow-md transition-all uppercase w-full md:w-auto ${loadingSecret ? 'opacity-70' : 'hover:bg-[#f4511e]'}`}
                  >
                    {loadingSecret ? 'REDIRECTING...' : `PAY ${formatINR(total + platformFee)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Price Details Sidebar */}
        <aside className="w-full lg:w-[380px] lg:flex-none flex flex-col gap-4 sticky top-[calc(var(--header-height)+20px)] z-40 hide-mobile">
          <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-[#878787] text-[14px] font-bold uppercase tracking-wider">Price Details</h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-[1fr_auto] gap-4 items-center text-[15px]">
                <span className="text-gray-900 font-medium">Price ({cart.length} item{cart.length > 1 ? 's' : ''})</span>
                <span className="text-gray-900 font-medium text-right">{formatDisplayINR(mrpTotal)}</span>
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-4 items-center text-[15px]">
                <span className="text-gray-900 font-medium">Discount</span>
                <span className="text-[#388e3c] font-bold text-right">-{formatDisplayINR(totalDiscount)}</span>
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-4 items-center text-[15px]">
                <span className="text-gray-900 font-medium">Platform Fee</span>
                <span className="text-gray-900 font-medium text-right">{formatDisplayINR(platformFee)}</span>
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-4 items-center text-[15px]">
                <span className="text-gray-900 font-medium">Delivery Charges</span>
                <span className="text-[#388e3c] font-bold uppercase text-[12px] text-right">Free</span>
              </div>

              <div className="pt-5 border-t border-dashed border-gray-200">
                <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
                  <span className="text-[18px] font-black text-gray-900 tracking-tighter">Total Amount</span>
                  <span className="text-[18px] font-black text-gray-900 tracking-tighter text-right">{formatDisplayINR(total + platformFee)}</span>
                </div>
              </div>
              <div className="mt-4 bg-[#f6fff7] p-3 rounded-sm border border-[#e0f3e2]">
                <p className="text-[#388e3c] font-bold text-[14px] text-center">You will save {formatDisplayINR(totalDiscount)} on this order</p>
              </div>
            </div>
          </div>
          <div className="mt-6 px-1 flex justify-start items-start gap-3.5 text-gray-400">
            <ShieldCheck size={28} className="shrink-0" />
            <p className="text-[11px] font-bold uppercase tracking-widest leading-loose flex-1">Safe and secure payments. 100% Authentic products.</p>
          </div>
        </aside>
      </div>

      <OrderSuccessModal show={showSuccessModal} orderId={placedOrderId} paymentIntentId={placedPaymentIntentId} variant={modalVariant} onClose={() => setShowSuccessModal(false)} />

      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-mobile { display: flex; } .hide-desktop { display: none; }
        @media (max-width: 1024px) { .hide-mobile { display: none !important; } .hide-desktop { display: flex !important; } }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .animate-slide-down { animation: slideDown 0.3s ease-out; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}
