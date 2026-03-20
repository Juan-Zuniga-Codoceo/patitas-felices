"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type ProductImageInput = {
    url: string;
    alt?: string;
    order?: number;
};

export type ProductVariantInput = {
    color: string;
    stock: number;
    priceAdjustment: number;
};

export type ProductPayload = {
    name: string;
    description: string;
    seoMetaDescription?: string;
    seoTitle?: string;
    seoKeywords?: string;
    category: string;
    providerType: "Dropi" | "External";
    allowsCOD: boolean;
    sku?: string;
    dropiId?: string;
    externalLink?: string;
    imageUrl?: string;
    image?: string;
    costPrice: number;
    sellPrice: number;
    weight: number;
    length: number;
    width: number;
    height: number;
    images?: ProductImageInput[];
    variants?: ProductVariantInput[];
};

async function ensureProvider(providerType: "Dropi" | "External") {
    const pId = providerType === "Dropi" ? "p_dropi" : "p_ext";
    const exists = await prisma.provider.findUnique({ where: { id: pId } });
    if (!exists) {
        await prisma.provider.create({
            data: {
                id: pId,
                name: providerType === "Dropi" ? "Dropi" : "External Provider",
            },
        });
    }
    return pId;
}

export async function createProduct(data: ProductPayload) {
    try {
        if (!data.name || !data.providerType || !data.weight || !data.length || !data.width || !data.height) {
            return { success: false, error: "Faltan campos obligatorios" };
        }

        const pId = await ensureProvider(data.providerType);

        const product = await prisma.$transaction(async (tx) => {
            const created = await tx.product.create({
                data: {
                    name: data.name,
                    description: data.description,
                    seoMetaDescription: data.seoMetaDescription || null,
                    seoTitle: data.seoTitle || null,
                    seoKeywords: data.seoKeywords || null,
                    category: data.category,
                    sku: data.sku || null,
                    dropiId: data.dropiId || null,
                    externalLink: data.externalLink || null,
                    price: data.sellPrice,
                    providerId: pId,
                    allowsCOD: data.providerType === "Dropi" ? data.allowsCOD : false,
                    providerType: data.providerType,
                    costPrice: data.costPrice,
                    sellPrice: data.sellPrice,
                    weight: data.weight,
                    length: data.length,
                    width: data.width,
                    height: data.height,
                    image: data.image || null,
                    imageUrl: data.imageUrl || null,
                },
            });

            // Crear imágenes adicionales
            if (data.images && data.images.length > 0) {
                await tx.productImage.createMany({
                    data: data.images.map((img, i) => ({
                        url: img.url,
                        alt: img.alt || data.name,
                        order: img.order ?? i,
                        productId: created.id,
                    })),
                });
            }

            // Crear variantes
            if (data.variants && data.variants.length > 0) {
                await tx.productVariant.createMany({
                    data: data.variants.map((v) => ({
                        color: v.color,
                        stock: v.stock,
                        priceAdjustment: v.priceAdjustment,
                        productId: created.id,
                    })),
                });
            }

            return created;
        });

        revalidatePath("/admin/products");
        return { success: true, product };
    } catch (error: any) {
        console.error("Error creating product:", error);
        return { success: false, error: error.message || "Error al crear el producto" };
    }
}

export async function updateProduct(id: string, data: ProductPayload) {
    try {
        if (!data.name || !data.weight || !data.length || !data.width || !data.height) {
            return { success: false, error: "Faltan campos obligatorios" };
        }

        const pId = await ensureProvider(data.providerType);

        const product = await prisma.$transaction(async (tx) => {
            const updated = await tx.product.update({
                where: { id },
                data: {
                    name: data.name,
                    description: data.description,
                    seoMetaDescription: data.seoMetaDescription || null,
                    category: data.category,
                    sku: data.sku || null,
                    dropiId: data.dropiId || null,
                    price: data.sellPrice,
                    providerId: pId,
                    allowsCOD: data.providerType === "Dropi" ? data.allowsCOD : false,
                    providerType: data.providerType,
                    costPrice: data.costPrice,
                    sellPrice: data.sellPrice,
                    weight: data.weight,
                    length: data.length,
                    width: data.width,
                    height: data.height,
                    image: data.image || null,
                    imageUrl: data.imageUrl || null,
                },
            });

            // Reemplazar imágenes: delete-all + re-create
            await tx.productImage.deleteMany({ where: { productId: id } });
            if (data.images && data.images.length > 0) {
                await tx.productImage.createMany({
                    data: data.images.map((img, i) => ({
                        url: img.url,
                        alt: img.alt || data.name,
                        order: img.order ?? i,
                        productId: id,
                    })),
                });
            }

            // Reemplazar variantes
            await tx.productVariant.deleteMany({ where: { productId: id } });
            if (data.variants && data.variants.length > 0) {
                await tx.productVariant.createMany({
                    data: data.variants.map((v) => ({
                        color: v.color,
                        stock: v.stock,
                        priceAdjustment: v.priceAdjustment,
                        productId: id,
                    })),
                });
            }

            return updated;
        });

        revalidatePath("/admin/products");
        revalidatePath(`/admin/products/${id}/edit`);
        revalidatePath(`/product/${id}`);
        return { success: true, product };
    } catch (error: any) {
        console.error("Error updating product:", error);
        return { success: false, error: error.message || "Error al actualizar el producto" };
    }
}

export async function deleteProduct(id: string) {
    try {
        await prisma.productVariant.deleteMany({ where: { productId: id } });
        await prisma.productImage.deleteMany({ where: { productId: id } });
        await prisma.review.deleteMany({ where: { productId: id } });
        await prisma.product.delete({ where: { id } });
        revalidatePath("/admin/products");
        return { success: true };
    } catch (error: any) {
        console.error("[deleteProduct]", error);
        return { success: false, error: error.message || "Error al eliminar" };
    }
}

export async function deleteProductsBulk(ids: string[]) {
    try {
        const where = ids.length > 0 ? { productId: { in: ids } } : {};
        const productWhere = ids.length > 0 ? { id: { in: ids } } : {};
        const reviewWhere = ids.length > 0 ? { productId: { in: ids } } : {};

        await prisma.productVariant.deleteMany({ where });
        await prisma.productImage.deleteMany({ where });
        await prisma.review.deleteMany({ where: reviewWhere });
        const result = await prisma.product.deleteMany({ where: productWhere });

        revalidatePath("/admin/products");
        return { success: true, deleted: result.count };
    } catch (error: any) {
        console.error("[deleteProductsBulk]", error);
        return { success: false, error: error.message || "Error al eliminar en lote" };
    }
}
