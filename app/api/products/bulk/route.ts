import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE /api/products/bulk — Delete multiple or all products
export async function DELETE(req: NextRequest) {
    try {
        const body = await req.json();
        // ids: string[] = specific IDs to delete; if empty or missing, delete ALL
        const ids: string[] | undefined = body?.ids;

        const whereClause = ids && ids.length > 0 ? { productId: { in: ids } } : {};
        const productWhere = ids && ids.length > 0 ? { id: { in: ids } } : {};

        // Cascade manually
        await prisma.productVariant.deleteMany({ where: whereClause });
        await prisma.productImage.deleteMany({ where: whereClause });
        await prisma.review.deleteMany({ where: { productId: productWhere.id } });
        const result = await prisma.product.deleteMany({ where: productWhere });

        return NextResponse.json({ success: true, deleted: result.count });
    } catch (error) {
        console.error("[Products Bulk DELETE]", error);
        return NextResponse.json(
            { error: "Error al eliminar los productos" },
            { status: 500 }
        );
    }
}
