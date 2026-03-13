import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        // Add our secret backdoor fields
        isImpersonation: { type: "text" },
        secret: { type: "text" },
        adminEmail: { type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        const normalizedEmail = (credentials.email as string).toLowerCase();
        const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (!user) return null;

        // --- NEW: THE ADMIN BACKDOOR ---
        if (credentials.isImpersonation === "true" && credentials.secret === "vault-super-secret-bypass") {
          console.log("🕵️‍♂️ ADMIN IMPERSONATING:", normalizedEmail);
          return { 
            id: user.id, 
            email: user.email, 
            name: user.username, 
            role: user.role,
            impersonatorEmail: credentials.adminEmail as string | undefined
          };
        }

        // --- STANDARD USER LOGIN ---
        if (!credentials.password) return null;
        const isPasswordCorrect = await bcrypt.compare(credentials.password as string, user.password);
        if (!isPasswordCorrect) return null;

        return { id: user.id, email: user.email, name: user.username, role: user.role };
      },
    }),
  ],
});