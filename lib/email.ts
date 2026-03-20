import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "Patitas Felices <hola@mispatitasfelices.cl>";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.mispatitasfelices.cl";

// ─── Tipos ───────────────────────────────────────────────────────────────────

type OrderItemEmail = {
  productName: string;
  quantity: number;
  priceAtPurchase: number;
  selectedColor?: string | null;
  provider: { name: string };
};

type OrderEmail = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  comuna: string;
  totalPrice: number;
  shippingCost: number;
  items: OrderItemEmail[];
};

// ─── Helpers HTML ─────────────────────────────────────────────────────────────

const base = (content: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Patitas Felices</title>
</head>
<body style="margin:0;padding:0;font-family:'Helvetica Neue',Arial,sans-serif;background:#f4f7fb;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;">
    <tr><td align="center" style="padding:40px 16px;">
      <table role="presentation" width="100%" style="max-width:580px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);" cellpadding="0" cellspacing="0">

        <!-- HEADER -->
        <tr>
          <td style="background:linear-gradient(135deg,#5FAFE3 0%,#3d9bd6 100%);padding:36px 40px;text-align:center;">
            <div style="font-size:36px;margin-bottom:8px;">🐾</div>
            <span style="font-size:24px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">
              Patitas <span style="color:#FFE082;">Felices</span>
            </span>
            <p style="color:rgba(255,255,255,0.85);font-size:13px;margin:6px 0 0;">Tu PetShop de confianza en Chile</p>
          </td>
        </tr>

        <!-- CONTENT -->
        <tr><td style="padding:36px 40px;">
          ${content}
        </td></tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e8f0f8;padding:24px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">
              © ${new Date().getFullYear()} Patitas Felices Chile · <a href="${BASE_URL}/politicas-de-envio" style="color:#5FAFE3;text-decoration:none;">Políticas de Envío</a> · <a href="${BASE_URL}/terminos-y-condiciones" style="color:#5FAFE3;text-decoration:none;">T&amp;C</a>
            </p>
            <p style="margin:6px 0 0;font-size:11px;color:#cbd5e1;">Si tienes dudas escríbenos al WhatsApp +56 9 1234 5678</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

function itemsTable(items: OrderItemEmail[]) {
  return items.map(item => `
        <tr style="border-bottom:1px solid #f1f5f9;">
          <td style="padding:12px 0;">
            <span style="font-weight:700;color:#1e293b;font-size:14px;">${item.productName}</span>
            ${item.selectedColor ? `<span style="margin-left:8px;font-size:11px;background:#e2f0fd;color:#3b82f6;padding:2px 8px;border-radius:999px;">${item.selectedColor}</span>` : ""}
            <br/><span style="font-size:12px;color:#64748b;">Cant: ${item.quantity} · Proveedor: ${item.provider.name}</span>
          </td>
          <td style="padding:12px 0;text-align:right;font-weight:800;color:#5FAFE3;white-space:nowrap;">
            $${(item.priceAtPurchase * item.quantity).toLocaleString("es-CL")}
          </td>
        </tr>`).join("");
}

// ─── Email 1: Confirmación de Compra ─────────────────────────────────────────

export async function sendOrderConfirmation(order: OrderEmail, pdfBuffer?: Buffer, isCOD = false) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Email] RESEND_API_KEY no configurada. Saltando envío de email.");
    return;
  }

  const subtotal = order.totalPrice - order.shippingCost;

  const headerText = isCOD
    ? `¡Tu pedido está confirmado! 👾`
    : `¡Tu pedido fue confirmado! 🎉`;

  const subText = isCOD
    ? `Hola <strong>${order.customerName}</strong>, tu pedido Contra Entrega ha sido registrado.`
    : `Hola <strong>${order.customerName}</strong>, recibimos tu pago con éxito.`;

  const actionBlock = isCOD
    ? `<div style="background:#fff7ed;border:2px solid #FF9800;border-radius:14px;padding:20px 24px;margin:24px 0;text-align:center;">
        <div style="font-size:36px;margin-bottom:8px;">💵</div>
        <p style="margin:0;font-size:17px;font-weight:900;color:#92400e;">Ten el dinero exacto listo</p>
        <p style="margin:8px 0 0;font-size:14px;color:#b45309;">cuando el repartidor llegue a tu domicilio.</p>
        <p style="margin:12px 0 0;font-size:20px;font-weight:900;color:#FF9800;">Total: $${order.totalPrice.toLocaleString("es-CL")} CLP</p>
      </div>`
    : `<div style="text-align:center;margin:32px 0;">
        <a href="${BASE_URL}/order/${order.id}/tracking" target="_blank"
           style="display:inline-block;background:#5FAFE3;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:16px 36px;border-radius:14px;box-shadow:0 4px 14px rgba(95,175,227,0.4);">
          📍 SEGUIR MI PEDIDO
        </a>
      </div>`;

  const html = base(`
        <h2 style="margin:0 0 4px;font-size:26px;font-weight:900;color:#1e293b;">${headerText}</h2>
        <p style="margin:0 0 24px;color:#64748b;font-size:15px;">${subText}</p>

        <div style="background:#f0f9ff;border-left:4px solid #5FAFE3;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
          <p style="margin:0;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;font-weight:700;">Número de Orden</p>
          <p style="margin:4px 0 0;font-family:monospace;font-size:15px;color:#1e293b;font-weight:700;">${order.id}</p>
        </div>

        <h3 style="font-size:14px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 12px;">Productos</h3>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
          <tbody>${itemsTable(order.items)}</tbody>
        </table>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;padding:16px 20px;">
          <tr>
            <td style="font-size:13px;color:#64748b;padding:4px 0;">Subtotal</td>
            <td style="font-size:13px;color:#1e293b;font-weight:600;text-align:right;">$${subtotal.toLocaleString("es-CL")}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#64748b;padding:4px 0;">Envío a ${order.comuna}</td>
            <td style="font-size:13px;color:#1e293b;font-weight:600;text-align:right;">$${order.shippingCost.toLocaleString("es-CL")}</td>
          </tr>
          <tr>
            <td style="font-size:${isCOD ? "14px" : "16px"};color:#1e293b;font-weight:900;padding:12px 0 4px;border-top:1px solid #e2e8f0;">${isCOD ? "Total a pagar en efectivo" : "Total pagado"}</td>
            <td style="font-size:${isCOD ? "14px" : "16px"};color:${isCOD ? "#FF9800" : "#5FAFE3"};font-weight:900;text-align:right;padding:12px 0 4px;border-top:1px solid #e2e8f0;">$${order.totalPrice.toLocaleString("es-CL")}</td>
          </tr>
        </table>

        ${actionBlock}

        <div style="background:#fff7ed;border-radius:12px;padding:16px 20px;margin-top:24px;">
          <p style="margin:0;font-size:13px;color:#92400e;">🚚 <strong>Dirección de despacho:</strong> ${order.customerAddress}, ${order.comuna}</p>
          <p style="margin:8px 0 0;font-size:12px;color:#b45309;">${isCOD
      ? "El repartidor se comunicará contigo antes de la entrega."
      : "Recibirás un correo con el código de seguimiento cuando tu pedido sea despachado."
    }</p>
        </div>
    `);

  const attachments = pdfBuffer ? [
    {
      filename: `Boleta_PatitasFelices_#${order.id.slice(0, 8).toUpperCase()}.pdf`,
      content: pdfBuffer,
    }
  ] : undefined;

  const { error } = await resend.emails.send({
    from: FROM,
    to: order.customerEmail,
    subject: isCOD
      ? `📦 Pedido Contra Entrega #${order.id.slice(0, 8)} — Patitas Felices`
      : `✅ Pedido confirmado #${order.id.slice(0, 8)} — Patitas Felices`,
    html,
    attachments,
  });

  if (error) {
    console.error("[Resend] Error enviando confirmación:", error);
  } else {
    console.log(`[Resend] Confirmación enviada a ${order.customerEmail}`);
  }
}

