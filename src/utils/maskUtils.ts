// Funções utilitárias para aplicar máscaras

/**
 * Aplica uma máscara a um valor de input
 */
export const applyMaskValue = (value: string, maskType?: string): string => {
  if (!value || !maskType) return value;
  // Limpar valor para trabalhar apenas com os caracteres desejados
  let rawValue = value.replace(/\D/g, '');
  
  // Aplicar a máscara apropriada
  switch (maskType) {
    case 'cpf':
      // Limitar a 11 dígitos
      if (rawValue.length > 11) {
        rawValue = rawValue.slice(0, 11);
      }
      
      // Formatar CPF: 000.000.000-00
      if (rawValue.length > 0) {
        // Limita a 11 dígitos
        rawValue = rawValue.slice(0, 11);
        
        // Aplica máscara
        if (rawValue.length <= 3) {
          // Nada a fazer
        } else if (rawValue.length <= 6) {
          rawValue = rawValue.replace(/^(\d{3})(\d+)/, '$1.$2');
        } else if (rawValue.length <= 9) {
          rawValue = rawValue.replace(/^(\d{3})\.?(\d{3})(\d+)/, '$1.$2.$3');
        } else {
          rawValue = rawValue.replace(/^(\d{3})\.?(\d{3})\.?(\d{3})(\d+)/, '$1.$2.$3-$4');
        }
      }
      return rawValue;
      
    case 'phone':
    case 'telefone':
      // Limitar a 11 dígitos e remover não-dígitos
      rawValue = rawValue.replace(/\D/g, '').slice(0, 11);
      
      // Formatar telefone: (00) 00000-0000 ou (00) 0000-0000
      if (rawValue.length > 0) {
        let formattedValue = '';
        
        // Adiciona DDD
        if (rawValue.length >= 2) {
          formattedValue = `(${rawValue.slice(0, 2)}) `;
          
          // Adiciona número
          if (rawValue.length > 2) {
            // Verifica se é celular (tem 11 dígitos)
            const isCellphone = rawValue.length > 10;
            
            if (isCellphone) {
              // Garante que celular (11 dígitos) comece com 9
              let rest = rawValue.slice(2);
              
              // Se o primeiro dígito após o DDD não for 9, insere 9
              if (rest.length > 0 && rest[0] !== '9') {
                rest = '9' + rest.slice(0, -1); // Remove o último dígito para manter 11 dígitos total
              }
              
              // Formato: (00) 90000-0000
              formattedValue += rest.slice(0, 5);
              if (rest.length > 5) {
                formattedValue += '-' + rest.slice(5);
              }
            } else {
              // Formato: (00) 0000-0000
              const rest = rawValue.slice(2);
              formattedValue += rest.slice(0, 4);
              if (rest.length > 4) {
                formattedValue += '-' + rest.slice(4);
              }
            }
          }
        } else {
          formattedValue = rawValue;
        }
        
        return formattedValue;
      }
      return rawValue;
      
    case 'cep':
      // Limitar a 8 dígitos
      if (rawValue.length > 8) {
        rawValue = rawValue.slice(0, 8);
      }
      
      // Formatar CEP: 00000-000
      if (rawValue.length > 5) {
        rawValue = rawValue.replace(/^(\d{5})(\d)/, '$1-$2');
      }
      return rawValue;
      
    case 'uf':
      // Limitar a 2 caracteres e converter para maiúsculo
      return value.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase();
      
    default:
      return value;
  }
};

/**
 * Retorna o valor sem a máscara
 */
export const getUnmaskedValue = (value: string, maskType?: string): string => {
  if (!value || !maskType) return value;
  
  switch (maskType) {
    case 'cpf':
    case 'telefone':
    case 'phone':
    case 'cep':
      return value.replace(/\D/g, '');
    case 'uf':
      return value.toUpperCase();
    default:
      return value;
  }
}; 

/**
 * Utilitários para mascarar dados sensíveis
 */

/**
 * Mascara CPF mostrando apenas os primeiros 3 e últimos 2 dígitos
 * Exemplo: 12345678901 → 123.***.***-01
 */
