import 'reflect-metadata';
import NextAuth, { Awaitable } from 'next-auth';
import { nextAuthOptions } from '@/lib/auth/nextAuthOptions';


// Configurar Next-Auth
const handler = NextAuth(nextAuthOptions);

export { handler as GET, handler as POST}; 