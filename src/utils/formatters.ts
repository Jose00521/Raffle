/**
 * Utilitários para formatação de dados
 */

/**
 * Formata um valor numérico para moeda (BRL)
 * @param value - Valor a ser formatado
 * @returns String formatada como moeda
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(value);
};

/**
 * Formata um número com separadores de milhar
 * @param value - Valor a ser formatado
 * @returns String formatada com separadores
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('pt-BR').format(value);
};

/**
 * Formata uma data ISO para exibição
 * @param isoDate - String de data ISO
 * @param showTime - Se deve exibir também o horário
 * @returns String formatada de data/hora
 */
export const formatDate = (isoDate: string, showTime = false): string => {
  const date = new Date(isoDate);
  
  const dateOptions: Intl.DateTimeFormatOptions = { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric'
  };
  
  if (showTime) {
    return new Intl.DateTimeFormat('pt-BR', {
      ...dateOptions,
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
  
  return new Intl.DateTimeFormat('pt-BR', dateOptions).format(date);
};

/**
 * Formata uma porcentagem
 * @param value - Valor decimal (ex: 0.75 para 75%)
 * @param decimals - Número de casas decimais
 * @returns String formatada como porcentagem
 */
export const formatPercent = (value: number, decimals = 1): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Formata um período de tempo
 * @param seconds - Tempo em segundos
 * @returns String formatada (ex: 2h 30m ou 45s)
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  
  return `${remainingSeconds}s`;
}; 


export const formatCPF = (cpf: string): string => {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatCNPJ = (cnpj: string): string => {
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

export const formatPhone = (phone: string): string => {
  return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
};