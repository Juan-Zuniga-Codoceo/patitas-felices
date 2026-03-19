"use server";

import { prisma } from "@/lib/prisma";

export type TrackingData = {
    id: string;
    customerName: string;
    comuna: string;
    status: string; // 'CREATED', 'PROCESSING', 'SHIPPED', 'DELIVERED'
    shippingMethod: string;
    courierTrackingCode: string | null;
    items: {
        productName: string;
        quantity: number;
        providerName: string;
        selectedColor: string | null;
    }[];
    createdAt: Date;
    updatedAt: Date;
};

export async function getTrackingOrder(orderIdOrCode: string): Promise<TrackingData | null> {
    try {
        // Buscar primero por ID exacto
        let order = await prisma.order.findUnique({
            where: { id: orderIdOrCode },
            include: {
                items: {
                    include: {
                        provider: true
                    }
                }
            }
        });

        // Si no se encontró por ID, intentar buscar algún OrderItem con ese trackingCode (si se requiere)
        if (!order) {
            const itemWithTracking = await prisma.orderItem.findFirst({
                where: { trackingCode: orderIdOrCode },
                include: {
                    order: {
                        include: {
                            items: {
                                include: { provider: true }
                            }
                        }
                    }
                }
            });
            if (itemWithTracking) {
                order = itemWithTracking.order;
            }
        }

        if (!order) return null;

        // Buscar el primer tracking code real que tenga algún item validando Blue Express o Starken
        const itemWithRealTracking = order.items.find((i) => i.trackingCode && i.trackingCode.trim().length > 0);
        const courierTrackingCode = itemWithRealTracking?.trackingCode || null;

        // TODO: El método de envío (domicilio/sucursal) idealmente se guarda en la BD.
        // Como en el schema no agregamos explícitamente "shippingMethod", deducimos 'domicilio' por defecto
        // o inferimos si la dirección de entrega es una comuna específica.
        const shippingMethod = "domicilio"; // Por defecto, asumiendo domicilio por ahora.

        return {
            id: order.id,
            customerName: order.customerName,
            comuna: order.comuna,
            status: order.status,
            shippingMethod,
            courierTrackingCode,
            items: order.items.map(item => ({
                productName: item.productName,
                quantity: item.quantity,
                providerName: item.provider.name,
                selectedColor: item.selectedColor,
            })),
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
        };
    } catch (error) {
        console.error("[getTrackingOrder] Error:", error);
        return null;
    }
}
