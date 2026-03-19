"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { upsertProvider } from "./actions";
import { Label } from "@/components/ui/label";

export function ProviderModal({ isOpen, setIsOpen, provider, onSave }: { isOpen: boolean, setIsOpen: (o: boolean) => void, provider?: any, onSave: () => void }) {
    const [name, setName] = useState("");
    const [type, setType] = useState("Local");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [apiKey, setApiKey] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (provider) {
                setName(provider.name || "");
                setType(provider.type || "Local");
                setEmail(provider.email || "");
                setPhone(provider.phone || "");
                setApiKey(provider.apiKey || "");
            } else {
                setName("");
                setType("Local");
                setEmail("");
                setPhone("");
                setApiKey("");
            }
        }
    }, [isOpen, provider]);

    const handleSave = async () => {
        if (!name.trim()) return;
        setIsLoading(true);
        const result = await upsertProvider({
            id: provider?.id,
            name,
            type,
            email: type === "Local" ? email : undefined,
            phone: type === "Local" ? phone : undefined,
            apiKey: type === "Dropi" ? apiKey : undefined,
        });
        setIsLoading(false);

        if (result.success) {
            alert("El proveedor se guardó con éxito.");
            setIsOpen(false);
            onSave();
        } else {
            alert("Error: " + result.error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{provider ? "Editar" : "Nuevo"} Proveedor</DialogTitle>
                    <DialogDescription>
                        Configura los datos del catálogo o socio comercial.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Nombre del Proveedor</Label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Dropi Chile / Mascotas Mayorista" />
                    </div>

                    <div className="grid gap-2">
                        <Label>Tipo de Integración</Label>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button
                                type="button"
                                className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${type === 'Local' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setType('Local')}
                            >
                                🏪 Catálogo Local
                            </button>
                            <button
                                type="button"
                                className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${type === 'Dropi' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setType('Dropi')}
                            >
                                📦 Dropi Hub
                            </button>
                        </div>
                    </div>

                    {type === "Dropi" ? (
                        <div className="grid gap-2 animate-in fade-in slide-in-from-top-2">
                            <Label>Dropi API Key / Token</Label>
                            <Input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="dp_sk_xxxxxxxxxxxxxx"
                            />
                            <p className="text-[10px] text-gray-500 mt-1">Clave para sincronización de inventario Dropi.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 animate-in fade-in slide-in-from-top-2">
                            <div className="grid gap-2">
                                <Label>Correo de Contacto</Label>
                                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="pedidos@proveedor.cl" />
                            </div>
                            <div className="grid gap-2">
                                <Label>WhatsApp Asignado</Label>
                                <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+569..." />
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={isLoading || !name.trim()} className="bg-[#263238] hover:bg-[#37474F] text-white">
                        {isLoading ? "Guardando..." : "Guardar Proveedor"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