export function maskCPF(cpf: string): string {
  if (!cpf) return '';
  
  // Remove formatação existente
  const cleanCpf = cpf.replace(/\D/g, '');
  
  if (cleanCpf.length !== 11) return cpf; // Retorna original se não for CPF válido
  
  return `${cleanCpf.slice(0, 3)}.***.***-${cleanCpf.slice(-2)}`;
}

/**
 * Mascara CNPJ mostrando apenas os primeiros 2 e últimos 2 dígitos
 * Exemplo: 12345678000195 → 12.***.***'/'**01-95
 */
export function maskCNPJ(cnpj: string): string {
  if (!cnpj) return '';
  
  // Remove formatação existente
  const cleanCnpj = cnpj.replace(/\D/g, '');
  
  if (cleanCnpj.length !== 14) return cnpj; // Retorna original se não for CNPJ válido
  
  return `${cleanCnpj.slice(0, 2)}.***.***/${cleanCnpj.slice(8, 10)}**-${cleanCnpj.slice(-2)}`;
}

/**
 * Mascara telefone mostrando apenas primeiros 2 dígitos (DDD) e últimos 4
 * Exemplo: (11) 99999-9999 → (11) 9****-9999
 */
export function maskPhone(phone: string): string {
  if (!phone) return '';
  
  // Remove formatação existente
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length === 11) {
    // Celular: (11) 9****-9999
    return `(${cleanPhone.slice(0, 2)}) ${cleanPhone[2]}****-${cleanPhone.slice(-4)}`;
  } else if (cleanPhone.length === 10) {
    // Fixo: (11) ****-9999
    return `(${cleanPhone.slice(0, 2)}) ****-${cleanPhone.slice(-4)}`;
  }
  
  return phone; // Retorna original se não for formato válido
}

/**
 * Mascara email mostrando apenas primeira letra e domínio
 * Exemplo: joao.silva@email.com → j***@email.com
 */
export function maskEmail(email: string): string {
  if (!email) return '';
  
  const [localPart, domain] = email.split('@');
  
  if (!localPart || !domain) return email;
  
  // Mostra primeira letra + *** + @dominio
  const maskedLocal = localPart.length > 1 
    ? `${localPart[0]}***` 
    : localPart;
  
  return `${maskedLocal}@${domain}`;
}

/**
 * Mascara rua seguindo padrão bancário
 * Exemplo: Rua das Flores → Rua das F***
 * Exemplo: Avenida Paulista → Av. P***
 */
export function maskStreet(street: string): string {
  if (!street) return '';
  
  const words = street.trim().split(' ');
  
  // Abreviações comuns de bancos
  const abbreviations: { [key: string]: string } = {
    'Rua': 'R.',
    'Avenida': 'Av.',
    'Alameda': 'Al.',
    'Travessa': 'Tv.',
    'Praça': 'Pç.',
    'Largo': 'Lg.',
    'Estrada': 'Est.',
    'Rodovia': 'Rod.'
  };
  
  if (words.length === 0) return '';
  
  // Primeira palavra (tipo de logradouro)
  const firstWord = words[0];
  const abbreviated = abbreviations[firstWord] || firstWord;
  
  if (words.length === 1) {
    return `${abbreviated} ***`;
  }
  
  // Palavras do meio (preposições) - manter visíveis
  const middleWords = words.slice(1, -1).filter(word => 
    ['da', 'das', 'do', 'dos', 'de', 'e', 'em', 'na', 'no'].includes(word.toLowerCase())
  );
  
  // Última palavra - mascarar
  const lastWord = words[words.length - 1];
  const maskedLast = lastWord.length > 1 
    ? `${lastWord.slice(0, 1)}***` 
    : '***';
  
  // Montar resultado
  const result = [abbreviated, ...middleWords, maskedLast].join(' ');
  return result;
}

/**
 * Mascara número do endereço
 * Exemplo: 1234 → ***4
 * Exemplo: 123-A → ***-A
 */
