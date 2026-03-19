import { Cart } from "@/components/Cart";
import { ProductCard } from "@/components/ProductCard";
import { NavBar } from "@/components/NavBar";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/components/ui/Skeleton";
import { AnimatedCatalog } from "@/components/AnimatedCatalog";
import { getTopTestimonials } from "@/app/actions/testimonials";
import { HeroTestimonials } from "@/components/HeroTestimonials";

const prisma = new PrismaClient();

export const revalidate = 0;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const categoryParams = (await searchParams).category;

  const { testimonials, seoStats } = await getTopTestimonials();

  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const displayProducts = categoryParams
    ? products.filter(p => p.category === categoryParams || (categoryParams !== 'Both' && p.category === "Both"))
    : products;

  const dogs = products.filter(p => p.category === "Dog" || p.category === "Both");
  const cats = products.filter(p => p.category === "Cat" || p.category === "Both");
  const both = products.filter(p => p.category === "Both");

  return (
    <div className="min-h-screen bg-[#fafafa] pb-24">
      <NavBar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#5FAFE3] to-[#3d9bd6] text-white min-h-[500px] md:min-h-[600px] flex items-center">
        {/* Brand Ornaments */}
        <div className="absolute w-[400px] h-[400px] bg-white opacity-10 rounded-full blur-3xl -top-20 -left-20 pointer-events-none z-0"></div>
        <div className="absolute w-[300px] h-[300px] bg-brand-orange opacity-20 rounded-full blur-3xl bottom-10 -right-10 pointer-events-none z-0"></div>

        <div className="max-w-6xl mx-auto px-5 w-full relative z-10 py-12 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

            {/* Left Column: Text */}
            <div className="max-w-2xl text-center md:text-left z-10">
              <span className="inline-block py-1.5 px-4 rounded-full bg-white/20 text-white text-xs font-black tracking-widest uppercase mb-6 shadow-sm backdrop-blur-md border border-white/20">
                🐾 PetShop Premium
              </span>
              <h2 className="text-5xl md:text-7xl font-extrabold mb-6 leading-[1.1] drop-shadow-md tracking-tight text-white">
                Amor <span className="text-brand-orange drop-shadow-sm">incondicional</span><br />
                para tus patitas
              </h2>
              <p className="text-lg md:text-xl text-blue-50 mb-10 font-medium leading-relaxed max-w-lg mx-auto md:mx-0 drop-shadow-sm">
                Descubre nuestra selección exclusiva. Comodidad, nutrición y diversión a un clic de distancia. <strong className="text-white">Despacho rápido a todo Chile 🇨🇱.</strong>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mt-6">
                <Link
                  href="#ambos"
                  className="group relative overflow-hidden bg-brand-orange text-white px-8 py-4 rounded-2xl font-black text-lg text-center hover:bg-[#e68a00] transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl animate-pulse-gentle"
                >
                  <span className="relative z-10">¡Explorar Colección! 🐶🐱</span>
                  {/* Glossy Reflection */}
                  <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                </Link>
              </div>
              <HeroTestimonials testimonials={testimonials || []} seoStats={seoStats} />
            </div>

            {/* Right Column: Image */}
            <div className="relative w-full aspect-square md:aspect-auto md:h-[500px] flex justify-center items-center z-10 mt-8 md:mt-0">
              <div className="relative w-full h-full max-w-lg transition-transform duration-700 hover:-translate-y-3 hover:scale-[1.03] cursor-pointer">
                <Image
                  src="/hero-pets.png"
                  alt="Perro y gato felices"
                  fill
                  className="object-contain object-bottom drop-shadow-2xl"
                  priority={true}
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Social Proof Badges */}
      <section className="bg-white border-b border-gray-100 py-4 shadow-sm relative z-20">
        <div className="max-w-6xl mx-auto px-5 flex flex-wrap justify-center items-center gap-6 md:gap-12 text-sm md:text-base font-bold text-gray-600">
          <div className="flex items-center gap-2 text-[#4a99cc]">
            <span className="text-xl">⭐</span>
            <span>4.8/5 Clientes Felices en la V Región</span>
          </div>
          <div className="hidden md:block w-px h-6 bg-gray-200"></div>
          <div className="flex items-center gap-2 text-green-600">
            <span className="text-xl">✅</span>
            <span>Verificado por SynapseDev</span>
          </div>
          <div className="hidden md:block w-px h-6 bg-gray-200"></div>
          <div className="flex items-center gap-2 text-brand-orange">
            <span className="text-xl">📦</span>
            <span>Stock Real en Chile</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-5 mt-12 space-y-20">
        <AnimatedCatalog animationKey={categoryParams || 'all'}>
          {categoryParams ? (
            <section className="scroll-mt-24">
              <div className="flex items-center mb-8">
                <h3 className="text-3xl font-extrabold text-[#263238]">
                  {categoryParams === "Dog" ? "Para Perros 🐶" : categoryParams === "Cat" ? "Para Gatos 🐱" : "Catálogo Completo ✨"}
                </h3>
                <div className="flex-1 h-px bg-gray-200 ml-6"></div>
              </div>

              {displayProducts.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 h-80 flex flex-col shadow-sm">
                      <Skeleton className="w-full h-40 rounded-xl mb-4" />
                      <Skeleton className="w-3/4 h-5 mb-2" />
                      <Skeleton className="w-1/2 h-4 mb-4" />
                      <Skeleton className="w-full h-10 mt-auto rounded-xl" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {displayProducts.map(item => (
                    <Link key={item.id} href={`/product/${item.id}`} className="block h-full">
                      <ProductCard product={item as any} />
                    </Link>
                  ))}
                </div>
              )}
            </section>
          ) : (
            <>
              {/* Sección Perros */}
              <section id="perros" className="scroll-mt-24">
                <div className="flex items-center mb-8">
                  <h3 className="text-3xl font-extrabold text-[#263238]">Para Perros 🐶</h3>
                  <div className="flex-1 h-px bg-gray-200 ml-6"></div>
                </div>

                {dogs.length === 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 h-80 flex flex-col shadow-sm">
                        <Skeleton className="w-full h-40 rounded-xl mb-4" />
                        <Skeleton className="w-3/4 h-5 mb-2" />
                        <Skeleton className="w-1/2 h-4 mb-4" />
                        <Skeleton className="w-full h-10 mt-auto rounded-xl" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {dogs.map(dog => (
                      <Link key={dog.id} href={`/product/${dog.id}`} className="block h-full">
                        <ProductCard product={dog as any} />
                      </Link>
                    ))}
                  </div>
                )}
              </section>

              {/* Sección Gatos */}
              <section id="gatos" className="scroll-mt-24">
                <div className="flex items-center mb-8">
                  <h3 className="text-3xl font-extrabold text-[#263238]">Para Gatos 🐱</h3>
                  <div className="flex-1 h-px bg-gray-200 ml-6"></div>
                </div>

                {cats.length === 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 h-80 flex flex-col shadow-sm">
                        <Skeleton className="w-full h-40 rounded-xl mb-4" />
                        <Skeleton className="w-3/4 h-5 mb-2" />
                        <Skeleton className="w-1/2 h-4 mb-4" />
                        <Skeleton className="w-full h-10 mt-auto rounded-xl" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {cats.map(cat => (
                      <Link key={cat.id} href={`/product/${cat.id}`} className="block h-full">
                        <ProductCard product={cat as any} />
                      </Link>
                    ))}
                  </div>
                )}
              </section>

              {/* Promo Banner "Ambos" */}
              {both.length > 0 && (
                <section id="ambos" className="scroll-mt-24">
                  <div className="bg-[#263238] rounded-3xl overflow-hidden relative shadow-lg mb-12">
                    <div className="absolute inset-0 bg-black/20 z-10"></div>
                    {/* Decorative shapes */}
                    <div className="absolute w-[300px] h-[300px] bg-[#5FAFE3] opacity-20 rounded-full blur-3xl -top-20 -left-20 pointer-events-none z-0"></div>
                    <div className="absolute w-[200px] h-[200px] bg-[#FF9800] opacity-20 rounded-full blur-3xl bottom-0 right-0 pointer-events-none z-0"></div>

                    <div className="relative z-20 py-16 px-8 md:px-16 flex flex-col items-center text-center">
                      <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 text-xs font-black tracking-widest uppercase mb-6">
                        ✨ Colección Universal
                      </span>
                      <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Para Perros y Gatos</h3>
                      <p className="text-xl text-gray-300 max-w-2xl font-medium">Bebederos, camas, juguetes, accesorios y mucho más. Diseñados para compartir el confort sin importar quién mande en casa.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {both.map(item => (
                      <Link key={item.id} href={`/product/${item.id}`} className="block h-full">
                        <ProductCard product={item as any} />
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </AnimatedCatalog>
      </main>

      {/* Rich Footer */}
      <footer className="mt-24 border-t border-gray-100 bg-white">
        {/* Trust Banner */}
        <div style={{ background: "linear-gradient(135deg, #5FAFE3 0%, #3d9bd6 100%)" }} className="py-8">
          <div className="max-w-6xl mx-auto px-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-white text-center">
              {[
                { icon: "🔒", title: "Pago Seguro", desc: "Mercado Pago protege tu compra" },
                { icon: "🚚", title: "Envío a todo Chile", desc: "Blue Express y Starken" },
                { icon: "💬", title: "Soporte vía WhatsApp", desc: "Respuesta en menos de 2 hrs" },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex flex-col items-center gap-2">
                  <span className="text-3xl">{icon}</span>
                  <p className="font-black text-base">{title}</p>
                  <p className="text-blue-100 text-sm">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Links & Credits */}
        <div className="max-w-6xl mx-auto px-5 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/" className="transition-transform hover:scale-105">
              <Image
                src="/Patitas-sinfondo.png"
                alt="Patitas Felices Logo"
                width={140}
                height={140}
                className="object-contain w-[80px] md:w-[100px] h-auto drop-shadow-sm"
              />
            </Link>
            <nav className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <Link href="/seguimiento" className="hover:text-[#5FAFE3] transition font-bold" style={{ color: "#263238" }}>
                Rastrear Pedido 📦
              </Link>
              <span className="text-gray-200">|</span>
              <Link href="/politicas-de-envio" className="hover:text-[#5FAFE3] transition">Políticas de Envío</Link>
              <span className="text-gray-200">|</span>
              <Link href="/devoluciones" className="hover:text-[#5FAFE3] transition">Devoluciones</Link>
              <span className="text-gray-200">|</span>
              <Link href="/terminos-y-condiciones" className="hover:text-[#5FAFE3] transition">Términos y Condiciones</Link>
              <span className="text-gray-200">|</span>
              <a
                href="https://wa.me/56912345678"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#25D366] transition font-medium"
              >
                💬 WhatsApp
              </a>
            </nav>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
            <p>© {new Date().getFullYear()} Patitas Felices Chile. Todos los derechos reservados.</p>
            <p>Developed by <span className="font-semibold">SynapseDev</span></p>
          </div>
        </div>
      </footer>

    </div>
  );
}
