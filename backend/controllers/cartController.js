// controllers/cartController.js
const Cart = require('../models/Cart');

// Get cart
const getCart = async (req, res) => {
    try {
        const { sessionId } = req.query;

        console.log('Getting cart for session:', sessionId);

        if (!sessionId || sessionId === 'undefined' || sessionId === 'null') {
            return res.status(400).json({
                success: false,
                message: 'Session ID is required',
            });
        }

        let cart = await Cart.findOne({ sessionId });

        if (!cart) {
            cart = new Cart({
                items: [],
                totalAmount: 0,
                sessionId: sessionId,
            });
            await cart.save();
            console.log('Created new cart:', cart._id);
        }

        res.json({
            success: true,
            data: cart,
        });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get cart',
        });
    }
};

// Add item to cart
const addToCart = async (req, res) => {
    try {
        const { sessionId } = req.query;
        const item = req.body;

        console.log('Adding to cart:', { sessionId, item });

        if (!sessionId || sessionId === 'undefined' || sessionId === 'null') {
            return res.status(400).json({
                success: false,
                message: 'Session ID is required',
            });
        }

        let cart = await Cart.findOne({ sessionId });

        if (!cart) {
            cart = new Cart({
                items: [],
                totalAmount: 0,
                sessionId: sessionId,
            });
        }

        cart.addItem(item);
        await cart.save();

        const addedItem = cart.items[cart.items.length - 1];
        console.log('Added item with _id:', addedItem?._id, 'and id:', addedItem?.id);

        res.json({
            success: true,
            data: cart,
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to add item to cart',
        });
    }
};

// Update cart item
const updateCartItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { quantity } = req.body;
        const { sessionId } = req.query;

        console.log('Updating cart item:', { itemId, quantity, sessionId });

        if (!sessionId || sessionId === 'undefined' || sessionId === 'null') {
            return res.status(400).json({
                success: false,
                message: 'Session ID is required',
            });
        }

        let cart = await Cart.findOne({ sessionId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found',
            });
        }

        cart.updateItemQuantity(itemId, quantity);
        await cart.save();

        res.json({
            success: true,
            data: cart,
        });
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update cart item',
        });
    }
};

// Remove item from cart - FIXED
const removeFromCart = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { sessionId } = req.query;

        console.log('Removing from cart:', { itemId, sessionId });

        if (!sessionId || sessionId === 'undefined' || sessionId === 'null') {
            return res.status(400).json({
                success: false,
                message: 'Session ID is required',
            });
        }

        let cart = await Cart.findOne({ sessionId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found',
            });
        }

        console.log('Before removal - Cart items:', cart.items.map(i => ({
            _id: i._id,
            id: i.id,
            name: i.name
        })));

        // Remove the item
        cart.removeItem(itemId);

        // Save the cart - FIXED: Use try-catch for save
        try {
            await cart.save();
            console.log('Cart saved successfully');
        } catch (saveError) {
            console.error('Error saving cart:', saveError);
            return res.status(500).json({
                success: false,
                message: 'Failed to save cart: ' + saveError.message,
            });
        }

        console.log('After removal - Cart items:', cart.items.map(i => ({
            _id: i._id,
            id: i.id,
            name: i.name
        })));

        res.json({
            success: true,
            data: cart,
        });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to remove item from cart',
        });
    }
};

// Clear cart
const clearCart = async (req, res) => {
    try {
        const { sessionId } = req.query;

        console.log('Clearing cart for session:', sessionId);

        if (!sessionId || sessionId === 'undefined' || sessionId === 'null') {
            return res.status(400).json({
                success: false,
                message: 'Session ID is required',
            });
        }

        let cart = await Cart.findOne({ sessionId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found',
            });
        }

        cart.clearCart();
        await cart.save();

        res.json({
            success: true,
            data: cart,
        });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to clear cart',
        });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
};