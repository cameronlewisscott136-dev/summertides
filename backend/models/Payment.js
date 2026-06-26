// backend/models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true,
    },
    checkoutRequestID: {
        type: String,
        required: true,
        unique: true,
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
    accountReference: String,
    description: String,
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'timeout'],
        default: 'pending',
    },
    mpesaReceiptNumber: String,
    transactionDate: Date,
    resultCode: Number,
    resultDesc: String,
    cartItems: [{
        id: String,
        name: String,
        price: Number,
        quantity: Number,
        type: String,
        eventId: String,
        ticketId: String,
    }],
    ticketSent: {
        type: Boolean,
        default: false,
    },
    ticketSentAt: Date,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

paymentSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Payment', paymentSchema);