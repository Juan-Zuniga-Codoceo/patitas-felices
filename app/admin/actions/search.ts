"use server";

import { prisma } from "@/lib/prisma";

export type SearchResult = {
    orders: {
        id: string;
        customerName: string;
        totalPrice: number;
        paymentStatus: string;
        createdAt: Date;
    }[];
    products: {
        id: string;
        name: string;
        price: number;
    }[];
    providers: {
        id: string;
        name: string;
    }[];
};

export async function globalSearch(query: string): Promise<SearchResult> {
    if (!query || query.trim().length < 2) {
        return { orders: [], products: [], providers: [] };
    }

    const searchTerm = query.trim();

    try {
        const [orders, products, providers] = await Promise.all([
            // 1. Buscar Órdenes
            prisma.order.findMany({
                where: {
                    OR: [
                        { id: { contains: searchTerm } },
                        { customerName: { contains: searchTerm } },
                        { customerEmail: { contains: searchTerm } },
                        { customerRUT: { contains: searchTerm } },
                    ],
                },
                select: {
                    id: true,
                    customerName: true,
                    totalPrice: true,
                    paymentStatus: true,
                    createdAt: true,
                },
                take: 5,
                orderBy: { createdAt: "desc" },
            }),

            // 2. Buscar Productos
            prisma.product.findMany({
                where: {
                    OR: [
                        { name: { contains: searchTerm } },
                        { description: { contains: searchTerm } },
                    ],
                },
                select: {
                    id: true,
                    name: true,
                    price: true,
                },
                take: 5,
            }),

            // 3. Buscar Proveedores
            prisma.provider.findMany({
                where: {
                    OR: [
                        { name: { contains: searchTerm } },
                    ],
                },
                select: {
                    id: true,
                    name: true,
                },
                take: 5,
            }),
        ]);

        return {
            orders,
            products,
            providers,
        };
    } catch (error) {
        console.error("Error executing global search:", error);
        return { orders: [], products: [], providers: [] };
    }
}
