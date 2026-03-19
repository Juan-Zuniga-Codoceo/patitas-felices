"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, Menu, X, ArrowLeft } from "lucide-react";
import { Cart } from "./Cart";
import { SearchInput } from "./SearchInput";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { motion } from "framer-motion";

function NavBarContent({ minimal = false }: { minimal?: boolean }) {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const searchParams = useSearchParams();
    const currentCategory = searchParams.get("category");

    const navLinks = [
        { name: "Ver Todo", href: "/", isActive: !currentCategory },
        { name: "Perros", href: "/?category=Dog", isActive: currentCategory === "Dog" },
        { name: "Gatos", href: "/?category=Cat", isActive: currentCategory === "Cat" },
        { name: "Ambos", href: "/?category=Both", isActive: currentCategory === "Both" },
    ];

    return (
        <div className="w-full z-50 relative">
            {/* Promo Banner */}
            <div className="bg-[#263238] text-white text-[11px] font-bold tracking-widest uppercase py-2 text-center w-full z-40 relative">
                PetShop Premium 🇨🇱 <span className="opacity-80 font-normal hidden sm:inline ml-2 border-l border-white/20 pl-2">Despachos rápidos a todo el país</span>
            </div>

            {/* Main Navbar */}
            <header className={`sticky top-0 z-50 w-full transition-all duration-300 h-14 md:h-[64px] flex items-center ${isScrolled ? "bg-white/95 backdrop-blur-md shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] border-b border-gray-100/50" : "bg-white border-b border-gray-100"}`}>
                <div className="max-w-6xl w-full mx-auto px-5 flex items-center justify-between gap-4 h-full">

                    {/* Logo */}
                    <Link href="/" className="font-extrabold tracking-tight flex items-center h-full group transition-transform hover:scale-105 active:scale-95 origin-left flex-shrink-0">
                        <Image
                            src="/user-navbar-logo.png"
                            alt="Patitas Felices Logo"
                            width={160}
                            height={40}
                            className="object-contain w-auto h-8 md:h-10 transition-all"
                            priority={true}
                        />
                    </Link>

                    {/* Centered Desktop Nav */}
                    <nav className="hidden md:flex items-center h-full gap-8 mx-auto">
                        {navLinks.map((link) => (
                            <Link key={link.name} href={link.href} className="relative py-2">
                                <motion.div
                                    className={`text-sm font-bold relative px-1 flex flex-col items-center ${link.isActive ? "text-[#5FAFE3]" : "text-gray-500"}`}
                                    whileHover={{ scale: 1.05, color: "#5FAFE3" }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                >
                                    {link.name}
                                </motion.div>
                                {link.isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute -bottom-1 left-0 right-0 h-[3px] bg-[#5FAFE3] rounded-full"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* Mobile Thumb-Friendly Carousel */}
                    <nav className="md:hidden flex items-center gap-4 flex-1 overflow-x-auto snap-x snap-mandatory px-2 no-scrollbar scroll-smooth">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`snap-center shrink-0 text-sm font-bold transition-all relative py-1 px-3 rounded-full border ${link.isActive
                                    ? "bg-blue-50/50 text-[#5FAFE3] border-[#5FAFE3]/30 shadow-sm"
                                    : "text-gray-500 border-transparent hover:bg-gray-50"
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Right Utilities */}
                    <div className="flex items-center gap-3 md:gap-5 ml-auto md:ml-0">
                        <button className="text-gray-400 hover:text-[#5FAFE3] transition-colors p-2 hidden sm:block">
                            <Search className="w-5 h-5" />
                        </button>
                        <Cart />
                    </div>
                </div>
            </header>
            {/* Ocultar barra de scroll en móviles globalmente vía clase inyectada a nav si es necesario, o css global */}
        </div>
    );
}

export function NavBar({ minimal = false }: { minimal?: boolean }) {
    return (
        <Suspense fallback={<header className="h-[73px] bg-white border-b border-gray-100" />}>
            <NavBarContent minimal={minimal} />
        </Suspense>
    );
}
