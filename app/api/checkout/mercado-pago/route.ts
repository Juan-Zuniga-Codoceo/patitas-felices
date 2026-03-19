import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!,
});

const CheckoutSchema = z.object({
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
        const parsed = CheckoutSchema.safeParse(body);

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

        // Create order in DB (pending)
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
                paymentStatus: "PENDING",
                status: "CREATED",
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
        });

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

        // Create Mercado Pago preference
        const preference = new Preference(client);
        const mpResponse = await preference.create({
            body: {
                external_reference: order.id,
                payer: {
                    name: data.customerName,
                    email: data.customerEmail,
                    phone: { number: data.customerPhone },
                    address: { street_name: data.customerAddress },
                },
                items: [
                    ...data.items.map(item => ({
                        id: item.productId,
                        title: item.productName,
                        quantity: item.quantity,
                        unit_price: item.priceAtPurchase,
                        currency_id: "CLP",
                    })),
                    ...(data.shippingCost > 0
                        ? [{ id: "shipping", title: "Costo de Envío", quantity: 1, unit_price: data.shippingCost, currency_id: "CLP" }]
                        : []),
                ],
                back_urls: {
                    success: `${baseUrl}/checkout/success?orderId=${order.id}`,
                    failure: `${baseUrl}/checkout/failure?orderId=${order.id}`,
                    pending: `${baseUrl}/checkout/success?orderId=${order.id}&pending=true`,
                },
                auto_return: "approved",
                notification_url: `${baseUrl}/api/webhooks/mercado-pago`,
            },
        });

        // Save preference ID
        await prisma.order.update({
            where: { id: order.id },
            data: { mpPreferenceId: mpResponse.id ?? null },
        });

        return NextResponse.json({
            orderId: order.id,
            init_point: mpResponse.init_point,
            sandbox_init_point: mpResponse.sandbox_init_point,
        });
    } catch (error) {
        console.error("[MP Checkout Error]", error);
        return NextResponse.json({ error: "Error al procesar el pago" }, { status: 500 });
    }
}
