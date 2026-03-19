"use server";

import { prisma } from "@/lib/prisma";

export async function getRelatedProducts(currentId: string, category: string) {
    try {
        let related = await prisma.product.findMany({
            where: {
                category: category,
                id: { not: currentId }
            },
            take: 4,
            orderBy: { rating: "desc" },
            include: { images: true }
        });

        // Fallback: If less than 4 products in the same category, fill with global best-rated products
        if (related.length < 4) {
            const excludeIds = [currentId, ...related.map(r => r.id)];
            const fillCount = 4 - related.length;

            const fallback = await prisma.product.findMany({
                where: {
                    id: { notIn: excludeIds }
                },
                take: fillCount,
                orderBy: { rating: "desc" },
                include: { images: true }
            });

            related = [...related, ...fallback];
        }

        return { success: true, data: related };
    } catch (error) {
        console.error("[getRelatedProducts Error]", error);
        return { success: false, data: [] };
    }
}
