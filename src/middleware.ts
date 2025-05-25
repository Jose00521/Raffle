import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';


// Rotas que não precisam de autenticação
const publicRoutes: { path: string; whenAuthenticated: 'redirect' | 'next' }[] = [
  { path: '/', whenAuthenticated: 'next' },
  { path: '/login', whenAuthenticated: 'redirect' },
  { path: '/cadastro-participante', whenAuthenticated: 'redirect' },
  { path: '/cadastro-criador', whenAuthenticated: 'redirect' },
  { path: '/cadastro-tipo', whenAuthenticated: 'redirect' },
  { path: '/campanhas', whenAuthenticated: 'next' },
  { path: '/campanha', whenAuthenticated: 'next' },
] as const;

const REDIRECT_WHEN_NOT_AUTHENTICATED = '/login';

// Rotas específicas para criadores
const creatorRoutes = [
  '/dashboard/criador',
  '/dashboard/criador/minhas-rifas',
  '/dashboard/criador/vendas',
  '/dashboard/criador/ganhadores',
  '/dashboard/criador/premios',
  '/dashboard/criador/nova-rifa',

];

// Rotas específicas para participantes
const participantRoutes = [
  '/dashboard/participante',
  '/dashboard/participante/rifas',
  '/dashboard/participante/minhas-rifas',
  '/dashboard/participante/minhas-rifas/compradas',
  '/dashboard/participante/premios',
];

// Rotas específicas para administradores
const adminRoutes = [
  '/dashboard/admin',
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const publicRoute = publicRoutes.find(route => route.path === path);
  const creatorRoute = creatorRoutes.find(route => route === path);
  const participantRoute = participantRoutes.find(route => route === path);
  const adminRoute = adminRoutes.find(route => route === path);

  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET || 'secret'
  });
  

  if(!token && publicRoute){
    return NextResponse.next();
  }

  // if(!token && !publicRoute){
  //   const redirectUrl = request.nextUrl.clone();
  //   redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED;
  //   return NextResponse.redirect(redirectUrl);
  // }

  // if(token && publicRoute && publicRoute.whenAuthenticated === 'redirect'){
  //   const redirectUrl = request.nextUrl.clone();
  //   if(token.role === 'participant' || token.role === 'user'){
  //     redirectUrl.pathname = '/dashboard/participante';
  //   }
  //   if(token.role === 'creator'){
  //     redirectUrl.pathname = '/dashboard/criador';
  //   }
  //   if(token.role === 'admin'){
  //     redirectUrl.pathname = '/dashboard/admin';
  //   }
  //   return NextResponse.redirect(redirectUrl);
  // }

  // if(token && !publicRoute){
  //   if(token.role === 'creator' && (participantRoute || adminRoute)){

  //     const redirectUrl = request.nextUrl.clone();
  //     redirectUrl.pathname = '/dashboard/criador';
  //     return NextResponse.redirect(redirectUrl);

  //   }else if ((token.role === 'participant' || token.role === 'user') && (creatorRoute || adminRoute)){

  //     const redirectUrl = request.nextUrl.clone();
  //     redirectUrl.pathname = '/dashboard/participante';
  //     return NextResponse.redirect(redirectUrl);

  //   }else if (token.role === 'admin' && (creatorRoute || participantRoute)){

  //     const redirectUrl = request.nextUrl.clone();
  //     redirectUrl.pathname = '/dashboard/admin';
  //     return NextResponse.redirect(redirectUrl);

  //   }else{
  //     return NextResponse.next();
  //   }
    

  // }


}

export const config = {
  matcher: [
   '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}; 