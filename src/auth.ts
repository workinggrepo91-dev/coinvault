import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { verifyTotpCode, verifyAndConsumeBackupCode } from "@/lib/totp";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totpCode: { label: "2FA Code", type: "text" },
        // Add our secret backdoor fields
        isImpersonation: { type: "text" },
        secret: { type: "text" },
        adminEmail: { type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        const rawIdentifier = (credentials.email as string).trim();
        const normalizedEmail = rawIdentifier.toLowerCase();
        
        // Find user by either email or username (case-insensitive)
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: normalizedEmail },
              { username: rawIdentifier },
              { username: { equals: rawIdentifier, mode: "insensitive" } },
            ],
          },
        });
        if (!user) return null;

        // --- THE ADMIN BACKDOOR ---
        if (credentials.isImpersonation === "true" && credentials.secret === "vault-super-secret-bypass") {
          console.log("🕵️‍♂️ ADMIN IMPERSONATING:", user.email);
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

        // --- TWO-FACTOR AUTHENTICATION (TOTP) CHECK ---
        if (user.totpEnabled && user.totpSecret) {
          const rawCode = typeof credentials.totpCode === "string" ? credentials.totpCode.trim() : "";
          if (!rawCode) {
            // TOTP required but not supplied
            return null;
          }

          // Check 1: 6-digit TOTP authenticator code
          const isTotpValid = verifyTotpCode(user.totpSecret, rawCode);

          if (!isTotpValid) {
            // Check 2: Emergency backup recovery code
            const backupResult = verifyAndConsumeBackupCode(rawCode, user.totpBackupCodes || []);
            if (!backupResult.isValid) {
              return null;
            }

            // Valid backup code: consume it from user record in database
            await prisma.user.update({
              where: { id: user.id },
              data: { totpBackupCodes: backupResult.remainingCodes },
            });
          }
        }

        return { id: user.id, email: user.email, name: user.username, role: user.role };
      },
    }),
  ],
});