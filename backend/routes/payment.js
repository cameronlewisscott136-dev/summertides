// backend/routes/payment.js
const express = require('express');
const router = express.Router();
const {
    submitManualPayment,
    getPayments,
    getPaymentByOrderId,
    updatePaymentStatus,
    deletePayment
} = require('../controllers/paymentController');

// Manual payment submission (M-Pesa/Airtel)
router.post('/submit-payment', submitManualPayment);

// Admin routes
router.get('/payments', getPayments);
router.get('/payments/:orderId', getPaymentByOrderId);
router.put('/payments/:orderId/status', updatePaymentStatus);
router.delete('/payments/:orderId', deletePayment);

module.exports = router;
