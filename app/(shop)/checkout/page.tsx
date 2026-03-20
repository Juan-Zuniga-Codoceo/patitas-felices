"use client";

import { useState, useMemo, Suspense } from "react";
import { useCart } from "@/components/CartProvider";
import { ComunaCombobox } from "@/components/ComunaCombobox";
import { ZONE_FACTORS } from "@/lib/comunas";
import { useRouter } from "next/navigation";
import { ShoppingBag, User, MapPin, Loader2, Package, Truck, ChevronRight, ArrowLeft, CreditCard, Banknote } from "lucide-react";
import dynamic from "next/dynamic";
import { NavBar } from "@/components/NavBar";

// Lazy-load PaymentForm (loads MP SDK via script tag on demand)
const PaymentForm = dynamic(
    () => import("@/components/checkout/PaymentForm").then(m => ({ default: m.PaymentForm })),
    {
        ssr: false, loading: () => (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex items-center justify-center gap-2 text-gray-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Cargando formulario de pago…
            </div>
        )
    }
);

const BASE_SHIPPING = 3500;
const MULTI_PROVIDER_SURCHARGE = 1500;

function formatRUT(value: string): string {
    const clean = value.replace(/[^0-9kK]/g, "").replace(/K/g, "k");
    if (clean.length <= 1) return clean;
    const body = clean.slice(0, -1);
    const dv = clean.slice(-1);
    return `${body.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}-${dv}`;
}

function FieldInput({
    label, error, prefix, ...props
}: { label: string; error?: string; prefix?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <div>
            <label className="block text-sm font-semibold text-[#263238] mb-1.5">{label}</label>
            <div className={prefix ? "flex" : ""}>
                {prefix && (
                    <span className="px-3 py-2.5 border border-r-0 border-gray-200 rounded-l-xl bg-gray-50 text-sm text-gray-500 font-medium">
                        {prefix}
                    </span>
                )}
                <input
                    {...props}
                    className={`w-full px-4 py-2.5 border border-gray-200 ${prefix ? "rounded-r-xl" : "rounded-xl"} text-sm focus:outline-none focus:ring-2 focus:ring-[#5FAFE3]/30 focus:border-[#5FAFE3] transition ${error ? "border-red-300" : ""}`}
                />
            </div>
            {error && <p className="mt-1 text-xs text-red-500">⚠ {error}</p>}
        </div>
    );
}

