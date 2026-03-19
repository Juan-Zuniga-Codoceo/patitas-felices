import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { generateReceiptPDFBuffer } from "@/lib/pdf";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    try {
        const order = await prisma.order.findUnique({
            where: { id },
            include: { items: { include: { provider: true } } },
        });

        if (!order) {
            return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
        }

        // Validación crítica de seguridad: Propiedad
        if (order.customerEmail !== session.user.email) {
            return NextResponse.json({ error: "No autorizado para ver esta orden" }, { status: 403 });
        }

        if (order.paymentStatus !== "PAID") {
            return NextResponse.json({ error: "No es posible descargar la boleta de una orden no pagada" }, { status: 400 });
        }

        // Preparar payload para el PDF
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const comuna = (order as any).comuna ?? "";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const shippingCost = (order as any).shippingCost ?? 0;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const totalPrice = (order as any).totalPrice ?? 0;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const customerRUT = (order as any).customerRUT ?? "";

        const payloadItems = order.items.map(i => ({
            productName: i.productName,
            quantity: i.quantity,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            priceAtPurchase: (i as any).priceAtPurchase ?? (i as any).price ?? 0,
            selectedColor: (i as any).selectedColor ?? null,
            provider: i.provider,
        }));

        const pdfBuffer = await generateReceiptPDFBuffer({
            id: order.id,
            customerName: order.customerName,
            customerRUT,
            customerAddress: order.customerAddress,
            comuna,
            items: payloadItems,
            shippingCost,
            totalPrice,
            createdAt: order.createdAt,
        });

        return new NextResponse(pdfBuffer as unknown as BodyInit, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="Boleta_PatitasFelices_${order.id.slice(0, 8).toUpperCase()}.pdf"`,
            },
        });
    } catch (error) {
        console.error("[Order Download Error]", error);
        return NextResponse.json({ error: "Error interno generado pdf" }, { status: 500 });
    }
}