// ─── Email 2: Notificación de Envío ──────────────────────────────────────────

export async function sendShippingNotification(opts: {
  order: Pick<OrderEmail, "id" | "customerName" | "customerEmail" | "comuna">;
  productName: string;
  providerName: string;
  trackingCode: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Email] RESEND_API_KEY no configurada. Saltando envío de email.");
    return;
  }

  const { order, productName, providerName, trackingCode } = opts;

  // Detectar carrier según proveedor y código
  const isBlueExpress = trackingCode.toUpperCase().startsWith("BX") || providerName.toLowerCase().includes("dropi");
  const carrierName = isBlueExpress ? "Blue Express" : "Starken";
  const trackingUrl = isBlueExpress
    ? `https://www.blue.cl/seguimiento/?numero=${trackingCode}`
    : `https://www.starken.cl/seguimiento?codigo=${trackingCode}`;

  const html = base(`
        <h2 style="margin:0 0 4px;font-size:26px;font-weight:900;color:#1e293b;">¡Tu pedido está en camino! 🚀</h2>
        <p style="margin:0 0 24px;color:#64748b;font-size:15px;">Hola <strong>${order.customerName}</strong>, tu pedido ha sido despachado.</p>

        <div style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);border-radius:16px;padding:24px;text-align:center;margin-bottom:24px;">
          <p style="margin:0 0 4px;font-size:12px;color:#16a34a;text-transform:uppercase;font-weight:700;letter-spacing:0.05em;">Código de Seguimiento</p>
          <p style="margin:0;font-family:monospace;font-size:28px;font-weight:900;color:#15803d;letter-spacing:2px;">${trackingCode}</p>
          <p style="margin:8px 0 0;font-size:13px;color:#4ade80;">Despachado por <strong>${carrierName}</strong></p>
        </div>

        <p style="font-size:14px;color:#475569;margin:0 0 20px;">
          📦 Producto: <strong>${productName}</strong><br/>
          📍 Destino: <strong>${order.comuna}</strong>
        </p>

        <div style="text-align:center;margin:0 0 24px;">
          <a href="${trackingUrl}" target="_blank"
             style="display:inline-block;background:#5FAFE3;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 32px;border-radius:12px;">
            🔍 Rastrear mi pedido en ${carrierName}
          </a>
        </div>

        <div style="border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;">
          <p style="margin:0;font-size:12px;color:#94a3b8;text-transform:uppercase;font-weight:700;">Número de Orden</p>
          <p style="margin:4px 0 0;font-family:monospace;font-size:13px;color:#475569;">${order.id}</p>
        </div>
    `);

  const { error } = await resend.emails.send({
    from: FROM,
    to: order.customerEmail,
    subject: `🚚 Tu pedido está en camino — ${carrierName} · ${trackingCode}`,
    html,
  });

  if (error) {
    console.error("[Resend] Error enviando notificación de envío:", error);
  } else {
    console.log(`[Resend] Notificación de envío enviada a ${order.customerEmail}`);
  }
}

