// frontend/src/hooks/useCart.js
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
      const response = await cartAPI.getCart(sessionId);
      const cart = response.data.data;
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
      setCartItems(cart.items || []);
      setCartTotal(cart.totalAmount || 0);
      setCartCount(cart.items?.length || 0);
      toast.success('Item added to cart successfully!');
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCartItem = async (itemId, quantity) => {
    try {
      const response = await cartAPI.updateCartItem(sessionId, itemId, quantity);
      const cart = response.data.data;
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
      const response = await cartAPI.removeFromCart(sessionId, itemId);
      const cart = response.data.data;
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
      await cartAPI.clearCart(sessionId);
      setCartItems([]);
      setCartTotal(0);
      setCartCount(0);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  // UPDATED: Payment initiation with email
  const handleInitiatePayment = async (phoneNumber, email, amount) => {
    try {
      setIsLoading(true);
      
      const response = await paymentAPI.initiateMpesaPayment({
        phoneNumber: phoneNumber,
        email: email,
        amount: amount,
        accountReference: `FESTIVAL${Date.now()}`,
        description: 'Summer Tides Festival Tickets',
        sessionId: sessionId,
      });

      const { orderId, checkoutRequestID } = response.data.data;

      setPaymentStatus({
        orderId,
        checkoutRequestID,
        status: 'pending',
      });

      pollPaymentStatus(checkoutRequestID);

      toast.success('Payment initiated! Please check your phone for the M-Pesa prompt.');
      return { success: true, checkoutRequestID };
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast.error('Failed to initiate payment. Please try again.');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const pollPaymentStatus = async (checkoutRequestID) => {
    let attempts = 0;
    const maxAttempts = 30;

    const interval = setInterval(async () => {
      attempts++;
      try {
        const response = await paymentAPI.checkPaymentStatus(checkoutRequestID);
        const status = response.data.data;

        if (status.status === 'completed') {
          clearInterval(interval);
          setPaymentStatus({
            ...paymentStatus,
            status: 'completed',
            mpesaReceiptNumber: status.mpesaReceiptNumber,
          });
          toast.success('Payment successful! 🎉 Your tickets have been confirmed.');
          loadCart();
        } else if (status.status === 'failed') {
          clearInterval(interval);
          setPaymentStatus({
            ...paymentStatus,
            status: 'failed',
          });
          toast.error('Payment failed. Please try again.');
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          toast.error('Payment is taking too long. Please check your M-Pesa app.');
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
