// src/components/EventModal.jsx
const EventModal = ({
    isEventModalOpen,
    selectedEvent,
    closeEventModal,
    ticketQuantities,
    handleTicketQuantity,
    handleAddToCart
}) => {
    if (!isEventModalOpen || !selectedEvent) return null;

    const totalTickets = Object.values(ticketQuantities).reduce((a, b) => a + b, 0);

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center bg-black/50 p-4 backdrop-blur-[10px] overflow-y-auto">
            <div className="px-6 max-w-200 m-auto relative w-full rounded-2xl shadow-regular-md focus:outline-none bg-fuchsia-50 text-[#0f172a]">
                <button
                    className="flex shrink-0 items-center justify-center outline-none transition duration-200 ease-out bg-transparent hover:bg-[#f1f5f9] hover:text-[#0f172a] size-6 rounded-md absolute right-4 top-4 text-[#64748b]"
                    onClick={closeEventModal}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
                    </svg>
                </button>
                <div className="p-4 max-h-full lg:p-5">
                    <div className="py-8 lg:px-2">
                        <div className="grid lg:grid-cols-2 lg:gap-10">
                            <div className="order-1 mt-4 space-y-3 sm:mt-16 sm:px-0 lg:mt-0 lg:-order-1">
                                <div className="flex justify-between">
                                    <h1 className="text-2xl font-bold text-[#0f172a] wrap-break-word">{selectedEvent.title}</h1>
                                    <button className="group relative inline-flex items-center justify-center whitespace-nowrap outline-none transition duration-200 ease-out focus:outline-none disabled:pointer-events-none ring-1 ring-inset h-11 gap-3 rounded-lg text-sm bg-[#f1f5f9] text-[#64748b] ring-transparent hover:bg-white hover:text-[#0f172a] hover:shadow-sm hover:ring-[#cbd5e1] px-2.5 ml-auto">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                                            <path d="M216,112v96a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V112A16,16,0,0,1,56,96H80a8,8,0,0,1,0,16H56v96H200V112H176a8,8,0,0,1,0-16h24A16,16,0,0,1,216,112ZM93.66,69.66,120,43.31V136a8,8,0,0,0,16,0V43.31l26.34,26.35a8,8,0,0,0,11.32-11.32l-40-40a8,8,0,0,0-11.32,0l-40,40A8,8,0,0,0,93.66,69.66Z"></path>
                                        </svg>
                                    </button>
                                </div>
                                <div>
                                    <h3 className="sr-only">Description</h3>
                                    <div className="text-[#64748b] space-y-1 text-sm wrap-break-word">
                                        <p>{selectedEvent.description}</p>
                                    </div>
                                </div>
                                <div className="mt-6 space-y-6">
                                    <div className="mt-6 flex w-full items-center gap-3">
                                        <div className="bg-white shadow-sm ring-stroke-soft-200 flex flex-col size-12 shrink-0 items-center justify-center rounded-md ring-1 ring-inset overflow-hidden">
                                            <p className="text-[10px] font-semibold uppercase p-1 w-full h-full text-center text-white bg-teal-600">Jul</p>
                                            <p className="text-sm font-semibold w-full p-1 text-center text-[#0f172a]">2</p>
                                        </div>
                                        <div className="min-w-0 flex-1 space-y-1">
                                            <p className="text-sm text-[#64748b]">{selectedEvent.date}</p>
                                            <p className="text-sm text-[#64748b] truncate"><span>End: </span>{selectedEvent.endDate}</p>
                                        </div>
                                    </div>
                                    <div className="flex w-full items-center gap-3">
                                        <div className="bg-neutral-50 flex size-12 shrink-0 items-center justify-center rounded-md">
                                            <svg className="text-neutral-300" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                <path d="M20.621 8.45c-1.05-4.62-5.08-6.7-8.62-6.7h-.01c-3.53 0-7.57 2.07-8.62 6.69-1.17 5.16 1.99 9.53 4.85 12.28a5.436 5.436 0 0 0 3.78 1.53c1.36 0 2.72-.51 3.77-1.53 2.86-2.75 6.02-7.11 4.85-12.27Zm-8.62 5.01a3.15 3.15 0 1 1 0-6.3 3.15 3.15 0 0 1 0 6.3Z" fill="currentColor"></path>
                                            </svg>
                                        </div>
                                        <div className="min-w-0 flex-1 space-y-1">
                                            <p className="text-sm text-[#0f172a]">{selectedEvent.location}</p>
                                            <button className="group inline-flex items-center justify-center whitespace-nowrap outline-none transition duration-200 ease-out underline underline-offset-[3px] hover:decoration-current focus:outline-none focus-visible:underline disabled:pointer-events-none disabled:text-text-disabled-300 disabled:no-underline h-5 gap-1 text-label-sm decoration-current text-[#94a3b8]">
                                                Click to view location
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full space-y-5">
                                <div className="rounded-lg overflow-hidden aspect-square w-full h-full">
                                    <img alt="Event image" fetchPriority="high" width="356" height="356" decoding="async" className="h-full w-full object-cover object-center bg-neutral-300 aspect-square" src={selectedEvent.image} />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col pt-4 mt-6 space-y-4 sm:space-y-8">
                            <p className="text-sm font-semibold border-b border-[#e2e8f0] pb-2">Tickets</p>
                            <div className="mt-1 grid grid-cols-1 gap-2 sm:gap-6 sm:grid-cols-2">
                                {selectedEvent.tickets.map((ticket) => {
                                    const isSoldOut = ticket.soldOut || !ticket.available;
                                    const currentQuantity = ticketQuantities[ticket.id] || 0;
                                    const isDecrementDisabled = currentQuantity === 0 || isSoldOut;
                                    const isIncrementDisabled = isSoldOut;

                                    return (
                                        <div
                                            key={ticket.id}
                                            className={`p-4 rounded-lg border ${isSoldOut ? 'border-gray-200 bg-gray-50 opacity-60' : 'border-[#e2e8f0] bg-white'} flex flex-col gap-4`}
                                        >
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm font-medium">
                                                    <span className={isSoldOut ? 'text-gray-500' : 'text-[#0f172a]'}>
                                                        {ticket.name}
                                                    </span>
                                                    {isSoldOut && (
                                                        <div className="inline-flex items-center justify-center rounded-full font-semibold h-5 gap-1.5 px-2 text-xs text-red-500 bg-red-50">
                                                            Sold out
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="space-y-1 text-sm text-[#64748b] wrap-break-word">
                                                    <p>{ticket.description}</p>
                                                </div>
                                                <p className="mt-2 text-sm font-semibold">
                                                    <span className={isSoldOut ? 'text-gray-500' : 'text-[#0f172a]'}>
                                                        KES&nbsp;{ticket.price}
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="mt-auto ml-auto">
                                                <div className="grid grid-cols-3 grid-flow-row gap-2.5 items-center justify-center p-2 rounded-lg bg-gray-50 h-10">
                                                    {/* Subtract Button */}
                                                    <button
                                                        className={`group inline-flex items-center justify-center whitespace-nowrap outline-none transition duration-200 ease-out underline decoration-transparent underline-offset-[3px] hover:decoration-current focus:outline-none focus-visible:underline disabled:pointer-events-none disabled:no-underline h-5 gap-1 text-label-sm ${isDecrementDisabled
                                                                ? 'text-gray-400 cursor-not-allowed'
                                                                : 'text-teal-600 hover:text-teal-700'
                                                            }`}
                                                        disabled={isDecrementDisabled}
                                                        onClick={() => handleTicketQuantity(ticket.id, 'decrement')}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                            <path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10 10-4.49 10-10S17.51 2 12 2Zm3.92 10.75h-8c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h8a.749.749 0 1 1 0 1.5Z" fill="currentColor"></path>
                                                        </svg>
                                                    </button>

                                                    {/* Quantity Display */}
                                                    <span className={`mx-auto text-sm font-medium ${isSoldOut ? 'text-gray-400' : 'text-[#0f172a]'}`}>
                                                        {currentQuantity}
                                                    </span>

                                                    {/* Add Button */}
                                                    <button
                                                        className={`group inline-flex items-center justify-center whitespace-nowrap outline-none transition duration-200 ease-out underline decoration-transparent underline-offset-[3px] hover:decoration-current focus:outline-none focus-visible:underline disabled:pointer-events-none disabled:no-underline h-5 gap-1 text-label-sm ${isIncrementDisabled
                                                                ? 'text-gray-400 cursor-not-allowed'
                                                                : 'text-teal-600 hover:text-teal-700'
                                                            }`}
                                                        disabled={isIncrementDisabled}
                                                        onClick={() => handleTicketQuantity(ticket.id, 'increment')}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                            <path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10 10-4.49 10-10S17.51 2 12 2Zm4 10.75h-3.25V16c0 .41-.34.75-.75.75s-.75-.34-.75-.75v-3.25H8c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h3.25V8c0-.41.34-.75.75-.75s.75.34.75.75v3.25H16c.41 0 .75.34.75.75s-.34.75-.75.75Z" fill="currentColor"></path>
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="grid grid-cols-2 gap-6 md:ml-auto">
                                <button
                                    disabled={totalTickets === 0}
                                    onClick={() => {
                                        const items = selectedEvent.tickets
                                            .filter(t => ticketQuantities[t.id] > 0)
                                            .map(t => ({
                                                id: t.id,
                                                name: `${selectedEvent.title} - ${t.name}`,
                                                price: t.price,
                                                quantity: ticketQuantities[t.id],
                                                type: 'ticket',
                                                eventId: selectedEvent.id,
                                                ticketId: t.id,
                                                image: selectedEvent.image,
                                            }));

                                        items.forEach(item => handleAddToCart(item));
                                        closeEventModal();
                                    }}
                                    className={`group relative inline-flex items-center justify-center whitespace-nowrap outline-none transition duration-200 ease-out focus:outline-none disabled:pointer-events-none gap-3 rounded-lg px-3.5 text-sm focus-visible:shadow-button-primary-focus w-full h-12 md:max-w-xs md:px-4 ${totalTickets === 0
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            : 'bg-teal-600 hover:bg-teal-700 text-white'
                                        }`}
                                >
                                    Add to Cart
                                </button>
                                <button onClick={closeEventModal} className="group relative inline-flex items-center justify-center whitespace-nowrap outline-none transition duration-200 ease-out focus:outline-none disabled:pointer-events-none ring-1 ring-inset gap-3 rounded-lg px-3 text-sm bg-[#f1f5f9] text-[#64748b] ring-transparent hover:bg-white hover:text-[#0f172a] hover:shadow-sm hover:ring-[#cbd5e1] w-full h-12 md:max-w-xs md:px-4">
                                    Continue shopping
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventModal;