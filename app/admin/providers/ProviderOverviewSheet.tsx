"use client";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TrendingUp, DollarSign, PieChart, Activity } from "lucide-react";

export function ProviderOverviewSheet({ providerId, isOpen, onClose, providerName, estimatedProfit }: { providerId: string, isOpen: boolean, onClose: () => void, providerName?: string, estimatedProfit?: number }) {

    if (!providerId) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle className="text-xl font-black text-[#263238] flex items-center">
                        <Activity className="w-5 h-5 mr-2 text-[#FF9800]" />
                        Análisis de Rentabilidad
                    </SheetTitle>
                    <SheetDescription>
                        Desempeño financiero y márgenes para <strong>{providerName}</strong>.
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-8 space-y-6">
                    {/* Metric Card */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200/60 shadow-inner relative overflow-hidden">
                        <div className="absolute -right-6 -top-6 text-gray-200 opacity-50">
                            <TrendingUp className="w-32 h-32" strokeWidth={1} />
                        </div>
                        <h3 className="text-sm font-bold tracking-widest text-gray-500 uppercase mb-2 relative z-10">Margen Neto Estimado</h3>
                        <div className="flex items-end gap-2 relative z-10">
                            <span className="text-4xl font-black text-[#263238] tracking-tight">
                                ${estimatedProfit?.toLocaleString("es-CL") || "0"}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-3 relative z-10 flex items-center">
                            <PieChart className="w-3 h-3 mr-1" />
                            Basado en (PVP Sugerido - Costo Base) activo.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-gray-800">Criterios de Cálculo</h4>
                        <ul className="text-sm text-gray-600 space-y-3 leading-relaxed bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                            <li className="flex gap-2">
                                <DollarSign className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                Este margen representa la ganancia bruta teórica si se vendiera 1 unidad de cada SKU asociado a este proveedor.
                            </li>
                            <li className="flex gap-2">
                                <DollarSign className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                No descuenta impuestos (IVA), comisiones de pasarela de pago (Mercado Pago), ni despacho logístico.
                            </li>
                        </ul>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
