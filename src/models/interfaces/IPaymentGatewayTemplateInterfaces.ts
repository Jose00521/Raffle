import mongoose from 'mongoose';

// Status do template de gateway
export enum PaymentGatewayTemplateStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE'
}

// Tipos de campos para formulário dinâmico
export enum FieldType {
  TEXT = 'TEXT',
  PASSWORD = 'PASSWORD',
  EMAIL = 'EMAIL',
  URL = 'URL',
  SELECT = 'SELECT',
  CHECKBOX = 'CHECKBOX',
  TEXTAREA = 'TEXTAREA'
}

// Interface para definir campos dinâmicos
export interface IGatewayField {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  description?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    errorMessage?: string;
  };
  options?: { value: string; label: string }[]; // Para SELECT
  defaultValue?: string;
  group: 'credentials' | 'settings'; // Onde o campo vai ser salvo
  isSecret?: boolean; // Se deve ser criptografado
}

// Interface para configuração de métodos de pagamento
export interface IPaymentMethodConfig {
  method: string; // PIX, CREDIT_CARD, BILLET
  enabled: boolean;
  fees?: {
    percentage?: number;
    fixed?: number; // em centavos
  };
  limits?: {
    min?: number; // em centavos
    max?: number; // em centavos
  };
}

// Template principal de gateway (gerenciado pelo admin)
export interface IPaymentGatewayTemplate {
  _id?: string;
  templateCode: string; // Código único do template (ex: MERCADO_PAGO_V1)
  name: string; // Nome amigável (ex: "Mercado Pago")
  description: string;
  provider: string; // Nome do provedor (ex: "MercadoPago")
  version: string; // Versão da API (ex: "v1")
  templateUniqueCode: string; // Código único do template (ex: MERCADO_PAGO_V1)
  // Status e disponibilidade
  status: PaymentGatewayTemplateStatus;
  isPublic: boolean; // Se está disponível para todos os creators
  allowedUserTypes?: string[]; // Tipos de usuário que podem usar (se não for público)
  
  // Configuração visual
  logo?: string; // URL do logo
  color?: string; // Cor do brand
  documentation?: string; // Link para documentação
  
  // Campos dinâmicos para configuração
  credentialFields: IGatewayField[]; // Campos para credenciais (API keys, etc)
  settingFields: IGatewayField[]; // Campos para configurações
  
  // Métodos de pagamento suportados
  supportedMethods: IPaymentMethodConfig[];
  
  // Configuração técnica
  apiConfig: {
    baseUrl: string;
    testBaseUrl?: string;
    apiVersion?: string;
    timeout?: number;
    retries?: number;
  };
  
  // Webhook configuration
  webhookConfig?: {
    supportedEvents: string[];
    signatureHeader?: string;
    signatureMethod?: 'HMAC_SHA256' | 'HMAC_SHA1' | 'RSA';
    requiresSecret: boolean;
  };
  
  // Metadados
  minimumAmount?: number; // Valor mínimo em centavos
  maximumAmount?: number; // Valor máximo em centavos
  currency: string; // Moeda suportada (BRL, USD, etc)
  country: string; // País de operação
  
  // Controle de versão
  isActive: boolean;
  deprecatedAt?: Date;
  
  // Timestamps
  createdBy: mongoose.Types.ObjectId | string; // Admin que criou
  updatedBy?: mongoose.Types.ObjectId | string; // Último admin que editou
  createdAt: Date;
  updatedAt: Date;
}

// Interface para resposta de template (sem dados sensíveis)
export interface IPaymentGatewayTemplatePublic {
  id: string;
  templateCode: string;
  name: string;
  description: string;
  provider: string;
  logo?: string;
  color?: string;
  documentation?: string;
  supportedMethods: string[];
  minimumAmount?: number;
  maximumAmount?: number;
  currency: string;
  credentialFields: Omit<IGatewayField, 'validation'>[];
  settingFields: Omit<IGatewayField, 'validation'>[];
} 