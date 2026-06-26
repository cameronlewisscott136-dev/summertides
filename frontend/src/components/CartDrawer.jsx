// src/components/CartDrawer.jsx
const CartDrawer = ({
    isCartOpen,
    isClosing,
    closeCart,
    cartCount,
    cartItems,
    cartTotal,
    handleUpdateCartItem,
    handleRemoveFromCart,
    setIsPaymentModalOpen
}) => {
    if (!isCartOpen) return null;

    // Handle checkout click - closes cart and opens payment modal
    const handleCheckout = () => {
        if (cartItems.length === 0) {
            //alert('Your cart is empty!');
            return;
        }

        // Close the cart first with animation
        closeCart();

        // Wait for cart to close before opening payment modal
        setTimeout(() => {
            setIsPaymentModalOpen(true);
        }, 400);
    };

    // Handle update with debugging - Use MongoDB _id
    const onUpdateQuantity = (itemId, newQuantity) => {
        console.log('Updating quantity:', { itemId, newQuantity });
        if (newQuantity < 0) return;
        handleUpdateCartItem(itemId, newQuantity);
    };

    // Handle remove with debugging - Use MongoDB _id
    const onRemoveItem = (itemId) => {
        console.log('Removing item with _id:', itemId);
        handleRemoveFromCart(itemId);
    };

    console.log('CartDrawer render:', { cartCount, cartItems, cartTotal });

    return (
        <div
            className={`fixed inset-0 z-50 grid grid-cols-1 place-items-end overflow-hidden transition-opacity duration-3000 ${isClosing ? 'bg-black/0 backdrop-blur-none' : 'bg-black/50 backdrop-blur-[10px]'
                }`}
            onClick={closeCart}
        >
            <div
                className={`size-full max-w-100 overflow-y-auto border-l bg-fuchsia-50 shadow-2xl md:max-w-142.75 px-4 md:px-10 transition-transform duration-500 ease-out ${isClosing ? 'translate-x-full' : 'translate-x-0'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative flex size-full flex-col">
                    <div className="flex items-center gap-3 border-b border-gray-100 p-5 px-0">
                        <button type="button" onClick={closeCart} className="text-[#64748b] hover:text-[#0f172a] transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" d="M9.57 5.93L3.5 12l6.07 6.07M20.5 12H3.67"></path>
                            </svg>
                        </button>
                        <h2 className="flex-1 text-lg font-semibold text-[#0f172a] flex items-center gap-2">
                            <p className="text-base font-semibold md:text-xl">Your cart</p>
                            <div className="inline-flex items-center justify-center rounded-full font-semibold text-xs uppercase text-white min-w-4 px-1 bg-teal-600 size-5 md:size-7">
                                <span className="text-[0.625rem] leading-2.5 font-semibold text-white text-xs md:text-sm">{cartCount}</span>
                            </div>
                        </h2>
                    </div>

                    {cartItems.length === 0 ? (
                        <div className="flex-1 overflow-y-auto pt-0 md:pt-3 px-4 -mx-4">
                            <div className="flex items-center justify-center h-full text-center">
                                <div className="text-center space-y-6 mx-auto p-6 max-w-80 w-full">
                                    <img alt="Empty cart illustration" loading="lazy" width="212" height="200" decoding="async" className="block mx-auto w-50 h-50 object-center object-cover" src="/illustrations/amico.png" />
                                    <h3 className="mt-6 text-base font-semibold text-[#0f172a]">Ooops! No items found.</h3>
                                    <p className="mt-1 text-sm text-[#64748b]">You don't have any items in your cart yet!</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex-1 overflow-y-auto pt-0 md:pt-3 px-4 -mx-4 space-y-4">
                                {cartItems.map((item) => {
                                    // IMPORTANT: Use MongoDB _id for operations
                                    const itemId = item._id;
                                    console.log('Rendering item:', { _id: itemId, id: item.id, name: item.name });
                                    return (
                                        <div key={itemId} className="flex items-center gap-4 py-4 border-b border-gray-100">
                                            <img
                                                src={item.image || 'https://via.placeholder.com/60'}
                                                alt={item.name}
                                                className="w-16 h-16 object-cover rounded-lg"
                                            />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-[#0f172a]">{item.name}</p>
                                                <p className="text-sm text-[#64748b]">KES {item.price.toLocaleString()}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <button
                                                        onClick={() => onUpdateQuantity(itemId, item.quantity - 1)}
                                                        className="px-2 py-1 text-xs border border-[#e2e8f0] rounded hover:bg-[#f1f5f9]"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        -
                                                    </button>
                                                    <span className="text-sm font-medium">{item.quantity}</span>
                                                    <button
                                                        onClick={() => onUpdateQuantity(itemId, item.quantity + 1)}
                                                        className="px-2 py-1 text-xs border border-[#e2e8f0] rounded hover:bg-[#f1f5f9]"
                                                    >
                                                        +
                                                    </button>
                                                    <button
                                                        onClick={() => onRemoveItem(itemId)}
                                                        className="ml-2 text-red-500 text-xs hover:text-red-700"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="font-semibold text-[#0f172a]">
                                                KES {(item.price * item.quantity).toLocaleString()}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex items-center gap-4 p-5 border-t border-gray-100 px-0 mt-6 md:my-8">
                                <div className="flex flex-col w-full gap-4 divide-y divide-gray-100">
                                    <div className="flex justify-between text-sm font-medium text-[#0f172a] md:text-base pb-4">
                                        <p>Subtotal</p>
                                        <p>KES&nbsp;{cartTotal.toLocaleString()}</p>
                                    </div>
                                    <div className="grid gap-4 pt-6">
                                        <button
                                            onClick={handleCheckout}
                                            className="group relative inline-flex items-center justify-center whitespace-nowrap outline-none transition duration-200 ease-out focus:outline-none disabled:pointer-events-none ring-1 ring-inset gap-3 rounded-lg px-3.5 text-sm bg-teal-600 hover:bg-teal-700 text-white h-12"
                                        >
                                            Proceed to Checkout
                                        </button>
                                        <button onClick={closeCart} className="group relative inline-flex items-center justify-center whitespace-nowrap outline-none transition duration-200 ease-out focus:outline-none disabled:pointer-events-none ring-1 ring-inset gap-3 rounded-lg px-3.5 text-sm bg-[#f1f5f9] text-[#64748b] ring-transparent hover:bg-white hover:text-[#0f172a] hover:shadow-sm hover:ring-[#cbd5e1] h-12">
                                            Continue shopping
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CartDrawer;