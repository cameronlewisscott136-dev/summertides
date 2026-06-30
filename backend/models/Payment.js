// backend/routes/payment.js
const express = require('express');
const router = express.Router();
const {
    initiatePayment,
    payheroCallback,
    checkPaymentStatus,
    getPaymentByOrderId,
    submitManualPayment,
    getPayments,
    updatePaymentStatus,
} = require('../controllers/paymentController');

// PayHero STK Push
router.post('/initiate', initiatePayment);

// PayHero Callback URL
router.post('/payhero-callback', payheroCallback);

// Check payment status
router.get('/status/:externalReference', checkPaymentStatus);

// Get payment by order ID
router.get('/order/:orderId', getPaymentByOrderId);

// Manual payment submission (fallback)
router.post('/submit-payment', submitManualPayment);

// Admin routes
router.get('/payments', getPayments);
router.put('/payments/:orderId/status', updatePaymentStatus);

module.exports = router;
