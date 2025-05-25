/**
 * Remove todas as máscaras de um valor (pontos, traços, barras, etc.)
 * @param value Valor com máscara
 * @returns Valor sem máscara
 */
export function removeMask(value: string): string {
  if (!value) return '';
  return value.replace(/[^\w]/g, '');
}

/**
 * Formata um CPF com a máscara padrão 000.000.000-00
 * @param cpf CPF sem formatação
 * @returns CPF formatado
 */
export function formatCPF(cpf: string): string {
  if (!cpf) return '';
  
  // Remove caracteres não numéricos
  const cleanCpf = cpf.replace(/\D/g, '');
  
  // Aplica a máscara
  if (cleanCpf.length <= 3) {
    return cleanCpf;
  } else if (cleanCpf.length <= 6) {
    return `${cleanCpf.slice(0, 3)}.${cleanCpf.slice(3)}`;
  } else if (cleanCpf.length <= 9) {
    return `${cleanCpf.slice(0, 3)}.${cleanCpf.slice(3, 6)}.${cleanCpf.slice(6)}`;
  } else {
    return `${cleanCpf.slice(0, 3)}.${cleanCpf.slice(3, 6)}.${cleanCpf.slice(6, 9)}-${cleanCpf.slice(9, 11)}`;
  }
}

/**
 * Formata um CNPJ com a máscara padrão 00.000.000/0000-00
 * @param cnpj CNPJ sem formatação
 * @returns CNPJ formatado
 */
export function formatCNPJ(cnpj: string): string {
  if (!cnpj) return '';
  
  // Remove caracteres não numéricos
  const cleanCnpj = cnpj.replace(/\D/g, '');
  
  // Aplica a máscara
  if (cleanCnpj.length <= 2) {
    return cleanCnpj;
  } else if (cleanCnpj.length <= 5) {
    return `${cleanCnpj.slice(0, 2)}.${cleanCnpj.slice(2)}`;
  } else if (cleanCnpj.length <= 8) {
    return `${cleanCnpj.slice(0, 2)}.${cleanCnpj.slice(2, 5)}.${cleanCnpj.slice(5)}`;
  } else if (cleanCnpj.length <= 12) {
    return `${cleanCnpj.slice(0, 2)}.${cleanCnpj.slice(2, 5)}.${cleanCnpj.slice(5, 8)}/${cleanCnpj.slice(8)}`;
  } else {
    return `${cleanCnpj.slice(0, 2)}.${cleanCnpj.slice(2, 5)}.${cleanCnpj.slice(5, 8)}/${cleanCnpj.slice(8, 12)}-${cleanCnpj.slice(12, 14)}`;
  }
}

/**
 * Formata um número de telefone com a máscara (00) 00000-0000
 * @param phone Telefone sem formatação
 * @returns Telefone formatado
 */
export function formatPhone(phone: string): string {
  if (!phone) return '';
  
  // Remove caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Aplica a máscara
  if (cleanPhone.length <= 2) {
    return `(${cleanPhone}`;
  } else if (cleanPhone.length <= 7) {
    return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2)}`;
  } else if (cleanPhone.length <= 11) {
    return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 7)}-${cleanPhone.slice(7)}`;
  } else {
    return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 7)}-${cleanPhone.slice(7, 11)}`;
  }
}

/**
 * Formata um CEP com a máscara padrão 00000-000
 * @param cep CEP sem formatação
 * @returns CEP formatado
 */
export function formatCEP(cep: string): string {
  if (!cep) return '';
  
  // Remove caracteres não numéricos
  const cleanCep = cep.replace(/\D/g, '');
  
  // Aplica a máscara
  if (cleanCep.length <= 5) {
    return cleanCep;
  } else {
    return `${cleanCep.slice(0, 5)}-${cleanCep.slice(5, 8)}`;
  }
}

/**
 * Formata um valor monetário com R$ e separador de milhares
 * @param value Valor numérico
 * @returns Valor formatado como moeda
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

/**
 * Formata uma data para o formato brasileiro DD/MM/YYYY
 * @param date Data a ser formatada
 * @returns Data formatada
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR').format(date);
} 