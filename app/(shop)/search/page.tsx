import { prisma } from "@/lib/prisma";
import { NavBar } from "@/components/NavBar";
import { ProductCard } from "@/components/ProductCard";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Resultados de búsqueda — Patitas Felices",
    description: "Encuentra los mejores productos para tus mascotas en Patitas Felices.",
};

export default async function SearchPage({
    searchParams
}: {
    searchParams: Promise<{ q?: string }>
}) {
    const q = (await searchParams).q || "";

    const products = q.length >= 2 ? await prisma.product.findMany({
        where: {
            OR: [
                { name: { contains: q } },
                { description: { contains: q } },
                { sku: { contains: q } },
            ]
        },
        include: {
            images: { take: 1, orderBy: { order: "asc" } }
        }
    }) : [];

    return (
        <div className="min-h-screen bg-[#fafafa] pb-24">
            <NavBar />

            <div className="bg-[#263238] text-white py-12 md:py-16 mt-0">
                <div className="max-w-6xl mx-auto px-5">
                    <h1 className="text-3xl md:text-5xl font-extrabold mb-4">
                        Resultados para: <span className="text-[#5FAFE3]">"{q}"</span>
                    </h1>
                    <p className="text-gray-400 font-medium">
                        {products.length} {products.length === 1 ? "producto encontrado" : "productos encontrados"}
                    </p>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-5 mt-12">
                {products.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
                        <span className="text-6xl mb-4 block">🧐</span>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">No encontramos resultados</h2>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto">Lo sentimos, no hay productos que coincidan con tu búsqueda. Intenta con un sinónimo o revisa nuestras categorías principales.</p>
                        <Link href="/" className="px-8 py-3 bg-[#5FAFE3] text-white rounded-xl font-bold hover:bg-[#4A99CC] transition-colors shadow-md hover:shadow-lg">
                            Volver a la tienda
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map(product => (
                            <Link key={product.id} href={`/product/${product.id}`} className="block h-full">
                                <ProductCard product={product as any} />
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
