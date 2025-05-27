'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

/**
 * Hook para validar o token JWT no lado do cliente
 * Utiliza o useSession do NextAuth e adiciona uma camada extra de validação
 * Redireciona para a página de login se o token for inválido
 */
export function useTokenValidation() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    // Função para validar o token
    const validateToken = async () => {
      try {
        setIsValidating(true);
        
        // Se não houver sessão ou o usuário estiver carregando, aguardar
        if (status === 'loading') {
          return;
        }

        // Se não houver sessão, o token é inválido
        if (!session) {
          setIsValid(false);
          router.push('/login');
          return;
        }

        // Chamar uma API para validar o token
        const response = await fetch('/api/auth/validate-token', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          // Token inválido, fazer logout e redirecionar
          setIsValid(false);
          await signOut({ redirect: false });
          router.push('/login');
          return;
        }

        // Token válido
        setIsValid(true);
      } catch (error) {
        console.error('Erro ao validar token:', error);
        setIsValid(false);
        await signOut({ redirect: false });
        router.push('/login');
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [session, status, router]);

  return { isValidating, isValid, session, status };
} 