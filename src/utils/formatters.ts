/**
 * Formata um CPF para exibição (000.000.000-00)
 */
export const formatCPF = (cpf?: string): string => {
  if (!cpf) return '';
  
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return cleanCPF;
  
  // Formata como 000.000.000-00
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

/**
 * Formata um número de telefone para exibição ((00) 00000-0000)
 */
export const formatPhone = (phone?: string): string => {
  if (!phone) return '';
  
  // Remove caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Determina se é celular (11 dígitos) ou telefone fixo (10 dígitos)
  if (cleanPhone.length === 11) {
    // Celular: (00) 90000-0000
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleanPhone.length === 10) {
    // Fixo: (00) 0000-0000
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  // Retorna sem formatação caso não tenha o tamanho correto
  return cleanPhone;
};

/**
 * Formata um CEP para exibição (00000-000)
 */
export const formatCEP = (cep?: string): string => {
  if (!cep) return '';
  
  // Remove caracteres não numéricos
  const cleanCEP = cep.replace(/\D/g, '');
  
  // Verifica se tem 8 dígitos
  if (cleanCEP.length !== 8) return cleanCEP;
  
  // Formata como 00000-000
  return cleanCEP.replace(/(\d{5})(\d{3})/, '$1-$2');
}; 