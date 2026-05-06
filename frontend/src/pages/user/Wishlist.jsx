import React from 'react';
import { useWishlist } from '../../contexts/WishlistContext';
import { ProductCard } from '../../components/product/ProductCard';
import { Heart, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Wishlist() {
    const { wishlistItems } = useWishlist();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50/50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-gray-200 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                            <Heart className="text-primary hidden sm:block" size={28} />
                            My Wishlist
                        </h1>
                        <p className="mt-2 text-gray-500 text-sm">
                            Your saved items and collections.
                        </p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 border border-gray-200 shadow-sm flex items-center gap-2 self-start sm:self-auto">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        {wishlistItems.length} {wishlistItems.length === 1 ? 'Item' : 'Items'} Saved
                    </div>
                </div>

                {wishlistItems.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm text-center px-6 py-20 max-w-2xl mx-auto mt-10">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Heart size={40} className="text-gray-300" strokeWidth={1.5} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                            Save items you love here and review them anytime. Discover our latest collections and find something perfect.
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm group"
                        >
                            Start Shopping
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                        {wishlistItems.map(product => (
                            <ProductCard key={product._id || product.id} product={product} variant="wishlist" />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
