const getUploadedUrl = (file, defaultPrefix) => {
    if (!file) return '';
    // If upload went to Cloudinary, path or secure_url is the full HTTP link
    const pathUrl = file.path || file.secure_url;
    if (pathUrl && (pathUrl.startsWith('http://') || pathUrl.startsWith('https://'))) {
        return pathUrl;
    }
    return `${defaultPrefix}/${file.filename}`;
};

const getUploadedUrls = (files, defaultPrefix) => {
    if (!files) return [];
    if (Array.isArray(files)) {
        return files.map(file => getUploadedUrl(file, defaultPrefix));
    }
    return [];
};

module.exports = { getUploadedUrl, getUploadedUrls };
