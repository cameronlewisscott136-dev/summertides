// backend/utils/payhero.js
const axios = require('axios');

class PayHeroService {
    constructor() {
        this.apiKey = process.env.PAYHERO_API_KEY;
        this.channelId = process.env.PAYHERO_CHANNEL_ID;
        this.baseUrl = process.env.PAYHERO_API_URL || 'https://api.payhero.co.ke';
        
        console.log('========================================');
        console.log('🏦 PayHero Service Initialized');
        console.log(`📱 Channel ID: ${this.channelId}`);
        console.log(`🏦 Bank: ${process.env.YEA_BANK_NAME}`);
        console.log(`📋 Account: ${process.env.YEA_ACCOUNT_NAME}`);
        console.log('========================================');
    }

    // Initiate STK Push via PayHero
    async initiateSTKPush(phoneNumber, amount, externalReference, customerName) {
        try {
            // Format phone number
            let formattedPhone = phoneNumber.replace(/^\+/, '');
            if (formattedPhone.startsWith('0')) {
                formattedPhone = '254' + formattedPhone.substring(1);
            }

            console.log('\n📱 PayHero STK Push Initiation');
            console.log('----------------------------------------');
            console.log(`💰 Amount: KES ${amount}`);
            console.log(`📱 Customer: ${formattedPhone}`);
            console.log(`📋 Reference: ${externalReference}`);
            console.log(`🏦 Settlement: ${process.env.YEA_BANK_NAME}`);
            console.log('----------------------------------------');

            const payload = {
                amount: Math.round(amount),
                phone: formattedPhone,
                channel_id: this.channelId,
                external_reference: externalReference,
                customer_name: customerName || 'Customer',
                callback_url: `${process.env.BACKEND_URL}/api/payment/payhero-callback`
            };

            console.log('📤 Sending to PayHero...');

            const response = await axios.post(
                `${this.baseUrl}/v1/payments/stk-push`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log('✅ STK Push initiated via PayHero');
            console.log(`📋 Response:`, response.data);
            console.log('----------------------------------------\n');

            return {
                success: true,
                data: response.data,
                formattedPhone,
            };
        } catch (error) {
            console.error('❌ PayHero STK Push error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message,
            };
        }
    }

    // Check transaction status
    async checkTransactionStatus(externalReference) {
        try {
            console.log(`🔍 Checking transaction: ${externalReference}`);

            const response = await axios.get(
                `${this.baseUrl}/v1/transactions/${externalReference}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                    },
                }
            );

            return {
                success: true,
                data: response.data,
            };
        } catch (error) {
            console.error('❌ Status check error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message,
            };
        }
    }
}

module.exports = new PayHeroService();
