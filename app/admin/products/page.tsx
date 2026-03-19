import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import ProductsTable from "./ProductsTable";

export default async function ProductsPage() {
    const products = await prisma.product.findMany({
        include: { provider: true },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-black text-[#263238]">Productos</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {products.length} {products.length === 1 ? "producto" : "productos"} en total
                    </p>
                </div>
                <Link
                    href="/admin/products/new"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md hover:opacity-90 transition-all"
                    style={{ backgroundColor: "#5FAFE3" }}
                >
                    <span className="text-lg leading-none">+</span>
                    Nuevo Producto
                </Link>
            </div>

            <ProductsTable products={products} />
        </div>
    );
}
