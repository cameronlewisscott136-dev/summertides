// routes/payment.js
const express = require('express');
const router = express.Router();
const {
    initiatePayment,
    paymentCallback,
    checkPaymentStatus,
    getPaymentByOrderId
} = require('../controllers/paymentController');

// Initiate payment
router.post('/initiate', initiatePayment);

// Payment callback (M-Pesa)
router.post('/callback', paymentCallback);

// Check payment status
router.get('/status/:checkoutRequestID', checkPaymentStatus);

// Get payment by order ID
router.get('/order/:orderId', getPaymentByOrderId);

module.exports = router;