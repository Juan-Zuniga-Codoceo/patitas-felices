"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { LayoutDashboard, Package, ShoppingCart, Building2, Settings, UserCircle } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import { GlobalSearch } from "@/components/admin/GlobalSearch";

const menuItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
    { label: "Productos", href: "/admin/products", icon: Package },
    { label: "Órdenes", href: "/admin/orders", icon: ShoppingCart },
    { label: "Proveedores", href: "/admin/providers", icon: Building2 },
    { label: "Configuración", href: "/admin/settings", icon: Settings },
    { label: "Mi Perfil", href: "/admin/profile", icon: UserCircle },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    const isActive = (href: string, exact?: boolean) => {
        if (exact) return pathname === href;
        return pathname.startsWith(href);
    };

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm sticky top-0 h-screen">
            <div className="p-6 border-b border-gray-100 pb-5">
                <Link href="/admin" className="transition-transform hover:scale-105 origin-left inline-block">
                    <Image
                        src="/Patitas-sinfondo.png"
                        alt="Patitas Admin Logo"
                        width={120}
                        height={120}
                        className="object-contain w-[60px] md:w-[80px] h-auto drop-shadow-sm"
                    />
                </Link>
                <div className="mt-6">
                    <GlobalSearch />
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {menuItems.map((item) => {
                    const active = isActive(item.href, item.exact);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${active
                                ? "text-white shadow-md"
                                : "text-gray-500 hover:text-[#5FAFE3] hover:bg-blue-50"
                                }`}
                            style={active ? { backgroundColor: "#5FAFE3" } : {}}
                        >
                            <Icon className={`w-4.5 h-4.5 ${active ? "text-white" : "text-gray-400"}`} style={{ width: 18, height: 18 }} />
                            {item.label}
                            {active && (
                                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <LogoutButton />
                <div className="text-xs text-center text-gray-300 mt-3">
                    Patitas Felices · Admin v1.0
                </div>
            </div>
        </aside>
    );
}
