"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit2, Trash2, Search, Filter, CheckSquare, Trash } from "lucide-react";
import { deleteProduct, deleteProductsBulk } from "./actions";

type Product = {
    id: string;
    name: string;
    sku: string | null;
    price: number;
    sellPrice: number | null;
    imageUrl: string | null;
    image?: string | null;
    category: string;
    providerType: string;
    provider: { name: string };
};

const CATEGORY_LABELS: Record<string, string> = {
    Dog: "🐶 Perros",
    Cat: "🐱 Gatos",
    Both: "🐾 Ambos",
};

const CATEGORY_COLORS: Record<string, string> = {
    Dog: "bg-orange-100 text-orange-700",
    Cat: "bg-purple-100 text-purple-700",
    Both: "bg-blue-100 text-blue-700",
};

export default function ProductsTable({ products }: { products: Product[] }) {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [deleting, setDeleting] = useState<string | null>(null);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [bulkWorking, setBulkWorking] = useState(false);

    const filtered = useMemo(() => {
        return products.filter((p) => {
            const matchSearch =
                p.name.toLowerCase().includes(search.toLowerCase()) ||
                (p.sku ?? "").toLowerCase().includes(search.toLowerCase());
            const matchCategory =
                categoryFilter === "All" || p.category === categoryFilter;
            return matchSearch && matchCategory;
        });
    }, [products, search, categoryFilter]);

    const allFilteredSelected = filtered.length > 0 && filtered.every((p) => selected.has(p.id));

    const toggleSelectAll = () => {
        if (allFilteredSelected) {
            setSelected(new Set());
        } else {
            setSelected(new Set(filtered.map((p) => p.id)));
        }
    };

    const toggleSelect = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return;
        setDeleting(id);
        try {
            const result = await deleteProduct(id);
            if (result.success) {
                router.refresh();
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch {
            alert("Error al intentar eliminar.");
        } finally {
            setDeleting(null);
        }
    };

    const handleBulkDelete = async (deleteAll = false) => {
        const ids = deleteAll ? [] : Array.from(selected);
        const count = deleteAll ? products.length : ids.length;
        if (!confirm(`¿Eliminar ${deleteAll ? "todos los" : count} productos? Esta acción es irreversible.`)) return;

        setBulkWorking(true);
        try {
            const result = await deleteProductsBulk(ids);
            if (result.success) {
                setSelected(new Set());
                router.refresh();
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch {
            alert("Error al intentar eliminar en lote.");
        } finally {
            setBulkWorking(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Filtros */}
            <div className="p-5 border-b border-gray-100 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o SKU…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5FAFE3]/30 focus:border-[#5FAFE3] transition-all bg-gray-50"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    {["All", "Dog", "Cat", "Both"].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${categoryFilter === cat
                                ? "text-white shadow-sm"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                }`}
                            style={categoryFilter === cat ? { backgroundColor: "#5FAFE3" } : {}}
                        >
                            {cat === "All" ? "Todos" : CATEGORY_LABELS[cat]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Barra de acciones masivas */}
            {(selected.size > 0 || products.length > 0) && (
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/70 flex flex-wrap items-center gap-3">
                    <span className="text-xs font-semibold text-gray-500">
                        {selected.size > 0 ? `${selected.size} seleccionados` : "Acciones masivas"}
                    </span>
                    {selected.size > 0 && (
                        <button
                            onClick={() => handleBulkDelete(false)}
                            disabled={bulkWorking}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                            <Trash className="w-3.5 h-3.5" />
                            Eliminar seleccionados ({selected.size})
                        </button>
                    )}
                    <button
                        onClick={() => handleBulkDelete(true)}
                        disabled={bulkWorking || products.length === 0}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 text-xs font-bold rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 ml-auto"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Eliminar todos ({products.length})
                    </button>
                </div>
            )}

            {/* Tabla */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 text-left">
                            <th className="px-4 py-3.5">
                                <input
                                    type="checkbox"
                                    checked={allFilteredSelected}
                                    onChange={toggleSelectAll}
                                    className="w-4 h-4 rounded accent-[#5FAFE3] cursor-pointer"
                                    title="Seleccionar todos"
                                />
                            </th>
                            <th className="px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Imagen</th>
                            <th className="px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Nombre</th>
                            <th className="px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider">SKU</th>
                            <th className="px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Proveedor</th>
                            <th className="px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Precio</th>
                            <th className="px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Categoría</th>
                            <th className="px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="text-center py-16 text-gray-400">
                                    <div className="text-4xl mb-2">📦</div>
                                    <p className="font-medium">No hay productos que coincidan</p>
                                </td>
                            </tr>
                        ) : (
                            filtered.map((product) => {
                                const imgSrc = product.imageUrl || product.image;
                                const displayPrice = product.sellPrice ?? product.price;
                                const isSelected = selected.has(product.id);
                                return (
                                    <tr
                                        key={product.id}
                                        className={`hover:bg-gray-50/50 transition-colors group ${isSelected ? "bg-blue-50/40" : ""}`}
                                    >
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleSelect(product.id)}
                                                className="w-4 h-4 rounded accent-[#5FAFE3] cursor-pointer"
                                            />
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-150">
                                                {imgSrc ? (
                                                    <img src={imgSrc} alt={product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <p className="font-semibold text-[#263238] line-clamp-1">{product.name}</p>
                                        </td>
                                        <td className="px-5 py-3 text-gray-500 font-mono text-xs">
                                            {product.sku || <span className="text-gray-300">—</span>}
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${product.providerType === "Dropi" ? "bg-[#5FAFE3]/10 text-[#5FAFE3]" : "bg-gray-100 text-gray-600"}`}>
                                                {product.provider.name}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className="font-bold text-[#263238]">
                                                ${displayPrice.toLocaleString("es-CL")}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${CATEGORY_COLORS[product.category] || "bg-gray-100 text-gray-600"}`}>
                                                {CATEGORY_LABELS[product.category] || product.category}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/products/${product.id}/edit`}
                                                    className="p-2 rounded-lg text-gray-400 hover:text-[#5FAFE3] hover:bg-blue-50 transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product.id, product.name)}
                                                    disabled={deleting === product.id}
                                                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            {filtered.length > 0 && (
                <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400 flex items-center justify-between">
                    <span>Mostrando {filtered.length} de {products.length} productos</span>
                    {selected.size > 0 && (
                        <span className="flex items-center gap-1 text-[#5FAFE3] font-semibold">
                            <CheckSquare className="w-3.5 h-3.5" /> {selected.size} seleccionados
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
