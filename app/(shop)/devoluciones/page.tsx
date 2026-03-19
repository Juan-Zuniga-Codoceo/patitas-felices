import Link from "next/link";
import { RotateCcw, AlertTriangle, CheckCircle2, Truck } from "lucide-react";
import type { Metadata } from "next";
import { NavBar } from "@/components/NavBar";

export const metadata: Metadata = {
    title: "Política de Devoluciones y Garantías — Patitas Felices",
    description: "Conoce nuestra política de devoluciones y garantía legal amparada en la Ley del Consumidor de Chile.",
};

export default function DevolucionesPage() {
    return (
        <div className="min-h-screen bg-[#fafafa]">
            <NavBar />

            <main className="max-w-4xl mx-auto px-5 py-16">
                <div className="text-center mb-14">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5" style={{ backgroundColor: "#FF9800" }}>
                        <RotateCcw className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-black text-[#263238] mb-3">Política de Devoluciones</h1>
                    <p className="text-gray-500 text-lg max-w-xl mx-auto">
                        Tu satisfacción y la de tu mascota son nuestra prioridad. Trabajamos según la Ley N° 19.496 del Consumidor (Chile).
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Garantía Legal */}
                    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                            <h2 className="text-xl font-black text-[#263238]">Garantía Legal (6 meses)</h2>
                        </div>
                        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                            Si tu producto presenta defectos de fábrica o no cumple con las características informadas, tienes derecho a la garantía legal durante los primeros <strong>6 meses</strong> desde la recepción del producto. Puedes elegir entre:
                        </p>
                        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                            {["Cambio del producto", "Reparación gratuita", "Devolución del dinero"].map(action => (
                                <li key={action} className="bg-green-50 rounded-xl p-3 text-sm font-bold text-green-700">
                                    {action}
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* Derecho a Retracto */}
                    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <RotateCcw className="w-6 h-6 text-[#5FAFE3]" />
                            <h2 className="text-xl font-black text-[#263238]">Derecho a Retracto (10 días)</h2>
                        </div>
                        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                            Si te arrepentiste de la compra, puedes devolver el producto dentro de los <strong>10 días corridos</strong> desde que lo recibiste.
                        </p>
                        <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 mb-4">
                            <h3 className="font-bold text-[#263238] text-sm mb-2">Condiciones obligatorias:</h3>
                            <ul className="text-sm text-gray-600 space-y-1.5 list-disc pl-4">
                                <li>El producto debe estar en su embalaje original, cerrado y sellado.</li>
                                <li>No debe tener uso, manchas ni olores.</li>
                                <li>Los accesorios y piezas deben estar completos.</li>
                                <li><strong className="text-blue-800">Alimentos y Snacks:</strong> Por motivos de bioseguridad, no se aceptan devoluciones de alimentos si el saco fue abierto.</li>
                            </ul>
                        </div>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5" /> El costo de envío por retracto corre por cuenta del cliente.
                        </p>
                    </section>

                    {/* Proceso */}
                    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
                        <h2 className="text-xl font-black text-[#263238] mb-6">Paso a paso para devolver</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {[
                                { step: 1, title: "Contáctanos", desc: "Escríbenos a hola@patitasfelices.cl o al WhatsApp con tu N° de Orden y el motivo." },
                                { step: 2, title: "Envía el producto", desc: "Te daremos las instrucciones para enviar el paquete de vuelta a nuestra bodega central vía Starken o Blue Express." },
                                { step: 3, title: "Reembolso", desc: "Una vez recibido y revisado, procesamos la devolución del dinero a tu medio original en 5 a 10 días hábiles." },
                            ].map(s => (
                                <div key={s.step} className="relative">
                                    <div className="w-8 h-8 rounded-full bg-[#263238] text-white flex items-center justify-center font-black text-sm mb-3">
                                        {s.step}
                                    </div>
                                    <h3 className="font-bold text-[#263238] text-sm mb-1">{s.title}</h3>
                                    <p className="text-xs text-gray-500">{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Excepciones */}
                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex items-start gap-3">
                        <AlertTriangle className="w-6 h-6 text-orange-500 shrink-0" />
                        <div>
                            <h3 className="font-bold text-orange-800 text-sm mb-1">Productos sin cambio</h3>
                            <p className="text-xs text-orange-700">Por higiene y salubridad, no aceptamos cambios ni devoluciones de ropa usada por mascotas, camas sucias, juguetes mordidos o artículos de aseo abiertos, salvo que presenten falla de origen demostrable.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
