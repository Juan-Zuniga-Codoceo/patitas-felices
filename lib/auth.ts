import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const { PrismaClient } = await import("@prisma/client");
                const bcrypt = await import("bcrypt");
                const prisma = new PrismaClient();

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                });

                await prisma.$disconnect();

                if (!user) return null;

                const valid = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (!valid) return null;

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name ?? undefined,
                    role: user.role,
                };
            },
        }),
    ],
    pages: {
        signIn: "/admin/login",
    },
    session: { strategy: "jwt" as const },
    callbacks: {
        async jwt({ token, user }: { token: any; user: any }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }: { session: any; token: any }) {
            if (session.user) {
                session.user.role = token.role;
                session.user.id = token.id;
            }
            return session;
        },
    },
};

export default NextAuth(authOptions);
