import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmation } from "@/lib/email";
import crypto from "crypto";
import { generateReceiptPDFBuffer } from "@/lib/pdf";

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN!,
});

// Always return 200 to MercadoPago — retries happen if we return 4xx or 5xx
const OK = () => NextResponse.json({ ok: true }, { status: 200 });

export async function POST(req: Request) {
    let body: Record<string, unknown> = {};

    try {
        // Parse body (simulation sends data in body; production also sends in query params)
        try {
            body = await req.json();
        } catch {
            body = {};
        }

        const { searchParams } = new URL(req.url);

        // Accept topic/type and id from either URL query params OR body
        const topic =
            searchParams.get("topic") ??
            searchParams.get("type") ??
            (body?.type as string | undefined);

        const dataId =
            searchParams.get("data.id") ??
            ((body?.data as Record<string, unknown>)?.id as string | undefined);

        const id = dataId ?? searchParams.get("id") ?? (body?.id as string | undefined);

        if (!id || !topic) return OK();

        if (topic !== "payment" && topic !== "payment_notification") return OK();

        // ── HMAC Signature Validation ──────────────────────────────────────────
        const xSignature = req.headers.get("x-signature");
        const xRequestId = req.headers.get("x-request-id");
        const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;

        if (secret) {
            if (xSignature && xRequestId) {
                let ts = "";
                let v1 = "";
                for (const part of xSignature.split(",")) {
                    const [key, value] = part.split("=");
                    if (key?.trim() === "ts") ts = value?.trim() ?? "";
                    if (key?.trim() === "v1") v1 = value?.trim() ?? "";
                }
                const manifest = `id:${id};request-id:${xRequestId};ts:${ts};`;
                const hmac = crypto.createHmac("sha256", secret).update(manifest).digest("hex");
                if (hmac !== v1) {
                    console.warn("[MP Webhook] 🚨 Firma inválida — ignorando.");
                    // Return 200 anyway to stop retries; log the fraud attempt server-side
                    return OK();
                }
            } else {
                // Simulation requests from MP dashboard may not include x-signature
                // Only block if this is live_mode (production)
                if (body?.live_mode === true) {
                    console.warn("[MP Webhook] ⚠️ live_mode=true pero sin x-signature. Bloqueado.");
                    return OK();
                }
                // Allow through for test mode / simulation
            }
        }

        // ── Fetch Payment from MP API ──────────────────────────────────────────
        let payment;
        try {
            const paymentApi = new Payment(client);
            payment = await paymentApi.get({ id: Number(id) });
        } catch (mpError) {
            // Fake IDs in simulations won't exist in MP API — not an error on our side
            console.warn(`[MP Webhook] Payment ${id} not found in MP API (possibly a simulation):`, mpError);
            return OK();
        }

        const externalRef = payment.external_reference;
        if (!externalRef) return OK();

        const order = await prisma.order.findUnique({
            where: { id: externalRef },
            include: { items: { include: { provider: true } } },
        });

        if (!order) {
            console.warn(`[MP Webhook] Orden no encontrada para external_reference: ${externalRef}`);
            return OK();
        }

        // Idempotencia — no procesar si ya está PAID
        if (order.paymentStatus === "PAID") return OK();

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

        if (paymentStatus === "PAID") {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const o = order as any;
            const payloadItems = order.items.map((i) => ({
                productName: i.productName,
                quantity: i.quantity,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                priceAtPurchase: (i as any).priceAtPurchase ?? 0,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                selectedColor: (i as any).selectedColor ?? null,
                provider: i.provider,
            }));

            const pdfBuffer = await generateReceiptPDFBuffer({
                id: order.id,
                customerName: order.customerName,
                customerRUT: o.customerRUT ?? "",
                customerAddress: order.customerAddress,
                comuna: o.comuna ?? "",
                items: payloadItems,
                shippingCost: o.shippingCost ?? 0,
                totalPrice: o.totalPrice ?? 0,
                createdAt: order.createdAt,
            }).catch((e) => {
                console.error("[MP Webhook] Error generando PDF:", e);
                return undefined;
            });

            await sendOrderConfirmation(
                {
                    id: order.id,
                    customerName: order.customerName,
                    customerEmail: order.customerEmail,
                    customerAddress: order.customerAddress,
                    comuna: o.comuna ?? "",
                    totalPrice: o.totalPrice ?? 0,
                    shippingCost: o.shippingCost ?? 0,
                    items: payloadItems,
                },
                pdfBuffer
            );

            console.log(`[MP Webhook] ✅ Order ${externalRef} marcada PAID — email disparado.`);
        }

        return OK();
    } catch (error) {
        // Never return 5xx to MP — log internally and always respond 200
        console.error("[MP Webhook] Error inesperado:", error);
        return OK();
    }
}
