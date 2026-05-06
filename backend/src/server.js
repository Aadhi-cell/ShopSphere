const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const connectDB = require('./db');
const PromotionService = require('./services/promotionService');

// Import Controllers (for Webhook)
const orderController = require('./controllers/orderController');
const supportController = require('./controllers/supportController');
const adminController = require('./controllers/adminController');


// Import Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const profileRoutes = require('./routes/profileRoutes');
const systemRoutes = require('./routes/systemRoutes');
const publicSupportRoutes = require('./routes/publicSupportRoutes');
const contentRoutes = require('./routes/contentRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  }
});

// Attach IO to orderController for real-time notifications
orderController.attachIo(io);
// Attach IO to supportController for seller message notifications
supportController.attachIo(io);
// Attach IO to adminController for real-time approval status updates
adminController.attachIo(io);


const PORT = process.env.PORT || 5000;

// Socket.io Connection Logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('joinOrderRoom', (orderId) => {
    socket.join(orderId);
    console.log(`Socket ${socket.id} joined room: ${orderId}`);
  });
  socket.on('joinSellerRoom', (sellerId) => {
    socket.join(sellerId);
    console.log(`Socket ${socket.id} joined seller room: ${sellerId}`);
  });
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Connect to MongoDB
connectDB();

app.use(cors());

// Stripe Webhook needs raw body
app.post('/api/webhook', express.raw({ type: 'application/json' }), orderController.handleWebhook);

// Body parser for other routes
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Mount Routes
app.use('/', systemRoutes);
app.use('/api', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes(io));
app.use('/api/seller', sellerRoutes(io)); // Pass io for real-time updates
app.use('/api/seller/promotion', require('./routes/sellerPromotionRoutes'));
app.use('/api/admin', adminRoutes);
app.use('/api/admin/promotion', require('./routes/adminPromotionRoutes'));
app.use('/api/profile', profileRoutes);
app.use('/api/support', publicSupportRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/delivery', deliveryRoutes);


// Start Post-DB Services
PromotionService.start();

server.listen(PORT, '127.0.0.1', () => {
  console.log(`API server listening on http://127.0.0.1:${PORT}`);
});