"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircleReply, Loader2, CheckCircle2 } from "lucide-react";
import { replyToReview } from "@/app/actions/admin-reviews";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
    reviewId: string;
    productName: string;
    existingReply?: string | null;
}

export function ReviewReplyDialog({ reviewId, productName, existingReply }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [replyText, setReplyText] = useState(existingReply || "");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");

        if (replyText.trim().length < 5) {
            setErrorMsg("La respuesta debe tener al menos 5 caracteres.");
            return;
        }

        setIsLoading(true);
        try {
            const res = await replyToReview(reviewId, replyText);
            if (res.success) {
                setSuccess(true);
                setTimeout(() => {
                    setIsOpen(false);
                    setSuccess(false);
                }, 1500);
            } else {
                setErrorMsg(res.error || "Error al enviar la respuesta.");
            }
        } catch (error) {
            setErrorMsg("Ocurrió un error de red.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant={existingReply ? "outline" : "default"} size="sm" className={!existingReply ? "bg-[#5FAFE3] hover:bg-[#4b9cd0] text-white" : ""}>
                    <MessageCircleReply className="w-4 h-4 mr-2" />
                    {existingReply ? "Editar" : "Responder"}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md font-sans">
                <DialogHeader>
                    <DialogTitle className="text-[#263238] font-poppins">Responder Reseña</DialogTitle>
                    <DialogDescription>
                        Esta respuesta se hará pública en el producto <span className="font-semibold">{productName}</span> bajo el sello de la marca.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
                    <Textarea
                        placeholder="Escribe tu respuesta pública aquí..."
                        className="resize-none min-h-[120px]"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        disabled={isLoading || success}
                    />

                    <AnimatePresence>
                        {errorMsg && (
                            <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-sm text-red-500 font-medium bg-red-50 p-2 rounded"
                            >
                                {errorMsg}
                            </motion.p>
                        )}
                        {success && (
                            <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-sm text-emerald-600 font-medium bg-emerald-50 p-2 rounded flex items-center gap-2"
                            >
                                <CheckCircle2 className="w-4 h-4" /> ¡Respuesta publicada exitosamente!
                            </motion.p>
                        )}
                    </AnimatePresence>

                    <Button type="submit" disabled={isLoading || success} className="bg-[#FF9800] hover:bg-[#e68a00] text-white font-bold">
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        {success ? "¡Listo!" : "Publicar Respuesta"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
