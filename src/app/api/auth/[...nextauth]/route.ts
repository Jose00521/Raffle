import 'reflect-metadata';
import NextAuth, { Awaitable } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcrypt';
import { User } from '@/models/User';
import { JWT } from 'next-auth/jwt';
import Credentials from 'next-auth/providers/credentials';
import { container } from '@/server/container/container';
import { IUserAuthRepository } from '@/server/repositories/auth/userAuth';
import type { IUser } from '@/models/interfaces/IUserInterfaces';


// Configurar Next-Auth
const handler = NextAuth({
  providers: [
   CredentialsProvider({
    name: 'credentials',
    credentials: {
      phone: { label: 'Telefone', type: 'text' },
      password: { label: 'Senha', type: 'password' }
    },
    authorize: async (credentials) => {
      console.log('credentials', credentials);
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
    maxAge: 30*60, // 30 minutos
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET || 'secret',
    maxAge: 30*60, // 30 minutos
  },
  callbacks: {
    async jwt({token, user}){
      return {...token, ...user}
    },
    async session ({ session, token, user }) {
      session.user = token as any ;
      return session;
    },
    async signIn({ user }) {
      if(user.role === 'creator'  ){
        return '/dashboard/criador';
      }
      if(user.role === 'participant'){
        return '/dashboard/participante';
      }
      return true;
    }
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'secret',
});

export { handler as GET, handler as POST}; 