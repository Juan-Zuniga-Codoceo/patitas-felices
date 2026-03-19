"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, X } from "lucide-react";
import { useDebounce } from "use-debounce";
import Link from "next/link";
import { useRouter } from "next/navigation";

type SearchResult = {
    id: string;
    name: string;
    price: number;
    category: string;
    imageUrl: string | null;
};

export function SearchInput() {
    const [query, setQuery] = useState("");
    const [debouncedQuery] = useDebounce(query, 300);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsOpen(false);
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    useEffect(() => {
        if (!debouncedQuery || debouncedQuery.length < 2) {
            setResults([]);
            setIsSearching(false);
            return;
        }

        const fetchResults = async () => {
            setIsSearching(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
                if (res.ok) {
                    const data = await res.json();
                    setResults(data.results || []);
                }
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setIsSearching(false);
            }
        };

        fetchResults();
    }, [debouncedQuery]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && query.trim()) {
            setIsOpen(false);
            router.push(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 w-full max-w-xs transition-all focus-within:ring-2 focus-within:ring-[#5FAFE3]/30 focus-within:bg-white border border-transparent focus-within:border-gray-200">
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    className="bg-transparent border-none outline-none text-sm w-full ml-2 placeholder:text-gray-400 text-gray-700 font-medium"
                />
                {isSearching ? (
                    <Loader2 className="w-4 h-4 text-[#5FAFE3] animate-spin shrink-0" />
                ) : query && (
                    <button onClick={() => { setQuery(""); setResults([]); }} className="shrink-0 p-0.5 hover:bg-gray-200 rounded-full transition">
                        <X className="w-3 h-3 text-gray-400" />
                    </button>
                )}
            </div>

            {/* Dropdown Results */}
            {isOpen && (query.length >= 2) && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    {results.length > 0 ? (
                        <div className="py-2">
                            <p className="px-4 py-2 text-[10px] font-black tracking-widest text-gray-400 uppercase">Resultados ({results.length})</p>
                            {results.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/product/${product.id}`}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition group"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 relative flex items-center justify-center">
                                        {product.imageUrl ? (
                                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                        ) : (
                                            <span className="text-xl">🐾</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-[#263238] truncate group-hover:text-[#5FAFE3] transition-colors">{product.name}</p>
                                        <p className="text-xs font-semibold text-gray-400">${product.price.toLocaleString("es-CL")}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="p-6 text-center text-gray-400">
                            {!isSearching && (
                                <>
                                    <Search className="w-8 h-8 mx-auto text-gray-200 mb-2" />
                                    <p className="text-sm font-medium">No encontramos "{query}"</p>
                                    <p className="text-xs mt-1">Intenta con otra palabra clave 🐶</p>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
