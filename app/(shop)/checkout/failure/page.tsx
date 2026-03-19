import Link from "next/link";
import { XCircle } from "lucide-react";

export default async function CheckoutFailurePage({
    searchParams,
}: {
    searchParams: Promise<{ orderId?: string }>;
}) {
    const { orderId } = await searchParams;

    return (
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-10 max-w-md w-full text-center">
                <div className="w-24 h-24 rounded-3xl mx-auto mb-6 flex items-center justify-center bg-red-500">
                    <XCircle className="w-12 h-12 text-white" />
                </div>

                <h1 className="text-3xl font-black text-[#263238] mb-2">Pago no completado</h1>

                <p className="text-gray-500 text-sm mb-2">
                    Tu pago no pudo procesarse. No se realizó ningún cobro.
                </p>

                {orderId && (
                    <div className="bg-gray-50 rounded-2xl p-4 my-6">
                        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">N° de Orden</p>
                        <p className="font-mono text-sm font-bold text-[#263238] break-all">{orderId}</p>
                    </div>
                )}

                <div className="space-y-3 mt-6">
                    <Link
                        href="/checkout"
                        className="w-full inline-block py-3 rounded-xl font-bold text-white text-sm transition hover:opacity-90"
                        style={{ backgroundColor: "#FF9800" }}
                    >
                        Reintentar pago
                    </Link>
                    <Link
                        href="/"
                        className="w-full inline-block py-3 rounded-xl font-bold text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 transition"
                    >
                        Volver al inicio
                    </Link>
                </div>

                <p className="text-xs text-gray-400 mt-4">
                    Si el problema persiste, contáctanos en hola@patitasfelices.cl
                </p>
            </div>
        </div>
    );
}
