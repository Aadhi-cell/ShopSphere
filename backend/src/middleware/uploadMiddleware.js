const multer = require('multer');
const path = require('path');
const fs = require('fs');

const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME && 
                      process.env.CLOUDINARY_API_KEY && 
                      process.env.CLOUDINARY_API_SECRET;

let uploadBanner, uploadProduct, uploadSellerDoc, uploadReturnProof, uploadReviewPhotos;

if (useCloudinary) {
    const cloudinary = require('cloudinary').v2;
    const { CloudinaryStorage } = require('multer-storage-cloudinary');

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
        api_key: process.env.CLOUDINARY_API_KEY.trim(),
        api_secret: process.env.CLOUDINARY_API_SECRET.trim()
    });

    const bannerStorage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'shopsphere/banners',
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif']
        }
    });

    const productStorage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'shopsphere/products',
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
        }
    });

    const sellerDocStorage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'shopsphere/seller_docs',
            allowed_formats: ['jpg', 'png', 'jpeg', 'pdf']
        }
    });

    const returnProofStorage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'shopsphere/returns',
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
        }
    });

    const reviewPhotoStorage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'shopsphere/reviews',
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
        }
    });

    uploadBanner = multer({
        storage: bannerStorage,
        limits: { fileSize: 50 * 1024 * 1024 }
    });

    uploadProduct = multer({
        storage: productStorage,
        limits: { fileSize: 10 * 1024 * 1024 }
    });

    uploadSellerDoc = multer({
        storage: sellerDocStorage,
        limits: { fileSize: 50 * 1024 * 1024 }
    });

    uploadReturnProof = multer({
        storage: returnProofStorage,
        limits: { fileSize: 20 * 1024 * 1024 }
    });

    uploadReviewPhotos = multer({
        storage: reviewPhotoStorage,
        limits: { fileSize: 10 * 1024 * 1024 }
    });
} else {
    // FALLBACK TO DISK STORAGE
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            const dir = path.join(__dirname, '../../uploads/banners');
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            cb(null, dir);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix + path.extname(file.originalname));
        }
    });

    uploadBanner = multer({
        storage: storage,
        limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
        fileFilter: (req, file, cb) => {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('Only images are allowed'));
            }
        }
    });

    const productStorage = multer.diskStorage({
        destination: function (req, file, cb) {
            const dir = path.join(__dirname, '../../uploads/products');
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            cb(null, dir);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
        }
    });

    uploadProduct = multer({
        storage: productStorage,
        limits: { fileSize: 10 * 1024 * 1024 }, // 50MB limit
        fileFilter: (req, file, cb) => {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('Only images are allowed'));
            }
        }
    });

    const sellerDocStorage = multer.diskStorage({
        destination: function (req, file, cb) {
            const dir = path.join(__dirname, '../../uploads/seller_docs');
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            cb(null, dir);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, 'id-' + uniqueSuffix + path.extname(file.originalname));
        }
    });

    uploadSellerDoc = multer({
        storage: sellerDocStorage,
        limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
        fileFilter: (req, file, cb) => {
            if (['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'].includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error('Only JPG, PNG and PDF files are allowed'));
            }
        }
    });

    const returnProofStorage = multer.diskStorage({
        destination: function (req, file, cb) {
            const dir = path.join(__dirname, '../../uploads/returns');
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            cb(null, dir);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, 'return-' + uniqueSuffix + path.extname(file.originalname));
        }
    });

    uploadReturnProof = multer({
        storage: returnProofStorage,
        limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
        fileFilter: (req, file, cb) => {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('Only images are allowed for return proof'));
            }
        }
    });

    const reviewPhotoStorage = multer.diskStorage({
        destination: function (req, file, cb) {
            const dir = path.join(__dirname, '../../uploads/reviews');
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            cb(null, dir);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, 'review-' + uniqueSuffix + path.extname(file.originalname));
        }
    });

    uploadReviewPhotos = multer({
        storage: reviewPhotoStorage,
        limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
        fileFilter: (req, file, cb) => {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('Only images are allowed for reviews'));
            }
        }
    });
}

module.exports = { uploadBanner, uploadProduct, uploadSellerDoc, uploadReturnProof, uploadReviewPhotos };
