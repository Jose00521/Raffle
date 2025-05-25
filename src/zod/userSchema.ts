import { z } from 'zod';
import { validateCPF, validateCNPJ } from '@/utils/validators';

// Esquemas base para validações comuns
const addressSchema = z.object({
  street: z.string().min(3, 'Endereço é obrigatório'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, 'Bairro é obrigatório'),
  city: z.string().min(2, 'Cidade é obrigatória'),
  state: z.string().length(2, 'UF deve ter 2 caracteres'),
  zipCode: z.string()
    .min(8, 'CEP deve ter 8 dígitos')
    .max(9, 'CEP deve ter no máximo 9 caracteres')
    .transform(val => val.replace(/\D/g, ''))
    .refine(val => val.length === 8, {
      message: 'CEP inválido'
    })
});

const bankAccountSchema = z.object({
  bank: z.string().min(3, 'Banco é obrigatório'),
  agency: z.string().min(1, 'Agência é obrigatória'),
  account: z.string().min(1, 'Conta é obrigatória'),
  accountType: z.enum(['checking', 'savings'], {
    errorMap: () => ({ message: 'Tipo de conta inválido' })
  }),
  pixKey: z.string().optional()
});

// Schema base para todos os tipos de usuário
const baseUserSchema = z.object({
  email: z.string()
    .min(1, 'E-mail é obrigatório')
    .email('E-mail inválido'),
  password: z.string()
    .min(8, 'A senha deve ter pelo menos 8 caracteres')
    .refine(val => /[A-Z]/.test(val), 'A senha deve ter pelo menos uma letra maiúscula')
    .refine(val => /[a-z]/.test(val), 'A senha deve ter pelo menos uma letra minúscula')
    .refine(val => /[0-9]/.test(val), 'A senha deve ter pelo menos um número')
    .refine(val => /[^A-Za-z0-9]/.test(val), 'A senha deve ter pelo menos um caractere especial'),
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  name: z.string()
    .min(3, 'Nome completo deve ter pelo menos 3 caracteres')
    .max(100, 'Nome muito longo'),
  phone: z.string()
    .min(10, 'Telefone deve ter pelo menos 10 dígitos')
    .transform(val => val.replace(/\D/g, ''))
    .refine(val => val.length >= 10 && val.length <= 11, {
      message: 'Telefone deve ter entre 10 e 11 dígitos'
    }),
  address: addressSchema,
  termsAgreement: z.boolean()
    .refine(val => val === true, {
      message: 'Você precisa aceitar os termos de uso'
    })
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não conferem',
  path: ['confirmPassword']
});

// Schema para participante (usuário regular)
const participantSchema = z.object({
  ...baseUserSchema.shape,
  role: z.literal('participant'),
  cpf: z.string()
    .min(11, 'CPF é obrigatório')
    .transform(val => val.replace(/\D/g, ''))
    .refine(val => val.length === 11, {
      message: 'CPF deve ter 11 dígitos'
    })
    .refine(validateCPF, {
      message: 'CPF inválido'
    }),
  birthDate: z.coerce.date()
    .refine(date => {
      const today = new Date();
      const eighteenYearsAgo = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate()
      );
      return date <= eighteenYearsAgo;
    }, {
      message: 'Você deve ter pelo menos 18 anos para se cadastrar'
    }),
  socialName: z.string().optional(),
  consents: z.object({
    marketingEmails: z.boolean(),
    termsAndConditions: z.boolean().refine(val => val === true, {
      message: 'Você precisa aceitar os termos e condições'
    }),
    dataSharing: z.boolean()
  })
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não conferem',
  path: ['confirmPassword']
});

// Schema comum para todos os criadores
const baseCreatorSchema = z.object({
  ...baseUserSchema.shape,
  role: z.literal('creator'),
  bankAccount: z.array(bankAccountSchema).min(1, 'Pelo menos uma conta bancária é obrigatória'),
  settings: z.object({
    allowCommissions: z.boolean().default(false),
    commissionPercentage: z.number().min(0).max(100).default(0),
    receiveReports: z.boolean().default(true)
  }).optional().default({})
});

// Schema específico para criador pessoa física
const individualCreatorSchema = z.object({
  ...baseCreatorSchema.shape,
  personType: z.literal('individual'),
  cpf: z.string()
    .min(11, 'CPF é obrigatório')
    .transform(val => val.replace(/\D/g, ''))
    .refine(val => val.length === 11, {
      message: 'CPF deve ter 11 dígitos'
    })
    .refine(validateCPF, {
      message: 'CPF inválido'
    }),
  birthDate: z.coerce.date()
    .refine(date => {
      const today = new Date();
      const eighteenYearsAgo = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate()
      );
      return date <= eighteenYearsAgo;
    }, {
      message: 'Você deve ter pelo menos 18 anos para se cadastrar'
    })
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não conferem',
  path: ['confirmPassword']
});

// Schema específico para criador pessoa jurídica
const companyCreatorSchema = z.object({
  ...baseCreatorSchema.shape,
  personType: z.literal('company'),
  cnpj: z.string()
    .min(14, 'CNPJ é obrigatório')
    .transform(val => val.replace(/\D/g, ''))
    .refine(val => val.length === 14, {
      message: 'CNPJ deve ter 14 dígitos'
    })
    .refine(validateCNPJ, {
      message: 'CNPJ inválido'
    }),
  companyName: z.string().min(3, 'Nome fantasia é obrigatório'),
  legalName: z.string().min(3, 'Razão social é obrigatória'),
  legalRepresentative: z.string().optional()
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não conferem',
  path: ['confirmPassword']
});

// União discriminada para criadores
export const creatorSchema = z.discriminatedUnion('personType', [
  individualCreatorSchema,
  companyCreatorSchema
]);

// Criamos um objeto que contém todas as opções de role para o discriminated union
const userTypes = {
  participant: participantSchema,
  creator: creatorSchema
} as const;

// União discriminada para todos os tipos de usuário
export const userSchema = z.discriminatedUnion('role', [
  userTypes.participant,
  z.custom<z.ZodDiscriminatedUnion<'personType', [z.ZodObject<any>, z.ZodObject<any>]>>((val) => {
    return val && (val as any).role === 'creator';
  }, { message: 'Deve ser um criador válido' }) as any
]);

// Tipos inferidos
export type UserSchema = z.infer<typeof userSchema>;
export type ParticipantSchema = z.infer<typeof participantSchema>;
export type CreatorSchema = z.infer<typeof creatorSchema>;
export type IndividualCreatorSchema = z.infer<typeof individualCreatorSchema>;
export type CompanyCreatorSchema = z.infer<typeof companyCreatorSchema>; 