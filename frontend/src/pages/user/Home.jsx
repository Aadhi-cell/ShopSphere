import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import ProductCard from '../../components/product/ProductCard';
import { getProducts } from '../../api/productApi';
import useMobile from '../../hooks/useMobile';
import { ShoppingBag, Bell, ChevronLeft, ChevronRight, LayoutGrid, Shirt, Smartphone, Sparkles, Monitor, Home as HomeIcon, Tv, Gamepad2, Apple, Car, Bike, Dumbbell, BookOpen, Armchair, Package, CalendarDays } from 'lucide-react';
import { getActiveBanners, trackBanner } from '../../api/userApi';
import { getImageUrl } from '../../utils/imageConfig';

const formatBannerDate = (startDate, endDate) => {
    if (!startDate && !endDate) return null;
    const opts = { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' };
    const start = startDate ? new Date(startDate).toLocaleDateString('en-US', opts) : null;
    const end = endDate ? new Date(endDate).toLocaleDateString('en-US', opts) : null;

    if (start && end) {
        if (start === end) return `Valid only on ${start}`;
        return `Valid: ${start} - ${end}`;
    }
    if (end) return `Ends on ${end}`;
    if (start) return `Starts on ${start}`;
    return null;
};

const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();
    if (name.includes('fashion') || name.includes('cloth') || name.includes('wear')) return Shirt;
    if (name.includes('mobile') || name.includes('phone') || name.includes('smart')) return Smartphone;
    if (name.includes('beaut') || name.includes('cosmetic') || name.includes('makeup')) return Sparkles;
    if (name.includes('electronic') || name.includes('laptop') || name.includes('computer')) return Monitor;
    if (name.includes('home') || name.includes('decor')) return HomeIcon;
    if (name.includes('appliance') || name.includes('tv') || name.includes('television')) return Tv;
    if (name.includes('toy') || name.includes('kid') || name.includes('baby')) return Gamepad2;
    if (name.includes('food') || name.includes('grocery') || name.includes('health')) return Apple;
    if (name.includes('auto') || name.includes('car')) return Car;
    if (name.includes('bike') || name.includes('wheel') || name.includes('cycle')) return Bike;
    if (name.includes('sport') || name.includes('fit') || name.includes('gym')) return Dumbbell;
    if (name.includes('book') || name.includes('education')) return BookOpen;
    if (name.includes('furniture') || name.includes('sofa')) return Armchair;
    return Package; // Default
};

