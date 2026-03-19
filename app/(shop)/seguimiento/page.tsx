export const metadata = {
    title: "Seguimiento de Pedido — Patitas Felices",
    description: "Rastrea el estado de tu pedido y obtén el número de seguimiento de Blue Express o Starken.",
    robots: { index: false, follow: false }
};

import { TrackingForm } from "./TrackingForm";
import { NavBar } from "@/components/NavBar";

export default function SeguimientoPage() {
    return (
        <div className="min-h-screen bg-[#fafafa]">
            <NavBar />

            <main className="max-w-xl mx-auto px-5 py-16">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5" style={{ backgroundColor: "#263238" }}>
                        <span className="text-3xl">📦</span>
                    </div>
                    <h1 className="text-3xl font-black text-[#263238] mb-3">Seguimiento de Pedido</h1>
                    <p className="text-gray-500 text-base max-w-md mx-auto">
                        Ingresa el número de orden y el email con el que realizaste tu compra para revisar el estado.
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
                    <TrackingForm />
                </div>
            </main>
        </div>
    );
}
