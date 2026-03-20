"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    ImagePlus, X, CheckCircle2, AlertCircle, Plus, Trash2, Palette
} from "lucide-react";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
    Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    createProduct, updateProduct, ProductPayload, ProductImageInput, ProductVariantInput
} from "@/app/admin/products/actions";
import { COMUNAS, calcularFactorEnvio, type Comuna } from "@/lib/comunas";
import { SortableImageGallery } from "./SortableImageGallery";
import { VariantBulkEditor } from "./VariantBulkEditor";
import { SEOAuditor } from "./SEOAuditor";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type ProductFormInitialData = {
    id?: string;
    name?: string;
    description?: string;
    category?: string;
    providerType?: "Dropi" | "External";
    allowsCOD?: boolean;
    sku?: string;
    dropiId?: string;
    imageUrl?: string;
    seoMetaDescription?: string;
    costPrice?: number;
    sellPrice?: number;
    weight?: number;
    length?: number;
    width?: number;
    height?: number;
    images?: { url: string; alt?: string }[];
    variants?: { color: string; stock: number; priceAdjustment: number }[];
};

type Toast = { type: "success" | "error"; message: string } | null;
type Props = { mode: "create" | "edit"; initialData?: ProductFormInitialData };

// ─── Componente Combobox re‑usable ────────────────────────────────────────────

