const Banner = require('../models/Banner');
const PromotionRequest = require('../models/PromotionRequest');

/**
 * Service to handle automated promotion tasks:
 * 1. Activate scheduled banners when their start date is reached.
 * 2. Deactivate active banners when their end date is reached.
 */
class PromotionService {
    async checkPromotions() {
        try {
            const now = new Date();

            // 1. Activate Scheduled Banners
            const toActivate = await Banner.find({
                status: 'Scheduled',
                startDate: { $lte: now },
                isActive: true
            });

            for (const banner of toActivate) {
                banner.status = 'Active';
                await banner.save();
                console.log(`[PromotionService] Activated banner: ${banner.title}`);
            }

            // 2. Deactivate Expired Banners
            const toDeactivate = await Banner.find({
                status: 'Active',
                endDate: { $lte: now }
            });

            for (const banner of toDeactivate) {
                banner.status = 'Expired';
                banner.isActive = false;
                await banner.save();
                console.log(`[PromotionService] Deactivated expired banner: ${banner.title}`);
            }

            // 3. Update PromotionRequest statuses if needed (optional)
            // e.g., Mark requests as 'Completed' if their banner has expired

        } catch (error) {
            console.error('[PromotionService] Error checking promotions:', error);
        }
    }

    start() {
        // Run once on startup
        this.checkPromotions();
        
        // Then run every hour (3600000ms)
        setInterval(() => this.checkPromotions(), 1000 * 60 * 60);
        console.log('[PromotionService] Background service started.');
    }
}

module.exports = new PromotionService();
