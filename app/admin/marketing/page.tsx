"use client";

import { useState, useEffect } from "react";
import { Users, Download, Mail, ToggleLeft, ToggleRight, Search } from "lucide-react";

type Subscriber = {
    id: string;
    email: string;
    name: string | null;
    source: string;
    subscribed: boolean;
    createdAt: string;
};

export default function MarketingPage() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchSubscribers = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/subscribers");
            const data = await res.json();
            setSubscribers(data.subscribers ?? []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSubscribers(); }, []);

    const handleToggle = async (id: string, current: boolean) => {
        await fetch("/api/admin/subscribers", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, subscribed: !current }),
        });
        setSubscribers(prev =>
            prev.map(s => s.id === id ? { ...s, subscribed: !current } : s)
        );
    };

    const handleExportCSV = () => {
        window.open("/api/admin/subscribers?export=csv", "_blank");
    };

    const filtered = subscribers.filter(s =>
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        (s.name ?? "").toLowerCase().includes(search.toLowerCase())
    );

    const subscribed = subscribers.filter(s => s.subscribed).length;

    const sourceLabel: Record<string, string> = {
        purchase: "🛒 Compra",
        form: "📋 Formulario",
        manual: "✏️ Manual",
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-[#263238]">Email Marketing</h1>
                    <p className="text-sm text-gray-500 mt-1">Lista de contactos recopilados automáticamente</p>
                </div>
                <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#263238] text-white rounded-xl text-sm font-bold hover:bg-[#37474f] transition-colors"
                >
                    <Download className="w-4 h-4" />
                    Exportar CSV
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: "Total Contactos", value: subscribers.length, icon: <Users className="w-5 h-5 text-[#5FAFE3]" />, color: "#5FAFE3" },
                    { label: "Suscriptos activos", value: subscribed, icon: <Mail className="w-5 h-5 text-green-500" />, color: "#22c55e" },
                    { label: "Desuscriptos", value: subscribers.length - subscribed, icon: <ToggleLeft className="w-5 h-5 text-gray-400" />, color: "#94a3b8" },
                ].map(({ label, value, icon, color }) => (
                    <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
                            {icon}
                        </div>
                        <div>
                            <p className="text-2xl font-black text-[#263238]">{value}</p>
                            <p className="text-xs text-gray-500">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search + Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o email…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5FAFE3]/30 focus:border-[#5FAFE3]"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="p-16 text-center text-gray-400 text-sm">Cargando contactos…</div>
                ) : filtered.length === 0 ? (
                    <div className="p-16 text-center">
                        <div className="text-4xl mb-2">📭</div>
                        <p className="text-gray-400 font-medium">Sin resultados</p>
                        <p className="text-xs text-gray-400 mt-1">Los emails se agregan automáticamente al completar una compra</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50/80">
                                    <th className="px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider text-left">Nombre</th>
                                    <th className="px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider text-left">Email</th>
                                    <th className="px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider text-left">Fuente</th>
                                    <th className="px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider text-left">Fecha</th>
                                    <th className="px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider text-center">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map(sub => (
                                    <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-5 py-3">
                                            <span className="font-semibold text-[#263238]">{sub.name ?? <span className="text-gray-300 italic">Sin nombre</span>}</span>
                                        </td>
                                        <td className="px-5 py-3 text-gray-600 font-mono text-xs">{sub.email}</td>
                                        <td className="px-5 py-3">
                                            <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-medium">
                                                {sourceLabel[sub.source] ?? sub.source}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-gray-400 text-xs">
                                            {new Date(sub.createdAt).toLocaleDateString("es-CL")}
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            <button
                                                onClick={() => handleToggle(sub.id, sub.subscribed)}
                                                title={sub.subscribed ? "Desuscribir" : "Resuscribir"}
                                                className="transition-colors"
                                            >
                                                {sub.subscribed
                                                    ? <ToggleRight className="w-6 h-6 text-green-500" />
                                                    : <ToggleLeft className="w-6 h-6 text-gray-300" />
                                                }
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400">
                            Mostrando {filtered.length} de {subscribers.length} contactos
                        </div>
                    </div>
                )}
            </div>

            {/* Usage tip */}
            <div className="bg-blue-50 rounded-2xl p-5 flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#5FAFE3] mt-0.5 shrink-0" />
                <div>
                    <p className="text-sm font-bold text-[#263238]">¿Cómo usar estos contactos?</p>
                    <p className="text-xs text-gray-500 mt-1">
                        Exporta el CSV e impórtalo directamente en <strong>Resend</strong> (Audiences) o <strong>Mailchimp</strong> para enviar campañas.
                        Los emails se agregan automáticamente cada vez que un cliente completa una compra.
                    </p>
                </div>
            </div>
        </div>
    );
}
