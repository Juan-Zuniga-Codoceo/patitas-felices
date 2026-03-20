import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmation } from "@/lib/email";
import { z } from "zod";

const CODSchema = z.object({
    customerName: z.string().min(2),
    customerEmail: z.string().email(),
    customerRUT: z.string().min(9),
    customerPhone: z.string().min(8),
    customerAddress: z.string().min(5),
    comuna: z.string().min(2),
    shippingCost: z.number().min(0),
    items: z.array(z.object({
        productId: z.string(),
        productName: z.string(),
        quantity: z.number().int().positive(),
        priceAtPurchase: z.number().positive(),
        selectedColor: z.string().optional(),
        providerId: z.string(),
        providerName: z.string(),
    })),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parsed = CODSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Datos inválidos", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const data = parsed.data;
        const subtotal = data.items.reduce((sum, i) => sum + i.priceAtPurchase * i.quantity, 0);
        const totalPrice = subtotal + data.shippingCost;

        // Ensure providers exist
        const uniqueProviders = [...new Map(data.items.map(i => [i.providerId, i])).values()];
        for (const item of uniqueProviders) {
            await prisma.provider.upsert({
                where: { id: item.providerId },
                update: {},
                create: { id: item.providerId, name: item.providerName },
            });
        }

        // Create order with COD payment status
        const order = await prisma.order.create({
            data: {
                customerName: data.customerName,
                customerEmail: data.customerEmail,
                customerRUT: data.customerRUT,
                customerPhone: data.customerPhone,
                customerAddress: data.customerAddress,
                comuna: data.comuna,
                shippingCost: data.shippingCost,
                totalPrice,
                paymentStatus: "COD",      // Cash on Delivery
                status: "PROCESSING",       // Ready to dispatch
                items: {
                    create: data.items.map(item => ({
                        productId: item.productId,
                        productName: item.productName,
                        quantity: item.quantity,
                        priceAtPurchase: item.priceAtPurchase,
                        selectedColor: item.selectedColor,
                        providerId: item.providerId,
                    })),
                },
            },
            include: { items: { include: { provider: true } } },
        });

        // Save customer email for marketing list
        await prisma.emailSubscriber.upsert({
            where: { email: data.customerEmail },
            update: { name: data.customerName },
            create: { email: data.customerEmail, name: data.customerName, source: "purchase" },
        });

        // Fire confirmation email (no PDF for COD, or we can still generate one)
        await sendOrderConfirmation(
            {
                id: order.id,
                customerName: order.customerName,
                customerEmail: order.customerEmail,
                customerAddress: order.customerAddress,
                comuna: data.comuna,
                totalPrice,
                shippingCost: data.shippingCost,
                items: order.items.map(i => ({
                    productName: i.productName,
                    quantity: i.quantity,
                    priceAtPurchase: (i as any).priceAtPurchase ?? 0,
                    selectedColor: (i as any).selectedColor ?? null,
                    provider: i.provider,
                })),
            },
            undefined, // no PDF for COD
            true       // isCOD → different email template
        ).catch(e => console.error("[COD] Email error:", e));

        return NextResponse.json({ orderId: order.id });
    } catch (error) {
        console.error("[COD Checkout Error]", error);
        return NextResponse.json({ error: "Error al procesar la orden" }, { status: 500 });
    }
}
