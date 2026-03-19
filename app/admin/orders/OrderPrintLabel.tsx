"use client";

import { Printer } from "lucide-react";
import Image from "next/image";

export function OrderPrintLabel({ order }: { order: any }) {
    // Componente oculto por defecto, visible únicamente al presionar imprimir.
    return (
        <div className="hidden print:block fixed inset-0 z-[9999] bg-white text-black p-8 font-sans">
            <div className="border-4 border-black p-8 max-w-2xl mx-auto h-auto min-h-[500px] flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between border-b-2 border-black pb-6 mb-6">
                        <div className="w-32 h-12 relative">
                            {/* Usamos el logo sin fondo oficial */}
                            <Image
                                src="/Patitas-sinfondo.png"
                                alt="Patitas Felices"
                                fill
                                className="object-contain object-left"
                                priority
                            />
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-black uppercase tracking-wider">Envío Prioritario</h2>
                            <p className="text-base font-bold mt-1">ORDEN #{order.id.slice(-6).toUpperCase()}</p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-sm uppercase text-gray-600 font-bold mb-1">Remitente:</h3>
                        <p className="font-black text-lg">PATITAS FELICES (SynapseDev)</p>
                        <p>Av. Siempre Viva 123</p>
                        <p>Viña del Mar, Región de Valparaíso</p>
                    </div>

                    <div>
                        <h3 className="text-sm uppercase text-gray-600 font-bold mb-1">Destinatario:</h3>
                        <p className="font-black text-2xl uppercase">{order.customerName}</p>
                        <p className="text-xl mt-2">{order.customerAddress}</p>
                        <p className="text-2xl font-black uppercase tracking-widest mt-1 bg-yellow-200 inline-block px-2">{order.comuna}</p>
                        <div className="mt-4 pt-4 border-t border-gray-300 grid grid-cols-2 gap-4">
                            <p className="text-base font-semibold">RUT: {order.customerRUT}</p>
                            <p className="text-base font-semibold">Tel: {order.customerPhone}</p>
                        </div>
                    </div>
                </div>

                <div className="border-t-2 border-dashed border-black pt-6 mt-10 text-center">
                    <p className="text-xs uppercase font-bold tracking-widest mb-2">
                        Patitas Felices · Logistics Department
                    </p>
                    <p className="text-[10px] text-gray-500 uppercase">Documento Logístico · No Válido como Boleta</p>
                </div>
            </div>
        </div>
    );
}

export function PrintButton() {
    return (
        <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-[#263238] font-bold py-2 px-4 rounded-xl transition shadow-sm"
        >
            <Printer className="w-4 h-4" />
            <span>Imprimir Etiqueta</span>
        </button>
    );
}
