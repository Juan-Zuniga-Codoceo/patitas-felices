import { NavBar } from "@/components/NavBar";
import { Skeleton } from "@/components/ui/Skeleton";

export default function RootLoading() {
    return (
        <div className="min-h-screen bg-[#fafafa] pb-24">
            <NavBar />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-brand-blue to-blue-500 text-white relative overflow-hidden">
                <div className="absolute w-[400px] h-[400px] bg-white opacity-5 rounded-full blur-3xl -top-20 -left-20 pointer-events-none"></div>
                <div className="absolute w-[300px] h-[300px] bg-brand-orange opacity-10 rounded-full blur-3xl bottom-10 -right-10 pointer-events-none"></div>

                <div className="max-w-4xl mx-auto px-5 py-24 text-center relative z-10">
                    <span className="inline-block py-1 px-3 rounded-full bg-white/20 text-blue-50 text-sm font-semibold mb-6 shadow-sm backdrop-blur-sm">
                        PetShop Premium 🇪🇸
                    </span>
                    <h2 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight drop-shadow-sm">
                        Lo mejor para tu <br />
                        <span className="text-brand-orange">mejor amigo</span>
                    </h2>
                    <p className="text-lg md:text-xl text-blue-50 max-w-2xl mx-auto font-medium">
                        Descubre nuestra selección exclusiva. Comodidad, nutrición y diversión a un clic de distancia con envíos rápidos a todo Chile.
                    </p>
                </div>
            </section>

            {/* Main Content Skeleton */}
            <main className="max-w-6xl mx-auto px-5 mt-16 space-y-20">
                <section>
                    <div className="flex items-center mb-8">
                        <Skeleton className="w-48 h-10" />
                        <div className="flex-1 h-px bg-gray-200 ml-6"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 h-80 flex flex-col shadow-sm">
                                <Skeleton className="w-full h-40 rounded-xl mb-4" />
                                <Skeleton className="w-full h-6 mb-2" />
                                <Skeleton className="w-2/3 h-5 mb-auto" />
                                <div className="mt-4 flex items-center justify-between">
                                    <Skeleton className="w-20 h-6" />
                                    <Skeleton className="w-8 h-8 rounded-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <div className="flex items-center mb-8">
                        <Skeleton className="w-64 h-10" />
                        <div className="flex-1 h-px bg-gray-200 ml-6"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 h-80 flex flex-col shadow-sm">
                                <Skeleton className="w-full h-40 rounded-xl mb-4" />
                                <Skeleton className="w-full h-6 mb-2" />
                                <Skeleton className="w-2/3 h-5 mb-auto" />
                                <div className="mt-4 flex items-center justify-between">
                                    <Skeleton className="w-20 h-6" />
                                    <Skeleton className="w-8 h-8 rounded-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
