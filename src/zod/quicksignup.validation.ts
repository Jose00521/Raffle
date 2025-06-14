import { validateCPF } from '@/utils/validators';
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
    dataNascimento: z.date({
      invalid_type_error: "Data de nascimento inválida",
      required_error: "Data de nascimento é obrigatória",
    })
    .refine(
      (date) => {
        // Verificar se a pessoa tem pelo menos 18 anos
        const today = new Date();
        const eighteenYearsAgo = new Date(
          today.getFullYear() - 18,
          today.getMonth(),
          today.getDate()
        );
        return date <= eighteenYearsAgo;
      },
      { message: "Você deve ter pelo menos 18 anos para se cadastrar" }
    ),
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
        }
        
        return true;
      }),
    senha: z
      .string()
      .min(8, 'A senha deve ter pelo menos 8 caracteres')
      .refine(
        (password) => /[A-Z]/.test(password),
        'A senha deve conter pelo menos uma letra maiúscula'
      )
      .refine(
        (password) => /[a-z]/.test(password),
        'A senha deve conter pelo menos uma letra minúscula'
      )
      .refine(
        (password) => /[0-9]/.test(password),
        'A senha deve conter pelo menos um número'
      )
      .refine(
        (password) => /[^A-Za-z0-9]/.test(password),
        'A senha deve conter pelo menos um caractere especial'
      ),
    confirmarSenha: z.string().min(1, 'Por favor, confirme sua senha'),
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
        return val.length === 0 || val.length === 10 || val.length === 11;
      }, {
        message: 'Telefone deve ter 10 ou 11 dígitos'
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
        // Se não for celular (11 dígitos), não valida primeiro dígito
        if (val.length !== 11) return true;
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
        return val.length === 0 || val.length === 10 || val.length === 11;
      }, {
        message: 'Telefone deve ter 10 ou 11 dígitos'
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
        // Se não for celular (11 dígitos), não valida primeiro dígito
        if (val.length !== 11) return true;
        // O primeiro dígito após o DDD para celular deve ser 9
        return val[2] === '9';
      }, {
        message: 'Celular deve começar com 9'
      }),
    hasAddress: z.boolean().optional(),
    cep: z
      .string()
      .min(1, 'CEP é obrigatório')
      .transform(val => {
        console.log('Transformando CEP:', val);
        return val ? val.replace(/\D/g, '') : '';
      })
      .refine(val => {
        console.log('Verificando CEP preenchido:', val);
        return val.length > 0;
      }, {
        message: 'CEP é obrigatório'
      })
      .refine(val => {
        console.log('Verificando comprimento CEP:', val);
        return val.length === 0 || val.length === 8;
      }, {
        message: 'CEP deve ter 8 dígitos'
      })
      .refine(val => {
        console.log('Verificando formato CEP:', val);
        // Se não estiver completo, não valida
        if (val.length !== 8) return true;
        
        // Validações específicas para CEPs válidos no Brasil poderiam ser adicionadas aqui
        // Por enquanto, apenas verificamos o formato básico (8 dígitos)
        return /^\d{8}$/.test(val);
      }, {
        message: 'CEP inválido'
      }),
    logradouro: z.string().min(3, 'Logradouro é obrigatório'),
    numero: z.string().min(1, 'Número é obrigatório'),
    bairro: z.string().min(2, 'Bairro é obrigatório'),
    complemento: z.string().optional(), 
    termsAgreement: z.boolean().refine(val => val === true, {
      message: 'Você precisa aceitar os termos de uso'
    }),
    uf: z
      .string()
      .min(2, 'UF é obrigatória')
      .max(2, 'UF deve ter apenas 2 caracteres')
      .refine(
        (uf) => {
          const estados = [
            'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
            'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
            'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
          ];
          return estados.includes(uf.toUpperCase());
        },
        { message: 'UF inválida' }
      ),
    cidade: z.string().min(2, 'Cidade é obrigatória'),
    pontoReferencia: z.string().optional(),
  }).refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não conferem",
    path: ["confirmarSenha"],
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
  });

export type SignupFormData = z.infer<typeof signupSchema>;