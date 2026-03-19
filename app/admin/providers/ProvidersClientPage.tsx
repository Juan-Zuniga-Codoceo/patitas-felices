"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RefreshCw, Package, Pencil, FileText } from "lucide-react";
import { getProvidersStats, syncDropiPrices } from "./actions";
import { Badge } from "@/components/ui/badge";
import { ProviderModal } from "./ProviderModal";
import { ProviderOverviewSheet } from "./ProviderOverviewSheet";

export default function ProvidersClientPage({ initialData }: { initialData: any[] }) {
    const [providers, setProviders] = useState(initialData);
    const [isLoading, setIsLoading] = useState(false);
    const [syncingId, setSyncingId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProvider, setEditingProvider] = useState<any>(null);
    const [overviewProviderId, setOverviewProviderId] = useState<string | null>(null);

    const fetchProviders = async () => {
        setIsLoading(true);
        const data = await getProvidersStats();
        setProviders(data);
        setIsLoading(false);
    };

    const handleSync = async (id: string) => {
        setSyncingId(id);
        const result = await syncDropiPrices(id);
        setSyncingId(null);
        if (result.success) {
            alert(result.message);
            fetchProviders();
        } else {
            alert("Error: " + result.error);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[#263238]">Proveedores y Sincronización</h1>
                    <p className="text-sm text-gray-500 mt-1">Gestión de Dropi y catálogo local externo</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" size="sm" onClick={fetchProviders} disabled={isLoading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refrescar
                    </Button>
                    <Button
                        size="sm"
                        className="bg-[#263238] hover:bg-[#37474F] text-white"
                        onClick={() => {
                            setEditingProvider(null);
                            setIsModalOpen(true);
                        }}
                    >
                        <Package className="w-4 h-4 mr-2" /> Agregar Proveedor
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                            <TableHead className="font-bold">Nombre / Contacto</TableHead>
                            <TableHead className="font-bold">Ecosistema</TableHead>
                            <TableHead className="font-bold">Catálogo Vinculado</TableHead>
                            <TableHead className="font-bold">Estado</TableHead>
                            <TableHead className="font-bold text-right pt-4">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {providers.map((p) => (
                            <TableRow key={p.id}>
                                <TableCell>
                                    <div className="font-bold text-[#263238] text-base">{p.name}</div>
                                    <div className="text-xs text-gray-500">
                                        {p.email || p.phone || "Sin contacto directo"}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={p.type === 'Dropi' ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-orange-50 text-orange-700 border-orange-200"}>
                                        {p.type === 'Dropi' ? '📦 Dropi' : '🏪 Local'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="font-semibold">{p.productCount} SKUs</div>
                                </TableCell>
                                <TableCell>
                                    {p.status === 'Sincronizado' ? (
                                        <div className="flex items-center text-xs font-medium text-green-600">
                                            <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span> Sincronizado
                                        </div>
                                    ) : (
                                        <div className="flex items-center text-xs font-medium text-red-600">
                                            <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span> Req. Atención
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 text-gray-500 hover:text-[#5FAFE3] hover:bg-blue-50"
                                        onClick={() => setOverviewProviderId(p.id)}
                                    >
                                        <FileText className="w-4 h-4 mr-1" /> Rentabilidad
                                    </Button>
                                    {p.type === 'Dropi' && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 text-blue-600 border-blue-200 hover:bg-blue-50"
                                            onClick={() => handleSync(p.id)}
                                            disabled={syncingId === p.id}
                                        >
                                            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${syncingId === p.id ? 'animate-spin' : ''}`} /> Sync
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-gray-400 hover:text-gray-900"
                                        onClick={() => {
                                            setEditingProvider(p);
                                            setIsModalOpen(true);
                                        }}
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {providers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                                    No hay proveedores registrados.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <ProviderModal
                isOpen={isModalOpen}
                setIsOpen={setIsModalOpen}
                provider={editingProvider}
                onSave={fetchProviders}
            />

            {overviewProviderId && (
                <ProviderOverviewSheet
                    providerId={overviewProviderId}
                    isOpen={!!overviewProviderId}
                    onClose={() => setOverviewProviderId(null)}
                    providerName={providers.find(p => p.id === overviewProviderId)?.name}
                    estimatedProfit={providers.find(p => p.id === overviewProviderId)?.estimatedProfit}
                />
            )}
        </div>
    );
}
