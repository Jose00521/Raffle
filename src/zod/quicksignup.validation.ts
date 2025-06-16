import { validateCPF } from '@/utils/validators';
import { COMMON_EMAIL_DOMAINS } from '@/utils/constants';
import { z } from 'zod';




export const signupSchema = z.object({
    nome: z.string()
      .nonempty('Nome completo é obrigatório')
      .min(3, 'Nome completo deve ter pelo menos 3 caracteres')
      .max(50, 'Nome muito longo')
      .transform(value => value.trim())
      .superRefine((value, ctx) => {
        if (value.length < 3) return true;
        
        for (let i = 0; i < value.length; i++) {
          const char = value[i];
          if (!(
            (char >= 'a' && char <= 'z') || 
            (char >= 'A' && char <= 'Z') || 
            char === ' ' ||
            /[À-ÿ]/.test(char)
          )) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Nome completo deve conter apenas letras e espaços',
            });
            return false;
          }
        }
        return true;
      }),
    nomeSocial: z.string().optional(),
    cpf: z.string()
      .nonempty('CPF é obrigatório')
      .transform(val => {
        console.log('Transformando CPF:', val);
        return val.replace(/\D/g, '');
      })
      .refine(val => {
        console.log('Refinando comprimento CPF:', val);
        return val.length === 11;
      }, {
        message: 'CPF deve ter 11 dígitos'
      })
      .refine(val => {
        console.log('Validando regras CPF:', val);
        return validateCPF(val);
      }, {
        message: 'CPF inválido'
      }),

    email: z
      .string()
      .min(1, 'E-mail é obrigatório')
      .superRefine((value, ctx) => {
        // Se estiver vazio, não validamos (já tratado pelo min(1))
        if (value.length <= 1) return true;
        
        // Otimização: Validação básica antes de usar regex completa
        const hasAt = value.includes('@');
        const hasDot = value.includes('.');
        
        if (!hasAt || !hasDot) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'E-mail deve conter @ e .',
          });
          return false;
        }
        
        // Só faz a validação completa se já tiver @ e .
        if (hasAt && hasDot) {
          // Regex simplificada para validar email básico
          const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
          
          if (!isValidEmail) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'E-mail inválido',
            });
            return false;
          }
          
          // Verificação de domínios mais comuns e confiáveis
          const emailLower = value.toLowerCase();
          const domain = emailLower.split('@')[1];
          
          // Verifica se é um domínio comum ou se termina com extensões válidas
          const isCommonDomain = COMMON_EMAIL_DOMAINS.includes(domain);
          
          if (!isCommonDomain) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Por favor, use um e-mail conhecido',
            });
            return false;
          }
        }
        
        return true;
      }),
    telefone: z
      .string()
      .min(1, 'Telefone é obrigatório')
      .transform(val => {
        console.log('Transformando telefone:', val);
        return val ? val.replace(/\D/g, '') : '';
      })
      .refine(val => {
        console.log('Verificando telefone preenchido:', val);
        return val.length > 0;
      }, {
        message: 'Telefone é obrigatório'
      })
      .refine(val => {
        console.log('Verificando comprimento telefone:', val);
        return val.length === 0 || val.length === 11;
      }, {
        message: 'Telefone deve ter 11 dígitos'
      })
      .refine(val => {
        console.log('Verificando DDD telefone:', val);
        // Se não tem pelo menos 2 dígitos, não valida DDD
        if (val.length < 2) return true;
        const ddd = parseInt(val.substring(0, 2));
        return ddd >= 11;
      }, {
        message: 'DDD inválido'
      })
      .refine(val => {
        console.log('Verificando formato celular:', val);
        // O primeiro dígito após o DDD para celular deve ser 9
        return val[2] === '9';
      }, {
        message: 'Celular deve começar com 9'
      }),
    confirmarTelefone: z
      .string()
      .min(1, 'Confirme seu telefone')
      .transform(val => {
        console.log('Transformando confirmarTelefone:', val);
        return val ? val.replace(/\D/g, '') : '';
      })
      .refine(val => {
        console.log('Verificando confirmarTelefone preenchido:', val);
        return val.length > 0;
      }, {
        message: 'Confirmação de telefone é obrigatória'
      })
      .refine(val => {
        console.log('Verificando comprimento confirmarTelefone:', val);
        return val.length === 0 || val.length === 11;
      }, {
        message: 'Telefone deve ter 11 dígitos'
      })
      .refine(val => {
        console.log('Verificando DDD confirmarTelefone:', val);
        // Se não tem pelo menos 2 dígitos, não valida DDD
        if (val.length < 2) return true;
        const ddd = parseInt(val.substring(0, 2));
        return ddd >= 11;
      }, {
        message: 'DDD inválido'
      })
      .refine(val => {
        console.log('Verificando formato celular confirmarTelefone:', val);

        // O primeiro dígito após o DDD para celular deve ser 9
        return val[2] === '9';
      }, {
        message: 'Celular deve começar com 9'
      }),
    hasAddress: z.boolean().optional(),
    cep: z
      .string()
      .optional()
      .transform(val => {
        console.log('Transformando CEP:', val);
        return val ? val.replace(/\D/g, '') : '';
      }),
    logradouro: z.string().optional(),
    numero: z.string().optional(),
    bairro: z.string().optional(),
    complemento: z.string().optional(), 
    termsAgreement: z.boolean().refine(val => val === true, {
      message: 'Você precisa aceitar os termos de uso'
    }),
    uf: z.string().optional(),
    cidade: z.string().optional(),
  }).refine((data) => {
    // Remove caracteres especiais antes de comparar
    console.log('Comparing phone numbers:', data.telefone, data.confirmarTelefone);
    
    // Se um dos telefones não estiver preenchido, não comparar
    if (!data.telefone || !data.confirmarTelefone) {
      return true;
    }
    
    const phone1 = data.telefone.replace(/\D/g, '');
    const phone2 = data.confirmarTelefone.replace(/\D/g, '');
    
    console.log('Cleaned phone numbers:', phone1, phone2);
    
    // Compare regardless of length as long as both are filled
    return phone1 === phone2;
  }, {
    message: "Os telefones não conferem",
    path: ["confirmarTelefone"],
  })
  // Validação condicional para campos de endereço
  .refine((data) => {
    // Se hasAddress for true, então os campos de endereço são obrigatórios
    if (data.hasAddress) {
      return data.cep && data.cep.length > 0;
    }
    return true; // Se hasAddress for false, não exige CEP
  }, {
    message: "CEP é obrigatório",
    path: ["cep"],
  })
  .refine((data) => {
    if (data.hasAddress && data.cep) {
      return data.cep.length === 8;
    }
    return true;
  }, {
    message: "CEP deve ter 8 dígitos",
    path: ["cep"],
  })
  .refine((data) => {
    if (data.hasAddress) {
      return data.logradouro && data.logradouro.length >= 3;
    }
    return true;
  }, {
    message: "Endereço é obrigatório",
    path: ["logradouro"],
  })
  .refine((data) => {
    if (data.hasAddress) {
      return data.numero && data.numero.length >= 1;
    }
    return true;
  }, {
    message: "Número é obrigatório",
    path: ["numero"],
  })
  .refine((data) => {
    if (data.hasAddress) {
      return data.bairro && data.bairro.length >= 2;
    }
    return true;
  }, {
    message: "Bairro é obrigatório",
    path: ["bairro"],
  })
  .refine((data) => {
    if (data.hasAddress) {
      return data.uf && data.uf.length === 2;
    }
    return true;
  }, {
    message: "UF é obrigatória",
    path: ["uf"],
  })
  .refine((data) => {
    if (data.hasAddress && data.uf) {
      const estados = [
        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
        'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
        'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
      ];
      return estados.includes(data.uf.toUpperCase());
    }
    return true;
  }, {
    message: "UF inválida",
    path: ["uf"],
  })
  .refine((data) => {
    if (data.hasAddress) {
      return data.cidade && data.cidade.length >= 2;
    }
    return true;
  }, {
    message: "Cidade é obrigatória",
    path: ["cidade"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;