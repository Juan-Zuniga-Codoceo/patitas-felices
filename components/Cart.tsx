"use client";

import { useCart } from "@/components/CartProvider";
import { useRouter } from "next/navigation";
import React from "react";
import { motion } from "framer-motion";
import { Truck, Info } from "lucide-react";

export function Cart() {
    const { items, removeFromCart, subtotal, totalPrice, discount, canUseCOD, clearCart } = useCart();
    const [isOpen, setIsOpen] = React.useState(false);
    const router = useRouter();

    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

    const handleGoToCheckout = () => {
        if (items.length === 0) return;
        setIsOpen(false);
        router.push("/checkout");
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-brand-orange text-white px-5 py-2 rounded-full font-semibold shadow-md hover:bg-orange-600 transition-colors relative"
            >
                Carrito
                {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#263238] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {cartCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-3 w-80 bg-white shadow-2xl rounded-2xl p-5 z-50 border border-gray-100">
                        <h2 className="text-xl font-bold text-brand-graphite mb-4">Tu Carrito</h2>

                        {/* Elegant Static Banner */}
                        <p className="mb-5 text-sm font-medium text-brand-graphite bg-blue-50/50 p-3 rounded-xl border border-blue-100 text-center">
                            Despachos rápidos desde Santiago a toda la V Región 🇨🇱
                        </p>

                        {items.length === 0 ? (
                            <p className="text-gray-500 text-sm">El carrito está vacío.</p>
                        ) : (
                            <div className="space-y-4">
                                {items.map(item => (
                                    <div key={item.id} className="flex justify-between items-center border-b border-gray-100 pb-3">
                                        <div>
                                            <h3 className="font-semibold text-sm text-brand-graphite">{item.name}</h3>
                                            <p className="text-xs text-gray-400">
                                                {item.provider} | Cant: {item.quantity}
                                            </p>
                                            <p className="text-sm font-bold text-brand-blue">
                                                ${(item.price * item.quantity).toLocaleString("es-CL")}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-red-400 text-xs hover:text-red-600 transition"
                                        >
                                            Quitar
                                        </button>
                                    </div>
                                ))}

                                <div className="pt-2">
                                    <p className="font-bold flex justify-between text-sm text-brand-graphite">
                                        <span>Subtotal:</span>
                                        <span>${subtotal.toLocaleString("es-CL")}</span>
                                    </p>
                                    {discount < 1 && (
                                        <p className="font-bold flex justify-between text-sm text-[#FF9800] mt-1">
                                            <span>Descuento aplicado:</span>
                                            <span>-${(subtotal - totalPrice).toLocaleString("es-CL")}</span>
                                        </p>
                                    )}
                                    <p className="font-bold flex justify-between text-xl text-brand-graphite mt-2 pt-2 border-t border-gray-100">
                                        <span>Total:</span>
                                        <span className="text-[#5FAFE3]">${totalPrice.toLocaleString("es-CL")}</span>
                                    </p>
                                </div>

                                {!canUseCOD && (
                                    <p className="text-xs text-[#FF9800] bg-orange-50 px-3 py-2 rounded-lg">
                                        ⚠️ Tiene productos de envío directo — solo pago online disponible.
                                    </p>
                                )}

                                <button
                                    onClick={handleGoToCheckout}
                                    className="w-full bg-brand-blue text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition shadow-md"
                                >
                                    Ir al Checkout →
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
