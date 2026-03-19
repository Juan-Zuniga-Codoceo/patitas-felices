import Link from "next/link";
import { Truck, Clock, MapPin, RotateCcw, Shield, Phone } from "lucide-react";
import type { Metadata } from "next";
import { NavBar } from "@/components/NavBar";

export const metadata: Metadata = {
    title: "Políticas de Envío — Patitas Felices",
    description:
        "Conoce los tiempos de despacho, costos de envío por zona y política de devoluciones de Patitas Felices Chile.",
};

const ZONES = [
    { zone: "Región Metropolitana (RM)", time: "3–7 días hábiles", price: "$3.500", carrier: "Blue Express / Starken" },
    { zone: "Zona Norte (Arica, Iquique, Antofagasta…)", time: "7–12 días hábiles", price: "$5.250", carrier: "Starken / Chilexpress" },
    { zone: "Zona Sur (Valparaíso, Concepción, Temuco…)", time: "5–10 días hábiles", price: "$4.550", carrier: "Blue Express / Starken" },
    { zone: "Zona Extrema (Coyhaique, Punta Arenas…)", time: "10–18 días hábiles", price: "$7.000", carrier: "Starken" },
];

export default function PoliticasDeEnvioPage() {
    return (
        <div className="min-h-screen bg-[#fafafa]">
            <NavBar />

            <main className="max-w-4xl mx-auto px-5 py-16">
                {/* Hero */}
                <div className="text-center mb-14">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5" style={{ backgroundColor: "#5FAFE3" }}>
                        <Truck className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-black text-[#263238] mb-3">Políticas de Envío</h1>
                    <p className="text-gray-500 text-lg max-w-xl mx-auto">
                        En Patitas Felices nos comprometemos a entregar tus productos con rapidez y seguridad en todo Chile.
                    </p>
                </div>

                {/* Tabla de Zonas */}
                <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-10">
                    <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                        <MapPin className="w-5 h-5" style={{ color: "#5FAFE3" }} />
                        <h2 className="text-lg font-black text-[#263238]">Tiempos y Costos por Zona</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    {["Zona", "Tiempo estimado", "Costo base", "Transportista"].map(h => (
                                        <th key={h} className="px-5 py-3 text-left text-xs font-black text-gray-400 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {ZONES.map(z => (
                                    <tr key={z.zone} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="px-5 py-4 font-semibold text-[#263238]">{z.zone}</td>
                                        <td className="px-5 py-4 text-gray-600">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-gray-400" />{z.time}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 font-bold" style={{ color: "#5FAFE3" }}>{z.price}</td>
                                        <td className="px-5 py-4 text-gray-500">{z.carrier}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-4 bg-orange-50 border-t border-orange-100">
                        <p className="text-xs text-orange-700">
                            <strong>⚠️ Recargo multiproveedor:</strong> Si tu pedido incluye productos de diferentes bodegas, se aplica un recargo adicional de $1.500 por proveedor adicional. Esto se muestra transparentemente en el checkout.
                        </p>
                    </div>
                </section>

                {/* Dropi */}
                <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
                    <h2 className="text-lg font-black text-[#263238] mb-4 flex items-center gap-2">
                        <span className="text-xl">📦</span> Envíos vía Dropi (Nacional)
                    </h2>
                    <div className="space-y-3 text-sm text-gray-600">
                        <p>Los productos marcados como <strong>Dropi</strong> son enviados directamente desde bodegas nacionales. Los tiempos indicados aplican desde la confirmación del pago.</p>
                        <p>El tracking se emite en un plazo de <strong>24–48 horas hábiles</strong> tras la confirmación del pago y se envía al correo registrado.</p>
                        <p>Dropi despacha con <strong>Blue Express</strong> o <strong>Starken</strong> dependiendo de la disponibilidad en tu zona.</p>
                    </div>
                </section>

                {/* Devoluciones */}
                <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
                    <h2 className="text-lg font-black text-[#263238] mb-4 flex items-center gap-2">
                        <RotateCcw className="w-5 h-5" style={{ color: "#FF9800" }} /> Política de Devoluciones
                    </h2>
                    <div className="space-y-3 text-sm text-gray-600">
                        <p>Aceptamos devoluciones dentro de los <strong>7 días corridos</strong> desde la recepción del producto, según la <strong>Ley N° 19.496 del Consumidor</strong> de Chile.</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>El producto debe estar en su embalaje original y sin uso evidente.</li>
                            <li>Los gastos de devolución son de cargo del cliente, salvo defecto de fabricación.</li>
                            <li>Una vez recibido y validado, el reembolso se procesa en 5–10 días hábiles.</li>
                        </ul>
                        <p>Para iniciar una devolución, contáctanos por WhatsApp al <strong>+56 9 1234 5678</strong> o a <strong>hola@patitasfelices.cl</strong>.</p>
                    </div>
                </section>

                {/* Soporte */}
                <section className="bg-[#5FAFE3]/10 rounded-2xl p-6 flex items-start gap-4">
                    <Phone className="w-6 h-6 text-[#5FAFE3] shrink-0 mt-1" />
                    <div>
                        <h3 className="font-black text-[#263238] mb-1">¿Tienes dudas sobre tu envío?</h3>
                        <p className="text-sm text-gray-600">Escríbenos directamente por WhatsApp y te respondemos en menos de 2 horas en días hábiles.</p>
                        <a
                            href="https://wa.me/56912345678?text=Hola!%20Tengo%20una%20consulta%20sobre%20mi%20envío%20en%20Patitas%20Felices"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-3 px-4 py-2 rounded-xl font-bold text-white text-sm transition hover:opacity-90"
                            style={{ backgroundColor: "#25D366" }}
                        >
                            💬 Contactar por WhatsApp
                        </a>
                    </div>
                </section>
            </main>
        </div>
    );
}
