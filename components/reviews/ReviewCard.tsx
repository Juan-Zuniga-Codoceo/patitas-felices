import { Star, CheckCircle2, User, HeartHandshake } from "lucide-react";

interface ReviewCardProps {
    review: {
        id: string;
        rating: number;
        comment: string;
        adminReply?: string | null;
        repliedAt?: Date | null;
        isVerifiedPurchase: boolean;
        createdAt: Date;
        user: {
            name: string | null;
        };
    };
}

export function ReviewCard({ review }: ReviewCardProps) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4 font-poppins">
            <div className="flex justify-between items-start gap-4">
                <div>
                    <div className="flex items-center gap-2 font-semibold text-gray-900">
                        <User className="w-5 h-5 text-gray-400" />
                        {review.user.name || "Cliente Patitas Felices"}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                    key={s}
                                    className={`w-4 h-4 ${s <= review.rating ? "fill-[#FF9800] text-[#FF9800]" : "fill-gray-200 text-gray-200"}`}
                                />
                            ))}
                        </div>
                        <span className="text-xs text-gray-400">
                            {review.createdAt.toLocaleDateString("es-CL", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                    </div>
                </div>
                {review.isVerifiedPurchase && (
                    <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-bold border border-green-200 whitespace-nowrap">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Compra Verificada
                    </div>
                )}
            </div>

            <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                {review.comment}
            </p>

            {/* Respuesta del Administrador */}
            {review.adminReply && (
                <div className="mt-2 bg-[#F0F9FF] border-l-4 border-[#5FAFE3] p-4 rounded-r-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <HeartHandshake className="w-5 h-5 text-[#5FAFE3]" />
                        <span className="font-bold text-sm text-[#1e293b]">Respuesta de Patitas Felices</span>
                        {review.repliedAt && (
                            <span className="text-xs text-gray-400 ml-auto">
                                {review.repliedAt.toLocaleDateString("es-CL")}
                            </span>
                        )}
                    </div>
                    <p className="text-gray-600 text-sm whitespace-pre-wrap">
                        {review.adminReply}
                    </p>
                </div>
            )}
        </div>
    );
}
