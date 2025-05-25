// Validação de CPF
export const validateCPF = (cpf: string) => {
  // Remove caracteres não numéricos
  console.log('Validando CPF:', cpf);
  
  // Garantir que temos uma string para trabalhar
  if (typeof cpf !== 'string') {
    console.error('CPF não é uma string:', cpf);
    return false;
  }
  
  const cleanCPF = cpf.replace(/\D/g, '');
  console.log('CPF limpo:', cleanCPF);
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleanCPF)) return false;
  
  // Algoritmo de validação do CPF
  let sum = 0;
  let remainder;
  
  // Primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;
  
  // Segundo dígito verificador
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;
  
  return true;
};

// Validação de CNPJ
export const validateCNPJ = (cnpj: string) => {
  // Remove caracteres não numéricos
  console.log('Validando CNPJ:', cnpj);
  
  // Garantir que temos uma string para trabalhar
  if (typeof cnpj !== 'string') {
    console.error('CNPJ não é uma string:', cnpj);
    return false;
  }
  
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  console.log('CNPJ limpo:', cleanCNPJ);
  
  // Verifica se tem 14 dígitos
  if (cleanCNPJ.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleanCNPJ)) return false;
  
  // Algoritmo de validação do CNPJ
  let size = cleanCNPJ.length - 2;
  let numbers = cleanCNPJ.substring(0, size);
  const digits = cleanCNPJ.substring(size);
  let sum = 0;
  let pos = size - 7;
  
  // Primeiro dígito verificador
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;
  
  // Segundo dígito verificador
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
};

// Validate if user is 18 years old or older
export const validateAdult = (date: Date): boolean => {
  const today = new Date();
  const eighteenYearsAgo = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate()
  );
  return date <= eighteenYearsAgo;
};

// Check password strength from 0-4
export const getPasswordStrength = (password: string): number => {
  if (!password) return 0;
  
  let strength = 0;
  
  if (password.length >= 8) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;
  
  return strength;
};

// Get strength description based on level
export const getPasswordStrengthText = (strength: number): string => {
  switch(strength) {
    case 0: return 'Digite sua senha';
    case 1: return 'Senha fraca';
    case 2: return 'Senha média';
    case 3: return 'Senha forte';
    case 4: return 'Senha muito forte';
    default: return '';
  }
}; 