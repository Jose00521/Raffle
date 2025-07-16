import mongoose from 'mongoose';
import { IAddress } from './IUserInterfaces';
import { ICampaign, INumberPackageCampaign } from './ICampaignInterfaces';
import { ISODateString } from 'next-auth';
import { Document } from 'mongoose';


export enum PaymentStatusEnum {
    PENDING = 'PENDING',
    INITIALIZED = 'INITIALIZED',
    APPROVED = 'APPROVED',
    FAILED = 'FAILED',
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
    idempotencyKey?: string; // Chave para evitar duplicação de pagamentos
    campaignId: mongoose.Types.ObjectId | string;
    customerId: mongoose.Types.ObjectId | string;
    creatorId: mongoose.Types.ObjectId | string;
    processorTransactionId: string; // ID fornecido pelo processador de pagamento
    amount: number;
    taxSeller: number;
    taxPlatform: number;
    amountReceived: number;
    paymentMethod: PaymentMethodEnum;
    status: PaymentStatusEnum;
    numbersQuantity: number; // Números da rifa comprados neste pagamento
    pixCode?: string;
    purchaseAt: Date;
    approvedAt?: Date;
    refundedAt?: Date;
    canceledAt?: Date;
    expiresAt?: Date;
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

  export interface ICreditCard {
    token: string,
    installments: number,
    number: string,
    holder_name: string,
    cvv: string,
    expiration_month: string,
    expiration_year: string
  }



  export interface IPaymentPattern {
    userCode: string;
    name: string;
    email: string;
    cpf: string;
    phone: string;
    amount: number;
    creditCard?: ICreditCard;
    paymentMethod: PaymentMethodEnum;
    paymentCode?: string;
    address: IAddress;
    expiresAt?: ISODateString; // ✅ Opcional - será definido pelo hook pre-save
    campanha: ICampaign;
    selectedPackage: INumberPackageCampaign;
    idempotencyKey?: string;
  }


  // Pagination Data Response
  export interface IPaginationDataResponse {
      totalItems: number;
      totalPages: number;
      page: number;
      limit: number;
      skip: number;
  }

  export interface IPaginationDataRequest {
    page: number;
    pageSize: number;
  }


export interface IPaymentPaginationRequest {
  page: number;
  pageSize: number;
  searchTerm: string;
  campaignId: string;
  status: string;
  startDate: string;
  endDate: string;
}

export interface IPaymentPaginationRequestServer {
  userCode: string;
  page: number;
  limit: number;
  skip: number;
  searchTerm: string;
  campaignId: string;
  status: string;
  startDate: string;
  endDate: string;
}

  export interface IPaymentPaginationResponse {
    paginationData: IPaginationDataResponse;
    campaigns: Partial<ICampaign>[];
    sales: IPayment[];
  }




  //Ghostspay Payment Request
  export interface IPaymentGhostRequest {
    name: string;
    email: string;
    cpf: string;
    phone: string;
    amount: number;
    creditCard?: ICreditCard;
    paymentMethod: PaymentMethodEnum;
    cep?: string;
    street?: string;
    externalId?: string;
    number?: string;
    complement?: string;
    district?: string;
    city?: string;
    state?: string;
    traceable: boolean;
    expiresAt?: ISODateString;
    items: {
      unitPrice: number;
      title: string;
      quantity: number;
      tangible: boolean;
    }[];
  }


  //Ghostspay Payment Response
  export interface IPaymentGhostResponse {
      id: string
      customId: string
      installments: number
      expiresAt: string
      dueAt: string
      approvedAt: string
      refundedAt: string
      rejectedAt: string
      chargebackAt: string
      availableAt: string
      pixQrCode: string
      pixCode: string
      billetUrl: string
      billetCode: string
      status: string
      address: string
      district: string
      number: string
      complement: string
      city: string
      state: string
      zipCode: string
      amount: number
      taxSeller: number
      taxPlatform: number
      amountSeller: number
      amountGarantee: number
      taxGarantee: number
      traceable: boolean
      method: string
      deliveryStatus: string
      createdAt: string
      updatedAt: string
      utmQuery: string
      checkoutUrl: string
      referrerUrl: string
      externalId: string
      postbackUrl: string
    }


    //GhostPay Payment Webhook POST
      export interface IPaymentGhostWebhookPost {
        paymentId: string
        externalId: string
        checkoutUrl: string
        referrerUrl: string
        customId: string
        status: string
        paymentMethod: string
        deliveryStatus: string
        totalValue: number
        netValue: number
        pixQrCode: string
        pixCode: string
        billetUrl: string
        billetCode: string
        expiresAt: string
        dueAt: string
        installments: number
        utm: string
        items: Item[]
        customer: Customer
        createdAt: string
        updatedAt: string
        approvedAt: string
        refundedAt: any
        chargebackAt: any
        rejectedAt: any
      }
      
      export interface Item {
        id: string
        name: string
        quantity: number
        price: number
      }
      
      export interface Customer {
        id: string
        name: string
        email: string
        cpf: string
        cep: string
        phone: string
        complement: string
        number: string
        street: string
        city: string
        state: string
        district: string
        createdAt: string
        updatedAt: string
      }
      


    //Ghostspay Error Response
    export interface IPaymentGhostErrorResponse {
      message: string;
      code: string;
      issues: [{
        validation: string;
        message: string;
        code: string;
        path: string[];
      }]
    }
    
  