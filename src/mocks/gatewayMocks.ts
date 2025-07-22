/**
 * Interfaces e dados mock para gateways de pagamento
 * Baseado no modelo PaymentGatewayTemplateSchema
 */

// Enums de status
export enum PaymentGatewayTemplateStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DEPRECATED = 'DEPRECATED',
  DRAFT = 'DRAFT',
  PENDING = 'PENDING'
}

// Interface para campo de gateway
export interface GatewayField {
  name: string;
  label: string;
  type: 'text' | 'password' | 'select' | 'checkbox' | 'number';
  required: boolean;
  description?: string;
  placeholder?: string;
  defaultValue?: string;
  options?: Array<{ label: string; value: string }>;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
  isSecret?: boolean;
  group?: string;
}

// Interface para método de pagamento suportado
export interface PaymentMethodConfig {
  method: string;
  enabled: boolean;
  displayName: string;
  icon?: string;
  fees?: {
    fixed?: number;
    percentage?: number;
  };
  limits?: {
    min?: number;
    max?: number;
  };
  settings?: Record<string, any>;
}

// Interface principal para o template de gateway
export interface Gateway {
  templateCode: string;
  name: string;
  description: string;
  provider: string;
  version: string;
  status: PaymentGatewayTemplateStatus;
  isPublic: boolean;
  allowedUserTypes?: string[];
  logo?: string;
  color?: string;
  documentation?: string;
  credentialFields: GatewayField[];
  settingFields: GatewayField[];
  supportedMethods: PaymentMethodConfig[];
  apiConfig: {
    baseUrl: string;
    testBaseUrl?: string;
    apiVersion?: string;
    timeout?: number;
    retries?: number;
  };
  webhookConfig?: {
    supportedEvents?: string[];
    signatureHeader?: string;
    signatureMethod?: 'HMAC_SHA256' | 'HMAC_SHA1' | 'RSA';
    requiresSecret?: boolean;
  };
  minimumAmount?: number;
  maximumAmount?: number;
  currency?: string;
  country?: string;
  isActive: boolean;
  deprecatedAt?: string;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  
  // Campos adicionais para UI/estatísticas
  transactionCount?: number;
  transactionVolume?: number;
  transactionFees?: number;
  successRate?: number;
}

// Interface para as estatísticas
export interface GatewayStatistics {
  totalGateways: number;
  activeGateways: number;
  totalTransactionVolume: number;
  totalTransactions: number;
  averageSuccessRate: number;
  topGateways: Array<{
    templateCode: string;
    name: string;
    transactions: number;
    volume: number;
  }>;
  recentActivity: Array<{
    id: string;
    gatewayCode: string;
    gatewayName: string;
    action: string;
    date: string;
    user: string;
  }>;
}

