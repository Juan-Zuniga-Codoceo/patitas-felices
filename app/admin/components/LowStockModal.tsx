"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, AlertTriangle } from "lucide-react";
import Link from "next/link";

type LowStockVariantType = {
    id: string;
    stock: number;
    color: string;
    product: {
        id: string;
        name: string;
    }
};

export function LowStockModal({
    children,
    variants,
}: {
    children: React.ReactNode;
    variants: LowStockVariantType[];
}) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center text-brand-graphite font-bold">
                        <AlertTriangle className="w-5 h-5 text-brand-orange mr-2" />
                        Alerta de Inventario Crítico
                    </DialogTitle>
                </DialogHeader>
                <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                    {variants.map((v) => (
                        <div key={v.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                            <div>
                                <p className="text-sm font-bold text-gray-800">{v.product.name}</p>
                                <p className="text-xs text-gray-500 mt-0.5">Variante: <span className="font-semibold">{v.color}</span></p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
                                    {v.stock} ud.
                                </span>
                                <Link onClick={() => setOpen(false)} href={`/admin/products/${v.product.id}/edit`}>
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-brand-blue hover:text-blue-700 hover:bg-blue-50">
                                        <ExternalLink className="w-4 h-4" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
