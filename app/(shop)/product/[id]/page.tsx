import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import ProductGallery from "./ProductGallery";
import { ProductPurchasePanel } from "@/components/ProductPurchasePanel";
import { NavBar } from "@/components/NavBar";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { getRelatedProducts } from "@/app/actions/related-products";
import { RelatedProducts } from "@/components/RelatedProducts";
import type { Metadata } from "next";

export const revalidate = 0;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://patitasfelices.cl";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const { id } = await params;
    const product = await prisma.product.findUnique({
        where: { id },
        include: { images: { orderBy: { order: "asc" }, take: 1 } },
    });

    if (!product) {
        return { title: "Producto no encontrado — Patitas Felices" };
    }

    const mainImage =
        product.images[0]?.url ?? product.imageUrl ?? product.image ?? null;
    const title = `Comprar ${product.name} en Chile — Patitas Felices`;
    const description =
        product.seoMetaDescription ||
        product.description?.slice(0, 155) ||
        `${product.name} disponible en Patitas Felices. Envío a todo Chile. Precio: $${product.price.toLocaleString("es-CL")}.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: `${BASE_URL}/product/${id}`,
            siteName: "Patitas Felices",
            locale: "es_CL",
            type: "website",
            ...(mainImage && {
                images: [
                    {
                        url: mainImage,
                        width: 800,
                        height: 600,
                        alt: product.name,
                    },
                ],
            }),
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            ...(mainImage && { images: [mainImage] }),
        },
        other: {
            "product:price:amount": String(product.price),
            "product:price:currency": "CLP",
        },
    };
}


export default async function ProductDetailPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;

    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            images: { orderBy: { order: "asc" } },
            variants: { orderBy: { color: "asc" } },
            reviews: {
                include: { user: { select: { name: true } } },
                orderBy: { createdAt: "desc" }
            },
        },
    });

    if (!product) notFound();

    const { data: relatedProducts } = await getRelatedProducts(product.id, product.category);

    const mainImage = product.imageUrl || product.image;
    const allImages = product.images.length > 0
        ? product.images.map(i => i.url)
        : mainImage ? [mainImage] : [];

    const isDog = product.category === "Dog" || product.category === "Both";
    const isCat = product.category === "Cat" || product.category === "Both";

    return (
        <div className="min-h-screen bg-[#fafafa] pb-24">
            <NavBar />

            <main className="max-w-6xl mx-auto px-5 mt-10">
                <Link href="/" className="inline-flex items-center text-gray-500 hover:text-gray-800 transition-colors mb-8 font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                    Volver al catálogo
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-start">
                    {/* Izquierda: Carrusel + badges */}
                    <div className="relative">
                        <div className="absolute top-6 left-6 z-10 flex gap-2">
                            {isDog && <span className="bg-white px-3 py-1 rounded-full text-xs font-bold shadow-sm border border-gray-100/50" style={{ color: "#5FAFE3" }}>Para Perros 🐶</span>}
                            {isCat && <span className="bg-white px-3 py-1 rounded-full text-xs font-bold shadow-sm border border-gray-100/50" style={{ color: "#FF9800" }}>Para Gatos 🐱</span>}
                        </div>
                        <ProductGallery images={allImages} name={product.name} />
                    </div>

                    {/* Derecha: Info + variantes (Sticky) */}
                    <div className="flex flex-col md:sticky md:top-[100px]">
                        <div className="mb-2 inline-flex items-center text-xs font-bold uppercase tracking-widest text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                                <line x1="7" y1="7" x2="7.01" y2="7" />
                            </svg>
                            {product.sku || "N/A"}
                        </div>

                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4 tracking-[-0.02em]">
                            {product.name}
                        </h1>

                        <ProductPurchasePanel product={product as any} />
                    </div>
                </div>

                {/* Sección También te podría gustar */}
                <RelatedProducts products={relatedProducts || []} />

                {/* Sección de Reseñas */}
                <div className="mt-16 pt-12 border-t border-gray-100 max-w-4xl">
                    <div className="flex items-center gap-4 mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-poppins tracking-tight">
                            Evaluaciones de Clientes
                        </h2>
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#FF9800]">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                            <span className="font-bold text-gray-900 text-sm">{product.rating ? product.rating.toFixed(1) : "0.0"}</span>
                            <span className="text-sm text-gray-500">({product.reviewsCount} reseñas)</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {product.reviews.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                                <p className="text-gray-500 font-medium">Aún no hay reseñas para este producto.</p>
                                <p className="text-gray-400 text-sm mt-1">Sé el primero de nuestros clientes verificados en opinar.</p>
                            </div>
                        ) : (
                            product.reviews.map((review) => (
                                <ReviewCard key={review.id} review={review} />
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
