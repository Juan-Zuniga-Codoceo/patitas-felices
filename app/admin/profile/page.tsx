import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Lock, User, Mail, Shield } from "lucide-react";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    const user = session?.user as any;
    const name = user?.name ?? "Administrador";
    const email = user?.email ?? "—";
    const role = user?.role ?? "ADMIN";
    const initials = name
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-black text-[#263238]">Mi Perfil</h1>
                <p className="text-sm text-gray-500 mt-1">Información de tu cuenta de administrador</p>
            </div>

            {/* Tarjeta de Perfil */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="h-24 w-full" style={{ background: "linear-gradient(135deg, #5FAFE3 0%, #263238 100%)" }} />
                <div className="px-8 pb-8">
                    <div className="flex items-end gap-5 -mt-10 mb-6">
                        <div
                            className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-lg border-4 border-white"
                            style={{ backgroundColor: "#FF9800" }}
                        >
                            {initials}
                        </div>
                        <div className="pb-1">
                            <h2 className="text-xl font-black text-[#263238]">{name}</h2>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#5FAFE3]/10 text-[#5FAFE3]">
                                <Shield className="w-3 h-3" />
                                {role}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center border border-gray-100">
                                <User className="w-4 h-4 text-[#5FAFE3]" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Nombre</p>
                                <p className="font-bold text-[#263238]">{name}</p>
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center border border-gray-100">
                                <Mail className="w-4 h-4 text-[#5FAFE3]" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Email</p>
                                <p className="font-bold text-[#263238]">{email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Formulario de Contraseña */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#5FAFE3" }}>
                        <Lock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-[#263238]">Cambiar Contraseña</h3>
                        <p className="text-sm text-gray-400">Elige una contraseña segura de al menos 8 caracteres</p>
                    </div>
                </div>

                <form className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                            Contraseña Actual
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5FAFE3]/20 focus:border-[#5FAFE3] transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                            Nueva Contraseña
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5FAFE3]/20 focus:border-[#5FAFE3] transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                            Confirmar Contraseña
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5FAFE3]/20 focus:border-[#5FAFE3] transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 mt-2"
                        style={{ backgroundColor: "#5FAFE3" }}
                    >
                        Actualizar Contraseña
                    </button>
                </form>
            </div>
        </div>
    );
}
