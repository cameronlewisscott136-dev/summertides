// // src/components/PaymentModal.jsx
// import { useState } from 'react';

// const PaymentModal = ({
//     isPaymentModalOpen,
//     setIsPaymentModalOpen,
//     cartTotal,
//     setIsCartOpen,
//     closeCart,
//     handleInitiatePayment,
//     isLoading
// }) => {
//     const [phoneNumber, setPhoneNumber] = useState('');
//     const [email, setEmail] = useState('');
//     const [customerName, setCustomerName] = useState('');
//     const [emailError, setEmailError] = useState('');
//     const [phoneError, setPhoneError] = useState('');
//     const [nameError, setNameError] = useState('');

//     if (!isPaymentModalOpen) return null;

//     const validateEmail = (email) => {
//         const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         return re.test(email);
//     };

//     const validatePhone = (phone) => {
//         const clean = phone.replace(/^\+/, '');
//         return /^[0-9]{10,12}$/.test(clean);
//     };

//     const handleSubmit = (e) => {
//         e.preventDefault();

//         // Validate
//         let isValid = true;

//         if (!customerName.trim()) {
//             setNameError('Full name is required');
//             isValid = false;
//         } else {
//             setNameError('');
//         }

//         if (!email.trim()) {
//             setEmailError('Email is required');
//             isValid = false;
//         } else if (!validateEmail(email)) {
//             setEmailError('Please enter a valid email address');
//             isValid = false;
//         } else {
//             setEmailError('');
//         }

//         if (!phoneNumber.trim()) {
//             setPhoneError('Phone number is required');
//             isValid = false;
//         } else if (!validatePhone(phoneNumber)) {
//             setPhoneError('Enter a valid phone number (e.g., 254712345678)');
//             isValid = false;
//         } else {
//             setPhoneError('');
//         }

//         if (!isValid) return;

//         // Initiate STK Push
//         handleInitiatePayment(phoneNumber, email, cartTotal, customerName);

//         // Close modal after payment starts
//         setTimeout(() => {
//             setIsPaymentModalOpen(false);
//             if (setIsCartOpen) setIsCartOpen(false);
//             if (closeCart) closeCart();
//         }, 1000);
//     };

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[10px] p-4">
//             <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
//                 <div className="flex justify-between items-center mb-4">
//                     <h2 className="text-2xl font-bold text-[#0f172a]">Pay with M-Pesa</h2>
//                     <button
//                         onClick={() => {
//                             setIsPaymentModalOpen(false);
//                             setEmailError('');
//                             setPhoneError('');
//                             setNameError('');
//                         }}
//                         className="text-[#64748b] hover:text-[#0f172a]"
//                     >
//                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
//                         </svg>
//                     </button>
//                 </div>

//                 {/* Payment Info */}
//                 <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 mb-4">
//                     <div className="flex items-center gap-2 mb-1">
//                         <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
//                             <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
//                         </svg>
//                         <span className="text-sm font-semibold text-teal-800">M-Pesa STK Push</span>
//                     </div>
//                     <p className="text-xs text-teal-700">
//                         You'll receive a payment prompt on your phone. Enter your PIN to confirm.
//                     </p>
//                     <p className="text-xs text-teal-600 mt-1">
//                         💰 Amount: <strong>KES {cartTotal?.toLocaleString() || 0}</strong>
//                     </p>
//                     <p className="text-xs text-teal-600">
//                         🏦 Payment received by: <strong>{process.env.REACT_APP_YEA_BANK_NAME || 'Co-operative Bank of Kenya'}</strong>
//                     </p>
//                 </div>

//                 <form onSubmit={handleSubmit} className="space-y-4">
//                     {/* Full Name */}
//                     <div>
//                         <label className="block text-sm font-medium text-[#0f172a] mb-1">
//                             Full Name <span className="text-red-500">*</span>
//                         </label>
//                         <input
//                             type="text"
//                             value={customerName}
//                             onChange={(e) => setCustomerName(e.target.value)}
//                             placeholder="John Doe"
//                             className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
//                                 nameError ? 'border-red-500' : 'border-[#e2e8f0]'
//                             }`}
//                         />
//                         {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
//                     </div>

