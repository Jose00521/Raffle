import { 
  IPaymentGateway, 
  PaymentGatewayType, 
  IUserPaymentGateway,
  CreateTransactionData,
  PaymentTransactionResponse,
  PaymentDetailsResponse
} from '@/models/interfaces/IPaymentGatewayInterfaces';

// Interfaces específicas da API do Gateway Example
interface CreatePixTransactionRequest {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  paymentMethod: 'PIX';
  amount: number; // em centavos
  traceable: boolean;
  items: {
    unitPrice: number;
    title: string;
    quantity: number;
    tangible: boolean;
  }[];
  externalId?: string;
  postbackUrl?: string;
}

interface CreatePixTransactionResponse {
  id: string;
  customId: string;
  status: string;
  pixQrCode: string;
  pixCode: string;
  amount: number;
  method: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

interface GetPaymentResponse {
  id: string;
  amount: number;
  status: string;
  method: string;
  pixCode?: string;
  pixQrCode?: string;
  customer: {
    name: string;
    email: string;
    cpf: string;
    phone: string;
  };
  items: {
    id: string;
    unitPrice: number;
    quantity: number;
    title: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

interface WebhookPayload {
  paymentId: string;
  externalId?: string;
  customId: string;
  status: string;
  paymentMethod: string;
  totalValue: number;
  netValue: number;
  pixQrCode?: string;
  pixCode?: string;
  expiresAt: string;
  items: Array<{
    id: string;
    unitPrice: number;
    quantity: number;
    title: string;
    tangible: boolean;
  }>;
  customer: {
    id: string;
    name: string;
    email: string;
    cpf: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  refundedAt?: string;
  chargebackAt?: string;
  rejectedAt?: string;
}

/**
 * Implementação específica do gateway de exemplo da documentação
 * Implementa o padrão Strategy (Comportamental)
 */
export class PaymentGatewayExampleService implements IPaymentGateway {
  readonly type = PaymentGatewayType.PAYMENT_GATEWAY_EXAMPLE;
  readonly name = 'Payment Gateway Example';

  private baseUrl = 'https://example.com.br/api/v1';
  private credentials: any;
  private settings: any;

  constructor(private gatewayConfig: IUserPaymentGateway) {
    this.configure(gatewayConfig.credentials, gatewayConfig.settings);
  }

  /**
   * Configura o gateway com credenciais e configurações
   */
  configure(credentials: any, settings: any): void {
    this.credentials = credentials;
    this.settings = settings;
  }

  /**
   * Valida as credenciais do gateway
   */
  async validateCredentials(): Promise<boolean> {
    try {
      // Fazer uma requisição de teste para validar as credenciais
      const response = await this.makeRequest<{ status: string }>('/test', 'GET');
      return response.status === 'ok';
    } catch (error) {
      console.error('Erro na validação de credenciais:', error);
      return false;
    }
  }

  /**
   * Cria uma transação PIX
   */
  async createPixTransaction(data: CreateTransactionData): Promise<PaymentTransactionResponse> {
    const requestData: CreatePixTransactionRequest = {
      name: data.customerInfo.name,
      email: data.customerInfo.email,
      cpf: this.formatCpf(data.customerInfo.document),
      phone: this.formatPhone(data.customerInfo.phone),
      paymentMethod: 'PIX',
      amount: data.amount,
      traceable: true,
      items: data.items.map(item => ({
        unitPrice: item.unitPrice,
        title: item.title,
        quantity: item.quantity,
        tangible: false // rifas são produtos digitais
      })),
      externalId: `${data.campaignId}-${data.userId}-${Date.now()}`,
      postbackUrl: this.settings.webhookUrl || `${process.env.NEXTAUTH_URL}/api/webhooks/payment-gateway`
    };

    const response = await this.makeRequest<CreatePixTransactionResponse>('/transaction.purchase', 'POST', requestData);

    return {
      id: response.id,
      status: response.status,
      amount: response.amount,
      pixQrCode: response.pixQrCode,
      pixCode: response.pixCode,
      expiresAt: response.expiresAt,
      metadata: {
        customId: response.customId,
        method: response.method
      }
    };
  }

  /**
   * Busca detalhes de um pagamento
   */
  async getPaymentDetails(paymentId: string): Promise<PaymentDetailsResponse> {
    const response = await this.makeRequest<GetPaymentResponse>(`/transaction.getPayment?id=${paymentId}`, 'GET');

    return {
      id: response.id,
      status: response.status,
      amount: response.amount,
      method: response.method,
      customer: {
        name: response.customer.name,
        email: response.customer.email,
        document: response.customer.cpf,
        phone: response.customer.phone
      },
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
      metadata: {
        pixCode: response.pixCode,
        pixQrCode: response.pixQrCode
      }
    };
  }

  /**
   * Valida webhook
   */
  validateWebhook(payload: WebhookPayload, signature?: string): boolean {
    // TODO: Implementar validação de assinatura se fornecida pelo gateway
    return !!(
      payload.paymentId &&
      payload.status &&
      payload.paymentMethod &&
      payload.customer &&
      payload.items
    );
  }

  /**
   * Faz requisições para a API do gateway
   */
  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'POST',
    body?: any
  ): Promise<T> {
    if (!this.credentials?.secretKey) {
      throw new Error('Credenciais não configuradas');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': this.credentials.secretKey
    };

    const config: RequestInit = {
      method,
      headers,
      ...(body && { body: JSON.stringify(body) })
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro na API Gateway (${response.status}): ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro na comunicação com Payment Gateway:', error);
      throw new Error(`Falha na comunicação com o gateway: ${error}`);
    }
  }

  /**
   * Formata CPF para o formato esperado (apenas números)
   */
  private formatCpf(cpf: string): string {
    return cpf.replace(/\D/g, '');
  }

  /**
   * Formata telefone para o formato esperado
   */
  private formatPhone(phone: string): string {
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length === 11 && !cleanPhone.startsWith('55')) {
      return `+55${cleanPhone}`;
    }
    
    if (cleanPhone.length === 13 && cleanPhone.startsWith('55')) {
      return `+${cleanPhone}`;
    }
    
    return `+55${cleanPhone}`;
  }

  /**
   * Valor mínimo permitido (R$ 5,00 = 500 centavos)
   */
  static getMinimumAmount(): number {
    return 500;
  }

  /**
   * Valida se o valor está dentro dos limites
   */
  static validateAmount(amount: number): boolean {
    return amount >= this.getMinimumAmount();
  }

  /**
   * Converte status do gateway para status interno
   */
  static mapStatusToInternal(gatewayStatus: string): string {
    const statusMap: Record<string, string> = {
      'PENDING': 'PENDING',
      'APPROVED': 'APPROVED',
      'DECLINED': 'DECLINED',
      'REFUNDED': 'REFUNDED',
      'CANCELED': 'CANCELED',
      'EXPIRED': 'EXPIRED'
    };

    return statusMap[gatewayStatus] || 'PENDING';
  }
} 