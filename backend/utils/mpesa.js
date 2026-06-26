const axios = require('axios');

class MpesaService {
    constructor() {
        this.consumerKey = process.env.MPESA_CONSUMER_KEY;
        this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
        this.passkey = process.env.MPESA_PASSKEY;
        this.shortcode = process.env.MPESA_SHORTCODE;
        this.env = process.env.MPESA_ENV || 'sandbox';

        this.baseUrl = this.env === 'sandbox'
            ? 'https://sandbox.safaricom.co.ke'
            : 'https://api.safaricom.co.ke';
    }

    // Get M-Pesa access token
    async getToken() {
        try {
            const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
            const response = await axios.get(
                `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
                {
                    headers: {
                        Authorization: `Basic ${auth}`,
                    },
                }
            );
            return response.data.access_token;
        } catch (error) {
            console.error('Error getting M-Pesa token:', error.response?.data || error.message);
            throw new Error('Failed to get M-Pesa token');
        }
    }

    // Initiate STK Push
    async initiateSTKPush(phoneNumber, amount, accountReference, description) {
        try {
            // Format phone number
            let formattedPhone = phoneNumber.replace(/^\+/, '');
            if (formattedPhone.startsWith('0')) {
                formattedPhone = '254' + formattedPhone.substring(1);
            }

            // Get token
            const token = await this.getToken();

            // Generate timestamp and password
            const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
            const password = Buffer.from(
                `${this.shortcode}${this.passkey}${timestamp}`
            ).toString('base64');

            // STK Push request
            const response = await axios.post(
                `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
                {
                    BusinessShortCode: this.shortcode,
                    Password: password,
                    Timestamp: timestamp,
                    TransactionType: 'CustomerPayBillOnline',
                    Amount: Math.round(amount),
                    PartyA: formattedPhone,
                    PartyB: this.shortcode,
                    PhoneNumber: formattedPhone,
                    CallBackURL: `${process.env.BACKEND_URL}/api/payment/callback`,
                    AccountReference: accountReference || 'FestivalTickets',
                    TransactionDesc: description || 'Summer Tides Festival Tickets',
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            return {
                success: true,
                data: response.data,
                formattedPhone,
            };
        } catch (error) {
            console.error('STK Push error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message,
            };
        }
    }

    // Check payment status
    async checkPaymentStatus(checkoutRequestID) {
        try {
            const token = await this.getToken();

            const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
            const password = Buffer.from(
                `${this.shortcode}${this.passkey}${timestamp}`
            ).toString('base64');

            const response = await axios.post(
                `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
                {
                    BusinessShortCode: this.shortcode,
                    Password: password,
                    Timestamp: timestamp,
                    CheckoutRequestID: checkoutRequestID,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            console.error('Status check error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message,
            };
        }
    }
}

module.exports = new MpesaService();