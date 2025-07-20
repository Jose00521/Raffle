import { validateCPF } from '@/utils/validators';
import { z } from 'zod';
import { COMMON_EMAIL_DOMAINS } from '@/utils/constants';

// Schema para dados pessoais
export const AdminPersonalInfoSchema = z.object({
    name: z.string()
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
  cpf: z.string()
    .nonempty('CPF é obrigatório')
    .transform(val => {
      return val.replace(/\D/g, '');
    })
    .refine(val => {
      return val.length === 11;
    }, {
      message: 'CPF deve ter 11 dígitos'
    })
    .refine(val => {
      return validateCPF(val);
    }, {
      message: 'CPF inválido'
    }),
  birthDate: z.date({
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
  phone: z
    .string()
    .min(1, 'Telefone é obrigatório')
    .transform(val => {
      return val ? val.replace(/\D/g, '') : '';
    })
    .refine(val => {
      return val.length > 0;
    }, {
      message: 'Telefone é obrigatório'
    })
    .refine(val => {
      return val.length === 0 || val.length === 11;
    }, {
      message: 'Telefone deve ter 11 dígitos'
    })
    .refine(val => {
      // Se não tem pelo menos 2 dígitos, não valida DDD
      if (val.length < 2) return true;
      const ddd = parseInt(val.substring(0, 2));
      return ddd >= 11;
    }, {
      message: 'DDD inválido'
    })
    .refine(val => {
      // O primeiro dígito após o DDD para celular deve ser 9
      return val[2] === '9';
    }, {
      message: 'Celular deve começar com 9'
    }),
  confirmPhone: z
    .string()
    .min(1, 'Confirme seu telefone')
    .transform(val => {
      return val ? val.replace(/\D/g, '') : '';
    })
    .refine(val => {
      return val.length > 0;
    }, {
      message: 'Confirmação de telefone é obrigatória'
    })
    .refine(val => {
      return val.length === 0 || val.length === 11;
    }, {
      message: 'Telefone deve ter 11 dígitos'
    })
    .refine(val => {
      // Se não tem pelo menos 2 dígitos, não valida DDD
      if (val.length < 2) return true;
      const ddd = parseInt(val.substring(0, 2));
      return ddd >= 11;
    }, {
      message: 'DDD inválido'
    })
    .refine(val => {
      // O primeiro dígito após o DDD para celular deve ser 9
      return val[2] === '9';
    }, {
      message: 'Celular deve começar com 9'
    }),
});

// Schema base sem validação de senha (para merge)
const AdminSecurityBaseSchema = z.object({
    password: z
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
  confirmPassword: z.string().min(1, 'Por favor, confirme sua senha')
})


// Schema para permissões e acesso
export const AdminPermissionsSchema = z.object({
  permissions: z
    .array(z.enum([
      'GATEWAY_MANAGEMENT',
      'USER_MANAGEMENT', 
      'CAMPAIGN_MANAGEMENT',
      'PAYMENT_MANAGEMENT',
      'SYSTEM_SETTINGS',
      'AUDIT_ACCESS',
      'SECURITY_MANAGEMENT',
      'FULL_ACCESS'
    ]))
    .min(1, 'Pelo menos uma permissão deve ser selecionada')
    .max(8, 'Máximo de 8 permissões'),
  
  accessLevel: z
    .enum(['SUPER_ADMIN', 'ADMIN', 'MODERATOR']),
  
  notificationPreferences: z.object({
    emailAlerts: z.boolean(),
    systemAlerts: z.boolean(),
    securityAlerts: z.boolean()
  }),
});

// Schema para revisão e confirmação
export const AdminReviewSchema = z.object({
    termsAgreement: z.boolean().refine(val => val === true, {
        message: 'Você precisa aceitar os termos de uso'
      }),
});

// Schema completo do admin
export const AdminCompleteSchema = AdminPersonalInfoSchema
  .merge(AdminSecurityBaseSchema)
  .merge(AdminPermissionsSchema)
  .merge(AdminReviewSchema)


// Tipos TypeScript derivados dos schemas
export type AdminPersonalInfo = z.infer<typeof AdminPersonalInfoSchema>;
export type AdminSecurity = z.infer<typeof AdminSecurityBaseSchema>;
export type AdminPermissions = z.infer<typeof AdminPermissionsSchema>;
export type AdminReview = z.infer<typeof AdminReviewSchema>;
export type AdminComplete = z.infer<typeof AdminCompleteSchema>;

// Schema para cada step individualmente
export const AdminStepSchemas = [
  AdminPersonalInfoSchema,
  AdminSecurityBaseSchema,
  AdminPermissionsSchema,
  AdminReviewSchema
];

// Opções para dropdowns
export const ADMIN_OPTIONS = {
  accessLevels: [
    { value: 'MODERATOR', label: 'Moderador' },
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'SUPER_ADMIN', label: 'Super Administrador' }
  ],
  
  permissions: [
    { value: 'GATEWAY_MANAGEMENT', label: 'Gerenciar Gateways de Pagamento', description: 'Gerenciar integrações e configurações de pagamento' },
    { value: 'USER_MANAGEMENT', label: 'Gerenciar Usuários', description: 'Administrar usuários, criadores e participantes' },
    { value: 'CAMPAIGN_MANAGEMENT', label: 'Gerenciar Campanhas/Rifas', description: 'Supervisionar campanhas e rifas ativas' },
    { value: 'PAYMENT_MANAGEMENT', label: 'Gerenciar Pagamentos', description: 'Monitorar transações e pagamentos' },
    { value: 'SYSTEM_SETTINGS', label: 'Configurações do Sistema', description: 'Configurar parâmetros gerais do sistema' },
    { value: 'AUDIT_ACCESS', label: 'Acesso a Auditoria', description: 'Visualizar logs e relatórios de auditoria' },
    { value: 'SECURITY_MANAGEMENT', label: 'Gerenciar Segurança', description: 'Gerenciar configurações de segurança' },
    { value: 'FULL_ACCESS', label: 'Acesso Total', description: 'Acesso total a todas as funcionalidades' }
  ],
  
  departments: [
    { value: 'TI', label: 'Tecnologia da Informação' },
    { value: 'FINANCIAL', label: 'Financeiro' },
    { value: 'SECURITY', label: 'Segurança' },
    { value: 'OPERATIONS', label: 'Operações' },
    { value: 'SUPPORT', label: 'Suporte' },
    { value: 'MANAGEMENT', label: 'Gestão' }
  ],
  
  positions: [
    { value: 'DEVELOPER', label: 'Desenvolvedor' },
    { value: 'ANALYST', label: 'Analista' },
    { value: 'MANAGER', label: 'Gerente' },
    { value: 'DIRECTOR', label: 'Diretor' },
    { value: 'COORDINATOR', label: 'Coordenador' },
    { value: 'SPECIALIST', label: 'Especialista' }
  ],
  
  workDays: [
    { value: 'MON', label: 'Segunda-feira' },
    { value: 'TUE', label: 'Terça-feira' },
    { value: 'WED', label: 'Quarta-feira' },
    { value: 'THU', label: 'Quinta-feira' },
    { value: 'FRI', label: 'Sexta-feira' },
    { value: 'SAT', label: 'Sábado' },
    { value: 'SUN', label: 'Domingo' }
  ],
  
  securityQuestions: [
    { value: 'pet_name', label: 'Qual o nome do seu primeiro animal de estimação?' },
    { value: 'mother_maiden', label: 'Qual o nome de solteira da sua mãe?' },
    { value: 'school_name', label: 'Qual o nome da sua primeira escola?' },
    { value: 'city_born', label: 'Em que cidade você nasceu?' },
    { value: 'favorite_book', label: 'Qual o seu livro favorito?' },
    { value: 'childhood_friend', label: 'Qual o nome do seu melhor amigo de infância?' }
  ]
};

export default AdminCompleteSchema; 