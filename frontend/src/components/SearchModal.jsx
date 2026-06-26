// src/components/SearchModal.jsx
const SearchModal = ({ isSearchOpen, setIsSearchOpen, searchQuery, setSearchQuery }) => {
    if (!isSearchOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col items-center overflow-y-auto bg-black/50 p-4 backdrop-blur-[10px] justify-start pt-20"
            onClick={() => setIsSearchOpen(false)}
        >
            <div
                className="px-6 m-auto relative w-full bg-white shadow-regular-md focus:outline-none flex max-h-full max-w-180 flex-col overflow-hidden rounded-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="group/cmd-input bg-white flex h-12 w-full items-center gap-2 px-5 border-b border-gray-100">
                    <svg className="text-[#94a3b8] size-5 shrink-0 transition duration-200 ease-out group-focus-within/cmd-input:text-teal-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M11 20a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM18.93 20.69c.53 1.6 1.74 1.76 2.67.36.85-1.28.29-2.33-1.25-2.33-1.14-.01-1.78.88-1.42 1.97Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                    <input
                        className="w-full bg-transparent text-sm text-[#0f172a] outline-none placeholder:text-[#94a3b8] h-11"
                        placeholder="Search for events or products"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                    />
                    <button
                        className="relative flex shrink-0 items-center justify-center outline-none transition duration-200 ease-out bg-transparent text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a] size-5 rounded-md"
                        onClick={() => setIsSearchOpen(false)}
                    >
                        <svg className="size-4.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10ZM9.17 14.83l5.66-5.66M14.83 14.83 9.17 9.17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg>
                    </button>
                </div>
                <div className="flex max-h-min min-h-0 flex-1 flex-col divide-y divide-gray-100 overflow-auto py-2">
                    <div className="relative px-2 py-3">
                        <div className="text-xs text-[#64748b] mb-2 px-3 pt-1">Events (1)</div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-3 rounded-lg bg-white cursor-pointer text-sm text-[#0f172a] transition duration-200 ease-out hover:bg-[#f1f5f9] px-3 py-2.5">
                                <svg className="size-5 shrink-0 text-[#64748b]" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M19.5 12.5A2.5 2.5 0 0 1 22 10V9c0-4-1-5-5-5H7C3 4 2 5 2 9v.5a2.5 2.5 0 0 1 0 5v.5c0 4 1 5 5 5h10c4 0 5-1 5-5a2.5 2.5 0 0 1-2.5-2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                                    <path d="M10 4v16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5 5"></path>
                                </svg>
                                SUMMERTIDES 2026
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex h-12 items-center justify-between gap-3 px-5 border-t border-gray-100">
                    <div className="flex gap-3">
                        <div className="flex items-center gap-2">
                            <div className="flex size-5 shrink-0 items-center justify-center rounded bg-[#f1f5f9] text-[#64748b] ring-1 ring-inset ring-[#e2e8f0]">
                                <svg className="size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" d="M18.07 9.57L12 3.5 5.93 9.57M12 20.5V3.67"></path>
                                </svg>
                            </div>
                            <div className="flex size-5 shrink-0 items-center justify-center rounded bg-[#f1f5f9] text-[#64748b] ring-1 ring-inset ring-[#e2e8f0]">
                                <svg className="size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" strokeWidth="1.5" d="M18.07 14.43L12 20.5l-6.07-6.07M12 3.5v16.83"></path>
                                </svg>
                            </div>
                            <span className="text-xs text-[#64748b]">Navigate</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex size-5 shrink-0 items-center justify-center rounded bg-[#f1f5f9] text-[#64748b] ring-1 ring-inset ring-[#e2e8f0]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4">
                                    <path d="M152,96V48a8,8,0,0,1,16,0V88h40a8,8,0,0,1,0,16H160A8,8,0,0,1,152,96ZM96,152H48a8,8,0,0,0,0,16H88v40a8,8,0,0,0,16,0V160A8,8,0,0,0,96,152Zm112,0H160a8,8,0,0,0-8,8v48a8,8,0,0,0,16,0V168h40a8,8,0,0,0,0-16ZM96,40a8,8,0,0,0-8,8V88H48a8,8,0,0,0,0,16H96a8,8,0,0,0,8-8V48A8,8,0,0,0,96,40Z"></path>
                                </svg>
                            </div>
                            <span className="text-xs text-[#64748b]">Select</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchModal;