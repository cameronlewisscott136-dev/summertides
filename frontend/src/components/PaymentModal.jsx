// src/components/PaymentModal.jsx
import { useState, useEffect, useRef } from 'react';

const PaymentModal = ({
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    cartTotal,
    cartItems = [],
    setIsCartOpen,
    closeCart,
    sessionId,
}) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        paymentMethod: 'mpesa',
    });
    const [step, setStep] = useState('form');      // 'form' | 'waiting' | 'success' | 'failed'
    const [errors, setErrors] = useState({});
    const [reference, setReference] = useState(null);
    const [statusMessage, setStatusMessage] = useState('');
    const pollIntervalRef = useRef(null);

    // ── API base URL ──────────────────────────────────────────────────────────
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    // const API_BASE_URL = 'https://summertides-2026.onrender.com/api';
    // const API_BASE_URL = 'https://6667-102-203-236-20.ngrok-free.app/api';

    const items = Array.isArray(cartItems) ? cartItems : [];

    useEffect(() => {
        return () => clearInterval(pollIntervalRef.current);
    }, []);

    if (!isPaymentModalOpen) return null;

    // ── Validation ────────────────────────────────────────────────────────────
    const validate = () => {
        const e = {};
        if (!formData.fullName.trim()) e.fullName = 'Full name is required';
        if (!formData.email.trim()) {
            e.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            e.email = 'Enter a valid email address';
        }
        if (!formData.phoneNumber.trim()) {
            e.phoneNumber = 'Phone number is required';
        } else if (!/^[0-9]{10,12}$/.test(formData.phoneNumber.replace(/^\+/, ''))) {
            e.phoneNumber = 'Enter a valid phone number (e.g. 0712345678)';
        }
        return e;
    };

    // ── Poll /payment/status/:externalReference ───────────────────────────────
    const startPolling = (externalRef) => {
        let attempts = 0;
        const MAX_ATTEMPTS = 24; // 2 min at 5s intervals

        pollIntervalRef.current = setInterval(async () => {
            attempts++;
            try {
                const res = await fetch(`${API_BASE_URL}/payment/status/${externalRef}`);
                const data = await res.json();

                const status = data?.data?.status;

                if (status === 'completed') {
                    clearInterval(pollIntervalRef.current);
                    setStep('success');
                } else if (['failed', 'cancelled', 'timeout'].includes(status)) {
                    clearInterval(pollIntervalRef.current);
                    setStep('failed');
                    setStatusMessage(
                        status === 'timeout'
                            ? 'Payment timed out. If you paid, please contact support.'
                            : 'Payment was declined or cancelled. Please try again.'
                    );
                } else if (attempts >= MAX_ATTEMPTS) {
                    clearInterval(pollIntervalRef.current);
                    setStep('failed');
                    setStatusMessage('Payment timed out. If you paid, please contact support.');
                }
            } catch {
                // Network hiccup — keep polling silently
            }
        }, 5000);
    };

    // ── Initiate STK push ─────────────────────────────────────────────────────
    const handleSubmit = async () => {
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

        setStep('waiting');
        setStatusMessage('Sending payment prompt to your phone…');

        console.log('📤 Initiating payment:', {
            phoneNumber: formData.phoneNumber,
            email: formData.email,
            customerName: formData.fullName,
            amount: cartTotal,
            sessionId,
        });

        try {
            const res = await fetch(`${API_BASE_URL}/payment/initiate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phoneNumber: formData.phoneNumber,
                    email: formData.email,
                    customerName: formData.fullName,
                    amount: cartTotal,
                    provider: formData.paymentMethod,
                    cartItems: items,
                    sessionId,
                }),
            });

            const data = await res.json();
            console.log('📥 Initiate response:', data);

            if (res.ok && data.success && data.data?.externalReference) {
                setReference(data.data.externalReference);
                setStatusMessage('Check your phone and enter your M-Pesa PIN to complete payment.');
                startPolling(data.data.externalReference);
            } else {
                setStep('failed');
                setStatusMessage(data.message || 'Could not initiate payment. Please try again.');
            }
        } catch (err) {
            console.error('❌ Initiate fetch error:', err);
            setStep('failed');
            setStatusMessage('Network error. Please check your connection and try again.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const resetModal = () => {
        clearInterval(pollIntervalRef.current);
        setStep('form');
        setErrors({});
        setReference(null);
        setStatusMessage('');
        setFormData({ fullName: '', email: '', phoneNumber: '', paymentMethod: 'mpesa' });
    };

    const handleClose = () => {
        resetModal();
        setIsPaymentModalOpen(false);
        if (setIsCartOpen) setIsCartOpen(false);
        if (closeCart) closeCart();
    };

    // ── Sub-views ─────────────────────────────────────────────────────────────

    const SuccessView = () => (
        <div className="text-center py-10 px-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <h3 className="text-xl font-bold text-[#0f172a]">Payment Successful!</h3>
            <p className="text-[#64748b] mt-2 text-sm">
                We'll send your tickets to <strong>{formData.email}</strong> shortly.
            </p>
            <button
                onClick={handleClose}
                className="mt-6 px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
                Done
            </button>
        </div>
    );

    const FailedView = () => (
        <div className="text-center py-10 px-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </div>
            <h3 className="text-xl font-bold text-[#0f172a]">Payment Failed</h3>
            <p className="text-[#64748b] mt-2 text-sm">{statusMessage}</p>
            <div className="flex gap-3 mt-6 justify-center">
                <button
                    onClick={resetModal}
                    className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                    Try Again
                </button>
                <button
                    onClick={handleClose}
                    className="px-6 py-2 border border-[#e2e8f0] text-[#64748b] hover:text-[#0f172a] rounded-lg text-sm font-semibold transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    );

    const WaitingView = () => (
        <div className="text-center py-10 px-4">
            <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-teal-100 animate-ping opacity-50" />
                <div className="relative w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center">
                    <svg className="w-9 h-9 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                </div>
            </div>
            <h3 className="text-xl font-bold text-[#0f172a]">Check Your Phone</h3>
            <p className="text-[#64748b] mt-2 text-sm max-w-xs mx-auto">{statusMessage}</p>
            <div className="mt-6 bg-teal-50 border border-teal-200 rounded-lg p-4 text-left text-xs text-teal-700 space-y-1">
                <p><strong>Amount:</strong> KES {cartTotal?.toLocaleString()}</p>
                <p><strong>Phone:</strong> {formData.phoneNumber}</p>
                {reference && <p><strong>Ref:</strong> {reference}</p>}
            </div>
            <p className="text-xs text-[#94a3b8] mt-4">Waiting for confirmation… this usually takes under 30 seconds.</p>
            <button
                onClick={resetModal}
                className="mt-5 text-xs text-[#94a3b8] hover:text-[#64748b] underline underline-offset-2"
            >
                Cancel and go back
            </button>
        </div>
    );

    const FormView = () => (
        <>
            <div className="flex justify-between items-center mb-5">
                <h2 className="text-2xl font-bold text-[#0f172a]">Complete Payment</h2>
                <button onClick={handleClose} className="text-[#64748b] hover:text-[#0f172a]">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {items.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 mb-5">
                    <h4 className="text-sm font-semibold text-[#0f172a] mb-2">Order Summary</h4>
                    <div className="space-y-1">
                        {items.map((item, i) => (
                            <div key={i} className="flex justify-between text-sm text-[#64748b]">
                                <span>{item.name} ×{item.quantity || 1}</span>
                                <span>KES {((item.price || 0) * (item.quantity || 1)).toLocaleString()}</span>
                            </div>
                        ))}
                        <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-bold text-[#0f172a]">
                            <span>Total</span>
                            <span>KES {cartTotal?.toLocaleString() || 0}</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-4">
                <label className="block text-sm font-medium text-[#0f172a] mb-2">
                    Payment Method <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { value: 'mpesa', label: 'M-Pesa', emoji: '📱' },
                        { value: 'airtel', label: 'Airtel Money', emoji: '📱' },
                    ].map(({ value, label, emoji }) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, paymentMethod: value }))}
                            className={`p-3 rounded-xl border-2 text-center transition-colors ${
                                formData.paymentMethod === value
                                    ? 'border-teal-500 bg-teal-50'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            <span className="text-lg">{emoji}</span>
                            <p className="text-sm font-medium mt-0.5">{label}</p>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                {[
                    { name: 'fullName',    label: 'Full Name',     type: 'text',  placeholder: 'John Doe' },
                    { name: 'email',       label: 'Email Address', type: 'email', placeholder: 'you@example.com', hint: 'Tickets will be sent here' },
                    { name: 'phoneNumber', label: 'Phone Number',  type: 'tel',   placeholder: '0712345678',      hint: 'M-Pesa prompt will be sent to this number' },
                ].map(({ name, label, type, placeholder, hint }) => (
                    <div key={name}>
                        <label className="block text-sm font-medium text-[#0f172a] mb-1">
                            {label} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type={type}
                            name={name}
                            value={formData[name]}
                            onChange={handleInputChange}
                            placeholder={placeholder}
                            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm ${
                                errors[name] ? 'border-red-400' : 'border-[#e2e8f0]'
                            }`}
                        />
                        {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
                        {hint && !errors[name] && <p className="text-xs text-[#94a3b8] mt-1">{hint}</p>}
                    </div>
                ))}
            </div>

            <button
                onClick={handleSubmit}
                className="mt-6 w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.98] text-white font-semibold text-sm transition-all"
            >
                Pay KES {cartTotal?.toLocaleString() || 0} via {formData.paymentMethod === 'mpesa' ? 'M-Pesa' : 'Airtel Money'}
            </button>

            <p className="text-xs text-[#94a3b8] text-center mt-3">
                You'll receive an STK push on your phone to confirm payment.
            </p>
        </>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[8px] p-4">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
                {step === 'form'    && <FormView />}
                {step === 'waiting' && <WaitingView />}
                {step === 'success' && <SuccessView />}
                {step === 'failed'  && <FailedView />}
            </div>
        </div>
    );
};

export default PaymentModal;