//                     {/* Email */}
//                     <div>
//                         <label className="block text-sm font-medium text-[#0f172a] mb-1">
//                             Email Address <span className="text-red-500">*</span>
//                         </label>
//                         <input
//                             type="email"
//                             value={email}
//                             onChange={(e) => setEmail(e.target.value)}
//                             placeholder="youremail@example.com"
//                             className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
//                                 emailError ? 'border-red-500' : 'border-[#e2e8f0]'
//                             }`}
//                         />
//                         {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
//                         <p className="text-xs text-[#94a3b8] mt-1">Tickets will be sent to this email</p>
//                     </div>

//                     {/* Phone Number */}
//                     <div>
//                         <label className="block text-sm font-medium text-[#0f172a] mb-1">
//                             Phone Number <span className="text-red-500">*</span>
//                         </label>
//                         <input
//                             type="tel"
//                             value={phoneNumber}
//                             onChange={(e) => setPhoneNumber(e.target.value)}
//                             placeholder="254712345678"
//                             className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
//                                 phoneError ? 'border-red-500' : 'border-[#e2e8f0]'
//                             }`}
//                         />
//                         {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
//                         <p className="text-xs text-[#94a3b8] mt-1">Format: 254712345678 (without +)</p>
//                     </div>

//                     <button
//                         type="submit"
//                         disabled={isLoading}
//                         className={`w-full py-3 rounded-lg text-white font-semibold transition-colors ${
//                             isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'
//                         }`}
//                     >
//                         {isLoading ? 'Processing...' : `Pay KES ${cartTotal?.toLocaleString() || 0}`}
//                     </button>

//                     <p className="text-xs text-[#94a3b8] text-center">
//                         🔒 Secured by M-Pesa & PayHero
//                     </p>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default PaymentModal;


// src/components/PaymentModal.jsx
import { useState } from 'react';
import { toast } from 'react-toastify';

