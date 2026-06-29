// backend/controllers/paymentController.js
const Payment = require('../models/Payment');
const Cart = require('../models/Cart');

// Submit manual payment details (M-Pesa/Airtel)
const submitManualPayment = async (req, res) => {
    try {
        const { 
            fullName, 
            email, 
            phoneNumber, 
            paymentMethod, 
            transactionCode, 
            amount, 
            cartItems, 
            sessionId 
        } = req.body;

        console.log('📝 Manual Payment Submission:');
        console.log('Customer:', fullName);
        console.log('Email:', email);
        console.log('Phone:', phoneNumber);
        console.log('Method:', paymentMethod);
        console.log('Transaction Code:', transactionCode);
        console.log('Amount:', amount);
        console.log('Session ID:', sessionId);

        // Validate required fields
        if (!fullName || !email || !phoneNumber || !paymentMethod || !transactionCode || !amount) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address'
            });
        }

        // Validate phone number
        const phoneRegex = /^[0-9]{10,12}$/;
        if (!phoneRegex.test(phoneNumber.replace(/^\+/, ''))) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid phone number (format: 254712345678)'
            });
        }

        // Generate order ID
        const orderId = `YEA${Date.now()}`;

        // Create payment record
        const payment = new Payment({
            orderId,
            fullName,
            email,
            phoneNumber,
            paymentMethod,
            transactionCode,
            amount: Number(amount),
            cartItems: cartItems || [],
            sessionId: sessionId || 'guest',
            status: 'pending'
        });

        await payment.save();

        // Optional: Clear cart after successful submission
        if (sessionId) {
            await Cart.findOneAndUpdate(
                { sessionId },
                { items: [], totalAmount: 0 },
                { new: true }
            );
            console.log('🛒 Cart cleared for session:', sessionId);
        }

        console.log('✅ Payment record saved:', payment._id);
        console.log(`📧 Notification will be sent to YEA: ${email}`);

        res.status(201).json({
            success: true,
            message: 'Payment details submitted successfully! We will verify and send your tickets shortly.',
            data: {
                orderId: payment.orderId,
                status: payment.status,
                email: payment.email
            }
        });

    } catch (error) {
        console.error('❌ Error submitting payment:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to submit payment details'
        });
    }
};

// Get all payments (for admin)
const getPayments = async (req, res) => {
    try {
        const payments = await Payment.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            data: payments
        });
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get payment by order ID
const getPaymentByOrderId = async (req, res) => {
    try {
        const { orderId } = req.params;
        const payment = await Payment.findOne({ orderId });
        
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        res.json({
            success: true,
            data: payment
        });
    } catch (error) {
        console.error('Error fetching payment:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update payment status (for admin)
const updatePaymentStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status, notes } = req.body;

        const payment = await Payment.findOne({ orderId });
        
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        payment.status = status || payment.status;
        if (notes) payment.notes = notes;
        if (status === 'completed') {
            payment.ticketsSent = true;
            payment.ticketsSentAt = new Date();
        }

        await payment.save();

        res.json({
            success: true,
            message: 'Payment status updated successfully',
            data: payment
        });
    } catch (error) {
        console.error('Error updating payment:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete payment (admin only)
const deletePayment = async (req, res) => {
    try {
        const { orderId } = req.params;
        const payment = await Payment.findOneAndDelete({ orderId });
        
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        res.json({
            success: true,
            message: 'Payment deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting payment:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    submitManualPayment,
    getPayments,
    getPaymentByOrderId,
    updatePaymentStatus,
    deletePayment
};
