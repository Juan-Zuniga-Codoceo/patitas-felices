import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmation } from "@/lib/email";
import crypto from "crypto";
import { generateReceiptPDFBuffer } from "@/lib/pdf";

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(req: Request) {
    try {
        const { searchParams } = new URL(req.url);

        // 1. Obtener tipo de evento y el ID del pago
        const topic = searchParams.get("topic") ?? searchParams.get("type");
        const id = searchParams.get("data.id") ?? searchParams.get("id");

        if (!id) return NextResponse.json({ ok: true });

        // Manejamos payment y payment_notification
        if (topic !== "payment" && topic !== "payment_notification") {
            return NextResponse.json({ ok: true });
        }

        // 2. Validación de Firma de Seguridad (X-Signature)
        const xSignature = req.headers.get("x-signature");
        const xRequestId = req.headers.get("x-request-id");
        const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;

        if (xSignature && xRequestId && secret) {
            const parts = xSignature.split(",");
            let ts = "";
            let v1 = "";
            for (const part of parts) {
                const [key, value] = part.split("=");
                if (key.trim() === "ts") ts = value.trim();
                if (key.trim() === "v1") v1 = value.trim();
            }

            const manifest = `id:${id};request-id:${xRequestId};ts:${ts};`;
            const hmac = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

            if (hmac !== v1) {
                console.warn("[MP Webhook] 🚨 Firma inválida (Unauthorized).");
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
        } else if (secret && (!xSignature || !xRequestId)) {
            // Si tenemos configurado un secreto, la firma es estrictamente obligatoria.
            console.warn("[MP Webhook] 🚨 Falta header x-signature o x-request-id.");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const action = req.headers.get("action") || searchParams.get("action");
        if (action && action !== "payment.created" && action !== "payment.updated") {
            return NextResponse.json({ ok: true }); // Solo procesamos estas acciones explícitas
        }

        const paymentApi = new Payment(client);
        const payment = await paymentApi.get({ id: Number(id) });

        const externalRef = payment.external_reference;
        if (!externalRef) return NextResponse.json({ ok: true });

        const order = await prisma.order.findUnique({
            where: { id: externalRef },
            include: { items: { include: { provider: true } } },
        });

        if (!order) {
            console.error(`[MP Webhook] Orden no encontrada para external_reference: ${externalRef}`);
            return NextResponse.json({ ok: true });
        }

        // 3. Control de Idempotencia
        if (order.paymentStatus === "PAID") {
            console.log(`[MP Webhook] Ignored for ${externalRef}: Already PAID`);
            return NextResponse.json({ ok: true });
        }

        let paymentStatus = "PENDING";
        let orderStatus = order.status;

        switch (payment.status) {
            case "approved":
                paymentStatus = "PAID";
                orderStatus = "PROCESSING";
                break;
            case "rejected":
            case "cancelled":
                paymentStatus = "FAILED";
                break;
            case "pending":
            case "in_process":
            default:
                paymentStatus = "PENDING";
        }

        await prisma.order.update({
            where: { id: externalRef },
            data: {
                paymentStatus,
                status: orderStatus,
                mpPaymentId: String(payment.id ?? ""),
            },
        });

        // ── Enviar email de confirmación si el pago fue aprobado ──
        if (paymentStatus === "PAID") {

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
            }).catch(e => {
                console.error("[MP Webhook] Failed to generate PDF:", e);
                return undefined;
            });

            await sendOrderConfirmation({
                id: order.id,
                customerName: order.customerName,
                customerEmail: order.customerEmail,
                customerAddress: order.customerAddress,
                comuna,
                totalPrice,
                shippingCost,
                items: payloadItems,
            }, pdfBuffer);
            console.log(`[MP Webhook] Order ${externalRef} confirmada y email disparado con PDF adjunto.`);
        } else {
            console.log(`[MP Webhook] Order ${externalRef} → paymentStatus actual: ${paymentStatus}`);
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("[MP Webhook Error]", error);
        return NextResponse.json({ ok: false, error: "Internal Error" }, { status: 500 });
    }
}
