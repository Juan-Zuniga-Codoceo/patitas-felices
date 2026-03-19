"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/components/CartProvider";
import { X, Tag } from "lucide-react";
import Image from "next/image";

export function ExitIntentPopup() {
    const [isVisible, setIsVisible] = useState(false);
    const { applyDiscount, discount } = useCart();

    useEffect(() => {
        // Only trigger once per session
        const hasTriggered = sessionStorage.getItem("exit_intent_triggered");
        if (hasTriggered) return;

        const handleMouseLeave = (e: MouseEvent) => {
            if (e.clientY <= 10) {
                setIsVisible(true);
                sessionStorage.setItem("exit_intent_triggered", "true");
            }
        };

        // Attach listener
        document.addEventListener("mouseleave", handleMouseLeave);
        return () => {
            document.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, []);

    const handleApplyAndClose = () => {
        applyDiscount(0.95); // 5% Discount globally
        setIsVisible(false);
    };

    // Do not show if they already applied it
    if (discount < 1) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center font-poppins px-4">
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsVisible(false)}
                    />

                    {/* Modal Content */}
                    <motion.div
                        className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setIsVisible(false)}
                            className="absolute top-4 right-4 z-20 p-2 bg-white/80 rounded-full text-gray-400 hover:text-gray-700 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Image Section */}
                        <div className="relative w-full md:w-5/12 h-48 md:h-auto bg-[#F5F8FA]">
                            <Image
                                src="/hero-pets.png"
                                alt="Mascotas felices"
                                fill
                                className="object-cover"
                            />
                        </div>

                        {/* Content Section */}
                        <div className="p-8 md:p-10 flex flex-col justify-center w-full md:w-7/12 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 bg-orange-50 text-[#FF9800] px-3 py-1.5 rounded-full text-xs font-bold w-fit mx-auto md:mx-0 mb-4">
                                <Tag className="w-3.5 h-3.5" /> Cupón Desbloqueado
                            </div>

                            <h2 className="text-2xl md:text-3xl font-extrabold text-[#263238] leading-tight mb-3">
                                ¡Espera!<br />No te vayas aún 🐾
                            </h2>

                            <p className="text-gray-600 text-sm leading-relaxed mb-6">
                                Usa el código <span className="font-bold underline text-[#5FAFE3]">SYNAPSE5</span> aquí mismo y obtén un <strong>5% de descuento directo</strong> en el total de toda tu compra hoy.
                            </p>

                            <button
                                onClick={handleApplyAndClose}
                                className="w-full bg-[#5FAFE3] hover:bg-[#4b9cd0] text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98] text-sm md:text-base flex items-center justify-center gap-2"
                            >
                                <Tag className="w-4 h-4" />
                                Aplicar y Volver
                            </button>

                            <button
                                onClick={() => setIsVisible(false)}
                                className="mt-4 text-xs font-medium text-gray-400 hover:text-gray-600 transition underline-offset-4 hover:underline"
                            >
                                No, prefiero pagar precio completo
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
