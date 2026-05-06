import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ImagePlus, X, UploadCloud } from 'lucide-react';
import { getProductById, addProductReview } from '../../api/productApi';
import { getImageUrl } from '../../utils/imageConfig';

const formatINR = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);

export default function Review() {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    useEffect(() => {
        async function fetchProduct() {
            setLoading(true);
            try {
                if (!productId) {
                    throw new Error('No product ID provided');
                }
                const data = await getProductById(productId);
                setProduct(data);
            } catch (err) {
                console.error('Failed to fetch product', err);
                setError(err.response?.data?.message || err.message || 'Failed to load product details');
            } finally {
                setLoading(false);
            }
        }
        fetchProduct();
    }, [productId]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (images.length + files.length > 3) {
            setError('You can only upload up to 3 images');
            return;
        }
        setError('');
        
        const newImages = [...images, ...files];
        setImages(newImages);
        
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews([...imagePreviews, ...newPreviews]);
    };

    const removeImage = (index) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);

        const newPreviews = [...imagePreviews];
        URL.revokeObjectURL(newPreviews[index]); // clean up
        newPreviews.splice(index, 1);
        setImagePreviews(newPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setError('Please select a rating');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('rating', rating);
            formData.append('title', title);
            formData.append('comment', comment);
            
            images.forEach(img => {
                formData.append('images', img);
            });

            await addProductReview(productId, formData);
            navigate('/orders');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit review');
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-[#e77600] rounded-full animate-spin mb-4"></div>
                <h2 className="text-xl font-bold text-slate-800">Loading details...</h2>
                <p className="text-slate-500 text-sm mt-2">Preparing your review workspace.</p>
            </div>
        );
    }

    if (error && !product) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6">
                    <Star size={40} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h2>
                <p className="text-slate-600 max-w-md mx-auto mb-8">{error}</p>
                <button
                    onClick={() => navigate('/orders')}
                    className="px-8 py-2.5 bg-[#FFD814] hover:bg-[#F7CA00] text-slate-900 border border-[#FCD200] rounded-lg font-bold text-sm shadow-sm transition-all active:scale-95"
                >
                    Back to Orders
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pt-16 pb-12 px-4 sm:px-6">
            <div className="max-w-[700px] mx-auto">
                <h1 className="text-[28px] font-bold text-slate-900 mb-6">Create Review</h1>

                <div className="flex gap-4 mb-8 pb-6 border-b border-slate-200">
                    <img src={getImageUrl(product.imageUrl)} alt={product.name} className="w-20 h-20 object-contain" />
                    <div>
                        <h2 className="text-[17px] font-medium text-slate-900">{product.name}</h2>
                        <p className="text-slate-500 text-sm mt-1">{product.category}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Rating Section */}
                    <div>
                        <h3 className="text-[19px] font-bold text-slate-900 mb-3">Overall rating</h3>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(0)}
                                    className="p-1 cursor-pointer transition-transform hover:scale-110"
                                >
                                    <Star
                                        size={32}
                                        fill={(hover || rating) >= star ? '#FFA41C' : 'transparent'}
                                        color={(hover || rating) >= star ? '#FFA41C' : '#D1D5DB'}
                                        strokeWidth={1.5}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Headline Section */}
                    <div>
                        <h3 className="text-[19px] font-bold text-slate-900 mb-3">Add a headline</h3>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="What's most important to know?"
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none text-[13px] placeholder:text-slate-400"
                            required
                        />
                    </div>

                    {/* Comment Section */}
                    <div>
                        <h3 className="text-[19px] font-bold text-slate-900 mb-3">Add a written review</h3>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="What did you like or dislike? What did you use this product for?"
                            rows={6}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none text-[13px] placeholder:text-slate-400"
                            required
                        />
                    </div>

                    {/* Photo Upload Section */}
                    <div>
                        <h3 className="text-[19px] font-bold text-slate-900 mb-1">Add a photo (Optional)</h3>
                        <p className="text-sm text-slate-500 mb-3">Shoppers find images more helpful than text alone.</p>
                        
                        {imagePreviews.length > 0 && (
                            <div className="flex gap-3 mb-4 flex-wrap">
                                {imagePreviews.map((preview, i) => (
                                    <div key={i} className="relative w-20 h-20 rounded-lg border border-slate-200 overflow-hidden group">
                                        <img src={preview} alt="preview" className="w-full h-full object-cover" />
                                        <button 
                                            type="button"
                                            onClick={() => removeImage(i)}
                                            className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {images.length < 3 && (
                            <div>
                                <input
                                    type="file"
                                    id="review-images"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <label 
                                    htmlFor="review-images" 
                                    className="inline-flex items-center justify-center gap-2 px-6 py-8 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 text-slate-600 font-bold hover:bg-slate-100 hover:border-primary transition-colors cursor-pointer w-full"
                                >
                                    <UploadCloud size={24} />
                                    <span>Click to upload photos (Max 3)</span>
                                </label>
                            </div>
                        )}
                    </div>

                    {error && <p className="text-red-600 text-[13px]">{error}</p>}

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`px-8 py-2 bg-[#FFD814] hover:bg-[#F7CA00] text-slate-900 border border-[#FCD200] rounded-lg font-bold text-[13px] shadow-sm cursor-pointer ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {submitting ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
