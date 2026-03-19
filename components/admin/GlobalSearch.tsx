"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { globalSearch, SearchResult } from "@/app/admin/actions/search";
import { ShoppingCart, Package, Building2, Search, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce"; // Asumiendo que existe o lo crearemos instantes después
import { Badge } from "@/components/ui/badge";

export function GlobalSearch() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const debouncedQuery = useDebounce(query, 300);
    const [results, setResults] = useState<SearchResult>({ orders: [], products: [], providers: [] });
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    useEffect(() => {
        async function fetchResults() {
            if (debouncedQuery.length < 2) {
                setResults({ orders: [], products: [], providers: [] });
                return;
            }

            setIsLoading(true);
            try {
                const data = await globalSearch(debouncedQuery);
                setResults(data);
            } catch (error) {
                console.error("Error searching:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchResults();
    }, [debouncedQuery]);

    const handleSelect = (path: string) => {
        setOpen(false);
        router.push(path);
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors group mb-4"
            >
                <Search className="w-4 h-4 text-gray-400 group-hover:text-brand-blue transition-colors" />
                <span className="flex-1 text-left">Buscar localmente...</span>
                <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-white px-1.5 font-mono text-[10px] font-medium text-gray-500 opacity-100 sm:flex shadow-sm">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>

            <CommandDialog open={open} onOpenChange={setOpen} shouldFilter={false}>
                <CommandInput
                    placeholder="Busca órdenes (RUT, ID), productos o proveedores..."
                    value={query}
                    onValueChange={setQuery}
                />
                <CommandList>
                    <CommandEmpty>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-6 text-brand-blue">
                                <Loader2 className="h-6 w-6 animate-spin" />
                                <span className="ml-2">Buscando en Patitas Felices...</span>
                            </div>
                        ) : (
                            query.length >= 2 ? "No se encontraron resultados." : "Escribe al menos 2 caracteres para buscar."
                        )}
                    </CommandEmpty>

                    {!isLoading && results.orders.length > 0 && (
                        <CommandGroup heading="Órdenes Recientes">
                            {results.orders.map((order) => (
                                <CommandItem
                                    key={order.id}
                                    onSelect={() => handleSelect(`/admin/orders/${order.id}`)}
                                    className="flex items-center justify-between py-3 cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-md bg-blue-50 text-brand-blue">
                                            <ShoppingCart className="h-4 w-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-brand-graphite">{order.customerName}</span>
                                            <span className="text-xs text-gray-500">#{order.id.slice(-6).toUpperCase()}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-semibold text-gray-700">${order.totalPrice.toLocaleString("es-CL")}</span>
                                        <Badge variant="outline" className={
                                            order.paymentStatus === 'PAID' ? 'bg-green-50 text-green-700 border-green-200' :
                                                order.paymentStatus === 'FAILED' ? 'bg-red-50 text-red-700 border-red-200' :
                                                    'bg-orange-50 text-orange-700 border-orange-200'
                                        }>
                                            {order.paymentStatus}
                                        </Badge>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    {!isLoading && results.products.length > 0 && (
                        <CommandGroup heading="Productos del Catálogo">
                            {results.products.map((product) => (
                                <CommandItem
                                    key={product.id}
                                    onSelect={() => handleSelect(`/admin/products/${product.id}/edit`)}
                                    className="flex items-center justify-between py-3 cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-md bg-orange-50 text-brand-orange">
                                            <Package className="h-4 w-4" />
                                        </div>
                                        <span className="font-medium text-brand-graphite">{product.name}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700">${product.price.toLocaleString("es-CL")}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    {!isLoading && results.providers.length > 0 && (
                        <CommandGroup heading="Proveedores Logísticos">
                            {results.providers.map((provider) => (
                                <CommandItem
                                    key={provider.id}
                                    onSelect={() => handleSelect(`/admin/providers`)}
                                    className="flex items-center gap-3 py-3 cursor-pointer"
                                >
                                    <div className="p-2 rounded-md bg-gray-100 text-gray-600">
                                        <Building2 className="h-4 w-4" />
                                    </div>
                                    <span className="font-medium text-brand-graphite">{provider.name}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                </CommandList>
            </CommandDialog>
        </>
    );
}
