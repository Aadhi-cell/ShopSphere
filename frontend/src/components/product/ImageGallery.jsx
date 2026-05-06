import React, { useState } from 'react';
import { Heart, Share2, Play, ChevronUp, ChevronDown } from 'lucide-react';

const ImageGallery = ({ images = [], productName = 'Product', isInWishlist = false, onToggleWishlist = () => { } }) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [hoverIdx, setHoverIdx] = useState(null);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0, show: false });

  // Use the images provided by the seller
  const displayImages = images && images.length > 0 ? images : ['https://via.placeholder.com/600x600?text=No+Image+Available'];

  // Dynamic "more" count based on images length
  const MAX_THUMBS = 5;
  const moreCount = displayImages.length > MAX_THUMBS ? displayImages.length - MAX_THUMBS : 0;


  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y, show: true });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: productName,
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert('Link copied to clipboard!');
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const currentMainImage = displayImages[hoverIdx !== null ? hoverIdx : selectedIdx];

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      {/* Thumbnails Sidebar */}
      <div className="hidden md:flex flex-col gap-3 w-16 lg:w-20 shrink-0">
        <div className="flex flex-col gap-3 overflow-y-auto scrollbar-hide max-h-[500px] py-1">
          {displayImages.slice(0, MAX_THUMBS).map((img, idx) => (
            <button
              key={idx}
              onMouseEnter={() => setHoverIdx(idx)}
              onMouseLeave={() => setHoverIdx(null)}
              onClick={() => setSelectedIdx(idx)}
              className={`relative aspect-square rounded-lg border-2 overflow-hidden transition-all duration-200 ${selectedIdx === idx ? 'border-primary ring-2 ring-primary/20 scale-105' : 'border-gray-100 hover:border-gray-300'
                }`}
            >
              <img src={img} alt={`${productName} thumbnail ${idx}`} className="w-full h-full object-contain" />
              {idx === MAX_THUMBS - 1 && moreCount > 0 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                  <span className="text-white font-bold text-sm">+{moreCount}</span>
                </div>
              )}
            </button>
          ))}

        </div>
      </div>

      {/* Main Image Viewer */}
      <div className="flex-1 relative bg-white rounded-2xl border border-gray-100 shadow-sm group">
        <div
          className="relative aspect-square w-full flex items-center justify-center cursor-zoom-in overflow-hidden rounded-2xl z-20"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setZoomPos(prev => ({ ...prev, show: false }))}
        >
          <img
            src={currentMainImage}
            alt={productName}
            className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
          />

          {/* Actions Overlay */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-40">
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md shadow-lg flex items-center justify-center text-gray-700 hover:text-primary hover:bg-white transition-all transform hover:scale-110"
            >
              <Share2 size={20} />
            </button>
            <button
              onClick={onToggleWishlist}
              className={`w-10 h-10 rounded-full bg-white/80 backdrop-blur-md shadow-lg flex items-center justify-center transition-all transform hover:scale-110 ${isInWishlist ? 'text-rose-500 bg-white' : 'text-gray-400 hover:text-rose-400'
                }`}
            >
              <Heart size={20} fill={isInWishlist ? 'currentColor' : 'none'} />
            </button>
          </div>


        </div>

        {/* External Zoom Window (Desktop Only) - MOVED OUTSIDE overflow-hidden container */}
        {zoomPos.show && (
          <div
            className="hidden lg:block absolute top-0 left-[calc(100%+24px)] w-[600px] h-[600px] bg-white border border-gray-200 shadow-2xl z-[999] rounded-xl overflow-hidden pointer-events-none transition-opacity duration-300"
            style={{
              backgroundImage: `url(${currentMainImage})`,
              backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
              backgroundSize: '150%',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-widest border border-white/10">
              HD Precision Zoom
            </div>
          </div>
        )}

        {/* Mobile Thumbnails */}
        <div className="md:hidden flex gap-2 overflow-x-auto p-4 scrollbar-hide border-t border-gray-50">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIdx(idx)}
              className={`w-14 h-14 shrink-0 rounded-lg border-2 overflow-hidden ${selectedIdx === idx ? 'border-primary' : 'border-gray-100'
                }`}
            >
              <img src={img} alt={`${productName} ${idx}`} className="w-full h-full object-contain" />
            </button>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .text-primary { color: #2874f0; }
        .border-primary { border-color: #2874f0; }
      `}} />
    </div>
  );
};

export default ImageGallery;
