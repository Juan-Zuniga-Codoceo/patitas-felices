import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MessageSquare, Star, User, Calendar, CheckCircle2 } from "lucide-react";
import { ReviewReplyDialog } from "./ReviewReplyDialog";
import { Badge } from "@/components/ui/badge";

export default async function AdminReviewsPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        redirect("/admin/login");
    }

    const adminUser = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (!adminUser || adminUser.role !== "ADMIN") {
        redirect("/");
    }

    const reviews = await prisma.review.findMany({
        include: {
            product: { select: { name: true } },
            user: { select: { name: true, email: true } }
        },
        orderBy: { createdAt: "desc" }
    });

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
        : "0";

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 font-sans">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#263238] font-poppins flex items-center gap-2">
                        <MessageSquare className="w-8 h-8 text-[#5FAFE3]" />
                        Moderación de Reseñas
                    </h1>
                    <p className="text-gray-500 mt-2">Gestiona el feedback de los clientes y responde en nombre de Patitas Felices.</p>
                </div>
                <div className="bg-white px-6 py-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">Promedio Global</span>
                        <div className="flex items-center gap-2 mt-1">
                            <Star className="w-5 h-5 fill-[#FF9800] text-[#FF9800]" />
                            <span className="text-2xl font-bold text-gray-900 leading-none">{averageRating}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left align-top">
                        <thead className="bg-[#F8FAFC] text-gray-500 border-b border-gray-100 uppercase text-xs font-semibold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Cliente / Fecha</th>
                                <th className="px-6 py-4">Producto</th>
                                <th className="px-6 py-4">Reseña</th>
                                <th className="px-6 py-4">Agente</th>
                                <th className="px-6 py-4 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {reviews.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                        Aún no hay reseñas registradas.
                                    </td>
                                </tr>
                            )}
                            {reviews.map((r) => (
                                <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <div className="flex items-center gap-2 font-medium text-gray-900">
                                            <User className="w-4 h-4 text-gray-400" />
                                            {r.user.name || r.user.email}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {r.createdAt.toLocaleDateString("es-CL")}
                                        </div>
                                        {r.isVerifiedPurchase && (
                                            <Badge variant="outline" className="mt-2 text-[10px] bg-green-50 text-green-700 border-green-200">
                                                <CheckCircle2 className="w-3 h-3 mr-1" /> Compra Verificada
                                            </Badge>
                                        )}
                                    </td>
                                    <td className="px-6 py-5 font-medium text-[#263238] max-w-[200px] truncate">
                                        {r.product.name}
                                    </td>
                                    <td className="px-6 py-5 min-w-[300px] max-w-sm">
                                        <div className="flex items-center gap-1 mb-2">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? "fill-[#FF9800] text-[#FF9800]" : "fill-gray-200 text-gray-200"}`} />
                                            ))}
                                        </div>
                                        <p className="text-gray-600 line-clamp-3 leading-relaxed">"{r.comment}"</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        {r.adminReply ? (
                                            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#5FAFE3] bg-blue-50 px-2.5 py-1 rounded-full w-fit">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Respondido
                                            </span>
                                        ) : (
                                            <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-400 animate-pulse ml-4" title="Pendiente de respuesta" />
                                        )}
                                    </td>
                                    <td className="px-6 py-5 text-right align-middle">
                                        <ReviewReplyDialog
                                            reviewId={r.id}
                                            productName={r.product.name}
                                            existingReply={r.adminReply}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
