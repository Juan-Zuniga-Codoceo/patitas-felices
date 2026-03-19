import { getUserOrders } from "./actions";
import { Package, FileDown, CheckCircle2, Clock, Truck } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReviewModal } from "@/components/reviews/ReviewModal";

export default async function ProfileOrdersPage() {
    const response = await getUserOrders();

    if (!response.success && response.error === "No autorizado") {
        redirect("/admin/login"); // Or wherever the login is
    }

    const orders = response.orders || [];

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "PENDING":
                return { label: "Pendiente", className: "bg-orange-500 hover:bg-orange-600", icon: Clock };
            case "PAID":
                return { label: "Pagado", className: "bg-emerald-500 hover:bg-emerald-600", icon: CheckCircle2 };
            case "PROCESSING":
            case "SHIPPED":
            case "DELIVERED":
                return { label: "Enviado", className: "bg-[#5FAFE3] hover:bg-[#4b9cd0]", icon: Truck };
            case "FAILED":
                return { label: "Fallido", className: "bg-red-500 hover:bg-red-600", icon: Package };
            default:
                return { label: status, className: "bg-gray-500", icon: Package };
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 font-sans">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#263238] font-poppins tracking-tight flex items-center gap-3">
                    <Package className="w-8 h-8 text-[#5FAFE3]" />
                    Mis Pedidos
                </h1>
                <p className="text-gray-500 mt-2">Revisa el historial y descarga las boletas de tus compras en Patitas Felices.</p>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 font-poppins">Aún no tienes pedidos</h3>
                    <p className="text-gray-500 mt-2">Cuando realices una compra, aparecerá aquí.</p>
                    <Link href="/">
                        <Button className="mt-6 bg-[#5FAFE3] hover:bg-[#4b9cd0] text-white">Ir a la tienda</Button>
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#F8FAFC] text-gray-500 border-b border-gray-100 uppercase text-xs font-semibold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">ID Pedido</th>
                                    <th className="px-6 py-4">Fecha</th>
                                    <th className="px-6 py-4">Total</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.map((order) => {
                                    // Use paymentStatus if it's PENDING/FAILED, else use order.status logic simplified
                                    const effectiveStatus = order.paymentStatus === "PAID"
                                        ? (order.status === "CREATED" ? "PAID" : order.status)
                                        : order.paymentStatus;

                                    const statusConfig = getStatusConfig(effectiveStatus);
                                    const StatusIcon = statusConfig.icon;

                                    return (
                                        <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="font-mono font-medium text-gray-900">
                                                    #{order.id.slice(0, 8).toUpperCase()}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1 truncate max-w-[200px]">
                                                    {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-gray-600">
                                                {new Date(order.createdAt).toLocaleDateString("es-CL", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric"
                                                })}
                                            </td>
                                            <td className="px-6 py-5 font-bold text-[#263238]">
                                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                ${((order as any).totalPrice ?? 0).toLocaleString("es-CL")}
                                            </td>
                                            <td className="px-6 py-5">
                                                <Badge className={`${statusConfig.className} text-white border-0 shadow-sm py-1 px-3 flex items-center w-fit gap-1.5`}>
                                                    <StatusIcon className="w-3.5 h-3.5" />
                                                    {statusConfig.label}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex flex-col items-end gap-3 sm:flex-row sm:justify-end">
                                                    {order.paymentStatus === "PAID" ? (
                                                        <>
                                                            {order.status === "DELIVERED" && (
                                                                <ReviewModal itemsToRate={order.items} />
                                                            )}
                                                            <a
                                                                href={`/order/${order.id}/tracking`}
                                                                className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#5FAFE3]/50 transition shadow-sm"
                                                            >
                                                                Seguimiento
                                                            </a>
                                                            <a
                                                                href={`/api/orders/${order.id}/download`}
                                                                download={`Boleta_PatitasFelices_${order.id.slice(0, 8).toUpperCase()}.pdf`}
                                                                className="inline-flex items-center justify-center rounded-lg bg-[#5FAFE3] px-3 py-2 text-sm font-medium text-white hover:bg-[#4b9cd0] focus:outline-none focus:ring-2 focus:ring-[#5FAFE3]/50 transition shadow-sm shadow-[#5FAFE3]/20 gap-2"
                                                            >
                                                                <FileDown className="w-4 h-4" />
                                                                <span className="hidden sm:inline">Descargar Boleta</span>
                                                            </a>
                                                        </>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">No disponible</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
