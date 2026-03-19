"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search, Globe, AlertTriangle, CheckCircle2 } from "lucide-react";

interface SEOAuditorProps {
    title: string;
    description: string;
    imageUrl?: string;
    baseUrl?: string;
}

export function SEOAuditor({
    title,
    description,
    imageUrl,
    baseUrl = "https://patitasfelices.cl"
}: SEOAuditorProps) {

    const formattedTitle = title.trim() ? `${title} | Patitas Felices` : "Título del Producto | Patitas Felices";
    const titleLength = formattedTitle.length;
    const isTitleOptimal = titleLength > 10 && titleLength <= 75;

    const formattedDesc = description.trim() || "Añade una descripción fascinante para que tus clientes sepan exactamente por qué necesitan este producto imperdible.";
    const descLength = formattedDesc.length;
    const isDescOptimal = descLength > 50 && descLength <= 200;

    return (
        <Card className="border-gray-100 shadow-sm rounded-2xl sticky top-6">
            <CardHeader className="pb-3 border-b border-gray-50">
                <CardTitle className="text-sm font-black flex items-center gap-2 text-[#263238]">
                    <Search className="w-4 h-4 text-[#5FAFE3]" /> Auditor SEO en Vivo
                </CardTitle>
                <CardDescription className="text-xs">Previsualiza cómo lucirá tu producto en Google y Redes Sociales.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-6">

                {/* ── Google Search Preview ── */}
                <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        <Globe className="w-3.5 h-3.5" /> Google Snippet
                    </div>
                    <div className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm font-sans">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                                <img src="/icon.png" alt="Favicon" className="w-4 h-4 object-contain" />
                            </div>
                            <div>
                                <p className="text-[12px] text-[#202124] leading-tight">Patitas Felices</p>
                                <p className="text-[11px] text-[#4d5156] leading-tight flex items-center gap-1">
                                    {baseUrl} <span className="text-gray-300">›</span> producto
                                </p>
                            </div>
                        </div>
                        <h3 className="text-[18px] text-[#1a0dab] cursor-pointer hover:underline mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
                            {formattedTitle}
                        </h3>
                        {imageUrl && (
                            <div className="float-right ml-2 mb-1 border border-gray-100 rounded-md overflow-hidden bg-gray-50 w-24 h-24">
                                <img src={imageUrl} alt="SEO Thumbnail" className="w-full h-full object-cover" />
                            </div>
                        )}
                        <p className="text-[13px] text-[#4d5156] leading-snug break-words">
                            {formattedDesc.slice(0, 160)}{descLength > 160 ? "..." : ""}
                        </p>
                    </div>
                </div>

                {/* ── Auditoría de Longitud ── */}
                <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 font-medium">Longitud del Título</span>
                        <div className="flex items-center gap-2">
                            <span className={`font-mono font-bold ${isTitleOptimal ? 'text-green-600' : 'text-orange-500'}`}>
                                {titleLength}/75
                            </span>
                            {isTitleOptimal ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <AlertTriangle className="w-4 h-4 text-orange-500" />}
                        </div>
                    </div>
                    {/* Progress Bar Título */}
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all ${titleLength === 0 || title.trim() === '' ? 'bg-red-500' : isTitleOptimal ? 'bg-green-500' : titleLength > 75 ? 'bg-orange-500' : 'bg-yellow-400'}`}
                            style={{ width: `${Math.min((titleLength / 75) * 100, 100)}%` }}
                        />
                    </div>

                    <div className="flex justify-between items-center text-sm pt-2">
                        <span className="text-gray-600 font-medium">Longitud de Descripción</span>
                        <div className="flex items-center gap-2">
                            <span className={`font-mono font-bold ${isDescOptimal ? 'text-green-600' : 'text-orange-500'}`}>
                                {descLength}/200
                            </span>
                            {isDescOptimal ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <AlertTriangle className="w-4 h-4 text-orange-500" />}
                        </div>
                    </div>
                    {/* Progress Bar Desc */}
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all ${description.trim() === '' ? 'bg-red-500' : isDescOptimal ? 'bg-green-500' : descLength > 200 ? 'bg-orange-500' : 'bg-yellow-400'}`}
                            style={{ width: `${Math.min((descLength / 200) * 100, 100)}%` }}
                        />
                    </div>

                    {!imageUrl && (
                        <div className="flex items-start gap-2 text-xs text-orange-600 bg-orange-50 p-2 rounded-lg mt-3">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <p>Falta la imagen principal. Esto disminuirá radicalmente el CTR (Click-Through Rate) en Redes Sociales.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
