// import { NextResponse } from 'next/server';
// import { NextRequest } from 'next/server';
// import { getToken } from 'next-auth/jwt';

// // Rotas que não precisam de autenticação
// const publicRoutes = [
//   '/',
//   '/login',
//   '/cadastro',
//   '/rifas',
//   '/rifa',
//   '/api/auth',
//   '/api/campanha',
//   '/api/campanhas',
// ];

// // Rotas específicas para criadores
// const creatorRoutes = [
//   '/dashboard/criador',
// ];

// // Rotas específicas para participantes
// const participantRoutes = [
//   '/dashboard/participante',
// ];

// // Rotas específicas para administradores
// const adminRoutes = [
//   '/dashboard/admin',
// ];

// export async function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;
  
//   // Verificar se é uma rota pública ou recurso estático
//   if (
//     publicRoutes.some(route => pathname.startsWith(route)) ||
//     pathname.includes('/_next') ||
//     pathname.includes('/images') ||
//     pathname.includes('/favicon.ico')
//   ) {
//     return NextResponse.next();
//   }

//   // Verificar token de autenticação
//   const token = await getToken({ 
//     req: request, 
//     secret: process.env.NEXTAUTH_SECRET 
//   });

//   // Se não houver token e a rota requer autenticação, redirecionar para login
//   if (!token) {
//     const loginUrl = new URL('/login', request.url);
//     loginUrl.searchParams.set('callbackUrl', encodeURI(request.url));
//     return NextResponse.redirect(loginUrl);
//   }

//   // Verificar permissões baseadas em papel/role
//   const userRole = token.role as string;

//   // Verificar acesso às rotas de criador
//   if (pathname.startsWith('/dashboard/criador') && userRole !== 'creator' && userRole !== 'admin') {
//     return NextResponse.redirect(new URL('/dashboard', request.url));
//   }

//   // Verificar acesso às rotas de participante
//   if (pathname.startsWith('/dashboard/participante') && userRole !== 'participant' && userRole !== 'admin') {
//     return NextResponse.redirect(new URL('/dashboard', request.url));
//   }

//   // Verificar acesso às rotas de administrador
//   if (pathname.startsWith('/dashboard/admin') && userRole !== 'admin') {
//     return NextResponse.redirect(new URL('/dashboard', request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     '/((?!api\/auth).*)',
    
//     /*
//      * Corresponde a todas as rotas, exceto:
//      * 1. Recursos estáticos (/_next/, /images/, /favicon.ico, etc.)
//      * 2. Rotas de API que não sejam de autenticação (que serão protegidas individualmente)
//      */
//     '/((?!_next/static|_next/image|images|favicon.ico).*)',
//   ],
// }; 