// ─── Email 3: Notificación Cambio Estado de Orden ───────────────────────────

export async function sendOrderStatusUpdate(order: {
  id: string;
  customerName: string;
  customerEmail: string;
  status: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Email] RESEND_API_KEY no configurada. Saltando envío de email.");
    return;
  }

  const validStatuses: Record<string, string> = {
    "PROCESSING": "En Preparación",
    "SHIPPED": "Despachado",
    "DELIVERED": "Entregado"
  };

  const statusLabel = validStatuses[order.status];
  if (!statusLabel) return; // No enviar para CREATED u otros descononocidos

  const trackingUrl = `${BASE_URL}/order/${order.id}/tracking`;

  const html = base(`
        <h2 style="margin:0 0 4px;font-size:26px;font-weight:900;color:#1e293b;">Actualización de tu Pedido 🐾</h2>
        <p style="margin:0 0 24px;color:#64748b;font-size:15px;">Hola <strong>${order.customerName}</strong>, el estado de tu pedido ha cambiado a: <strong style="color:#5FAFE3;">${statusLabel}</strong>.</p>

        <div style="text-align:center;margin:32px 0;">
          <a href="${trackingUrl}" target="_blank"
             style="display:inline-block;background:#5FAFE3;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:16px 36px;border-radius:14px;box-shadow:0 4px 14px rgba(95,175,227,0.4);">
            📍 VER SEGUIMIENTO EN LÍNEA
          </a>
        </div>

        <div style="border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;background:#f8fafc;">
          <p style="margin:0;font-size:12px;color:#94a3b8;text-transform:uppercase;font-weight:700;">Número de Orden</p>
          <p style="margin:4px 0 0;font-family:monospace;font-size:13px;color:#475569;">${order.id}</p>
        </div>
    `);

  const { error } = await resend.emails.send({
    from: FROM,
    to: order.customerEmail,
    subject: `🔄 Actualización de Pedido: ${statusLabel} — Patitas Felices`,
    html,
  });

  if (error) {
    console.error("[Resend] Error enviando actualización de estado:", error);
  } else {
    console.log(`[Resend] Actualización de estado enviada a ${order.customerEmail}`);
  }
}
