import mongoose from 'mongoose';


export enum PaymentStatusEnum {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    DECLINED = 'DECLINED',
    REFUNDED = 'REFUNDED',
    CANCELED = 'CANCELED',
    EXPIRED = 'EXPIRED'
  }
  
  export enum PaymentMethodEnum {
    CREDIT_CARD = 'CREDIT_CARD',
    DEBIT_CARD = 'DEBIT_CARD',
    PIX = 'PIX',
    BILLET = 'BILLET',
    BANK_SLIP = 'BANK_SLIP',
    BANK_TRANSFER = 'BANK_TRANSFER'
  }
  
  // Interface principal de pagamento
  export interface IPayment {
    _id?: string;
    paymentCode?: string; // Código único no nosso sistema (Snowflake ID)
    campaignId: mongoose.Types.ObjectId | string;
    userId: mongoose.Types.ObjectId | string;
    processorTransactionId: string; // ID fornecido pelo processador de pagamento
    amount: number;
    paymentMethod: PaymentMethodEnum;
    status: PaymentStatusEnum;
    numbers: number[]; // Números da rifa comprados neste pagamento
    purchaseDate: Date;
    approvedDate?: Date;
    refundedDate?: Date;
    canceledDate?: Date;
    expireDate?: Date;
    paymentProcessor: string; // Ex: Stripe, Mercado Pago, PayPal
    processorResponse?: {
      code: string;
      message: string;
      referenceId: string;
    };
    customerInfo: {
      name: string;
      email: string;
      document: string; // CPF/CNPJ
      phone: string;
    };
    billingInfo?: {
      address: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    installments?: number;
    installmentAmount?: number;
    metadata?: Record<string, any>; // Dados adicionais do pagamento
    createdAt: Date;
    updatedAt: Date;
    systemCreatedAt?: Date; // Timestamp de quando o registro foi criado no sistema
  }