import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { verifyToken } from '@/lib/auth/jwtUtils';
import { headers } from 'next/headers';
import { rateLimit } from '@/lib/rateLimit';
import { createErrorResponse } from '@/server/utils/errorHandler/api';
import logger from '@/lib/logger/logger';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minuto
  uniqueTokenPerInterval: 500,
  tokensPerInterval: 20 // 10 requisições por minuto
});

/**
 * Obter o IP real do cliente, considerando os headers de proxy
 */
function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // O primeiro IP na lista é o cliente original
    return forwardedFor.split(',')[0].trim();
  }
  
  // Fallback para o IP de conexão direta ou "unknown" se não disponível
  return request.headers.get('x-real-ip') || 'unknown';
}

/**
 * API endpoint para validar um token JWT
 * Usado pelo hook useTokenValidation para verificar se o token ainda é válido
 */
export async function GET(request: NextRequest) {
  try {
    logger.info('Validando token...');
    const ip = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Aplicar rate limiting
    try {
      logger.info('Aplicando rate limiting...');
      await limiter.check(10, `${ip}:token-validation`);
    } catch {
      logger.warn(`Rate limit excedido para IP: ${ip}`);
      return NextResponse.json(
        createErrorResponse('Muitas requisições, tente novamente mais tarde', 429),
        { status: 429 }
      );
    }

    // Verificar nonce para prevenir replay attacks
    const requestId = request.headers.get('X-Request-ID');
    if (!requestId) {
      logger.warn(`Tentativa de validação sem request ID: ${ip}`);
      return NextResponse.json(
        createErrorResponse('Cabeçalho X-Request-ID obrigatório', 400),
        { status: 400 }
      );
    }

    // Obter o token bruto do cookie
    const sessionToken = request.cookies.get('next-auth.session-token')?.value;
    const secureSessionToken = request.cookies.get('__Secure-next-auth.session-token')?.value;
    const tokenString = sessionToken || secureSessionToken;

    logger.info('Token bruto do cookie',tokenString);
    // Se encontrou o token, validar
    if (tokenString) {
      const isValid = await verifyToken(tokenString);

      logger.info('Token validado',isValid ? 'Sim' : 'Não');
      
      if (!isValid) {

        logger.warn(`Token inválido para IP: ${ip}, User-Agent: ${userAgent}`);

        return NextResponse.json(
          createErrorResponse('Token inválido', 401),
          { status: 401 }
        );
      }

      // Verificar se o token está próximo de expirar
      if (isValid.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        const timeToExpire = isValid.exp - currentTime;
        
        // Se faltar menos de 15 minutos para expirar, incluir aviso na resposta
        if (timeToExpire < 15 * 60) {
          logger.info('Token próximo de expirar, incluindo aviso na resposta');
          return NextResponse.json(
            { 
              message: 'Token válido',
              warning: 'Token próximo de expirar',
              expiresIn: timeToExpire
            },
            { status: 200 }
          );
        }
        logger.info('Token válido, sem aviso de expiração');
      }
    }else{
      logger.warn(`Token não encontrado para IP: ${ip}, User-Agent: ${userAgent}`);
      return NextResponse.json(
        createErrorResponse('Token não encontrado', 401),
        { status: 401 }
      );
    }

    // Adicionar log de sucesso
    logger.info(`Token validado com sucesso para IP: ${ip}, User-Agent: ${userAgent}`);

    // Se tudo estiver OK, retornar sucesso
    return NextResponse.json(
      { message: 'Token válido' },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Erro ao validar token:', error);
    return NextResponse.json(
      { message: 'Erro ao validar token' },
      { status: 500 }
    );
  }
} 