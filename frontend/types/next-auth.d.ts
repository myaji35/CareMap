import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      userType: string
      organization: string | null
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    userType: string
    organization: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    userType: string
    organization: string | null
  }
}
