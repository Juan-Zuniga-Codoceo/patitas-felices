"use client";

import { motion } from "framer-motion";
import { ProductCard } from "@/components/ProductCard";
import { CopyPlus, Truck } from "lucide-react";
import type { Product } from "@prisma/client";

interface RelatedProductsProps {
    products: any[]; // Using any to reuse the existing ProductCard payload flexibly mapping images/variants if needed
}

export function RelatedProducts({ products }: RelatedProductsProps) {
    if (!products || products.length === 0) return null;

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
    };

    return (
        <section className="mt-20 pt-16 border-t border-gray-100 font-poppins">
            <div className="flex flex-col items-center text-center mb-10 space-y-4">
                <h2 className="text-3xl md:text-4xl font-extrabold text-[#263238] tracking-tight">
                    También te podría gustar
                </h2>
                <div className="w-24 h-1 bg-[#FF9800] rounded-full mt-2"></div>
            </div>

            {/* Grid de Productos */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 relative"
            >
                {products.map((product) => (
                    <motion.div key={product.id} variants={itemVariants} className="group relative">
                        {/* Wrapper for hover zoom effect */}
                        <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col">

                            {/* Badges / Botón '+' rápido */}
                            <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-90 group-hover:scale-100">
                                <button
                                    className="bg-[#5FAFE3] hover:bg-[#4b9cd0] text-white p-2.5 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center"
                                    title="Añadir Rápido"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        // Aquí podría ir un disparo al store de Zustand para Quick Add
                                        window.location.href = `/product/${product.id}`;
                                    }}
                                >
                                    <CopyPlus className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="block h-full">
                                {/* The internal ProductCard handles its own navigation but we add the wrapper styles */}
                                <ProductCard product={product} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
}
