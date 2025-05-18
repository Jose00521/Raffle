import NextAuth, { DefaultSession } from "next-auth";
import { JWT as NextAuthJWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Estende o tipo de usuário padrão do Next-Auth para incluir campo de papel/role
   */
  interface User {
    role?: string;
  }

  /**
   * Estende o tipo de sessão padrão do Next-Auth para incluir campos personalizados
   */
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  /**
   * Estende o tipo JWT padrão do Next-Auth para incluir campo de papel/role
   */
  interface JWT extends NextAuthJWT {
    role?: string;
  }
} 