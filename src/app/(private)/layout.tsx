'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeProvider } from 'styled-components';
import StyledComponentsRegistry from '../../lib/registry';
import { theme } from '../../styles/theme';
import { useSession, signOut } from 'next-auth/react';
import AuthLoading from '@/components/common/AuthLoading';
import { jwtDecode } from 'jwt-decode';

// Tipos para o token e sessão
interface JwtPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  [key: string]: any;
}

interface ExtendedSession {
  accessToken?: string;
  [key: string]: any;
}

// Cache com TTL e contador de atividade
const tokenValidationCache = {
  isValid: false,
  timestamp: 0,
  TTL: 5 * 60 * 1000, // 5 minutos em milissegundos
  lastActivity: Date.now(), // Registra atividade do usuário
  inactivityThreshold: 30 * 60 * 1000 // 30 minutos de inatividade
};

// Registra atividade do usuário
const trackUserActivity = () => {
  tokenValidationCache.lastActivity = Date.now();
};

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, status, update } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login');
    },
  });
  const [isLoading, setIsLoading] = useState(false);

  // Monitora atividade do usuário
  useEffect(() => {
    // Adiciona listeners para registrar atividade
    window.addEventListener('click', trackUserActivity);
    window.addEventListener('keypress', trackUserActivity);
    window.addEventListener('scroll', trackUserActivity);
    window.addEventListener('mousemove', trackUserActivity);
    
    // Verificar inatividade a cada minuto
    const inactivityCheck = setInterval(() => {
      const now = Date.now();
      if (now - tokenValidationCache.lastActivity > tokenValidationCache.inactivityThreshold) {
        // Logout por inatividade
        signOut({ redirect: true, callbackUrl: '/login?reason=inactivity' });
      }
    }, 60000);

    return () => {
      // Limpeza
      window.removeEventListener('click', trackUserActivity);
      window.removeEventListener('keypress', trackUserActivity);
      window.removeEventListener('scroll', trackUserActivity);
      window.removeEventListener('mousemove', trackUserActivity);
      clearInterval(inactivityCheck);
    };
  }, []);

  // Validar o token apenas se necessário
  useEffect(() => {
    // Função para adicionar um atraso exponencial entre tentativas
    const delay = (attempt: number): Promise<void> => {
      const backoff = Math.min(2000 * Math.pow(2, attempt), 10000); // máximo de 10 segundos
      return new Promise(resolve => setTimeout(resolve, backoff));
    };
    
    const validateTokenIfNeeded = async () => {
      if (status === 'loading' || !session) return;
      
      const now = Date.now();
      
      // Verificação preliminar local
      try {
        // O session já está decodificado, não precisamos do jwtDecode
        if (session && session.expires) {
          // session.expires já é uma string no formato de data
          const expiryDate = new Date(session.expires);
          const timeUntilExpiry = expiryDate.getTime() - now;
          
          // Se o token estiver prestes a expirar (menos de 5 minutos), tente renová-lo
          if (timeUntilExpiry < 300000) {
            console.log("Sessão próxima de expirar, atualizando...");
            await update();
          }
        }
      } catch (error) {
        console.warn("Erro na verificação da sessão:", error);
      }
      
      // Verificar se já temos uma validação recente em cache
      if (tokenValidationCache.isValid && 
          (now - tokenValidationCache.timestamp) < tokenValidationCache.TTL) {
        return;
      }
      
      // Lógica com retry para validação do token
      let attempts = 0;
      const maxAttempts = 3;
      
      try {
        if (!tokenValidationCache.isValid) {
          setIsLoading(true);
        }
        
        while (attempts < maxAttempts) {
          try {
            // Validar o token via API com timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 20000);
            
            const response = await fetch('/api/auth/validate-token', {
              signal: controller.signal,
              headers: {
                // Adiciona um nonce para evitar cache do navegador
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'X-Request-ID': crypto.randomUUID()
              }
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
              // Se falhar com erro 401/403, não tenta novamente (token inválido)
              if (response.status === 401 || response.status === 403) {
                console.error(`Token inválido (${response.status}), redirecionando para login`);
                signOut({ redirect: true, callbackUrl: '/login?reason=invalid_token' });
                return;
              }
              
              // Para outros erros (500, 429, etc), tenta novamente
              attempts++;
              if (attempts < maxAttempts) {
                console.warn(`Tentativa ${attempts} falhou, tentando novamente após delay...`);
                await delay(attempts);
                continue;
              } else {
                throw new Error(`Erro na resposta HTTP: ${response.status}`);
              }
            }

            const data = await response.json();
            
            // Se o token estiver próximo de expirar, atualizar a sessão
            if (data.warning === 'Token próximo de expirar') {
              console.log(`Token expira em ${data.expiresIn} segundos, atualizando...`);
              await update();
            }

            // Atualizar cache de validação
            tokenValidationCache.isValid = true;
            tokenValidationCache.timestamp = now;
            
            // Se chegou aqui, a validação foi bem-sucedida
            break;
          } catch (error: any) {
            if (error.name === 'AbortError') {
              console.error(`Timeout na validação do token (tentativa ${attempts + 1}/${maxAttempts})`);
            } else {
              console.error(`Erro ao validar token (tentativa ${attempts + 1}/${maxAttempts}):`, error);
            }
            
            attempts++;
            
            // Se ainda não atingiu o máximo de tentativas, tentar novamente
            if (attempts < maxAttempts) {
              await delay(attempts);
            } else {
              // Esgotou as tentativas, repassa o erro
              throw error;
            }
          }
        }
      } catch (error: unknown) {
        const err = error as Error;
        console.error('Erro após todas as tentativas:', err);
        
        // Se foi uma falha crítica após várias tentativas, fazer logout
        signOut({ redirect: true, callbackUrl: '/login?reason=validation_error' });
      } finally {
        setIsLoading(false);
      }
    };

    validateTokenIfNeeded();
    
    // Validação periódica mais frequente para maior segurança
    const intervalId = setInterval(validateTokenIfNeeded, Math.min(tokenValidationCache.TTL, 300000));
    
    return () => clearInterval(intervalId);
  }, [session, status, router, update]);

  // Exibir carregamento apenas na primeira validação
  if (status === 'loading' || (isLoading && !tokenValidationCache.isValid)) {
    return (
      <StyledComponentsRegistry>
        <ThemeProvider theme={theme}>
          <AuthLoading message="Verificando credenciais..." />
        </ThemeProvider>
      </StyledComponentsRegistry>
    );
  }

  // Mostrar conteúdo protegido
  return (
    <StyledComponentsRegistry>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </StyledComponentsRegistry>
  );
} 