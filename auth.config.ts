// ⚠️ Este archivo SOLO usa APIs compatibles con Edge Runtime.
// NO puede importar Prisma, bcrypt ni ningún módulo de Node.js.
const authConfig = {
    pages: {
        signIn: "/admin/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }: { auth: any; request: any }) {
            const isLoggedIn = !!auth?.user;
            const isAuthRoute = nextUrl.pathname.startsWith("/admin/login");
            const isAdminRoute = nextUrl.pathname.startsWith("/admin");

            if (isAuthRoute) {
                if (isLoggedIn) {
                    return Response.redirect(new URL("/admin", nextUrl));
                }
                return true;
            }

            if (isAdminRoute) {
                return isLoggedIn;
            }

            return true;
        },
    },
    providers: [],
};

export default authConfig;
