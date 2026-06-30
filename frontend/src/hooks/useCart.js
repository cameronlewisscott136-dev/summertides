// src/hooks/useCart.js
import { useState, useEffect } from 'react';
import { cartAPI, paymentAPI } from '../services/api';
import { toast } from 'react-toastify';

export const useCart = (sessionId) => {
    const [cartCount, setCartCount] = useState(0);
    const [cartItems, setCartItems] = useState([]);
    const [cartTotal, setCartTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null);

    useEffect(() => {
        if (sessionId && sessionId !== 'undefined' && sessionId !== 'null') {
            loadCart();
        }
    }, [sessionId]);

    const loadCart = async () => {
        try {
            console.log('Loading cart for session:', sessionId);
            const response = await cartAPI.getCart(sessionId);
            const cart = response.data.data;
            console.log('Cart loaded:', cart);
            setCartItems(cart.items || []);
            setCartTotal(cart.totalAmount || 0);
            setCartCount(cart.items?.length || 0);
        } catch (error) {
            console.error('Error loading cart:', error);
            setCartItems([]);
            setCartTotal(0);
            setCartCount(0);
        }
    };

    const handleAddToCart = async (item) => {
        try {
            setIsLoading(true);
            console.log('Adding to cart:', { sessionId, item });

            if (!sessionId || sessionId === 'undefined' || sessionId === 'null') {
                console.error('Invalid sessionId');
                toast.error('Session error. Please refresh the page.');
                return false;
            }

            const response = await cartAPI.addToCart(sessionId, {
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity || 1,
                type: item.type || 'ticket',
                eventId: item.eventId,
                ticketId: item.ticketId,
                image: item.image,
            });

            const cart = response.data.data;
            console.log('Added to cart, new cart:', cart);
            setCartItems(cart.items || []);
            setCartTotal(cart.totalAmount || 0);
            setCartCount(cart.items?.length || 0);

            toast.success('Item added to cart successfully!');
            return true;
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Failed to add item to cart. Please try again.');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateCartItem = async (itemId, quantity) => {
        try {
            console.log('Updating cart item:', { itemId, quantity, sessionId });

            if (!itemId) {
                console.error('No itemId provided');
                return;
            }

            if (!sessionId || sessionId === 'undefined' || sessionId === 'null') {
                console.error('Invalid sessionId');
                return;
            }

            const response = await cartAPI.updateCartItem(sessionId, itemId, quantity);
            const cart = response.data.data;
            console.log('Updated cart:', cart);
            setCartItems(cart.items || []);
            setCartTotal(cart.totalAmount || 0);
            setCartCount(cart.items?.length || 0);
        } catch (error) {
            console.error('Error updating cart:', error);
            loadCart();
        }
    };

    const handleRemoveFromCart = async (itemId) => {
        try {
            console.log('Removing from cart:', { itemId, sessionId });

            if (!itemId) {
                console.error('No itemId provided');
                return;
            }

            if (!sessionId || sessionId === 'undefined' || sessionId === 'null') {
                console.error('Invalid sessionId');
                return;
            }

            const response = await cartAPI.removeFromCart(sessionId, itemId);
            const cart = response.data.data;
            console.log('Removed from cart, new cart:', cart);
            setCartItems(cart.items || []);
            setCartTotal(cart.totalAmount || 0);
            setCartCount(cart.items?.length || 0);
        } catch (error) {
            console.error('Error removing from cart:', error);
            loadCart();
        }
    };

    const handleClearCart = async () => {
        try {
            console.log('Clearing cart for session:', sessionId);

            if (!sessionId || sessionId === 'undefined' || sessionId === 'null') {
                console.error('Invalid sessionId');
                return;
            }

            await cartAPI.clearCart(sessionId);
            setCartItems([]);
            setCartTotal(0);
            setCartCount(0);
        } catch (error) {
            console.error('Error clearing cart:', error);
        }
    };

    // PayHero STK Push Payment
    const handleInitiatePayment = async (phoneNumber, email, amount, customerName) => {
        try {
            setIsLoading(true);

            const response = await paymentAPI.initiatePayment({
                phoneNumber: phoneNumber,
                email: email,
                amount: amount,
                customerName: customerName || 'Customer',
                description: 'Summer Tides Festival Tickets',
                sessionId: sessionId,
            });

            const { orderId, externalReference } = response.data.data;

            setPaymentStatus({
                orderId,
                externalReference,
                status: 'pending',
            });

            // Start polling for payment status
            pollPaymentStatus(externalReference);

            toast.success('✅ STK Push sent! Check your phone for the M-Pesa prompt.');
            return { success: true, externalReference };

        } catch (error) {
            console.error('Error initiating payment:', error);
            toast.error('Failed to initiate payment. Please try again.');
            return { success: false };
        } finally {
            setIsLoading(false);
        }
    };

    const pollPaymentStatus = async (externalReference) => {
        let attempts = 0;
        const maxAttempts = 30;

        const interval = setInterval(async () => {
            attempts++;
            try {
                const response = await paymentAPI.checkPaymentStatus(externalReference);
                const status = response.data.data;

                if (status.status === 'completed') {
                    clearInterval(interval);
                    setPaymentStatus({
                        ...paymentStatus,
                        status: 'completed',
                        mpesaReceiptNumber: status.mpesaReceiptNumber,
                    });
                    toast.success('🎉 Payment successful! Your tickets have been confirmed.');
                    loadCart();
                } else if (['failed', 'timeout', 'cancelled'].includes(status.status)) {
                    clearInterval(interval);
                    setPaymentStatus({
                        ...paymentStatus,
                        status: status.status,
                    });
                    alert(`❌ Payment ${status.status}. Please try again.`);
                } else if (attempts >= maxAttempts) {
                    clearInterval(interval);
                    toast.error('⏰ Payment is taking too long. Please check your M-Pesa app.');
                }
            } catch (error) {
                console.error('Error checking payment status:', error);
            }
        }, 2000);
    };

    return {
        cartCount,
        cartItems,
        cartTotal,
        isLoading,
        paymentStatus,
        loadCart,
        handleAddToCart,
        handleUpdateCartItem,
        handleRemoveFromCart,
        handleClearCart,
        handleInitiatePayment,
    };
};
