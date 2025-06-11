import { PaymentMethodEnum } from '@/models/interfaces/IPaymentInterfaces';

// Interfaces para a API do Gateway
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
  // ... outros campos da resposta
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
  // ... outros campos
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
  items: {
    id: string;
    unitPrice: number;
    quantity: number;
    title: string;
    tangible: boolean;
  }[];
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

export class PaymentGatewayService {
  private static readonly BASE_URL = 'https://example.com.br/api/v1';
  private static readonly SECRET_KEY = process.env.PAYMENT_GATEWAY_SECRET_KEY;

  /**
   * Valida se as configurações necessárias estão presentes
   */
  private static validateConfig(): void {
    if (!this.SECRET_KEY) {
      throw new Error('PAYMENT_GATEWAY_SECRET_KEY não configurada');
    }
  }

  /**
   * Faz requisições para a API do gateway
   */
  private static async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'POST',
    body?: any
  ): Promise<T> {
    this.validateConfig();

    const url = `${this.BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': this.SECRET_KEY!
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
      throw new Error(`Falha na comunicação com o gateway de pagamento: ${error}`);
    }
  }

  /**
   * Cria uma transação PIX
   */
  static async createPixTransaction(data: {
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
  }): Promise<CreatePixTransactionResponse> {
    const requestData: CreatePixTransactionRequest = {
      name: data.customerInfo.name,
      email: data.customerInfo.email,
      cpf: data.customerInfo.document,
      phone: data.customerInfo.phone,
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
      postbackUrl: `${process.env.NEXTAUTH_URL}/api/webhooks/payment-gateway`
    };

    return this.makeRequest<CreatePixTransactionResponse>('/transaction.purchase', 'POST', requestData);
  }

  /**
   * Busca detalhes de um pagamento
   */
  static async getPaymentDetails(paymentId: string): Promise<GetPaymentResponse> {
    return this.makeRequest<GetPaymentResponse>(`/transaction.getPayment?id=${paymentId}`, 'GET');
  }

  /**
   * Valida se um webhook é válido (adicione validação de assinatura se necessário)
   */
  static validateWebhook(payload: WebhookPayload, signature?: string): boolean {
    // TODO: Implementar validação de assinatura do webhook se fornecida pelo gateway
    // Por enquanto, validação básica dos campos obrigatórios
    return !!(
      payload.paymentId &&
      payload.status &&
      payload.paymentMethod &&
      payload.customer &&
      payload.items
    );
  }

  /**
   * Converte status do gateway para status interno
   */
  static mapGatewayStatusToInternal(gatewayStatus: string): string {
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

  /**
   * Calcula o valor mínimo permitido pelo gateway (R$ 5,00 = 500 centavos)
   */
  static getMinimumAmount(): number {
    return 500; // 500 centavos = R$ 5,00
  }

  /**
   * Valida se o valor está dentro dos limites do gateway
   */
  static validateAmount(amount: number): boolean {
    return amount >= this.getMinimumAmount();
  }

  /**
   * Formata CPF para o formato esperado pelo gateway (apenas números)
   */
  static formatCpf(cpf: string): string {
    return cpf.replace(/\D/g, '');
  }

  /**
   * Formata telefone para o formato esperado pelo gateway
   */
  static formatPhone(phone: string): string {
    // Remove caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Adiciona +55 se não tiver código do país
    if (cleanPhone.length === 11 && !cleanPhone.startsWith('55')) {
      return `+55${cleanPhone}`;
    }
    
    if (cleanPhone.length === 13 && cleanPhone.startsWith('55')) {
      return `+${cleanPhone}`;
    }
    
    return `+55${cleanPhone}`;
  }
}

export type { CreatePixTransactionResponse, GetPaymentResponse, WebhookPayload }; 