import { prisma } from "@/lib/prisma";
import { ShoppingCart } from "lucide-react";
import { OrdersTable } from "./OrdersTable";
import { ExportButton } from "./ExportButton";

export default async function OrdersPage() {
    const orders = await prisma.order.findMany({
        include: {
            items: {
                include: { provider: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    const stats = {
        total: orders.length,
        paid: orders.filter(o => o.paymentStatus === "PAID").length,
        pending: orders.filter(o => o.paymentStatus === "PENDING").length,
        totalRevenue: orders
            .filter(o => o.paymentStatus === "PAID")
            .reduce((sum, o) => sum + o.totalPrice, 0),
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-black text-[#263238]">Órdenes</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Gestión de pedidos de clientes
                    </p>
                </div>
                <ExportButton />
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: "Total Órdenes", value: stats.total, color: "#5FAFE3", emoji: "📦" },
                    { label: "Pagadas", value: stats.paid, color: "#22c55e", emoji: "✅" },
                    { label: "Pendientes", value: stats.pending, color: "#FF9800", emoji: "⏳" },
                    {
                        label: "Ingresos",
                        value: `$${stats.totalRevenue.toLocaleString("es-CL")}`,
                        color: "#8b5cf6",
                        emoji: "💳",
                    },
                ].map(stat => (
                    <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <p className="text-2xl mb-1">{stat.emoji}</p>
                        <p className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</p>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Orders Table */}
            {orders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                    <div
                        className="w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                        style={{ backgroundColor: "#5FAFE3" }}
                    >
                        <ShoppingCart className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-xl font-black text-[#263238] mb-2">Sin órdenes aún</h2>
                    <p className="text-gray-400 text-sm max-w-sm mx-auto">
                        Las órdenes aparecerán aquí cuando los clientes completen su checkout.
                    </p>
                </div>
            ) : (
                <OrdersTable orders={orders} />
            )}
        </div>
    );
}
