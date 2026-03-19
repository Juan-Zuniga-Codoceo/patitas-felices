import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "../../ProductForm";

export default async function EditProductPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const product = await prisma.product.findUnique({ where: { id } });

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
                category: product.category,
                providerType: (product.providerType as "Dropi" | "External") ?? "Dropi",
                allowsCOD: product.allowsCOD,
                sku: product.sku ?? "",
                dropiId: product.dropiId ?? "",
                imageUrl: product.imageUrl ?? "",
                costPrice: product.costPrice ?? 0,
                sellPrice: product.sellPrice ?? product.price,
                weight: product.weight ?? 0,
                length: product.length ?? 0,
                width: product.width ?? 0,
                height: product.height ?? 0,
            }}
        />
    );
}
