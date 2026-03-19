"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors border border-red-100"
        >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
        </button>
    );
}
