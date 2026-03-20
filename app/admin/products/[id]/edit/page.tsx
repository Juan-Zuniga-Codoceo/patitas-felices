import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "../../ProductForm";

export default async function EditProductPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            images: { orderBy: { order: "asc" } },
            variants: { orderBy: { createdAt: "asc" } },
        },
    });

    if (!product) {
        notFound();
    }

    return (
        <ProductForm
            mode="edit"
            initialData={{
                id: product.id,
                name: product.name,
                description: product.description ?? "",
                seoMetaDescription: product.seoMetaDescription ?? "",
                seoTitle: (product as any).seoTitle ?? "",
                seoKeywords: (product as any).seoKeywords ?? "",
                category: product.category,
                providerType: (product.providerType as "Dropi" | "External") ?? "Dropi",
                allowsCOD: product.allowsCOD,
                sku: product.sku ?? "",
                dropiId: product.dropiId ?? "",
                externalLink: (product as any).externalLink ?? "",
                imageUrl: product.imageUrl ?? "",
                costPrice: product.costPrice ?? 0,
                sellPrice: product.sellPrice ?? product.price,
                weight: product.weight ?? 0,
                length: product.length ?? 0,
                width: product.width ?? 0,
                height: product.height ?? 0,
                images: product.images.map((img) => ({ url: img.url, alt: img.alt ?? "" })),
                variants: product.variants.map((v) => ({
                    color: v.color,
                    stock: v.stock,
                    priceAdjustment: v.priceAdjustment,
                })),
            }}
        />
    );
}
