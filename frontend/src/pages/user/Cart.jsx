import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { getUser } from '../../auth';
import useMobile from '../../hooks/useMobile';
import {
  ShoppingBag,
  Trash2,
  ChevronLeft,
  ShieldCheck,
  Truck,
  RotateCcw,
  Lock,
  Minus,
  Plus
} from 'lucide-react';
import { getImageUrl } from '../../utils/imageConfig';

const formatINR = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
const formatDisplayINR = (price) => formatINR(price);

export default function Cart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, addToCart, getCartTotal, getCartCount } = useCart();
  const isMobile = useMobile();

  const user = getUser();

  // Admin cannot purchase — show a dedicated notice
  if (user?.role === 'admin') {
    return (
      <div className={`min-h-[80vh] bg-gray-50/50 flex items-center justify-center ${isMobile ? 'px-4 py-10' : 'px-8 py-20'}`}>
        <div className="bg-white max-w-lg w-full mx-auto rounded-2xl border border-gray-200 p-8 md:p-12 shadow-sm text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={40} className="text-red-500" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
            Admin accounts cannot shop
          </h2>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            Admin accounts are for platform management only. To place orders, please log out and sign in with a customer account.
          </p>
          <button
            onClick={() => navigate('/admin')}
            className="w-full py-3.5 bg-primary text-white rounded-xl font-semibold shadow-sm hover:bg-primary/90 transition-all"
          >
            Go to Admin Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className={`min-h-[80vh] bg-gray-50/50 flex items-center justify-center ${isMobile ? 'px-4 py-10' : 'px-8 py-20'}`}>
        <div className="bg-white max-w-lg w-full mx-auto rounded-2xl border border-gray-200 p-8 md:p-12 shadow-sm text-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={48} className="text-gray-300" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">Your Cart is Empty</h2>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            Looks like you haven't added anything yet. Discover our latest collections and find something perfect.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3.5 bg-primary text-white rounded-xl font-semibold shadow-sm hover:bg-primary/90 transition-all"
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  const total = getCartTotal();
  const itemCount = getCartCount();
  const hasOutOfStock = cart.some(item => item.stock <= 0 || item.status === 'out-of-stock');

  return (
    <div className={`min-h-screen bg-gray-50/50 ${isMobile ? 'px-4 py-8' : 'px-8 py-10'}`}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 border-b border-gray-200 pb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
              <ShoppingBag className="text-primary hidden sm:block" size={28} />
              Shopping Cart
            </h1>
          </div>
        </div>

        <div className={`grid gap-6 lg:gap-8 items-start lg:grid-cols-[1.8fr_1fr]`}>
          {/* Cart Items List */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100">
              {cart.map((item, index) => {
                const candidates = [getImageUrl(item.imageUrl)];

                return (
                  <div
                    key={item._id || item.id}
                    className="flex flex-row gap-4 sm:gap-6 p-4 sm:p-6"
                  >
                    {/* Image Section */}
                    <div className="flex-shrink-0 w-20 h-20 sm:w-32 sm:h-32 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden relative">
                      <img
                        src={candidates[0]}
                        onError={(e) => {
                          const img = e.currentTarget;
                          const list = candidates;
                          let idx = parseInt(img.dataset.idx || '0', 10) + 1;
                          if (idx < list.length) {
                            img.dataset.idx = String(idx);
                            img.src = list[idx];
                          } else {
                            img.onerror = null;
                            img.src = 'https://via.placeholder.com/200x200/f8fafc/94a3b8?text=Product';
                          }
                        }}
                        alt={item.name}
                        className="w-full h-full object-contain p-2"
                      />
                    </div>

                    {/* Info Section */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:mb-2 gap-2">
                        <div className="flex-1 pr-0 sm:pr-4">
                          <h3 className="font-bold text-gray-900 text-[14px] sm:text-lg leading-tight mb-1 line-clamp-2">
                            {item.name}
                          </h3>
                          <div className="flex flex-wrap gap-2 items-center text-xs sm:text-sm">
                            <span className="text-gray-500 font-medium">
                              {item.brand || 'Premium Edition'}
                            </span>
                          </div>

                          {(item.selectedColor || item.selectedSize) && (
                            <div className="flex flex-wrap gap-2 mt-1 sm:mt-2">
                              {item.selectedColor && (
                                <span className="text-[10px] sm:text-xs text-gray-600 bg-gray-100 px-2 py-0.5 sm:py-1 rounded-md max-w-full truncate">
                                  Color: {item.selectedColor}
                                </span>
                              )}
                              {item.selectedSize && (
                                <span className="text-[10px] sm:text-xs text-gray-600 bg-gray-100 px-2 py-0.5 sm:py-1 rounded-md max-w-full truncate">
                                  Size: {item.selectedSize}
                                </span>
                              )}
                            </div>
                          )}

                          {(item.stock <= 0 || item.status === 'out-of-stock') && (
                            <div className="mt-2">
                              <span className="inline-flex text-[10px] sm:text-xs bg-red-50 text-red-600 font-semibold px-2 py-1 rounded-md">
                                Out of Stock
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-[15px] sm:text-lg font-bold text-gray-900 whitespace-nowrap">
                          {formatDisplayINR(item.price * item.quantity)}
                        </div>
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-4">
                        <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200">
                          <button
                            onClick={() => updateQuantity(item._id || item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-gray-600 bg-white rounded-md border border-gray-200 shadow-sm hover:text-primary transition-colors disabled:opacity-50"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-10 text-center font-semibold text-gray-900 text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => addToCart(item)}
                            className="w-8 h-8 flex items-center justify-center text-gray-600 bg-white rounded-md border border-gray-200 shadow-sm hover:text-primary transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        {/* <button
                          onClick={() => removeFromCart(item._id || item.id)}
                          className="text-red-500 hover:text-red-600 flex items-center gap-1.5 text-sm font-semibold transition-colors bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg"
                        >
                          <Trash2 size={16} />
                          <span className="hidden sm:inline">Remove</span>
                        </button> */}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Checkout Side Panel */}
          <div className="sticky top-24">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Subtotal ({itemCount} items)</span>
                  <span className="font-semibold text-gray-900">{formatINR(total)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-emerald-600 tracking-wide">FREE</span>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-gray-900">{formatINR(total)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {getUser()?.role === 'admin' ? (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-center">
                    <ShieldCheck className="mx-auto text-red-500 mb-2" size={24} />
                    <div className="font-bold text-red-700 text-sm mb-1">Admin Account</div>
                    <div className="text-xs text-red-600">Admin accounts cannot place orders. Use a customer account to shop.</div>
                  </div>
                ) : (
                  <>
                    {hasOutOfStock && (
                      <div className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl text-sm font-medium flex gap-3 items-start">
                        <span className="text-lg">⚠️</span>
                        <p>Some items are out of stock. Please remove them to proceed.</p>
                      </div>
                    )}
                    <button
                      onClick={() => { if (!hasOutOfStock) { navigate('/buy-now'); window.scrollTo(0, 0); } }}
                      disabled={hasOutOfStock}
                      className={`w-full py-3.5 rounded-xl font-semibold shadow-sm transition-all flex items-center justify-center gap-2 ${hasOutOfStock ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary/90'}`}
                    >
                      <ShieldCheck size={20} />
                      {hasOutOfStock ? 'Remove Out Of Stock' : 'Checkout'}
                    </button>
                    <button
                      onClick={() => navigate('/')}
                      className="w-full py-3.5 bg-white text-gray-600 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                    >
                      <ChevronLeft size={18} />
                      Continue Shopping
                    </button>
                  </>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 text-gray-400 flex items-center justify-center gap-6">
                <Truck size={20} className="hover:text-gray-600 transition-colors" />
                <RotateCcw size={18} className="hover:text-gray-600 transition-colors" />
                <Lock size={18} className="hover:text-gray-600 transition-colors" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
