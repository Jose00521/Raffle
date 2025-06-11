import { NextAuthOptions } from "next-auth";
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcrypt';
import { User } from '@/models/User';
import { JWT } from 'next-auth/jwt';
import Credentials from 'next-auth/providers/credentials';
import { container } from '@/server/container/container';
import { IUserAuthRepository } from '@/server/repositories/auth/userAuth';
import type { IUser } from '@/models/interfaces/IUserInterfaces';
import jsonwebtoken from 'jsonwebtoken';
import logger from '@/lib/logger/logger';


export const nextAuthOptions: NextAuthOptions = {
    providers: [
     CredentialsProvider({
      name: 'credentials',
      credentials: {
        phone: { label: 'Telefone', type: 'text' },
        password: { label: 'Senha', type: 'password' }
      },
      authorize: async (credentials) => {
        logger.info('credentials', {
          ...credentials,
          password: '********'
        });
  
        if (!credentials) {
          return null;
        }
  
        const userAuthRepository = container.resolve<IUserAuthRepository>('userAuthRepository');
  
          const user = await userAuthRepository.findByCredentials(
              credentials!.phone as string, 
              credentials!.password as string
          );
          //TODO: Implementar a lógica de autenticação
  
          //Retornar null se a autenticação falhar
          if (!user) {
              return null;
          }
          
  
          //Retornar o usuário se a autenticação for bem sucedida
          return {
              id: user.userCode as string,
              name: user.name,
              role: user.role,
              email: user.email,
              phone: user.phone,
          };
  
     }
  })
    ],
    session: {
      strategy: 'jwt',
    },
    jwt: {
      secret: process.env.NEXTAUTH_SECRET || 'secret',
      encode: ({ secret, token }) => {
        const encodedToken = jsonwebtoken.sign(
          {
            ...token,
            iss: 'rifa-app-auth',
            aud: 'rifa-app-client',
            exp: Math.floor(Date.now() / 1000) + 30 * 60,
          },
          secret,{
            algorithm: 'HS256',
          }
        )
  
        return encodedToken
      },
      decode: async ({ secret, token }) => {
        const decodedToken = jsonwebtoken.verify(token!, secret)
        return decodedToken as JWT
      },
    },
    callbacks: {
      async jwt({token, user}){
        return {...token, ...user}
      },
      async session ({ session, token, user }) {
        session.user = token as any ;
        return session;
      },
      
    },
    pages: {
      signIn: '/login',
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
    secret: process.env.NEXTAUTH_SECRET || 'secret',
  }