import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const exportCsv = searchParams.get("export") === "csv";

    const subscribers = await prisma.emailSubscriber.findMany({
        orderBy: { createdAt: "desc" },
    });

    if (exportCsv) {
        const header = "Nombre,Email,Fuente,Suscrito,Fecha\n";
        const rows = subscribers
            .map(s =>
                `"${s.name ?? ""}","${s.email}","${s.source}","${s.subscribed ? "Sí" : "No"}","${s.createdAt.toISOString().slice(0, 10)}"`
            )
            .join("\n");
        return new Response(header + rows, {
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="suscriptores-patitas-felices-${Date.now()}.csv"`,
            },
        });
    }

    return NextResponse.json({ subscribers, total: subscribers.length });
}

// PATCH /api/admin/subscribers/:id — toggle subscribed status
export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id, subscribed } = await req.json();
    const updated = await prisma.emailSubscriber.update({
        where: { id },
        data: { subscribed },
    });
    return NextResponse.json({ subscriber: updated });
}
