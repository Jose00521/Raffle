import { PaymentMethodEnum } from "@/models/interfaces/IPaymentInterfaces";
import { ISODateString } from 'next-auth';


export interface ICreditCard {
    token: string,
    installments: number,
    number: string,
    holder_name: string,
    cvv: string,
    expiration_month: string,
    expiration_year: string
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