import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSellerProducts, updateProduct } from '../../api/sellerApi';
import { Package, Upload, ArrowLeft, CheckCircle, AlertCircle, IndianRupee, Tag, Layers, FileText, Image as ImageIcon, Sparkles, X, Plus } from 'lucide-react';
import { getImageUrl } from '../../utils/imageConfig';


export default function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState(null);
    const [generatingDesc, setGeneratingDesc] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [additionalImageFiles, setAdditionalImageFiles] = useState([]);
    const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]);
    const [existingAdditionalImages, setExistingAdditionalImages] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        brand: '',
        stock: '',
        imageUrl: '',
        images: [], // Now an array
        weight: '',
        dimensions: '',
        shippingCost: '',
        color: '',
        size: '',
        variant: '',
        model: '',
        highlights: ['']
    });

    useEffect(() => {
        loadProduct();
    }, [id]);

    const loadProduct = async () => {
        try {
            setFetching(true);
            const data = await getSellerProducts();
            const product = data.find(p => String(p._id || p.id) === String(id));
            if (product) {
                setFormData({
                    name: product.name,
                    description: product.description || '',
                    price: product.price,
                    category: product.category,
                    brand: product.brand || '',
                    stock: product.stock,
                    imageUrl: product.imageUrl || '',
                    images: product.images || [],
                    weight: product.shippingInfo?.weight || '',
                    dimensions: product.shippingInfo?.dimensions || '',
                    shippingCost: product.shippingInfo?.shippingCost || '',
                    color: product.color || '',
                    size: product.size || '',
                    variant: product.variant || '',
                    model: product.model || '',
                    highlights: product.highlights && product.highlights.length > 0 ? product.highlights : ['']
                });
                if (product.imageUrl) {
                    setImagePreview(getImageUrl(product.imageUrl));
                }
                if (product.images) {
                    setExistingAdditionalImages(product.images);
                }
            } else {
                setError('Product not found or access denied');
            }
        } catch (err) {
            console.error('Fetch product error:', err);
            setError('Failed to fetch product details');
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const addHighlight = () => {
        setFormData(prev => ({
            ...prev,
            highlights: [...prev.highlights, '']
        }));
    };

    const removeHighlight = (index) => {
        setFormData(prev => ({
            ...prev,
            highlights: prev.highlights.filter((_, i) => i !== index)
        }));
    };

    const handleHighlightChange = (index, value) => {
        const newHighlights = [...formData.highlights];
        newHighlights[index] = value;
        setFormData(prev => ({
            ...prev,
            highlights: newHighlights
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAdditionalFilesChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const newFiles = [...additionalImageFiles, ...files].slice(0, 10 - existingAdditionalImages.length);
            setAdditionalImageFiles(newFiles);

            const newPreviews = [];
            let processed = 0;

            newFiles.forEach((file) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    newPreviews.push(reader.result);
                    processed++;
                    if (processed === newFiles.length) {
                        setAdditionalImagePreviews(newPreviews);
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeNewAdditionalImage = (index) => {
        const newFiles = [...additionalImageFiles];
        const newPreviews = [...additionalImagePreviews];
        newFiles.splice(index, 1);
        newPreviews.splice(index, 1);
        setAdditionalImageFiles(newFiles);
        setAdditionalImagePreviews(newPreviews);
    };

    const removeExistingAdditionalImage = (index) => {
        const newExisting = [...existingAdditionalImages];
        newExisting.splice(index, 1);
        setExistingAdditionalImages(newExisting);
    };

    const handleAutoGenerate = async () => {
        if (!formData.name || !formData.category) {
            alert('Please enter at least a Product Name and Category to generate a description.');
            return;
        }

        setGeneratingDesc(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1200));

            const brandText = formData.brand ? ` by ${formData.brand}` : '';
            const featureList = [];
            if (formData.color) featureList.push(`${formData.color} colorway`);
            if (formData.size) featureList.push(`${formData.size} format`);
            if (formData.model) featureList.push(`model ${formData.model}`);
            if (formData.variant) featureList.push(`${formData.variant} edition`);

            let desc = `Introducing the ${formData.name}${brandText}, a premium offering in our ${formData.category} collection. Designed with uncompromising attention to detail, this product seamlessly blends functionality and cutting-edge aesthetics.`;

            if (featureList.length > 0) {
                desc += `\n\nKey Highlights:\n- Features a stunning ${featureList.join(' and ')}.\n- Engineered for optimal performance and daily durability.\n- Crafted using top-tier materials for a luxurious feel.`;
            }

            desc += `\n\nExperience unmatched quality and elevate your standard with the ${formData.name}. Perfect for both personal use and gifting!`;

            setFormData(prev => ({
                ...prev,
                description: desc
            }));
        } finally {
            setGeneratingDesc(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!formData.name || !formData.price || !formData.category) {
                throw new Error('Please fill in all required fields');
            }

            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key !== 'imageUrl' && key !== 'images' && key !== 'shippingInfo' && key !== 'highlights') {
                    data.append(key, formData[key]);
                }
            });

            // Handle highlights array
            formData.highlights.filter(h => h.trim() !== '').forEach(h => {
                data.append('highlights[]', h);
            });

            if (selectedFile) {
                data.append('image', selectedFile);
            } else {
                data.append('imageUrl', formData.imageUrl);
            }

            // Send existing images as a comma separated string for the backend to combine
            data.append('images', existingAdditionalImages.join(', '));

            // Append new files
            if (additionalImageFiles.length > 0) {
                additionalImageFiles.forEach(file => {
                    data.append('additionalImages', file);
                });
            }

            data.append('shippingInfo', JSON.stringify({
                weight: Number(formData.weight),
                dimensions: formData.dimensions,
                shippingCost: Number(formData.shippingCost)
            }));

            await updateProduct(id, data);

            alert('Product updated successfully!');
            navigate('/seller/my-products');
        } catch (err) {
            console.error('Update product error:', err);
            setError(err.response?.data?.message || err.message || 'Failed to update product');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-10 text-center text-text-muted font-medium">Loading product details...</div>;

    return (
        <div className="py-2 px-0 max-w-[900px] mx-auto scale-[0.95] origin-top">
            <div className="mb-4 flex items-center gap-4">
                <button
                    onClick={() => navigate('/seller')}
                    className="bg-bg-secondary border border-glass-border text-text-main px-4 py-2 rounded-xl cursor-pointer flex items-center justify-center transition-all hover:bg-glass-border text-[11px] font-[900] uppercase tracking-widest"
                >
                    Go Back
                </button>
                <div>
                    <h1 className="text-[22px] font-[900] text-text-main tracking-tight leading-none mb-1">
                        Edit Product
                    </h1>
                    <p className="text-text-muted text-[12px] font-bold uppercase tracking-widest">
                        Catalogue Management
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="glass-card p-6 rounded-3xl space-y-6">
                {error && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 flex items-center gap-3 text-xs font-black uppercase tracking-wider">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest border-b border-slate-100 pb-2">
                            <Package size={16} className="text-primary" /> Basic Information
                        </h3>

                        <div className="grid grid-cols-1 gap-3">
                            <div className="form-group">
                                <label className="block mb-1.5 font-black text-slate-500 text-[10px] uppercase tracking-widest">Product Name *</label>
                                <div className="relative">
                                    <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-100 bg-slate-50/50 text-slate-900 text-sm font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="form-group">
                                    <label className="block mb-1.5 font-black text-slate-500 text-[10px] uppercase tracking-widest">Category *</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 rounded-xl border border-slate-100 bg-slate-50/50 text-slate-900 text-sm font-bold outline-none focus:border-primary transition-all appearance-none"
                                    >
                                        <option value="">Select</option>
                                        <option value="electronics">Electronics</option>
                                        <option value="fashion">Fashion</option>
                                        <option value="home">Home & Living</option>
                                        <option value="beauty">Beauty</option>
                                        <option value="sports">Sports</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="block mb-1.5 font-black text-slate-500 text-[10px] uppercase tracking-widest">Brand</label>
                                    <input
                                        type="text"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-xl border border-slate-100 bg-slate-50/50 text-slate-900 text-sm font-bold outline-none focus:border-primary transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block font-black text-slate-500 text-[10px] uppercase tracking-widest">Description</label>
                                <button
                                    type="button"
                                    onClick={handleAutoGenerate}
                                    className="text-[10px] font-black text-primary flex items-center gap-1 uppercase tracking-widest hover:underline"
                                >
                                    <Sparkles size={12} /> Auto-AI
                                </button>
                            </div>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50/50 text-slate-900 text-sm font-bold resize-none outline-none focus:border-primary transition-all"
                            />
                        </div>

                        <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest border-b border-slate-100 pb-2 pt-2">
                            <Layers size={16} className="text-primary" /> Configuration
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <input type="text" name="color" value={formData.color} onChange={handleChange} placeholder="Color" className="w-full px-4 py-2 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-bold" />
                            <input type="text" name="size" value={formData.size} onChange={handleChange} placeholder="Size" className="w-full px-4 py-2 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-bold" />
                        </div>

                        <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest border-b border-slate-100 pb-2 pt-4">
                            <Sparkles size={16} className="text-primary" /> Key Highlights
                        </h3>
                        <div className="space-y-2">
                            {formData.highlights.map((highlight, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={highlight}
                                        onChange={(e) => handleHighlightChange(index, e.target.value)}
                                        placeholder={`Highlight #${index + 1}`}
                                        className="w-full px-4 py-2 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-bold outline-none focus:border-primary transition-all"
                                    />
                                    {formData.highlights.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeHighlight(index)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addHighlight}
                                className="text-[10px] font-black text-primary flex items-center gap-1 uppercase tracking-widest hover:underline pt-1"
                            >
                                <Plus size={12} /> Add Point
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest border-b border-slate-100 pb-2">
                            <ImageIcon size={16} className="text-primary" /> Assets & Media
                        </h3>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`group relative h-48 rounded-[32px] border-2 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center ${imagePreview ? 'border-primary/30' : 'border-slate-200 hover:border-primary hover:bg-primary/5'}`}
                        >
                            {imagePreview ? (
                                <div className="w-full h-full bg-white p-4">
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                        <div className="flex flex-col items-center text-white">
                                            <Upload size={24} className="mb-2" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Replace Primary Asset</span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedFile(null);
                                            setImagePreview(null);
                                            setFormData(prev => ({ ...prev, imageUrl: '' }));
                                        }}
                                        className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all z-20 opacity-0 group-hover:opacity-100"
                                    >
                                        <X size={18} strokeWidth={3} />
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center px-6">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3 mx-auto text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
                                        <Upload size={20} />
                                    </div>
                                    <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-1">Upload Product Image</p>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">PNG, JPG up to 10MB</p>
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="block mb-2 font-black text-slate-500 text-[10px] uppercase tracking-widest">Additional Images (Gallery)</label>
                            <div className="grid grid-cols-4 gap-2 mb-3">
                                {/* Existing Images */}
                                {existingAdditionalImages.map((img, index) => (
                                    <div key={`existing-${index}`} className="relative aspect-square rounded-2xl overflow-hidden group border border-slate-100 shadow-sm">
                                        <img src={getImageUrl(img)} alt={`Existing ${index}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeExistingAdditionalImage(index)}
                                            className="absolute top-1 right-1 bg-red-500/90 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                                        >
                                            <X size={10} strokeWidth={3} />
                                        </button>
                                        <div className="absolute bottom-0 left-0 right-0 bg-slate-900/60 py-0.5 text-center opacity-0 group-hover:opacity-100 transition-all">
                                            <span className="text-[7px] text-white font-black uppercase">Stored</span>
                                        </div>
                                    </div>
                                ))}

                                {/* New Upload Previews */}
                                {additionalImagePreviews.map((preview, index) => (
                                    <div key={`new-${index}`} className="relative aspect-square rounded-2xl overflow-hidden group border border-primary/20 shadow-sm ring-2 ring-primary/5">
                                        <img src={preview} alt={`New ${index}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeNewAdditionalImage(index)}
                                            className="absolute top-1 right-1 bg-red-500/90 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                                        >
                                            <X size={10} strokeWidth={3} />
                                        </button>
                                        <div className="absolute bottom-0 left-0 right-0 bg-primary/60 py-0.5 text-center">
                                            <span className="text-[7px] text-white font-black uppercase tracking-widest">New</span>
                                        </div>
                                    </div>
                                ))}

                                {/* Upload Placeholder */}
                                {(existingAdditionalImages.length + additionalImageFiles.length) < 10 && (
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById('additional-images-edit').click()}
                                        className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center hover:border-primary hover:bg-primary/5 transition-all text-slate-300 hover:text-primary active:scale-95"
                                    >
                                        <Upload size={14} />
                                        <span className="text-[8px] font-black mt-1 uppercase tracking-tighter">Add</span>
                                    </button>
                                )}
                            </div>
                            <input
                                type="file"
                                id="additional-images-edit"
                                accept="image/*"
                                multiple
                                onChange={handleAdditionalFilesChange}
                                className="hidden"
                            />
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Support for up to 10 product gallery shots.</p>
                        </div>

                        <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest border-b border-slate-100 pb-2 pt-2">
                            <IndianRupee size={16} className="text-primary" /> Metrics
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="form-group">
                                <label className="block mb-1.5 font-black text-slate-500 text-[10px] uppercase tracking-widest">Price (₹)</label>
                                <input type="number" name="price" value={formData.price} onChange={handleChange} required className="w-full px-4 py-2 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-bold" />
                            </div>
                            <div className="form-group">
                                <label className="block mb-1.5 font-black text-slate-500 text-[10px] uppercase tracking-widest">Inventory</label>
                                <input type="number" name="stock" value={formData.stock} onChange={handleChange} required className="w-full px-4 py-2 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-bold" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/seller/my-products')}
                        className="px-6 py-2.5 rounded-xl text-slate-500 font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all"
                    >
                        Back to List
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-2.5 bg-primary text-white rounded-xl font-[900] text-[11px] shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 uppercase tracking-widest disabled:opacity-50"
                        style={{ backgroundColor: '#2874f0' }}
                    >
                        {loading ? 'Processing...' : <><CheckCircle size={14} /> Commit Changes</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
