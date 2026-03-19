import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { CartProvider } from "@/components/CartProvider";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { ExitIntentPopup } from "@/components/ExitIntentPopup";
import Script from "next/script";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? "https://patitasfelices.cl"),
  title: {
    default: "Patitas Felices | Pet Shop Premium Chile 🐾",
    template: "%s — Patitas Felices",
  },
  description:
    "Descubre lo mejor para tus perros y gatos. Envíos a todo Chile con Blue Express y Starken. Pago seguro con Mercado Pago.",
  keywords: ["pet shop chile", "productos mascotas", "comida perros", "accesorios gatos", "envío mascotas chile"],
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    type: "website",
    locale: "es_CL",
    siteName: "Patitas Felices",
    images: [{ url: "/og-default.png", width: 1200, height: 630 }],
  },
  alternates: {
    canonical: "/",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${poppins.variable} font-sans antialiased text-brand-graphite`}>
        {process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_CLARITY_ID && (
          <Script
            id="microsoft-clarity"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(c,l,a,r,i,t,y){
                    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_ID}");
              `,
            }}
          />
        )}
        <CartProvider>
          {children}
          <FloatingWhatsApp />
          <ExitIntentPopup />
        </CartProvider>
      </body>
    </html>
  );
}
