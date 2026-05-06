import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getProducts } from '../../api/productApi';
import ProductCard from '../../components/product/ProductCard';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import useMobile from '../../hooks/useMobile';
import { Search as SearchIcon, ShoppingBag, ChevronLeft, Filter } from 'lucide-react';

export default function SearchPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { addToWishlist } = useWishlist();
    const isMobile = useMobile();

    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const brand = searchParams.get('brand') || '';

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            try {
                const results = await getProducts({ search: query, category, brand });
                setProducts(results || []);
            } catch (err) {
                console.error('Search failed:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [query, category, brand]);

    if (loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="loader"></div>
            </div>
        );
    }

    return (
        <div className={`min-h-[80vh] ${isMobile ? 'px-4 py-6' : 'px-8 py-10'}`}>
            <div className="max-w-[1400px] mx-auto">
                {/* Search Header */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 text-text-muted mb-4">
                        <button 
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-1.5 font-bold hover:text-primary transition-colors bg-transparent border-none cursor-pointer"
                        >
                            <ChevronLeft size={18} />
                            Back
                        </button>
                        <span className="opacity-30">/</span>
                        <span className="font-bold">Search Results</span>
                    </div>

                    <div className="flex flex-wrap items-baseline justify-between gap-4">
                        <div>
                            <h1 className={`font-[900] text-text-main tracking-tight ${isMobile ? 'text-[28px]' : 'text-4xl'}`}>
                                {query ? (
                                    <>Results for <span className="text-primary">"{query}"</span></>
                                ) : category ? (
                                    <><span className="text-primary">{category}</span> Collection</>
                                ) : (
                                    <>Explore <span className="text-primary">Products</span></>
                                )}
                            </h1>
                            <p className="text-text-muted mt-2 font-bold uppercase tracking-widest text-[12px]">
                                {products.length} {products.length === 1 ? 'item' : 'items'} found
                            </p>
                        </div>

                        <div className="flex gap-3">
                           {/* Filter toggle could go here */}
                        </div>
                    </div>
                </div>

                {products.length > 0 ? (
                    <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-[repeat(auto-fill,minmax(280px,1fr))]'}`}>
                        {products.map(p => (
                            <ProductCard
                                key={p._id}
                                product={p}
                                onAddToCart={() => addToCart(p)}
                                onAddToWishlist={() => addToWishlist(p)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="glass-panel rounded-[32px] py-20 px-10 text-center border-dashed border-2 border-glass-border">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <SearchIcon size={40} className="text-slate-300" />
                        </div>
                        <h2 className="text-[24px] font-black text-text-main mb-2">No results found</h2>
                        <p className="text-text-muted mb-8 max-w-[400px] mx-auto leading-relaxed italic">
                            We couldn't find any matches for your request. Try checking your spelling or using more general terms.
                        </p>
                        <button 
                            onClick={() => navigate('/')}
                            className="bg-primary hover:bg-primary-hover text-white px-8 py-3.5 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-lg shadow-primary/20"
                            style={{ backgroundColor: '#2874f0' }}
                        >
                            Back to Home
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
