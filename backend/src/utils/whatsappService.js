class WhatsAppService {
    constructor() {
        this.enabled = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);

        if (this.enabled) {
            try {
                // Dynamic require to prevent crashing if not 'npm install'ed yet
                const twilio = require('twilio');
                this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
                this.fromNumber = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';
                this.adminNumbers = process.env.ADMIN_WHATSAPP_NUMBERS ? process.env.ADMIN_WHATSAPP_NUMBERS.split(',') : [];
            } catch (err) {
                console.error('Failed to initialize Twilio client. Did you run `npm install twilio`?', err);
                this.enabled = false;
            }
        }
    }

    async sendMessage(toPhone, message) {
        if (!toPhone) return false;

        let formattedPhone = toPhone.toString().trim();
        if (!formattedPhone.startsWith('+')) {
            formattedPhone = '+91' + formattedPhone; // Defaults to IN code
        }

        if (!this.enabled) {
            console.log('\n=============================================');
            console.log(`🟢 [MOCK WHATSAPP MESSAGE TO ${formattedPhone}]`);
            console.log(message);
            console.log('=============================================\n');
            console.log('ℹ️  Add TWILIO logs and numbers to .env to enable real delivery.\n');
            return true;
        }

        try {
            await this.client.messages.create({
                from: this.fromNumber,
                to: `whatsapp:${formattedPhone}`,
                body: message
            });
            return true;
        } catch (error) {
            console.error('WhatsApp API Error:', error.message);
            return false;
        }
    }

    async sendOrderAlertToAdmin(order) {
        if (!order || !order.pricing) return;

        // High Value Orders (> ₹5000)
        if (order.pricing.grandTotal > 5000) {
            const customerName = order.customer?.name || 'Guest User';
            const value = order.pricing.grandTotal;
            const items = order.items.length;

            const msg = `🔥 *High-Value Order Received!*\n\n*Order ID:* ${order._id}\n*Customer:* ${customerName}\n*Items:* ${items}\n*Total Value:* ₹${value}\n\nPlease check the admin dashboard to process this priority order immediately. 🚀`;

            if (this.enabled && this.adminNumbers && this.adminNumbers.length > 0) {
                const promises = this.adminNumbers.map(num => this.sendMessage(num, msg));
                await Promise.allSettled(promises);
            } else {
                await this.sendMessage('+910000000000 (ADMIN)', msg);
            }
        }
    }

    async sendPayoutAlertToSeller(seller, amount) {
        if (!seller || !amount) return;

        const sellerPhone = seller.phone || seller.contactNumber || seller.mobile;
        if (!sellerPhone) {
            console.warn('Cannot send WA alert: Seller phone not found');
            return;
        }

        const msg = `💰 *ShopSphere Payout Processed!*\n\nHello ${seller.name},\nYour recent payout of *₹${amount}* has been approved by the admin.\n\nThe amount should reflect in your registered bank account soon. Keep growing with us! 🚀`;

        await this.sendMessage(sellerPhone, msg);
    }
}

module.exports = new WhatsAppService();
