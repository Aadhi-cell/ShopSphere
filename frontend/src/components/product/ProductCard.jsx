import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Info, Truck } from 'lucide-react';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import { getUser } from '../../auth';
import useMobile from '../../hooks/useMobile';
import { getImageUrl } from '../../utils/imageConfig';

const formatINR = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
const formatDisplayINR = (price) => formatINR(price);

export function ProductCard({ product, variant = 'standard' }) {
    const { isInWishlist, toggleWishlist, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const isMobile = useMobile();
    const isOutOfStock = (product.stock <= 0) || (product.status === 'out-of-stock');
    const isWishlisted = isInWishlist(product._id || product.id);
    const [adminToast, setAdminToast] = useState(false);

    const handleAddToCart = (e) => {
        e.stopPropagation();
        if (getUser()?.role === 'admin') {
            setAdminToast(true);
            setTimeout(() => setAdminToast(false), 3000);
            return;
        }
        addToCart(product);
        // We do not immediately navigate to cart as standard for modern platforms,
        // but if the design originally did, we will retain it or change it based on preference. 
        // Changing it to add silently and maybe present a toast would be better, but we will leave the navigation for now.
        navigate('/cart');
    };

    const handleCardClick = () => {
        navigate(`/products/${product._id || product.id}`);
    };

    const handleWishlistClick = (e) => {
        e.stopPropagation();
        if (variant === 'wishlist') {
            removeFromWishlist(product._id || product.id);
        } else {
            toggleWishlist(product);
        }
    };

    return (
        <div
            onClick={handleCardClick}
            className="group relative bg-white rounded-xl p-3 md:p-4 transition-all duration-300 ease-out flex flex-col h-full overflow-hidden shadow-lg hover:shadow-2xl border border-gray-200 cursor-pointer"
        >
            {/* Image Container with White Background logic */}
            <div className={`relative w-full rounded-lg overflow-hidden ${isMobile ? 'h-[150px]' : 'h-[190px]'} bg-white mb-3 flex justify-center items-center`}>
                <img
                    src={getImageUrl(product.imageUrl)}
                    alt={product.name}
                    className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-110"
                />

                {/* Top Overlay Badges */}
                <div className="absolute top-0 left-0 flex flex-col gap-1.5 pointer-events-auto z-20">
                    {product.averageRating >= 4.5 ? (
                        <span className="px-2.5 py-1 bg-[#2874f0] text-white rounded-sm text-[10px] font-bold tracking-wider shadow-sm w-fit">
                            Best Seller
                        </span>
                    ) : (
                        <span className="px-2.5 py-1 bg-emerald-500 text-white rounded-sm text-[10px] font-bold tracking-wider shadow-sm w-fit">
                            New Arrival
                        </span>
                    )}
                    {isOutOfStock && (
                        <span className="px-2.5 py-1 bg-red-500 text-white rounded-sm text-[10px] font-bold tracking-wider shadow-sm w-fit">
                            Sold Out
                        </span>
                    )}
                </div>

                {/* Wishlist Button */}
                <div className="absolute top-0 right-0 z-20 pointer-events-auto">
                    <button
                        onClick={handleWishlistClick}
                        className="w-8 h-8 shrink-0 flex items-center justify-center bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:bg-gray-50 active:scale-95 transition-all duration-200"
                    >
                        <Heart
                            size={15}
                            className={`transition-colors duration-200 ${isWishlisted ? 'fill-red-500 stroke-red-500' : 'stroke-gray-400 hover:stroke-gray-600 hover:fill-gray-100'}`}
                        />
                    </button>
                </div>

                {/* Circular Quick Add Hover Button */}
                <div className="absolute bottom-2 right-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out z-30 pointer-events-auto">
                    <button
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        title="Add to Cart"
                        className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all duration-200 ${isOutOfStock
                            ? 'bg-gray-100 border border-gray-200 cursor-not-allowed'
                            : 'bg-[#2874f0] hover:bg-blue-700 hover:scale-105 active:scale-95'
                            }`}
                    >
                        <ShoppingCart size={16} className={isOutOfStock ? "stroke-gray-400" : "stroke-white"} />
                    </button>
                </div>
            </div>

            {/* Content Container */}
            <div className="flex flex-col flex-grow bg-transparent z-10 w-full">
                {/* Title */}
                <h3 className="text-[13px] md:text-[14px] font-bold text-gray-900 leading-[1.4] line-clamp-2 mb-1 transition-colors duration-200 group-hover:text-[#2874f0]" title={product.name}>
                    {product.name}
                </h3>

                {/* Brand */}
                <span className="text-[11px] text-gray-500 font-bold mb-0.5">
                    By {product.brand || 'Urban Comfort'}
                </span>

                {/* Category */}
                <span className="text-[11px] font-medium text-gray-400 mb-2 uppercase tracking-wider">
                    {product.category || 'Living Room Furniture'}
                </span>

                {/* Rating */}
                <div className="flex items-center gap-1.5 mb-3 h-[22px]">
                    {(product.reviewsCount > 0 || product.averageRating > 0) && (
                        <>
                            <div className="flex items-center gap-0.5 bg-emerald-600 text-white px-1.5 py-0.5 rounded text-[11px] font-bold">
                                {(product.averageRating || 0).toFixed(1)} <Star size={10} className="fill-white stroke-white" />
                            </div>
                            <span className="text-[11px] font-medium text-gray-500">
                                ({product.reviewsCount || 0} reviews)
                            </span>
                        </>
                    )}
                </div>

                <div className="mt-auto flex flex-col gap-2">
                    {/* Price Block */}
                    <div>
                        <div className="flex items-end gap-2 mb-0.5">
                            <span className="text-[18px] md:text-[20px] font-extrabold text-gray-900 leading-none">
                                {formatDisplayINR(product.price)}
                            </span>
                            {product.mrp && product.mrp > product.price && (
                                <span className="text-[12px] text-gray-400 font-medium line-through leading-none pb-[2px]">
                                    {formatDisplayINR(product.mrp)}
                                </span>
                            )}
                        </div>
                        {product.mrp && product.mrp > product.price && (
                            <div className="flex items-center">
                                <span className="text-[11px] text-green-600 font-bold tracking-normal">
                                    {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% off
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Delivery / Stock Info */}
                    <div className="flex items-center justify-between pb-0.5">
                        <span className="text-[10px] text-gray-600 font-bold flex items-center gap-1">
                            <Truck size={10} className="text-gray-500" /> Free Delivery
                        </span>
                        {!isOutOfStock && (
                            <span className="text-[10px] text-emerald-600 font-bold">
                                In Stock
                            </span>
                        )}
                    </div>

                    {adminToast && (
                        <div className="absolute top-4 left-0 right-0 mx-4 flex items-center justify-center p-2 bg-gray-900 text-white rounded-md shadow-lg z-50 animate-fade-in text-[10px] font-bold">
                            Admins cannot purchase
                        </div>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fade-in { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
            `}} />
        </div>
    );
}

export default ProductCard;
