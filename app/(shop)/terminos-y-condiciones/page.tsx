import Link from "next/link";
import { Shield, CreditCard, RefreshCcw, Lock } from "lucide-react";
import type { Metadata } from "next";
import { NavBar } from "@/components/NavBar";

export const metadata: Metadata = {
    title: "Términos y Condiciones — Patitas Felices",
    description:
        "Términos y condiciones de uso de Patitas Felices: medios de pago, política de reembolso, disputas con Mercado Pago y protección de datos Ley 19.628.",
};

const SECTIONS = [
    {
        id: "1",
        title: "1. Identificación del Vendedor",
        icon: <Shield className="w-5 h-5" />,
        content: `Patitas Felices es un comercio electrónico operado bajo las leyes de la República de Chile. RUT de la empresa disponible bajo solicitud en hola@patitasfelices.cl. Domicilio comercial: Santiago, Chile.`,
    },
    {
        id: "2",
        title: "2. Medios de Pago",
        icon: <CreditCard className="w-5 h-5" />,
        content: `Aceptamos pagos mediante Mercado Pago, que incluye tarjetas de crédito y débito Visa, Mastercard y American Express, además de transferencia bancaria y pago en efectivo en puntos autorizados. Los precios se expresan en pesos chilenos (CLP) e incluyen IVA cuando corresponda.`,
    },
    {
        id: "3",
        title: "3. Proceso de Compra y Confirmación",
        icon: null,
        content: `Un contrato de compraventa se perfecciona una vez que Mercado Pago confirma el pago exitoso y el sistema genera un número de orden. Recibirás un correo electrónico de confirmación con el resumen de tu compra. Nos reservamos el derecho de cancelar órdenes en caso de error de precio evidente o falta de stock, notificando al cliente y reembolsando el 100% del pago.`,
    },
    {
        id: "4",
        title: "4. Política de Reembolso y Disputas",
        icon: <RefreshCcw className="w-5 h-5" />,
        content: `De acuerdo con la Ley N° 19.496 sobre Protección de los Derechos del Consumidor, tienes derecho a retractarte de la compra dentro de los 10 días hábiles siguientes a la recepción del producto, solicitando el reembolso sin expresión de causa.

En caso de producto defectuoso o no conforme, tienes 3 meses para ejercer la garantía legal. Los reembolsos se procesan por el mismo medio de pago original en un plazo de 5 a 10 días hábiles.

Para disputas iniciadas a través de Mercado Pago, colaboraremos activamente con el proceso de mediación proporcionando toda la documentación necesaria (comprobante de despacho, tracking, foto del producto).`,
    },
    {
        id: "5",
        title: "5. Responsabilidad del Vendedor",
        icon: null,
        content: `Patitas Felices actúa como intermediario entre el proveedor (Dropi u otros) y el cliente final. Nos comprometemos a gestionar diligentemente cualquier problema de entrega. Sin embargo, no somos responsables por demoras causadas por la empresa de transporte, fuerza mayor, dirección incorrecta proporcionada por el cliente, o situaciones fuera de nuestro control.`,
    },
    {
        id: "6",
        title: "6. Protección de Datos Personales",
        icon: <Lock className="w-5 h-5" />,
        content: `Tus datos personales (nombre, RUT, email, teléfono, dirección) son recopilados únicamente para procesar y despachar tu pedido, en conformidad con la Ley N° 19.628 sobre Protección de la Vida Privada de Chile.

Tus datos no serán vendidos ni cedidos a terceros ajenos al proceso de entrega. Puedes solicitar la rectificación o eliminación de tus datos enviando un correo a hola@patitasfelices.cl.`,
    },
    {
        id: "7",
        title: "7. Propiedad Intelectual",
        icon: null,
        content: `Todo el contenido de este sitio web (textos, imágenes, logotipos, diseño) es propiedad de Patitas Felices o sus respectivos titulares, y está protegido por las leyes de propiedad intelectual chilenas. Queda prohibida su reproducción sin autorización expresa.`,
    },
    {
        id: "8",
        title: "8. Legislación Aplicable",
        icon: null,
        content: `Estos términos se rigen por las leyes de la República de Chile. Cualquier controversia no resuelta amigablemente será sometida a los tribunales ordinarios de justicia de Santiago.

Última actualización: Marzo 2026.`,
    },
];

export default function TerminosPage() {
    return (
        <div className="min-h-screen bg-[#fafafa]">
            <NavBar />

            <main className="max-w-4xl mx-auto px-5 py-16">
                <div className="text-center mb-14">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5" style={{ backgroundColor: "#263238" }}>
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-black text-[#263238] mb-3">Términos y Condiciones</h1>
                    <p className="text-gray-500 text-lg max-w-xl mx-auto">
                        Al realizar una compra en Patitas Felices, aceptas los siguientes términos. Los redactamos de forma clara para protegerte a ti y a nosotros.
                    </p>
                </div>

                {/* Quick Nav */}
                <nav className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-10">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-wide mb-3">Contenido</p>
                    <div className="flex flex-wrap gap-2">
                        {SECTIONS.map(s => (
                            <a key={s.id} href={`#section-${s.id}`}
                                className="text-xs px-3 py-1.5 rounded-full border border-gray-200 hover:border-[#5FAFE3] hover:text-[#5FAFE3] text-gray-500 transition font-medium">
                                {s.title.split(".")[0]}. {s.title.split(". ")[1]?.split(" ").slice(0, 3).join(" ")}…
                            </a>
                        ))}
                    </div>
                </nav>

                {/* Sections */}
                <div className="space-y-6">
                    {SECTIONS.map(s => (
                        <section key={s.id} id={`section-${s.id}`} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 scroll-mt-24">
                            <h2 className="text-lg font-black text-[#263238] mb-4 flex items-center gap-2">
                                {s.icon && <span style={{ color: "#5FAFE3" }}>{s.icon}</span>}
                                {s.title}
                            </h2>
                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{s.content}</p>
                        </section>
                    ))}
                </div>

                <div className="mt-10 text-center">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: "#5FAFE3" }}>
                        ← Volver a la tienda
                    </Link>
                </div>
            </main>
        </div>
    );
}
