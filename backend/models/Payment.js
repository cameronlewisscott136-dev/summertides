// models/Payment.js
const mongoose = require('mongoose');

// Define the cart item schema properly
const cartItemSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    type: { type: String, default: 'ticket' },
    eventId: { type: String },
    ticketId: { type: String },
}, { _id: false }); // _id: false prevents extra _id on subdocuments

const paymentSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true,
    },
    externalReference: {
        type: String,
        unique: true,
        sparse: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    customerName: {
        type: String,
        default: 'Customer',
    },
    description: {
        type: String,
        default: 'Summer Tides Festival Tickets',
    },
    sessionId: {
        type: String,
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'timeout', 'cancelled'],
        default: 'pending',
        index: true,
    },
    mpesaReceiptNumber: {
        type: String,
        default: '',
    },
    transactionDate: Date,
    resultCode: Number,
    resultDesc: String,
    payheroTransactionId: {
        type: String,
        default: '',
    },
    paymentChannel: {
        type: String,
        default: 'mpesa',
    },
    // FIXED: Use cartItemSchema, NOT [String]
    cartItems: {
        type: [cartItemSchema],
        default: [],
    },
    settlementBank: {
        type: String,
        default: process.env.YEA_BANK_NAME || 'Co-operative Bank of Kenya',
    },
    settlementAccount: {
        type: String,
        default: process.env.YEA_ACCOUNT_NAME || 'Summertides Festival',
    },
    ticketSent: {
        type: Boolean,
        default: false,
    },
    ticketSentAt: Date,
    notes: {
        type: String,
        default: '',
    },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
