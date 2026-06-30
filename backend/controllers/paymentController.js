// controllers/paymentController.js
const Payment = require('../models/Payment');
const Cart = require('../models/Cart');
const payheroService = require('../utils/payhero');

// ============================================
// PAYHERO STK PUSH - NEW
// ============================================
const initiatePayment = async (req, res) => {
    try {
        const { phoneNumber, email, amount, description, sessionId, customerName } = req.body;

        console.log('\n========================================');
        console.log('💰 PAYMENT INITIATION - PayHero');
        console.log('========================================');
        console.log(`📱 Phone: ${phoneNumber}`);
        console.log(`📧 Email: ${email}`);
        console.log(`💰 Amount: KES ${amount}`);
        console.log('========================================\n');

        // Validate
        if (!phoneNumber || !amount || !email) {
            return res.status(400).json({
                success: false,
                message: 'Phone number, email, and amount are required'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address'
            });
        }

        if (amount < 1) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount'
            });
        }

        // Get cart
        let cart = await Cart.findOne({ sessionId });
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }

        const orderId = `YEA${Date.now()}`;
        const externalReference = `YEA${Date.now()}`;

        // Initiate STK Push via PayHero
        const result = await payheroService.initiateSTKPush(
            phoneNumber,
            amount,
            externalReference,
            customerName || 'Customer'
        );

        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to initiate payment',
                error: result.error
            });
        }

        // Save payment record
        const payment = new Payment({
            orderId,
            externalReference,
            phoneNumber: result.formattedPhone,
            email,
            amount: Math.round(amount),
            customerName: customerName || 'Customer',
            description: description || 'Summer Tides Festival Tickets',
            status: 'pending',
            sessionId,
            payheroTransactionId: result.data?.transaction_id || '',
            cartItems: cart.items.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                type: item.type,
                eventId: item.eventId,
                ticketId: item.ticketId,
            })),
            settlementBank: process.env.YEA_BANK_NAME || 'Co-operative Bank of Kenya',
            settlementAccount: process.env.YEA_ACCOUNT_NAME || 'YEA - Your Event Africa',
        });

        await payment.save();

        console.log('✅ Payment record saved');
        console.log(`📋 Order ID: ${orderId}`);
        console.log(`📱 External Ref: ${externalReference}`);
        console.log('========================================\n');

        res.json({
            success: true,
            data: {
                orderId,
                externalReference,
                message: 'STK Push initiated. Check your phone for M-Pesa prompt.'
            }
        });

    } catch (error) {
        console.error('❌ Payment error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to initiate payment'
        });
    }
};

// ============================================
// PAYHERO CALLBACK - NEW
// ============================================
const payheroCallback = async (req, res) => {
    try {
        console.log('\n========================================');
        console.log('📞 PAYHERO CALLBACK');
        console.log('========================================');
        console.log(JSON.stringify(req.body, null, 2));

        const { external_reference, status, mpesa_receipt, amount, phone } = req.body;

        if (!external_reference) {
            return res.status(400).json({ success: false, message: 'Missing external reference' });
        }

        const payment = await Payment.findOne({ externalReference: external_reference });

        if (!payment) {
            console.error('❌ Payment not found:', external_reference);
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }

        if (status === 'SUCCESS') {
            console.log('\n✅ PAYMENT SUCCESSFUL!');
            console.log(`💰 Amount: KES ${payment.amount}`);
            console.log(`📱 M-Pesa Receipt: ${mpesa_receipt}`);
            console.log(`🏦 Settlement: ${payment.settlementBank}`);
            console.log(`📧 Email: ${payment.email}`);

            payment.status = 'completed';
            payment.mpesaReceiptNumber = mpesa_receipt;
            payment.transactionDate = new Date();
            payment.resultCode = 0;
            payment.resultDesc = 'Payment successful';
            payment.ticketSent = true;
            payment.ticketSentAt = new Date();
            await payment.save();

            // Clear cart
            if (payment.sessionId) {
                await Cart.findOneAndUpdate(
                    { sessionId: payment.sessionId },
                    { items: [], totalAmount: 0 },
                    { new: true }
                );
                console.log('✅ Cart cleared');
            }

        } else if (status === 'FAILED') {
            console.log('\n❌ PAYMENT FAILED');
            payment.status = 'failed';
            payment.resultDesc = 'Payment failed';
            await payment.save();

        } else if (status === 'TIMEOUT') {
            console.log('\n⏰ PAYMENT TIMEOUT');
            payment.status = 'timeout';
            payment.resultDesc = 'Payment timeout';
            await payment.save();

        } else if (status === 'CANCELLED') {
            console.log('\n🚫 PAYMENT CANCELLED');
            payment.status = 'cancelled';
            payment.resultDesc = 'Cancelled by user';
            await payment.save();
        }

        console.log('========================================\n');
        res.status(200).json({ success: true, message: 'Callback processed' });

    } catch (error) {
        console.error('❌ Callback error:', error);
        res.status(500).json({ success: false, message: 'Callback processing failed' });
    }
};

// ============================================
// CHECK PAYMENT STATUS - UPDATED
// ============================================
const checkPaymentStatus = async (req, res) => {
    try {
        const { externalReference } = req.params;

        const payment = await Payment.findOne({ externalReference });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // If pending, check with PayHero
        if (payment.status === 'pending') {
            const result = await payheroService.checkTransactionStatus(externalReference);

            if (result.success && result.data) {
                const txData = result.data;
                if (txData.status === 'SUCCESS') {
                    payment.status = 'completed';
                    payment.mpesaReceiptNumber = txData.mpesa_receipt || '';
                    payment.transactionDate = new Date();
                    payment.ticketSent = true;
                    payment.ticketSentAt = new Date();
                } else if (txData.status === 'FAILED') {
                    payment.status = 'failed';
                } else if (txData.status === 'TIMEOUT') {
                    payment.status = 'timeout';
                } else if (txData.status === 'CANCELLED') {
                    payment.status = 'cancelled';
                }
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
                ticketSent: payment.ticketSent
            }
        });

    } catch (error) {
        console.error('❌ Status check error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to check payment status'
        });
    }
};

// ============================================
// GET PAYMENT BY ORDER ID - KEPT
// ============================================
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
        console.error('❌ Get payment error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get payment'
        });
    }
};

// ============================================
// ADMIN: GET ALL PAYMENTS - KEPT
// ============================================
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

// ============================================
// ADMIN: UPDATE PAYMENT STATUS - KEPT
// ============================================
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
            message: 'Payment status updated',
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

// ============================================
// EXPORT ALL FUNCTIONS
// ============================================
module.exports = {
    initiatePayment,
    payheroCallback,
    checkPaymentStatus,
    getPaymentByOrderId,
    getPayments,
    updatePaymentStatus
};
