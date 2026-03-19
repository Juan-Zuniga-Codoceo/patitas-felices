"use client";

import { useState, useEffect } from "react";
import { X, ShieldCheck, Truck } from "lucide-react";
import { AddToCartButton } from "@/components/AddToCartButton";
import * as Accordion from "@radix-ui/react-accordion";
import { useCart } from "@/components/CartProvider";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ShippingSimulator } from "./ShippingSimulator";

export function ProductPurchasePanel({ product }: { product: any }) {
    const [selectedVariant, setSelectedVariant] = useState<any | null>(
        product.variants?.length > 0 ? product.variants[0] : null
    );
    const [isStickyVisible, setIsStickyVisible] = useState(false);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const { items } = useCart();
    const hasItems = items.length > 0;

    const currentPrice = product.price + (selectedVariant?.priceAdjustment ?? 0);

    useEffect(() => {
        const handleScroll = () => {
            setIsStickyVisible(window.scrollY > 400);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll(); // Chequeo inicial
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (isStickyVisible) {
            document.body.classList.add("has-mobile-cart");
        } else {
            document.body.classList.remove("has-mobile-cart");
        }
        return () => document.body.classList.remove("has-mobile-cart");
    }, [isStickyVisible]);

    return (
        <div className="flex flex-col h-full">
            {/* Precio Gigante e Imponente */}
            <div className="text-5xl font-extrabold mb-4 text-gray-900 tracking-tight">
                ${currentPrice.toLocaleString("es-CL")}
            </div>

            {/* Resumen Ejecutivo */}
            <p className="text-gray-500 text-base leading-relaxed mb-8 line-clamp-3">
                {product.description || "Sin descripción detallada."}
            </p>

            {/* Selector de variante */}
            {product.variants?.length > 0 && (
                <div className="mb-8 p-6 bg-white border border-gray-100 shadow-sm rounded-3xl" id="variant-selector-wrapper">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-[#263238]">
                                Color seleccionado: <span style={{ color: "#5FAFE3" }}>{selectedVariant?.color || "Ninguno"}</span>
                            </span>
                        </div>

                        {/* Swatches de Color */}
                        <div className="flex flex-wrap gap-4">
                            {product.variants.map((v: any) => {
                                const isSelected = selectedVariant?.id === v.id;
                                const isOutOfStock = v.stock === 0;
                                const colorMap: Record<string, string> = {
                                    'rojo': '#EF4444', 'azul': '#3B82F6', 'verde': '#10B981', 'amarillo': '#F59E0B',
                                    'negro': '#111827', 'blanco': '#FFFFFF', 'gris': '#9CA3AF', 'naranja': '#F97316',
                                    'rosado': '#EC4899', 'morado': '#8B5CF6', 'cafe': '#78350F', 'celeste': '#38BDF8'
                                };
                                const hexColor = colorMap[v.color.toLowerCase()] || v.color.toLowerCase();

                                return (
                                    <button
                                        key={v.id}
                                        onClick={() => setSelectedVariant(v)}
                                        disabled={isOutOfStock}
                                        title={`${v.color} — ${v.stock} en stock ${v.priceAdjustment ? `(+$${v.priceAdjustment})` : ''}`}
                                        className={`group relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 outline-none
                                            ${isSelected ? "ring-2 ring-offset-2 ring-[#5FAFE3] scale-110 shadow-md" : ""}
                                            ${isOutOfStock ? "opacity-30 cursor-not-allowed grayscale" : "hover:scale-105 hover:shadow-sm cursor-pointer"}
                                        `}
                                    >
                                        <span
                                            className="w-full h-full rounded-full border border-gray-200/50 shadow-inner block"
                                            style={{ backgroundColor: hexColor }}
                                        />
                                        <span className="absolute -top-10 scale-0 transition-all rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-white group-hover:scale-100 font-medium tracking-wide shadow-lg whitespace-nowrap z-20">
                                            {v.color}
                                        </span>
                                        {isOutOfStock && (
                                            <span className="absolute inset-0 flex items-center justify-center">
                                                <X className="w-6 h-6 text-gray-800 drop-shadow-sm" />
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Stock Bar Indicator */}
                        {selectedVariant && (
                            <div className="mt-2 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                                        Disponibilidad
                                    </span>
                                    <span className={`text-sm font-black ${selectedVariant.stock > 5 ? "text-green-500" : selectedVariant.stock > 0 ? "text-orange-500" : "text-red-500"}`}>
                                        {selectedVariant.stock > 0 ? `${selectedVariant.stock} unidades` : "Agotado"}
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${selectedVariant.stock > 5 ? "bg-green-500" : selectedVariant.stock > 0 ? "bg-orange-500" : "bg-red-500"}`}
                                        style={{ width: `${Math.min((selectedVariant.stock / 20) * 100, 100)}%` }}
                                    ></div>
                                </div>
                                {selectedVariant.stock > 0 && selectedVariant.stock <= 5 && (
                                    <p className="text-xs text-orange-600 mt-2 font-semibold">¡Últimas unidades disponibles!</p>
                                )}
                            </div>
                        )}
                        {selectedVariant?.priceAdjustment > 0 && (
                            <div className="mt-2 animate-in fade-in slide-in-from-top-2">
                                <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-600 text-xs font-bold px-3 py-1.5 rounded-full border border-orange-100">
                                    ✨ Variante premium (+${selectedVariant.priceAdjustment.toLocaleString("es-CL")})
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <Accordion.Root type="single" collapsible className="w-full mb-8 space-y-3">
                {/* Accordion Descripción Completa */}
                <Accordion.Item value="description" className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                    <Accordion.Header className="flex justify-between items-center bg-gray-50/50 hover:bg-gray-50 transition-colors">
                        <Accordion.Trigger className="w-full flex justify-between items-center p-4 font-bold text-gray-800 text-left outline-none group">
                            Descripción Completa
                            <span className="text-gray-400 group-data-[state=open]:rotate-180 transition-transform duration-300">▼</span>
                        </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className="overflow-hidden p-4 animate-in slide-in-from-top-2 fade-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top-2 data-[state=closed]:fade-out">
                        <div className="flex flex-col">
                            <div className={`text-sm transition-all duration-500 relative ${!isDescriptionExpanded
                                ? "max-h-[250px] overflow-hidden after:absolute after:bottom-0 after:left-0 after:h-24 after:w-full after:bg-gradient-to-t after:from-white after:to-transparent"
                                : "max-h-[2000px]"
                                }`}>
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        p: ({ node, ...props }) => <p className="whitespace-pre-wrap text-slate-700 leading-relaxed mb-4 last:mb-0" {...props} />,
                                        ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-2 text-slate-700" {...props} />,
                                        ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-2 text-slate-700" {...props} />,
                                        li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                                        strong: ({ node, ...props }) => <strong className="font-bold text-gray-900" {...props} />,
                                        a: ({ node, ...props }) => <a className="text-[#5FAFE3] hover:underline" {...props} />,
                                    }}
                                >
                                    {product.description || "Sin descripción detallada."}
                                </ReactMarkdown>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsDescriptionExpanded(!isDescriptionExpanded);
                                }}
                                className="mt-2 text-[#5FAFE3] font-bold text-sm tracking-wide hover:underline self-start transition-all"
                            >
                                {isDescriptionExpanded ? "Ver menos" : "Ver descripción completa 🐾"}
                            </button>
                        </div>
                    </Accordion.Content>
                </Accordion.Item>

                {/* Accordion Detalles Técnicos */}
                <Accordion.Item value="specs" className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                    <Accordion.Header className="flex justify-between items-center bg-gray-50/50 hover:bg-gray-50 transition-colors">
                        <Accordion.Trigger className="w-full flex justify-between items-center p-4 font-bold text-gray-800 text-left outline-none group">
                            Detalles Técnicos (Medidas y Peso)
                            <span className="text-gray-400 group-data-[state=open]:rotate-180 transition-transform duration-300">▼</span>
                        </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Content className="overflow-hidden p-4 bg-white animate-in slide-in-from-top-2 fade-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top-2 data-[state=closed]:fade-out">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-xl flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Dimensiones</span>
                                <span className="text-sm font-semibold text-gray-800">{product.length} × {product.width} × {product.height} cm</span>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Peso Físico</span>
                                <span className="text-sm font-semibold text-gray-800">{product.weight} kg</span>
                            </div>
                        </div>
                    </Accordion.Content>
                </Accordion.Item>
            </Accordion.Root>
            <ShippingSimulator product={product} />

            <div className="mt-auto pt-6 border-t border-gray-100 flex flex-col gap-4">
                <AddToCartButton product={product} selectedVariant={selectedVariant} />

                {/* Badges de Confianza bajo el botón */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-2">
                    {product.allowsCOD && (
                        <div className="flex items-center justify-center text-xs font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded-full w-full sm:w-auto">
                            <ShieldCheck className="w-4 h-4 mr-1.5" /> Pago Contra Entrega (COD)
                        </div>
                    )}
                    <div className="flex items-center justify-center text-xs font-semibold text-[#5FAFE3] bg-blue-50 px-3 py-1.5 rounded-full w-full sm:w-auto">
                        <Truck className="w-4 h-4 mr-1.5" /> Despacho a todo Chile 🇨🇱
                    </div>
                </div>
            </div>

            {/* Mobile Sticky AddToCart Bar */}
            <div
                className={`fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg border-t border-gray-200 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-[60] md:hidden flex justify-between items-center transform transition-all duration-500 ease-out ${isStickyVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
                    }`}
            >
                <div className="flex flex-col mr-4">
                    <span className="text-xs text-gray-500 font-medium truncate max-w-[140px]">{selectedVariant ? `${product.name} - ${selectedVariant.color}` : product.name}</span>
                    <span className="font-extrabold text-[#5FAFE3] tracking-tight">${currentPrice.toLocaleString("es-CL")}</span>
                </div>
                <div className="flex-1 max-w-[180px] relative">
                    <AddToCartButton product={product} selectedVariant={selectedVariant} />
                    {hasItems && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3 z-10">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF9800] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF9800] border border-white"></span>
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
