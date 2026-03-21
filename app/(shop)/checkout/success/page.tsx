import Link from "next/link";
import { CheckCircle2, Package, Clock, Truck, Star, MessageCircle, Banknote } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { NavBar } from "@/components/NavBar";

async function getOrderDetails(orderId: string) {
    try {
        return await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: { include: { provider: true } } },
        });
    } catch {
        return null;
    }
}

export default async function CheckoutSuccessPage({
    searchParams,
}: {
    searchParams: Promise<{ orderId?: string; pending?: string; cod?: string }>;
}) {
    const { orderId, pending, cod } = await searchParams;
    const isPending = pending === "true";
    const isCOD = cod === "true";
    const order = orderId ? await getOrderDetails(orderId) : null;

    const uniqueProviders = order
        ? [...new Map(order.items.map(i => [i.provider.name, i.provider])).values()]
        : [];

    const TIMELINE = isCOD
        ? [
            { label: "Pedido recibido", icon: <CheckCircle2 className="w-4 h-4" />, done: true, active: false },
            { label: "Preparando pedido", icon: <Package className="w-4 h-4" />, done: false, active: true },
            { label: "En camino", icon: <Truck className="w-4 h-4" />, done: false, active: false },
            { label: "Entrega y cobro en efectivo", icon: <Banknote className="w-4 h-4" />, done: false, active: false },
        ]
        : [
            { label: "Pago confirmado", icon: <CheckCircle2 className="w-4 h-4" />, done: !isPending, active: false },
            { label: "Preparando pedido", icon: <Package className="w-4 h-4" />, done: false, active: !isPending },
            { label: "En camino", icon: <Truck className="w-4 h-4" />, done: false, active: false },
            { label: "Entregado", icon: <Star className="w-4 h-4" />, done: false, active: false },
        ];

    const headerBg = isCOD || isPending
        ? "linear-gradient(135deg,#FF9800,#f57c00)"
        : "linear-gradient(135deg,#5FAFE3,#3d9bd6)";

    const whatsappMsg = encodeURIComponent(
        `Hola! Tengo mi orden #${orderId?.slice(0, 8) ?? "?"} confirmada y quería consultar sobre mi pedido 🐾`
    );

    return (
        <div className="min-h-screen bg-[#fafafa]">
            <NavBar minimal />

            {/* ── Header — extra pb so overlapping card has breathing room */}
            <div
                className="relative pt-14 pb-10 px-4 text-center text-white overflow-hidden"
                style={{ background: headerBg }}
            >
                <div className="absolute inset-0 pointer-events-none" aria-hidden>
                    {["top-4 left-10", "top-10 right-20", "bottom-6 left-1/4", "bottom-2 right-1/3"].map((pos, i) => (
                        <div key={i} className={`absolute rounded-full bg-white/10 blur-xl ${pos}`}
                            style={{ width: 32 + i * 16, height: 32 + i * 16 }} />
                    ))}
                </div>
                <div className="relative z-10">
                    <div className="text-6xl mb-3 animate-bounce">
                        {isCOD ? "🐾" : isPending ? "⏳" : "🎉"}
                    </div>
                    <h1 className="text-4xl font-black mb-2">
                        {isCOD ? "¡Pedido confirmado!" : isPending ? "¡Pago en proceso!" : "¡Pedido confirmado!"}
                    </h1>
                    <p className="text-white/90 text-base max-w-sm mx-auto">
                        {isCOD
                            ? "Tu pedido Contra Entrega ha sido registrado."
                            : isPending
                                ? "Te notificaremos en cuanto se acredite."
                                : "¡Gracias por confiar en Patitas Felices! 🐾"}
                    </p>
                </div>
            </div>

            <main className="max-w-xl mx-auto px-4 pt-6 pb-16 space-y-4">

                {/* ── COD Money Alert */}
                {isCOD && (
                    <div className="bg-orange-50 border-2 border-[#FF9800] rounded-2xl shadow-sm p-5 flex items-start gap-4">
                        <div className="text-4xl shrink-0">💵</div>
                        <div>
                            <p className="font-black text-[#92400e] text-base leading-tight">
                                Ten el dinero exacto listo
                            </p>
                            <p className="text-sm text-orange-600 mt-1">
                                El repartidor cobrará al momento de la entrega en tu domicilio.
                            </p>
                            {order && (
                                <p className="mt-2 text-xl font-black text-[#FF9800]">
                                    Total: ${order.totalPrice.toLocaleString("es-CL")} CLP
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Order ID card */}
                {orderId && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-wide mb-1">N° de Orden</p>
                        <p className="font-mono text-sm font-bold text-[#263238] break-all leading-relaxed">
                            {orderId}
                        </p>
                        {order && (
                            <p className="text-sm text-gray-500 mt-2">
                                Confirmación enviada a <strong>{order.customerEmail}</strong>
                            </p>
                        )}
                    </div>
                )}

                {/* ── Timeline */}
                {!isPending && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h2 className="text-sm font-black text-[#263238] mb-5 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#5FAFE3]" /> Estado de tu pedido
                        </h2>
                        <ol className="relative">
                            {TIMELINE.map((step, i) => {
                                const accent = isCOD ? "#FF9800" : "#5FAFE3";
                                return (
                                    <li key={i}
                                        className={`flex gap-4 pb-5 ${i < TIMELINE.length - 1
                                            ? "border-l-2 ml-[19px] pl-6"
                                            : "ml-[19px] pl-6"
                                            }`}
                                        style={{ borderColor: step.done ? accent : "#e5e7eb" }}
                                    >
                                        <div
                                            className={`absolute w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0`}
                                            style={{
                                                left: 0,
                                                marginLeft: "-19px",
                                                backgroundColor: step.done ? accent : step.active ? "#fff" : "#fff",
                                                borderColor: step.done ? accent : step.active ? "#FF9800" : "#e5e7eb",
                                                color: step.done ? "#fff" : step.active ? "#FF9800" : "#d1d5db",
                                            }}
                                        >
                                            {step.icon}
                                        </div>
                                        <div className="min-w-0 flex-1" style={{ marginLeft: "-2.5rem", paddingLeft: "2.5rem" }}>
                                            <p className={`text-sm font-bold ${step.done || step.active ? "text-[#263238]" : "text-gray-300"}`}>
                                                {step.label}
                                            </p>
                                            {step.active && (
                                                <p className="text-xs text-[#FF9800] mt-0.5 flex items-center gap-1">
                                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FF9800] animate-pulse" />
                                                    En progreso
                                                </p>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ol>
                    </div>
                )}

                {/* ── Provider breakdown */}
                {order && uniqueProviders.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h2 className="text-sm font-black text-[#263238] mb-4 flex items-center gap-2">
                            <Package className="w-4 h-4 text-[#FF9800]" /> Tu pedido viene de
                        </h2>
                        <div className="space-y-3">
                            {uniqueProviders.map(prov => {
                                const provItems = order.items.filter(i => i.provider.name === prov.name);
                                const isDropi = prov.name === "Dropi";
                                return (
                                    <div key={prov.id} className={`rounded-xl p-4 border ${isDropi ? "bg-blue-50 border-blue-100" : "bg-orange-50 border-orange-100"}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-xs font-black px-2.5 py-1 rounded-full ${isDropi ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"}`}>
                                                {prov.name}
                                            </span>
                                            <span className="text-xs text-gray-500">{provItems.length} producto{provItems.length !== 1 ? "s" : ""}</span>
                                        </div>
                                        <ul className="space-y-1">
                                            {provItems.map(item => (
                                                <li key={item.id} className="text-xs text-gray-600">
                                                    • <strong>{item.productName}</strong> × {item.quantity}
                                                    {(item as any).selectedColor && <span className="text-gray-400"> ({(item as any).selectedColor})</span>}
                                                </li>
                                            ))}
                                        </ul>
                                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                            <Truck className="w-3 h-3" />
                                            {isDropi ? "Despacho en 24–48 hrs hábiles vía Blue Express / Starken" : "Coordinación con proveedor externo"}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── CTA Buttons */}
                <div className="space-y-3">
                    <a
                        href={`https://wa.me/56912345678?text=${whatsappMsg}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white text-sm transition hover:opacity-90"
                        style={{ backgroundColor: "#25D366" }}
                    >
                        <MessageCircle className="w-5 h-5" />
                        Consultar por WhatsApp
                    </a>
                    <Link
                        href="/"
                        className="w-full flex items-center justify-center py-3.5 rounded-xl font-bold text-sm transition hover:opacity-90 text-white"
                        style={{ backgroundColor: "#5FAFE3" }}
                    >
                        Seguir comprando 🐾
                    </Link>
                </div>

                <p className="text-center text-xs text-gray-400 pb-4">
                    Ante cualquier consulta:{" "}
                    <a href="mailto:hola@mispatitasfelices.cl" className="underline hover:text-[#5FAFE3]">
                        hola@mispatitasfelices.cl
                    </a>
                </p>
            </main>
        </div>
    );
}
