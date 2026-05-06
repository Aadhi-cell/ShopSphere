import React, { useEffect, useState } from 'react';
import { getProductById, getProductReviews, getProducts } from '../../api/productApi';
import { checkDelivery } from '../../api/userApi';
import { useParams, useNavigate } from 'react-router-dom';

import {
  Heart,
  ShoppingBag,
  ShoppingCart,
  User,
  Star,
  ChevronLeft,
  RotateCcw,
  RefreshCcw,
  Home,
  ShieldCheck,
  Zap,
  Package,
  AlertCircle,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronRight,
  Info,
  Gift,
  Search
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { getUser } from '../../auth';
import useMobile from '../../hooks/useMobile';
import ImageGallery from '../../components/product/ImageGallery';
import { getImageUrl } from '../../utils/imageConfig';

const formatINR = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
const formatDisplayINR = (price) => formatINR(price);

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isMobile = useMobile();
  const [adminToast, setAdminToast] = useState(false);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);

  const [viewers, setViewers] = useState(Math.floor(Math.random() * (95 - 32 + 1) + 32));
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [pincodeError, setPincodeError] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState(null);
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setNotFound(false);
      setError(null);

      try {
        const productData = await getProductById(id);
        setProduct(productData);

        const colors = productData.color ? productData.color.split(',').map(c => c.trim()).filter(Boolean) : [];
        const sizes = productData.size ? productData.size.split(',').map(s => s.trim()).filter(Boolean) : [];

        if (colors.length > 0) setSelectedColor(colors[0]);
        if (sizes.length > 0) setSelectedSize(sizes[0]);

        try {
          const reviewsData = await getProductReviews(id);
          setReviews(reviewsData);
        } catch (revError) {
          console.warn('Failed to fetch reviews:', revError);
        }

        try {
          const related = await getProducts({ category: productData.category, limit: 10 });
          setRelatedProducts(related.filter(p => (p._id || p.id) !== id));
        } catch (relError) {
          console.warn('Failed to fetch related products:', relError);
        }
      } catch (e) {
        console.error('Failed to fetch product:', e);
        if (e.response?.status === 404) {
          setNotFound(true);
        } else {
          setError(e.message || 'Error loading product.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  useEffect(() => {
    const viewersInterval = setInterval(() => {
      setViewers(prev => {
        const change = Math.floor(Math.random() * 5) - 2;
        return Math.max(12, Math.min(150, prev + change));
      });
    }, 5000);
    return () => clearInterval(viewersInterval);
  }, [id]);

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / totalReviews).toFixed(1)
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => {
    const count = reviews.filter(r => Math.round(r.rating || 0) === star).length;
    return {
      star,
      count,
      percentage: totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
    };
  });

  const productImages = [
    product?.imageUrl,
    ...(product?.images || []).flatMap(img => typeof img === 'string' ? img.split(',').map(s => s.trim()) : [])
  ].filter(Boolean).map(img => getImageUrl(img));

  if (productImages.length === 0) {
    productImages.push('https://via.placeholder.com/600x600/f8fafc/94a3b8?text=No+Image+Available');
  }

  const checkPincode = async () => {
    if (pincode.length !== 6 || isNaN(pincode)) {
      setPincodeError('Please enter a valid 6-digit pincode');
      setDeliveryStatus(null);
      return;
    }

    setPincodeError('');
    setDeliveryStatus(null);
    setIsCheckingPincode(true);

    try {
      const data = await checkDelivery(pincode);
      if (data.available) {
        setDeliveryStatus({
          available: true,
          deliveryDate: data.deliveryDate,
          location: data.location,
          free: data.isFree
        });
      } else {
        setPincodeError(data.message || 'Service not available for this pincode.');
      }
    } catch (err) {
      setPincodeError(err.response?.data?.message || 'Error checking delivery.');
    } finally {
      setIsCheckingPincode(false);
    }
  };

  const breadcrumbs = product ? [
    { label: 'Home', path: '/' },
    { label: product.category || 'Shop', path: `/search?category=${product.category}` },
    { label: product.brand || 'Products', path: `/search?brand=${product.brand}` },
    { label: product.name }
  ] : [];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#F1F3F6] text-center p-20">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-[#2874f0] rounded-full animate-spin mb-6"></div>
        <h2 className="text-gray-900 text-2xl font-bold">Synchronizing Data...</h2>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#F1F3F6] text-center p-20">
        <h2 className="text-gray-900 text-3xl font-bold mb-4">Product Missing</h2>
        <button onClick={() => navigate('/')} className="px-8 py-3 bg-[#2874f0] text-white rounded-sm font-bold">Return to Home</button>
      </div>
    );
  }

  const isOutOfStock = (product.stock <= 0) || (product.status === 'out-of-stock');

  const showAdminToast = () => {
    setAdminToast(true);
    setTimeout(() => setAdminToast(false), 3000);
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    if (getUser()?.role === 'admin') { showAdminToast(); return; }
    addToCart({
      ...product,
      quantity,
      selectedColor,
      selectedSize
    });
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    if (getUser()?.role === 'admin') { showAdminToast(); return; }
    addToCart({
      ...product,
      quantity,
      selectedColor,
      selectedSize
    });
    navigate('/buy-now');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-12">
      <div className="bg-transparent py-4 px-4 md:px-8 mb-2">
        <div className="max-w-[1440px] mx-auto flex items-center gap-2 text-[12px] text-gray-500 overflow-x-auto whitespace-nowrap scrollbar-hide">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight size={12} className="text-gray-400 shrink-0" />}
              {crumb.path ? (
                <button onClick={() => navigate(crumb.path)} className="hover:text-[#2874f0] hover:underline shrink-0">
                  {crumb.label}
                </button>
              ) : (
                <span className="text-gray-900 font-medium truncate max-w-[200px] md:max-w-none">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6 relative items-start">
          <div className="w-full lg:w-[42%] flex flex-col gap-4 lg:sticky lg:top-28 z-10">
            <ImageGallery
              images={productImages}
              productName={product.name}
              isInWishlist={isInWishlist(product._id || product.id)}
              onToggleWishlist={() => toggleWishlist(product)}
            />
            {!isMobile && (
              <div className="flex gap-4 mt-4">
                <button onClick={handleAddToCart} disabled={isOutOfStock} className={`flex-1 h-14 rounded-[12px] font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 ${isOutOfStock ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed' : 'bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-50 active:scale-[0.98]'}`}>
                  <ShoppingBag size={20} /> {isOutOfStock ? 'SOLD OUT' : 'Add to Bag'}
                </button>
                <button onClick={handleBuyNow} disabled={isOutOfStock} className={`flex-1 h-14 rounded-[12px] font-bold text-lg flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition-all duration-300 ${isOutOfStock ? 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none' : 'bg-gray-900 text-white hover:bg-black hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)] active:scale-[0.98]'}`}>
                  <Zap size={20} /> {isOutOfStock ? 'UNAVAILABLE' : 'Buy it Now'}
                </button>
              </div>
            )}
          </div>

          <div className="w-full lg:w-[58%] flex flex-col gap-6 bg-white p-6 md:p-10 rounded-[24px] border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
            <div>
              <div className="flex items-center gap-3 mb-3">
                {product.brand && <span className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-full text-[11px] font-bold tracking-widest text-gray-600 uppercase cursor-pointer hover:bg-gray-100 hover:text-gray-900 transition-colors">{product.brand}</span>}
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${isOutOfStock ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                  {isOutOfStock ? 'Sold Out' : `In Stock • ${product.stock} Available`}
                </div>
              </div>
              <h1 className="text-2xl md:text-[32px] font-bold text-gray-900 tracking-tight leading-[1.2] mb-3">{product.name}</h1>
              <div className="flex items-center gap-4 flex-wrap">
                {totalReviews > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 text-amber-700 px-2.5 py-1 rounded-md text-[13px] font-bold">
                      <Star size={14} className="fill-amber-500 stroke-amber-500" /> {averageRating}
                    </div>
                    <span className="text-gray-500 text-[14px] font-medium hover:text-gray-900 cursor-pointer underline decoration-gray-300 underline-offset-4">{totalReviews.toLocaleString()} Reviews</span>
                  </div>
                )}
                {product.isVigilanceAssured && (
                  <div className="flex items-center gap-1.5 text-[13px] text-gray-600 font-medium bg-blue-50 px-2 py-1 rounded-md border border-blue-100"><ShieldCheck size={16} className="text-blue-500" /> Assured Quality</div>
                )}
              </div>
            </div>

            <div className="py-1">
              <div className="flex items-end gap-3 mb-1">
                <span className="text-[36px] font-black tracking-tighter text-gray-900 leading-none">{formatDisplayINR(product.price)}</span>
                {product.mrp && (
                  <>
                    <span className="text-gray-400 line-through text-lg font-medium mb-1">{formatDisplayINR(product.mrp)}</span>
                    <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded font-bold text-sm mb-1">{Math.round(((product.mrp - product.price) / product.mrp) * 100)}% off</span>
                  </>
                )}
              </div>
              <p className="text-[13px] text-gray-500 font-medium mt-2">Inclusive of all taxes. Free shipping on orders over ₹500.</p>
            </div>

            <div className="py-5 border-y border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                <span className="text-gray-900 text-sm font-bold flex items-center gap-2"><Truck size={18} className="text-gray-400" /> Delivery</span>
                <div className="relative flex-1 max-w-[320px]">
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter area pincode"
                    className={`w-full h-11 pl-4 pr-20 bg-gray-50 border rounded-[10px] text-[15px] font-medium outline-none transition-all focus:bg-white focus:ring-2 ${pincodeError ? 'border-rose-300 focus:ring-rose-100' : 'border-gray-200 focus:border-gray-300 focus:ring-gray-100'}`}
                  />
                  <button 
                    onClick={checkPincode} 
                    disabled={isCheckingPincode}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-4 bg-gray-900 text-white rounded-[6px] font-bold text-xs hover:bg-black transition-colors disabled:bg-gray-400"
                  >
                    {isCheckingPincode ? <RefreshCcw size={14} className="animate-spin" /> : 'Check'}
                  </button>
                </div>
              </div>
              {pincodeError && <p className="text-rose-500 text-sm font-semibold mt-2 sm:ml-[100px]">{pincodeError}</p>}
              {deliveryStatus && !pincodeError && (
                <div className="sm:ml-[100px] mt-3 flex flex-col gap-1.5 animate-fadeIn bg-emerald-50 border border-emerald-100 px-4 py-3 rounded-[12px] w-full max-w-[320px]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <p className="text-emerald-800 font-bold text-[14px]">Free Delivery available</p>
                  </div>
                  <div className="flex flex-col gap-0.5 pl-6">
                    <p className="text-emerald-700 text-[13px] font-medium">To: {deliveryStatus.location}</p>
                    <p className="text-emerald-900 text-[15px] font-black tracking-tight">Arriving {deliveryStatus.deliveryDate}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6 py-2">
              {product.color && (
                <div>
                  <h3 className="text-gray-900 text-[15px] font-bold mb-3 flex items-center gap-2">Select Color</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.color.split(',').map(c => c.trim()).map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-5 py-2.5 border-2 rounded-full text-[14px] font-bold transition-all ${selectedColor === color ? 'border-gray-900 text-gray-900 bg-gray-50 shadow-sm' : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-900'}`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {product.size && (
                <div>
                  <h3 className="text-gray-900 text-[15px] font-bold mb-3 flex items-center gap-2">Select Size</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.size.split(',').map(s => s.trim()).map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[48px] h-12 px-3 flex items-center justify-center border-2 rounded-xl text-[14px] font-bold transition-all ${selectedSize === size ? 'border-gray-900 text-gray-900 bg-gray-50 shadow-sm' : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-900'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <h3 className="text-gray-900 text-[15px] font-bold mb-3">Quantity</h3>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border-2 border-gray-200 rounded-xl bg-gray-50 overflow-hidden shadow-sm">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-10 font-bold text-xl hover:bg-gray-200 text-gray-600 transition-colors">-</button>
                    <span className="w-12 text-center font-bold text-[15px] text-gray-900 leading-10 border-x-2 border-gray-200 bg-white">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(10, quantity + 1))} className="w-12 h-10 font-bold text-xl hover:bg-gray-200 text-gray-600 transition-colors">+</button>
                  </div>
                </div>
              </div>
            </div>

            {isMobile && (
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button onClick={handleAddToCart} disabled={isOutOfStock} className={`flex-1 h-12 rounded-xl font-bold border-2 border-gray-900 transition-colors ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'bg-white text-gray-900 hover:bg-gray-50'}`}>Add to Bag</button>
                <button onClick={handleBuyNow} disabled={isOutOfStock} className={`flex-1 h-12 rounded-xl font-bold shadow-md transition-all ${isOutOfStock ? 'opacity-50 cursor-not-allowed bg-gray-300 text-gray-600' : 'bg-gray-900 text-white hover:bg-black active:scale-[0.98]'}`}>Buy Now</button>
              </div>
            )}

            <div className="space-y-4">
              {adminToast && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-sm">
                  <AlertCircle size={20} className="text-red-500" />
                  <p className="font-bold text-red-600 text-sm">Admin accounts cannot purchase items.</p>
                </div>
              )}
            </div>

            {product.highlights && product.highlights.filter(h => h && h.trim() !== '').length > 0 && (
              <div className="py-2">
                <h3 className="text-[17px] font-bold text-[#0F1111] mb-2">About this item</h3>
                <ul className="list-disc pl-5 space-y-1.5">
                  {product.highlights.filter(h => h && h.trim() !== '').map((point, i) => (
                    <li key={i} className="text-[14px] text-[#0F1111] leading-[20px]">
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Description</h3>
              <div className={`text-sm text-gray-600 leading-relaxed overflow-hidden ${isDescriptionExpanded ? 'max-h-none' : 'max-h-[80px]'}`}>{product.description}</div>
              <button onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)} className="text-[#2874f0] font-bold text-sm mt-1 hover:underline">{isDescriptionExpanded ? 'Read Less' : 'Read More'}</button>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-[24px] mt-8 p-6 md:p-10">
          <h3 className="text-[22px] font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
            {[
              { label: 'Brand', value: product.brand || 'Premium Elements' },
              { label: 'Model', value: product.model || 'Standard Edition' },
              { label: 'Category', value: product.category || 'Lifestyle' },
            ].map((spec, i) => (
              <div key={i} className="flex border-b border-gray-50 py-4 text-[15px]">
                <span className="w-1/3 text-gray-500 font-semibold">{spec.label}</span>
                <span className="w-2/3 text-gray-900 font-bold">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>

        {reviews.length > 0 && (
          <div className="bg-white border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-[24px] p-6 md:p-10 mt-8">
            <h3 className="text-[22px] font-bold text-gray-900 mb-8 border-b border-gray-100 pb-4">Customer Reviews</h3>
            <div className="space-y-8">
              {reviews.map((review) => (
                <div key={review._id} className="border-b border-gray-50 pb-8 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-[12px] bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400"><User size={20} /></div>
                    <span className="text-[15px] font-bold text-gray-900">{review.user_id?.name || 'Verified Customer'}</span>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded text-[13px] font-bold text-amber-700">
                      <Star size={12} className="fill-amber-500 stroke-amber-500" /> {review.rating}
                    </div>
                    <h4 className="text-[15px] font-bold text-gray-900">{review.title || 'Excellent purchase!'}</h4>
                  </div>
                  <p className="text-[15px] text-gray-600 leading-relaxed">{review.comment}</p>

                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                      {review.images.map((img, idx) => (
                        <a key={idx} href={getImageUrl(img)} target="_blank" rel="noreferrer" className="w-24 h-24 rounded-[12px] border border-gray-100 overflow-hidden shrink-0 hover:border-gray-300 transition-colors block">
                          <img src={getImageUrl(img)} alt="Review" className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
      `}} />
    </div>
  );
}
