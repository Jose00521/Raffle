import { Types } from 'mongoose';

/**
 * Enums do model de pagamento
 */
export enum PaymentStatusEnum {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
  REFUNDED = 'REFUNDED',
  CANCELED = 'CANCELED',
  EXPIRED = 'EXPIRED'
}

export enum PaymentMethodEnum {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PIX = 'pix',
  BANK_SLIP = 'bank_slip',
  BANK_TRANSFER = 'bank_transfer'
}

/**
 * Interface alinhada com IPayment do modelo
 */
export interface PaymentEvent {
  _id: Types.ObjectId;
  paymentCode?: string;
  campaignId: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  amount: number;
  paymentMethod: PaymentMethodEnum;
  status: PaymentStatusEnum;
  numbers: number[];
  numbersCount?: number; // Campo calculado (length dos numbers)
  purchaseDate?: Date;
  createdAt: Date;
  updatedAt?: Date;
  processorTransactionId?: string;
}

export interface BatchProcessingResult {
  processedCount: number;
  errors: Error[];
} 