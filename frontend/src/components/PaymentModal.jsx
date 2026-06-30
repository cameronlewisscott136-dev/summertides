// src/components/PaymentModal.jsx
import { useState } from 'react';

const PaymentModal = ({
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    cartTotal,
    setIsCartOpen,
    closeCart,
    handleInitiatePayment,
    isLoading
}) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [emailError, setEmailError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [nameError, setNameError] = useState('');

    if (!isPaymentModalOpen) return null;

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const validatePhone = (phone) => {
        const clean = phone.replace(/^\+/, '');
        return /^[0-9]{10,12}$/.test(clean);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate
        let isValid = true;

        if (!customerName.trim()) {
            setNameError('Full name is required');
            isValid = false;
        } else {
            setNameError('');
        }

        if (!email.trim()) {
            setEmailError('Email is required');
            isValid = false;
        } else if (!validateEmail(email)) {
            setEmailError('Please enter a valid email address');
            isValid = false;
        } else {
            setEmailError('');
        }

        if (!phoneNumber.trim()) {
            setPhoneError('Phone number is required');
            isValid = false;
        } else if (!validatePhone(phoneNumber)) {
            setPhoneError('Enter a valid phone number (e.g., 254712345678)');
            isValid = false;
        } else {
            setPhoneError('');
        }

        if (!isValid) return;

        // Initiate STK Push
        handleInitiatePayment(phoneNumber, email, cartTotal, customerName);

        // Close modal after payment starts
        setTimeout(() => {
            setIsPaymentModalOpen(false);
            if (setIsCartOpen) setIsCartOpen(false);
            if (closeCart) closeCart();
        }, 1000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[10px] p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-[#0f172a]">Pay with M-Pesa</h2>
                    <button
                        onClick={() => {
                            setIsPaymentModalOpen(false);
                            setEmailError('');
                            setPhoneError('');
                            setNameError('');
                        }}
                        className="text-[#64748b] hover:text-[#0f172a]"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                {/* Payment Info */}
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 mb-1">
                        <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                        </svg>
                        <span className="text-sm font-semibold text-teal-800">M-Pesa STK Push</span>
                    </div>
                    <p className="text-xs text-teal-700">
                        You'll receive a payment prompt on your phone. Enter your PIN to confirm.
                    </p>
                    <p className="text-xs text-teal-600 mt-1">
                        💰 Amount: <strong>KES {cartTotal?.toLocaleString() || 0}</strong>
                    </p>
                    <p className="text-xs text-teal-600">
                        🏦 Payment received by: <strong>{process.env.REACT_APP_YEA_BANK_NAME || 'Co-operative Bank of Kenya'}</strong>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-[#0f172a] mb-1">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="John Doe"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                                nameError ? 'border-red-500' : 'border-[#e2e8f0]'
                            }`}
                        />
                        {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-[#0f172a] mb-1">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="youremail@example.com"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                                emailError ? 'border-red-500' : 'border-[#e2e8f0]'
                            }`}
                        />
                        {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
                        <p className="text-xs text-[#94a3b8] mt-1">Tickets will be sent to this email</p>
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label className="block text-sm font-medium text-[#0f172a] mb-1">
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="254712345678"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                                phoneError ? 'border-red-500' : 'border-[#e2e8f0]'
                            }`}
                        />
                        {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
                        <p className="text-xs text-[#94a3b8] mt-1">Format: 254712345678 (without +)</p>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-3 rounded-lg text-white font-semibold transition-colors ${
                            isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'
                        }`}
                    >
                        {isLoading ? 'Processing...' : `Pay KES ${cartTotal?.toLocaleString() || 0}`}
                    </button>

                    <p className="text-xs text-[#94a3b8] text-center">
                        🔒 Secured by M-Pesa & PayHero
                    </p>
                </form>
            </div>
        </div>
    );
};

export default PaymentModal;
