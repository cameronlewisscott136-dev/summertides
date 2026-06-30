const axios = require('axios');

class PayHeroService {
    constructor() {
        // Use Basic Auth Token (NOT Bearer token)
        this.authToken = process.env.PAYHERO_BASIC_AUTH_TOKEN;

        // Channel (Till/Paybill ID)
        this.channelId = process.env.PAYHERO_CHANNEL_ID;

        // Correct PayHero base URL (Lipwa API v2)
        this.baseUrl =
            process.env.PAYHERO_API_URL ||
            'https://backend.payhero.co.ke/api/v2';

        console.log('========================================');
        console.log('🏦 PayHero Service Initialized');
        console.log(`📱 Channel ID: ${this.channelId}`);
        console.log('========================================');
    }

    // ================================
    // 🚀 INITIATE STK PUSH
    // ================================
    async initiateSTKPush(phoneNumber, amount, externalReference, customerName) {
        try {
            // Format phone number to 2547XXXXXXXX
            let formattedPhone = phoneNumber.replace(/^\+/, '');
            if (formattedPhone.startsWith('0')) {
                formattedPhone = '254' + formattedPhone.substring(1);
            }

            console.log('\n📱 PayHero STK Push');
            console.log('----------------------------------------');
            console.log(`💰 Amount: KES ${amount}`);
            console.log(`📱 Phone: ${formattedPhone}`);
            console.log(`📋 Reference: ${externalReference}`);
            console.log('----------------------------------------');

            const payload = {
                amount: Math.round(amount),
                phone: 254792231811,
                channel_id: this.channelId,
                external_reference: externalReference,
                customer_name: customerName || 'Customer',
                callback_url: `${process.env.BACKEND_URL}/api/payment/callback`
            };

            const response = await axios.post(
                `${this.baseUrl}/payments`,
                payload,
                {
                    headers: {
                        Authorization: this.authToken,
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log('✅ STK Push initiated successfully');
            console.log('Response:', response.data);
            console.log('----------------------------------------\n');

            return {
                success: true,
                data: response.data,
                formattedPhone
            };
        } catch (error) {
            console.error(
                '❌ PayHero STK Push Error:',
                error.response?.data || error.message
            );

            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }

    // ================================
    // 📊 CHECK TRANSACTION STATUS
    // ================================
    async checkTransactionStatus(externalReference) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/transactions/${externalReference}`,
                {
                    headers: {
                        Authorization: this.authToken
                    }
                }
            );

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error(
                '❌ Status check error:',
                error.response?.data || error.message
            );

            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }
}

module.exports = new PayHeroService();
