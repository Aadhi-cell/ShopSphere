const Banner = require('../models/Banner');
const Page = require('../models/Page');
const Announcement = require('../models/Announcement');
const { getUploadedUrl } = require('../utils/fileHelper');

// --- Banners ---
exports.getActiveBanners = async (req, res) => {
    try {
        const now = new Date();
        
        // Auto-expire banners
        await Banner.updateMany(
            { status: { $in: ['Active', 'Scheduled'] }, endDate: { $lt: now } },
            { $set: { status: 'Expired' } }
        );

        const banners = await Banner.find({
            status: { $in: ['Active', 'Scheduled'] },
            $or: [
                { status: 'Active', $or: [
                    { startDate: { $lte: now }, endDate: { $gte: now } },
                    { startDate: { $lte: now }, endDate: null },
                    { startDate: null, endDate: { $gte: now } },
                    { startDate: null, endDate: null }
                ]},
                { status: 'Scheduled', startDate: { $lte: now }, endDate: { $gte: now } }
            ]
        }).sort({ priority: -1, order: 1 });
        console.log('Active Banners Found Count:', banners.length);
        res.json(banners);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getBanners = async (req, res) => {
    try {
        const banners = await Banner.find().sort({ order: 1 });
        res.json(banners);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.trackBanner = async (req, res) => {
    try {
        const { action } = req.query;
        const bannerId = req.params.id;
        
        const update = {};
        if (action === 'click') {
            update.$inc = { clicks: 1 };
        } else if (action === 'impression') {
            update.$inc = { impressions: 1 };
        } else {
            return res.status(400).json({ message: 'Invalid action' });
        }

        await Banner.findByIdAndUpdate(bannerId, update);
        res.json({ message: 'Tracked successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createBanner = async (req, res) => {
    try {
        const insertData = { ...req.body };
        if (req.file) {
            insertData.imageUrl = getUploadedUrl(req.file, '/uploads/banners');
        }
        const banner = new Banner(insertData);
        await banner.save();
        res.status(201).json(banner);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateBanner = async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.file) {
            updateData.imageUrl = getUploadedUrl(req.file, '/uploads/banners');
        }
        const banner = await Banner.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(banner);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteBanner = async (req, res) => {
    try {
        await Banner.findByIdAndDelete(req.params.id);
        res.json({ message: 'Banner deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// --- Pages ---
exports.getPages = async (req, res) => {
    try {
        const pages = await Page.find();
        res.json(pages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getPageBySlug = async (req, res) => {
    try {
        const page = await Page.findOne({ slug: req.params.slug });
        if (!page) return res.status(404).json({ message: 'Page not found' });
        res.json(page);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createPage = async (req, res) => {
    try {
        const page = new Page(req.body);
        await page.save();
        res.status(201).json(page);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updatePage = async (req, res) => {
    try {
        const page = await Page.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(page);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deletePage = async (req, res) => {
    try {
        await Page.findByIdAndDelete(req.params.id);
        res.json({ message: 'Page deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// --- Announcements ---
exports.getAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ createdAt: -1 });
        res.json(announcements);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getActiveAnnouncements = async (req, res) => {
    try {
        const now = new Date();
        const announcements = await Announcement.find({
            status: 'Active',
            $or: [
                { startDate: { $lte: now }, endDate: { $gte: now } },
                { startDate: null, endDate: null },
                { startDate: { $lte: now }, endDate: null },
                { startDate: null, endDate: { $gte: now } }
            ]
        });
        res.json(announcements);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createAnnouncement = async (req, res) => {
    try {
        const announcement = new Announcement(req.body);
        await announcement.save();
        res.status(201).json(announcement);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(announcement);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteAnnouncement = async (req, res) => {
    try {
        await Announcement.findByIdAndDelete(req.params.id);
        res.json({ message: 'Announcement deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
