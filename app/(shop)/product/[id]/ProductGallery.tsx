"use client";

import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type Variant = {
    id: string;
    color: string;
    stock: number;
    priceAdjustment: number;
};

type Props = {
    images: string[];
    name: string;
};

export default function ProductGallery({ images, name }: Props) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: images.length > 1 });

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        emblaApi.on("select", () => setSelectedIndex(emblaApi.selectedScrollSnap()));
    }, [emblaApi]);

    const scrollTo = useCallback((i: number) => {
        emblaApi?.scrollTo(i);
    }, [emblaApi]);

    // Solo carrusel cuando hay imágenes
    if (images.length === 0) return null;

    return (
        <div className="flex flex-col h-full w-full">
            {/* Carrusel principal */}
            {images.length > 0 && (
                <div className="relative overflow-hidden bg-white flex-1 min-h-[420px] rounded-3xl group">
                    <div ref={emblaRef} className="overflow-hidden h-full">
                        <div className="flex h-full">
                            {images.map((src, i) => (
                                <div key={i} className="flex-none w-full h-full flex items-center justify-center p-8 bg-gray-50/50">
                                    <img
                                        src={src}
                                        alt={`${name} ${i + 1}`}
                                        className="w-full h-full max-h-[480px] object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-[1.08] mix-blend-multiply"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Controles */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={scrollPrev}
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-md flex items-center justify-center hover:bg-white hover:scale-110 transition-all z-10 text-gray-700"
                                aria-label="Anterior"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={scrollNext}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-md flex items-center justify-center hover:bg-white hover:scale-110 transition-all z-10 text-gray-700"
                                aria-label="Siguiente"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Indicadores / thumbnails extraídos abajo */}
            {images.length > 1 && (
                <div className="mt-4 flex justify-center gap-3 px-2 overflow-x-auto pb-2">
                    {images.map((src, i) => (
                        <button
                            key={i}
                            onClick={() => scrollTo(i)}
                            className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-white
                                ${selectedIndex === i ? "border-[#5FAFE3] shadow-md scale-105" : "border-gray-100 opacity-60 hover:opacity-100 hover:border-gray-300"}`}
                            aria-label={`Ver imagen ${i + 1}`}
                        >
                            <img src={src} alt={`thumb-${i}`} className="w-full h-full object-contain p-1 mix-blend-multiply" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
