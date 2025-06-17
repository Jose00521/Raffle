import jwt from 'jsonwebtoken';
import { JWT } from 'next-auth/jwt';
import logger from '@/lib/logger/logger';

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  phone: string;
  iat?: number;
  exp?: number;
}

/**
 * Verifica e decodifica um token JWT
 */
export const verifyToken = async (token: string): Promise<JWTPayload | null> => {
  try {
    const secret =  process.env.NEXTAUTH_SECRET;
    if (!secret) {
      logger.error({
        message: '[jwt] JWT_SECRET não está definido no ambiente'
      });
      return null;
    }

    const decoded = jwt.verify(token, secret,{
      algorithms: ['HS256'],
      issuer: "rifa-app-auth", // Deve corresponder ao iss usado na criação
      audience: "rifa-app-client"
    }) as JWTPayload;
    return decoded;
  } catch (error) {
    logger.error({
      message: '[jwt] Erro ao verificar token',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
    return null;
  }
};

/**
 * Cria um novo token JWT
 */
export const createToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET não está definido no ambiente');
  }

  return jwt.sign({
    ...payload,
    iss: 'rifa-app-auth',
    aud: 'rifa-app-client',
    exp: Math.floor(Date.now() / 1000) + 30 * 60,
  },
  secret,
  {
    algorithm: 'HS256',
  }); // Sincronizado com NextAuth
};

/**
 * Extrai token de cabeçalho de autorização
 */
export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7);
};

/**
 * Converte token do Next-Auth para formato compatível com o Socket.io
 */
export const convertNextAuthTokenToSocketToken = (token: JWT): string => {
  if (!token.sub) {
    throw new Error('Token inválido: ID do usuário não encontrado');
  }

  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    userId: token.sub,
    email: token.email as string,
    name: token.name as string,
    role: token.role as string,
    phone: token.phone as string
  };

  return createToken(payload);
}; 