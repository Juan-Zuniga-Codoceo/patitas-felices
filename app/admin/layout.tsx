import React from "react";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex bg-[#fafafa] min-h-screen">
            <AdminSidebar />

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-8 pb-24">
                    {children}
                </div>
            </main>
        </div>
    );
}

