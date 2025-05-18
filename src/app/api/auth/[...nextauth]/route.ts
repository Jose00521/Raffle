import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcrypt';
import dbConnect from '@/server/lib/dbConnect'
import { User } from '@/models/User';
import { JWT } from 'next-auth/jwt';

// Tipo para representar o usuário
interface UserDocument {
    _id: string;
    userCode?: string; // Código único no formato Snowflake ID
    email: string;
    password: string;
    name: string;
    role: string;
    phone: string;
    isActive: boolean;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// Configurar Next-Auth
const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' }
      },
      async authorize(credentials) {
        // Verificar se as credenciais foram fornecidas
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha são obrigatórios');
        }

        // Conectar ao banco de dados
        await dbConnect();

        // Buscar usuário pelo email
        const user = await User.findOne({ email: credentials.email }).select('+password').lean() as unknown as UserDocument;

        // Verificar se o usuário existe
        if (!user) {
          throw new Error('Email ou senha inválidos');
        }

        // Verificar se a senha está correta
        const isPasswordCorrect = await compare(credentials.password, user.password);
        if (!isPasswordCorrect) {
          throw new Error('Email ou senha inválidos');
        }

        // Retornar objeto de usuário sem a senha
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  callbacks: {
    // Personalizar o token JWT
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    // Personalizar o objeto de sessão
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST }; 