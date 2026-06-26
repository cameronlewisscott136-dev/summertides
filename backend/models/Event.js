const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    description: String,
    available: {
        type: Boolean,
        default: true,
    },
    soldOut: {
        type: Boolean,
        default: false,
    },
    quantityAvailable: {
        type: Number,
        default: 100,
    },
    soldCount: {
        type: Number,
        default: 0,
    },
});

const eventSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: String,
    date: String,
    endDate: String,
    location: String,
    price: String,
    image: String,
    tickets: [ticketSchema],
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

eventSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Event', eventSchema);