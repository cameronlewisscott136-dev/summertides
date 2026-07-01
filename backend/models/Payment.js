// models/Payment.js
const mongoose = require('mongoose');

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
    cartItems: [
        {
            id: String,
            name: String,
            price: Number,
            quantity: Number,
            type: String,
            eventId: String,
            ticketId: String,
        },
    ],
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