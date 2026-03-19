import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (!q || q.length < 2) {
        return NextResponse.json({ results: [] });
    }

    try {
        const results = await prisma.product.findMany({
            where: {
                OR: [
                    { name: { contains: q } },
                    { description: { contains: q } },
                    { sku: { contains: q } }
                ]
            },
            select: {
                id: true,
                name: true,
                price: true,
                category: true,
                // Only take the first image for thumbnail
                images: {
                    take: 1
                }
            },
            take: 5 // Limit to 5 results for Quick Search
        });

        // Format for frontend
        const formatted = results.map(r => ({
            id: r.id,
            name: r.name,
            price: r.price,
            category: r.category,
            // @ts-ignore
            imageUrl: r.images?.[0]?.url || null
        }));

        return NextResponse.json({ results: formatted });
    } catch (error) {
        console.error("[SEARCH_API]", error);
        return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }
}
