import React, { useEffect, useRef } from 'react';
import { Search, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { getProducts } from '../../api/productApi';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../../utils/imageConfig';

export default function SearchOverlay({ isOpen, onClose, onSearch }) {
    const inputRef = useRef(null);
    const navigate = useNavigate();
    const [query, setQuery] = React.useState('');
    const [suggestions, setSuggestions] = React.useState([]);
    const [loading, setLoading] = React.useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setQuery('');
            setSuggestions([]);
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [isOpen]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim().length > 1) {
                setLoading(true);
                try {
                    const data = await getProducts({ search: query });
                    setSuggestions(data.slice(0, 10));
                } catch (err) {
                    console.error('Failed to fetch suggestions:', err);
                } finally {
                    setLoading(false);
                }
            } else {
                setSuggestions([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [query]);

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'var(--bg-primary)',
                zIndex: 2500,
                display: 'flex',
                flexDirection: 'column',
                animation: 'fadeIn 0.2s ease-out'
            }}
        >
            <div style={{
                height: 'var(--header-height)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 var(--space-4)',
                gap: 'var(--space-3)',
                borderBottom: '1px solid var(--glass-border)',
                background: 'var(--bg-secondary)'
            }}>
                <button
                    onClick={onClose}
                    style={{ background: 'transparent', border: 'none', padding: 'var(--space-2)', color: 'var(--text-main)', cursor: 'pointer' }}
                >
                    <ArrowLeft size={24} />
                </button>
                <div style={{
                    flex: 1,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <Search size={18} style={{ position: 'absolute', left: 'var(--space-3)', color: 'var(--text-dim)' }} />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search products..."
                        style={{
                            width: '100%',
                            padding: 'var(--space-3) var(--space-3) var(--space-3) var(--space-10)',
                            borderRadius: '12px',
                            border: '1px solid var(--glass-border)',
                            background: 'var(--bg-primary)',
                            fontSize: '16px',
                            outline: 'none',
                            color: 'var(--text-main)',
                            transition: 'all 0.3s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && query.trim()) {
                                onSearch(query);
                            }
                        }}
                    />
                </div>
            </div>

            <div style={{ padding: '0px', flex: 1, overflowY: 'auto', background: 'white' }}>
                {suggestions.length > 0 ? (
                    <div style={{ padding: '8px' }}>
                        {suggestions.map(item => (
                            <div
                                key={item._id}
                                onClick={() => {
                                    onClose();
                                    navigate(`/products/${item._id}`);
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px',
                                    borderBottom: '1px solid var(--glass-border)',
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{ width: '40px', height: '40px', background: '#f8fafc', borderRadius: '8px', padding: '4px' }}>
                                    <img src={getImageUrl(item.imageUrl)} alt="" style={{ width: '100%', height: '100%', objectContain: 'contain', mixBlendMode: 'multiply' }} onError={(e) => e.target.src = 'https://via.placeholder.com/40'} />
                                </div>
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#2874f0', textTransform: 'uppercase' }}>{item.brand}</div>
                                </div>
                                <ArrowRight size={16} color="var(--text-dim)" />
                            </div>
                        ))}
                        <button
                            onClick={() => onSearch(query)}
                            style={{ width: '100%', padding: '16px', background: 'transparent', border: 'none', color: '#2874f0', fontWeight: 800, fontSize: '12px', letterSpacing: '0.5px' }}
                        >
                            VIEW ALL RESULTS FOR "{query.toUpperCase()}"
                        </button>
                    </div>
                ) : (
                    <div style={{ padding: '24px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Popular Searches
                        </h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {['Smartphones', 'Laptops', 'Headphones', 'Watches', 'Shoes'].map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => onSearch(tag)}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '20px',
                                        background: 'var(--bg-secondary)',
                                        border: '1px solid var(--glass-border)',
                                        fontSize: '14px',
                                        color: 'var(--text-main)',
                                        fontWeight: 500
                                    }}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
