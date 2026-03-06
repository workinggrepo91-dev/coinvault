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
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ LOGIN FAILED: Missing email or password");
          return null;
        }

        const normalizedEmail = (credentials.email as string).toLowerCase();

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!user) {
          console.log(`❌ LOGIN FAILED: No user found with email ${normalizedEmail}`);
          return null;
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordCorrect) {
          console.log("❌ LOGIN FAILED: Password does not match");
          return null;
        }

        console.log("✅ LOGIN SUCCESSFUL for:", normalizedEmail);
        
        return { 
          id: user.id, 
          email: user.email, 
          name: user.username,
          role: user.role 
        };
      },
    }),
  ],
});