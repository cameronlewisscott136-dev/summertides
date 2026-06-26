// src/components/Footer.jsx
const Footer = () => {
    return (
        <footer>
            <div className="mx-auto w-full">
                <div className="pb-8 pt-16 bg-black">
                    <div className="container mx-auto px-4 md:px-6 lg:px-8 lg:flex lg:items-center lg:justify-between">
                        <div className="space-y-4">
                            <img alt="Company name" loading="lazy" width="135" height="24" decoding="async" className="h-6 max-w-full brightness-0 invert" src="/logos/logo.webp" />
                            <p className="flex items-center gap-2 text-sm leading-6 text-gray-200">
                                <img alt="Country flag" loading="lazy" width="20" height="20" decoding="async" className="w-5 h-5" src="https://cdn.ipregistry.co/flags/emojitwo/ke.svg" />
                                <span className="inline-block min-w-12.5">Kenya</span>
                            </p>
                            <p className="flex items-center gap-2 text-sm leading-6 text-gray-200">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path d="M20.621 8.45c-1.05-4.62-5.08-6.7-8.62-6.7h-.01c-3.53 0-7.57 2.07-8.62 6.69-1.17 5.16 1.99 9.53 4.85 12.28a5.436 5.436 0 0 0 3.78 1.53c1.36 0 2.72-.51 3.77-1.53 2.86-2.75 6.02-7.11 4.85-12.27Zm-8.62 5.01a3.15 3.15 0 1 1 0-6.3 3.15 3.15 0 0 1 0 6.3Z" fill="currentColor"></path>
                                </svg>
                                <span className="inline-block min-w-50">Parklands Road, Westlands, Nairobi, Kenya.</span>
                            </p>
                        </div>
                        <div className="space-y-4 mt-16 sm:max-w-md lg:mt-0">
                            <h3 className="text-base font-semibold text-gray-200 mb-4">Follow Hustlesasa on:</h3>
                            <div className="flex space-x-6">
                                <a target="_blank" rel="noopener noreferrer" href="https://www.facebook.com/hustlesasa" className="hover:scale-110 transition-transform">
                                    <span className="sr-only">Facebook</span>
                                    <img alt="" loading="lazy" width="24" height="24" decoding="async" className="h-6 w-auto max-w-full" src="/logos/facebook.jpg" />
                                </a>
                                <a target="_blank" rel="noopener noreferrer" href="https://x.com/Hustle_Sasa" className="hover:scale-110 transition-transform">
                                    <span className="sr-only">X</span>
                                    <img alt="" loading="lazy" width="24" height="24" decoding="async" className="h-6 w-auto max-w-full" src="/logos/x-dark.png" />
                                </a>
                                <a target="_blank" rel="noopener noreferrer" href="https://www.instagram.com/hustlesasa" className="hover:scale-110 transition-transform">
                                    <span className="sr-only">Instagram</span>
                                    <img alt="" loading="lazy" width="24" height="24" decoding="async" className="h-6 w-auto max-w-full" src="/logos/ig.jpg" />
                                </a>
                                <a target="_blank" rel="noopener noreferrer" href="https://www.youtube.com/@hustlesasa" className="hover:scale-110 transition-transform">
                                    <span className="sr-only">YouTube</span>
                                    <img alt="" loading="lazy" width="24" height="24" decoding="async" className="h-6 w-auto max-w-full" src="/logos/youtube.jpg" />
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="container mx-auto px-4 md:px-6 lg:px-8 mt-6 border-t border-gray-800/40 text-center pt-6 md:flex md:items-center md:justify-between md:text-left">
                        <p className="text-sm text-gray-300 md:mt-0">© 2026 Hustlesasa. All rights reserved.</p>
                        <div className="mt-8 columns-2 flex flex-wrap justify-center gap-x-4">
                            <div className="pb-6">
                                <a target="_blank" rel="noopener noreferrer" className="text-sm text-teal-600 underline hover:text-red-200 transition-colors" href="https://support.hustlesasa.com/docs/knowledgebase/customer-policies/privacy-for-hustlesasa-visitors/">Privacy Policy</a>
                            </div>
                            <div className="pb-6">
                                <a target="_blank" rel="noopener noreferrer" className="text-sm text-teal-600 underline hover:text-red-200 transition-colors" href="https://support.hustlesasa.com/docs/knowledgebase/customer-policies/">Terms of use</a>
                            </div>
                            <div className="pb-6">
                                <a target="_blank" rel="noopener noreferrer" href="https://support.hustlesasa.com/docs/knowledgebase/hustlesasa-policies/general-refunds-and-returns/" className="text-sm text-teal-600 underline hover:text-red-200 transition-colors">Refunds & Returns</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;