// routes/payment.js
const express = require('express');
const router = express.Router();
const {
    initiatePayment,
    payheroCallback,
    checkPaymentStatus,
    getPaymentByOrderId,
    getPayments,
    updatePaymentStatus
} = require('../controllers/paymentController');

// PayHero STK Push - NEW
router.post('/initiate', initiatePayment);

// PayHero Callback URL - NEW
router.post('/callback', payheroCallback);

// Check payment status - UPDATED to use externalReference
router.get('/status/:externalReference', checkPaymentStatus);

// Get payment by order ID - KEPT
router.get('/order/:orderId', getPaymentByOrderId);

// Admin routes - KEPT
router.get('/payments', getPayments);
router.put('/payments/:orderId/status', updatePaymentStatus);

// Manual payment submission - KEPT (if you want to keep it as fallback)
// router.post('/submit-payment', submitManualPayment);

module.exports = router;
