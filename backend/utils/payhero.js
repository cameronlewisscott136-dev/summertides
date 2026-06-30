const axios = require('axios');

class PayHeroService {
    constructor() {
        this.authToken = process.env.PAYHERO_BASIC_AUTH_TOKEN;
        this.channelId = process.env.PAYHERO_CHANNEL_ID;
        this.baseUrl = process.env.PAYHERO_API_URL || 'https://backend.payhero.co.ke/api/v2';

        console.log('========================================');
        console.log('🏦 PayHero Service Initialized');
        console.log(`📱 Channel ID: ${this.channelId}`);
        console.log(`🔑 Auth Token: ${this.authToken ? '✅ Set' : '❌ Missing'}`);
        console.log(`🌐 API URL: ${this.baseUrl}`);
        console.log('========================================');
    }

    async initiateSTKPush(phoneNumber, amount, externalReference, customerName) {
        try {
            // Format phone number
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
                phone: formattedPhone,
                channel_id: this.channelId,
                external_reference: externalReference,
                customer_name: customerName || 'Customer',
                callback_url: `${process.env.BACKEND_URL}/api/payment/callback`
            };

            console.log('📤 Sending to PayHero...');

            const response = await axios.post(
                `${this.baseUrl}/payments`,
                payload,
                {
                    headers: {
                        'Authorization': this.authToken,
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
            console.error('❌ PayHero STK Push Error:');
            console.error('Status:', error.response?.status);
            console.error('Data:', error.response?.data);
            console.error('Message:', error.message);

            return {
                success: false,
                error: error.response?.data || error.message,
                status: error.response?.status
            };
        }
    }

    async checkTransactionStatus(externalReference) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/transactions/${externalReference}`,
                {
                    headers: {
                        'Authorization': this.authToken
                    }
                }
            );

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('❌ Status check error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }
}

module.exports = new PayHeroService();
