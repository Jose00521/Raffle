import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import jwt from 'jsonwebtoken';

// Rotas que não precisam de autenticação
const publicRoutes: { path: string; whenAuthenticated: 'redirect' | 'next' }[] = [
  { path: '/', whenAuthenticated: 'next' },
  { path: '/login', whenAuthenticated: 'redirect' },
  { path: '/cadastro-participante', whenAuthenticated: 'redirect' },
  { path: '/cadastro-criador', whenAuthenticated: 'redirect' },
  { path: '/cadastro-sucesso', whenAuthenticated: 'redirect' },
  { path: '/cadastro-tipo', whenAuthenticated: 'redirect' },
] as const;

const publicDynamicRoutes: { path: string; whenAuthenticated: 'redirect' | 'next' }[] = [
  { path: '/campanhas', whenAuthenticated: 'next' },

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
  const publicRoute = publicRoutes.find(route => route.path === path) || publicDynamicRoutes.find(route => path.startsWith(route.path));
  const creatorRoute = creatorRoutes.find(route => route === path);
  const participantRoute = participantRoutes.find(route => route === path);
  const adminRoute = adminRoutes.find(route => route === path);

  // Buscar o cookie correto baseado no ambiente
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieName = isProduction ? '__Secure-next-auth.session-token' : 'next-auth.session-token';
  const tokenRequest = request.cookies.get(cookieName);
  
  let token = null as any;
  
  if (tokenRequest) {
    try {
      token = jwt.decode(tokenRequest.value);
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      token = null;
    }
  }

  // Log para debug (apenas em produção quando necessário)
  if (isProduction && path.includes('/login')) {
    console.log('[Middleware Debug]', {
      path,
      cookieName,
      hasToken: !!token,
      tokenRole: token?.role,
      isPublicRoute: !!publicRoute
    });
  }

  if (!token && publicRoute) {
    return NextResponse.next();
  }

  if (!token && !publicRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED;
    return NextResponse.redirect(redirectUrl);
  }

  if (token && publicRoute && publicRoute.whenAuthenticated === 'redirect') {
    const redirectUrl = request.nextUrl.clone();
    if (token.role === 'participant' || token.role === 'user') {
      redirectUrl.pathname = '/dashboard/participante';
    } else if (token.role === 'creator') {
      redirectUrl.pathname = '/dashboard/criador';
    } else if (token.role === 'admin') {
      redirectUrl.pathname = '/dashboard/admin';
    }
    
    if (isProduction) {
      console.log('[Middleware] Redirecionando usuário autenticado:', {
        from: path,
        to: redirectUrl.pathname,
        role: token.role
      });
    }
    
    return NextResponse.redirect(redirectUrl);
  }

  if (token && !publicRoute) {
    if (token.role === 'creator' && (participantRoute || adminRoute)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/dashboard/criador';
      return NextResponse.redirect(redirectUrl);
    } else if ((token.role === 'participant' || token.role === 'user') && (creatorRoute || adminRoute)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/dashboard/participante';
      return NextResponse.redirect(redirectUrl);
    } else if (token.role === 'admin' && (creatorRoute || participantRoute)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/dashboard/admin';
      return NextResponse.redirect(redirectUrl);
    } else {
      return NextResponse.next();
    }
  }
}

export const config = {
  matcher: [
   '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txticons|images|sounds|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.ico|.*\\.webp).*)',
  ],
}; 