// ─── Stepper UI ───────────────────────────────────────────────────────────────
function Stepper({ step }: { step: 1 | 2 }) {
    return (
        <div className="flex items-center gap-3 mb-8">
            {[
                { n: 1, label: "Mis Datos" },
                { n: 2, label: "Pago" },
            ].map(({ n, label }, i) => (
                <div key={n} className="flex items-center gap-2">
                    {i > 0 && <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />}
                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold transition-all ${step >= n
                        ? "text-white shadow-sm"
                        : "text-gray-400 bg-gray-100"
                        }`} style={step >= n ? { backgroundColor: "#5FAFE3" } : {}}>
                        <span>{n}</span>
                        <span>{label}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Order Summary Card ───────────────────────────────────────────────────────
function OrderSummary({ items, totalPrice, shippingCost, grandTotal, komunaZone, comuna }: {
    items: any[];
    totalPrice: number;
    shippingCost: number;
    grandTotal: number;
    komunaZone: string;
    comuna: string;
}) {
    const uniqueProviders = [...new Set(items.map(i => i.provider))];
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
            <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-[#263238] flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-black text-[#263238]">Resumen del Pedido</h2>
            </div>

            <div className="space-y-3 mb-5">
                {items.map(item => (
                    <div key={item.id} className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#263238] truncate">{item.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.provider === "Dropi" ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"}`}>
                                    {item.provider}
                                </span>
                                <span className="text-xs text-gray-400">× {item.quantity}</span>
                            </div>
                        </div>
                        <p className="text-sm font-bold text-[#263238] shrink-0">
                            ${(item.price * item.quantity).toLocaleString("es-CL")}
                        </p>
                    </div>
                ))}
            </div>

            {uniqueProviders.length > 1 && (
                <div className="bg-orange-50 rounded-xl p-3 mb-4">
                    <p className="text-xs text-orange-700 font-semibold flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5" /> {uniqueProviders.length} proveedores detectados
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                        Recargo de ${MULTI_PROVIDER_SURCHARGE.toLocaleString("es-CL")} por envío adicional.
                    </p>
                </div>
            )}

            <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} productos)</span>
                    <span className="font-medium text-[#263238]">${totalPrice.toLocaleString("es-CL")}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5" /> Envío
                        {komunaZone && <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">{komunaZone}</span>}
                    </span>
                    <span className="font-medium text-[#263238]">
                        {comuna ? `$${shippingCost.toLocaleString("es-CL")}` : <span className="text-gray-400 italic text-xs">Selecciona comuna</span>}
                    </span>
                </div>
                <div className="flex justify-between text-base font-black text-[#263238] pt-2 border-t border-gray-100">
                    <span>Total</span>
                    <span style={{ color: "#5FAFE3" }}>${grandTotal.toLocaleString("es-CL")}</span>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function CheckoutPage() {
    const { items, totalPrice, clearCart } = useCart();
    const router = useRouter();

    const [step, setStep] = useState<1 | 2>(1);
    const [globalError, setGlobalError] = useState<string | null>(null);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<"mp" | "cod">("mp");

    // COD is available only when EVERY item in the cart allows it
    const cartAllowsCOD = items.every(i => i.allowsCOD);

    const [form, setForm] = useState({
        customerName: "",
        customerEmail: "",
        customerRUT: "",
        customerPhone: "",
        customerAddress: "",
        comuna: "",
        comunaZone: "",
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [creatingOrder, setCreatingOrder] = useState(false);

    const shippingCost = useMemo(() => {
        if (!form.comunaZone) return 0;
        const factor = ZONE_FACTORS[form.comunaZone] ?? 1;
        const uniqueProviders = new Set(items.map(i => i.provider)).size;
        return Math.round(BASE_SHIPPING * factor) + (uniqueProviders > 1 ? (uniqueProviders - 1) * MULTI_PROVIDER_SURCHARGE : 0);
    }, [form.comunaZone, items]);

    const grandTotal = totalPrice + shippingCost;

    // ── Step 1 validation + order creation ─────────────────────────────────────
    const validateStep1 = () => {
        const errs: Record<string, string> = {};
        if (!form.customerName.trim()) errs.customerName = "Requerido";
        if (!form.customerEmail.includes("@")) errs.customerEmail = "Email inválido";
        if (!form.customerRUT || form.customerRUT.length < 9) errs.customerRUT = "RUT inválido";
        if (!form.customerPhone || form.customerPhone.length < 8) errs.customerPhone = "Teléfono inválido";
        if (!form.customerAddress.trim()) errs.customerAddress = "Requerido";
        if (!form.comuna) errs.comuna = "Selecciona tu comuna";
        setFormErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleContinueToPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateStep1()) return;

        // Route to COD flow if selected
        if (paymentMethod === "cod" && cartAllowsCOD) {
            return handleCODOrder(e);
        }

        setCreatingOrder(true);
        setGlobalError(null);

        try {
            // Create the order via the MP checkout route (returns orderId + init_point)
            const payload = {
                ...form,
                shippingCost,
                items: items.map(item => ({
                    productId: item.id,
                    productName: item.name,
                    quantity: item.quantity,
                    priceAtPurchase: item.price,
                    selectedColor: undefined,
                    providerId: item.provider === "Dropi" ? "p_dropi" : "p_ext",
                    providerName: item.provider,
                })),
            };

            const res = await fetch("/api/checkout/mercado-pago", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Error creando la orden");

            setOrderId(data.orderId);
            setStep(2);
        } catch (err: any) {
            setGlobalError(err.message ?? "Error inesperado");
        } finally {
            setCreatingOrder(false);
        }
    };

    // ── COD (Contra Entrega) ─────────────────────────────────────────────────────
    const handleCODOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateStep1()) return;
        setCreatingOrder(true);
        setGlobalError(null);
        try {
            const payload = {
                ...form,
                shippingCost,
                items: items.map(item => ({
                    productId: item.id,
                    productName: item.name,
                    quantity: item.quantity,
                    priceAtPurchase: item.price,
                    selectedColor: undefined,
                    providerId: item.provider === "Dropi" ? "p_dropi" : "p_ext",
                    providerName: item.provider,
                })),
            };
            const res = await fetch("/api/checkout/cod", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Error creando la orden");
            clearCart();
            router.push(`/checkout/success?orderId=${data.orderId}&cod=true`);
        } catch (err: any) {
            setGlobalError(err.message ?? "Error inesperado");
        } finally {
            setCreatingOrder(false);
        }
    };

    const handlePaymentSuccess = (paidOrderId: string) => {
        clearCart();
        router.push(`/checkout/success?orderId=${paidOrderId}`);
    };

    const handlePaymentError = (msg: string) => {
        setGlobalError(msg);
        // Optionally scroll to error
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 rounded-2xl bg-[#5FAFE3]/10 flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag className="w-10 h-10 text-[#5FAFE3]" />
                    </div>
                    <h2 className="text-2xl font-black text-[#263238] mb-2">Carrito vacío</h2>
                    <p className="text-gray-500 mb-6">Agrega productos antes de continuar.</p>
                    <button onClick={() => router.push("/")} className="px-6 py-3 rounded-xl font-bold text-white" style={{ backgroundColor: "#5FAFE3" }}>
                        Ver Productos
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafafa]">
            <NavBar minimal />

            <main className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8">
                {/* LEFT: Steps */}
                <div>
                    <Stepper step={step} />

                    {globalError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium mb-5">
                            ⚠️ {globalError}
                        </div>
                    )}

                    {/* ─── STEP 1: Customer Data ─── */}
                    {step === 1 && (
                        <form onSubmit={handleContinueToPayment} className="space-y-6">
                            {/* Customer Info */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#5FAFE3" }}>
                                        <User className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-lg font-black text-[#263238]">Datos del Cliente</h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2">
                                        <FieldInput
                                            label="Nombre completo *"
                                            type="text"
                                            placeholder="Juan Pérez González"
                                            value={form.customerName}
                                            onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
                                            error={formErrors.customerName}
                                        />
                                    </div>
                                    <FieldInput
                                        label="RUT *"
                                        type="text"
                                        placeholder="12.345.678-9"
                                        value={form.customerRUT}
                                        onChange={e => setForm(f => ({ ...f, customerRUT: formatRUT(e.target.value) }))}
                                        maxLength={12}
                                        error={formErrors.customerRUT}
                                    />
                                    <FieldInput
                                        label="Teléfono *"
                                        type="tel"
                                        placeholder="9 8765 4321"
                                        prefix="+56"
                                        value={form.customerPhone}
                                        onChange={e => setForm(f => ({ ...f, customerPhone: e.target.value }))}
                                        error={formErrors.customerPhone}
                                    />
                                    <div className="sm:col-span-2">
                                        <FieldInput
                                            label="Email *"
                                            type="email"
                                            placeholder="juan@email.com"
                                            value={form.customerEmail}
                                            onChange={e => setForm(f => ({ ...f, customerEmail: e.target.value }))}
                                            error={formErrors.customerEmail}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#FF9800" }}>
                                        <MapPin className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-lg font-black text-[#263238]">Dirección de Despacho</h2>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-[#263238] mb-1.5">
                                            Comuna *
                                        </label>
                                        <ComunaCombobox
                                            value={form.comuna}
                                            onChange={(name, zone) => setForm(f => ({ ...f, comuna: name, comunaZone: zone }))}
                                        />
                                        {formErrors.comuna && <p className="mt-1 text-xs text-red-500">⚠ {formErrors.comuna}</p>}
                                    </div>
                                    <FieldInput
                                        label="Dirección completa *"
                                        type="text"
                                        placeholder="Av. Providencia 1234, Depto 5B"
                                        value={form.customerAddress}
                                        onChange={e => setForm(f => ({ ...f, customerAddress: e.target.value }))}
                                        error={formErrors.customerAddress}
                                    />
                                </div>
                            </div>

                            {/* ── Payment Method Selector ── */}
                            {cartAllowsCOD && (
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#263238" }}>
                                            <CreditCard className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-black text-[#263238]">Método de Pago</h2>
                                            <p className="text-xs text-gray-400">Elige cómo quieres pagar tu pedido</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {/* MercadoPago */}
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod("mp")}
                                            className={`p-4 rounded-xl border-2 transition-all text-left ${paymentMethod === "mp" ? "border-[#5FAFE3] bg-blue-50/40" : "border-gray-100 hover:border-gray-200"}`}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <CreditCard className="w-5 h-5 text-[#5FAFE3]" />
                                                <span className="font-bold text-[#263238] text-sm">Tarjeta / Transferencia</span>
                                            </div>
                                            <p className="text-xs text-gray-400">Paga ahora de forma segura con Mercado Pago</p>
                                        </button>
                                        {/* COD */}
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod("cod")}
                                            className={`p-4 rounded-xl border-2 transition-all text-left ${paymentMethod === "cod" ? "border-[#FF9800] bg-orange-50/40" : "border-gray-100 hover:border-gray-200"}`}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <Banknote className="w-5 h-5 text-[#FF9800]" />
                                                <span className="font-bold text-[#263238] text-sm">Contra Entrega</span>
                                            </div>
                                            <p className="text-xs text-gray-400">Paga en efectivo al recibir tu pedido en casa</p>
                                        </button>
                                    </div>
                                    {paymentMethod === "cod" && (
                                        <div className="mt-3 p-3 bg-orange-50 rounded-xl flex items-start gap-2">
                                            <Banknote className="w-4 h-4 text-[#FF9800] mt-0.5 shrink-0" />
                                            <p className="text-xs text-orange-700">
                                                <b>Contra Entrega:</b> Ten el monto exacto listo al recibir. El repartidor confirmará tu pedido.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={creatingOrder}
                                className="w-full py-4 rounded-2xl font-black text-white text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-60 flex items-center justify-center gap-3"
                                style={{
                                    background: paymentMethod === "cod" && cartAllowsCOD
                                        ? "linear-gradient(135deg, #FF9800, #f57c00)"
                                        : "linear-gradient(135deg, #5FAFE3, #3d8fc4)"
                                }}
                            >
                                {creatingOrder ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Preparando orden…</>
                                ) : paymentMethod === "cod" && cartAllowsCOD ? (
                                    <><Banknote className="w-5 h-5" /> Confirmar Contra Entrega <ChevronRight className="w-5 h-5" /></>
                                ) : (
                                    <>Continuar al Pago <ChevronRight className="w-5 h-5" /></>
                                )}
                            </button>
                        </form>
                    )}

                    {/* ─── STEP 2: Payment Form ─── */}
                    {step === 2 && orderId && (
                        <PaymentForm
                            orderId={orderId}
                            totalPrice={grandTotal}
                            email={form.customerEmail}
                            identificationNumber={form.customerRUT}
                            onSuccess={handlePaymentSuccess}
                            onError={handlePaymentError}
                        />
                    )}
                </div>

                {/* RIGHT: Order Summary (always visible) */}
                <div className="space-y-4">
                    <OrderSummary
                        items={items}
                        totalPrice={totalPrice}
                        shippingCost={shippingCost}
                        grandTotal={grandTotal}
                        komunaZone={form.comunaZone}
                        comuna={form.comuna}
                    />
                </div>
            </main>
        </div>
    );
}
