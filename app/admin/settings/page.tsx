import { Settings } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-black text-[#263238]">Configuración</h1>
                <p className="text-sm text-gray-500 mt-1">Ajustes generales del panel administrativo</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                <div className="w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ backgroundColor: "#263238" }}>
                    <Settings className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-xl font-black text-[#263238] mb-2">Módulo en Desarrollo</h2>
                <p className="text-gray-400 text-sm max-w-sm mx-auto">
                    Aquí podrás configurar todos los aspectos de tu tienda y el panel de administración.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    {["Configuración de tienda", "Integración Dropi", "Notificaciones", "Métodos de pago"].map((f) => (
                        <span key={f} className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-semibold text-gray-500">
                            {f}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
