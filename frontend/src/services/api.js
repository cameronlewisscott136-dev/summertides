// src/services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
    getCart: (sessionId) => api.get(`/cart?sessionId=${sessionId}`),
    addToCart: (sessionId, item) => api.post(`/cart/add?sessionId=${sessionId}`, item),
    updateCartItem: (sessionId, itemId, quantity) =>
        api.put(`/cart/update/${itemId}?sessionId=${sessionId}`, { quantity }),
    removeFromCart: (sessionId, itemId) =>
        api.delete(`/cart/remove/${itemId}?sessionId=${sessionId}`),
    clearCart: (sessionId) => api.delete(`/cart/clear?sessionId=${sessionId}`),
};

// Payment API - PayHero STK Push
export const paymentAPI = {
    initiatePayment: (data) => api.post('/payment/initiate', data),
    checkPaymentStatus: (externalReference) =>
        api.get(`/payment/status/${externalReference}`),
};

export default api;
