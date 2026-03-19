"use client";

import { useState } from "react";
import { NavBar } from "@/components/NavBar";
import { ProductCard } from "@/components/ProductCard";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export function ClientHome({ products }: { products: any[] }) {
    const [activeTab, setActiveTab] = useState<"All" | "Dog" | "Cat" | "Both">("All");

    const tabs = [
        { id: "All", label: "Todo" },
        { id: "Dog", label: "Perros 🐶" },
        { id: "Cat", label: "Gatos 🐱" },
        { id: "Both", label: "Para Ambos ✨" }
    ] as const;

    const filteredProducts = products.filter((p) => {
        if (activeTab === "All") return true;
        if (activeTab === "Dog") return p.category === "Dog" || p.category === "Both";
        if (activeTab === "Cat") return p.category === "Cat" || p.category === "Both";
        if (activeTab === "Both") return p.category === "Both";
        return true;
    });

    const isFiltered = activeTab !== "All";

    return (
        <div className="min-h-screen bg-[#fafafa] pb-24">
            <NavBar />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-[#5FAFE3] to-blue-500 text-white relative overflow-hidden">
                <div className="absolute w-[400px] h-[400px] bg-white opacity-5 rounded-full blur-3xl -top-20 -left-20 pointer-events-none"></div>
                <div className="absolute w-[300px] h-[300px] bg-[#FF9800] opacity-10 rounded-full blur-3xl bottom-10 -right-10 pointer-events-none"></div>

                <div className="max-w-4xl mx-auto px-5 py-24 text-center relative z-10">
                    <span className="inline-block py-1 px-3 rounded-full bg-white/20 text-blue-50 text-xs font-black tracking-widest uppercase mb-6 shadow-sm backdrop-blur-sm border border-white/20">
                        PetShop Premium 🇨🇱
                    </span>
                    <h2 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight drop-shadow-sm">
                        Lo mejor para tu <br />
                        <span className="text-[#FF9800]">mejor amigo</span>
                    </h2>
                    <p className="text-lg md:text-xl text-blue-50 max-w-2xl mx-auto font-medium">
                        Descubre nuestra selección exclusiva. Comodidad, nutrición y diversión a un clic de distancia con envíos rápidos a todo Chile.
                    </p>
                </div>
            </section>

            {/* Category Tabs */}
            <div className="sticky top-[73px] z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 py-4 shadow-sm">
                <div className="max-w-6xl mx-auto px-5 flex items-center justify-center gap-2 sm:gap-6 overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative px-4 py-2 text-sm font-bold uppercase tracking-wide transition-colors whitespace-nowrap ${activeTab === tab.id ? "text-[#5FAFE3]" : "text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute left-0 right-0 -bottom-[17px] h-1 bg-[#5FAFE3] rounded-t-full"
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-5 mt-12 min-h-[500px]">
                {!isFiltered ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-20">
                        {/* Static Sections when "All" */}
                        {["Dog", "Cat"].map(catType => {
                            const items = products.filter(p => p.category === catType || p.category === "Both");
                            if (items.length === 0) return null;
                            return (
                                <section key={catType} id={catType.toLowerCase()} className="scroll-mt-32">
                                    <div className="flex items-center mb-8">
                                        <h3 className="text-3xl font-extrabold text-[#263238]">Para {catType === "Dog" ? "Perros 🐶" : "Gatos 🐱"}</h3>
                                        <div className="flex-1 h-px bg-gray-200 ml-6"></div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {items.map(item => (
                                            <Link key={item.id} href={`/product/${item.id}`} className="block h-full">
                                                <ProductCard product={item as any} />
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )
                        })}

                        {/* Promo Banner "Ambos" inside All */}
                        {products.filter(p => p.category === "Both").length > 0 && (
                            <section id="ambos" className="scroll-mt-32">
                                <div className="bg-[#263238] rounded-3xl overflow-hidden relative shadow-lg mb-12">
                                    <div className="absolute inset-0 bg-black/20 z-10"></div>
                                    {/* Decorative shapes */}
                                    <div className="absolute w-[300px] h-[300px] bg-[#5FAFE3] opacity-20 rounded-full blur-3xl -top-20 -left-20 pointer-events-none z-0"></div>
                                    <div className="absolute w-[200px] h-[200px] bg-[#FF9800] opacity-20 rounded-full blur-3xl bottom-0 right-0 pointer-events-none z-0"></div>

                                    <div className="relative z-20 py-16 px-8 md:px-16 flex flex-col items-center text-center">
                                        <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 text-xs font-black tracking-widest uppercase mb-6">
                                            ✨ Colección Universal
                                        </span>
                                        <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Para Perros y Gatos</h3>
                                        <p className="text-xl text-gray-300 max-w-2xl font-medium">Bebederos, camas, juguetes, accesorios y mucho más. Diseñados para compartir el confort.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {products.filter(p => p.category === "Both").map(item => (
                                        <Link key={item.id} href={`/product/${item.id}`} className="block h-full">
                                            <ProductCard product={item as any} />
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}
                    </motion.div>
                ) : (
                    /* Filtered Grid Animation */
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {filteredProducts.map(item => (
                            <Link key={item.id} href={`/product/${item.id}`} className="block h-full">
                                <ProductCard product={item as any} />
                            </Link>
                        ))}
                        {filteredProducts.length === 0 && (
                            <div className="col-span-full py-20 text-center text-gray-400">
                                <span className="text-4xl mb-4 block">🐾</span>
                                <h3 className="text-xl font-bold">No hay productos en esta categoría.</h3>
                            </div>
                        )}
                    </motion.div>
                )}
            </main>
        </div>
    );
}
