// src/App.jsx
import { useState, useEffect } from 'react';
import { useCart } from './hooks/useCart';
import { events, categories, sortOptions } from './data/events';
import Navbar from './components/Navbar';
import SearchModal from './components/SearchModal';
import PaymentModal from './components/PaymentModal';
import EventModal from './components/EventModal';
import CartDrawer from './components/CartDrawer';
import Footer from './components/Footer';

const App = () => {
  // Session management - FIXED: Ensure sessionId is always a string
  const [sessionId, setSessionId] = useState(() => {
    let session = localStorage.getItem('cartSessionId');
    if (!session || session === 'undefined' || session === 'null') {
      session = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('cartSessionId', session);
    }
    return session;
  });

  // State
  const [activeTab, setActiveTab] = useState('events');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('All');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [ticketQuantities, setTicketQuantities] = useState({});
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({
    phoneNumber: '',
    email: '',
    amount: 0,
  });

  // Cart hook with sessionId
  const {
    cartCount,
    cartItems,
    cartTotal,
    isLoading,
    handleAddToCart,
    handleUpdateCartItem,
    handleRemoveFromCart,
    handleInitiatePayment,
  } = useCart(sessionId);

  // Close cart with animation
  const closeCart = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsCartOpen(false);
      setIsClosing(false);
    }, 500);
  };

  // Open cart
  const openCart = () => {
    setIsCartOpen(true);
    setIsClosing(false);
  };

  // Handle ticket quantity
  const handleTicketQuantity = (ticketId, action) => {
    setTicketQuantities(prev => ({
      ...prev,
      [ticketId]: Math.max(0, (prev[ticketId] || 0) + (action === 'increment' ? 1 : -1))
    }));
  };

  // Open event modal
  const openEventModal = (event) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  // Close event modal
  const closeEventModal = () => {
    setIsEventModalOpen(false);
    setSelectedEvent(null);
    setTicketQuantities({});
  };

  // Handle payment initiation - UPDATED to include email
  const handlePaymentInitiate = async () => {
  const result = await handleInitiatePayment(
    paymentData.phoneNumber,
    paymentData.email,  // Pass email
    cartTotal
  );
  if (result.success) {
    setIsPaymentModalOpen(false);
    setPaymentData({
      phoneNumber: '',
      email: '',
      amount: 0,
    });
  }
};

  // Debug: Log cart state changes
  useEffect(() => {
    console.log('Session ID:', sessionId);
    console.log('Cart updated:', { cartCount, cartItems, cartTotal });
  }, [sessionId, cartCount, cartItems, cartTotal]);

  return (
    <div className="relative flex min-h-svh flex-col bg-[#fef2f2]">
      <div className="flex flex-1 flex-col">
        <Navbar
          cartCount={cartCount}
          setIsSearchOpen={setIsSearchOpen}
          setIsCartOpen={openCart}
        />

        <SearchModal
          isSearchOpen={isSearchOpen}
          setIsSearchOpen={setIsSearchOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <PaymentModal 
          isPaymentModalOpen={isPaymentModalOpen}
          setIsPaymentModalOpen={setIsPaymentModalOpen}
          cartTotal={cartTotal}
          cartItems={cartItems}  // ADD THIS - pass cartItems
          setIsCartOpen={setIsCartOpen}
          closeCart={closeCart}
          sessionId={sessionId}
      />

        <EventModal
          isEventModalOpen={isEventModalOpen}
          selectedEvent={selectedEvent}
          closeEventModal={closeEventModal}
          ticketQuantities={ticketQuantities}
          handleTicketQuantity={handleTicketQuantity}
          handleAddToCart={handleAddToCart}
        />

        <CartDrawer
          isCartOpen={isCartOpen}
          isClosing={isClosing}
          closeCart={closeCart}
          cartCount={cartCount}
          cartItems={cartItems}
          cartTotal={cartTotal}
          handleUpdateCartItem={handleUpdateCartItem}
          handleRemoveFromCart={handleRemoveFromCart}
          setIsPaymentModalOpen={setIsPaymentModalOpen}
        />

        {/* Main Content */}
        <main className="bg-fuchsia-50 flex flex-1 flex-col">
          <div className="mx-auto w-full">
            {/* Banner */}
            <div className="relative flex h-33 md:h-80">
              <img
                alt="Hustle store banner"
                fetchPriority="high"
                width="672"
                height="320"
                decoding="async"
                className="h-33 object-cover w-full md:h-80"
                src="https://firebasestorage.googleapis.com/v0/b/hustle-build.appspot.com/o/hustle%2FScreenshot%202025-11-10%20at%2016.01.54.png?alt=media&token=1bcc3d82-ba2a-43d2-9f43-8fb459a31921"
              />
            </div>

            {/* Shop Info Section */}
            <div className="relative container mx-auto px-4 md:px-6 lg:px-8">
              <div className="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
                <div className="flex relative">
                  <img
                    alt="Shop logo"
                    fetchPriority="high"
                    width="108"
                    height="108"
                    decoding="async"
                    className="h-24 w-24 rounded-lg ring-4 ring-white sm:h-27 sm:w-27 bg-gray-200"
                    src="https://firebasestorage.googleapis.com/v0/b/hustle-build.appspot.com/o/hustle%2FSummer%20Tides%20Logo_page-0001.jpg?alt=media&token=a27deaff-d558-49fb-a3c9-ff2d314fc6e1"
                  />
                </div>
                <div className="relative mt-18 sm:flex sm:min-w-0 sm:flex-1 sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
                  <div className="flex space-x-6 mt-6 lg:flex">
                    <a target="_blank" rel="noopener noreferrer" href="https://www.instagram.com/summertides.fest/">
                      <span className="sr-only">Instagram</span>
                      <img alt="" loading="lazy" width="28" height="28" decoding="async" className="h-6 w-auto max-w-full" src="/logos/ig.png" />
                    </a>
                    <a target="_blank" rel="noopener noreferrer" href="https://x.com/summertidesfest">
                      <span className="sr-only">Twitter</span>
                      <img alt="" loading="lazy" width="24" height="24" decoding="async" className="h-6 w-auto max-w-full" src="/logos/x-black.png" />
                    </a>
                    <a target="_blank" rel="noopener noreferrer" href="https://www.youtube.com/@SUMMERTIDESFESTIVAL">
                      <span className="sr-only">YouTube</span>
                      <img alt="" loading="lazy" width="24" height="24" decoding="async" className="h-6 w-auto max-w-full" src="/logos/youtube.png" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-6 min-w-0 flex-1 sm:block">
                <div className="flex items-center gap-2 justify-between lg:gap-6 lg:justify-start">
                  <div className="flex items-center gap-1">
                    <h1 className="truncate text-lg font-bold text-[#0f172a] lg:text-3xl">SUMMER TIDES FESTIVAL</h1>
                    <span>
                      <svg className="size-4 text-teal-600 lg:size-8" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="m21.56 10.739-1.36-1.58c-.26-.3-.47-.86-.47-1.26v-1.7c0-1.06-.87-1.93-1.93-1.93h-1.7c-.39 0-.96-.21-1.26-.47l-1.58-1.36c-.69-.59-1.82-.59-2.52 0l-1.57 1.37c-.3.25-.87.46-1.26.46H6.18c-1.06 0-1.93.87-1.93 1.93v1.71c0 .39-.21.95-.46 1.25l-1.35 1.59c-.58.69-.58 1.81 0 2.5l1.35 1.59c.25.3.46.86.46 1.25v1.71c0 1.06.87 1.93 1.93 1.93h1.73c.39 0 .96.21 1.26.47l1.58 1.36c.69.59 1.82.59 2.52 0l1.58-1.36c.3-.26.86-.47 1.26-.47h1.7c1.06 0 1.93-.87 1.93-1.93v-1.7c0-.39.21-.96.47-1.26l1.36-1.58c.58-.69.58-1.83-.01-2.52Zm-5.4-.63-4.83 4.83a.75.75 0 0 1-1.06 0l-2.42-2.42a.754.754 0 0 1 0-1.06c.29-.29.77-.29 1.06 0l1.89 1.89 4.3-4.3c.29-.29.77-.29 1.06 0 .29.29.29.77 0 1.06Z" fill="currentColor"></path>
                      </svg>
                    </span>
                  </div>
                </div>
                <div className="text-[#64748b] leading-[1.6rem] mt-4 space-y-1 text-sm wrap-break-word">
                  <p>Africa's #1 Beach Festival 🏝️ <br />Offical store for Summer Tides Festival</p>
                </div>
              </div>

              <div className="flex space-x-6 mt-6 lg:hidden">
                <a target="_blank" rel="noopener noreferrer" href="https://www.instagram.com/summertides.fest/">
                  <span className="sr-only">Instagram</span>
                  <img alt="" loading="lazy" width="24" height="24" decoding="async" className="h-6 w-auto max-w-full" src="/logos/ig.png" />
                </a>
                <a target="_blank" rel="noopener noreferrer" href="https://x.com/summertidesfest">
                  <span className="sr-only">Twitter</span>
                  <img alt="" loading="lazy" width="20" height="20" decoding="async" className="h-6 w-auto max-w-full" src="/logos/x-black.png" />
                </a>
                <a target="_blank" rel="noopener noreferrer" href="https://www.youtube.com/@SUMMERTIDESFESTIVAL">
                  <span className="sr-only">YouTube</span>
                  <img alt="" loading="lazy" width="24" height="24" decoding="async" className="h-6 w-auto max-w-full" src="/logos/youtube.png" />
                </a>
              </div>
            </div>

            {/* Products/Events Section */}
            <div className="container mx-auto px-4 md:px-6 lg:px-8 py-10 lg:py-16">
              <div>
                {/* Tabs */}
                <div className="pb-10 border-b border-[#e2e8f0] grid gap-6 lg:flex lg:justify-between">
                  <div className="switch-toggle py-2.5 -my-2.5 flex justify-start gap-x-4 overflow-x-auto lg:max-w-81.75">
                    <button
                      className={`${activeTab === 'events' ? 'bg-teal-600 text-white' : 'bg-white text-[#64748b] hover:bg-red-50'} flex items-center gap-2 px-4 py-2 rounded-lg transition-all ring-1 ring-inset ring-[#e2e8f0]`}
                      onClick={() => setActiveTab('events')}
                    >
                      <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path opacity=".4" d="M20.841 13.17c.39 0 .7-.32.7-.72v-.88c0-3.93-1.2-5.12-5.12-5.12h-6.3v2.43c.39 0 .71.32.71.71v2.68c0 .39-.32.71-.71.71v2.51c.39 0 .71.32.71.71v2.68c0 .39-.32.71-.71.71V22h6.3c3.92 0 5.12-1.2 5.12-5.12 0-.39-.31-.71-.7-.71a1.5 1.5 0 1 1 0-3Z" fill="currentColor"></path>
                          <path d="M7.569 6.46c.01 0 .01 0 0 0h9.04c-.01-.02-.01-.03-.01-.05a1.2 1.2 0 0 1 .37-.95c.13-.13.21-.31.21-.5s-.08-.37-.21-.5l-.55-.56c-.98-.99-2.06-1.9-3.32-1.9-1.25 0-2.34.91-3.32 1.9l-2.56 2.56h.35ZM9.41 9.59v2.68c0 .39.32.71.71.71v2.51c-.39 0-.71.32-.71.71v2.68c0 .39.32.71.71.71V22H7.58c-3.92 0-5.12-1.2-5.12-5.12v-.43c0-.4.31-.71.7-.71.84 0 1.51-.68 1.51-1.51S4 12.72 3.16 12.72c-.39 0-.7-.31-.7-.71v-.43c0-3.93 1.2-5.12 5.12-5.12h2.53v2.43c-.38 0-.7.32-.7.7Z" fill="currentColor"></path>
                        </svg>
                      </span>
                      Events
                      <span className={`badge ${activeTab === 'events' ? 'bg-white text-teal-600' : 'bg-gray-200 text-[#64748b]'} px-2 py-0.5 rounded-full text-xs font-semibold`}>1</span>
                    </button>
                    <button
                      className={`${activeTab === 'products' ? 'bg-teal-600 text-white' : 'bg-white text-[#64748b] hover:bg-red-50'} flex items-center gap-2 px-4 py-2 rounded-lg transition-all ring-1 ring-inset ring-[#e2e8f0]`}
                      onClick={() => setActiveTab('products')}
                    >
                      <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path opacity=".4" d="M21.04 7.19 12 12.42 2.96 7.19c.4-.74.98-1.39 1.63-1.75l5.34-2.96c1.14-.64 3-.64 4.14 0l5.34 2.96c.65.36 1.23 1.01 1.63 1.75Z" fill="currentColor"></path>
                          <path opacity=".6" d="M12 12.421v9.58c-.75 0-1.5-.16-2.07-.48l-5.34-2.96c-1.21-.67-2.2-2.35-2.2-3.73v-5.66c0-.64.22-1.34.57-1.98l9.04 5.23Z" fill="currentColor"></path>
                          <path d="M21.61 9.171v5.66c0 1.38-.99 3.06-2.2 3.73l-5.34 2.96c-.57.32-1.32.48-2.07.48v-9.58l9.04-5.23c.35.64.57 1.34.57 1.98Z" fill="currentColor"></path>
                        </svg>
                      </span>
                      Products
                      <span className={`badge ${activeTab === 'products' ? 'bg-white text-teal-600' : 'bg-gray-200 text-[#64748b]'} px-2 py-0.5 rounded-full text-xs font-semibold`}>0</span>
                    </button>
                  </div>

                  {/* Sort Button */}
                  <div className="w-full ml-auto lg:w-auto relative">
                    <button
                      onClick={() => setIsSortOpen(!isSortOpen)}
                      className="group relative inline-flex items-center justify-center whitespace-nowrap outline-none transition duration-200 ease-out focus:outline-none disabled:pointer-events-none ring-1 ring-inset gap-3 rounded-lg px-3.5 text-sm bg-white text-[#64748b] shadow-sm ring-[#cbd5e1] hover:bg-red-50 hover:text-[#0f172a] hover:shadow-none hover:ring-red-300 h-12 max-lg:w-full"
                    >
                      <span>Sort by : {sortBy}</span>
                      <svg className="flex size-5 shrink-0 items-center justify-center -mx-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" d="M19.92 8.95l-6.52 6.52c-.77.77-2.03.77-2.8 0L4.08 8.95"></path>
                      </svg>
                    </button>

                    {/* Sort Dropdown */}
                    {isSortOpen && (
                      <div className="absolute right-0 mt-2 z-50 min-w-50 overflow-hidden rounded-2xl bg-white p-2 shadow-md ring-1 ring-inset ring-[#e2e8f0] flex flex-col gap-1">
                        <div className="flex flex-col gap-1 p-2">
                          <p className="text-xs uppercase text-[#64748b]">Sort by</p>
                        </div>
                        <div role="separator" className="relative flex w-full items-center h-1 before:absolute before:left-0 before:top-1/2 before:h-px before:w-full before:-translate-y-1/2 before:bg-[#e2e8f0] py-1"></div>
                        <div className="flex flex-col gap-1">
                          {sortOptions.map((option) => (
                            <div
                              key={option}
                              className={`group/item relative cursor-pointer select-none rounded-lg p-2 text-sm text-[#0f172a] outline-none flex items-center gap-2 transition duration-200 ease-out hover:bg-[#f1f5f9] ${sortBy === option ? 'bg-[#f1f5f9]' : ''}`}
                              onClick={() => {
                                setSortBy(option);
                                setIsSortOpen(false);
                              }}
                            >
                              {option}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Events Tab Content */}
                {activeTab === 'events' && (
                  <ul className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {events.map((event) => (
                      <button
                        key={event.id}
                        className="flex flex-col-reverse gap-6 sm:flex-row lg:flex-col-reverse xl:flex-row sm:justify-between border border-[#e2e8f0] rounded-lg bg-red-50 text-[#0f172a] cursor-pointer p-4 text-left w-full hover:shadow-lg hover:border-red-200 transition-all"
                        onClick={() => openEventModal(event)}
                      >
                        <div className="flex flex-1 h-full flex-col">
                          <div className="space-y-1">
                            <p className="font-semibold text-wrap text-lg sm:text-xl text-gray-800 wrap-break-word">{event.title}</p>
                            <div className="mt-1 space-y-1 text-sm text-[#64748b] wrap-break-word">
                              <p className="text-sm sm:text-base">{event.description}</p>
                            </div>
                          </div>
                          <div className="my-4 lg:my-8 space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="block size-5 text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                  <path d="M16.75 3.56V2c0-.41-.34-.75-.75-.75s-.75.34-.75.75v1.5h-6.5V2c0-.41-.34-.75-.75-.75s-.75.34-.75.75v1.56c-2.7.25-4.01 1.86-4.21 4.25-.02.29.22.53.5.53h16.92c.29 0 .53-.25.5-.53-.2-2.39-1.51-4-4.21-4.25ZM20 9.84H4c-.55 0-1 .45-1 1V17c0 3 1.5 5 5 5h8c3.5 0 5-2 5-5v-6.16c0-.55-.45-1-1-1ZM9.21 18.21c-.1.09-.21.16-.33.21-.12.05-.25.08-.38.08s-.26-.03-.38-.08-.23-.12-.33-.21c-.18-.19-.29-.45-.29-.71 0-.26.11-.52.29-.71.1-.09.21-.16.33-.21a1 1 0 0 1 .76 0c.12.05.23.12.33.21.18.19.29.45.29.71 0 .26-.11.52-.29.71Zm.21-3.83c-.05.12-.12.23-.21.33-.1.09-.21.16-.33.21-.12.05-.25.08-.38.08s-.26-.03-.38-.08-.23-.12-.33-.21c-.09-.1-.16-.21-.21-.33A.995.995 0 0 1 7.5 14c0-.13.03-.26.08-.38s.12-.23.21-.33c.1-.09.21-.16.33-.21a1 1 0 0 1 .76 0c.12.05.23.12.33.21.09.1.16.21.21.33.05.12.08.25.08.38s-.03.26-.08.38Zm3.29.33c-.1.09-.21.16-.33.21-.12.05-.25.08-.38.08s-.26-.03-.38-.08-.23-.12-.33-.21c-.18-.19-.29-.45-.29-.71 0-.26.11-.52.29-.71.1-.09.21-.16.33-.21.24-.11.52-.11.76 0 .12.05.23.12.33.21.18.19.29.45.29.71 0 .26-.11.52-.29.71Z" fill="currentColor"></path>
                                </svg>
                              </span>
                              <p className="text-sm text-[#64748b]">{event.date}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="block size-5 text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                  <path d="M20.621 8.45c-1.05-4.62-5.08-6.7-8.62-6.7h-.01c-3.53 0-7.57 2.07-8.62 6.69-1.17 5.16 1.99 9.53 4.85 12.28a5.436 5.436 0 0 0 3.78 1.53c1.36 0 2.72-.51 3.77-1.53 2.86-2.75 6.02-7.11 4.85-12.27Zm-8.62 5.01a3.15 3.15 0 1 1 0-6.3 3.15 3.15 0 0 1 0 6.3Z" fill="currentColor"></path>
                                </svg>
                              </span>
                              <p className="text-[#64748b] font-normal truncate text-wrap text-sm">Malindi, Kenya</p>
                            </div>
                          </div>
                          <div className="mt-auto flex items-center justify-between w-full gap-2">
                            <div className="inline-flex items-center justify-center transition duration-200 ease-out font-semibold gap-1.5 px-3 py-1 text-sm bg-gray-100 text-gray-800 h-8 rounded-full">
                              <span className="text-sm font-medium">From KES&nbsp;{event.price}</span>
                            </div>
                            <div
                              className="group relative inline-flex items-center justify-center whitespace-nowrap outline-none duration-200 ease-out focus:outline-none disabled:pointer-events-none h-10 gap-3 rounded-lg text-sm focus-visible:shadow-button-primary-focus px-4 ml-auto bg-teal-600 hover:bg-teal-700 text-white shadow-md hover:shadow-lg transition-all"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEventModal(event);
                              }}
                            >
                              Buy ticket
                            </div>
                          </div>
                        </div>
                        <div className="w-full h-56 relative overflow-hidden sm:flex-[0_0_15rem] lg:flex-[0_0_1] xl:flex-[0_0_15rem] rounded-2xl">
                          <div className="aspect-square w-full h-full overflow-hidden">
                            <img alt="Event image" fetchPriority="high" width="240" height="240" decoding="async" className="h-full w-full object-cover object-center bg-neutral-300 aspect-square" src={event.image} />
                          </div>
                        </div>
                      </button>
                    ))}
                  </ul>
                )}

                {/* Products Tab Content */}
                {activeTab === 'products' && (
                  <div>
                    <div className="mt-10 py-2.5 -mb-2.5 w-full overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                      <div className="inline-flex gap-4">
                        {categories.map((category) => (
                          <div
                            key={category}
                            className={`group/tag inline-flex items-center gap-2 ring-inset ring-stroke-soft-200 hover:ring-transparent focus-within:bg-bg-weak-50 focus-within:ring-transparent rounded-20 ring-0 cursor-pointer h-10 text-center text-sm truncate px-5 transition-all duration-200 ease-out hover:px-4 ${activeCategory === category
                              ? 'bg-teal-600 rounded-3xl text-white hover:bg-teal-700'
                              : 'bg-neutral-100 text-black hover:bg-neutral-200'
                              }`}
                            onClick={() => setActiveCategory(category)}
                          >
                            {category}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-10 text-center space-y-6 mx-auto p-6 max-w-80 w-full">
                      <img alt="No items illustration" loading="lazy" width="212" height="200" decoding="async" className="block mx-auto w-50 h-50 object-center object-cover" src="/illustrations/amico.png" />
                      <h3 className="mt-6 text-base font-semibold text-[#0f172a]">Ooops! No items found.</h3>
                      <p className="mt-1 text-sm text-[#64748b]">It seems this shop is currently empty!</p>
                    </div>
                  </div>
                )}

                {/* Load More */}
                <div className="mt-10 flex justify-center items-center lg:mt-24">
                  <button disabled className="group relative items-center justify-center whitespace-nowrap outline-none transition duration-200 ease-out focus:outline-none disabled:pointer-events-none disabled:bg-gray-100 disabled:text-gray-400 disabled:ring-transparent gap-3 rounded-lg text-sm focus-visible:shadow-button-primary-focus hidden px-3.5 h-12 bg-teal-600 text-white hover:bg-teal-700">
                    {activeTab === 'events' ? 'no more events' : 'no more products'}
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Info */}
            <div className="my-16 container mx-auto px-4 md:px-6 lg:px-8">
              <div className="border-t border-[#e2e8f0] space-y-4 pt-16 lg:grid lg:grid-cols-2 lg:justify-between lg:gap-10">
                <div>
                  <h1 className="text-xl font-semibold text-[#0f172a]">SUMMER TIDES FESTIVAL</h1>
                  <div className="text-sm min-h-24 max-w-lg">
                    <p className="text-sm text-[#64748b]">Africa's #1 Beach Festival 🏝️ <br />Offical store for Summer Tides Festival</p>
                  </div>
                </div>
                <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-3 lg:mt-0">
                  <div className="md:grid md:grid-cols-1 md:gap-8">
                    <div>
                      <h3 className="text-base font-semibold text-[#0f172a]">Categories</h3>
                      <ul role="list" className="mt-4 space-y-4">
                        <li className="text-sm text-[#64748b] hover:text-teal-600 transition-colors cursor-pointer"><span>Tickets</span></li>
                      </ul>
                    </div>
                  </div>
                  <div className="md:grid md:grid-cols-1 md:gap-8">
                    <div>
                      <h3 className="text-base font-semibold text-[#0f172a]">Contact</h3>
                      <ul role="list" className="mt-4 space-y-4">
                        <li><a href="tel:+254741492515" className="text-sm text-[#64748b] hover:text-teal-600 transition-colors wrap-break-word">+254 741492515</a></li>
                        <li><a href="mailto:info@airbeatglobal.com" className="text-sm text-[#64748b] hover:text-teal-600 transition-colors wrap-break-word">info@airbeatglobal.com</a></li>
                      </ul>
                    </div>
                  </div>
                  <div className="md:grid md:grid-cols-1 md:gap-8">
                    <div>
                      <h3 className="text-base font-semibold text-[#0f172a]">Socials</h3>
                      <ul role="list" className="mt-4 space-y-4">
                        <li><a target="_blank" rel="noopener noreferrer" href="https://x.com/summertidesfest" className="text-sm text-[#64748b] hover:text-teal-600 transition-colors">X</a></li>
                        <li><a target="_blank" rel="noopener noreferrer" href="https://www.instagram.com/summertides.fest" className="text-sm text-[#64748b] hover:text-teal-600 transition-colors">Instagram</a></li>
                        <li><a target="_blank" rel="noopener noreferrer" href="https://www.youtube.com/@SUMMERTIDESFESTIVAL" className="text-sm text-[#64748b] hover:text-teal-600 transition-colors">YouTube</a></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default App;