const PaymentModal = ({
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    cartTotal,
    cartItems = [],
    setIsCartOpen,
    closeCart,
    sessionId
}) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        paymentMethod: 'mpesa',
        transactionCode: '',
        amount: cartTotal || 0,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSuccess, setIsSuccess] = useState(false);

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    if (!isPaymentModalOpen) return null;

    const paymentDetails = {
        mpesa: {
            name: 'M-Pesa',
            paybill: '400200',
            accountNumber: process.env.ACCOUNT_NUMBER || 01103105063001,
            instructions: 'Go to M-Pesa > Lipa na M-Pesa > Paybill'
        },
        airtel: {
            name: 'Airtel Money',
            paybill: '400200',
            accountNumber: process.env.ACCOUNT_NUMBER || 01103105063001,
            instructions: 'Go to Airtel Money > Paybill'
        }
    };

    const items = Array.isArray(cartItems) ? cartItems : [];

    const validateForm = () => {
        const newErrors = {};
        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Phone number is required';
        } else if (!/^[0-9]{10,12}$/.test(formData.phoneNumber.replace(/^\+/, ''))) {
            newErrors.phoneNumber = 'Please enter a valid phone number';
        }
        if (!formData.transactionCode.trim()) {
            newErrors.transactionCode = 'Transaction code is required';
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            // Show error toast for validation
            toast.error('Please fix all errors before submitting.', {
                duration: 3000,
                position: 'top-center',
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`${API_URL}/payment/submit-payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    email: formData.email,
                    phoneNumber: formData.phoneNumber,
                    paymentMethod: formData.paymentMethod,
                    transactionCode: formData.transactionCode,
                    amount: cartTotal,
                    cartItems: items,
                    sessionId: sessionId
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message || '✅ Payment details submitted!', {
                    duration: 5000,
                    position: 'top-center',
                    icon: '🎉',
                });

                setIsSuccess(true);
                
                setTimeout(() => {
                    setIsPaymentModalOpen(false);
                    if (setIsCartOpen) setIsCartOpen(false);
                    if (closeCart) closeCart();
                    setFormData({
                        fullName: '',
                        email: '',
                        phoneNumber: '',
                        paymentMethod: 'mpesa',
                        transactionCode: '',
                        amount: cartTotal || 0,
                    });
                    setIsSuccess(false);
                }, 3000);

            } else {
                toast.error(data.message || 'Failed to submit payment. Please try again.', {
                    duration: 4000,
                    position: 'top-center',
                });
            }

        } catch (error) {
            console.error('Error submitting payment:', error);
            toast.error('Network error. Please check your connection and try again.', {
                duration: 4000,
                position: 'top-center',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[10px] p-4">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
                {isSuccess ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-[#0f172a]">Payment Submitted!</h3>
                        <p className="text-[#64748b] mt-2">We'll verify your payment and send tickets to your email shortly.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-[#0f172a]">Complete Your Payment</h2>
                            <button
                                onClick={() => {
                                    setIsPaymentModalOpen(false);
                                    setErrors({});
                                }}
                                className="text-[#64748b] hover:text-[#0f172a]"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>

                        <div className="mb-6">
                            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                                <h4 className="text-sm font-semibold text-teal-800 mb-2">📋 Payment Instructions</h4>
                                <p className="text-xs text-teal-700 mb-2">
                                    <strong>1.</strong> Go to your {paymentDetails[formData.paymentMethod].name} app<br/>
                                    <strong>2.</strong> Select <strong>Paybill</strong> or <strong>Lipa na M-Pesa</strong><br/>
                                    <strong>3.</strong> Enter Paybill: <strong>{paymentDetails[formData.paymentMethod].paybill}</strong><br/>
                                    <strong>4.</strong> Enter Account Number: <strong>{paymentDetails[formData.paymentMethod].accountNumber}</strong><br/>
                                    <strong>5.</strong> Enter Amount: <strong>KES {cartTotal?.toLocaleString() || 0}</strong><br/>
                                    <strong>6.</strong> Enter your PIN to confirm<br/>
                                    <strong>7.</strong> Copy the confirmation code below
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {items.length > 0 && (
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <h4 className="text-sm font-semibold text-[#0f172a] mb-2">Order Summary</h4>
                                    <div className="space-y-1">
                                        {items.map((item, index) => (
                                            <div key={index} className="flex justify-between text-sm text-[#64748b]">
                                                <span>{item.name} x{item.quantity || 1}</span>
                                                <span>KES {((item.price || 0) * (item.quantity || 1)).toLocaleString()}</span>
                                            </div>
                                        ))}
                                        <div className="border-t border-gray-200 pt-2 mt-2">
                                            <div className="flex justify-between font-bold text-[#0f172a]">
                                                <span>Total</span>
                                                <span>KES {cartTotal?.toLocaleString() || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-[#0f172a] mb-1">
                                    Payment Method <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'mpesa' }))}
                                        className={`p-3 rounded-lg border-2 text-center transition-colors ${
                                            formData.paymentMethod === 'mpesa'
                                                ? 'border-teal-500 bg-teal-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <span className="text-lg">📱</span>
                                        <p className="text-sm font-medium">M-Pesa</p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'airtel' }))}
                                        className={`p-3 rounded-lg border-2 text-center transition-colors ${
                                            formData.paymentMethod === 'airtel'
                                                ? 'border-teal-500 bg-teal-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <span className="text-lg">📱</span>
                                        <p className="text-sm font-medium">Airtel Money</p>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#0f172a] mb-1">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    placeholder="John Doe"
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                                        errors.fullName ? 'border-red-500' : 'border-[#e2e8f0]'
                                    }`}
                                />
                                {errors.fullName && (
                                    <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#0f172a] mb-1">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="youremail@example.com"
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                                        errors.email ? 'border-red-500' : 'border-[#e2e8f0]'
                                    }`}
                                />
                                {errors.email && (
                                    <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                                )}
                                <p className="text-xs text-[#94a3b8] mt-1">Tickets will be sent to this email</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#0f172a] mb-1">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    placeholder="254712345678"
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                                        errors.phoneNumber ? 'border-red-500' : 'border-[#e2e8f0]'
                                    }`}
                                />
                                {errors.phoneNumber && (
                                    <p className="text-xs text-red-500 mt-1">{errors.phoneNumber}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#0f172a] mb-1">
                                    Transaction Code <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="transactionCode"
                                    value={formData.transactionCode}
                                    onChange={handleInputChange}
                                    placeholder="Enter the confirmation code from your app"
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                                        errors.transactionCode ? 'border-red-500' : 'border-[#e2e8f0]'
                                    }`}
                                />
                                {errors.transactionCode && (
                                    <p className="text-xs text-red-500 mt-1">{errors.transactionCode}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full py-3 rounded-lg text-white font-semibold transition-colors ${
                                    isSubmitting
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-teal-600 hover:bg-teal-700'
                                }`}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Payment Details'}
                            </button>

                            <p className="text-xs text-[#94a3b8] text-center">
                                Your payment details are secure. We'll verify your payment and send tickets to your email.
                            </p>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentModal;
