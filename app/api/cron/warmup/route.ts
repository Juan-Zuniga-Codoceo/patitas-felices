import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    // Authenticate Vercel Cron invoking the route securely
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return new NextResponse("Unauthorized Execution", { status: 401 });
    }

    try {
        // Ping Supabase to preserve the persistent connection across Edge Networks
        await prisma.$queryRaw`SELECT 1`;
        return NextResponse.json({ success: true, message: "Supabase Warmup Executed." });
    } catch (error) {
        console.error("[CRON_ERROR] Supabase Warmup Failed: ", error);
        return NextResponse.json({ success: false, error: "Database Ping Timeout" }, { status: 500 });
    }
}
