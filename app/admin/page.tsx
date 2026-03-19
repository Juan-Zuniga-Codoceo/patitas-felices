import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { getDashboardStats, getSalesLast7Days, getRecentOrders, getLowStockVariants } from "./actions/dashboard";
import { SalesChart } from "./components/SalesChart";
import { LowStockModal } from "./components/LowStockModal";
import { Badge } from "@/components/ui/badge";

// 1. Componente Asíncrono para las Tarjetas Superiores
async function DashboardStatsCards() {
    const stats = await getDashboardStats();

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-sm border-gray-100">
                <CardHeader>
                    <CardTitle className="text-gray-500 text-sm font-medium">Ventas del Mes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-extrabold text-brand-graphite">
                        ${stats.monthlySales.toLocaleString("es-CL")}
                    </div>
                    <p className={`text-xs mt-1 font-medium ${stats.salesPercentageChange >= 0 ? "text-brand-blue" : "text-red-500"}`}>
                        {stats.salesPercentageChange > 0 ? "+" : ""}{stats.salesPercentageChange.toFixed(1)}% vs mes anterior
                    </p>
                </CardContent>
            </Card>

            <Card className="shadow-sm border-gray-100">
                <CardHeader>
                    <CardTitle className="text-gray-500 text-sm font-medium">Productos Activos</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-extrabold text-brand-graphite">{stats.activeProducts}</div>
                    <Suspense fallback={<Skeleton className="h-4 w-24 mt-1" />}>
                        <LowStockTrigger />
                    </Suspense>
                </CardContent>
            </Card>

            <Card className="shadow-sm border-gray-100">
                <CardHeader>
                    <CardTitle className="text-gray-500 text-sm font-medium">Órdenes Pendientes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-extrabold text-brand-graphite">{stats.pendingOrders}</div>
                    <p className="text-xs text-gray-500 mt-1 font-medium">Requieren gestión</p>
                </CardContent>
            </Card>
        </div>
    );
}

// 2. Componente Asíncrono para el Modal de Stock Bajo
async function LowStockTrigger() {
    const lowStock = await getLowStockVariants();
    if (lowStock.length === 0) {
        return <p className="text-xs text-green-500 mt-1 font-medium">Stock saludable</p>;
    }

    return (
        <LowStockModal variants={lowStock}>
            <button className="text-xs text-brand-orange mt-1 font-medium hover:underline cursor-pointer flex items-center">
                <span className="w-2 h-2 rounded-full bg-brand-orange mr-1 animate-pulse"></span>
                {lowStock.length} variantes por reponer
            </button>
        </LowStockModal>
    );
}

// 3. Componente Asíncrono para el Gráfico Principal
async function DashboardChart() {
    const salesData = await getSalesLast7Days();
    return (
        <Card className="shadow-sm border-gray-100">
            <CardHeader>
                <CardTitle className="text-brand-graphite font-bold">Ventas Reales (Últimos 7 días)</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
                <SalesChart data={salesData} />
            </CardContent>
        </Card>
    );
}

// 4. Componente Asíncrono para las Úlitas Órdenes
async function RecentOrdersTable() {
    const orders = await getRecentOrders(5);

    return (
        <Card className="shadow-sm border-gray-100">
            <CardHeader>
                <CardTitle className="text-brand-graphite font-bold">Órdenes Recientes</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-50/50">
                            <tr>
                                <th className="px-4 py-3 rounded-tl-lg font-semibold">ID</th>
                                <th className="px-4 py-3 font-semibold">Cliente</th>
                                <th className="px-4 py-3 font-semibold">Fecha</th>
                                <th className="px-4 py-3 font-semibold">Total</th>
                                <th className="px-4 py-3 rounded-tr-lg font-semibold text-right">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-6 text-gray-500">No hay órdenes recientes.</td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-brand-graphite">
                                            #{order.id.slice(-6).toUpperCase()}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">{order.customerName}</td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {order.createdAt.toLocaleDateString("es-CL", { day: '2-digit', month: 'short' })}
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-brand-graphite">
                                            ${order.totalPrice.toLocaleString("es-CL")}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Badge variant="outline" className={
                                                order.paymentStatus === 'PAID' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    order.paymentStatus === 'FAILED' ? 'bg-red-50 text-red-700 border-red-200' :
                                                        'bg-orange-50 text-orange-700 border-orange-200'
                                            }>
                                                {order.paymentStatus === 'PAID' ? 'Pagado' : order.paymentStatus === 'FAILED' ? 'Fallido' : 'Pendiente'}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}

// 5. Contenedor Principal
export default function AdminDashboard() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-brand-graphite tracking-tight">Panel Analítico</h1>
                    <p className="text-gray-500 mt-1 font-medium">Rendimiento y logística en tiempo real</p>
                </div>
                <Link href="/admin/products/new">
                    <Button className="bg-brand-blue hover:bg-blue-600 text-white font-semibold px-6 py-5 rounded-xl shadow-md transition-all">
                        + Nuevo Producto
                    </Button>
                </Link>
            </div>

            {/* Content con Suspense Boundaries (SSR Loading) */}
            <Suspense fallback={<Skeleton className="h-[120px] w-full rounded-xl" />}>
                <DashboardStatsCards />
            </Suspense>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Suspense fallback={<Skeleton className="h-[400px] w-full rounded-xl" />}>
                    <DashboardChart />
                </Suspense>

                <Suspense fallback={<Skeleton className="h-[400px] w-full rounded-xl" />}>
                    <RecentOrdersTable />
                </Suspense>
            </div>
        </div>
    );
}
