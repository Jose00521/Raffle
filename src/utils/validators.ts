// Validação de CPF
export const validateCPF = (cpf: string): boolean => {
  try {
    // Remove caracteres especiais
    console.log('cpf', cpf);
    const cpfClean = cpf.replace(/[^\d]/g, '');
    
    // Verifica se tem 11 dígitos
    if (cpfClean.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpfClean)) return false;
    
    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpfClean.charAt(i)) * (10 - i);
    }
    let remainder = sum % 11;
    let digit1 = remainder < 2 ? 0 : 11 - remainder;
    
    if (parseInt(cpfClean.charAt(9)) !== digit1) return false;
    
    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpfClean.charAt(i)) * (11 - i);
    }
    remainder = sum % 11;
    let digit2 = remainder < 2 ? 0 : 11 - remainder;
    
    return parseInt(cpfClean.charAt(10)) === digit2;
  } catch (error) {
    console.error('Erro na validação do CPF:', error);
    return false;
  }
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