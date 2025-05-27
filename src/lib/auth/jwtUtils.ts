import jwt from 'jsonwebtoken';
import { JWT } from 'next-auth/jwt';

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Verifica e decodifica um token JWT
 */
export const verifyToken = async (token: string): Promise<JWTPayload | null> => {
  try {
    const secret =  'secret';
    if (!secret) {
      console.error('JWT_SECRET não está definido no ambiente');
      return null;
    }

    const decoded = jwt.verify(token, secret,{
      algorithms: ['HS256'],
      issuer: "rifa-app-auth", // Deve corresponder ao iss usado na criação
      audience: "rifa-app-client"
    }) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return null;
  }
};

/**
 * Cria um novo token JWT
 */
export const createToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  const secret = 'secret';
  if (!secret) {
    throw new Error('JWT_SECRET não está definido no ambiente');
  }

  return jwt.sign(payload, secret, { expiresIn: '7d' });
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
    role: token.role as string
  };

  return createToken(payload);
}; 