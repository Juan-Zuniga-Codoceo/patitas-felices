import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const orders = await prisma.order.findMany({
            include: { items: { include: { provider: true } } },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(orders);
    } catch (error) {
        console.error("Orders GET error:", error);
        return NextResponse.json({ error: "Error fetching orders" }, { status: 500 });
    }
}
