"use server";

import { prisma } from "@/lib/prisma";

export async function exportOrdersToExcelData() {
    try {
        const orders = await prisma.order.findMany({
            orderBy: {
                createdAt: "desc",
            },
            select: {
                id: true,
                createdAt: true,
                customerName: true,
                customerRUT: true,
                customerEmail: true,
                comuna: true,
                totalPrice: true,
                shippingCost: true,
                paymentStatus: true,
                status: true,
            },
        });

        return orders;
    } catch (error) {
        console.error("Error fetching orders for export:", error);
        throw new Error("Failed to fetch orders for export.");
    }
}