// Dados mock
export const mockGatewayData = {
  gatewayTypes: [
    { id: 'credit-card', name: 'Cartão de Crédito', icon: 'credit-card' },
    { id: 'debit-card', name: 'Cartão de Débito', icon: 'credit-card' },
    { id: 'bank-slip', name: 'Boleto Bancário', icon: 'file-invoice' },
    { id: 'pix', name: 'PIX', icon: 'exchange-alt' },
    { id: 'crypto', name: 'Criptomoeda', icon: 'bitcoin' },
    { id: 'bank-transfer', name: 'Transferência Bancária', icon: 'university' }
  ],
  
  gateways: [
    {
      templateCode: 'MERCADOPAGO_V1',
      name: 'MercadoPago',
      description: 'Processador de pagamento do MercadoLivre',
      provider: 'MercadoLivre',
      version: 'v1',
      status: PaymentGatewayTemplateStatus.ACTIVE,
      isPublic: true,
      allowedUserTypes: ['creator', 'admin'],
      logo: '/images/gateways/mercadopago.png',
      color: '#009EE3',
      documentation: 'https://www.mercadopago.com.br/developers/pt/docs/checkout-api/landing',
      credentialFields: [
        {
          name: 'accessToken',
          label: 'Token de Acesso',
          type: 'password',
          required: true,
          description: 'Token de acesso da API do MercadoPago',
          isSecret: true
        },
        {
          name: 'publicKey',
          label: 'Chave Pública',
          type: 'text',
          required: true,
          description: 'Chave pública para integração via JavaScript',
          isSecret: false
        }
      ],
      settingFields: [
        {
          name: 'installments',
          label: 'Parcelamento Máximo',
          type: 'select',
          required: false,
          defaultValue: '12',
          options: [
            { label: '1x', value: '1' },
            { label: '2x', value: '2' },
            { label: '3x', value: '3' },
            { label: '6x', value: '6' },
            { label: '12x', value: '12' }
          ]
        }
      ],
      supportedMethods: [
        {
          method: 'CREDIT_CARD',
          enabled: true,
          displayName: 'Cartão de Crédito',
          icon: 'credit-card',
          fees: { percentage: 4.99 }
        },
        {
          method: 'PIX',
          enabled: true,
          displayName: 'PIX',
          icon: 'qrcode',
          fees: { percentage: 1.99 }
        },
        {
          method: 'BILLET',
          enabled: true,
          displayName: 'Boleto Bancário',
          icon: 'file-invoice',
          fees: { percentage: 3.99 }
        }
      ],
      apiConfig: {
        baseUrl: 'https://api.mercadopago.com/v1',
        testBaseUrl: 'https://api.mercadopago.com/v1',
        apiVersion: 'v1',
        timeout: 30000,
        retries: 3
      },
      webhookConfig: {
        supportedEvents: ['payment.created', 'payment.updated', 'payment.status_updated'],
        signatureHeader: 'x-signature',
        signatureMethod: 'HMAC_SHA256',
        requiresSecret: true
      },
      minimumAmount: 5,
      maximumAmount: 50000,
      currency: 'BRL',
      country: 'BR',
      isActive: true,
      createdBy: '60a5e8b4e6b3f32d1c9e9b72',
      createdAt: '2023-09-15T10:30:00Z',
      updatedAt: '2023-10-20T14:25:00Z',
      transactionCount: 12500,
      transactionVolume: 875000,
      transactionFees: 26250,
      successRate: 98.5
    },
    {
      templateCode: 'PAYPAL_V1',
      name: 'PayPal',
      description: 'Solução internacional de pagamento',
      provider: 'PayPal Inc.',
      version: 'v1',
      status: PaymentGatewayTemplateStatus.ACTIVE,
      isPublic: true,
      allowedUserTypes: ['CREATOR', 'ADMIN'],
      logo: '/images/gateways/paypal.png',
      color: '#003087',
      documentation: 'https://developer.paypal.com/docs/api/overview/',
      credentialFields: [
        {
          name: 'clientId',
          label: 'Client ID',
          type: 'text',
          required: true,
          description: 'ID do Cliente PayPal',
          isSecret: false
        },
        {
          name: 'clientSecret',
          label: 'Client Secret',
          type: 'password',
          required: true,
          description: 'Secret do Cliente PayPal',
          isSecret: true
        }
      ],
      settingFields: [
        {
          name: 'mode',
          label: 'Ambiente',
          type: 'select',
          required: true,
          defaultValue: 'sandbox',
          options: [
            { label: 'Sandbox', value: 'sandbox' },
            { label: 'Produção', value: 'production' }
          ]
        }
      ],
      supportedMethods: [
        {
          method: 'paypal',
          enabled: true,
          displayName: 'PayPal',
          icon: 'paypal',
          fees: { percentage: 4.79, fixed: 0.60 }
        },
        {
          method: 'credit_card',
          enabled: true,
          displayName: 'Cartão de Crédito via PayPal',
          icon: 'credit-card',
          fees: { percentage: 4.99 }
        }
      ],
      apiConfig: {
        baseUrl: 'https://api.paypal.com/v1',
        testBaseUrl: 'https://api.sandbox.paypal.com/v1',
        apiVersion: 'v1',
        timeout: 30000,
        retries: 3
      },
      webhookConfig: {
        supportedEvents: ['PAYMENT.SALE.COMPLETED', 'PAYMENT.SALE.DENIED'],
        signatureHeader: 'PAYPAL-TRANSMISSION-SIG',
        signatureMethod: 'HMAC_SHA256',
        requiresSecret: true
      },
      minimumAmount: 1,
      maximumAmount: 30000,
      currency: 'BRL',
      country: 'BR',
      isActive: true,
      createdBy: '60a5e8b4e6b3f32d1c9e9b72',
      createdAt: '2023-07-10T08:15:00Z',
      updatedAt: '2023-10-18T09:40:00Z',
      transactionCount: 8700,
      transactionVolume: 698000,
      transactionFees: 20940,
      successRate: 99.2
    },
    {
      templateCode: 'PAGSEGURO_V1',
      name: 'PagSeguro',
      description: 'Gateway de pagamento brasileiro',
      provider: 'PagSeguro UOL',
      version: 'v1',
      status: PaymentGatewayTemplateStatus.ACTIVE,
      isPublic: true,
      allowedUserTypes: ['CREATOR', 'ADMIN'],
      logo: '/images/gateways/pagseguro.png',
      color: '#4BB8A9',
      documentation: 'https://dev.pagseguro.uol.com.br/reference',
      credentialFields: [
        {
          name: 'email',
          label: 'E-mail',
          type: 'text',
          required: true,
          description: 'E-mail da conta PagSeguro',
          isSecret: false
        },
        {
          name: 'token',
          label: 'Token',
          type: 'password',
          required: true,
          description: 'Token de integração',
          isSecret: true
        }
      ],
      settingFields: [
        {
          name: 'installments',
          label: 'Parcelamento Máximo',
          type: 'select',
          required: false,
          defaultValue: '12',
          options: [
            { label: '1x', value: '1' },
            { label: '3x', value: '3' },
            { label: '6x', value: '6' },
            { label: '12x', value: '12' }
          ]
        }
      ],
      supportedMethods: [
        {
          method: 'credit_card',
          enabled: true,
          displayName: 'Cartão de Crédito',
          icon: 'credit-card',
          fees: { percentage: 4.99 }
        },
        {
          method: 'boleto',
          enabled: true,
          displayName: 'Boleto Bancário',
          icon: 'file-invoice',
          fees: { percentage: 3.49 }
        },
        {
          method: 'pix',
          enabled: true,
          displayName: 'PIX',
          icon: 'qrcode',
          fees: { percentage: 1.99 }
        }
      ],
      apiConfig: {
        baseUrl: 'https://ws.pagseguro.uol.com.br',
        testBaseUrl: 'https://ws.sandbox.pagseguro.uol.com.br',
        apiVersion: 'v2',
        timeout: 30000,
        retries: 3
      },
      webhookConfig: {
        supportedEvents: ['TRANSACTION_STATUS_CHANGED'],
        requiresSecret: false
      },
      minimumAmount: 5,
      maximumAmount: 50000,
      currency: 'BRL',
      country: 'BR',
      isActive: true,
      createdBy: '60a5e8b4e6b3f32d1c9e9b72',
      createdAt: '2023-08-05T11:45:00Z',
      updatedAt: '2023-10-10T16:20:00Z',
      transactionCount: 10200,
      transactionVolume: 750000,
      transactionFees: 22500,
      successRate: 97.8
    },
    {
      templateCode: 'STRIPE_V1',
      name: 'Stripe',
      description: 'Processador de pagamento internacional',
      provider: 'Stripe Inc.',
      version: 'v1',
      status: PaymentGatewayTemplateStatus.INACTIVE,
      isPublic: true,
      allowedUserTypes: ['CREATOR', 'ADMIN'],
      logo: '/images/gateways/stripe.png',
      color: '#635BFF',
      documentation: 'https://stripe.com/docs/api',
      credentialFields: [
        {
          name: 'publishableKey',
          label: 'Publishable Key',
          type: 'text',
          required: true,
          description: 'Chave pública do Stripe',
          isSecret: false
        },
        {
          name: 'secretKey',
          label: 'Secret Key',
          type: 'password',
          required: true,
          description: 'Chave secreta do Stripe',
          isSecret: true
        }
      ],
      settingFields: [
        {
          name: 'webhookSecret',
          label: 'Webhook Secret',
          type: 'password',
          required: false,
          description: 'Secret para validar webhooks',
          isSecret: true
        }
      ],
      supportedMethods: [
        {
          method: 'credit_card',
          enabled: true,
          displayName: 'Cartão de Crédito',
          icon: 'credit-card',
          fees: { percentage: 3.99, fixed: 0.30 }
        }
      ],
      apiConfig: {
        baseUrl: 'https://api.stripe.com/v1',
        timeout: 30000,
        retries: 3
      },
      webhookConfig: {
        supportedEvents: ['payment_intent.succeeded', 'payment_intent.payment_failed'],
        signatureHeader: 'Stripe-Signature',
        signatureMethod: 'HMAC_SHA256',
        requiresSecret: true
      },
      minimumAmount: 0.5,
      maximumAmount: 999999,
      currency: 'BRL',
      country: 'BR',
      isActive: false,
      createdBy: '60a5e8b4e6b3f32d1c9e9b72',
      createdAt: '2023-05-20T09:30:00Z',
      updatedAt: '2023-09-15T10:15:00Z',
      transactionCount: 6500,
      transactionVolume: 520000,
      transactionFees: 15600,
      successRate: 99.5
    },
    {
      templateCode: 'PIX_DIRECT_V1',
      name: 'PIX Direto',
      description: 'Integração direta com PIX',
      provider: 'Banco Central do Brasil',
      version: 'v1',
      status: PaymentGatewayTemplateStatus.ACTIVE,
      isPublic: true,
      allowedUserTypes: ['CREATOR', 'ADMIN'],
      logo: '/images/gateways/pix.png',
      color: '#32BCAD',
      documentation: 'https://www.bcb.gov.br/estabilidadefinanceira/pix',
      credentialFields: [
        {
          name: 'clientId',
          label: 'Client ID',
          type: 'text',
          required: true,
          description: 'ID do cliente fornecido pelo banco',
          isSecret: false
        },
        {
          name: 'clientSecret',
          label: 'Client Secret',
          type: 'password',
          required: true,
          description: 'Secret fornecido pelo banco',
          isSecret: true
        },
        {
          name: 'certificate',
          label: 'Certificado',
          type: 'text',
          required: true,
          description: 'Certificado para autenticação',
          isSecret: true
        }
      ],
      settingFields: [
        {
          name: 'pixKey',
          label: 'Chave PIX',
          type: 'text',
          required: true,
          description: 'Chave PIX para recebimentos',
          isSecret: false
        }
      ],
      supportedMethods: [
        {
          method: 'pix',
          enabled: true,
          displayName: 'PIX',
          icon: 'qrcode',
          fees: { percentage: 1.00 }
        }
      ],
      apiConfig: {
        baseUrl: 'https://api.bancodobrasil.com.br/pix/v1',
        testBaseUrl: 'https://api.hm.bb.com.br/pix/v1',
        apiVersion: 'v1',
        timeout: 20000,
        retries: 2
      },
      webhookConfig: {
        supportedEvents: ['PIX_PAYMENT_RECEIVED', 'PIX_PAYMENT_EXPIRED'],
        signatureHeader: 'x-signature',
        signatureMethod: 'HMAC_SHA256',
        requiresSecret: true
      },
      minimumAmount: 0.01,
      maximumAmount: 100000,
      currency: 'BRL',
      country: 'BR',
      isActive: true,
      createdBy: '60a5e8b4e6b3f32d1c9e9b72',
      createdAt: '2023-10-01T14:20:00Z',
      updatedAt: '2023-10-22T11:10:00Z',
      transactionCount: 15800,
      transactionVolume: 950000,
      transactionFees: 9500,
      successRate: 99.8
    },
    {
      templateCode: 'BOLETO_BANCARIO_V1',
      name: 'BoletoBancário',
      description: 'Processador de boletos bancários',
      provider: 'Banco do Brasil',
      version: 'v1',
      status: PaymentGatewayTemplateStatus.ACTIVE,
      isPublic: true,
      allowedUserTypes: ['CREATOR'],
      logo: '/images/gateways/boleto.png',
      color: '#FFCC00',
      documentation: 'https://www.bb.com.br/pbb/pagina-inicial/empresas/produtos-e-servicos/cobranca#/',
      credentialFields: [
        {
          name: 'convenio',
          label: 'Convênio',
          type: 'text',
          required: true,
          description: 'Número do convênio',
          isSecret: false
        },
        {
          name: 'carteira',
          label: 'Carteira',
          type: 'text',
          required: true,
          description: 'Número da carteira',
          isSecret: false
        }
      ],
      settingFields: [
        {
          name: 'diasVencimento',
          label: 'Dias para Vencimento',
          type: 'number',
          required: true,
          defaultValue: '3',
          description: 'Dias úteis para vencimento'
        }
      ],
      supportedMethods: [
        {
          method: 'boleto',
          enabled: true,
          displayName: 'Boleto Bancário',
          icon: 'file-invoice',
          fees: { percentage: 2.00, fixed: 1.50 }
        }
      ],
      apiConfig: {
        baseUrl: 'https://api.bb.com.br/cobrancas/v1',
        testBaseUrl: 'https://api.hm.bb.com.br/cobrancas/v1',
        apiVersion: 'v1',
        timeout: 30000,
        retries: 3
      },
      webhookConfig: {
        supportedEvents: ['BOLETO_PAID', 'BOLETO_EXPIRED'],
        requiresSecret: false
      },
      minimumAmount: 5,
      maximumAmount: 100000,
      currency: 'BRL',
      country: 'BR',
      isActive: true,
      createdBy: '60a5e8b4e6b3f32d1c9e9b72',
      createdAt: '2023-06-12T16:45:00Z',
      updatedAt: '2023-10-05T09:30:00Z',
      transactionCount: 7300,
      transactionVolume: 680000,
      transactionFees: 13600,
      successRate: 96.5
    },
    {
      templateCode: 'CRYPTOPAY_V1',
      name: 'CryptoPay',
      description: 'Processador de pagamentos em criptomoeda',
      provider: 'CryptoPayments Inc.',
      version: 'v1',
      status: PaymentGatewayTemplateStatus.PENDING,
      isPublic: false,
      allowedUserTypes: ['ADMIN'],
      logo: '/images/gateways/crypto.png',
      color: '#FF9900',
      documentation: 'https://cryptopay.com/docs',
      credentialFields: [
        {
          name: 'apiKey',
          label: 'API Key',
          type: 'text',
          required: true,
          description: 'Chave da API CryptoPay',
          isSecret: false
        },
        {
          name: 'apiSecret',
          label: 'API Secret',
          type: 'password',
          required: true,
          description: 'Secret da API CryptoPay',
          isSecret: true
        }
      ],
      settingFields: [
        {
          name: 'acceptedCoins',
          label: 'Moedas Aceitas',
          type: 'select',
          required: true,
          options: [
            { label: 'Bitcoin (BTC)', value: 'btc' },
            { label: 'Ethereum (ETH)', value: 'eth' },
            { label: 'USD Coin (USDC)', value: 'usdc' }
          ]
        }
      ],
      supportedMethods: [
        {
          method: 'crypto',
          enabled: true,
          displayName: 'Criptomoedas',
          icon: 'bitcoin',
          fees: { percentage: 1.00 }
        }
      ],
      apiConfig: {
        baseUrl: 'https://api.cryptopay.com/v1',
        testBaseUrl: 'https://api.sandbox.cryptopay.com/v1',
        apiVersion: 'v1',
        timeout: 30000,
        retries: 3
      },
      webhookConfig: {
        supportedEvents: ['payment.confirmed', 'payment.failed'],
        signatureHeader: 'X-Cryptopay-Signature',
        signatureMethod: 'HMAC_SHA256',
        requiresSecret: true
      },
      minimumAmount: 10,
      maximumAmount: 50000,
      currency: 'BRL',
      country: 'BR',
      isActive: true,
      createdBy: '60a5e8b4e6b3f32d1c9e9b72',
      createdAt: '2023-09-28T13:15:00Z',
      updatedAt: '2023-10-20T17:40:00Z',
      transactionCount: 950,
      transactionVolume: 180000,
      transactionFees: 1800,
      successRate: 98.7
    }
  ],
  
  statistics: {
    totalGateways: 7,
    activeGateways: 5,
    totalTransactionVolume: 4653000,
    totalTransactions: 61950,
    averageSuccessRate: 98.6,
    topGateways: [
      {
        templateCode: 'PIX_DIRECT_V1',
        name: 'PIX Direto',
        transactions: 15800,
        volume: 950000
      },
      {
        templateCode: 'MERCADOPAGO_V1',
        name: 'MercadoPago',
        transactions: 12500,
        volume: 875000
      },
      {
        templateCode: 'PAGSEGURO_V1',
        name: 'PagSeguro',
        transactions: 10200,
        volume: 750000
      }
    ],
    recentActivity: [
      {
        id: 'act-1',
        gatewayCode: 'MERCADOPAGO_V1',
        gatewayName: 'MercadoPago',
        action: 'API Key atualizada',
        date: '2023-10-20T14:25:00Z',
        user: 'Carlos Silva'
      },
      {
        id: 'act-2',
        gatewayCode: 'PIX_DIRECT_V1',
        gatewayName: 'PIX Direto',
        action: 'Webhook configurado',
        date: '2023-10-22T11:10:00Z',
        user: 'Maria Santos'
      },
      {
        id: 'act-3',
        gatewayCode: 'CRYPTOPAY_V1',
        gatewayName: 'CryptoPay',
        action: 'Gateway adicionado',
        date: '2023-09-28T13:15:00Z',
        user: 'João Oliveira'
      },
      {
        id: 'act-4',
        gatewayCode: 'PAYPAL_V1',
        gatewayName: 'PayPal',
        action: 'Modo alterado para produção',
        date: '2023-10-18T09:40:00Z',
        user: 'Ana Costa'
      }
    ]
  }
}; 