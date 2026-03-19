"use client";

import { useState } from "react";
import { ReviewForm } from "./ReviewForm";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, MessageSquarePlus } from "lucide-react";
import { createProductReview } from "@/app/actions/reviews";
import { AnimatePresence, motion } from "framer-motion";

interface ReviewModalProps {
    itemsToRate: {
        productId: string;
        productName: string;
    }[];
}

export function ReviewModal({ itemsToRate }: ReviewModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeProductId, setActiveProductId] = useState<string | null>(null);
    const [ratedProducts, setRatedProducts] = useState<Record<string, boolean>>({});

    const handleSuccess = (pId: string) => {
        setRatedProducts((prev) => ({ ...prev, [pId]: true }));
        setActiveProductId(null);
    };

    const ratingItems = itemsToRate.filter(
        (v, i, a) => a.findIndex(t => (t.productId === v.productId)) === i
    );

    const isAllRated = ratingItems.every(i => ratedProducts[i.productId]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-[#FF9800] text-[#FF9800] hover:bg-[#FF9800] hover:text-white shadow-sm transition">
                    <MessageSquarePlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Calificar Productos</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md font-sans">
                <DialogHeader>
                    <DialogTitle className="font-poppins text-xl text-[#263238]">Cuéntanos tu experiencia</DialogTitle>
                    <DialogDescription>
                        Califica los productos de tu pedido y ayuda a otros dueños de mascotas a decidir mejor.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 mt-4">
                    {/* Lista de selección si no hay uno activo */}
                    <AnimatePresence mode="wait">
                        {!activeProductId && !isAllRated && (
                            <motion.div
                                key="list"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex flex-col gap-3"
                            >
                                <p className="text-sm font-semibold text-gray-700">Selecciona el producto a calificar:</p>
                                {ratingItems.map((item) => (
                                    <button
                                        key={item.productId}
                                        onClick={() => setActiveProductId(item.productId)}
                                        disabled={ratedProducts[item.productId]}
                                        className={`flex items-center justify-between p-4 rounded-xl border text-left transition ${ratedProducts[item.productId]
                                                ? 'bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed'
                                                : 'bg-white border-gray-200 hover:border-[#5FAFE3] hover:shadow-md'
                                            }`}
                                    >
                                        <span className="text-sm font-medium text-gray-800 line-clamp-1 pr-4">{item.productName}</span>
                                        {ratedProducts[item.productId] ? (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                        ) : (
                                            <span className="text-xs font-bold text-[#5FAFE3] shrink-0">CALIFICAR</span>
                                        )}
                                    </button>
                                ))}
                            </motion.div>
                        )}

                        {/* Formulario Activo */}
                        {activeProductId && (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <div className="mb-4 flex items-center justify-between bg-blue-50 px-4 py-3 rounded-lg">
                                    <span className="text-sm font-medium text-blue-900 truncate">
                                        {ratingItems.find(i => i.productId === activeProductId)?.productName}
                                    </span>
                                    <button onClick={() => setActiveProductId(null)} className="text-xs font-bold text-blue-500 uppercase tracking-wide hover:underline shrink-0 ml-2">Volver</button>
                                </div>
                                <ReviewForm
                                    productId={activeProductId}
                                    onSubmitAction={createProductReview}
                                    onSuccess={() => handleSuccess(activeProductId)}
                                />
                            </motion.div>
                        )}

                        {/* Estado: Todo calificado */}
                        {isAllRated && (
                            <motion.div
                                key="done"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center p-8 text-center"
                            >
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                </div>
                                <h4 className="text-lg font-bold text-gray-900 font-poppins">¡Gracias por tu aporte!</h4>
                                <p className="text-sm text-gray-500 mt-2">Tus reseñas ayudarán mucho a otros a elegir lo mejor para sus mascotas.</p>
                                <Button className="mt-6 w-full" variant="outline" onClick={() => setIsOpen(false)}>Cerrar ventana</Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
}
