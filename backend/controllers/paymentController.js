// controllers/paymentController.js
const Payment = require("../models/Payment");
const Cart = require("../models/Cart");
const payheroService = require("../utils/payhero");

// ============================================
// INITIATE STK PUSH
// ============================================
const initiatePayment = async (req, res) => {
  try {
    const { phoneNumber, email, amount, description, sessionId, customerName } =
      req.body;

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
      return res
        .status(400)
        .json({ success: false, message: "Invalid email address" });
    }

    if (Number(amount) < 1) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid amount" });
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
      console.error(
        "❌ PayHero errorData:",
        JSON.stringify(result.errorData, null, 2),
      );
      return res.status(500).json({
        success: false,
        message:
          result.error || "Failed to initiate payment. Please try again.",
        payheroError: result.errorData,
      });
    }

    const cartSnapshot = cart.items.map((item) => {
      const p =
        typeof item.toObject === "function"
          ? item.toObject()
          : JSON.parse(JSON.stringify(item));
      return {
        id: String(p.id || ""),
        name: String(p.name || ""),
        price: Number(p.price || 0),
        quantity: Number(p.quantity || 1),
        type: String(p.type || "ticket"),
        eventId: String(p.eventId || ""),
        ticketId: String(p.ticketId || ""),
      };
    });

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
      settlementBank: process.env.YEA_BANK_NAME || "Co-operative Bank of Kenya",
      settlementAccount:
        process.env.YEA_ACCOUNT_NAME || "Summertides Festival",
    });

    await payment.save();

    await Payment.collection.updateOne(
      { _id: payment._id },
      { $set: { cartItems: cartSnapshot } },
    );

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
// PayHero posts here when payment settles.
// Ref: https://docs.payhero.africa/docs/callbacks
// ============================================
const payheroCallback = async (req, res) => {
  try {
    console.log("\n========================================");
    console.log("📞 PAYHERO CALLBACK");
    console.log("========================================");
    console.log(JSON.stringify(req.body, null, 2));
    console.log("========================================\n");

    // PayHero wraps callback data in a "response" object:
    // { status: true, response: { ExternalReference, Status, MpesaReceiptNumber, ... } }
    // Normalise both flat and wrapped formats.
    const raw = req.body;
    const payload = raw.response || raw;

    const external_reference =
      payload.ExternalReference ||
      payload.external_reference ||
      raw.ExternalReference;
    const status = payload.Status || payload.status;
    const provider_reference =
      payload.MpesaReceiptNumber || payload.provider_reference || "";
    const reference = payload.MerchantRequestID || payload.reference || "";
    const resultCode = payload.ResultCode;
    const resultDesc = payload.ResultDesc || payload.ResultDescription || "";

    console.log("📋 Parsed callback:", {
      external_reference,
      status,
      provider_reference,
      resultCode,
      resultDesc,
    });

    if (!external_reference) {
      console.error("❌ No external_reference in callback");
      return res
        .status(200)
        .json({ success: false, message: "Missing external_reference" });
    }

    const payment = await Payment.findOne({
      externalReference: external_reference,
    });

    if (!payment) {
      console.error("❌ Payment not found for ref:", external_reference);
      // Still return 200 so PayHero doesn't keep retrying
      return res
        .status(200)
        .json({ success: false, message: "Payment record not found" });
    }

    // Skip if already in a terminal state (idempotency)
    const terminalStatuses = ["completed", "failed", "timeout", "cancelled"];
    if (terminalStatuses.includes(payment.status)) {
      console.log(
        `ℹ️ Payment already in terminal state: ${payment.status}. Skipping.`,
      );
      return res
        .status(200)
        .json({ success: true, message: "Already processed" });
    }

    // PayHero sends: 'Success', 'Failed', 'Timeout', 'Cancelled' (mixed case)
    const normStatus = (status || "").toLowerCase();
    switch (normStatus) {
      case "success": {
        console.log("✅ PAYMENT SUCCESSFUL!");
        console.log(`💰 Amount: KES ${payment.amount}`);
        console.log(`🧾 M-Pesa Receipt: ${provider_reference}`);
        console.log(`📧 Customer: ${payment.email}`);

        payment.status = "completed";
        payment.mpesaReceiptNumber = provider_reference || "";
        payment.payheroTransactionId =
          reference || payment.payheroTransactionId;
        payment.transactionDate = new Date();
        payment.resultCode = resultCode || 0;
        payment.resultDesc = "Payment successful";
        payment.ticketSent = true;
        payment.ticketSentAt = new Date();
        await payment.save();

        // Clear the customer's cart
        if (payment.sessionId) {
          await Cart.findOneAndUpdate(
            { sessionId: payment.sessionId },
            { items: [], totalAmount: 0, updatedAt: Date.now() },
          );
          console.log("🛒 Cart cleared for session:", payment.sessionId);
        }

        // TODO: Send ticket email here
        // await emailService.sendTickets(payment);

        break;
      }

      case "failed": {
        console.log("❌ PAYMENT FAILED");
        payment.status = "failed";
        payment.resultDesc = "Payment failed";
        await payment.save();
        break;
      }

      case "timeout": {
        console.log("⏰ PAYMENT TIMEOUT");
        payment.status = "timeout";
        payment.resultDesc = "Payment timed out";
        await payment.save();
        break;
      }

      case "cancelled": {
        console.log("🚫 PAYMENT CANCELLED");
        payment.status = "cancelled";
        payment.resultDesc = "Cancelled by user";
        await payment.save();
        break;
      }

      default:
        console.log(`⚠️ Unknown callback status: ${status}`);
    }

    // Always return 200 to PayHero
    return res
      .status(200)
      .json({ success: true, message: "Callback processed" });
  } catch (error) {
    console.error("❌ Callback processing error:", error);
    // Return 200 even on error to prevent PayHero from retrying indefinitely
    return res
      .status(200)
      .json({ success: false, message: "Callback processing failed" });
  }
};

// ============================================
// CHECK PAYMENT STATUS (frontend polling)
// ============================================
const checkPaymentStatus = async (req, res) => {
  try {
    const { externalReference } = req.params;

    const payment = await Payment.findOne({ externalReference });

    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }

    // If still pending, ask PayHero directly (fallback if callback hasn't fired)
    if (payment.status === "pending") {
      const result =
        await payheroService.checkTransactionStatus(externalReference);

      if (result.success && result.data) {
        const txStatus = result.data.status?.toUpperCase();

        if (txStatus === "SUCCESS") {
          payment.status = "completed";
          payment.mpesaReceiptNumber = result.data.mpesa_receipt || "";
          payment.transactionDate = new Date();
          payment.ticketSent = true;
          payment.ticketSentAt = new Date();
          await payment.save();
        } else if (["FAILED", "TIMEOUT", "CANCELLED"].includes(txStatus)) {
          payment.status = txStatus.toLowerCase();
          await payment.save();
        }
        // PENDING / QUEUED → leave as-is, frontend keeps polling
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
// GET PAYMENT BY ORDER ID
// ============================================
const getPaymentByOrderId = async (req, res) => {
  try {
    const payment = await Payment.findOne({ orderId: req.params.orderId });

    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
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
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
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
};
