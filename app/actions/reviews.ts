"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function createProductReview(productId: string, rating: number, comment: string) {
    if (rating < 1 || rating > 5) {
        return { success: false, error: "Rango de calificación inválido." };
    }
    if (!comment || comment.trim() === "") {
        return { success: false, error: "El comentario no puede estar vacío." };
    }

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return { success: false, error: "Debes iniciar sesión para calificar productos." };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return { success: false, error: "Usuario no encontrado." };
        }

        // Validate Verify Purchase
        const deliveredOrder = await prisma.order.findFirst({
            where: {
                customerEmail: session.user.email,
                status: "DELIVERED",
                items: {
                    some: {
                        productId: productId
                    }
                }
            }
        });

        // The requirement is that they must have a DELIVERED order with this productId
        if (!deliveredOrder) {
            return { success: false, error: "Solo puedes calificar productos que hayas comprado y recibido satisfactoriamente." };
        }

        // Prevent multiple reviews on the exact same product from the same user (Optional but recommended)
        const existingReview = await prisma.review.findFirst({
            where: {
                productId,
                userId: user.id
            }
        });

        if (existingReview) {
            return { success: false, error: "Ya has dejado una reseña para este producto." };
        }

        // Perform transactional update
        const newReview = await prisma.$transaction(async (tx) => {
            const review = await tx.review.create({
                data: {
                    rating,
                    comment,
                    isVerifiedPurchase: true,
                    productId,
                    userId: user.id,
                }
            });

            // Update Product aggregate
            const product = await tx.product.findUnique({ where: { id: productId } });
            if (product) {
                const newCount = product.reviewsCount + 1;
                // Running Average Formula: newAvg = currentAvg + (newValue - currentAvg) / newCount
                const newAvg = product.rating + ((rating - product.rating) / newCount);

                await tx.product.update({
                    where: { id: productId },
                    data: {
                        reviewsCount: newCount,
                        rating: newAvg,
                    }
                });
            }

            return review;
        });

        return { success: true, data: newReview };
    } catch (error) {
        console.error("[createProductReview Error]", error);
        return { success: false, error: "Error interno procesando la calificación." };
    }
}
