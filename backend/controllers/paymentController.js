// backend/controllers/paymentController.js
const Payment = require('../models/Payment');
const Cart = require('../models/Cart');
const payheroService = require('../utils/payhero');

// Initiate PayHero STK Push
const initiatePayment = async (req, res) => {
    try {
        const { phoneNumber, email, amount, description, sessionId, customerName } = req.body;

        console.log('\n========================================');
        console.log('💰 PAYMENT INITIATION - PayHero');
        console.log('========================================');
        console.log(`📱 Phone: ${phoneNumber}`);
        console.log(`📧 Email: ${email}`);
        console.log(`💰 Amount: KES ${amount}`);
        console.log(`🏦 Settlement: ${process.env.YEA_BANK_NAME}`);
        console.log('========================================\n');

        // Validate
        if (!phoneNumber || !amount || !email) {
            return res.status(400).json({
                success: false,
                message: 'Phone number, email, and amount are required',
            });
        }

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

        // Get cart
        let cart = await Cart.findOne({ sessionId });
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty',
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
                error: result.error,
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
        console.log(`💰 Money will settle to: ${process.env.YEA_BANK_NAME}`);
        console.log('========================================\n');

        res.json({
            success: true,
            data: {
                orderId,
                externalReference,
                message: 'STK Push initiated. Please check your phone for the M-Pesa prompt.',
                settlement: {
                    bank: process.env.YEA_BANK_NAME || 'Co-operative Bank of Kenya',
                    account: process.env.YEA_ACCOUNT_NAME || 'YEA - Your Event Africa',
                },
            },
        });

    } catch (error) {
        console.error('❌ Payment initiation error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to initiate payment',
        });
    }
};

// PayHero Callback (M-Pesa confirmation)
const payheroCallback = async (req, res) => {
    try {
        console.log('\n========================================');
        console.log('📞 PAYHERO CALLBACK RECEIVED');
        console.log('========================================');
        console.log(JSON.stringify(req.body, null, 2));

        const { external_reference, status, mpesa_receipt, amount, phone } = req.body;

        if (!external_reference) {
            console.error('❌ Missing external reference');
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
            console.log(`🎫 Tickets: ${payment.cartItems.map(item => 
                `${item.name} x${item.quantity}`
            ).join(', ')}`);

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
                console.log('✅ Cart cleared for session:', payment.sessionId);
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
            payment.resultDesc = 'Payment cancelled by user';
            await payment.save();
        }

        console.log('========================================\n');
        res.status(200).json({ success: true, message: 'Callback processed' });

    } catch (error) {
        console.error('❌ Callback error:', error);
        res.status(500).json({ success: false, message: 'Callback processing failed' });
    }
};

// Check payment status
const checkPaymentStatus = async (req, res) => {
    try {
        const { externalReference } = req.params;

        console.log(`🔍 Checking payment: ${externalReference}`);

        const payment = await Payment.findOne({ externalReference });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found',
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
                ticketSent: payment.ticketSent,
                settlement: {
                    bank: payment.settlementBank,
                    account: payment.settlementAccount,
                },
            },
        });

    } catch (error) {
        console.error('❌ Status check error:', error);
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
        console.error('❌ Get payment error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get payment',
        });
    }
};

// Manual payment submission (fallback for when STK Push fails)
const submitManualPayment = async (req, res) => {
    try {
        const { fullName, email, phoneNumber, paymentMethod, transactionCode, amount, cartItems, sessionId } = req.body;

        console.log('📝 Manual Payment Submission:');
        console.log('Customer:', fullName);
        console.log('Email:', email);
        console.log('Method:', paymentMethod);
        console.log('Transaction Code:', transactionCode);

        // Validate
        if (!fullName || !email || !phoneNumber || !paymentMethod || !transactionCode || !amount) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            });
        }

        const orderId = `YEA${Date.now()}`;

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
            status: 'pending',
        });

        await payment.save();

        // Clear cart
        if (sessionId) {
            await Cart.findOneAndUpdate(
                { sessionId },
                { items: [], totalAmount: 0 },
                { new: true }
            );
        }

        console.log('✅ Manual payment record saved:', payment._id);

        res.status(201).json({
            success: true,
            message: 'Payment details submitted successfully! We will verify and send your tickets shortly.',
            data: {
                orderId: payment.orderId,
                status: payment.status,
                email: payment.email,
            },
        });

    } catch (error) {
        console.error('❌ Error submitting manual payment:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to submit payment details',
        });
    }
};

// Admin: Get all payments
const getPayments = async (req, res) => {
    try {
        const payments = await Payment.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            data: payments,
        });
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Admin: Update payment status
const updatePaymentStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status, notes } = req.body;

        const payment = await Payment.findOne({ orderId });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found',
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
            data: payment,
        });
    } catch (error) {
        console.error('Error updating payment:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    initiatePayment,
    payheroCallback,
    checkPaymentStatus,
    getPaymentByOrderId,
    submitManualPayment,
    getPayments,
    updatePaymentStatus,
};
