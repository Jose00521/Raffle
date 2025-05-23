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
      required: true,
      unique: true,
      index: true
    },
    amount: {
      type: Number,
      required: true
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
    numbers: {
      type: [Number],
      required: true
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    approvedDate: Date,
    refundedDate: Date,
    canceledDate: Date,
    expireDate: Date,
    paymentProcessor: {
      type: String,
      required: true
    },
    processorResponse: {
      code: String,
      message: String,
      referenceId: String
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
    }
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
}

// Adicionar índices e métodos estáticos apenas se estiver no servidor
if (isServer && PaymentSchema) {
  // Adiciona um hook pre-save para gerar automaticamente o código de pagamento
  PaymentSchema.pre('save', function(this: any, next) {
    // Só gera o código se ele ainda não existir
    if (!this.paymentCode) {
      this.paymentCode = generateEntityCode(this._id, 'PG');
    }
    next();
  });

  // Índice composto para consultas rápidas por campanha e status
  PaymentSchema.index({ campaignId: 1, status: 1 });

  // Índice para consultas por usuário e data
  PaymentSchema.index({ userId: 1, purchaseDate: -1 });

  // Índice para expiração automática de pagamentos pendentes
  PaymentSchema.index({ status: 1, expireDate: 1 });

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
  
  // Índice de texto para pesquisa em informações do cliente
  PaymentSchema.index({ 'customerInfo.name': 'text', 'customerInfo.email': 'text', 'customerInfo.document': 'text' });

  // Métodos estáticos do modelo
  PaymentSchema.statics.findUserPayments = function(userId: string) {
    return this.find({ userId })
      .sort({ purchaseDate: -1 })
      .populate('campaignId', 'title campaignCode');
  };

  PaymentSchema.statics.findCampaignPayments = function(campaignId: string) {
    return this.find({ campaignId })
      .sort({ purchaseDate: -1 })
      .populate('userId', 'name email userCode');
  };

  PaymentSchema.statics.findPendingPayments = function() {
    return this.find({
      status: PaymentStatusEnum.PENDING,
      expireDate: { $gt: new Date() }
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
}

// Verificar se o modelo já foi compilado para evitar erros em desenvolvimento
const Payment = isServer 
  ? ((mongoose.models.Payment as unknown as PaymentModel) || 
    mongoose.model<IPayment, PaymentModel>('Payment', PaymentSchema as any))
  : null;

export default Payment; 