"use client";

import { useState, useMemo } from "react";
import { OrderDetailSheet } from "./OrderDetailSheet";
import { Filter, Search, Eye } from "lucide-react";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { isWithinInterval, startOfDay, endOfDay } from "date-fns";

type OrderItem = {
    id: string;
    productName: string;
    quantity: number;
    priceAtPurchase: number;
    selectedColor?: string | null;
    trackingCode?: string | null;
    provider: { name: string };
};

type Order = {
    id: string;
    customerName: string;
    customerEmail: string;
    customerRUT: string;
    customerPhone: string;
    customerAddress: string;
    comuna: string;
    shippingCost: number;
    totalPrice: number;
    paymentStatus: string;
    status: string;
    createdAt: Date;
    items: OrderItem[];
};

const PAYMENT_COLORS: Record<string, string> = {
    PAID: "bg-green-100 text-green-700",
    FAILED: "bg-red-100 text-red-700",
    PENDING: "bg-yellow-100 text-yellow-700",
};

const PAYMENT_LABELS: Record<string, string> = {
    PAID: "Pagado",
    FAILED: "Fallido",
    PENDING: "Pendiente",
};

const STATUS_COLORS: Record<string, string> = {
    CREATED: "bg-gray-100 text-gray-600",
    PROCESSING: "bg-blue-100 text-blue-600",
    SHIPPED: "bg-purple-100 text-purple-600",
    DELIVERED: "bg-green-100 text-green-700",
};

const STATUS_LABELS: Record<string, string> = {
    CREATED: "⏳ Creado",
    PROCESSING: "🔄 Procesando",
    SHIPPED: "🚚 Enviado",
    DELIVERED: "✅ Entregado",
};

export function OrdersTable({ orders: initialOrders }: { orders: Order[] }) {
    const [orders, setOrders] = useState(initialOrders);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [filterPayment, setFilterPayment] = useState("ALL");
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [filterProvider, setFilterProvider] = useState("ALL");
    const [search, setSearch] = useState("");
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    const filtered = useMemo(() =>
        orders.filter(o => {
            if (filterPayment !== "ALL" && o.paymentStatus !== filterPayment) return false;
            if (filterStatus !== "ALL" && o.status !== filterStatus) return false;
            if (filterProvider !== "ALL") {
                const hasProvider = o.items.some(i => i.provider.name === filterProvider);
                if (!hasProvider) return false;
            }
            if (dateRange?.from) {
                const orderDate = new Date(o.createdAt);
                if (dateRange.to) {
                    if (!isWithinInterval(orderDate, { start: startOfDay(dateRange.from), end: endOfDay(dateRange.to) })) return false;
                } else {
                    if (orderDate < startOfDay(dateRange.from)) return false;
                }
            }
            if (search) {
                const q = search.toLowerCase();
                return (
                    o.customerName.toLowerCase().includes(q) ||
                    o.customerEmail.toLowerCase().includes(q) ||
                    o.id.toLowerCase().includes(q)
                );
            }
            return true;
        }), [orders, filterPayment, filterStatus, filterProvider, search, dateRange]);

    const handleOrderUpdate = (orderId: string, updates: Partial<Order>) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));
        if (selectedOrder?.id === orderId) {
            setSelectedOrder(prev => prev ? { ...prev, ...updates } : null);
        }
    };

    return (
        <>
            {/* Filters Bar */}
            <div className="flex flex-wrap gap-3 mb-6 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email o ID..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5FAFE3]/30 focus:border-[#5FAFE3] transition"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400 hidden sm:block" />
                    <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                    <select
                        value={filterPayment}
                        onChange={e => setFilterPayment(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5FAFE3]/30 bg-white"
                    >
                        <option value="ALL">Todos los pagos</option>
                        <option value="PENDING">Pendiente</option>
                        <option value="PAID">Pagado</option>
                        <option value="FAILED">Fallido</option>
                    </select>
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5FAFE3]/30 bg-white"
                    >
                        <option value="ALL">Todos los estados</option>
                        <option value="CREATED">Creado</option>
                        <option value="PROCESSING">Procesando</option>
                        <option value="SHIPPED">Enviado</option>
                        <option value="DELIVERED">Entregado</option>
                    </select>
                    <select
                        value={filterProvider}
                        onChange={e => setFilterProvider(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5FAFE3]/30 bg-white"
                    >
                        <option value="ALL">Todos los prov.</option>
                        <option value="Dropi">Dropi</option>
                        <option value="Local">Local</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                    <p className="text-gray-400 text-sm">No se encontraron órdenes con esos filtros.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    {["ID", "Cliente", "Comuna", "Total", "Envío", "Pago", "Estado", ""].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-black text-gray-400 uppercase tracking-wide">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map(order => (
                                    <tr
                                        key={order.id}
                                        className="hover:bg-[#5FAFE3]/5 transition-colors cursor-pointer"
                                        onClick={() => setSelectedOrder(order)}
                                    >
                                        <td className="px-4 py-3.5">
                                            <span className="font-mono text-xs text-gray-400">
                                                {order.id.slice(0, 8)}…
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <p className="font-semibold text-[#263238]">{order.customerName}</p>
                                            <p className="text-xs text-gray-400">{order.customerEmail}</p>
                                        </td>
                                        <td className="px-4 py-3.5 text-gray-500">{order.comuna}</td>
                                        <td className="px-4 py-3.5 font-bold text-[#263238]">
                                            ${order.totalPrice.toLocaleString("es-CL")}
                                        </td>
                                        <td className="px-4 py-3.5 text-gray-500">
                                            ${order.shippingCost.toLocaleString("es-CL")}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${PAYMENT_COLORS[order.paymentStatus] ?? "bg-gray-100 text-gray-500"}`}>
                                                {PAYMENT_LABELS[order.paymentStatus] ?? order.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-500"}`}>
                                                {STATUS_LABELS[order.status] ?? order.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <button
                                                onClick={e => { e.stopPropagation(); setSelectedOrder(order); }}
                                                className="p-1.5 rounded-lg hover:bg-[#5FAFE3]/10 text-[#5FAFE3] transition"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                        <p className="text-xs text-gray-400">
                            {filtered.length} de {orders.length} órdenes
                        </p>
                    </div>
                </div>
            )}

            {selectedOrder && (
                <OrderDetailSheet
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onUpdate={handleOrderUpdate}
                />
            )}
        </>
    );
}
