"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getDropiProduct } from "@/lib/dropi";

export async function getProvidersStats() {
    try {
        const providers = await prisma.provider.findMany({
            include: {
                products: {
                    select: {
                        id: true,
                        sellPrice: true,
                        costPrice: true,
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return providers.map(provider => {
            const productCount = provider.products.length;
            const estimatedProfit = provider.products.reduce((acc, product) => {
                const sell = product.sellPrice || 0;
                const cost = product.costPrice || 0;
                return acc + (sell > cost ? (sell - cost) : 0);
            }, 0);

            return {
                id: provider.id,
                name: provider.name,
                type: provider.type,
                email: provider.email,
                phone: provider.phone,
                apiKey: provider.apiKey,
                productCount,
                estimatedProfit,
                status: provider.type === 'Dropi' && !provider.apiKey ? 'Desactualizado' : 'Sincronizado'
            };
        });
    } catch (error) {
        console.error("Error fetching providers stats:", error);
        return [];
    }
}

export async function syncDropiPrices(providerId: string) {
    try {
        const provider = await prisma.provider.findUnique({
            where: { id: providerId },
            include: { products: true }
        });

        if (!provider || provider.type !== "Dropi" || !provider.apiKey) {
            return { success: false, error: "Proveedor inválido o sin API Key configurada." };
        }

        const dropiProducts = provider.products.filter(p => p.dropiId);

        if (dropiProducts.length === 0) {
            return { success: false, error: "No hay productos vinculados con un ID de Dropi configurado." };
        }

        let updatedCount = 0;
        let warnings: string[] = [];

        // Iteración secuencial respetuosa para no saturar Rate Limits hipotéticos de la API externa
        for (const product of dropiProducts) {
            const dropiRes = await getDropiProduct(product.dropiId!, provider.apiKey);

            if (!dropiRes.success) {
                // Falla crítica de auth (401/403) detenemos sincronía
                if (dropiRes.error?.includes("Token de Dropi Expirado o IP Rechazada")) {
                    return { success: false, error: dropiRes.error };
                }
                warnings.push(`SKU ${product.sku || product.name}: ${dropiRes.error}`);
                continue;
            }

            const newCostPrice = dropiRes.costPrice;
            const currentSellPrice = product.sellPrice || 0;

            await prisma.product.update({
                where: { id: product.id },
                data: { costPrice: newCostPrice }
            });

            updatedCount++;

            // Validar de rentabilidad (Menor a 20%)
            if (currentSellPrice > 0 && newCostPrice > 0) {
                const margin = (currentSellPrice - newCostPrice) / currentSellPrice;
                if (margin < 0.20) {
                    warnings.push(`⚠️ ${product.name} (SKU: ${product.sku}): Margen crítico del ${(margin * 100).toFixed(1)}%`);
                }
            }
        }

        revalidatePath("/admin/providers");
        revalidatePath("/admin/products");

        if (warnings.length > 0) {
            return {
                success: true,
                message: `Sincronizados: ${updatedCount}/${dropiProducts.length} productos.`,
                error: warnings.join(" | ") // Usamos error como vehículo de warnings para que la UI use Destructive Toast/Alert
            };
        }

        return { success: true, message: `Sincronización perfecta: ${updatedCount} productos actualizados.` };
    } catch (error) {
        console.error("Error syncing Dropi:", error);
        return { success: false, error: "Error de sincronización interno con Dropi." };
    }
}

export async function upsertProvider(data: { id?: string; name: string; type: string; email?: string; phone?: string; apiKey?: string }) {
    try {
        if (data.id) {
            await prisma.provider.update({
                where: { id: data.id },
                data: {
                    name: data.name,
                    type: data.type,
                    email: data.email || null,
                    phone: data.phone || null,
                    apiKey: data.apiKey || null,
                }
            });
        } else {
            await prisma.provider.create({
                data: {
                    name: data.name,
                    type: data.type,
                    email: data.email || null,
                    phone: data.phone || null,
                    apiKey: data.apiKey || null,
                }
            });
        }
        revalidatePath("/admin/providers");
        return { success: true };
    } catch (error) {
        console.error("Error upserting provider:", error);
        return { success: false, error: "Error al guardar el proveedor." };
    }
}
