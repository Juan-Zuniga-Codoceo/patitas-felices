import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendOrderConfirmation } from "@/lib/email";

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!,
});

const ProcessSchema = z.object({
    orderId: z.string().min(1),
    token: z.string().min(1),
    paymentMethodId: z.string().min(1),
    issuerId: z.string().optional(),
    installments: z.number().int().min(1).default(1),
    email: z.string().email(),
    identificationType: z.string().default("RUT"),
    identificationNumber: z.string().min(1),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parsed = ProcessSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Datos inválidos", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const {
            orderId, token, paymentMethodId, issuerId,
            installments, email, identificationType, identificationNumber,
        } = parsed.data;

        // Fetch the order to get the total
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: { include: { provider: true } } },
        });

        if (!order) {
            return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
        }

        if ((order as any).paymentStatus === "PAID") {
            return NextResponse.json({ error: "Esta orden ya fue pagada" }, { status: 400 });
        }

        const totalPrice = (order as any).totalPrice ?? order.totalPrice;

        // ── Test user bypass: simulate a successful transaction ──
        const isTestUser = email === process.env.MP_TEST_USER_EMAIL;
        if (isTestUser) {
            await prisma.order.update({
                where: { id: orderId },
                data: {
                    paymentStatus: "PAID",
                    status: "PROCESSING",
                    mpPaymentId: `TEST-BYPASS-${Date.now()}`,
                } as any,
            });
            await sendOrderConfirmation({
                id: order.id,
                customerName: order.customerName,
                customerEmail: order.customerEmail,
                customerAddress: order.customerAddress,
                comuna: (order as any).comuna ?? "",
                totalPrice,
                shippingCost: (order as any).shippingCost ?? 0,
                items: order.items.map(i => ({
                    productName: i.productName,
                    quantity: i.quantity,
                    priceAtPurchase: (i as any).priceAtPurchase ?? 0,
                    selectedColor: (i as any).selectedColor ?? null,
                    provider: i.provider,
                })),
            });
            return NextResponse.json({
                status: "approved",
                orderId,
                message: "Pago de prueba aprobado",
            });
        }

        // ── Real MP payment ──
        const paymentApi = new Payment(client);
        const mpPayment = await paymentApi.create({
            body: {
                token,
                installments,
                payment_method_id: paymentMethodId,
                issuer_id: issuerId ? Number(issuerId) : undefined,
                transaction_amount: totalPrice,
                description: `Patitas Felices — Orden ${orderId.slice(0, 8)}`,
                external_reference: orderId,
                payer: {
                    email,
                    identification: {
                        type: identificationType,
                        number: identificationNumber.replace(/[.\-]/g, ""),
                    },
                },
            },
        });

        const mpStatus = mpPayment.status;
        let paymentStatus = "PENDING";
        let orderStatus = (order as any).status ?? "CREATED";

        switch (mpStatus) {
            case "approved":
                paymentStatus = "PAID";
                orderStatus = "PROCESSING";
                break;
            case "rejected":
            case "cancelled":
                paymentStatus = "FAILED";
                break;
            default:
                paymentStatus = "PENDING";
        }

        await prisma.order.update({
            where: { id: orderId },
            data: {
                paymentStatus,
                status: orderStatus,
                mpPaymentId: String(mpPayment.id ?? ""),
            } as any,
        });

        // ── Send confirmation email on approval ──
        if (paymentStatus === "PAID") {
            await sendOrderConfirmation({
                id: order.id,
                customerName: order.customerName,
                customerEmail: order.customerEmail,
                customerAddress: order.customerAddress,
                comuna: (order as any).comuna ?? "",
                totalPrice,
                shippingCost: (order as any).shippingCost ?? 0,
                items: order.items.map(i => ({
                    productName: i.productName,
                    quantity: i.quantity,
                    priceAtPurchase: (i as any).priceAtPurchase ?? 0,
                    selectedColor: (i as any).selectedColor ?? null,
                    provider: i.provider,
                })),
            });
        }

        return NextResponse.json({
            status: mpStatus,
            statusDetail: mpPayment.status_detail,
            orderId,
            paymentId: mpPayment.id,
        });
    } catch (error: any) {
        // Log the full MP error to Vercel logs for debugging
        console.error("[process-payment] Full error:", JSON.stringify({
            message: error?.message,
            status: error?.status,
            cause: error?.cause,
            error: error?.error,
        }, null, 2));

        // Forward MP error details if available
        const mpCause = error?.cause?.[0]?.description
            ?? error?.error
            ?? error?.message
            ?? "Error procesando el pago. Intenta nuevamente.";

        return NextResponse.json(
            { error: mpCause },
            { status: 500 }
        );
    }
}
