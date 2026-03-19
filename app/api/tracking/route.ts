import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const email = searchParams.get("email");

        if (!id || !email) {
            return NextResponse.json({ error: "Número de orden y email son requeridos" }, { status: 400 });
        }

        const order = await prisma.order.findUnique({
            where: { id: id.trim() },
            include: {
                items: {
                    include: { provider: true }
                }
            }
        });

        if (!order || order.customerEmail.toLowerCase() !== email.toLowerCase().trim()) {
            return NextResponse.json({ error: "No encontramos una orden con esos datos. Verifica el número y el correo." }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            order: {
                id: order.id,
                createdAt: order.createdAt,
                status: order.status,
                paymentStatus: (order as any).paymentStatus ?? "PENDING",
                items: order.items.map(i => ({
                    id: i.id,
                    productName: i.productName,
                    quantity: i.quantity,
                    providerName: i.provider.name,
                    trackingCode: i.trackingCode
                }))
            }
        });
    } catch (error) {
        console.error("[Tracking API Error]", error);
        return NextResponse.json({ error: "Error al buscar el pedido" }, { status: 500 });
    }
}
