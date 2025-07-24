import { z } from 'zod';

// Definir nosso próprio enum em vez de importar para evitar problemas de importação
export enum FieldType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  SELECT = 'SELECT',
  PASSWORD = 'PASSWORD',
  EMAIL = 'EMAIL'
}

// Enum para status dos templates de gateway de pagamento
export enum PaymentGatewayTemplateStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  DEPRECATED = 'DEPRECATED'
}

// Validação para opção de campo de seleção
const FieldOptionSchema = z.object({
  value: z.string().min(1, 'O valor é obrigatório'),
  label: z.string().min(1, 'O rótulo é obrigatório')
});

// Validação para campos de credenciais e configurações
// Usar z.enum em vez de z.nativeEnum para evitar problemas com valores nulos
const GatewayFieldSchema = z.object({
  name: z.string().min(1, 'O nome técnico é obrigatório')
    .regex(/^[a-zA-Z0-9_]+$/, 'Use apenas letras, números e underscores')
    .max(50, 'Máximo de 50 caracteres'),
  label: z.string().min(1, 'O rótulo é obrigatório')
    .max(100, 'Máximo de 100 caracteres'),
  type: z.enum(['TEXT', 'NUMBER', 'BOOLEAN', 'SELECT', 'PASSWORD', 'EMAIL'], {
    errorMap: () => ({ message: 'Tipo de campo inválido' })
  }),
  required: z.boolean().default(false),
  placeholder: z.string().min(1, 'O placeholder é obrigatório'),
  description: z.string().min(1, 'A descrição é obrigatória'),
  group: z.enum(['credentials', 'settings'], {
    errorMap: () => ({ message: 'Grupo deve ser credentials ou settings' })
  }),
  isSecret: z.boolean().default(false),
  options: z.array(FieldOptionSchema).optional()
    .refine((options) => {
      // Se o tipo for SELECT, então options é obrigatório
      return true; // Lógica mais complexa seria implementada no front-end
    }, { message: 'Opções são obrigatórias para campos do tipo Seleção' })
});

// Validação para configuração de taxas
const FeesSchema = z.object({
  percentage: z.number().min(0, 'A taxa não pode ser negativa')
    .max(100, 'A taxa não pode exceder 100%')
    .default(0),
  fixed: z.number().min(0, 'O valor fixo não pode ser negativo').optional()
});

// Validação para métodos de pagamento
const PaymentMethodSchema = z.object({
  method: z.string().min(1, 'O método é obrigatório'),
  displayName: z.string().min(1, 'O nome de exibição é obrigatório'),
  enabled: z.boolean().default(true),
  fees: FeesSchema
});

// Validação para configuração de API
const ApiConfigSchema = z.object({
  baseUrl: z.string().url('URL base inválida').min(1, 'URL base é obrigatória'),
  testBaseUrl: z.string().url('URL de teste inválida').optional(),
  apiVersion: z.string().default('1.0'),
  timeout: z.number().int('Timeout deve ser um número inteiro')
    .min(1000, 'Timeout mínimo é 1000ms')
    .default(30000),
  retries: z.number().int('Número de tentativas deve ser um número inteiro')
    .min(0, 'Número de tentativas não pode ser negativo')
    .max(10, 'Máximo de 10 tentativas')
    .default(3)
});

// Schema principal para o template de gateway de pagamento
export const GatewayTemplateSchema = z.object({
  templateCode: z.string().nonempty('Código do template é obrigatório')
  .regex(/^[A-Z0-9_]+$/, 'Use apenas letras maiúsculas, números e underscores')
    .min(3, 'Deve ter pelo menos 3 caracteres')
    .max(50, 'Máximo de 50 caracteres'),
  name: z.string().min(3, 'Nome é obrigatório e deve ter pelo menos 3 caracteres')
    .max(100, 'Máximo de 100 caracteres'),
  description: z.string().optional(),
  provider: z.string().min(1, 'Provedor é obrigatório')
    .max(100, 'Máximo de 100 caracteres'),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Versão deve seguir o formato semântico (ex: 1.0.0)')
    .default('1.0.0'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT', 'PENDING', 'DEPRECATED'], {
    errorMap: () => ({ message: 'Status inválido' })
  }).default('DRAFT'),
  documentation: z.string().url('URL de documentação inválida').optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Cor deve ser um valor hexadecimal válido'),
  isPublic: z.boolean().default(true),
  credentialFields: z.array(GatewayFieldSchema).default([]),
  settingFields: z.array(GatewayFieldSchema).default([]),
  supportedMethods: z.array(PaymentMethodSchema)
    .min(1, 'Pelo menos um método de pagamento deve ser suportado')
    .default([]),
  apiConfig: ApiConfigSchema
});

// Esquema para recebimento de dados do formulário (com validação menos rígida para logo)
export const GatewayTemplateFormSchema = GatewayTemplateSchema.extend({
  logo: z.any().optional(),
  logoUrl: z.string().optional()
});

// Tipos derivados do schema
export type GatewayTemplate = z.infer<typeof GatewayTemplateSchema>;
export type GatewayTemplateForm = z.infer<typeof GatewayTemplateFormSchema>;

// Schema para validação de formulário web com FormData
export const GatewayTemplateFormDataSchema = z.object({
  templateCode: z.string().min(1, 'Código do template é obrigatório'),
  name: z.string().min(3, 'Nome é obrigatório e deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  provider: z.string().min(1, 'Provedor é obrigatório'),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Versão deve seguir o formato semântico (ex: 1.0.0)'),
  status: z.string().refine((val) => ['ACTIVE', 'INACTIVE', 'DRAFT', 'PENDING', 'DEPRECATED'].includes(val)),
  documentation: z.string().optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Cor deve ser um valor hexadecimal válido'),
  isPublic: z.string().transform(val => val === 'true'),
  logo: z.any().optional(), // FormData file
  credentialFields: z.string().transform(val => JSON.parse(val)),
  settingFields: z.string().transform(val => JSON.parse(val)),
  supportedMethods: z.string().transform(val => JSON.parse(val)),
  apiConfig: z.string().transform(val => JSON.parse(val))
}); 