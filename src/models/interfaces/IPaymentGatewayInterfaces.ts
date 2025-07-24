import mongoose from 'mongoose';

// Tipos de gateway suportados
export enum PaymentGatewayType {
  PAYMENT_GATEWAY_EXAMPLE = 'PAYMENT_GATEWAY_EXAMPLE',
  MERCADO_PAGO = 'MERCADO_PAGO',
  STRIPE = 'STRIPE',
  PAGARME = 'PAGARME',
  // Adicione outros conforme necessário
}

// Status do gateway
export enum PaymentGatewayStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING_VALIDATION = 'PENDING_VALIDATION',
  ERROR = 'ERROR'
}

// Interface para configurações de gateway por usuário
export interface IUserPaymentGateway {
  _id?: string;
  userId: mongoose.Types.ObjectId | string;
  gatewayCode: string;
  description: string;
  // Referência ao template do gateway
  templateRef: mongoose.Types.ObjectId | string; // Referência ao PaymentGatewayTemplate
  templateCode: string; // Código do template para busca rápida
  
  isDefault: boolean; // Gateway principal do usuário
  status: PaymentGatewayStatus;
  
  // Configurações específicas do gateway (valores dinâmicos baseados no template)
  credentials: Record<string, any>; // Campos definidos no template (criptografados conforme necessário)
  settings: Record<string, any>; // Configurações definidas no template
  
  // Metadados
  displayName: string; // Nome amigável para o usuário
  lastValidatedAt?: Date;
  validationError?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// Interface base para implementação de gateways
export interface IPaymentGateway {
  readonly type: PaymentGatewayType;
  readonly name: string;
  
  // Métodos obrigatórios
  createPixTransaction(data: CreateTransactionData): Promise<PaymentTransactionResponse>;
  getPaymentDetails(paymentId: string): Promise<PaymentDetailsResponse>;
  validateWebhook(payload: any, signature?: string): boolean;
  
  // Validação de credenciais
  validateCredentials(): Promise<boolean>;
  
  // Configuração
  configure(credentials: any, settings: any): void;
}

// Dados para criar transação
export interface CreateTransactionData {
  campaignId: string;
  userId: string;
  amount: number; // em centavos
  customerInfo: {
    name: string;
    email: string;
    document: string;
    phone: string;
  };
  items: {
    title: string;
    quantity: number;
    unitPrice: number;
  }[];
  metadata?: Record<string, any>;
}

// Resposta padronizada de transação
export interface PaymentTransactionResponse {
  id: string;
  status: string;
  amount: number;
  pixQrCode?: string;
  pixCode?: string;
  billetUrl?: string;
  billetCode?: string;
  expiresAt: string;
  metadata?: Record<string, any>;
}

// Resposta padronizada de detalhes
export interface PaymentDetailsResponse {
  id: string;
  status: string;
  amount: number;
  method: string;
  customer: {
    name: string;
    email: string;
    document: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  metadata?: Record<string, any>;
} 