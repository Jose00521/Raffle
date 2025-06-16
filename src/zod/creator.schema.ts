import { z } from 'zod';
import { validateCPF, validateCNPJ } from '../utils/validators';
import { COMMON_EMAIL_DOMAINS } from '@/utils/constants';

// Schema base com campos comuns para pessoa física e jurídica
const baseCreatorSchema = z.object({
  // Informações básicas
  nomeCompleto: z.string()
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
  email: z
    .string()
    .min(1, 'E-mail é obrigatório')
    .superRefine((value, ctx) => {
      if (value.length <= 1) return true;
      
      const hasAt = value.includes('@');
      const hasDot = value.includes('.');
      
      if (!hasAt || !hasDot) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'E-mail deve conter @ e .',
        });
        return false;
      }
      
      if (hasAt && hasDot) {
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
      return val ? val.replace(/\D/g, '') : '';
    })
    .refine(val => val.length > 0, {
      message: 'Telefone é obrigatório'
    })
    .refine(val => val.length === 0 || val.length === 11, {
      message: 'Telefone deve ter 11 dígitos'
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
  // Endereço
  cep: z
    .string()
    .min(1, 'CEP é obrigatório')
    .transform(val => val ? val.replace(/\D/g, '') : '')
    .refine(val => val.length === 8, {
      message: 'CEP deve ter 8 dígitos'
    }),
    dataNascimento: z.date({
      invalid_type_error: "Data de nascimento inválida",
      required_error: "Data de nascimento é obrigatória",
    })
    .refine(
      (date) => {
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
  logradouro: z.string().min(3, 'Logradouro é obrigatório'),
  numero: z.string().min(1, 'Número é obrigatório'),
  bairro: z.string().min(2, 'Bairro é obrigatório'),
  complemento: z.string().optional(),
  cidade: z.string().min(2, 'Cidade é obrigatória'),
  uf: z
    .string()
    .nonempty('UF é obrigatória')
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

  tipoPessoa: z.enum(['individual', 'company'], {
    errorMap: () => ({ message: 'Selecione o tipo de pessoa' })
  }),
  termsAgreement: z.boolean().refine(val => val === true, {
    message: 'Você precisa aceitar os termos de uso'
  }),
})
;

// Schema específico para pessoa física (CPF)
const pessoaFisicaSchema = baseCreatorSchema.extend({
  tipoPessoa: z.literal('individual'),
  
  cpf: z.string()
    .nonempty('CPF é obrigatório')
    .transform(val => val.replace(/\D/g, ''))
    .refine(val => val.length === 11, {
      message: 'CPF deve ter 11 dígitos'
    })
    .refine(val => validateCPF(val), {
      message: 'CPF inválido'
    }),

  cnpj: z.string().optional(),
  razaoSocial: z.string().optional(),
  nomeFantasia: z.string().optional(),
});

// Schema específico para pessoa jurídica (CNPJ)
const pessoaJuridicaSchema = baseCreatorSchema.extend({
    tipoPessoa: z.literal('company'),

  cnpj: z.string()
    .nonempty('CNPJ é obrigatório')
    .transform(val => val.replace(/\D/g, ''))
    .refine(val => val.length === 14, {
      message: 'CNPJ deve ter 14 dígitos'
    })
    .refine(val => validateCNPJ(val), {
      message: 'CNPJ inválido'
    }),
  cpf: z.string()
    .nonempty('CPF do representante legal é obrigatório')
    .transform(val => val.replace(/\D/g, ''))
    .refine(val => val.length === 11, {
      message: 'CPF do representante legal deve ter 11 dígitos'
    })
    .refine(val => validateCPF(val), {
      message: 'CPF inválido'
    }),
  categoriaEmpresa: z.string()
    .nonempty('Categoria da empresa é obrigatória')
    .refine(
      (uf) => {
        const categories = [
          'ASF', 'MEI', 'ME', 'EPP'
        ];
        return categories.includes(uf.toUpperCase());
      },
      { message: 'Categoria inválida' }
    ),
  razaoSocial: z.string()
    .nonempty('Razão social é obrigatória')
    .min(3, 'Razão social deve ter pelo menos 3 caracteres'),
  nomeFantasia: z.string()
    .nonempty('Nome fantasia é obrigatório')
    .min(2, 'Nome fantasia deve ter pelo menos 2 caracteres'),
});

// Schema combinado usando discriminated union
export const creatorFormSchema = z.discriminatedUnion('tipoPessoa', [
  pessoaFisicaSchema,
  pessoaJuridicaSchema
]).refine(data => data.senha === data.confirmarSenha, {
  message: "As senhas não conferem",
  path: ["confirmarSenha"],
})
.refine((data) => {
  // Remove caracteres especiais antes de comparar
  console.log('Comparing phone numbers:', data.telefone, data.confirmarTelefone);
  
  // Se um dos telefones não estiver preenchido, não comparar
  if (!data.telefone || !data.confirmarTelefone) {
    return true;
  }
  
  const phone1 = data.telefone.replace(/\D/g, '');
  const phone2 = data.confirmarTelefone.replace(/\D/g, '');
  
  console.log('Cleaned phone numbers:', phone1, phone2);
  
  // Só compara se ambos tiverem pelo menos 10 dígitos (completos)
  if (phone1.length < 10 || phone2.length < 10) {
    return true;
  }
  
  return phone1 === phone2;
}, {
  message: "Os telefones não conferem",
  path: ["confirmarTelefone"],
});;

export type CreatorFormData = z.infer<typeof creatorFormSchema>;
export type CreatorInput = z.infer<typeof creatorFormSchema>;