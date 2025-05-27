/**
 * Implementação simples de rate limiting para APIs Next.js
 * Baseado no exemplo da documentação do Vercel
 */

export interface RateLimitConfig {
  interval: number; // intervalo em ms
  tokensPerInterval: number; // número de requisições permitidas por intervalo
  uniqueTokenPerInterval: number; // número máximo de IPs rastreados
}

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

export function rateLimit(options: RateLimitConfig) {
  const { interval, tokensPerInterval, uniqueTokenPerInterval } = options;
  
  // Map para armazenar os tokens por IP
  const tokenCache = new Map<string, TokenBucket>();
  
  // Limpar cache periodicamente para evitar vazamento de memória
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of tokenCache.entries()) {
      // Remover entradas antigas (mais de 1 hora)
      if (now - bucket.lastRefill > 3600000) {
        tokenCache.delete(key);
      }
    }
  }, 60000); // Limpar a cada minuto
  
  return {
    check: async (tokens: number, key: string): Promise<void> => {
      // Limitar o tamanho do cache
      if (tokenCache.size > uniqueTokenPerInterval) {
        const oldestKey = tokenCache.keys().next().value;
        if (oldestKey) {
          tokenCache.delete(oldestKey);
        }
      }
      
      // Obter ou criar bucket para este IP
      const now = Date.now();
      const bucket = tokenCache.get(key) || { 
        tokens: tokensPerInterval,
        lastRefill: now 
      };
      
      // Recalcular tokens com base no tempo decorrido
      const timePassed = now - bucket.lastRefill;
      const refillAmount = Math.floor(timePassed / interval) * tokensPerInterval;
      
      if (refillAmount > 0) {
        bucket.tokens = Math.min(tokensPerInterval, bucket.tokens + refillAmount);
        bucket.lastRefill = now;
      }
      
      // Verificar se há tokens suficientes
      if (bucket.tokens < tokens) {
        tokenCache.set(key, bucket);
        throw new Error('Rate limit exceeded');
      }
      
      // Consumir tokens e atualizar cache
      bucket.tokens -= tokens;
      tokenCache.set(key, bucket);
    }
  };
} 