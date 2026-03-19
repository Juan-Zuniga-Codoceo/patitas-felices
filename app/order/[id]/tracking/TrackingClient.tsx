"use client";

import { motion } from "framer-motion";
import { Package, Truck, CheckCircle2, Box, ExternalLink, MapPin } from "lucide-react";
import type { TrackingData } from "./actions";
import dynamic from "next/dynamic";

const TrackingMap = dynamic<{ comuna: string }>(() => import("./TrackingMap"), { ssr: false });

const STATUS_STAGES = ["CREATED", "PROCESSING", "SHIPPED", "DELIVERED"];

export function TrackingClient({ order }: { order: TrackingData }) {
    const isVRegion = order.comuna === "Viña del Mar" || order.comuna === "Quilpué";

    // Determine texts based on stage
    const getStageInfo = (stage: string) => {
        switch (stage) {
            case "CREATED":
                return {
                    title: "Pedido Confirmado",
                    desc: "Estamos preparando el amor para tus patitas.",
                    icon: Box
                };
            case "PROCESSING":
                return {
                    title: "En Preparación",
                    desc: "Tu pedido está siendo procesado en nuestra bodega central de Santiago.",
                    icon: Package
                };
            case "SHIPPED":
                return {
                    title: isVRegion ? "En Camino a la V Región" : "En Reparto",
                    desc: isVRegion
                        ? `Tu paquete va rumbo a ${order.comuna}. \n¡Pronto estará contigo!`
                        : `Tu pedido ha sido despachado hacia ${order.comuna}.`,
                    icon: Truck
                };
            case "DELIVERED":
                return {
                    title: "Entregado",
                    desc: "¡Esperamos que tus mascotas lo disfruten! 🐾",
                    icon: CheckCircle2
                };
            default:
                return { title: "", desc: "", icon: Box };
        }
    };

    const currentStageIndex = STATUS_STAGES.indexOf(order.status);

    // Courier Detection
    const trackingCode = order.courierTrackingCode;
    const isBlueExpress = trackingCode && (trackingCode.length === 12 || trackingCode.startsWith("1")); // Dummy logic, BlueExpress often 12-15 digits
    const isStarken = trackingCode && !isBlueExpress;

    const courierLink = trackingCode
        ? isBlueExpress
            ? `https://www.blue.cl/?tracking=${trackingCode}`
            : `https://www.starken.cl/seguimiento?codigo=${trackingCode}`
        : null;

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Stepper Column */}
            <div className="flex-1 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 relative">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#5FAFE3] to-[#FF9800] rounded-t-3xl opacity-80" />
                <h2 className="text-xl font-black text-[#263238] mb-8 flex items-center gap-2">
                    Estado Actual
                </h2>

                <div className="relative">
                    {/* Stepper Line */}
                    <div className="absolute left-[20px] top-6 bottom-6 w-1 bg-gray-100 rounded-full md:left-auto md:top-[20px] md:bottom-auto md:w-full md:h-1 md:-ml-0 z-0">
                        <motion.div
                            className="bg-[#5FAFE3] absolute top-0 left-0 w-full rounded-full md:h-full"
                            initial={{ height: "0%", width: "0%" }}
                            animate={{
                                height: "100%", // Controlled via CSS in responsive, or just 100% since parent limits it
                            }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            style={{
                                height: `calc(${currentStageIndex / (STATUS_STAGES.length - 1)} * 100%)`
                            }}
                        />
                    </div>

                    <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-4 relative z-10">
                        {STATUS_STAGES.map((stage, idx) => {
                            const isCompleted = idx <= currentStageIndex;
                            const isCurrent = idx === currentStageIndex;
                            const stageInfo = getStageInfo(stage);
                            const Icon = stageInfo.icon;

                            return (
                                <div key={stage} className="flex md:flex-col items-start md:items-center gap-4 md:flex-1">
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: idx * 0.2 }}
                                        className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center border-4 transition-colors duration-500
                                            ${isCurrent ? "bg-[#5FAFE3] border-blue-100 text-white shadow-lg scale-110"
                                                : isCompleted ? "bg-[#5FAFE3] border-[#5FAFE3] text-white"
                                                    : "bg-white border-gray-200 text-gray-300"}`}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </motion.div>

                                    <div className="flex flex-col md:text-center pt-2 md:pt-0">
                                        <motion.h3
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.2 + 0.1 }}
                                            className={`font-black uppercase tracking-wide text-xs md:text-sm
                                                ${isCurrent ? "text-[#5FAFE3]" : isCompleted ? "text-[#263238]" : "text-gray-400"}`}
                                        >
                                            {stageInfo.title}
                                        </motion.h3>
                                        {(isCurrent || isCompleted) && (
                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="mt-1 text-xs md:text-sm text-gray-500 font-medium whitespace-pre-wrap leading-relaxed max-w-[200px] md:mx-auto"
                                            >
                                                {stageInfo.desc}
                                            </motion.p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Tracking Link (Courier) */}
                {trackingCode && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                                <Truck className="w-5 h-5 text-[#FF9800]" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-[#263238]">Código de Seguimiento Oficial</p>
                                <p className="text-xs font-mono font-medium text-gray-500">#{trackingCode}</p>
                            </div>
                        </div>
                        {courierLink && (
                            <a
                                href={courierLink}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-[#FF9800] hover:bg-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 w-full sm:w-auto justify-center shadow-md shadow-orange-500/20"
                            >
                                Rastreo {isBlueExpress ? "Blue Express" : "Starken"} <ExternalLink className="w-4 h-4" />
                            </a>
                        )}
                    </motion.div>
                )}
            </div>

            {/* Sidebar (Map & Summary) */}
            <div className="lg:w-80 flex flex-col gap-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-black text-[#263238] mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-[#5FAFE3]" /> Destino
                    </h3>

                    <div className="rounded-2xl overflow-hidden border border-gray-200 h-[200px] bg-gray-50 mb-4 related relative">
                        <TrackingMap comuna={order.comuna} />
                    </div>

                    <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-[#5FAFE3] uppercase tracking-wider">
                            Destino Final
                        </span>
                        <span className="text-sm font-semibold text-[#263238]">{order.comuna}</span>
                        <span className="text-xs text-gray-500">
                            {order.shippingMethod === "domicilio" ? "Despacho a Domicilio" : "Retiro en Sucursal"}
                        </span>
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-black text-[#263238] mb-4 text-sm">Resumen de Productos</h3>
                    <div className="space-y-3">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-start gap-3 border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                                <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-gray-800 line-clamp-2">{item.productName}</span>
                                    {item.selectedColor && (
                                        <span className="text-[10px] text-gray-500 mt-0.5">Color: {item.selectedColor}</span>
                                    )}
                                </div>
                                <span className="text-xs font-bold text-gray-400 shrink-0">x{item.quantity}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
