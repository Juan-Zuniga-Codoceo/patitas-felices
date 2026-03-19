"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function replyToReview(reviewId: string, replyText: string) {
    if (!replyText || replyText.trim() === "") {
        return { success: false, error: "La respuesta no puede estar vacía." };
    }

    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return { success: false, error: "Debes iniciar sesión." };
    }

    try {
        const adminUser = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!adminUser || adminUser.role !== "ADMIN") {
            return { success: false, error: "No tienes permisos de administrador." };
        }

        const review = await prisma.review.findUnique({
            where: { id: reviewId },
        });

        if (!review) {
            return { success: false, error: "Reseña no encontrada." };
        }

        await prisma.review.update({
            where: { id: reviewId },
            data: {
                adminReply: replyText,
                repliedAt: new Date(),
            },
        });

        revalidatePath(`/product/${review.productId}`);
        revalidatePath(`/admin/reviews`);

        return { success: true };
    } catch (error) {
        console.error("[replyToReview Error]", error);
        return { success: false, error: "Error interno procesando la respuesta." };
    }
}
