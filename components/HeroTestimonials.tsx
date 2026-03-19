"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";

interface Testimonial {
    id: string;
    rating: number;
    comment: string;
    userName: string;
}

interface HeroTestimonialsProps {
    testimonials: Testimonial[];
    seoStats?: {
        averageRating: number;
        reviewCount: number;
    } | null;
}

export function HeroTestimonials({ testimonials, seoStats }: HeroTestimonialsProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!testimonials || testimonials.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [testimonials]);

    return (
        <div className="mt-8 flex flex-col items-center md:items-start text-white/90">
            {seoStats && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Store",
                            name: "Patitas Felices",
                            image: "https://patitasfelices.cl/Patitas-sinfondo.png",
                            telephone: "+56912345678",
                            priceRange: "$$",
                            address: {
                                "@type": "PostalAddress",
                                addressLocality: "Valparaíso",
                                addressRegion: "V Región",
                                addressCountry: "CL"
                            },
                            aggregateRating: {
                                "@type": "AggregateRating",
                                ratingValue: seoStats.averageRating,
                                reviewCount: seoStats.reviewCount
                            }
                        })
                    }}
                />
            )}

            {testimonials.length > 0 && (
                <div className="h-[60px] flex items-center justify-center md:justify-start overflow-hidden w-full max-w-lg">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2.5 shadow-sm w-full"
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <div className="flex gap-0.5">
                                    {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                                        <Star key={i} className="w-3.5 h-3.5 fill-[#FF9800] text-[#FF9800]" />
                                    ))}
                                </div>
                                <span className="text-xs font-bold text-white uppercase tracking-wider opacity-80">
                                    {testimonials[currentIndex].userName}
                                </span>
                            </div>
                            <p className="text-sm font-medium italic text-blue-50 line-clamp-1">
                                "{testimonials[currentIndex].comment}"
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
