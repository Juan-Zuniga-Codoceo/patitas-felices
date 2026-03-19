import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE /api/products/:id — Cascade-safe single product deletion
export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        // Cascade manually to avoid FK constraint errors in Supabase
        await prisma.productVariant.deleteMany({ where: { productId: id } });
        await prisma.productImage.deleteMany({ where: { productId: id } });
        await prisma.review.deleteMany({ where: { productId: id } });
        await prisma.product.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[Product DELETE]", error);
        return NextResponse.json(
            { error: "No se pudo eliminar el producto" },
            { status: 500 }
        );
    }
}
