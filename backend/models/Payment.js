// backend/models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    paymentMethod: {
        type: String,
        enum: ['mpesa', 'airtel'],
        required: true,
    },
    transactionCode: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    cartItems: [{
        id: String,
        name: String,
        price: Number,
        quantity: Number,
        type: String,
        eventId: String,
        ticketId: String,
    }],
    sessionId: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'verified', 'completed', 'failed'],
        default: 'pending',
    },
    ticketsSent: {
        type: Boolean,
        default: false,
    },
    ticketsSentAt: Date,
    notes: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

paymentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Payment', paymentSchema);
