import { NextAuthOptions } from "next-auth";
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcrypt';
import { User } from '@/models/User';
import { JWT } from 'next-auth/jwt';
import { container } from '@/server/container/container';
import { IUserAuthRepository } from '@/server/repositories/auth/userAuth';
import type { IUser } from '@/models/interfaces/IUserInterfaces';
import logger from '@/lib/logger/logger';
import { createToken, verifyToken } from "./jwtUtils";

// Validar se as variáveis de ambiente necessárias estão definidas
// if (!process.env.NEXTAUTH_SECRET) {
//   logger.error({
//     message: '[auth] NEXTAUTH_SECRET não definido',
//     env: process.env.NODE_ENV
//   });
//   throw new Error('NEXTAUTH_SECRET é obrigatório');
// }

export const nextAuthOptions: NextAuthOptions = {
    providers: [
     CredentialsProvider({
      name: 'credentials',
      credentials: {
        phone: { label: 'Telefone', type: 'text' },
        password: { label: 'Senha', type: 'password' }
      },
      authorize: async (credentials, req) => {
        // Log de tentativa de login (sem dados sensíveis)
        logger.info({
          message: '[auth] Tentativa de login',
          phone: credentials?.phone ? `***${credentials.phone.slice(-4)}` : 'não fornecido',
          ip: req?.headers?.['x-forwarded-for'] || req?.headers?.['x-real-ip'] || 'desconhecido',
          userAgent: req?.headers?.['user-agent'] || 'desconhecido'
        });
  
        if (!credentials?.phone || !credentials?.password) {
          logger.warn('[auth] Credenciais incompletas fornecidas');
          return null;
        }

        // Validação básica de formato do telefone (aceita com ou sem máscara)
        const cleanPhone = credentials.phone.replace(/\D/g, '');
        
        // Deve ter 11 dígitos (DDD + 9 dígitos do celular)
        if (cleanPhone.length !== 11) {
          logger.warn('[auth] Telefone deve ter 11 dígitos');
          return null;
        }
        
        // DDD deve ser válido (11-99)
        const ddd = parseInt(cleanPhone.substring(0, 2));
        if (ddd < 11 || ddd > 99) {
          logger.warn('[auth] DDD inválido');
          return null;
        }
        
        // Celular deve começar com 9
        if (cleanPhone[2] !== '9') {
          logger.warn('[auth] Celular deve começar com 9');
          return null;
        }

        // Validação de comprimento da senha
        if (credentials.password.length < 8 || credentials.password.length > 128) {
          logger.warn('[auth] Senha com comprimento inválido');
          return null;
        }
  
        try {
          const userAuthRepository = container.resolve<IUserAuthRepository>('userAuthRepository');
  
          const user = await userAuthRepository.findByCredentials(
              credentials.phone as string, 
              credentials.password as string
          );
  
          if (!user) {
              logger.warn({
                message: '[auth] Credenciais inválidas',
                phone: `***${credentials.phone.slice(-4)}`
              });
              return null;
          }

          // Verificar se a conta está ativa
          if (!user.isActive) {
            logger.warn({
              message: '[auth] Tentativa de login com conta inativa',
              phone: `***${credentials.phone.slice(-4)}`,
              isActive: user.isActive
            });
            return null;
          }
          
          logger.info({
            message: '[auth] Login bem-sucedido',
            userId: user.userCode,
            role: user.role
          });
  
          return {
              id: user.userCode as string,
              name: user.name,
              role: user.role,
              email: user.email_display,
              phone: user.phone_display,
              userCode: user.userCode,
          };
        } catch (error) {
          logger.error({
            message: '[auth] Erro durante autenticação',
            error: error instanceof Error ? error.message : 'Erro desconhecido',
            phone: credentials?.phone ? `***${credentials.phone.slice(-4)}` : 'não fornecido'
          });
          return null;
        }
     }
  })
    ],
    session: {
      strategy: 'jwt',
      maxAge: 30 * 60, // 30 minutos
      updateAge: 15 * 60, // Atualizar sessão a cada 15 minutos se usado
    },
    jwt: {
      secret: process.env.NEXTAUTH_SECRET,
      maxAge: 30 * 60, // 30 minutos (sincronizado com session)
      encode: ({ secret, token }) => {
        try {
          const encodedToken = createToken(token as any);
          return encodedToken;
        } catch (error) {
          logger.error({
            message: '[auth] Erro ao codificar token',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          });
          throw error;
        }
      },
      decode: async ({ secret, token }) => {
        try {
          const decodedToken = await verifyToken(token!);
          return decodedToken as any;
        } catch (error) {
          logger.error({
            message: '[auth] Erro ao decodificar token',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          });
          return null;
        }
      },
    },
    callbacks: {
             async jwt({token, user, account}){
         // Adicionar dados do usuário apenas no primeiro login
         if (user) {
           token.role = user.role;
           token.phone = user.phone;
           token.email = user.email;
           token.name = user.name;
         }
         
         return token;
       },
             async session ({ session, token }) {
         // A verificação de expiração é feita automaticamente pelo JWT
         // Não precisamos verificar manualmente aqui
         
         session.user = {
           ...session.user,
           id: token.sub as string,
           role: token.role!,
           phone: token.phone!,
           email: token.email!,
         };
         
         return session;
       },
      async signIn({ user, account, profile, email, credentials }) {
        // Log de login bem-sucedido
        logger.info({
          message: '[auth] SignIn callback executado',
          userId: user.id,
          provider: account?.provider
        });
        return true;
      },
      async redirect({ url, baseUrl }) {
        // Se a URL é relativa, construir URL completa
        if (url.startsWith("/")) return `${baseUrl}${url}`;
        
        // Se a URL tem a mesma origem, permitir
        if (new URL(url).origin === baseUrl) return url;
        
        // Para redirecionamentos após login, verificar se é callback padrão
        if (url === baseUrl || url === `${baseUrl}/`) {
          // Se não há URL específica, redirecionar baseado no contexto
          // O redirecionamento específico será tratado no cliente
          return baseUrl;
        }
        
        // Caso contrário, usar baseUrl por segurança
        return baseUrl;
      }
    },
    pages: {
      signIn: '/login',
      error: '/login', // Redirecionar erros para página de login
    },
    cookies: {
      sessionToken: {
        name: process.env.NODE_ENV === 'production' 
          ? '__Secure-next-auth.session-token' 
          : 'next-auth.session-token',
                  options: {
            httpOnly: true,
            sameSite: 'strict', // Máxima proteção CSRF
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 30 * 60, // 30 minutos (igual ao JWT)
          ...(process.env.NODE_ENV === 'production' && {
            domain: process.env.NEXTAUTH_URL ? new URL(process.env.NEXTAUTH_URL).hostname : undefined
          })
        }
      },
      callbackUrl: {
        name: process.env.NODE_ENV === 'production' 
          ? '__Secure-next-auth.callback-url' 
          : 'next-auth.callback-url',
        options: {
          httpOnly: true, // Adicionar para proteção extra
          sameSite: 'strict',
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60, // 1 hora
        }
      },
      csrfToken: {
        name: process.env.NODE_ENV === 'production' 
          ? '__Host-next-auth.csrf-token' 
          : 'next-auth.csrf-token',
        options: {
          httpOnly: true,
          sameSite: 'strict',
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60, // 1 hora
        }
      },
      pkceCodeVerifier: {
        name: process.env.NODE_ENV === 'production' 
          ? '__Secure-next-auth.pkce.code_verifier' 
          : 'next-auth.pkce.code_verifier',
        options: {
          httpOnly: true,
          sameSite: 'strict',
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 15, // 15 minutos
        }
      },
      state: {
        name: process.env.NODE_ENV === 'production' 
          ? '__Secure-next-auth.state' 
          : 'next-auth.state',
        options: {
          httpOnly: true,
          sameSite: 'strict',
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 15, // 15 minutos
        }
      }
    },
    secret: process.env.NEXTAUTH_SECRET,
    // Configurações adicionais de segurança
    events: {
      async signIn({ user, account, profile, isNewUser }) {
        logger.info({
          message: '[auth] Usuário logado',
          userId: user.id,
          isNewUser,
          provider: account?.provider
        });
      },
      async signOut({ session, token }) {
        logger.info({
          message: '[auth] Usuário deslogado',
          userId: token?.sub || session?.user?.id
        });
      },
      async session({ session, token }) {
        // Log periódico de sessões ativas (apenas em debug)
        if (process.env.NODE_ENV === 'development') {
          logger.debug({
            message: '[auth] Sessão ativa verificada',
            userId: session.user?.id
          });
        }
      }
    },
    debug: process.env.NODE_ENV === 'development', // Debug apenas em desenvolvimento
  }