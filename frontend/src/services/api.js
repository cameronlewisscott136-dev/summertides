// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

// Cart API
export const cartAPI = {
    getCart: (sessionId) => {
        console.log('API: Getting cart for session:', sessionId);
        return api.get(`/cart?sessionId=${sessionId}`);
    },

    addToCart: (sessionId, item) => {
        console.log('API: Adding to cart:', { sessionId, item });
        return api.post(`/cart/add?sessionId=${sessionId}`, item);
    },

    updateCartItem: (sessionId, itemId, quantity) => {
        console.log('API: Updating cart item:', { sessionId, itemId, quantity });
        return api.put(`/cart/update/${itemId}?sessionId=${sessionId}`, { quantity });
    },

    removeFromCart: (sessionId, itemId) => {
        console.log('API: Removing from cart:', { sessionId, itemId });
        return api.delete(`/cart/remove/${itemId}?sessionId=${sessionId}`);
    },

    clearCart: (sessionId) => {
        console.log('API: Clearing cart for session:', sessionId);
        return api.delete(`/cart/clear?sessionId=${sessionId}`);
    },
};

// Payment API - UPDATED to include email
export const paymentAPI = {
    initiateMpesaPayment: (data) => {
        console.log('API: Initiating payment:', data);
        return api.post('/payment/initiate', data);
    },
    checkPaymentStatus: (checkoutRequestID) => {
        console.log('API: Checking payment status:', checkoutRequestID);
        return api.get(`/payment/status/${checkoutRequestID}`);
    },
};

export default api;