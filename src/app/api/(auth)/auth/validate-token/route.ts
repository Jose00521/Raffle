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
  tokensPerInterval: 20 // 20 requisições por minuto
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
 * Função utilitária para introduzir um atraso controlado
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve));

/**
 * Adiciona headers de segurança à resposta
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Previne clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Previne MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // XSS Protection (legacy, mas ainda útil para browsers antigos)
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy restritiva
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy básica para APIs
  response.headers.set('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none';");
  
  // Cache control para dados sensíveis
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  response.headers.set('Pragma', 'no-cache');
  
  return response;
}

/**
 * API endpoint para validar um token JWT
 * Usado pelo hook useTokenValidation para verificar se o token ainda é válido
 */
export async function GET(request: NextRequest) {
  try {
    logger.info('[validate-token] Iniciando validação de token');
    const ip = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Aplicar rate limiting
    try {
      logger.info('[validate-token] Aplicando rate limiting...');
      await limiter.check(1, `${ip}:token-validation`);
    } catch {
      logger.warn(`[validate-token] Rate limit excedido para IP: ${ip.substring(0, 8)}***`);
      const errorResponse = NextResponse.json(
        createErrorResponse('Muitas requisições, tente novamente mais tarde', 429),
        { status: 429 }
      );
      return addSecurityHeaders(errorResponse);
    }

    // Verificar nonce para prevenir replay attacks
    const requestId = request.headers.get('X-Request-ID');
    if (!requestId) {
      logger.warn(`[validate-token] Tentativa de validação sem request ID: ${ip.substring(0, 8)}***`);
      const errorResponse = NextResponse.json(
        createErrorResponse('Cabeçalho X-Request-ID obrigatório', 400),
        { status: 400 }
      );
      return addSecurityHeaders(errorResponse);
    }

    // Validar formato do Request-ID (deve ser UUID v4)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(requestId)) {
      logger.warn(`[validate-token] Request ID inválido: ${ip.substring(0, 8)}***`);
      const errorResponse = NextResponse.json(
        createErrorResponse('Formato de Request-ID inválido', 400),
        { status: 400 }
      );
      return addSecurityHeaders(errorResponse);
    }

    // Obter o token bruto do cookie
    const sessionToken = request.cookies.get('next-auth.session-token')?.value;
    const secureSessionToken = request.cookies.get('__Secure-next-auth.session-token')?.value;
    const tokenString = sessionToken || secureSessionToken;

    logger.info('[validate-token] Verificando existência do token');
    
    // Se encontrou o token, validar
    if (tokenString) {
      try {
        // Adicionar um pequeno atraso para evitar sobrecarga em conexões lentas
        if (process.env.NODE_ENV === 'production') {
          await delay(Math.random() * 300); // Atraso de até 300ms
        }
        
        const isValid = await verifyToken(tokenString);

        logger.info('[validate-token] Token processado', { 
          valid: !!isValid,
          hasExp: !!(isValid?.exp)
        });
        
        if (!isValid) {
          logger.warn(`[validate-token] Token inválido para IP: ${ip.substring(0, 8)}***, User-Agent: ${userAgent.substring(0, 20)}***`);
          const errorResponse = NextResponse.json(
            createErrorResponse('Token inválido', 401),
            { status: 401 }
          );
          return addSecurityHeaders(errorResponse);
        }

        // Verificar se o token está próximo de expirar
        if (isValid.exp) {
          const currentTime = Math.floor(Date.now() / 1000);
          const timeToExpire = isValid.exp - currentTime;
          
          // Se faltar menos de 15 minutos para expirar, incluir aviso na resposta
          if (timeToExpire < 15 * 60) {
            logger.info('[validate-token] Token próximo de expirar, incluindo aviso na resposta');
            const warningResponse = NextResponse.json(
              { 
                message: 'Token válido',
                warning: 'Token próximo de expirar',
                expiresIn: timeToExpire
              },
              { status: 200 }
            );
            return addSecurityHeaders(warningResponse);
          }
          logger.info('[validate-token] Token válido, sem aviso de expiração');
        }
      } catch (tokenError) {
        logger.error(`[validate-token] Erro ao verificar token:`, { 
          error: tokenError instanceof Error ? tokenError.message : 'Erro desconhecido',
          ip: ip.substring(0, 8) + '***'
        });
        const errorResponse = NextResponse.json(
          createErrorResponse('Erro na verificação do token', 401),
          { status: 401 }
        );
        return addSecurityHeaders(errorResponse);
      }
    } else {
      logger.warn(`[validate-token] Token não encontrado para IP: ${ip.substring(0, 8)}***, User-Agent: ${userAgent.substring(0, 20)}***`);
      const errorResponse = NextResponse.json(
        createErrorResponse('Token não encontrado', 401),
        { status: 401 }
      );
      return addSecurityHeaders(errorResponse);
    }

    // Adicionar log de sucesso
    logger.info(`[validate-token] Token validado com sucesso para IP: ${ip.substring(0, 8)}***`);

    // Se tudo estiver OK, retornar sucesso
    const successResponse = NextResponse.json(
      { message: 'Token válido' },
      { status: 200 }
    );
    return addSecurityHeaders(successResponse);
  } catch (error) {
    logger.error('[validate-token] Erro ao validar token:', { 
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
    const errorResponse = NextResponse.json(
      createErrorResponse('Erro ao validar token', 500),
      { status: 500 }
    );
    return addSecurityHeaders(errorResponse);
  }
} 