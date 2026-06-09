const Product = require('../models/Product');
const Seller = require('../models/Seller');
const Review = require('../models/Review');
const Order = require('../models/Order');
const { getUploadedUrls } = require('../utils/fileHelper');


class ProductController {
    getProducts = async (req, res) => {
        try {
            const { category, brand, search } = req.query;
            // Get all valid seller IDs (only real sellers in the Seller collection)
            const validSellers = await Seller.find({}, '_id');
            const validSellerIds = validSellers.map(s => s._id);

            // Only show products from real sellers
            const query = {
                isApproved: true,
                status: { $in: ['active', 'out-of-stock'] },
                seller_id: { $in: validSellerIds }
            };

            if (category) query.category = category;
            if (brand) query.brand = new RegExp(brand, 'i');
            if (search) {
                query.$or = [
                    { name: new RegExp(search, 'i') },
                    { description: new RegExp(search, 'i') }
                ];
            }

            const products = await Product.find(query)
                .populate('seller_id', 'businessName name')
                .lean()
                .sort({ createdAt: -1 });

            // Attach ratings dynamically
            for (let product of products) {
                const reviews = await Review.find({ product_id: product._id });
                if (reviews.length > 0) {
                    const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
                    product.averageRating = avg;
                    product.reviewsCount = reviews.length;
                } else {
                    product.averageRating = 0;
                    product.reviewsCount = 0;
                }
                product.id = product._id; // Ensure id is mapped for frontend uses
            }

            res.json(products);
        } catch (err) {
            console.error('getProducts error:', err);
            res.status(500).json({ message: 'Failed to fetch products' });
        }
    };

    getProductById = async (req, res) => {
        try {
            const productDoc = await Product.findById(req.params.id);
            if (!productDoc) return res.status(404).json({ message: 'Product not found' });

            const product = productDoc.toObject();
            
            // Attach rating dynamically
            const reviews = await Review.find({ product_id: product._id });
            if (reviews.length > 0) {
                const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
                product.averageRating = avg;
                product.reviewsCount = reviews.length;
            } else {
                product.averageRating = 0;
                product.reviewsCount = 0;
            }
            product.id = product._id;

            // Return product if it exists. Discoverability (approved/active) is handled in list views.
            // This allows users to review products they've purchased even if they're now inactive.
            res.json(product);
        } catch (err) {
            console.error('getProductById error:', err);
            res.status(400).json({ message: 'Invalid product id' });
        }
    };

    getReviews = async (req, res) => {
        try {
            const reviews = await Review.find({ product_id: req.params.id })
                .populate('user_id', 'name')
                .sort({ createdAt: -1 });
            res.json(reviews);
        } catch (err) {
            console.error('getReviews error:', err);
            res.status(500).json({ message: 'Failed to fetch reviews' });
        }
    };

    postReview = async (req, res) => {
        try {
            const { rating, title, comment } = req.body;

            if (!rating || !title || !comment) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            // Check if user already reviewed
            const existingReview = await Review.findOne({ product_id: req.params.id, user_id: req.user._id });
            if (existingReview) {
                return res.status(400).json({ message: 'You have already reviewed this product' });
            }

            // Check if verified purchase (matching productId in order items)
            const order = await Order.findOne({ user_id: req.user._id, 'items.productId': req.params.id });
            const isVerified = !!order;

            const reviewImages = getUploadedUrls(req.files, '/uploads/reviews');

            const review = new Review({
                user_id: req.user._id,
                product_id: req.params.id,
                rating,
                title,
                comment,
                images: reviewImages,
                isVerifiedPurchase: isVerified
            });

            await review.save();
            res.status(201).json(review);
        } catch (err) {
            console.error('postReview error:', err);
            res.status(500).json({ message: 'Failed to post review' });
        }
    };
}

module.exports = new ProductController();
