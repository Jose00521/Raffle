'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { toast } from 'react-toastify';

/**
 * Hook customizado para criar um cliente de API que lida automaticamente com erros de autenticação.
 * Ele encapsula o `fetch` e, se uma resposta 401 (Unauthorized) for recebida,
 * exibe uma notificação e redireciona o usuário para a página de login.
 * 
 * @returns Um objeto contendo a função `request` para fazer chamadas de API.
 */
export function useApiClient() {
  const router = useRouter();

  const request = useCallback(
    async <T = any>(
      url: string,
      options: RequestInit = {}
    ): Promise<{ success: boolean; data?: T; message?: string }> => {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        if (response.status === 401) {
          // Token inválido ou sessão expirada!
          toast.error('Sua sessão expirou. Por favor, faça o login novamente.');
          
          // Redireciona para a página de login, guardando a página atual para redirecionar de volta.
          const callbackUrl = window.location.pathname;
          router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
          
          // Retorna uma resposta de erro padronizada
          return { success: false, message: 'Unauthorized' };
        }

        const responseData = await response.json();

        if (!response.ok) {
            // Lida com outros erros HTTP (4xx, 5xx)
            const errorMessage = responseData.message || `Erro na requisição: ${response.statusText}`;
            toast.error(errorMessage);
            return { success: false, message: errorMessage, data: responseData };
        }

        return { success: true, data: responseData as T };

      } catch (error: any) {
        // Lida com erros de rede ou outros problemas
        console.error("Erro na chamada da API:", error);
        toast.error(error.message || 'Ocorreu um erro de rede. Tente novamente.');
        return { success: false, message: error.message || 'Erro de rede' };
      }
    },
    [router]
  );

  return { request };
} 