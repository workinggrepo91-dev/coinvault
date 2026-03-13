import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
 callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        // Pass the secret email into the token if it exists
        if ((user as any).impersonatorEmail) {
           token.impersonatorEmail = (user as any).impersonatorEmail;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        session.user.role = token.role as string;
        // Expose it to the session so our AppShell can see it
        if (token.impersonatorEmail) {
           session.user.impersonatorEmail = token.impersonatorEmail as string;
        }
      }
      return session;
    },
  },
  providers: [], // We leave this empty here!
} satisfies NextAuthConfig;