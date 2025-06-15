import mongoose from 'mongoose';
import { generateEntityCode } from './utils/idGenerator';
import { IPayment, PaymentStatusEnum, PaymentMethodEnum } from './interfaces/IPaymentInterfaces';
// Verificar se estamos no servidor
const isServer = typeof window === 'undefined';



// Só criar o schema se estiver no servidor
const PaymentSchema = isServer ? new mongoose.Schema<IPayment>(
  {
    paymentCode: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    processorTransactionId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
      // Garante que strings vazias sejam salvas como nulas/ausentes,
      // permitindo que o índice sparse funcione corretamente.
      set: (v: string | null | undefined) => (v === '' ? undefined : v),
    },
    amount: {
      type: Number,
      required: true,
      default: 0
    },
    numbersQuantity: {
      type: Number,
      required: true,
      default: 0
    },
    taxSeller: {
      type: Number,
      required: true,
      default: 0
    },
    taxPlatform: {
      type: Number,
      required: true,
      default: 0
    },
    amountReceived: {
      type: Number,
      required: true,
      default: 0
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethodEnum),
      required: true
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatusEnum),
      default: PaymentStatusEnum.PENDING,
      required: true,
      index: true
    },
    pixCode: {
      type: String,
      default: ''
    },
    purchaseAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    approvedAt: Date,
    refundedAt: Date,
    canceledAt: Date,
    expiresAt: Date,
    paymentProcessor: {
      type: String,
      required: true,
      default: ''
    },
    processorResponse: {
      code: { type: String, default: '' },
      message: { type: String, default: '' },
      referenceId: { type: String, default: '' }
    },
    customerInfo: {
      name: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      },
      document: {
        type: String,
        required: true
      },
      phone: {
        type: String,
        required: true
      }
    },
    billingInfo: {
      address: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    installments: {
      type: Number,
      default: 1
    },
    installmentAmount: Number,
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    },
    // Use explicit timestamp fields instead of Mongoose's automatic timestamps
    createdAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    // Campo opcional para armazenar quando o registro foi criado no seu sistema
    systemCreatedAt: {
      type: Date,
      default: Date.now
    },
    // Chave de idempotência - padrão da indústria
    idempotencyKey: {
      type: String,
  // Índice para busca rápida
    },
  },
  {
    // Desabilita o timestamps automático do Mongoose
    timestamps: false,
    collection: 'payments'
  }
) : null;

// Interface para o modelo com métodos estáticos
interface PaymentModel extends mongoose.Model<IPayment> {
  findUserPayments(userId: string): Promise<IPayment[]>;
  findCampaignPayments(campaignId: string): Promise<IPayment[]>;
  findPendingPayments(): Promise<IPayment[]>;
  calculatePaymentStatistics(campaignId?: string): Promise<any>;
  findByPaymentCode(paymentCode: string): Promise<IPayment | null>;
  findByProcessorTransactionId(processorTransactionId: string): Promise<IPayment | null>;
  processExpiredPixPayments(): Promise<any>;
}