export function maskNumber(number: string): string {
  if (!number) return '';
  
  const str = number.toString();
  
  // Se tem letra no final (apartamento), preserva
  const match = str.match(/^(\d+)([A-Za-z]*)$/);
  if (match) {
    const [, digits, letters] = match;
    if (digits.length <= 2) {
      return `***${letters}`;
    }
    return `***${digits.slice(-1)}${letters}`;
  }
  
  // Número simples
  return str.length <= 2 ? '***' : `***${str.slice(-1)}`;
}

/**
 * Mascara complemento
 * Exemplo: Apartamento 101 → Apto ***
 * Exemplo: Bloco A Casa 5 → Bloco *** Casa ***
 */
export function maskComplement(complement: string): string {
  if (!complement) return '';
  
  // Abreviações comuns
  const abbreviations: { [key: string]: string } = {
    'Apartamento': 'Apto',
    'Bloco': 'Bl.',
    'Casa': 'Casa',
    'Sala': 'Sala',
    'Loja': 'Loja',
    'Andar': 'And.',
    'Torre': 'Torre'
  };
  
  const words = complement.trim().split(' ');
  const result: string[] = [];
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const abbreviated = abbreviations[word] || word;
    
    // Se é um tipo conhecido, mantém + mascara próximo número
    if (abbreviations[word]) {
      result.push(abbreviated);
      if (i + 1 < words.length) {
        result.push('***');
        i++; // Pula o próximo (que foi mascarado)
      }
    } else if (/^\d+$/.test(word)) {
      // Se é só número, mascara
      result.push('***');
    } else if (word.length <= 2) {
      // Palavras pequenas (preposições), mantém
      result.push(word);
    } else {
      // Outras palavras, mascara
      result.push('***');
    }
  }
  
  return result.join(' ');
}

/**
 * Mascara CEP seguindo padrão bancário
 * Exemplo: 12345-678 → 12***-678
 */
export function maskCEP(cep: string): string {
  if (!cep) return '';
  
  const cleanCep = cep.replace(/\D/g, '');
  
  if (cleanCep.length !== 8) return cep;
  
  return `${cleanCep.slice(0, 2)}***-${cleanCep.slice(-3)}`;
}

/**
 * Mascara bairro
 * Exemplo: Vila Madalena → Vila M***
 */
export function maskNeighborhood(neighborhood: string): string {
  if (!neighborhood) return '';
  
  const words = neighborhood.trim().split(' ');
  
  if (words.length === 1) {
    const word = words[0];
    return word.length > 2 ? `${word.slice(0, 1)}***` : word;
  }
  
  // Primeira palavra mantém, outras mascara
  const result = [words[0]];
  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    result.push(word.length > 1 ? `${word.slice(0, 1)}***` : word);
  }
  
  return result.join(' ');
}

/**
 * Mascara endereço completo seguindo padrão bancário
 * Exemplo: Rua das Flores, 123, Apto 45 → R. das F***, ***, Apto ***
 */
export function maskAddress(street: string, number?: string, complement?: string): string {
  const parts: string[] = [];
  
  if (street) {
    parts.push(maskStreet(street));
  }
  
  if (number) {
    parts.push(maskNumber(number));
  }
  
  if (complement) {
    parts.push(maskComplement(complement));
  }
  
  return parts.join(', ');
}

/**
 * Mascara nome mostrando apenas primeira e última palavra
 * Exemplo: João Pedro Silva Santos → João *** Santos
 */
export function maskName(name: string): string {
  if (!name) return '';
  
  const words = name.trim().split(' ');
  
  if (words.length <= 2) return name; // Se tem só 2 palavras, não mascara
  
  const firstName = words[0];
  const lastName = words[words.length - 1];
  const middleCount = words.length - 2;
  
  return `${firstName} ${'***'.repeat(Math.max(1, Math.floor(middleCount / 2)))} ${lastName}`;
}

/**
 * Objeto com todas as funções de mascaramento para fácil importação
 */
export const DataMask = {
  cpf: maskCPF,
  cnpj: maskCNPJ,
  phone: maskPhone,
  email: maskEmail,
  name: maskName,
  // Endereço - funções individuais
  street: maskStreet,
  number: maskNumber,
  complement: maskComplement,
  neighborhood: maskNeighborhood,
  cep: maskCEP,
  // Endereço - função completa
  address: maskAddress,
}; 