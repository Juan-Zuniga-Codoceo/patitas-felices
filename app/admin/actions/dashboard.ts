"use server";

import { prisma } from "@/lib/prisma";
import { subDays, startOfDay, endOfDay, format } from "date-fns";

export async function getSalesLast7Days() {
    try {
        const today = new Date();
        const past7Days = Array.from({ length: 7 }, (_, i) => {
            return subDays(today, 6 - i);
        });

        const salesData = await Promise.all(
            past7Days.map(async (date) => {
                const result = await prisma.order.aggregate({
                    where: {
                        createdAt: {
                            gte: startOfDay(date),
                            lte: endOfDay(date),
                        },
                        paymentStatus: "PAID",
                    },
                    _sum: {
                        totalPrice: true,
                    },
                });

                return {
                    date: format(date, "dd MMM"),
                    ventas: result._sum.totalPrice || 0,
                };
            })
        );

        return salesData;
    } catch (error) {
        console.error("Error fetching sales data:", error);
        return [];
    }
}

export async function getLowStockVariants() {
    try {
        const variants = await prisma.productVariant.findMany({
            where: {
                stock: {
                    lt: 5,
                },
            },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                stock: "asc",
            },
        });

        return variants;
    } catch (error) {
        console.error("Error fetching low stock variants:", error);
        return [];
    }
}

export async function getRecentOrders(limit = 5) {
    try {
        const orders = await prisma.order.findMany({
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
            select: {
                id: true,
                customerName: true,
                totalPrice: true,
                paymentStatus: true,
                createdAt: true,
            },
        });

        return orders;
    } catch (error) {
        console.error("Error fetching recent orders:", error);
        return [];
    }
}

export async function getDashboardStats() {
    try {
        const today = new Date();
        const startOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);

        // Ventas del mes actual
        const currentMonthSales = await prisma.order.aggregate({
            where: {
                createdAt: { gte: startOfThisMonth },
                paymentStatus: "PAID",
            },
            _sum: { totalPrice: true },
        });

        // Ventas del mes anterior para comparación
        const lastMonthSales = await prisma.order.aggregate({
            where: {
                createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
                paymentStatus: "PAID",
            },
            _sum: { totalPrice: true },
        });

        const currentTotal = currentMonthSales._sum.totalPrice || 0;
        const lastTotal = lastMonthSales._sum.totalPrice || 0;

        let percentageChange = 0;
        if (lastTotal > 0) {
            percentageChange = ((currentTotal - lastTotal) / lastTotal) * 100;
        } else if (currentTotal > 0) {
            percentageChange = 100; // si el mes pasado fue 0 pero este mes hay ventas
        }

        const activeProductsCount = await prisma.product.count();

        // Órdenes Pendientes
        const pendingOrdersCount = await prisma.order.count({
            where: { paymentStatus: "PENDING" },
        });

        return {
            monthlySales: currentTotal,
            salesPercentageChange: percentageChange,
            activeProducts: activeProductsCount,
            pendingOrders: pendingOrdersCount,
        };
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return {
            monthlySales: 0,
            salesPercentageChange: 0,
            activeProducts: 0,
            pendingOrders: 0,
        };
    }
}
