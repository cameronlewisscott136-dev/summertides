// frontend/src/components/PaymentModal.jsx
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

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleEmailChange = (e) => {
        const email = e.target.value;
        setPaymentData({ ...paymentData, email: email });
        
        if (email && !validateEmail(email)) {
            setEmailError('Please enter a valid email address');
        } else {
            setEmailError('');
        }
    };

    const handlePayment = () => {
        if (!paymentData.email) {
            setEmailError('Email is required to receive your tickets');
            return;
        }
        if (!validateEmail(paymentData.email)) {
            setEmailError('Please enter a valid email address');
            return;
        }
        handleInitiatePayment();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[10px]">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-2 text-[#0f172a]">Complete Payment</h2>
                <p className="text-[#64748b] mb-4">Enter your details to complete the payment</p>

                {/* YEA Bank Details */}
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-600">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                        </svg>
                        <span className="text-sm font-semibold text-teal-800">Payment Details</span>
                    </div>
                    <p className="text-xs text-teal-700">
                        💰 Payment received by: <strong>{process.env.REACT_APP_YEA_BANK_NAME || 'Co-operative Bank of Kenya'}</strong>
                    </p>
                    <p className="text-xs text-teal-600 mt-1">
                        📱 Paybill: <strong>{process.env.REACT_APP_MPESA_SHORTCODE || 'XXXXXX'}</strong>
                    </p>
                    <p className="text-xs text-teal-600">
                        📋 Account: <strong>{process.env.REACT_APP_YEA_ACCOUNT_NAME || 'YEA - Your Event Africa'}</strong>
                    </p>
                </div>

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
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                                emailError ? 'border-red-500 focus:ring-red-500' : 'border-[#e2e8f0]'
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

                <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-[#94a3b8] text-center flex items-center justify-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        Secured by M-Pesa & SSL Encryption
                    </p>
                    <p className="text-xs text-[#94a3b8] text-center mt-1">
                        Payment received by <strong>{process.env.REACT_APP_YEA_BANK_NAME || 'Co-operative Bank of Kenya'}</strong>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
