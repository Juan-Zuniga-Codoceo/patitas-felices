"use client";

import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

export function FloatingWhatsApp() {
    const [isVisible, setIsVisible] = useState(false);

    // Delay visibility slightly so it pops up after main content load
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500 transition-all [.has-mobile-cart_&]:-translate-y-[84px]">
            {/* Tooltip (hidden on small screens) */}
            <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 hidden md:block">
                <div className="bg-white text-gray-800 text-xs font-bold py-2 px-3 rounded-xl shadow-lg whitespace-nowrap border border-gray-100 relative">
                    ¿Necesitas ayuda? Escríbenos 👋
                    <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white border-r border-t border-gray-100 rotate-45" />
                </div>
            </div>

            <a
                href="https://wa.me/56912345678?text=Hola!%20Necesito%20ayuda%20con%20Patitas%20Felices%20🐾"
                target="_blank"
                rel="noopener noreferrer"
                className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-110 active:scale-95 transition-all outline-none focus:ring-4 focus:ring-[#25D366]/30 group"
                style={{ backgroundColor: "#25D366" }}
                aria-label="Contactar por WhatsApp"
            >
                <div className="relative">
                    {/* Ping animation behind the icon */}
                    <div className="absolute inset-0 bg-white/30 rounded-full animate-ping group-hover:hidden" />
                    <MessageCircle className="w-7 h-7 relative z-10" />
                </div>

                {/* Notification dot */}
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center">
                    <span className="text-[9px] font-black leading-none">1</span>
                </span>
            </a>
        </div>
    );
}
