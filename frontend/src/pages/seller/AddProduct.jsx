import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addProduct } from '../../api/sellerApi';
import {
    Package,
    Upload,
    ArrowLeft,
    IndianRupee,
    Layers,
    Tag,
    FileText,
    Image as ImageIcon,
    CheckCircle2,
    AlertCircle,
    Sparkles,
    X,
    Plus
} from 'lucide-react';

export default function AddProduct() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [generatingDesc, setGeneratingDesc] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        highlights: [''],
        price: '',
        category: '',
        brand: '',
        stock: '',
        imageUrl: '',
        images: '', // Comma separated URLs
        weight: '',
        dimensions: '',
        shippingCost: '',
        color: '',
        size: '',
        variant: '',
        model: ''
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [additionalImageFiles, setAdditionalImageFiles] = useState([]);
    const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]);

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
            setImageFile(file);
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
            const newFiles = [...additionalImageFiles, ...files].slice(0, 10);
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

    const removeAdditionalImage = (index) => {
        const newFiles = [...additionalImageFiles];
        const newPreviews = [...additionalImagePreviews];
        newFiles.splice(index, 1);
        newPreviews.splice(index, 1);
        setAdditionalImageFiles(newFiles);
        setAdditionalImagePreviews(newPreviews);
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
            // Basic validation
            if (!formData.name || !formData.price || !formData.category) {
                throw new Error('Please fill in all required fields');
            }

            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'shippingInfo') {
                    data.append('shippingInfo', JSON.stringify({
                        weight: Number(formData.weight),
                        dimensions: formData.dimensions,
                        shippingCost: Number(formData.shippingCost)
                    }));
                } else if (key === 'images') {
                    // We handle images via additionalImages field now
                } else {
                    data.append(key, formData[key]);
                }
            });

            if (imageFile) {
                data.append('image', imageFile);
            }

            if (additionalImageFiles.length > 0) {
                additionalImageFiles.forEach(file => {
                    data.append('additionalImages', file);
                });
            }

            // Correctly handle highlights array
            formData.highlights.filter(h => h.trim() !== '').forEach(h => {
                data.append('highlights[]', h);
            });

            await addProduct(data);

            // Show success (could be a toast, but alert is robust for now)
            alert('Product added successfully!');
            navigate('/seller/my-products');
        } catch (err) {
            console.error('Add product error:', err);
            if (err.response?.status === 409) {
                const existingId = err.response.data.productId;
                setError(
                    <div className="flex flex-col gap-3">
                        <p>{err.response.data.message}</p>
                        <button
                            type="button"
                            onClick={() => navigate(`/seller/edit-product/${existingId}`)}
                            className="text-white px-4 py-2 rounded-xl text-xs font-bold w-fit mt-1 shadow-lg hover:shadow-primary/50 transition-all hover:-translate-y-0.5"
                            style={{ backgroundColor: '#2874f0' }}
                        >
                            Edit Existing Product
                        </button>
                    </div>
                );
            } else {
                setError(err.response?.data?.message || err.message || 'Failed to add product');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="py-6 px-0 max-w-[1000px] mx-auto min-h-screen">
            {/* Header */}
            <div className="mb-6 flex items-center gap-4">
                <button
                    onClick={() => navigate('/seller')}
                    className="bg-bg-secondary border border-glass-border text-text-main px-4 py-2 rounded-xl cursor-pointer flex items-center justify-center transition-all hover:bg-glass-border hover:shadow-md active:scale-95 text-[11px] font-[900] uppercase tracking-widest"
                >
                    Go Back
                </button>
                <div>
                    <h1 className="text-2xl font-[900] text-text-main tracking-tight drop-shadow-sm">
                        Add New Product
                    </h1>
                    <p className="text-text-muted text-[13px] font-bold mt-0.5">
                        Create a new premium listing for your store
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="glass-card p-6 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-600 mb-6 flex items-center gap-3 text-sm font-bold shadow-sm">
                        <AlertCircle size={20} />
                        <div>{error}</div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Left Column: Basic Info */}
                    <div className="flex flex-col gap-5">
                        <h3 className="text-[15px] font-[800] text-text-main flex items-center gap-2 uppercase tracking-wide">
                            <Package size={18} className="text-primary" /> Basic Information
                        </h3>

                        <div className="form-group">
                            <label className="block mb-1.5 font-bold text-text-main text-[13px]">Product Name *</label>
                            <div className="relative">
                                <FileText size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. Wireless Headphones"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-glass-border bg-bg-secondary text-text-main text-[14px] font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="block mb-1.5 font-bold text-text-main text-[13px]">Category *</label>
                            <div className="relative">
                                <Layers size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted z-10" />
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-glass-border bg-bg-secondary text-text-main text-[14px] font-medium appearance-none outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                                >
                                    <option value="">Select Category</option>
                                    <option value="electronics">Electronics</option>
                                    <option value="fashion">Fashion</option>
                                    <option value="home">Home & Living</option>
                                    <option value="beauty">Beauty & Personal Care</option>
                                    <option value="sports">Sports & Outdoors</option>
                                    <option value="toys">Toys & Games</option>
                                    <option value="other">Other</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                                    <svg width="10" height="6" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="block mb-1.5 font-bold text-text-main text-[13px]">Brand</label>
                            <div className="relative">
                                <Tag size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                                <input
                                    type="text"
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleChange}
                                    placeholder="e.g. Sony, Nike (Optional)"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-glass-border bg-bg-secondary text-text-main text-[14px] font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block font-bold text-text-main text-[13px]">Description</label>
                                <button
                                    type="button"
                                    onClick={handleAutoGenerate}
                                    disabled={generatingDesc}
                                    className="text-[11px] font-[900] uppercase tracking-wide text-primary flex items-center gap-1.5 hover:text-[#1260e0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-primary/10 px-2 py-0.5 rounded-md"
                                >
                                    <Sparkles size={12} className={generatingDesc ? 'animate-pulse' : ''} />
                                    {generatingDesc ? 'Generating...' : 'Auto-Generate'}
                                </button>
                            </div>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Describe the key features and benefits of your product..."
                                className="w-full p-3.5 rounded-xl border border-glass-border bg-bg-secondary text-text-main text-[14px] font-medium font-sans resize-y outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-inner leading-relaxed"
                            />
                        </div>

                        <div className="my-1 border-t border-glass-border opacity-50"></div>

                        <h3 className="text-[15px] font-[800] text-text-main flex items-center gap-2 uppercase tracking-wide">
                            <Layers size={18} className="text-primary" /> Product Variants
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="block mb-1.5 font-bold text-text-main text-[13px]">Color</label>
                                <input
                                    type="text"
                                    name="color"
                                    value={formData.color}
                                    onChange={handleChange}
                                    placeholder="e.g. Jet Black"
                                    className="w-full p-2.5 rounded-xl border border-glass-border bg-bg-secondary text-text-main text-[14px] font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                                />
                            </div>
                            <div className="form-group">
                                <label className="block mb-1.5 font-bold text-text-main text-[13px]">Size</label>
                                <input
                                    type="text"
                                    name="size"
                                    value={formData.size}
                                    onChange={handleChange}
                                    placeholder="e.g. XL, 6.7 inch"
                                    className="w-full p-2.5 rounded-xl border border-glass-border bg-bg-secondary text-text-main text-[14px] font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="block mb-1.5 font-bold text-text-main text-[13px]">Model</label>
                                <input
                                    type="text"
                                    name="model"
                                    value={formData.model}
                                    onChange={handleChange}
                                    placeholder="e.g. 256GB"
                                    className="w-full p-2.5 rounded-xl border border-glass-border bg-bg-secondary text-text-main text-[14px] font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                                />
                            </div>
                            <div className="form-group">
                                <label className="block mb-1.5 font-bold text-text-main text-[13px]">Other Variant</label>
                                <input
                                    type="text"
                                    name="variant"
                                    value={formData.variant}
                                    onChange={handleChange}
                                    placeholder="e.g. Int. Version"
                                    className="w-full p-2.5 rounded-xl border border-glass-border bg-bg-secondary text-text-main text-[14px] font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="my-1 border-t border-glass-border opacity-50"></div>

                        <h3 className="text-[15px] font-[800] text-text-main flex items-center gap-2 uppercase tracking-wide">
                            <CheckCircle2 size={18} className="text-primary" /> Key Features (Highlights)
                        </h3>

                        <div className="space-y-3">
                            {formData.highlights.map((highlight, index) => (
                                <div key={index} className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Sparkles size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                                        <input
                                            type="text"
                                            value={highlight}
                                            onChange={(e) => handleHighlightChange(index, e.target.value)}
                                            placeholder={`Feature #${index + 1}`}
                                            className="w-full pl-9 pr-4 py-2 rounded-xl border border-glass-border bg-bg-secondary text-text-main text-[13px] font-medium outline-none focus:border-primary transition-all shadow-inner"
                                        />
                                    </div>
                                    {formData.highlights.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeHighlight(index)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <X size={18} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addHighlight}
                                className="text-[11px] font-[900] uppercase tracking-wide text-primary flex items-center gap-1.5 bg-primary/5 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-all border border-primary/20"
                            >
                                <Plus size={14} /> Add another highlight
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Pricing & Media */}
                    <div className="flex flex-col gap-5">
                        <h3 className="text-[15px] font-[800] text-text-main flex items-center gap-2 uppercase tracking-wide">
                            <IndianRupee size={18} className="text-primary" /> Pricing & Inventory
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="block mb-1.5 font-bold text-text-main text-[13px]">Price (₹) *</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="w-full p-2.5 rounded-xl border border-glass-border bg-bg-secondary text-text-main text-[14px] font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                                />
                            </div>
                            <div className="form-group">
                                <label className="block mb-1.5 font-bold text-text-main text-[13px]">Stock *</label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    placeholder="0"
                                    className="w-full p-2.5 rounded-xl border border-glass-border bg-bg-secondary text-text-main text-[14px] font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="my-1 border-t border-glass-border opacity-50"></div>

                        <h3 className="text-[15px] font-[800] text-text-main flex items-center gap-2 uppercase tracking-wide">
                            <ImageIcon size={18} className="text-primary" /> Product Images
                        </h3>

                        <div className="form-group">
                            <label className="block mb-1.5 font-bold text-text-main text-[13px]">Main Image *</label>
                            <div
                                className="relative cursor-pointer border-2 border-dashed border-glass-border rounded-xl p-4 flex flex-col items-center justify-center bg-bg-secondary hover:border-primary transition-all group"
                                onClick={() => document.getElementById('product-image-upload').click()}
                            >
                                <input
                                    type="file"
                                    id="product-image-upload"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                {imagePreview ? (
                                    <div className="relative w-full aspect-video rounded-lg overflow-hidden group/preview bg-white p-2">
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-contain transition-transform duration-300 group-hover/preview:scale-105" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <p className="text-white text-[10px] font-black uppercase tracking-widest">Change Image</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setImageFile(null);
                                                setImagePreview(null);
                                            }}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-xl shadow-lg hover:scale-110 active:scale-90 transition-all z-20"
                                        >
                                            <X size={16} strokeWidth={3} />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <Upload size={24} className="text-text-muted group-hover:text-primary mb-2 transition-colors" />
                                        <p className="text-[12px] font-bold text-text-main">Choose from Gallery</p>
                                        <p className="text-[10px] text-text-muted">PNG, JPG up to 5MB</p>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="block mb-1.5 font-bold text-text-main text-[13px]">Additional Images (Gallery)</label>
                            <div className="grid grid-cols-4 gap-2 mb-2">
                                {additionalImagePreviews.map((preview, index) => (
                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden group border border-glass-border">
                                        <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeAdditionalImage(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                        >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                                <line x1="6" y1="6" x2="18" y2="18"></line>
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                                {additionalImagePreviews.length < 10 && (
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById('additional-images-upload').click()}
                                        className="aspect-square rounded-lg border-2 border-dashed border-glass-border flex flex-col items-center justify-center hover:border-primary transition-all text-text-muted hover:text-primary bg-bg-secondary/50"
                                    >
                                        <Upload size={16} />
                                        <span className="text-[9px] font-bold mt-1 uppercase">Add</span>
                                    </button>
                                )}
                            </div>
                            <input
                                type="file"
                                id="additional-images-upload"
                                accept="image/*"
                                multiple
                                onChange={handleAdditionalFilesChange}
                                className="hidden"
                            />
                            <p className="text-[10px] text-text-muted">You can upload up to 10 additional images.</p>
                        </div>

                        <div className="my-1 border-t border-glass-border opacity-50"></div>

                        <h3 className="text-[15px] font-[800] text-text-main flex items-center gap-2 uppercase tracking-wide">
                            <Package size={18} className="text-primary" /> Shipping Info
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="block mb-1.5 font-bold text-text-main text-[13px]">Weight (kg)</label>
                                <input
                                    type="number"
                                    name="weight"
                                    value={formData.weight}
                                    onChange={handleChange}
                                    step="0.01"
                                    placeholder="0.00"
                                    className="w-full p-2.5 rounded-xl border border-glass-border bg-bg-secondary text-text-main text-[14px] font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                                />
                            </div>
                            <div className="form-group">
                                <label className="block mb-1.5 font-bold text-text-main text-[13px]">Shipping Cost (₹)</label>
                                <input
                                    type="number"
                                    name="shippingCost"
                                    value={formData.shippingCost}
                                    onChange={handleChange}
                                    placeholder="0"
                                    className="w-full p-2.5 rounded-xl border border-glass-border bg-bg-secondary text-text-main text-[14px] font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                                />
                            </div>
                        </div>
                        <div className="form-group hidden md:block">
                            <label className="block mb-1.5 font-bold text-text-main text-[13px]">Dimensions (L x W x H)</label>
                            <input
                                type="text"
                                name="dimensions"
                                value={formData.dimensions}
                                onChange={handleChange}
                                placeholder="e.g. 20x15x10 cm"
                                className="w-full p-2.5 rounded-xl border border-glass-border bg-bg-secondary text-text-main text-[14px] font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                            />
                        </div>

                        {/* Removed redundant preview area as it is now integrated into the upload box */}
                    </div>
                </div>

                <div className="mt-6 pt-5 border-t border-glass-border flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/seller/my-products')}
                        className="px-6 py-2.5 bg-transparent text-text-muted border-2 border-glass-border rounded-xl text-[14px] font-[800] cursor-pointer hover:bg-glass-border transition-colors hover:text-text-main"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-8 py-2.5 text-white border-none rounded-xl text-[14px] font-[800] flex items-center gap-2 shadow-[0_4px_16px_rgba(40,116,240,0.4)] transition-all hover:-translate-y-1 active:scale-95 uppercase tracking-wide ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:bg-[#1260e0] hover:shadow-[0_6px_20px_rgba(40,116,240,0.6)]'}`}
                        style={{ backgroundColor: '#2874f0' }}
                    >
                        {loading ? 'Adding...' : (
                            <>
                                <CheckCircle2 size={18} strokeWidth={3} /> Add Product
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
