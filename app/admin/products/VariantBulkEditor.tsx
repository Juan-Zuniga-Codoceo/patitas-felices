"use client";

import React, { useState } from "react";
import { ProductVariantInput } from "@/app/admin/products/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, RefreshCw } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface VariantBulkEditorProps {
    variants: ProductVariantInput[];
    onVariantsChange: (variants: ProductVariantInput[]) => void;
    basePrice?: number; // Para mostrar el cálculo final sugerido
}

export function VariantBulkEditor({ variants, onVariantsChange, basePrice = 0 }: VariantBulkEditorProps) {
    const [newColor, setNewColor] = useState("");

    const addVariant = () => {
        if (!newColor.trim()) return;
        onVariantsChange([...variants, { color: newColor.trim(), stock: 0, priceAdjustment: 0 }]);
        setNewColor("");
    };

    const updateVariant = (index: number, field: keyof ProductVariantInput, value: string | number) => {
        const updated = [...variants];
        updated[index] = { ...updated[index], [field]: value };
        onVariantsChange(updated);
    };

    const removeVariant = (index: number) => {
        onVariantsChange(variants.filter((_, i) => i !== index));
    };

    const syncDropiStock = () => {
        // En un escenario real, esto llamaría a la API de Dropi.
        // Aquí simulamos establecer un stock arbitrario a todas las variantes para demostrar el Bulk Edit.
        const updated = variants.map(v => ({ ...v, stock: 100 }));
        onVariantsChange(updated);
    };

    return (
        <div className="space-y-4">
            {/* Quick Add Bar */}
            <div className="flex items-center gap-2">
                <Input
                    placeholder="Nuevo color (ej: Rojo, M, XL)"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="flex-1 rounded-xl text-sm"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            addVariant();
                        }
                    }}
                />
                <Button
                    type="button"
                    onClick={addVariant}
                    className="rounded-xl px-4 bg-[#FF9800] hover:bg-[#F57C00] text-white"
                >
                    <Plus className="w-4 h-4 mr-2" /> Añadir
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={syncDropiStock}
                    className="rounded-xl px-4 border-[#5FAFE3] text-[#5FAFE3] hover:bg-blue-50"
                    title="Asignar Stock base (Simulación Dropi)"
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync Dropi
                </Button>
            </div>

            {/* Bulk Edit Data Table */}
            {variants.length > 0 && (
                <div className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm">
                    <Table>
                        <TableHeader className="bg-gray-50/50">
                            <TableRow>
                                <TableHead className="w-[120px] font-bold text-gray-500">Color/SKU</TableHead>
                                <TableHead className="font-bold text-gray-500">Stock</TableHead>
                                <TableHead className="font-bold text-gray-500">Ajuste ($)</TableHead>
                                <TableHead className="text-right font-bold text-gray-500">Precio Final</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {variants.map((variant, index) => {
                                const finalPrice = basePrice + (variant.priceAdjustment || 0);

                                return (
                                    <TableRow key={index} className="hover:bg-gray-50/50 transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-4 h-4 rounded-full border border-gray-200"
                                                    style={{ backgroundColor: variant.color.toLowerCase() === variant.color ? `#${variant.color}` : variant.color }}
                                                />
                                                <span className="font-semibold text-sm">{variant.color}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                min={0}
                                                value={variant.stock === 0 ? '' : variant.stock}
                                                onChange={(e) => updateVariant(index, 'stock', Number(e.target.value))}
                                                className="w-full h-8 px-2 py-1 text-sm rounded-lg border-gray-200 focus:border-[#5FAFE3]"
                                                placeholder="0"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="relative">
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                                                <Input
                                                    type="number"
                                                    value={variant.priceAdjustment === 0 ? '' : variant.priceAdjustment}
                                                    onChange={(e) => updateVariant(index, 'priceAdjustment', Number(e.target.value))}
                                                    className={`w-full h-8 pl-6 pr-2 py-1 text-sm rounded-lg focus:border-[#5FAFE3] font-mono ${variant.priceAdjustment > 0 ? 'text-green-600 border-green-200 bg-green-50/50' : variant.priceAdjustment < 0 ? 'text-red-500 border-red-200 bg-red-50/50' : 'border-gray-200'}`}
                                                    placeholder="0"
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-mono font-bold text-[#263238]">
                                            ${finalPrice.toLocaleString('es-CL')}
                                        </TableCell>
                                        <TableCell>
                                            <button
                                                type="button"
                                                onClick={() => removeVariant(index)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
