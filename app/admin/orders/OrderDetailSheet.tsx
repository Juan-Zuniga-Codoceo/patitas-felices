"use client";

import { useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    X, Package, User, MapPin, Phone, Mail, CreditCard,
    Truck, ExternalLink, Check, Loader2, ChevronDown
} from "lucide-react";
import { OrderPrintLabel, PrintButton } from "./OrderPrintLabel";

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

const STATUS_OPTIONS = ["CREATED", "PROCESSING", "SHIPPED", "DELIVERED"] as const;
const STATUS_LABELS: Record<string, string> = {
    CREATED: "Creado",
    PROCESSING: "Procesando",
    SHIPPED: "Enviado",
    DELIVERED: "Entregado",
};

export function OrderDetailSheet({
    order: initialOrder,
    onClose,
    onUpdate,
}: {
    order: Order;
    onClose: () => void;
    onUpdate: (orderId: string, updates: Partial<Order>) => void;
}) {
    const [order, setOrder] = useState(initialOrder);
    const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>(
        Object.fromEntries(order.items.map(i => [i.id, i.trackingCode ?? ""]))
    );
    const [savingTracking, setSavingTracking] = useState<Record<string, boolean>>({});
    const [savedTracking, setSavedTracking] = useState<Record<string, boolean>>({});
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const paymentColor =
        order.paymentStatus === "PAID" ? "bg-green-100 text-green-700" :
            order.paymentStatus === "FAILED" ? "bg-red-100 text-red-700" :
                "bg-yellow-100 text-yellow-700";

    const paymentLabel =
        order.paymentStatus === "PAID" ? "Pagado" :
            order.paymentStatus === "FAILED" ? "Fallido" : "Pendiente";

    const handleSaveTracking = async (itemId: string) => {
        setSavingTracking(p => ({ ...p, [itemId]: true }));
        try {
            const res = await fetch(`/api/orders/${order.id}/tracking`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ itemId, trackingCode: trackingInputs[itemId] }),
            });
            if (res.ok) {
                setOrder(prev => ({
                    ...prev,
                    items: prev.items.map(i =>
                        i.id === itemId ? { ...i, trackingCode: trackingInputs[itemId] } : i
                    ),
                }));
                setSavedTracking(p => ({ ...p, [itemId]: true }));
                setTimeout(() => setSavedTracking(p => ({ ...p, [itemId]: false })), 2000);
            }
        } finally {
            setSavingTracking(p => ({ ...p, [itemId]: false }));
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        setUpdatingStatus(true);
        try {
            const res = await fetch(`/api/orders/${order.id}/tracking`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                setOrder(prev => ({ ...prev, status: newStatus }));
                onUpdate(order.id, { status: newStatus });
            }
        } finally {
            setUpdatingStatus(false);
        }
    };

    const whatsappLink = `https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}?text=Hola%20${encodeURIComponent(order.customerName)},%20te%20escribimos%20de%20Patitas%20Felices%20por%20tu%20orden%20%23${order.id.slice(-6).toUpperCase()}`;

    return (
        <Sheet open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
            <SheetContent side="right" showCloseButton={true} className="w-full sm:max-w-xl overflow-y-auto p-0 flex flex-col gap-0 border-l border-gray-100">
                {/* Header */}
                <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
                    <div className="flex flex-col gap-1 items-start">
                        <div className="flex items-center gap-3">
                            <SheetTitle className="font-black text-[#263238] text-lg">Detalle de Orden</SheetTitle>
                            <PrintButton />
                        </div>
                        <SheetDescription className="text-xs text-gray-400 font-mono mt-0.5">ID: {order.id}</SheetDescription>
                    </div>
                </div>

                <div className="p-6 flex flex-col gap-6 flex-1 bg-white">
                    {/* Status & Payment Badges */}
                    <div className="flex flex-wrap gap-3 items-center">
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${paymentColor}`}>
                            💳 {paymentLabel}
                        </span>
                        <div className="flex items-center gap-2">
                            <select
                                value={order.status}
                                onChange={e => handleStatusChange(e.target.value)}
                                disabled={updatingStatus}
                                className="text-xs font-bold px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 border-none outline-none cursor-pointer disabled:opacity-60"
                            >
                                {STATUS_OPTIONS.map(s => (
                                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                                ))}
                            </select>
                            {updatingStatus && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />}
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                        <h3 className="text-sm font-black text-[#263238] mb-3 flex items-center gap-2">
                            <User className="w-4 h-4 text-[#5FAFE3]" /> Datos del Cliente
                        </h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <p className="text-xs text-gray-400">Nombre</p>
                                <p className="font-semibold text-[#263238]">{order.customerName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">RUT</p>
                                <p className="font-mono font-semibold text-[#263238]">{order.customerRUT}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 flex items-center gap-1"><Mail className="w-3 h-3" /> Email</p>
                                <p className="font-semibold text-[#263238] truncate">{order.customerEmail}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 flex items-center gap-1"><Phone className="w-3 h-3" /> Teléfono</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <p className="font-semibold text-[#263238]">{order.customerPhone}</p>
                                    <a target="_blank" rel="noreferrer" href={whatsappLink} className="bg-[#25D366] text-white p-1 rounded-md hover:bg-[#128C7E] transition shadow-sm ml-auto mr-2" title="Abrir Chat WhatsApp">
                                        <Phone className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            </div>
                            <div className="col-span-2">
                                <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> Dirección</p>
                                <p className="font-semibold text-[#263238]">{order.customerAddress}</p>
                                <p className="text-xs text-[#5FAFE3] font-medium mt-0.5">{order.comuna}</p>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div>
                        <h3 className="text-sm font-black text-[#263238] mb-3 flex items-center gap-2">
                            <Package className="w-4 h-4 text-[#FF9800]" /> Productos ({order.items.length})
                        </h3>
                        <div className="space-y-3">
                            {order.items.map(item => {
                                const isDropi = item.provider.name === "Dropi";
                                return (
                                    <div key={item.id} className="border border-gray-100 rounded-xl p-4">
                                        <div className="flex items-start justify-between gap-2 mb-3">
                                            <div className="flex-1">
                                                <p className="font-semibold text-sm text-[#263238]">{item.productName}</p>
                                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${isDropi ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"
                                                        }`}>
                                                        {item.provider.name}
                                                    </span>
                                                    {item.selectedColor && (
                                                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                                                            Color: {item.selectedColor}
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-gray-400">× {item.quantity}</span>
                                                </div>
                                            </div>
                                            <p className="font-black text-sm text-[#263238] shrink-0">
                                                ${(item.priceAtPurchase * item.quantity).toLocaleString("es-CL")}
                                            </p>
                                        </div>

                                        {/* Tracking Code Input */}
                                        <div className="flex gap-2">
                                            <div className="flex-1 relative">
                                                <Truck className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                <input
                                                    type="text"
                                                    placeholder="Código de tracking..."
                                                    value={trackingInputs[item.id]}
                                                    onChange={e => setTrackingInputs(p => ({ ...p, [item.id]: e.target.value }))}
                                                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5FAFE3]/30 focus:border-[#5FAFE3] transition font-mono"
                                                />
                                            </div>
                                            <button
                                                onClick={() => handleSaveTracking(item.id)}
                                                disabled={savingTracking[item.id]}
                                                className={`px-3 py-2 rounded-lg text-xs font-bold text-white transition shrink-0 flex items-center gap-1 ${savedTracking[item.id] ? "bg-green-500" : "bg-[#5FAFE3] hover:bg-blue-500"
                                                    }`}
                                            >
                                                {savingTracking[item.id]
                                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    : savedTracking[item.id]
                                                        ? <><Check className="w-3.5 h-3.5" /> Guardado</>
                                                        : "Guardar"
                                                }
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="bg-gray-50 rounded-2xl p-4">
                        <h3 className="text-sm font-black text-[#263238] mb-3 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-[#5FAFE3]" /> Resumen de Pago
                        </h3>
                        <div className="space-y-1.5 text-sm">
                            <div className="flex justify-between text-gray-500">
                                <span>Subtotal</span>
                                <span>${(order.totalPrice - order.shippingCost).toLocaleString("es-CL")}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>Envío</span>
                                <span>${order.shippingCost.toLocaleString("es-CL")}</span>
                            </div>
                            <div className="flex justify-between font-black text-[#263238] pt-2 border-t border-gray-200 text-base">
                                <span>Total</span>
                                <span style={{ color: "#5FAFE3" }}>${order.totalPrice.toLocaleString("es-CL")}</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Print Hidden Label */}
                <OrderPrintLabel order={order} />
            </SheetContent>
        </Sheet>
    );
}
