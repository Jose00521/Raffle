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