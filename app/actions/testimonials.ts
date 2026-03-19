"use server";

import { prisma } from "@/lib/prisma";

export async function getTopTestimonials() {
    try {
        const topReviews = await prisma.review.findMany({
            where: {
                rating: 5,
                isVerifiedPurchase: true,
                comment: { not: "" }
            },
            take: 3,
            orderBy: { createdAt: "desc" },
            include: {
                user: { select: { name: true } },
            }
        });

        const aggregates = await prisma.review.aggregate({
            _avg: { rating: true },
            _count: { id: true }
        });

        // Default to a 5.0 rating and 1 review if DB is empty to prevent SEO schema errors,
        // although usually you'd omit it if completely absent. We assume at least 1 here based on site metrics.
        const avgRating = aggregates._avg.rating ? Number(aggregates._avg.rating.toFixed(1)) : 5.0;
        const reviewCount = aggregates._count.id > 0 ? aggregates._count.id : 1;

        return {
            success: true,
            testimonials: topReviews.map(r => ({
                id: r.id,
                rating: r.rating,
                comment: r.comment,
                userName: r.user.name || "Cliente Patitas Felices"
            })),
            seoStats: {
                averageRating: avgRating,
                reviewCount: reviewCount
            }
        };
    } catch (error) {
        console.error("[getTopTestimonials Error]", error);
        return { success: false, testimonials: [], seoStats: null };
    }
}
