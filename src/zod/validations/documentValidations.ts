/**
 * Valida se um CPF é válido utilizando o algoritmo de verificação dos dígitos
 * @param cpf CPF a ser validado (somente números)
 * @returns true se o CPF for válido, false caso contrário
 */
export function isValidCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false;
  
  // Verifica se é uma sequência de dígitos repetidos (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Algoritmo de validação do CPF
  let sum = 0;
  let remainder;
  
  // Valida o primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;
  
  // Valida o segundo dígito verificador
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;
  
  return true;
}

/**
 * Valida se um CNPJ é válido utilizando o algoritmo de verificação dos dígitos
 * @param cnpj CNPJ a ser validado (somente números)
 * @returns true se o CNPJ for válido, false caso contrário
 */
export function isValidCNPJ(cnpj: string): boolean {
  // Remove caracteres não numéricos
  const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
  
  // Verifica se tem 14 dígitos
  if (cleanCNPJ.length !== 14) return false;
  
  // Verifica se é uma sequência de dígitos repetidos (ex: 11.111.111/1111-11)
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;
  
  // Algoritmo de validação do CNPJ
  let size = cleanCNPJ.length - 2;
  let numbers = cleanCNPJ.substring(0, size);
  const digits = cleanCNPJ.substring(size);
  let sum = 0;
  let pos = size - 7;
  
  // Valida o primeiro dígito verificador
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;
  
  // Valida o segundo dígito verificador
  size += 1;
  numbers = cleanCNPJ.substring(0, size);
  sum = 0;
  pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;
  
  return true;
} 