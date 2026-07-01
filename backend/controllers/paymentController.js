// controllers/paymentController.js
const Payment = require("../models/Payment");
const Cart = require("../models/Cart");
const payheroService = require("../utils/payhero");

// ============================================
// INITIATE STK PUSH
// ============================================
const initiatePayment = async (req, res) => {
    try {
        const { phoneNumber, email, amount, description, sessionId, customerName } = req.body;

        console.log("\n========================================");
        console.log("💰 PAYMENT INITIATION - PayHero");
        console.log("========================================");
        console.log(`📱 Phone: ${phoneNumber}`);
        console.log(`📧 Email: ${email}`);
        console.log(`💰 Amount: KES ${amount}`);
        console.log("========================================\n");

        if (!phoneNumber || !amount || !email) {
            return res.status(400).json({
                success: false,
                message: "Phone number, email, and amount are required",
            });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ success: false, message: "Invalid email address" });
        }

        if (Number(amount) < 1) {
            return res.status(400).json({ success: false, message: "Invalid amount" });
        }

        const cart = await Cart.findOne({ sessionId });
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        const timestamp = Date.now();
        const orderId = `YEA${timestamp}`;
        const externalReference = `YEA${timestamp}`;

        const result = await payheroService.initiateSTKPush(
            phoneNumber,
            amount,
            externalReference,
            customerName || "Customer",
        );

        if (!result.success) {
            console.error("❌ PayHero error:", result.error);
            return res.status(500).json({
                success: false,
                message: result.error || "Failed to initiate payment. Please try again.",
            });
        }

        // FIXED: Create cartItems properly - simple mapping
        const cartItems = cart.items.map(item => ({
            id: String(item.id || ''),
            name: String(item.name || ''),
            price: Number(item.price || 0),
            quantity: Number(item.quantity || 1),
            type: String(item.type || 'ticket'),
            eventId: String(item.eventId || ''),
            ticketId: String(item.ticketId || ''),
        }));

        // Create payment with cartItems directly
        const payment = new Payment({
            orderId,
            externalReference,
            phoneNumber: result.formattedPhone,
            email,
            amount: Math.round(amount),
            customerName: customerName || "Customer",
            description: description || "Summer Tides Festival Tickets",
            status: "pending",
            sessionId,
            payheroTransactionId: result.payheroReference || "",
            paymentChannel: "mpesa",
            cartItems: cartItems, // ← This will work with the fixed schema
            settlementBank: process.env.YEA_BANK_NAME || "Co-operative Bank of Kenya",
            settlementAccount: process.env.YEA_ACCOUNT_NAME || "Summertides Festival",
        });

        await payment.save();

        console.log("✅ Payment record saved");
        console.log(`📋 Order ID: ${orderId}`);
        console.log(`📱 External Ref: ${externalReference}`);
        console.log(`🏦 PayHero Ref: ${result.payheroReference}`);
        console.log("========================================\n");

        return res.json({
            success: true,
            data: {
                orderId,
                externalReference,
                message: "STK Push sent. Check your phone for the M-Pesa prompt.",
            },
        });
    } catch (error) {
        console.error("❌ Payment initiation error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to initiate payment",
        });
    }
};

