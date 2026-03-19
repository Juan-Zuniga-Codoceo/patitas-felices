"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Truck, MapPin, Info, Package, Store } from "lucide-react";
import { ComunaCombobox } from "@/components/ComunaCombobox";

// Import MapComponent without SSR to avoid Leaflet window errors
const MapComponent = dynamic(() => import("./MapComponent"), { ssr: false });

const BRANCHES = [
    { id: "st-q-1", name: "Agencia Marga Marga", address: "Av. Marga Marga 1500", lat: -33.0560, lng: -71.4380, provider: "starken" as const, comuna: "Quilpué" },
    { id: "st-q-2", name: "Agencia Valencia", address: "Sector Valencia, Quilpué", lat: -33.0480, lng: -71.4250, provider: "starken" as const, comuna: "Quilpué" },
    { id: "bx-q-1", name: "Punto BlueExpress Centro", address: "Blanco Encalada 900", lat: -33.0450, lng: -71.4420, provider: "bluexpress" as const, comuna: "Quilpué" },
    { id: "st-v-1", name: "Agencia Batuco", address: "Batuco 200, Sector Chorrillos", lat: -33.0300, lng: -71.5300, provider: "starken" as const, comuna: "Viña del Mar" },
    { id: "st-v-2", name: "Agencia Uno Poniente", address: "1 Poniente 500", lat: -33.0180, lng: -71.5540, provider: "starken" as const, comuna: "Viña del Mar" },
    { id: "bx-v-1", name: "Punto BlueExpress Libertad", address: "Av. Libertad 800", lat: -33.0120, lng: -71.5500, provider: "bluexpress" as const, comuna: "Viña del Mar" },
];

interface ShippingSimulatorProps {
    product: {
        price: number;
        weight: number;
        length: number;
        width: number;
        height: number;
    };
}

export function ShippingSimulator({ product }: ShippingSimulatorProps) {
    const [comunaSelected, setComunaSelected] = useState("");
    const [zonaSelected, setZonaSelected] = useState("");
    const [deliveryMethod, setDeliveryMethod] = useState<"domicilio" | "sucursal">("domicilio");
    const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

    // V Region Priority Logic
    const isVRegionPriority = comunaSelected === "Viña del Mar" || comunaSelected === "Quilpué";
    const cartTotal = product.price; // We use product price for the simulator
    const localFlatRate = 2990;

    // Real-time calculation mockup for other regions based on dimensions
    const volumetricWeight = (product.length * product.width * product.height) / 4000;
    const billableWeight = Math.max(product.weight, volumetricWeight);

    // Base rates depending on zones
    const baseRate = zonaSelected === "Norte" ? 6500 : zonaSelected === "Sur" ? 5500 : zonaSelected === "RM" ? 3500 : 4500;
    const standardShippingCost = Math.round(baseRate + (billableWeight * 500));

    const filteredBranches = useMemo(() => {
        if (!comunaSelected) return BRANCHES;
        return BRANCHES.filter(b => b.comuna === comunaSelected);
    }, [comunaSelected]);

    return (
        <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6 mb-8 w-full">
            <h3 className="text-xl font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#5FAFE3]" /> Simulador de Envío
            </h3>

            <div className="space-y-5">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-800">Selecciona tu comuna de destino</label>
                    <ComunaCombobox
                        value={comunaSelected}
                        onChange={(name, zona) => {
                            setComunaSelected(name);
                            setZonaSelected(zona);
                            setSelectedBranchId(null);
                            // auto-select sucursal form if branches exist and it was 'sucursal' method but filtered empty
                            if (deliveryMethod === "sucursal" && !BRANCHES.some(b => b.comuna === name)) {
                                // optionally fallback to domicilio if no branches
                            }
                        }}
                    />
                </div>

                {comunaSelected && (
                    <div className="animate-in fade-in slide-in-from-top-2 flex flex-col gap-4">

                        {/* Delivery Method Selector */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setDeliveryMethod("domicilio")}
                                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all font-semibold text-sm ${deliveryMethod === "domicilio"
                                    ? "border-[#5FAFE3] bg-blue-50/50 text-[#5FAFE3]"
                                    : "border-gray-100 text-gray-500 hover:border-gray-200"
                                    }`}
                            >
                                <Package className="w-4 h-4" /> A Domicilio
                            </button>
                            <button
                                onClick={() => setDeliveryMethod("sucursal")}
                                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all font-semibold text-sm ${deliveryMethod === "sucursal"
                                    ? "border-[#5FAFE3] bg-blue-50/50 text-[#5FAFE3]"
                                    : "border-gray-100 text-gray-500 hover:border-gray-200"
                                    }`}
                            >
                                <Store className="w-4 h-4" /> Retiro Sucursal
                            </button>
                        </div>

                        {/* Results Area */}
                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                            {deliveryMethod === "domicilio" ? (
                                <>
                                    {isVRegionPriority ? (
                                        <div className="flex flex-col gap-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                                    <Truck className="w-4 h-4 text-green-500" />
                                                    Tarifa Especial V Región
                                                </span>
                                                <span className="font-black text-lg text-[#5FAFE3]">
                                                    ${localFlatRate.toLocaleString("es-CL")}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-center">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-800">Despacho Blue Express / Starken</span>
                                                <span className="text-xs text-gray-500">Calculado por peso/dimensiones</span>
                                            </div>
                                            <span className="font-black text-lg text-gray-900">
                                                ${standardShippingCost.toLocaleString("es-CL")}
                                            </span>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <span className="text-sm font-bold text-gray-800">Selecciona un punto de retiro cercano</span>
                                    {filteredBranches.length > 0 ? (
                                        <div className="w-full">
                                            <MapComponent
                                                branches={filteredBranches}
                                                selectedBranchId={selectedBranchId}
                                                onBranchSelect={setSelectedBranchId}
                                                centerMap={filteredBranches[0] ? [filteredBranches[0].lat, filteredBranches[0].lng] : undefined}
                                            />
                                            {selectedBranchId && (
                                                <div className="mt-3 bg-blue-50 border border-[#5FAFE3]/30 p-3 rounded-xl flex items-start gap-2">
                                                    <MapPin className="w-4 h-4 text-[#5FAFE3] shrink-0 mt-0.5" />
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-[#263238]">
                                                            {BRANCHES.find(b => b.id === selectedBranchId)?.name}
                                                        </span>
                                                        <span className="text-xs text-gray-600">
                                                            {BRANCHES.find(b => b.id === selectedBranchId)?.address}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic py-4 text-center">
                                            No hay puntos de retiro registrados en esta comuna para Blue Express o Starken.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Dropshipping / Location Transparency Notice */}
                        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex gap-3 items-start">
                            <Info className="w-5 h-5 text-[#5FAFE3] shrink-0" />
                            <p className="text-xs text-gray-600 leading-relaxed font-medium">
                                <strong className="text-[#5FAFE3]">📦 Producto despachado desde bodega central (Santiago).</strong><br />
                                {isVRegionPriority
                                    ? "Tiempo estimado a la V Región: 24-48 hrs hábiles."
                                    : "Tiempo estimado de llegada: 2 a 5 días hábiles según ubicación."}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