// Adicionar índices e métodos estáticos apenas se estiver no servidor
if (isServer && PaymentSchema) {
  // Adiciona um hook pre-save para gerar automaticamente o código de pagamento
  PaymentSchema.pre('save', function(this: any, next) {
    // Só gera o código se ele ainda não existir
    if (!this.paymentCode) {
      this.paymentCode = generateEntityCode(this._id, 'PG');
    }

    const TIME_TO_EXPIRE = 10;
    
    // 🕒 Define automaticamente expireDate para PIX (10 minutos)
    if (this.paymentMethod === PaymentMethodEnum.PIX && 
        (this.status === PaymentStatusEnum.PENDING || this.status === PaymentStatusEnum.INITIALIZED) &&
        !this.expiresAt) {
      this.expiresAt = new Date(Date.now() + TIME_TO_EXPIRE * 60 * 1000); // 10 minutos
      console.log(`[PAYMENT_MODEL] Definindo expiração automática para PIX: ${this.expiresAt.toISOString()}`);
    }
    
    next();
  });

  // Índice composto para consultas rápidas por campanha e status
  PaymentSchema.index({ campaignId: 1, status: 1 });

  // Índice para idempotência
  PaymentSchema.index({ idempotencyKey: 1 }, { unique: true});

  // Índice para consultas por usuário e data
  PaymentSchema.index({ userId: 1, purchaseDate: -1 });

  // Índice para expiração automática de pagamentos pendentes
  PaymentSchema.index({ status: 1, expiresAt: 1 });


  // Índice para consultas de transações por processador
  PaymentSchema.index({ paymentProcessor: 1, processorTransactionId: 1 });
  
  // Novos índices para otimização adicional
  
  // Para consultas por período específico (relatórios, dashboards)
  PaymentSchema.index({ purchaseDate: 1 });
  
  // Para filtrar pagamentos por método e status
  PaymentSchema.index({ paymentMethod: 1, status: 1 });
  
  // Para consultas de números comprados em uma campanha
  PaymentSchema.index({ campaignId: 1, 'numbers': 1 });
  
  // Para relatórios financeiros de período
  PaymentSchema.index({ status: 1, purchaseDate: 1 });
  
  // Para consultas combinadas usuário/campanha (histórico específico)
  PaymentSchema.index({ userId: 1, campaignId: 1, purchaseDate: -1 });
  

  // Métodos estáticos do modelo
  PaymentSchema.statics.findUserPayments = function(userId: string) {
    return this.find({ userId })
      .sort({ purchaseAt: -1 })
      .populate('campaignId', 'title campaignCode');
  };

  PaymentSchema.statics.findCampaignPayments = function(campaignId: string) {
    return this.find({ campaignId })
      .sort({ purchaseAt: -1 })
      .populate('userId', 'name email userCode');
  };

  PaymentSchema.statics.findPendingPayments = function() {
    return this.find({
      status: PaymentStatusEnum.PENDING,
      expiresAt: { $gt: new Date() }
    });
  };

  PaymentSchema.statics.calculatePaymentStatistics = async function(campaignId?: string) {
    let match = {};
    if (campaignId) {
      match = { campaignId: new mongoose.Types.ObjectId(campaignId) };
    }

    return this.aggregate([
      { $match: match },
      { $group: { 
        _id: '$status', 
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }},
      { $project: { 
        _id: 0, 
        status: '$_id', 
        count: 1,
        totalAmount: 1
      }}
    ]);
  };
  
  // Novo método para buscar por código de pagamento
  PaymentSchema.statics.findByPaymentCode = function(paymentCode: string) {
    return this.findOne({ paymentCode })
      .populate('campaignId', 'title campaignCode')
      .populate('userId', 'name email userCode');
  };
  
  // Novo método para buscar por ID de transação do processador
  PaymentSchema.statics.findByProcessorTransactionId = function(processorTransactionId: string) {
    return this.findOne({ processorTransactionId })
      .populate('campaignId', 'title campaignCode')
      .populate('userId', 'name email userCode');
  };
  
  // 🕒 Método para processar PIX expirados (muda status, não remove)
  PaymentSchema.statics.processExpiredPixPayments = async function() {
    const now = new Date();
    
    console.log('[PAYMENT_MODEL] Processando PIX expirados...');
    
    const result = await this.updateMany(
      {
        paymentMethod: PaymentMethodEnum.PIX,
        status: { $in: [PaymentStatusEnum.PENDING, PaymentStatusEnum.INITIALIZED] },
        expiresAt: { $lte: now }
      },
      {
        $set: {
          status: PaymentStatusEnum.EXPIRED,
          updatedAt: now
        }
      }
    );
    
    console.log(`[PAYMENT_MODEL] ✅ ${result.modifiedCount} PIX marcados como expirados`);
    return result;
  };
}

// Verificar se o modelo já foi compilado para evitar erros em desenvolvimento
const Payment = isServer 
  ? ((mongoose.models.Payment as unknown as PaymentModel) || 
    mongoose.model<IPayment, PaymentModel>('Payment', PaymentSchema as any))
  : null;

export default Payment; 