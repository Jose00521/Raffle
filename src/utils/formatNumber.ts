// Função para formatar valores monetários no padrão brasileiro
export const formatCurrency = (value: string | number, currencySymbol: string = 'BRL'): string => {
  // Se for null, undefined ou string vazia
  if (value === null || value === undefined || value === '') {
    return '';
  }

  // Converter para número se for string
  let numericValue: number;
  if (typeof value === 'string') {
    // Tenta extrair um número da string fornecida
    numericValue = parseCurrencyToNumber(value);
  } else {
    numericValue = value;
  }
  
  // Se o valor não for um número válido, retornar string vazia
  if (isNaN(numericValue)) {
    return '';
  }
  
  // Usar Intl.NumberFormat para formatação padronizada
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currencySymbol,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericValue);
};

/**
 * Formata um número inteiro com separadores de milhar no padrão brasileiro
 * Exemplo: 40000 -> 40.000, 2000 -> 2.000, 1000000 -> 1.000.000
 * Aceita entrada como número ou string
 */
export const formatInteger = (value: string | number): string => {
  // Se for null, undefined ou string vazia
  if (value === null || value === undefined || value === '') {
    return '';
  }

  // Converter para número
  let numericValue: number;
  if (typeof value === 'string') {
    // Remover caracteres não numéricos, exceto sinal negativo
    const cleanValue = value.replace(/[^\d\-]/g, '');
    numericValue = parseInt(cleanValue, 10);
  } else {
    numericValue = Math.floor(value); // Garantir que é um inteiro
  }
  
  // Se o valor não for um número válido, retornar string vazia
  if (isNaN(numericValue)) {
    return '';
  }
  
  // Usar Intl.NumberFormat para formatação padronizada sem casas decimais
  return new Intl.NumberFormat('pt-BR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numericValue);
};

/**
 * Converte um valor de string formatada como moeda para um número
 * Suporta diferentes formatos, como R$ 1.234,56 ou 1234.56
 */
export const parseCurrencyToNumber = (value: string | number): number => {
    // Se já for um número, retornar diretamente
    if (typeof value === 'number') {
      return value;
    }
    
    // Se for vazio ou não for string, retornar zero
    if (!value || typeof value !== 'string') {
      return 0;
    }
    
    try {
    // Remover todos os caracteres não numéricos, exceto ponto, vírgula e sinal negativo
    let cleanValue = value.replace(/[^\d.,\-]/g, '');
      
    // Verificar se é um valor negativo
    const isNegative = value.includes('-');
    
    // Se for um número simples sem formatação (sem vírgula ou ponto)
      if (/^\d+$/.test(cleanValue)) {
      return isNegative ? -parseInt(cleanValue, 10) : parseInt(cleanValue, 10);
      }
      
    // Determinar o formato usado (brasileiro ou internacional)
    const hasBrazilianFormat = cleanValue.includes(',');
    
    if (hasBrazilianFormat) {
      // Formato brasileiro (1.234,56):
      // 1. Remover pontos (separadores de milhar)
      cleanValue = cleanValue.replace(/\./g, '');
      
      // 2. Substituir vírgula por ponto para o JavaScript entender como decimal
      cleanValue = cleanValue.replace(/,/g, '.');
    }
    
    // Garantir que há apenas um ponto decimal
    const parts = cleanValue.split('.');
    if (parts.length > 2) {
      // Em caso de múltiplos pontos, consideramos apenas o último como decimal
      cleanValue = parts[0] + '.' + parts.slice(1).join('');
    }
      
      // Converter para número
    let numericValue = parseFloat(cleanValue);
    
    // Aplicar sinal negativo se necessário
    if (isNegative) {
      numericValue = -Math.abs(numericValue);
    }
      
      // Retornar 0 se não for um número válido
      return isNaN(numericValue) ? 0 : numericValue;
    } catch (error) {
      console.error("Erro ao converter valor monetário:", error);
      return 0;
    }
  };

/**
 * Formata um número para exibição durante digitação, mantendo posição do cursor
 * Útil para mostrar formatação em tempo real sem alterar a experiência de digitação
 */
export const formatCurrencyForTyping = (value: string, currency: string = 'BRL'): string => {
  if (!value) return '';
  
  // Remover todos os caracteres não numéricos
  const digits = value.replace(/\D/g, '');
  
  // Converter para centavos (as duas últimas posições são centavos)
  let valueInCents = parseInt(digits || '0', 10);
  
  // Símbolos de moeda por código
  const currencySymbols: Record<string, string> = {
    BRL: 'R$',
    USD: '$',
    EUR: '€',
    GBP: '£'
  };
  
  // Obter símbolo da moeda
  const symbol = currencySymbols[currency] || currencySymbols.BRL;
  
  // Formatar o valor
  const formatted = (valueInCents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return `${symbol} ${formatted}`;
};

/**
 * Remove a formatação de uma string monetária, retornando apenas os dígitos
 */
export const stripCurrencyFormat = (value: string): string => {
  return value.replace(/\D/g, '');
};