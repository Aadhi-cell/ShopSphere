const https = require('https');

class DeliveryController {
    checkDelivery = async (req, res) => {
        try {
            const { pincode } = req.body;

            if (!pincode || pincode.length !== 6 || isNaN(pincode)) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Please enter a valid 6-digit pincode.' 
                });
            }

            // Real-time lookup using India Post Public API
            const getPincodeData = (pin) => {
                return new Promise((resolve, reject) => {
                    https.get(`https://api.postalpincode.in/pincode/${pin}`, (apiRes) => {
                        let data = '';
                        apiRes.on('data', (chunk) => data += chunk);
                        apiRes.on('end', () => {
                            try {
                                resolve(JSON.parse(data));
                            } catch (e) {
                                resolve(null);
                            }
                        });
                    }).on('error', (err) => {
                        resolve(null);
                    });
                });
            };

            const data = await getPincodeData(pincode);

            if (!data || !data[0] || data[0].Status !== 'Success' || !data[0].PostOffice) {
                return res.status(200).json({
                    success: true,
                    available: false,
                    message: 'Service unavailable for this pincode. Please try another.'
                });
            }

            // Extract location info
            const location = data[0].PostOffice[0];
            const city = location.District;
            const state = location.State;

            // Estimated delivery date (3-5 days from now)
            const deliveryDays = Math.floor(Math.random() * 3) + 3;
            const date = new Date();
            date.setDate(date.getDate() + deliveryDays);
            
            const options = { weekday: 'long', day: 'numeric', month: 'short' };
            const deliveryDate = date.toLocaleDateString('en-IN', options);

            res.status(200).json({
                success: true,
                available: true,
                deliveryDate,
                location: `${city}, ${state}`,
                isFree: true,
                message: 'Delivery available'
            });

        } catch (err) {
            console.error('checkDelivery error:', err);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    };
}

module.exports = new DeliveryController();