export default function Home() {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { addToWishlist } = useWishlist();
    const isMobile = useMobile();

    const [products, setProducts] = useState([]);
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [trackedImpressions, setTrackedImpressions] = useState(new Set());

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch products and banners independently to be resilient
                const productsPromise = getProducts().catch(err => {
                    console.error('Failed to fetch products:', err);
                    return [];
                });
                const bannersPromise = getActiveBanners().catch(err => {
                    console.error('Failed to fetch banners:', err);
                    return [];
                });

                const [productsData, bannersData] = await Promise.all([
                    productsPromise,
                    bannersPromise
                ]);

                setProducts(productsData || []);
                setBanners(bannersData || []);
                console.log('Home Banners Loaded:', bannersData?.length, bannersData);
            } catch (err) {
                console.error('Unexpected error in fetchData:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        // Track Impression for the currently active slide
        if (banners.length > 0 && banners[currentSlide] && banners[currentSlide]._id) {
            const currentBannerId = banners[currentSlide]._id;
            if (!trackedImpressions.has(currentBannerId)) {
                trackBanner(currentBannerId, 'impression').catch(err => console.error('Failed to track impression', err));
                setTrackedImpressions(prev => new Set(prev).add(currentBannerId));
            }
        }

        if (banners.length > 1) {
            const timer = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % banners.length);
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [banners, currentSlide, trackedImpressions]);

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchCat = !selectedCategory || p.category === selectedCategory;
            const matchBrand = !selectedBrand || p.brand === selectedBrand;
            return matchCat && matchBrand;
        });
    }, [products, selectedCategory, selectedBrand]);

    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    const brands = [...new Set(products.map(p => p.brand))];

    const activeSlide = banners[currentSlide] || null;

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % banners.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
    const goToSlide = (index) => setCurrentSlide(index);

    const handleBannerClick = (banner) => {
        if (banner._id) {
            trackBanner(banner._id, 'click').catch(err => console.error('Failed to track click', err));
        }
        if (banner.redirectLink) {
            navigate(banner.redirectLink);
        }
    };

    const filterTitle = selectedCategory ? (selectedBrand ? `${selectedBrand} ${selectedCategory}` : selectedCategory) : (selectedBrand ? `${selectedBrand} Collection` : 'Featured Products');
    const hasFilter = selectedCategory || selectedBrand;

    if (loading) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="loader"></div>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] p-0">

            {/* Minimalist Professional Category Bar */}
            <section className="w-full bg-transparent relative z-[990] pt-5 sm:pt-6 lg:pt-8">
                <div className="w-full max-w-[1400px] mx-auto">
                    <div className="scrollbar-hide w-full flex items-start justify-start gap-5 sm:gap-8 min-h-[64px] pt-3 pb-1 overflow-x-auto [scrollbar-width:none] snap-x snap-mandatory px-4 sm:px-6 lg:px-8">

                        {/* ALL Products Master Icon */}
                        <div
                            className="flex flex-col items-center cursor-pointer snap-start group relative min-w-[44px]"
                            onClick={() => { setSelectedCategory(null); setSelectedBrand(null); }}
                        >
                            <div className={`w-[34px] h-[34px] rounded-full flex items-center justify-center transition-transform mx-auto
                                ${!selectedCategory
                                    ? 'bg-[#2874f0]/[0.12] text-[#2874f0]'
                                    : 'bg-transparent text-slate-700 group-hover:bg-slate-50 group-hover:scale-105'}`}
                            >
                                <LayoutGrid size={16} strokeWidth={!selectedCategory ? 2 : 1.5} />
                            </div>
                            <span className={`text-[10px] mt-0.5 font-[600] whitespace-nowrap transition-colors
                                ${!selectedCategory ? 'text-[#2874f0]' : 'text-slate-700 group-hover:text-black'}`}>
                                For You
                            </span>
                            {/* Active indicator bar */}
                            <div className={`absolute -bottom-1 h-[2px] w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${!selectedCategory ? 'bg-[#2874f0]' : 'bg-transparent'}`} />
                        </div>

                        {/* Dynamic Category Icons */}
                        {categories.map(cat => {
                            const CategoryIcon = getCategoryIcon(cat);
                            const isSelected = selectedCategory === cat;
                            const capitalizedCat = cat.charAt(0).toUpperCase() + cat.slice(1);

                            return (
                                <div
                                    key={cat}
                                    className="flex flex-col items-center cursor-pointer snap-start group relative min-w-[44px]"
                                    onClick={() => setSelectedCategory(cat)}
                                >
                                    <div className={`w-[34px] h-[34px] rounded-full flex items-center justify-center transition-transform mx-auto
                                    ${isSelected
                                            ? 'bg-[#2874f0]/[0.12] text-[#2874f0]'
                                            : 'bg-transparent text-slate-700 group-hover:bg-slate-50 group-hover:scale-105'}`}
                                    >
                                        <CategoryIcon size={16} strokeWidth={isSelected ? 2 : 1.5} />
                                    </div>
                                    <span
                                        title={capitalizedCat}
                                        className={`text-[10px] mt-0.5 font-[600] whitespace-nowrap transition-colors truncate max-w-[65px] px-0.5
                                    ${isSelected ? 'text-[#2874f0]' : 'text-slate-700 group-hover:text-black'}`}
                                    >
                                        {capitalizedCat}
                                    </span>
                                    {/* Active indicator bar */}
                                    <div className={`absolute -bottom-1 h-[2px] w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${isSelected ? 'bg-[#2874f0]' : 'bg-transparent'}`} />
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* High-Density Flipkart-Style Peek-a-boo Banner */}
            {banners.length > 0 && (
                <div
                    className={`banner-container w-full p-0 mb-space-10 overflow-hidden relative ${isMobile ? 'h-[420px]' : 'h-[360px]'}`}
                >
                    <div
                        className="flex h-full transition-transform duration-600 ease-[cubic-bezier(0.23,1,0.32,1)]"
                        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                    >
                        {banners.map((slide, idx) => (
                            <div
                                key={idx}
                                onClick={() => handleBannerClick(slide)}
                                className={`min-w-full h-full rounded-[32px] flex items-center relative overflow-hidden shadow-premium cursor-pointer ${isMobile ? 'flex-col' : 'flex-row'}`}
                                style={{ background: slide.bg || (idx % 2 === 0 ? 'linear-gradient(135deg, #f0f7ff 0%, #e0efff 100%)' : 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)') }}
                            >
                                {/* Tagline Badge Background */}
                                <div className={`absolute right-10 top-[30px] text-[44px] font-[900] leading-[0.8] text-right uppercase pointer-events-none text-black/5`}>
                                    {slide.tagline || 'NEW COLLECTION'}
                                </div>

                                {/* Content Section */}
                                <div className={`z-10 flex flex-col justify-center h-full ${isMobile ? 'none pt-space-10 px-space-5 pb-space-5 text-center items-center' : 'w-[45%] pb-space-10 pl-space-12 text-left items-start'}`}>
                                    <div className={`px-space-2 py-space-1 text-[10px] font-[900] rounded-sm mb-space-5 uppercase ${slide.dark ? 'bg-white/20' : 'bg-slate-900/90 text-white'}`}>
                                        {slide.label || (slide.status === 'Active' ? 'LIVE' : 'PROMOTED')}
                                    </div>

                                    <h1 className={`font-[900] mb-1 tracking-[-1px] ${isMobile ? 'text-2xl' : 'text-[32px]'} ${slide.dark ? 'text-white' : 'text-slate-800'}`}>
                                        {slide.title}
                                    </h1>

                                    <div className={`font-[800] mb-2 ${isMobile ? 'text-xl' : 'text-[28px]'} ${slide.dark ? 'text-white' : 'text-slate-800'}`}>
                                        {slide.offer || slide.buttonText}
                                    </div>

                                    <p className={`text-sm font-semibold mb-0 ${slide.dark ? 'text-white/70' : 'text-slate-500'}`}>
                                        {slide.subtitle}
                                    </p>

                                    {formatBannerDate(slide.startDate, slide.endDate) && (
                                        <div className={`mt-3 text-[11px] sm:text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-sm shadow-sm transition-all duration-300 hover:scale-[1.02] ${slide.dark ? 'bg-white/10 text-white/95 border border-white/10' : 'bg-black/[0.03] text-slate-800 border border-black/5'}`}>
                                            <CalendarDays size={14} className="opacity-80" />
                                            <span>{formatBannerDate(slide.startDate, slide.endDate)}</span>
                                        </div>
                                    )}

                                    {/* Bank Offer Ribbon */}
                                    <div className={`absolute bottom-0 left-0 w-full bg-white/95 px-5 py-2 border-t border-black/5 flex items-center gap-space-4 font-bold text-text-main whitespace-nowrap overflow-hidden ${isMobile ? 'justify-center text-[10px] gap-space-2' : 'justify-start text-[11px]'}`}>
                                        <div className="px-1.5 py-0.5 bg-glass-border rounded-sm">BANK OFFERS</div>
                                        <span className="overflow-hidden text-ellipsis">{slide.bankOffer || 'Flat 10% instant discount on major credit cards'}</span>
                                    </div>
                                </div>

                                {/* Image Section - Right Aligned with Blend Mode */}
                                <div className={`flex relative z-5 [perspective:1000px] items-center justify-end ${isMobile ? 'h-1/2 pb-8' : 'w-[55%] h-full pr-8'}`}>
                                    {/* Larger Background Accent Orb */}
                                    <div
                                        className="absolute w-[450px] h-[450px] rounded-full z-[-1] inset-0 m-auto"
                                        style={{ background: `radial-gradient(circle, ${slide.color || '#2874f0'}25 0%, transparent 70%)` }}
                                    ></div>

                                    <img
                                        src={getImageUrl(slide.image || slide.imageUrl)}
                                        style={{
                                            filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.15))'
                                        }}
                                        alt={slide.title}
                                        className="relative h-auto w-auto max-h-[92%] max-w-[95%] object-contain transition-transform duration-500 hover:scale-105 animate-[waterFloat_4.5s_ease-in-out_infinite]"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Minimal Dots */}
                    <div className="absolute bottom-[15px] left-1/2 -translate-x-1/2 flex gap-1.5 z-[110]">
                        {banners.map((_, idx) => (
                            <div
                                key={idx}
                                onClick={() => goToSlide(idx)}
                                className={`w-1.5 h-1.5 rounded-full cursor-pointer transition-all duration-300 ${idx === currentSlide ? 'bg-[#2874f0]' : 'bg-black/20'}`}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Products Section */}
            <section id="product-section" className="p-0">
                <div className="flex justify-between items-baseline mb-8">
                    <div>
                        <h2 className={`font-extrabold text-text-main tracking-tight ${isMobile ? 'text-2xl' : 'text-[32px]'}`}>
                            {filterTitle}
                        </h2>
                        <div className="h-1 w-[60px] bg-primary mt-3 rounded-sm"></div>
                    </div>
                    {hasFilter && (
                        <button
                            onClick={() => {
                                setSelectedCategory(null);
                                setSelectedBrand(null);
                                setLoading(true);
                                setTimeout(() => setLoading(false), 500);
                            }}
                            className="glass-card px-4 py-2 rounded-lg cursor-pointer"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>

                <div className={`grid gap-space-6 pb-space-10 w-full box-border ${isMobile ? 'grid-cols-1' : 'grid-cols-[repeat(auto-fill,minmax(280px,1fr))]'}`}>
                    {filteredProducts.map(p => (
                        <ProductCard
                            key={p._id}
                            product={p}
                            onAddToCart={() => addToCart(p)}
                            onAddToWishlist={() => addToWishlist(p)}
                        />
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-[100px] bg-white/[0.02] rounded-[32px] border border-dashed border-glass-border">
                        <ShoppingBag size={48} className="text-text-dim mb-5 mx-auto" />
                        <h3 className="text-2xl font-bold text-text-main">No products in this category</h3>
                        <p className="text-text-muted">Try adjusting your filters or category selection.</p>
                    </div>
                )}
            </section>
        </div>
    );
}
