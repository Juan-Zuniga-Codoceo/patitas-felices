"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { exportOrdersToExcelData } from "./actions/export";
import { exportToExcel, formatRUT } from "@/lib/excel-utils";
import { toast } from "sonner";
import { format } from "date-fns";

export function ExportButton() {
    const [isPending, startTransition] = useTransition();

    const handleExport = () => {
        startTransition(async () => {
            try {
                const orders = await exportOrdersToExcelData();

                if (!orders || orders.length === 0) {
                    toast.error("No hay órdenes para exportar.");
                    return;
                }

                // Transform data into flat readable array
                const excelData = orders.map((order) => ({
                    "ID Orden": `#${order.id.slice(-6).toUpperCase()}`,
                    "Fecha Creación": format(new Date(order.createdAt), "dd/MM/yyyy HH:mm"),
                    "Cliente": order.customerName,
                    "RUT": formatRUT(order.customerRUT),
                    "Email": order.customerEmail,
                    "Comuna": order.comuna,
                    "Total (CLP)": order.totalPrice,
                    "Costo de Envío": order.shippingCost,
                    "Estado de Pago": order.paymentStatus === "PAID" ? "Pagado" : order.paymentStatus === "FAILED" ? "Fallido" : "Pendiente",
                    "Estado Logístico": order.status,
                }));

                const dateString = format(new Date(), "yyyy-MM-dd");
                exportToExcel(excelData, `Reporte_Ordenes_PatitasFelices_${dateString}`);

                toast.success("Excel generado con éxito");
            } catch (error) {
                console.error("Error formatting export:", error);
                toast.error("Hubo un error al generar el archivo Excel.");
            }
        });
    };

    return (
        <Button
            onClick={handleExport}
            disabled={isPending}
            className="bg-[#FF9800] hover:bg-[#E68A00] text-white font-semibold transition-all flex items-center gap-2 shadow-sm rounded-xl"
        >
            {isPending ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generando...</span>
                </>
            ) : (
                <>
                    <Download className="w-4 h-4" />
                    <span>Exportar a Excel</span>
                </>
            )}
        </Button>
    );
}
