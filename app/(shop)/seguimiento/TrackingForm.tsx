"use client";

import { useState } from "react";
import { Loader2, Search, Package, MapPin, Truck, ChevronRight, XCircle } from "lucide-react";
import Link from "next/link";

type OrderTracking = {
    id: string;
    createdAt: string;
    status: string;
    paymentStatus: string;
    items: {
        id: string;
        productName: string;
        quantity: number;
        providerName: string;
        trackingCode: string | null;
        status: string;
    }[];
};

export function TrackingForm() {
    const [orderId, setOrderId] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [order, setOrder] = useState<OrderTracking | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderId.trim() || !email.trim()) return;

        setLoading(true);
        setError(null);
        setOrder(null);

        try {
            const res = await fetch(`/api/tracking?id=${encodeURIComponent(orderId.trim())}&email=${encodeURIComponent(email.trim())}`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error ?? "No se encontró un pedido con esos datos.");
            }

            setOrder(data.order);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (order) {
        // Group items by provider
        const providers = [...new Set(order.items.map(i => i.providerName))];

        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between pb-5 border-b border-gray-100">
                    <div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-wide mb-1">Orden Encontrada</p>
                        <p className="font-mono text-base font-bold text-[#263238]">#{order.id.slice(0, 8)}</p>
                    </div>
                    <button
                        onClick={() => setOrder(null)}
                        className="text-xs font-bold text-gray-400 hover:text-gray-600 px-3 py-1.5 bg-gray-50 rounded-lg transition"
                    >
                        Buscar otra
                    </button>
                </div>

                {/* Status Timeline / Info */}
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                    <p className="text-sm font-semibold text-[#263238] mb-2 flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${order.paymentStatus === 'PAID' ? 'bg-green-500' : 'bg-orange-500'}`} />
                        Estado General: {order.status === "CREATED" ? "Recibido" : order.status === "PROCESSING" ? "En Preparación" : order.status === "SHIPPED" ? "Enviado" : "Entregado"}
                    </p>
                    <p className="text-xs text-gray-500">
                        Pago: {order.paymentStatus === "PAID" ? "Aprobado" : "Pendiente"}
                    </p>
                </div>

                {/* Tracking Code List */}
                <div className="space-y-4 pt-2">
                    <h3 className="text-sm font-black text-[#263238]">Detalle de despacho</h3>
                    {providers.map(prov => {
                        const items = order.items.filter(i => i.providerName === prov);
                        const trackingCode = items.find(i => i.trackingCode)?.trackingCode;

                        // Identify carrier for the link (basic logic based on typical Chilean formats, defaulting to blue express)
                        let trackerUrl = trackingCode ? `https://www.bluex.cl/seguimiento?numero_orden=${trackingCode}` : null;
                        if (trackingCode && /^9\d{8,9}$/.test(trackingCode)) { // typical Starken
                            trackerUrl = `https://www.starken.cl/seguimiento?codigo=${trackingCode}`;
                        }

                        return (
                            <div key={prov} className="bg-white border text-sm border-gray-200 rounded-xl p-4 overflow-hidden shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                    <Package className={`w-4 h-4 ${prov === 'Dropi' ? 'text-[#5FAFE3]' : 'text-[#FF9800]'}`} />
                                    <span className="font-bold text-[#263238]">Bodega {prov === 'Dropi' ? 'Nacional' : 'Externa'}</span>
                                    <span className="ml-auto text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">
                                        {items.length} items
                                    </span>
                                </div>

                                <ul className="mb-4 space-y-1">
                                    {items.map(item => (
                                        <li key={item.id} className="text-xs text-gray-600 truncate">
                                            • {item.quantity}x {item.productName}
                                        </li>
                                    ))}
                                </ul>

                                {trackingCode ? (
                                    <div className="bg-[#5FAFE3]/10 border border-[#5FAFE3]/20 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <p className="text-xs text-[#5FAFE3] font-black uppercase tracking-wide">Código de Seguimiento</p>
                                            <p className="font-mono font-black text-lg text-[#263238]">{trackingCode}</p>
                                        </div>
                                        <a
                                            href={trackerUrl!}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-[#5FAFE3] text-white text-xs font-bold rounded-lg hover:bg-[#3d9bd6] transition-colors flex items-center justify-center gap-1.5"
                                        >
                                            Rastrear Envío <ChevronRight className="w-3.5 h-3.5" />
                                        </a>
                                    </div>
                                ) : (
                                    <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 flex items-center gap-2 border border-gray-100">
                                        <Truck className="w-4 h-4 text-gray-400" />
                                        En preparación. Te notificaremos apenas se asigne un código.
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="text-center pt-4">
                    <Link href="/" className="text-sm font-bold text-[#5FAFE3] hover:underline">
                        Volver a la tienda
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
                <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm font-medium border border-red-200 flex items-start gap-2">
                    <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}
            <div>
                <label className="block text-sm font-semibold text-[#263238] mb-1.5">Número de Orden</label>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        required
                        type="text"
                        placeholder="Ej: cli9x8b..."
                        value={orderId}
                        onChange={e => setOrderId(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#5FAFE3]/30 focus:border-[#5FAFE3] transition"
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-semibold text-[#263238] mb-1.5">Email de Compra</label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                    <input
                        required
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5FAFE3]/30 focus:border-[#5FAFE3] transition"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-black text-white text-sm shadow-md transition-all hover:opacity-90 disabled:opacity-70 flex items-center justify-center gap-2 mt-4"
                style={{ backgroundColor: "#263238" }}
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-4 h-4" />}
                {loading ? "Buscando..." : "Rastrear Pedido"}
            </button>
        </form>
    );
}
