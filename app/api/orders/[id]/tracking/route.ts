import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendShippingNotification, sendOrderStatusUpdate } from "@/lib/email";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { itemId, trackingCode } = await req.json();

        if (!itemId || typeof trackingCode !== "string") {
            return NextResponse.json({ error: "itemId y trackingCode son requeridos" }, { status: 400 });
        }

        const updatedItem = await prisma.orderItem.update({
            where: { id: itemId, orderId: id },
            data: { trackingCode },
            include: { provider: true },
        });

        // ── Enviar email de notificación de envío al cliente ──
        if (trackingCode.trim()) {
            const order = await prisma.order.findUnique({ where: { id } });
            if (order) {
                await sendShippingNotification({
                    order: {
                        id: order.id,
                        customerName: order.customerName,
                        customerEmail: order.customerEmail,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        comuna: (order as any).comuna ?? "",
                    },
                    productName: updatedItem.productName,
                    providerName: updatedItem.provider.name,
                    trackingCode,
                });
            }
        }

        return NextResponse.json({ success: true, item: updatedItem });
    } catch (error) {
        console.error("[Tracking Update Error]", error);
        return NextResponse.json({ error: "Error actualizando tracking" }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { status } = await req.json();

        const validStatuses = ["CREATED", "PROCESSING", "SHIPPED", "DELIVERED"];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
        }

        const updated = await prisma.order.update({
            where: { id },
            data: { status },
        });

        // ── Enviar email automatizado de cambio de estado ──
        if (["PROCESSING", "SHIPPED", "DELIVERED"].includes(status)) {
            await sendOrderStatusUpdate({
                id: updated.id,
                customerName: updated.customerName,
                customerEmail: updated.customerEmail,
                status: updated.status,
            });
        }

        return NextResponse.json({ success: true, order: updated });
    } catch (error) {
        console.error("[Order Status Update Error]", error);
        return NextResponse.json({ error: "Error actualizando estado" }, { status: 500 });
    }
}
