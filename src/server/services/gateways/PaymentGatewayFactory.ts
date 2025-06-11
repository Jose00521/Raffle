import { 
  IPaymentGateway, 
  PaymentGatewayType, 
  IUserPaymentGateway 
} from '@/models/interfaces/IPaymentGatewayInterfaces';
import { PaymentGatewayExampleService } from './PaymentGatewayExampleService';
// import { MercadoPagoService } from './MercadoPagoService';
// import { StripeService } from './StripeService';

/**
 * Factory para criar instâncias de gateways de pagamento
 * Implementa o padrão Factory (Criacional)
 */
export class PaymentGatewayFactory {
  
  /**
   * Cria uma instância do gateway baseado no tipo
   */
  static createGateway(gatewayConfig: IUserPaymentGateway): IPaymentGateway {
    switch (gatewayConfig.gatewayType) {
      case PaymentGatewayType.PAYMENT_GATEWAY_EXAMPLE:
        return new PaymentGatewayExampleService(gatewayConfig);
        
      case PaymentGatewayType.MERCADO_PAGO:
        // return new MercadoPagoService(gatewayConfig);
        throw new Error('MercadoPago ainda não implementado');
        
      case PaymentGatewayType.STRIPE:
        // return new StripeService(gatewayConfig);
        throw new Error('Stripe ainda não implementado');
        
      case PaymentGatewayType.PAGARME:
        // return new PagarMeService(gatewayConfig);
        throw new Error('PagarMe ainda não implementado');
        
      default:
        throw new Error(`Gateway não suportado: ${gatewayConfig.gatewayType}`);
    }
  }

  /**
   * Lista todos os tipos de gateway disponíveis
   */
  static getAvailableGateways(): Array<{
    type: PaymentGatewayType;
    name: string;
    description: string;
    supportedMethods: string[];
  }> {
    return [
      {
        type: PaymentGatewayType.PAYMENT_GATEWAY_EXAMPLE,
        name: 'Payment Gateway Example',
        description: 'Gateway de exemplo da documentação fornecida',
        supportedMethods: ['PIX', 'CREDIT_CARD', 'BILLET']
      },
      {
        type: PaymentGatewayType.MERCADO_PAGO,
        name: 'Mercado Pago',
        description: 'Gateway de pagamento Mercado Pago',
        supportedMethods: ['PIX', 'CREDIT_CARD', 'BILLET']
      },
      {
        type: PaymentGatewayType.STRIPE,
        name: 'Stripe',
        description: 'Gateway de pagamento Stripe',
        supportedMethods: ['CREDIT_CARD']
      },
      {
        type: PaymentGatewayType.PAGARME,
        name: 'PagarMe',
        description: 'Gateway de pagamento PagarMe',
        supportedMethods: ['PIX', 'CREDIT_CARD', 'BILLET']
      }
    ];
  }

  /**
   * Valida se um tipo de gateway é suportado
   */
  static isGatewaySupported(gatewayType: PaymentGatewayType): boolean {
    return Object.values(PaymentGatewayType).includes(gatewayType);
  }

  /**
   * Obtém metadados de um gateway específico
   */
  static getGatewayMetadata(gatewayType: PaymentGatewayType) {
    const available = this.getAvailableGateways();
    return available.find(gateway => gateway.type === gatewayType);
  }
} 