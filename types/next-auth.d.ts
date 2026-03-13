import NextAuth, { type DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      impersonatorEmail?: string // <-- ADDED THIS
    } & DefaultSession["user"]
  }
  interface User {
    role: string
    impersonatorEmail?: string // <-- ADDED THIS
  }
}