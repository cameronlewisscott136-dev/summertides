// routes/cart.js
const express = require('express');
const router = express.Router();
const {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
} = require('../controllers/cartController');

// Get cart
router.get('/', getCart);

// Add item to cart
router.post('/add', addToCart);

// Update cart item
router.put('/update/:itemId', updateCartItem);

// Remove item from cart
router.delete('/remove/:itemId', removeFromCart);

// Clear cart
router.delete('/clear', clearCart);

module.exports = router;