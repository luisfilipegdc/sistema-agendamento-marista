import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Extensão da interface User do NextAuth
   */
  interface User {
    id: string
    role: string
  }

  /**
   * Extensão da interface Session do NextAuth
   */
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  /**
   * Extensão do token JWT
   */
  interface JWT {
    id: string
    role: string
  }
}
