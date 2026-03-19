"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { COMUNAS, type Comuna } from "@/lib/comunas";

interface ComunaComboboxProps {
    value: string;
    onChange: (value: string, zona: string) => void;
}

export function ComunaCombobox({ value, onChange }: ComunaComboboxProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");

    const filtered = query.length > 0
        ? COMUNAS.filter(c =>
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            c.region.toLowerCase().includes(query.toLowerCase())
        )
        : COMUNAS;

    const selected = COMUNAS.find(c => c.name === value);

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white hover:border-[#5FAFE3] focus:outline-none focus:ring-2 focus:ring-[#5FAFE3]/30 transition-all"
            >
                <span className={selected ? "text-[#263238]" : "text-gray-400"}>
                    {selected ? `${selected.name} (${selected.region})` : "Selecciona tu comuna..."}
                </span>
                <ChevronsUpDown className="h-4 w-4 text-gray-400 shrink-0" />
            </button>

            {open && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                    <div className="p-2 border-b border-gray-100">
                        <input
                            autoFocus
                            type="text"
                            placeholder="Buscar comuna o región..."
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-gray-50 rounded-lg outline-none focus:bg-white border border-transparent focus:border-[#5FAFE3] transition"
                        />
                    </div>
                    <div className="max-h-56 overflow-y-auto">
                        {filtered.length === 0 ? (
                            <p className="px-4 py-3 text-sm text-gray-400">Sin resultados</p>
                        ) : (
                            filtered.map((comuna: Comuna) => (
                                <button
                                    key={comuna.name}
                                    type="button"
                                    onClick={() => {
                                        onChange(comuna.name, comuna.zone);
                                        setOpen(false);
                                        setQuery("");
                                    }}
                                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-[#5FAFE3]/10 transition-colors text-left"
                                >
                                    <div>
                                        <span className="font-medium text-[#263238]">{comuna.name}</span>
                                        <span className="text-gray-400 ml-2 text-xs">{comuna.region}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${comuna.zone === "RM" ? "bg-blue-100 text-blue-600" :
                                                comuna.zone === "Norte" ? "bg-orange-100 text-orange-600" :
                                                    comuna.zone === "Sur" ? "bg-green-100 text-green-600" :
                                                        "bg-red-100 text-red-600"
                                            }`}>{comuna.zone}</span>
                                        {value === comuna.name && <Check className="w-4 h-4 text-[#5FAFE3]" />}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
