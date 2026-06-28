// index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

// Import routes
const cartRoutes = require('./routes/cart');
const paymentRoutes = require('./routes/payment');
const eventRoutes = require('./routes/events');

const app = express();

// ============================================
// SECURITY MIDDLEWARE (Added for production)
// ============================================

// Helmet for security headers
app.use(helmet());

// Rate limiting to prevent abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

// ============================================
// CORS - Keep your existing origins
// ============================================

app.use(cors({
    origin: [
        'http://localhost:5173', 
        'https://graceful-hotteok-15efe8.netlify.app',
        'https://graceful-hotteok-15efe8.netlify.app/api',
        'https://summertides-eight.vercel.app',
        'https://summertides-8xx07vmzk-cameronlewisscott136-devs-projects.vercel.app',
        'https://summertides-nbcy0qhhf-cameronlewisscott136-devs-projects.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// DATABASE CONNECTION
// ============================================

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/summer-tides')
    .then(() => {
        console.log('✅ MongoDB connected successfully');
        console.log(`📊 Database: ${mongoose.connection.name}`);
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

// ============================================
// ROUTES
// ============================================

app.use('/api/cart', cartRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/events', eventRoutes);

// ============================================
// HEALTH CHECK
// ============================================

app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Summer Tides API is running',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        // Added M-Pesa status for monitoring
        mpesa: {
            paybill: process.env.MPESA_SHORTCODE || 'Not configured',
            bank: process.env.YEA_BANK_NAME || 'Not configured',
            env: process.env.MPESA_ENV || 'Not configured',
        }
    });
});

// ============================================
// M-PESA TEST ENDPOINT (Optional - for testing)
// ============================================

// Simple endpoint to test if M-Pesa is configured
app.get('/api/mpesa/status', (req, res) => {
    res.json({
        success: true,
        configured: {
            consumerKey: !!process.env.MPESA_CONSUMER_KEY,
            consumerSecret: !!process.env.MPESA_CONSUMER_SECRET,
            passkey: !!process.env.MPESA_PASSKEY,
            shortcode: !!process.env.MPESA_SHORTCODE,
        },
        bank: {
            name: process.env.YEA_BANK_NAME || 'Not configured',
            account: process.env.YEA_ACCOUNT_NAME || 'Not configured',
        },
        environment: process.env.MPESA_ENV || 'Not configured',
    });
});

// ============================================
// 404 HANDLER
// ============================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================

app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    
    res.status(status).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('========================================');
    console.log('🚀 Summer Tides API Server');
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Port: ${PORT}`);
    console.log(`🏦 Bank: ${process.env.YEA_BANK_NAME || 'Not configured'}`);
    console.log(`📱 Paybill: ${process.env.MPESA_SHORTCODE || 'Not configured'}`);
    console.log(`💳 M-Pesa Env: ${process.env.MPESA_ENV || 'Not configured'}`);
    console.log('========================================');
});
