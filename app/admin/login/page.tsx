"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Lock, Mail, AlertCircle, ArrowRight } from "lucide-react";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });

            if (res?.error) {
                setError("Credenciales inválidas. Por favor, intenta nuevamente.");
            } else if (res?.ok) {
                router.push("/admin");
                router.refresh();
            }
        } catch (err) {
            setError("Ocurrió un error inesperado al intentar iniciar sesión.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden" style={{ backgroundColor: '#263238' }}>
            {/* Elementos Decorativos de Fondo */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full blur-[100px] opacity-20 pointer-events-none" style={{ backgroundColor: '#5FAFE3' }}></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 pointer-events-none" style={{ backgroundColor: '#FF9800' }}></div>

            <div className="w-full max-w-md p-8 relative z-10">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100/20 backdrop-blur-xl">
                    <div className="p-10">
                        <div className="text-center mb-10 flex flex-col items-center">
                            <Image
                                src="/Patitas-sinfondo.png"
                                alt="Patitas Admin Logo"
                                width={180}
                                height={180}
                                className="object-contain w-[100px] md:w-[140px] h-auto mb-4 drop-shadow-md"
                                priority={true}
                            />
                            <p className="text-sm font-medium text-gray-500">
                                Gestión segura de la plataforma
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 bg-red-50 text-red-600 text-sm p-4 rounded-xl flex items-start gap-3 border border-red-100 font-medium animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">
                                    Correo Electrónico
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#5FAFE3] transition-colors">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-[#5FAFE3]/20 focus:border-[#5FAFE3] transition-all font-medium sm:text-sm placeholder:text-gray-400"
                                        placeholder="admin@patitas.cl"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">
                                    Contraseña
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#5FAFE3] transition-colors">
                                        <Lock className="h-5 w-5" />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-[#5FAFE3]/20 focus:border-[#5FAFE3] transition-all font-medium sm:text-sm placeholder:text-gray-400"
                                        placeholder="••••••••"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !email || !password}
                                className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-8 group"
                                style={{ backgroundColor: '#5FAFE3' }}
                            >
                                {loading ? "Verificando..." : "Ingresar"}
                                {!loading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </form>
                    </div>

                    <div className="px-10 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                        <Link href="/" className="text-sm font-semibold text-gray-500 hover:text-[#5FAFE3] transition-colors flex items-center gap-2">
                            <ArrowRight className="w-4 h-4 rotate-180" />
                            Volver a la tienda
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
