"use client";

import { useCart, Product } from "./CartProvider";
import { Eye, ExternalLink } from "lucide-react";
import Link from "next/link";

export function ProductCard({ product }: { product: any }) {
    const { addToCart } = useCart();
    const imageToDisplay = product.image || product.imageUrl;

    return (
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 ease-out flex flex-col overflow-hidden border border-gray-100/50 group h-full relative">

            {/* Image Container with Zoom & Overlay */}
            <div className="block h-56 w-full bg-[#f8f9fa] overflow-hidden relative cursor-pointer">
                {imageToDisplay ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={imageToDisplay}
                        alt={product.name}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                    />
                ) : (
                    <div className="flex items-center justify-center w-full h-full text-5xl text-gray-300">🐾</div>
                )}
                <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                    {/* Fake "Nuevo" badge for demo purposes if recently created, else show provider */}
                    {(product.createdAt && new Date().getTime() - new Date(product.createdAt).getTime() < 86400000 * 7) ? (
                        <span className="bg-[#FF9800] text-white text-[10px] uppercase tracking-widest font-black px-3 py-1.5 rounded-full shadow-md">
                            NUEVO
                        </span>
                    ) : null}

                    {product.providerType === 'Dropi' && (
                        <span className="bg-white/90 backdrop-blur-md text-[#5FAFE3] text-[10px] uppercase tracking-widest font-black px-3 py-1.5 rounded-full shadow-sm border border-[#5FAFE3]/20">
                            Dropi Exclusive
                        </span>
                    )}
                    {(product.providerType === 'External' || product.provider === 'External') && (
                        <span className="bg-[#263238]/90 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-black px-3 py-1.5 rounded-full shadow-sm border border-white/10">
                            Externo
                        </span>
                    )}
                </div>

                {/* Quick View Overlay (Desktop only hover effect) */}
                <div className="absolute inset-x-0 bottom-[-100%] group-hover:bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 flex justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 z-10 hidden sm:flex">
                    <span className="bg-white/90 backdrop-blur text-[#263238] font-bold text-xs uppercase tracking-wide px-4 py-2 rounded-full flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75 shadow-lg">
                        <Eye className="w-4 h-4" /> Vista Rápida
                    </span>
                </div>
            </div>

            <div className="p-5 flex flex-col flex-grow bg-white z-20 relative">
                <div className="cursor-pointer mb-1">
                    <h4 className="font-bold text-base md:text-lg text-[#263238] leading-tight mb-1 transition-colors line-clamp-2">{product.name}</h4>
                    {/* Fake rating for premium aesthetic */}
                    <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-3.5 h-3.5 ${i < 4 ? "text-[#FF9800]" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        ))}
                        <span className="text-[10px] text-gray-400 font-medium ml-1">(+$1k vendidos)</span>
                    </div>
                </div>

                <div className="mt-auto flex items-end justify-between pt-4 border-t border-gray-50/50">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-400 font-medium line-through mb-0.5">
                            ${Math.round(product.price * 1.2).toLocaleString("es-CL")}
                        </span>
                        <span className="text-2xl font-black text-[#5FAFE3] tracking-tight">
                            ${product.price.toLocaleString("es-CL")}
                        </span>
                    </div>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            addToCart({
                                id: product.id,
                                name: product.name,
                                price: product.price,
                                imageUrl: imageToDisplay,
                                allowsCOD: product.allowsCOD,
                                provider: product.providerType || product.provider || 'Dropi',
                                category: product.category as any,
                            });
                        }}
                        className="w-11 h-11 rounded-xl bg-[#263238] text-white flex items-center justify-center hover:bg-[#FF9800] hover:-translate-y-1 transition-all duration-300 shadow-md focus:outline-none focus:ring-4 focus:ring-[#FF9800]/30 z-20 group/btn"
                        title="Agregar al carrito"
                        aria-label="Agregar al carrito"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover/btn:scale-110 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
