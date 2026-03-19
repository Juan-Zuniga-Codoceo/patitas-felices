"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ReviewFormProps {
    productId: string;
    onSuccess: () => void;
    onSubmitAction: (productId: string, rating: number, comment: string) => Promise<{ success: boolean; error?: string }>;
}

export function ReviewForm({ productId, onSuccess, onSubmitAction }: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");

        if (rating < 1) {
            setErrorMsg("Por favor, selecciona al menos 1 estrella.");
            return;
        }

        if (comment.trim().length < 5) {
            setErrorMsg("Por favor, escribe un comentario un poco más detallado.");
            return;
        }

        setIsLoading(true);
        try {
            const res = await onSubmitAction(productId, rating, comment);
            if (res.success) {
                onSuccess();
            } else {
                setErrorMsg(res.error || "Error al enviar la reseña.");
            }
        } catch (err) {
            setErrorMsg("Ocurrió un error inesperado.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 font-poppins">
            {/* Sistema de Calificación Estrellas */}
            <div className="flex flex-col items-center gap-2">
                <span className="text-sm font-medium text-gray-500 uppercase tracking-widest">Calificación</span>
                <div className="flex gap-1" onMouseLeave={() => setHover(rating)}>
                    {[1, 2, 3, 4, 5].map((star) => {
                        const active = star <= (hover || rating);
                        return (
                            <motion.button
                                type="button"
                                key={star}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHover(star)}
                                whileHover={{ scale: 1.25 }}
                                whileTap={{ scale: 0.9 }}
                                className="focus:outline-none p-1"
                            >
                                <Star
                                    className={`w-8 h-8 transition-colors ${active ? "fill-[#FF9800] text-[#FF9800]" : "text-gray-300"
                                        }`}
                                />
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Comentario */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Tu Comentario</label>
                <Textarea
                    placeholder="¿Qué te pareció el producto? ¿Le gustó a tu mascota?"
                    className="resize-none min-h-[120px] focus-visible:ring-[#FF9800]"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    disabled={isLoading}
                />
            </div>

            {/* Alertas */}
            <AnimatePresence>
                {errorMsg && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg font-medium"
                    >
                        {errorMsg}
                    </motion.div>
                )}
            </AnimatePresence>

            <Button
                type="submit"
                disabled={isLoading}
                className="bg-[#FF9800] hover:bg-[#e68a00] text-white w-full py-6 font-bold text-base shadow-md shadow-orange-500/20"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Enviando...
                    </>
                ) : (
                    "Enviar Reseña"
                )}
            </Button>
        </form>
    );
}
