// models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    externalReference: { type: String, unique: true, sparse: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
    amount: { type: Number, required: true },
    customerName: { type: String, default: 'Customer' },
    description: { type: String, default: 'Summer Tides Festival Tickets' },
    sessionId: { type: String },

    // Payment status
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'timeout', 'cancelled'],
        default: 'pending',
    },
    mpesaReceiptNumber: String,
    transactionDate: Date,
    resultCode: Number,
    resultDesc: String,

    // PayHero specific
    payheroTransactionId: String,
    paymentChannel: { type: String, default: 'mpesa' },

    // Cart items
    cartItems: [{
        id: String,
        name: String,
        price: Number,
        quantity: Number,
        type: String,
        eventId: String,
        ticketId: String,
    }],

    // Settlement
    settlementBank: {
        type: String,
        default: process.env.YEA_BANK_NAME || 'Co-operative Bank of Kenya',
    },
    settlementAccount: {
        type: String,
        default: process.env.YEA_ACCOUNT_NAME || 'YEA - Your Event Africa',
    },

    ticketSent: { type: Boolean, default: false },
    ticketSentAt: Date,

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

paymentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Payment', paymentSchema);
