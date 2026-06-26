// models/Cart.js
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
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
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
    },
    type: {
        type: String,
        enum: ['ticket', 'product'],
        default: 'ticket',
    },
    eventId: String,
    ticketId: String,
    image: String,
});

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    sessionId: {
        type: String,
        default: null,
    },
    items: {
        type: [cartItemSchema],
        default: [],
    },
    totalAmount: {
        type: Number,
        default: 0,
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

// FIXED: Pre-save middleware - Use async/await instead of next
cartSchema.pre('save', async function () {
    try {
        // Calculate total amount
        this.totalAmount = this.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);

        // Update timestamp
        this.updatedAt = Date.now();

        // Return the document
        return this;
    } catch (error) {
        console.error('Pre-save error:', error);
        throw error;
    }
});

// Method to add item
cartSchema.methods.addItem = function (item) {
    const existingItem = this.items.find(i => i.id === item.id);
    if (existingItem) {
        existingItem.quantity += item.quantity || 1;
    } else {
        this.items.push({
            ...item,
            quantity: item.quantity || 1,
        });
    }
    this.totalAmount = this.items.reduce((total, i) => total + (i.price * i.quantity), 0);
    this.updatedAt = Date.now();
    return this;
};

// Method to remove item - Handle both MongoDB _id and custom id
cartSchema.methods.removeItem = function (itemId) {
    console.log('Removing item with ID:', itemId);
    console.log('Current items before removal:', this.items.map(i => ({
        _id: i._id,
        id: i.id,
        name: i.name,
        _idString: i._id.toString()
    })));

    // Check if itemId is a MongoDB ObjectId or custom id
    const isMongoId = itemId && typeof itemId === 'string' && itemId.length === 24 && /^[0-9a-fA-F]{24}$/.test(itemId);

    if (isMongoId) {
        // Remove by MongoDB _id
        this.items = this.items.filter(item => item._id.toString() !== itemId);
        console.log('Removed by MongoDB _id');
    } else {
        // Remove by custom id
        this.items = this.items.filter(item => item.id !== itemId);
        console.log('Removed by custom id');
    }

    console.log('Items after removal:', this.items.map(i => ({
        _id: i._id,
        id: i.id,
        name: i.name
    })));

    this.totalAmount = this.items.reduce((total, i) => total + (i.price * i.quantity), 0);
    this.updatedAt = Date.now();
    return this;
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = function (itemId, quantity) {
    console.log('Updating item quantity:', { itemId, quantity });

    // Check if itemId is a MongoDB ObjectId or custom id
    const isMongoId = itemId && typeof itemId === 'string' && itemId.length === 24 && /^[0-9a-fA-F]{24}$/.test(itemId);

    let item;
    if (isMongoId) {
        item = this.items.find(i => i._id.toString() === itemId);
    } else {
        item = this.items.find(i => i.id === itemId);
    }

    if (item) {
        if (quantity <= 0) {
            this.removeItem(itemId);
        } else {
            item.quantity = quantity;
        }
        this.totalAmount = this.items.reduce((total, i) => total + (i.price * i.quantity), 0);
        this.updatedAt = Date.now();
    } else {
        console.log('Item not found:', itemId);
    }
    return this;
};

// Clear cart
cartSchema.methods.clearCart = function () {
    this.items = [];
    this.totalAmount = 0;
    this.updatedAt = Date.now();
    return this;
};

// Create the model
const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;