// ============================================
// PAYHERO WEBHOOK CALLBACK
// ============================================
const payheroCallback = async (req, res) => {
    try {
        console.log("\n========================================");
        console.log("📞 PAYHERO CALLBACK RECEIVED");
        console.log("========================================");
        console.log("Full Body:", JSON.stringify(req.body, null, 2));
        console.log("========================================\n");

        const raw = req.body;
        let external_reference = null;
        let status = null;
        let provider_reference = null;
        let reference = null;
        let resultCode = null;
        let resultDesc = null;

        // Try different formats
        if (raw.ExternalReference || raw.external_reference) {
            external_reference = raw.ExternalReference || raw.external_reference;
            status = raw.Status || raw.status;
            provider_reference = raw.MpesaReceiptNumber || raw.mpesa_receipt || raw.provider_reference || "";
            reference = raw.MerchantRequestID || raw.reference || "";
            resultCode = raw.ResultCode;
            resultDesc = raw.ResultDesc || raw.ResultDescription || "";
        } else if (raw.response) {
            const payload = raw.response;
            external_reference = payload.ExternalReference || payload.external_reference;
            status = payload.Status || payload.status;
            provider_reference = payload.MpesaReceiptNumber || payload.mpesa_receipt || payload.provider_reference || "";
            reference = payload.MerchantRequestID || payload.reference || "";
            resultCode = payload.ResultCode;
            resultDesc = payload.ResultDesc || payload.ResultDescription || "";
        } else if (raw.data) {
            const payload = raw.data;
            external_reference = payload.ExternalReference || payload.external_reference;
            status = payload.Status || payload.status;
            provider_reference = payload.MpesaReceiptNumber || payload.mpesa_receipt || payload.provider_reference || "";
            reference = payload.MerchantRequestID || payload.reference || "";
            resultCode = payload.ResultCode;
            resultDesc = payload.ResultDesc || payload.ResultDescription || "";
        }

        console.log("📋 Parsed callback:", {
            external_reference,
            status,
            provider_reference,
            resultCode,
            resultDesc,
        });

        if (!external_reference) {
            console.error("❌ No external_reference in callback");
            return res.status(200).json({ success: false, message: "Missing external_reference" });
        }

        const payment = await Payment.findOne({ externalReference: external_reference });

        if (!payment) {
            console.error("❌ Payment not found for ref:", external_reference);
            return res.status(200).json({ success: false, message: "Payment record not found" });
        }

        const terminalStatuses = ["completed", "failed", "timeout", "cancelled"];
        if (terminalStatuses.includes(payment.status)) {
            console.log(`ℹ️ Payment already in terminal state: ${payment.status}. Skipping.`);
            return res.status(200).json({ success: true, message: "Already processed" });
        }

        const normStatus = (status || "").toString().toLowerCase().trim();
        console.log(`📊 Normalized status: ${normStatus}`);

        switch (normStatus) {
            case "success":
            case "completed":
            case "settled": {
                console.log("\n✅ PAYMENT SUCCESSFUL!");
                console.log(`💰 Amount: KES ${payment.amount}`);
                console.log(`🧾 M-Pesa Receipt: ${provider_reference}`);
                console.log(`📧 Customer: ${payment.email}`);

                payment.status = "completed";
                payment.mpesaReceiptNumber = provider_reference || "";
                payment.payheroTransactionId = reference || payment.payheroTransactionId;
                payment.transactionDate = new Date();
                payment.resultCode = resultCode || 0;
                payment.resultDesc = "Payment successful";
                payment.ticketSent = true;
                payment.ticketSentAt = new Date();
                await payment.save();

                if (payment.sessionId) {
                    await Cart.findOneAndUpdate(
                        { sessionId: payment.sessionId },
                        { items: [], totalAmount: 0 },
                        { new: true }
                    );
                    console.log("🛒 Cart cleared for session:", payment.sessionId);
                }

                break;
            }
            case "failed":
            case "error": {
                console.log("\n❌ PAYMENT FAILED");
                payment.status = "failed";
                payment.resultDesc = resultDesc || "Payment failed";
                await payment.save();
                break;
            }
            case "timeout":
            case "timedout": {
                console.log("\n⏰ PAYMENT TIMEOUT");
                payment.status = "timeout";
                payment.resultDesc = resultDesc || "Payment timed out";
                await payment.save();
                break;
            }
            case "cancelled":
            case "canceled": {
                console.log("\n🚫 PAYMENT CANCELLED");
                payment.status = "cancelled";
                payment.resultDesc = resultDesc || "Cancelled by user";
                await payment.save();
                break;
            }
            default: {
                console.log(`⚠️ Unknown callback status: ${status}`);
            }
        }

        return res.status(200).json({ success: true, message: "Callback processed" });
    } catch (error) {
        console.error("❌ Callback processing error:", error);
        return res.status(200).json({ success: false, message: "Callback processing failed" });
    }
};

