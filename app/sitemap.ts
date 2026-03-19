import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const products = await prisma.product.findMany({
        select: {
            id: true,
            updatedAt: true,
        },
    });

    const productEntries: MetadataRoute.Sitemap = products.map((product: { id: string; updatedAt: Date }) => ({
        url: `https://patitasfelices.cl/product/${product.id}`,
        lastModified: product.updatedAt.toISOString(),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    return [
        {
            url: 'https://patitasfelices.cl',
            lastModified: new Date().toISOString(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: 'https://patitasfelices.cl/search',
            lastModified: new Date().toISOString(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        ...productEntries,
    ];
}
