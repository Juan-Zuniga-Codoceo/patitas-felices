import { Skeleton } from "@/components/ui/Skeleton";
import { NavBar } from "@/components/NavBar";

export default function ProductLoading() {
    return (
        <div className="min-h-screen bg-[#fafafa] pb-24">
            <NavBar />

            <main className="max-w-6xl mx-auto px-5 mt-10">
                <div className="mb-8 w-40 h-6">
                    <Skeleton className="w-full h-full" />
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Izquierda: Carrusel Skeleton */}
                        <div className="bg-gray-50 relative p-10 flex min-h-[420px] items-center justify-center">
                            <Skeleton className="w-full max-w-sm h-80 rounded-2xl" />
                        </div>

                        {/* Derecha: Info Skeleton */}
                        <div className="p-8 md:p-12 flex flex-col">
                            <Skeleton className="w-24 h-4 mb-4" /> {/* SKU */}
                            <Skeleton className="w-3/4 h-12 mb-4" /> {/* Titulo */}
                            <Skeleton className="w-1/3 h-10 mb-6" /> {/* Precio */}

                            <div className="space-y-2 mb-8">
                                <Skeleton className="w-full h-4" />
                                <Skeleton className="w-full h-4" />
                                <Skeleton className="w-5/6 h-4" />
                            </div>

                            {/* Options Skeleton */}
                            <div className="mb-8 p-6 bg-white border border-gray-100 shadow-sm rounded-3xl">
                                <Skeleton className="w-1/2 h-5 mb-4" />
                                <div className="flex gap-4">
                                    <Skeleton className="w-12 h-12 rounded-full" />
                                    <Skeleton className="w-12 h-12 rounded-full" />
                                    <Skeleton className="w-12 h-12 rounded-full" />
                                </div>
                            </div>

                            {/* Dimensiones Skeleton */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <Skeleton className="w-full h-20 rounded-2xl" />
                                <Skeleton className="w-full h-20 rounded-2xl" />
                            </div>

                            <div className="mt-auto pt-6 border-t border-gray-100">
                                <Skeleton className="w-full sm:w-64 h-14 rounded-xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
