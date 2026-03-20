"use client";

import { useEffect, useState, useCallback } from "react";
import { CreditCard, Loader2, Lock, AlertCircle, CheckCircle2 } from "lucide-react";

// ─── Card brand detection ─────────────────────────────────────────────────────
function detectBrand(num: string): string {
    const n = num.replace(/\s/g, "");
    if (/^4/.test(n)) return "visa";
    if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return "mastercard";
    if (/^3[47]/.test(n)) return "amex";
    if (/^3(?:0[0-5]|[68])/.test(n)) return "diners";
    return "unknown";
}

const BRAND_COLORS: Record<string, string> = {
    visa: "#1a1f71",
    mastercard: "#eb001b",
    amex: "#007bc1",
    diners: "#4d4d4d",
    unknown: "#9ca3af",
};

const BRAND_LABELS: Record<string, string> = {
    visa: "Visa",
    mastercard: "Mastercard",
    amex: "Amex",
    diners: "Diners",
    unknown: "",
};

// ─── Format helpers ───────────────────────────────────────────────────────────
function formatCardNumber(v: string) {
    return v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})/g, "$1 ").trim();
}

function formatExpiry(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Props = {
    orderId: string;
    totalPrice: number;
    email: string;
    identificationNumber: string;
    onSuccess: (orderId: string) => void;
    onError: (msg: string) => void;
};

type CardTokenInput = {
    cardNumber: string;
    cardExpirationMonth: string;
    cardExpirationYear: string;
    securityCode: string;
    cardholderName: string;
    identificationType: string;
    identificationNumber: string;
};

type MercadoPago = {
    createCardToken: (data: CardTokenInput) => Promise<{ id: string; luhn_validation: boolean }>;
    getPaymentMethods: (opts: { bin: string }) => Promise<{ results: { id: string; issuer: { id: string } }[] }>;
};

declare global {
    interface Window {
        MercadoPago: new (key: string, opts?: { locale: string }) => MercadoPago;
    }
}

// ─── Input component ──────────────────────────────────────────────────────────
function FormInput({
    label, error, icon, ...props
}: { label: string; error?: string; icon?: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <div>
            <label className="block text-sm font-semibold text-[#263238] mb-1.5">{label}</label>
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        {icon}
                    </div>
                )}
                <input
                    {...props}
                    className={`w-full ${icon ? "pl-9" : "px-4"} pr-4 py-2.5 border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 transition
                        ${error
                            ? "border-red-300 focus:ring-red-200 focus:border-red-400 bg-red-50"
                            : "border-gray-200 focus:ring-[#5FAFE3]/30 focus:border-[#5FAFE3] bg-white"
                        }`}
                />
            </div>
            {error && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {error}
                </p>
            )}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function PaymentForm({ orderId, totalPrice, email, identificationNumber, onSuccess, onError }: Props) {
    const [mpReady, setMpReady] = useState(false);
    const [mp, setMp] = useState<MercadoPago | null>(null);

    const [card, setCard] = useState({
        number: "",
        expiry: "",
        cvv: "",
        holderName: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [brand, setBrand] = useState("unknown");
    const [paymentMethodId, setPaymentMethodId] = useState("");
    const [issuerId, setIssuerId] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // ── Load MP SDK ────────────────────────────────────────────────────────────
    useEffect(() => {
        if (typeof window === "undefined" || window.MercadoPago) {
            if (window.MercadoPago) initMP();
            return;
        }
        const script = document.createElement("script");
        script.src = "https://sdk.mercadopago.com/js/v2";
        script.async = true;
        script.onload = () => initMP();
        document.head.appendChild(script);
        return () => { script.onload = null; };
    }, []);

    function initMP() {
        if (!process.env.NEXT_PUBLIC_MP_PUBLIC_KEY) return;
        const instance = new window.MercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY, { locale: "es-CL" });
        setMp(instance);
        setMpReady(true);
    }

    // ── Detect payment method when 6+ digits entered ──────────────────────────
    const detectPaymentMethod = useCallback(async (bin: string) => {
        if (!mp || bin.length < 6) return;
        try {
            const result = await mp.getPaymentMethods({ bin });
            if (result.results.length > 0) {
                const method = result.results[0];
                setPaymentMethodId(method.id);
                setIssuerId(String(method.issuer?.id ?? ""));
            }
        } catch {
            // silently ignore — method detection is best-effort
        }
    }, [mp]);

    // ── Field change handlers ──────────────────────────────────────────────────
    const handleCardNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCardNumber(e.target.value);
        const raw = formatted.replace(/\s/g, "");
        setCard(c => ({ ...c, number: formatted }));
        setBrand(detectBrand(raw));
        setErrors(errs => ({ ...errs, number: "" }));
        if (raw.length >= 6) detectPaymentMethod(raw.slice(0, 6));
    };

    const handleExpiry = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCard(c => ({ ...c, expiry: formatExpiry(e.target.value) }));
        setErrors(errs => ({ ...errs, expiry: "" }));
    };

    // ── Validation ─────────────────────────────────────────────────────────────
    function validate(): boolean {
        const errs: Record<string, string> = {};
        const rawNum = card.number.replace(/\s/g, "");
        if (rawNum.length < 13 || rawNum.length > 16) errs.number = "Número de tarjeta inválido";
        const [monthStr, yearStr] = (card.expiry + "/").split("/");
        const month = parseInt(monthStr, 10);
        const year = parseInt("20" + yearStr, 10);
        const now = new Date();
        if (!month || month < 1 || month > 12) errs.expiry = "Mes inválido";
        else if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) errs.expiry = "Tarjeta vencida";
        if (card.cvv.length < 3) errs.cvv = "CVV inválido";
        if (card.holderName.trim().length < 3) errs.holderName = "Ingresa el nombre como aparece en la tarjeta";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    }

    // ── Submit ─────────────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mp) return;
        if (!validate()) return;

        setLoading(true);
        setErrors({});

        try {
            const [expiryMonth, expiryYear] = card.expiry.split("/");

            // ── Tokenize using object-based API (v2 SDK) ──────────────────────
            const tokenResult = await mp.createCardToken({
                cardNumber: card.number.replace(/\s/g, ""),
                cardExpirationMonth: expiryMonth,
                cardExpirationYear: "20" + expiryYear,
                securityCode: card.cvv,
                cardholderName: card.holderName,
                identificationType: "RUT",
                identificationNumber: identificationNumber.replace(/[.\-]/g, ""),
            });

            if (!tokenResult?.id) {
                throw new Error("No se pudo tokenizar la tarjeta. Verifica los datos e intenta nuevamente.");
            }

            const res = await fetch("/api/checkout/process-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId,
                    token: tokenResult.id,
                    paymentMethodId: paymentMethodId || detectBrand(card.number.replace(/\s/g, "")),
                    issuerId: issuerId || undefined,
                    installments: 1,
                    email,
                    identificationType: "RUT",
                    identificationNumber,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error ?? "Error procesando el pago");
            }

            if (data.status === "approved") {
                setSuccess(true);
                setTimeout(() => onSuccess(orderId), 1200);
            } else if (data.status === "pending" || data.status === "in_process") {
                onSuccess(orderId);
            } else {
                throw new Error(
                    data.statusDetail === "cc_rejected_insufficient_amount"
                        ? "Fondos insuficientes en la tarjeta."
                        : data.statusDetail === "cc_rejected_bad_filled_security_code"
                            ? "Código de seguridad incorrecto."
                            : data.statusDetail === "cc_rejected_bad_filled_card_number"
                                ? "Número de tarjeta incorrecto."
                                : data.error ?? "El pago fue rechazado. Intenta con otra tarjeta."
                );
            }
        } catch (err: any) {
            onError(err.message ?? "Error inesperado al procesar el pago.");
        } finally {
            setLoading(false);
        }
    };

    // ── Success overlay ────────────────────────────────────────────────────────
    if (success) {
        return (
            <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-10 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-black text-[#263238] mb-1">¡Pago aprobado!</h3>
                <p className="text-sm text-gray-500">Redirigiendo a la confirmación…</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#5FAFE3" }}>
                        <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-lg font-black text-[#263238]">Datos de Tarjeta</h2>
                </div>
                {/* Brand badge */}
                {brand !== "unknown" && (
                    <span
                        className="text-xs font-black px-3 py-1 rounded-full text-white transition-all"
                        style={{ backgroundColor: BRAND_COLORS[brand] }}
                    >
                        {BRAND_LABELS[brand]}
                    </span>
                )}
            </div>

            {!mpReady ? (
                <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
                    <Loader2 className="w-4 h-4 animate-spin" />Cargando formulario seguro…
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4" id="mp-card-form">
                    {/* Card Number */}
                    <FormInput
                        label="Número de tarjeta *"
                        type="text"
                        inputMode="numeric"
                        placeholder="4242 4242 4242 4242"
                        value={card.number}
                        onChange={handleCardNumber}
                        maxLength={19}
                        error={errors.number}
                        icon={<CreditCard className="w-4 h-4" />}
                        // MP SDK data attributes for tokenization
                        data-checkout="cardNumber"
                        autoComplete="cc-number"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Vencimiento *"
                            type="text"
                            inputMode="numeric"
                            placeholder="MM/AA"
                            value={card.expiry}
                            onChange={handleExpiry}
                            maxLength={5}
                            error={errors.expiry}
                            autoComplete="cc-exp"
                        />
                        <FormInput
                            label="CVV *"
                            type="password"
                            inputMode="numeric"
                            placeholder="123"
                            value={card.cvv}
                            onChange={e => {
                                setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }));
                                setErrors(errs => ({ ...errs, cvv: "" }));
                            }}
                            maxLength={4}
                            error={errors.cvv}
                            data-checkout="securityCode"
                            autoComplete="cc-csc"
                        />
                    </div>

                    <FormInput
                        label="Nombre del titular *"
                        type="text"
                        placeholder="JUAN PÉREZ"
                        value={card.holderName}
                        onChange={e => {
                            setCard(c => ({ ...c, holderName: e.target.value.toUpperCase() }));
                            setErrors(errs => ({ ...errs, holderName: "" }));
                        }}
                        error={errors.holderName}
                        data-checkout="cardholderName"
                        autoComplete="cc-name"
                    />

                    {/* Visual card preview */}
                    <div
                        className="relative h-28 rounded-2xl p-5 text-white overflow-hidden select-none"
                        style={{
                            background: brand !== "unknown"
                                ? `linear-gradient(135deg, ${BRAND_COLORS[brand]}cc, ${BRAND_COLORS[brand]}88)`
                                : "linear-gradient(135deg, #5FAFE3cc, #3d9bd688)",
                        }}
                    >
                        <div className="absolute inset-0 opacity-10" style={{
                            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                            backgroundSize: "20px 20px",
                        }} />
                        <p className="font-mono text-lg tracking-widest font-bold relative z-10">
                            {card.number || "•••• •••• •••• ••••"}
                        </p>
                        <div className="flex items-end justify-between mt-3 relative z-10">
                            <div>
                                <p className="text-xs opacity-70 uppercase tracking-wide">Titular</p>
                                <p className="text-sm font-bold truncate max-w-[160px]">
                                    {card.holderName || "NOMBRE APELLIDO"}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs opacity-70 uppercase tracking-wide">Vence</p>
                                <p className="text-sm font-bold">{card.expiry || "MM/AA"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Security note */}
                    <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-xl px-4 py-2.5">
                        <Lock className="w-3.5 h-3.5 shrink-0" />
                        <span>Datos cifrados con SSL. Procesado por <strong>Mercado Pago</strong>. No almacenamos tu tarjeta.</span>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        id="mp-pay-btn"
                        disabled={loading || !mpReady}
                        className="w-full py-4 rounded-2xl font-black text-white text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-60 flex items-center justify-center gap-3 mt-2"
                        style={{
                            background: loading
                                ? "#9ca3af"
                                : "linear-gradient(135deg, #5FAFE3, #3d9bd6)",
                        }}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Procesando pago…
                            </>
                        ) : (
                            <>
                                <Lock className="w-5 h-5" />
                                Pagar ${totalPrice.toLocaleString("es-CL")} · 1 cuota
                            </>
                        )}
                    </button>
                </form>
            )}
        </div>
    );
}