function ComunaCombobox({
    label, value, onChange
}: { label: string; value: string; onChange: (v: string) => void }) {
    const [open, setOpen] = useState(false);
    const selected = COMUNAS.find(c => c.name === value);

    return (
        <div className="space-y-2 flex-1">
            <Label className="text-sm font-semibold text-[#263238]">{label}</Label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button
                        className="w-full justify-between flex items-center px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white hover:border-[#5FAFE3] transition-all text-left"
                        type="button"
                    >
                        {selected ? (
                            <span className="font-medium text-[#263238]">
                                {selected.name} <span className="text-gray-400 text-xs">({selected.region})</span>
                            </span>
                        ) : (
                            <span className="text-gray-400">Buscar comuna…</span>
                        )}
                        <span className="text-gray-400 ml-2">▾</span>
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-0" align="start">
                    <Command>
                        <CommandInput placeholder="Buscar…" className="h-9" />
                        <CommandList>
                            <CommandEmpty>Sin resultados</CommandEmpty>
                            <CommandGroup>
                                {COMUNAS.map(c => (
                                    <CommandItem
                                        key={c.name}
                                        value={c.name}
                                        onSelect={() => { onChange(c.name); setOpen(false); }}
                                        className="flex justify-between"
                                    >
                                        <span>{c.name}</span>
                                        <span className="text-xs text-gray-400">{c.region}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}

// ─── Formulario Principal ─────────────────────────────────────────────────────

export default function ProductForm({ mode, initialData = {} }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<Toast>(null);

    // Datos Básicos
    const [name, setName] = useState(initialData.name ?? "");
    const [description, setDescription] = useState(initialData.description ?? "");
    const [seoMetaDescription, setSeoMetaDescription] = useState(initialData.seoMetaDescription ?? "");
    const [category, setCategory] = useState(initialData.category ?? "Dog");
    const [imagePreview, setImagePreview] = useState<string | null>(initialData.imageUrl ?? null);

    // Multi‑imágenes
    const [imageUrls, setImageUrls] = useState<string[]>(
        initialData.images?.map(i => i.url) ?? (initialData.imageUrl ? [initialData.imageUrl] : [])
    );
    const [newImageUrl, setNewImageUrl] = useState("");

    const [variants, setVariants] = useState<ProductVariantInput[]>(
        initialData.variants ?? []
    );

    // Proveedor
    const [providerType, setProviderType] = useState<"Dropi" | "External">(initialData.providerType ?? "Dropi");
    const [allowsCOD, setAllowsCOD] = useState(initialData.allowsCOD ?? true);
    const [sku, setSku] = useState(initialData.sku ?? "");
    const [dropiId, setDropiId] = useState(initialData.dropiId ?? "");

    // Finanzas
    const [costPrice, setCostPrice] = useState(initialData.costPrice ?? 0);
    const [margin, setMargin] = useState(30);

    // Logística
    const [length, setLength] = useState(initialData.length ?? 0);
    const [width, setWidth] = useState(initialData.width ?? 0);
    const [height, setHeight] = useState(initialData.height ?? 0);
    const [physicalWeight, setPhysicalWeight] = useState(initialData.weight ?? 0);
    const [comunaOrigen, setComunaOrigen] = useState("Santiago");
    const [comunaDestino, setComunaDestino] = useState("Santiago");
    const [selectedCourier, setSelectedCourier] = useState<"Blue" | "Starken">("Blue");

    useEffect(() => {
        if (initialData.costPrice && initialData.sellPrice && initialData.costPrice > 0) {
            const approxMargin = Math.round(((initialData.sellPrice / initialData.costPrice) - 1) * 100);
            if (approxMargin > 0 && approxMargin < 500) setMargin(approxMargin);
        }
    }, []);

    useEffect(() => {
        if (providerType === "External") setAllowsCOD(false);
        else setAllowsCOD(true);
    }, [providerType]);

    // ─── Cálculos Logísticos ──────────────────────────────────────────────────
    const origenZone = COMUNAS.find(c => c.name === comunaOrigen)?.zone ?? "RM";
    const destinoZone = COMUNAS.find(c => c.name === comunaDestino)?.zone ?? "RM";
    const factor = calcularFactorEnvio(origenZone, destinoZone);

    const volWeight = (length * width * height) / 4000;
    const applicableWeight = Math.max(physicalWeight, volWeight);
    const blueExpressCost = Math.round(3200 + (applicableWeight * 800) * factor);
    const starkenCost = Math.round(3500 + (applicableWeight * 950) * factor);
    const selectedShippingCost = selectedCourier === "Blue" ? blueExpressCost : starkenCost;
    const basePrice = costPrice * (1 + margin / 100);
    const suggestedPVP = Math.round(basePrice);

    // ─── Helpers Multi‑imagen ─────────────────────────────────────────────────
    const addImageUrl = () => {
        if (!newImageUrl.trim()) return;
        setImageUrls(prev => [...prev, newImageUrl.trim()]);
        setNewImageUrl("");
    };
    const removeImageUrl = (i: number) => setImageUrls(prev => prev.filter((_, idx) => idx !== i));

    // ─── Compresión de Imagen en Cliente ──────────────────────────────────────
    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const MAX_WIDTH = 800;
                    const scaleSize = MAX_WIDTH / img.width;
                    const width = MAX_WIDTH;
                    const height = img.height * scaleSize;

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx?.drawImage(img, 0, 0, width, height);

                    // Comprimir a JPEG con 80% de calidad para reducir dramáticamente el Base64
                    const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.8);
                    resolve(compressedDataUrl);
                };
                img.onerror = (error) => reject(error);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (files.length === 0) return;
        setToast({ type: "success", message: `Optimizando ${files.length} imagen(es)...` });
        try {
            const compressed = await Promise.all(files.map(compressImage));
            setImageUrls(prev => [...prev, ...compressed]);
            setImagePreview(compressed[0]);
            setToast(null);
        } catch (error) {
            console.error("Error comprimiendo imagen:", error);
            showToast("error", "Error al procesar las imágenes.");
        }
        // Reset input so same file can be added again
        e.target.value = "";
    };

    // ─── Toast ────────────────────────────────────────────────────────────────
    const showToast = (type: "success" | "error", message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3500);
    };

    // ─── Submit ───────────────────────────────────────────────────────────────
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload: ProductPayload = {
            name, description, seoMetaDescription, category, providerType, allowsCOD,
            sku: sku || undefined,
            dropiId: dropiId || undefined,
            imageUrl: imageUrls[0] || imagePreview || undefined,
            image: imagePreview || undefined,
            costPrice,
            sellPrice: suggestedPVP,
            weight: physicalWeight,
            length, width, height,
            images: imageUrls.map((url, i) => ({ url, order: i })),
            variants,
        };

        const res = mode === "edit" && initialData.id
            ? await updateProduct(initialData.id, payload)
            : await createProduct(payload);

        if (res.success) {
            showToast("success", mode === "edit" ? "¡Producto actualizado!" : "¡Producto creado!");
            setTimeout(() => router.push("/admin/products"), 1200);
        } else {
            showToast("error", res.error || "Ocurrió un error.");
            setLoading(false);
        }
    };

    // ─── JSX ──────────────────────────────────────────────────────────────────
    return (
        <>
            {toast && (
                <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-white text-sm font-bold animate-in slide-in-from-top-4 fade-in ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}`}>
                    {toast.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {toast.message}
                </div>
            )}

            <form onSubmit={handleSave} className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="mb-8 flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold text-[#263238] leading-tight mb-1">
                            {mode === "edit" ? "Editar Producto" : "Crear Producto"}
                        </h1>
                        <p className="text-gray-500 text-sm">
                            {mode === "edit" ? "Modifica los datos, imágenes y variantes del producto." : "Añade un nuevo producto al catálogo con imágenes, variantes y precio calculado."}
                        </p>
                    </div>
                    <button type="button" onClick={() => router.push("/admin/products")} className="text-sm text-gray-400 hover:text-gray-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100">
                        ← Volver
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* ── Columna Izquierda ── */}
                    <div className="space-y-6">

                        {/* Información General */}
                        <Card className="border-gray-100 shadow-sm rounded-2xl">
                            <CardHeader><CardTitle className="text-lg">Información General</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre del Producto *</Label>
                                    <Input id="name" value={name} onChange={e => setName(e.target.value)} required placeholder="Ej: Correa Antipulgas Talla M" className="rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <Label htmlFor="desc">Descripción Larga del Producto</Label>
                                        <span className={`text-[10px] uppercase font-bold tracking-wider ${description.trim().split(/\s+/).length >= 300 ? 'text-green-500' : 'text-orange-500'}`}>
                                            {description.trim() ? description.trim().split(/\s+/).length : 0} Palabras (Mín. Sugerido: 300)
                                        </span>
                                    </div>
                                    <Textarea id="desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="Beneficios, materiales, instrucciones…" className="rounded-xl min-h-[100px] resize-none" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="seoDesc" className="flex items-center gap-2">
                                        SEO Meta Description <span className="text-[10px] text-gray-400 font-normal">(Opcional)</span>
                                    </Label>
                                    <Textarea id="seoDesc" value={seoMetaDescription} onChange={e => setSeoMetaDescription(e.target.value)} placeholder="Descripción directa para Google (Si está vacío, usará la Descripción Larga)" className="rounded-xl min-h-[60px] resize-none" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Categoría</Label>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Dog">Perros 🐶</SelectItem>
                                            <SelectItem value="Cat">Gatos 🐱</SelectItem>
                                            <SelectItem value="Both">Ambos 🐶🐱</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Multi-Imágenes */}
                        <Card className="border-gray-100 shadow-sm rounded-2xl">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <ImagePlus className="w-5 h-5 text-[#5FAFE3]" /> Imágenes del Producto
                                </CardTitle>
                                <CardDescription>La primera imagen será la principal del catálogo</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Dropzone — acepta múltiples imágenes */}
                                <label className="block cursor-pointer text-center rounded-xl border-2 border-dashed border-gray-200 px-4 py-5 hover:border-[#5FAFE3] hover:bg-blue-50/20 transition-all group">
                                    <ImagePlus className="h-8 w-8 text-gray-300 group-hover:text-[#5FAFE3] mx-auto mb-2 transition-colors" />
                                    <p className="text-sm font-semibold text-gray-500 group-hover:text-[#5FAFE3] transition-colors">Subir imágenes desde dispositivo</p>
                                    <p className="text-xs text-gray-400 mt-1">Puedes seleccionar varias a la vez · Se añaden a la galería</p>
                                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
                                </label>

                                {/* Agregar por URL */}
                                <div className="flex gap-2">
                                    <Input
                                        value={newImageUrl}
                                        onChange={e => setNewImageUrl(e.target.value)}
                                        placeholder="https://ejemplo.com/imagen.jpg"
                                        className="rounded-xl text-sm flex-1"
                                        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addImageUrl(); } }}
                                    />
                                    <Button type="button" onClick={addImageUrl} size="sm" className="rounded-xl px-3" style={{ backgroundColor: "#5FAFE3" }}>
                                        <Plus className="w-4 h-4 text-white" />
                                    </Button>
                                </div>

                                {/* Lista de imágenes (Drag & Drop) */}
                                <SortableImageGallery
                                    images={imageUrls}
                                    onImagesChange={setImageUrls}
                                />
                            </CardContent>
                        </Card>

                        {/* Variantes de Color */}
                        <Card className="border-gray-100 shadow-sm rounded-2xl">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Palette className="w-5 h-5 text-[#FF9800]" /> Variantes de Color
                                </CardTitle>
                                <CardDescription>Agrega colores disponibles con stock y ajuste de precio</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <VariantBulkEditor
                                    variants={variants}
                                    onVariantsChange={setVariants}
                                    basePrice={suggestedPVP}
                                />
                            </CardContent>
                        </Card>

                        {/* Proveedor */}
                        <Card className="border-gray-100 shadow-sm rounded-2xl">
                            <CardHeader><CardTitle className="text-lg">Proveedor</CardTitle></CardHeader>
                            <CardContent className="space-y-5">
                                <div className="grid grid-cols-2 gap-3">
                                    {(["Dropi", "External"] as const).map(type => (
                                        <div
                                            key={type}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${providerType === type ? (type === "Dropi" ? "border-[#5FAFE3] bg-blue-50/50" : "border-[#263238] bg-gray-50") : "border-gray-100 hover:border-gray-200"}`}
                                            onClick={() => setProviderType(type)}
                                        >
                                            <p className="font-bold text-center text-sm text-[#263238]">{type === "Dropi" ? "Dropi" : "Externo"}</p>
                                            <p className="text-[10px] text-gray-400 text-center mt-1">{type === "Dropi" ? "Bodega compartida" : "Bodega propia"}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="sku">SKU Interno</Label>
                                        <Input id="sku" value={sku} onChange={e => setSku(e.target.value)} placeholder="PTR-001" className="rounded-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="dropiId">ID Dropi</Label>
                                        <Input id="dropiId" value={dropiId} onChange={e => setDropiId(e.target.value)} placeholder="dp_8x9a2" className="rounded-xl" disabled={providerType !== "Dropi"} />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label>Pago Contra Entrega (COD)</Label>
                                        <p className="text-xs text-gray-400 mt-0.5">{providerType === "External" ? "No disponible para externos" : "Habilitado para Dropi"}</p>
                                    </div>
                                    <Switch checked={allowsCOD} onCheckedChange={setAllowsCOD} disabled={providerType === "External"} className="data-[state=checked]:bg-[#FF9800]" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Precio & Margen */}
                        <Card className="border-gray-100 shadow-sm rounded-2xl">
                            <CardHeader><CardTitle className="text-lg">Precio & Margen</CardTitle></CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Costo ($ CLP)</Label>
                                        <Input type="number" value={costPrice || ''} onChange={e => setCostPrice(Number(e.target.value))} required className="rounded-xl" min={0} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Margen Neto (%)</Label>
                                        <div className="relative">
                                            <Input type="number" value={margin || ''} onChange={e => setMargin(Number(e.target.value))} className="rounded-xl pr-8" min={0} />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* ── Columna Derecha: Simulador ── */}
                    <div className="space-y-6">
                        <Card className="border-[#5FAFE3]/20 bg-blue-50/10 shadow-sm rounded-2xl">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">📦</span>
                                    <div>
                                        <CardTitle className="text-lg text-[#5FAFE3]">Simulador de Envío</CardTitle>
                                        <CardDescription>Tarifario por comunas de Chile (Starken vs BlueEx)</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                {/* Dimensiones */}
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        { label: "Largo (cm) *", val: length, set: setLength },
                                        { label: "Ancho (cm) *", val: width, set: setWidth },
                                        { label: "Alto (cm) *", val: height, set: setHeight },
                                        { label: "Peso (kg) *", val: physicalWeight, set: setPhysicalWeight, accent: true },
                                    ].map(({ label, val, set, accent }) => (
                                        <div key={label} className="space-y-1.5 text-center">
                                            <Label className={`text-[10px] uppercase tracking-wider ${accent ? "text-[#FF9800] font-bold" : "text-gray-500"}`}>{label}</Label>
                                            <Input type="number" step={accent ? "0.01" : "any"} value={val || ''} onChange={e => set(Number(e.target.value))} required className={`rounded-lg text-center bg-white ${accent ? "font-bold" : ""}`} min={0} />
                                        </div>
                                    ))}
                                </div>

                                {/* Peso volumétrico */}
                                <div className="bg-white p-3 rounded-xl border border-blue-100 flex justify-between items-center shadow-sm">
                                    <span className="text-sm text-gray-600">Peso Volumétrico:</span>
                                    <span className="font-mono font-bold text-[#263238]">{volWeight.toFixed(2)} Kg</span>
                                </div>
                                <p className="text-[10px] text-center text-gray-400">
                                    Aplica el mayor: {physicalWeight}kg físico vs {volWeight.toFixed(2)}kg vol.<br />
                                    <b>Peso a tarificar: {applicableWeight.toFixed(2)}kg</b>
                                </p>

                                <Separator className="bg-blue-100" />

                                {/* Selectores de comunas */}
                                <div className="flex gap-3">
                                    <ComunaCombobox label="📍 Origen" value={comunaOrigen} onChange={setComunaOrigen} />
                                    <div className="flex items-end pb-2 text-gray-400">→</div>
                                    <ComunaCombobox label="📦 Destino" value={comunaDestino} onChange={setComunaDestino} />
                                </div>

                                {/* Indicador de zona y factor */}
                                <div className="bg-white border border-blue-100 rounded-xl p-3 text-xs text-gray-500 flex justify-between items-center">
                                    <span>Zona: <b>{origenZone}</b> → <b>{destinoZone}</b></span>
                                    <span className="font-mono font-bold text-[#5FAFE3]">Factor: x{factor.toFixed(1)}</span>
                                </div>

                                {/* Comparativa couriers */}
                                <div className="space-y-3">
                                    <Label className="text-sm font-bold text-[#263238]">Comparativa de Couriers</Label>
                                    {[
                                        { key: "Blue" as const, label: "Blue Express", cost: blueExpressCost, color: "#0a1f44", formula: "3200 + (Peso × 800) × Factor" },
                                        { key: "Starken" as const, label: "Starken", cost: starkenCost, color: "#cc0000", formula: "3500 + (Peso × 950) × Factor" },
                                    ].map(({ key, label, cost, color, formula }) => (
                                        <div
                                            key={key}
                                            className="p-4 rounded-xl border-2 flex justify-between items-center cursor-pointer transition-all bg-white"
                                            style={selectedCourier === key ? { borderColor: color, boxShadow: `0 0 0 3px ${color}18` } : { borderColor: "#e5e7eb" }}
                                            onClick={() => setSelectedCourier(key)}
                                        >
                                            <div>
                                                <p className="font-extrabold" style={{ color }}>{label}</p>
                                                <p className="text-[10px] text-gray-400 mt-0.5">{formula}</p>
                                            </div>
                                            <span className="text-lg font-bold" style={{ color }}>${cost.toLocaleString("es-CL")}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Resumen Rentabilidad */}
                        <Card className="border-[#FF9800] bg-orange-50/40 shadow-md rounded-2xl overflow-hidden">
                            <div className="bg-[#FF9800] h-1 w-full" />
                            <CardHeader className="pb-3">
                                <CardTitle className="text-xl text-[#263238] font-extrabold">Resumen de Rentabilidad</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 pb-6">
                                {[
                                    { label: "Costo Producto:", value: `$${costPrice.toLocaleString("es-CL")}`, c: "" },
                                    { label: `Margen (${margin}%):`, value: `+ $${Math.round(costPrice * margin / 100).toLocaleString("es-CL")}`, c: "text-green-600" },
                                    { label: `Envío (${selectedCourier}):`, value: `$${selectedShippingCost.toLocaleString("es-CL")} (Por Cobrar)`, c: "text-gray-400 text-xs font-normal" },
                                ].map(({ label, value, c }) => (
                                    <div key={label} className="flex justify-between items-center text-sm border-b border-orange-100 pb-2">
                                        <span className="text-gray-600 flex-1">{label}</span>
                                        <span className={`font-mono font-semibold text-right ${c}`}>{value}</span>
                                    </div>
                                ))}
                                <div className="pt-4 flex flex-col items-center">
                                    <span className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-1">PVP Sugerido</span>
                                    <span className="text-5xl font-extrabold text-[#263238] tracking-tight">
                                        ${suggestedPVP.toLocaleString("es-CL")}
                                    </span>
                                </div>
                                {variants.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-orange-100">
                                        <p className="text-xs text-gray-500 font-semibold mb-2">Precios por variante:</p>
                                        {variants.map((v, i) => (
                                            <div key={i} className="flex justify-between text-xs py-0.5">
                                                <span className="text-gray-600">{v.color}</span>
                                                <span className="font-mono font-bold">${(suggestedPVP + v.priceAdjustment).toLocaleString("es-CL")}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Auditor SEO */}
                        <SEOAuditor
                            title={name}
                            description={seoMetaDescription || description.slice(0, 160)}
                            imageUrl={imageUrls[0] || imagePreview || undefined}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-5 border-t border-gray-100">
                    <button type="button" onClick={() => router.push("/admin/products")} className="text-sm text-gray-400 hover:text-gray-700 transition-colors px-4 py-2 rounded-xl hover:bg-gray-100">
                        Cancelar
                    </button>
                    <Button
                        type="submit"
                        disabled={loading || suggestedPVP <= 0}
                        className="text-white font-extrabold px-10 py-6 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all"
                        style={{ backgroundColor: "#5FAFE3" }}
                    >
                        {loading ? "Guardando…" : mode === "edit" ? "Guardar Cambios" : "Crear Producto"}
                    </Button>
                </div>
            </form>
        </>
    );
}
