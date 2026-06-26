// backend/controllers/paymentController.js
const Payment = require('../models/Payment');
const Cart = require('../models/Cart');
const mpesaService = require('../utils/mpesa');

// Initiate payment - UPDATED to include email
const initiatePayment = async (req, res) => {
    try {
        const { phoneNumber, email, amount, accountReference, description, userId, sessionId } = req.body;

        // Validate
        if (!phoneNumber || !amount || !email) {
            return res.status(400).json({
                success: false,
                message: 'Phone number, email, and amount are required',
            });
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address',
            });
        }

        if (amount < 1) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount',
            });
        }

        // Get cart items
        let cart;
        if (userId) {
            cart = await Cart.findOne({ userId });
        } else if (sessionId) {
            cart = await Cart.findOne({ sessionId });
        } else {
            cart = await Cart.findOne({ sessionId: 'default_session' });
        }

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty',
            });
        }

        // Format phone number
        let formattedPhone = phoneNumber.replace(/^\+/, '');
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '254' + formattedPhone.substring(1);
        }

        // Generate order ID
        const orderId = `FEST${Date.now()}`;

        // Initiate STK Push
        const result = await mpesaService.initiateSTKPush(
            formattedPhone,
            amount,
            accountReference || orderId,
            description || 'Summer Tides Festival Tickets'
        );

        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to initiate payment',
                error: result.error,
            });
        }

        // Save payment record with email
        const payment = new Payment({
            orderId,
            checkoutRequestID: result.data.CheckoutRequestID,
            phoneNumber: formattedPhone,
            email: email,
            amount: Math.round(amount),
            accountReference: accountReference || orderId,
            description: description || 'Summer Tides Festival Tickets',
            status: 'pending',
            cartItems: cart.items.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                type: item.type,
                eventId: item.eventId,
                ticketId: item.ticketId,
            })),
        });

        await payment.save();

        // Send ticket email (in a real implementation, you'd use nodemailer or similar)
        // For now, we'll just log it
        console.log(`📧 Ticket email will be sent to: ${email} for order: ${orderId}`);
        console.log(`Tickets:`, cart.items.map(item => `${item.name} x${item.quantity}`).join(', '));

        res.json({
            success: true,
            data: {
                orderId,
                checkoutRequestID: result.data.CheckoutRequestID,
            },
        });
    } catch (error) {
        console.error('Payment initiation error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to initiate payment',
        });
    }
};

// Payment callback - UPDATED to send email on success
const paymentCallback = async (req, res) => {
    try {
        const { Body } = req.body;

        console.log('Payment callback received:', Body);

        if (!Body || !Body.stkCallback) {
            return res.json({ ResultCode: 1, ResultDesc: 'Invalid callback data' });
        }

        const { stkCallback } = Body;
        const checkoutRequestID = stkCallback.CheckoutRequestID;
        const resultCode = stkCallback.ResultCode;
        const resultDesc = stkCallback.ResultDesc;

        const payment = await Payment.findOne({ checkoutRequestID });
        if (!payment) {
            return res.json({ ResultCode: 1, ResultDesc: 'Payment not found' });
        }

        if (resultCode === 0) {
            // Payment successful
            const mpesaReceiptNumber = stkCallback.CallbackMetadata?.Item?.find(
                item => item.Name === 'MpesaReceiptNumber'
            )?.Value;

            const transactionDate = stkCallback.CallbackMetadata?.Item?.find(
                item => item.Name === 'TransactionDate'
            )?.Value;

            payment.status = 'completed';
            payment.mpesaReceiptNumber = mpesaReceiptNumber;
            payment.transactionDate = transactionDate ? new Date(transactionDate) : new Date();
            payment.resultCode = resultCode;
            payment.resultDesc = resultDesc;
            payment.ticketSent = true;
            payment.ticketSentAt = new Date();
            await payment.save();

            // Clear cart
            if (payment.userId) {
                await Cart.findOneAndUpdate(
                    { userId: payment.userId },
                    { items: [], totalAmount: 0 },
                    { new: true }
                );
            } else if (payment.sessionId) {
                await Cart.findOneAndUpdate(
                    { sessionId: payment.sessionId },
                    { items: [], totalAmount: 0 },
                    { new: true }
                );
            }

            console.log(`✅ Payment completed: ${mpesaReceiptNumber}`);
            console.log(`📧 Tickets sent to: ${payment.email}`);
            console.log(`📋 Order: ${payment.orderId}`);
            console.log(`🎫 Tickets:`, payment.cartItems.map(item =>
                `${item.name} x${item.quantity}`
            ).join(', '));

        } else {
            payment.status = 'failed';
            payment.resultCode = resultCode;
            payment.resultDesc = resultDesc;
            await payment.save();

            console.log(`❌ Payment failed: ${resultDesc}`);
        }

        res.json({ ResultCode: 0, ResultDesc: 'Success' });
    } catch (error) {
        console.error('Payment callback error:', error);
        res.json({ ResultCode: 1, ResultDesc: 'Error processing callback' });
    }
};

// Check payment status
const checkPaymentStatus = async (req, res) => {
    try {
        const { checkoutRequestID } = req.params;

        const payment = await Payment.findOne({ checkoutRequestID });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found',
            });
        }

        if (payment.status === 'pending') {
            const result = await mpesaService.checkPaymentStatus(checkoutRequestID);

            if (result.success && result.data.ResultCode !== undefined) {
                if (result.data.ResultCode === 0) {
                    payment.status = 'completed';
                    payment.mpesaReceiptNumber = result.data.CallbackMetadata?.Item?.find(
                        item => item.Name === 'MpesaReceiptNumber'
                    )?.Value;
                    payment.transactionDate = new Date();
                    payment.ticketSent = true;
                    payment.ticketSentAt = new Date();
                } else if (result.data.ResultCode === 1037) {
                    payment.status = 'timeout';
                } else {
                    payment.status = 'failed';
                }
                payment.resultCode = result.data.ResultCode;
                payment.resultDesc = result.data.ResultDesc;
                await payment.save();
            }
        }

        res.json({
            success: true,
            data: {
                status: payment.status,
                mpesaReceiptNumber: payment.mpesaReceiptNumber,
                transactionDate: payment.transactionDate,
                email: payment.email,
                ticketSent: payment.ticketSent,
            },
        });
    } catch (error) {
        console.error('Check payment status error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to check payment status',
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
                message: 'Payment not found',
            });
        }

        res.json({
            success: true,
            data: payment,
        });
    } catch (error) {
        console.error('Get payment error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get payment',
        });
    }
};

module.exports = {
    initiatePayment,
    paymentCallback,
    checkPaymentStatus,
    getPaymentByOrderId
};