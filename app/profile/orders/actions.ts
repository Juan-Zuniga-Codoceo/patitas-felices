"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getUserOrders() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return { success: false, error: "No autorizado" };
    }

    try {
        const orders = await prisma.order.findMany({
            where: {
                customerEmail: session.user.email,
            },
            include: {
                items: {
                    include: {
                        provider: true,
                    }
                }
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return { success: true, orders };
    } catch (error) {
        console.error("[getUserOrders Error]", error);
        return { success: false, error: "Error interno del servidor" };
    }
}
