// src/components/PaymentModal.jsx
import { useState } from 'react';

const PaymentModal = ({
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    cartTotal,
    paymentData,
    setPaymentData,
    handleInitiatePayment,
    isLoading
}) => {
    const [emailError, setEmailError] = useState('');

    if (!isPaymentModalOpen) return null;

    // Validate email
    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    // Handle email change
    const handleEmailChange = (e) => {
        const email = e.target.value;
        setPaymentData({ ...paymentData, email: email });

        if (email && !validateEmail(email)) {
            setEmailError('Please enter a valid email address');
        } else {
            setEmailError('');
        }
    };

    // Handle payment with validation
    const handlePayment = () => {
        // Validate email
        if (!paymentData.email) {
            setEmailError('Email is required to receive your tickets');
            return;
        }
        if (!validateEmail(paymentData.email)) {
            setEmailError('Please enter a valid email address');
            return;
        }

        // Proceed with payment
        handleInitiatePayment();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[10px]">
            <div className="bg-fuchsia-50 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4 text-[#0f172a]">Complete Payment</h2>
                <p className="text-[#64748b] mb-6">Enter your details to complete the payment and receive your tickets</p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[#0f172a] mb-1">Amount</label>
                        <div className="text-2xl font-bold text-teal-600">KES {cartTotal.toLocaleString()}</div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#0f172a] mb-1">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={paymentData.email || ''}
                            onChange={handleEmailChange}
                            placeholder="youremail@example.com"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${emailError ? 'border-red-500 focus:ring-red-500' : 'border-[#e2e8f0]'
                                }`}
                        />
                        {emailError && (
                            <p className="text-xs text-red-500 mt-1">{emailError}</p>
                        )}
                        <p className="text-xs text-[#94a3b8] mt-1">Your tickets will be sent to this email</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#0f172a] mb-1">
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            value={paymentData.phoneNumber}
                            onChange={(e) => setPaymentData({ ...paymentData, phoneNumber: e.target.value })}
                            placeholder="254712345678"
                            className="w-full px-4 py-2 border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <p className="text-xs text-[#94a3b8] mt-1">Format: 254712345678 (without +)</p>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={() => {
                            setIsPaymentModalOpen(false);
                            setEmailError('');
                        }}
                        className="flex-1 px-4 py-2 border border-[#e2e8f0] rounded-lg hover:bg-[#f1f5f9] transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handlePayment}
                        disabled={
                            !paymentData.phoneNumber ||
                            paymentData.phoneNumber.length < 10 ||
                            !paymentData.email ||
                            !!emailError ||
                            isLoading
                        }
                        className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Processing...' : 'Pay Now'}
                    </button>
                </div>

                {/* Security notice */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-[#94a3b8] text-center flex items-center justify-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        Secured by M-Pesa & SSL Encryption
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;