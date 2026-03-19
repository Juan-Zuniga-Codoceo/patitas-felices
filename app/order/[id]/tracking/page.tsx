import { getTrackingOrder } from "./actions";
import { notFound } from "next/navigation";
import { TrackingClient } from "./TrackingClient";

export default async function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const orderData = await getTrackingOrder(id);

    if (!orderData) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50/50 py-12 md:py-20 font-sans">
            <div className="max-w-4xl mx-auto px-4 md:px-8">
                {/* Header Premium */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-5xl font-black text-[#263238] tracking-tight mb-4 font-poppins">
                        Sigue tu Pedido
                    </h1>
                    <p className="text-base md:text-lg text-gray-500 font-medium">
                        Hola <span className="text-[#5FAFE3] font-bold">{orderData.customerName}</span>, aquí puedes ver en qué etapa está el amor para tus patitas. 🐾
                    </p>
                    <p className="text-sm font-mono text-gray-400 mt-2">
                        Orden #{orderData.id.slice(-8).toUpperCase()}
                    </p>
                </div>

                {/* Main Client Interface (Stepper and Maps) */}
                <TrackingClient order={orderData} />
            </div>
        </div>
    );
}
