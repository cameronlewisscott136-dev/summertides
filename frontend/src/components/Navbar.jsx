// src/components/Navbar.jsx
const Navbar = ({ cartCount, setIsSearchOpen, setIsCartOpen }) => {
    return (
        <header className="z-20 bg-red-50 sticky top-0 py-3 flex items-center justify-between ring-1 ring-inset ring-[#e2e8f0]">
            <div className="container mx-auto flex justify-between items-center gap-2 md:gap-4 px-4 md:px-6 lg:px-8">
                {/* Logo */}
                <nav className="flex">
                    <a className="mr-4 flex items-center gap-2 lg:mr-6 rounded overflow-hidden bg-neutral-100 size-10" href="/">
                        <img
                            alt="Store logo"
                            width="40"
                            height="40"
                            decoding="async"
                            className="object-cover items-center aspect-square"
                            src="https://firebasestorage.googleapis.com/v0/b/hustle-build.appspot.com/o/hustle%2FSummer%20Tides%20Logo_page-0001.jpg?alt=media&token=a27deaff-d558-49fb-a3c9-ff2d314fc6e1"
                        />
                    </a>
                </nav>

                {/* Search Bar */}
                <div className="w-100 max-md:hidden">
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className="group relative inline-flex items-center whitespace-nowrap transition duration-200 ease-out focus:outline-none disabled:pointer-events-none ring-1 ring-inset gap-3 rounded-lg px-3.5 text-sm shadow-sm ring-[#cbd5e1] hover:bg-[#f1f5f9] hover:text-[#0f172a] hover:shadow-none hover:ring-transparent w-full h-11 justify-start bg-white text-[#94a3b8] outline-none font-normal"
                    >
                        <svg className="flex size-5 shrink-0 items-center justify-center -mx-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M11 20a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM18.93 20.69c.53 1.6 1.74 1.76 2.67.36.85-1.28.29-2.33-1.25-2.33-1.14-.01-1.78.88-1.42 1.97Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg>
                        Search for events or products
                    </button>
                </div>

                {/* Right Icons */}
                <div className="flex items-center gap-2">
                    <div className="block md:hidden">
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="group relative inline-flex items-center justify-center whitespace-nowrap outline-none transition duration-200 ease-out focus:outline-none disabled:pointer-events-none ring-1 ring-inset h-10 gap-3 text-sm bg-[#f1f5f9] text-[#64748b] ring-transparent hover:bg-white hover:text-[#0f172a] hover:shadow-sm hover:ring-[#cbd5e1] rounded-full px-3.5 max-md:block"
                            aria-label="Search"
                        >
                            <svg className="flex size-5 shrink-0 items-center justify-center -mx-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M11 20a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM18.93 20.69c.53 1.6 1.74 1.76 2.67.36.85-1.28.29-2.33-1.25-2.33-1.14-.01-1.78.88-1.42 1.97Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                            </svg>
                        </button>
                    </div>

                    <button disabled className="group relative inline-flex items-center justify-center whitespace-nowrap outline-none transition duration-200 ease-out focus:outline-none disabled:pointer-events-none ring-1 ring-inset h-10 gap-3 text-sm bg-[#f1f5f9] text-[#64748b] ring-transparent hover:bg-white hover:text-[#0f172a] hover:shadow-sm hover:ring-[#cbd5e1] border-0 rounded-full p-0" aria-label="Country flag">
                        <img alt="Country flag" loading="lazy" width="40" height="40" decoding="async" src="https://cdn.ipregistry.co/flags/emojitwo/ke.svg" />
                    </button>

                    <button
                        onClick={() => setIsCartOpen(true)}
                        className="group inline-flex items-center justify-center whitespace-nowrap outline-none transition duration-200 ease-out focus:outline-none disabled:pointer-events-none ring-1 ring-inset h-10 gap-3 text-sm bg-[#f1f5f9] text-[#64748b] ring-transparent hover:bg-white hover:text-[#0f172a] hover:shadow-sm hover:ring-[#cbd5e1] relative rounded-full px-3.5"
                        aria-label="Cart"
                    >
                        <svg className="flex size-5 shrink-0 items-center justify-center -mx-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M16 8.75c-.41 0-.75-.34-.75-.75V4.5c0-1.08-.67-1.75-1.75-1.75h-3c-1.08 0-1.75.67-1.75 1.75V8c0 .41-.34.75-.75.75s-.75-.34-.75-.75V4.5c0-1.91 1.34-3.25 3.25-3.25h3c1.91 0 3.25 1.34 3.25 3.25V8c0 .41-.34.75-.75.75Z" fill="currentColor"></path>
                            <path d="M8 17.78a.749.749 0 1 1 0-1.5h11.76c.3 0 .53-.26.5-.56l-.68-5.69C19.34 8.09 19 6.5 15.6 6.5H8.4c-3.4 0-3.74 1.59-3.97 3.53l-.9 7.5C3.24 19.99 4 22 7.51 22h8.98c3.16 0 4.09-1.63 4.04-3.75a.49.49 0 0 0-.5-.47H8Z" fill="currentColor"></path>
                        </svg>
                        <div className="inline-flex items-center justify-center rounded-full transition duration-200 ease-out font-semibold gap-1.5 text-xs uppercase text-white min-w-4 px-1 absolute -top-1 right-0 size-4 bg-teal-600">
                            <span className="text-[0.625rem] leading-2.5 font-semibold text-white">{cartCount}</span>
                        </div>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Navbar;