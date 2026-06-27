// backend/src/controllers/paymentController.js
const Payment = require('../models/Payment');
const Cart = require('../models/Cart');
const mpesaService = require('../utils/mpesa');

// Initiate payment
const initiatePayment = async (req, res) => {
  try {
    const { phoneNumber, email, amount, accountReference, description, sessionId } = req.body;

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

    // Initiate STK Push
    const result = await mpesaService.initiateSTKPush(
      phoneNumber,
      amount,
      accountReference || orderId,
      description || 'Summer Tides Festival Tickets'
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to initiate M-Pesa payment',
        error: result.error,
      });
    }

    // Save payment
    const payment = new Payment({
      orderId,
      checkoutRequestID: result.data.CheckoutRequestID,
      phoneNumber: result.formattedPhone,
      email,
      amount: Math.round(amount),
      accountReference: accountReference || orderId,
      description: description || 'Summer Tides Festival Tickets',
      status: 'pending',
      sessionId,
      mpesaShortcode: process.env.MPESA_SHORTCODE,
      bankDetails: {
        bankName: process.env.YEA_BANK_NAME || 'Co-operative Bank of Kenya',
        accountName: process.env.YEA_ACCOUNT_NAME || 'YEA - Your Event Africa',
        accountNumber: process.env.YEA_ACCOUNT_NUMBER || '',
        branch: process.env.YEA_BANK_BRANCH || '',
      },
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

    res.json({
      success: true,
      data: {
        orderId,
        checkoutRequestID: result.data.CheckoutRequestID,
        message: 'STK Push initiated. Check your phone for M-Pesa prompt.',
        paybill: process.env.MPESA_SHORTCODE,
        bank: {
          name: process.env.YEA_BANK_NAME || 'Co-operative Bank of Kenya',
          account: process.env.YEA_ACCOUNT_NAME || 'YEA - Your Event Africa',
        },
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

// M-Pesa callback
const paymentCallback = async (req, res) => {
  try {
    const { Body } = req.body;
    
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
      if (payment.sessionId) {
        await Cart.findOneAndUpdate(
          { sessionId: payment.sessionId },
          { items: [], totalAmount: 0 },
          { new: true }
        );
      }

      console.log(`✅ Payment successful: ${mpesaReceiptNumber}`);
      console.log(`📧 Tickets sent to: ${payment.email}`);
      console.log(`🏦 Received by: ${process.env.YEA_BANK_NAME}`);
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
          payment.resultCode = result.data.ResultCode;
          payment.resultDesc = result.data.ResultDesc;
          
          if (payment.sessionId) {
            await Cart.findOneAndUpdate(
              { sessionId: payment.sessionId },
              { items: [], totalAmount: 0 },
              { new: true }
            );
          }
        } else if (result.data.ResultCode === 1037) {
          payment.status = 'timeout';
        } else {
          payment.status = 'failed';
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
        bank: {
          name: process.env.YEA_BANK_NAME || 'Co-operative Bank of Kenya',
          account: process.env.YEA_ACCOUNT_NAME || 'YEA - Your Event Africa',
        },
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

module.exports = {
  initiatePayment,
  paymentCallback,
  checkPaymentStatus,
};