// ============================================
// CHECK PAYMENT STATUS
// ============================================
const checkPaymentStatus = async (req, res) => {
    try {
        const { externalReference } = req.params;

        console.log(`🔍 Checking payment status for: ${externalReference}`);

        const payment = await Payment.findOne({ externalReference });

        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment not found" });
        }

        if (payment.status === "pending") {
            console.log("⏳ Status is pending, checking with PayHero...");
            const result = await payheroService.checkTransactionStatus(externalReference);

            if (result.success && result.data) {
                const txStatus = (result.data.status || "").toUpperCase();
                console.log(`📊 PayHero status: ${txStatus}`);

                if (txStatus === "SUCCESS" || txStatus === "COMPLETED") {
                    payment.status = "completed";
                    payment.mpesaReceiptNumber = result.data.mpesa_receipt || "";
                    payment.transactionDate = new Date();
                    payment.ticketSent = true;
                    payment.ticketSentAt = new Date();
                    await payment.save();
                    
                    if (payment.sessionId) {
                        await Cart.findOneAndUpdate(
                            { sessionId: payment.sessionId },
                            { items: [], totalAmount: 0 },
                            { new: true }
                        );
                    }
                    console.log("✅ Payment status updated to completed via polling");
                } else if (["FAILED", "ERROR"].includes(txStatus)) {
                    payment.status = "failed";
                    await payment.save();
                } else if (["TIMEOUT", "TIMEDOUT"].includes(txStatus)) {
                    payment.status = "timeout";
                    await payment.save();
                } else if (["CANCELLED", "CANCELED"].includes(txStatus)) {
                    payment.status = "cancelled";
                    await payment.save();
                }
            }
        }

        return res.json({
            success: true,
            data: {
                status: payment.status,
                mpesaReceiptNumber: payment.mpesaReceiptNumber || null,
                transactionDate: payment.transactionDate || null,
                email: payment.email,
                ticketSent: payment.ticketSent,
                customerName: payment.customerName,
                amount: payment.amount,
            },
        });
    } catch (error) {
        console.error("❌ Status check error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to check payment status",
        });
    }
};

// ============================================
// TEST CALLBACK (For debugging)
// ============================================
const testCallback = async (req, res) => {
    try {
        const { externalReference } = req.params;
        
        console.log(`🧪 [TEST] Manually completing payment for: ${externalReference}`);

        const payment = await Payment.findOne({ externalReference });

        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }

        payment.status = 'completed';
        payment.mpesaReceiptNumber = 'TEST' + Date.now();
        payment.transactionDate = new Date();
        payment.ticketSent = true;
        payment.ticketSentAt = new Date();
        payment.resultCode = 0;
        payment.resultDesc = 'Test payment completed';
        await payment.save();

        if (payment.sessionId) {
            await Cart.findOneAndUpdate(
                { sessionId: payment.sessionId },
                { items: [], totalAmount: 0 },
                { new: true }
            );
        }

        return res.json({
            success: true,
            message: 'Payment completed successfully (test)',
            data: {
                status: payment.status,
                mpesaReceiptNumber: payment.mpesaReceiptNumber,
                email: payment.email
            }
        });
    } catch (error) {
        console.error('❌ [TEST] Error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================
// GET PAYMENT BY ORDER ID
// ============================================
const getPaymentByOrderId = async (req, res) => {
    try {
        const payment = await Payment.findOne({ orderId: req.params.orderId });
        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment not found" });
        }
        return res.json({ success: true, data: payment });
    } catch (error) {
        console.error("❌ Get payment error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================
// ADMIN: GET ALL PAYMENTS
// ============================================
const getPayments = async (req, res) => {
    try {
        const payments = await Payment.find().sort({ createdAt: -1 });
        return res.json({ success: true, data: payments });
    } catch (error) {
        console.error("❌ Fetch payments error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================
// ADMIN: UPDATE PAYMENT STATUS
// ============================================
const updatePaymentStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status, notes } = req.body;

        const payment = await Payment.findOne({ orderId });

        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment not found" });
        }

        if (status) payment.status = status;
        if (notes) payment.notes = notes;

        if (status === "completed") {
            payment.ticketSent = true;
            payment.ticketSentAt = new Date();
        }

        await payment.save();

        return res.json({
            success: true,
            message: "Payment status updated",
            data: payment,
        });
    } catch (error) {
        console.error("❌ Update payment error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    initiatePayment,
    payheroCallback,
    checkPaymentStatus,
    getPaymentByOrderId,
    getPayments,
    updatePaymentStatus,
    testCallback,
};
