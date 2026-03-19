import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
    const isLoginRoute = req.nextUrl.pathname === "/admin/login";

    if (isLoginRoute) {
        if (token) {
            return NextResponse.redirect(new URL("/admin", req.url));
        }
        return NextResponse.next();
    }

    if (isAdminRoute && !token) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};
