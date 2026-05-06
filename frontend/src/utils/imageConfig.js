const baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001';

export const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/600x600/f8fafc/94a3b8?text=No+Image';
    if (path.startsWith('http')) return path;

    // Ensure path starts with /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = `${baseURL}${cleanPath}`;

    return url;
};
