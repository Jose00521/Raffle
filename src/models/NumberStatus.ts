import mongoose from 'mongoose';
import { INumberStatus, NumberStatusEnum } from './interfaces/INumberStatusInterfaces';

// Verificar se estamos no servidor
const isServer = typeof window === 'undefined';


// Só criar o schema se estiver no servidor
const NumberStatusSchema = isServer ? new mongoose.Schema<INumberStatus>(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
      index: true
    },
    number: {
      type: Number,
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: Object.values(NumberStatusEnum),
      default: NumberStatusEnum.AVAILABLE,
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    reservedAt: Date,
    paidAt: Date,
    expiresAt: Date,
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  },
  {
    timestamps: true,
    collection:'numbers'
  }
) : null;

// Interface para o modelo com métodos estáticos
interface NumberStatusModel extends mongoose.Model<INumberStatus> {
  initializeForRifa(rifaId: string, totalNumbers: number, excludeNumbers: string[], session: mongoose.ClientSession | null): Promise<INumberStatus[]>;
  confirmPayment(rifaId: string, numbers: number[], userId: string): Promise<any>;
  countByStatus(rifaId: string): Promise<Array<{ status: string, count: number }>>;
}

// Adicionar os índices e métodos estáticos apenas se estiver no servidor
if (isServer && NumberStatusSchema) {
  // Índice composto para consultas rápidas por rifa e status
  NumberStatusSchema.index({ campaignId: 1, status: 1 });

  // Índice composto para consultas por número específico em uma rifa
  NumberStatusSchema.index({ campaignId: 1, number: 1 }, { unique: true });

  // TTL index para expirar reservas automaticamente
  NumberStatusSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  
  // Índices adicionais para otimização
  
  // Para busca rápida de números por usuário (histórico de compras)
  NumberStatusSchema.index({ userId: 1, campaignId: 1 });
  
  // Para busca de números reservados que expirarão em breve (monitoramento)
  NumberStatusSchema.index({ status: 1, expiresAt: 1 });
  
  // Para verificação rápida da disponibilidade de intervalos de números
  NumberStatusSchema.index({ campaignId: 1, status: 1, number: 1 });
  
  // Para ordenar números por data de reserva/pagamento
  NumberStatusSchema.index({ campaignId: 1, status: 1, reservedAt: -1 });
  NumberStatusSchema.index({ campaignId: 1, status: 1, paidAt: -1 });
  
  // Para estatísticas de números por usuário
  NumberStatusSchema.index({ userId: 1, status: 1 });

  /**
   * Método estático para inicializar todos os números para uma nova rifa
   */
  NumberStatusSchema.statics.initializeForRifa = async function(
    rifaId: string, 
    totalNumbers: number, 
    excludeNumbers: string[] = [], 
    session: mongoose.ClientSession | null = null
  ) {
    const BATCH_SIZE = 10000;
    const excludeSet = new Set(excludeNumbers);
    const options = session ? { session, ordered: false } : { ordered: false };
    
    for (let start = 0; start < totalNumbers; start += BATCH_SIZE) {
      const end = Math.min(start + BATCH_SIZE, totalNumbers);
      const numbersToInsert = [];
      
      for (let i = start; i < end; i++) {
        const formattedNumber = i.toString().padStart(totalNumbers.toString().length, '0');
        if (!excludeSet.has(formattedNumber)) {
          numbersToInsert.push({
            rifaId,
            number: formattedNumber,
            status: 'available',
            reservedAt: null,
            paidAt: null,
            userId: null
          });
        }
      }
      
      if (numbersToInsert.length > 0) {
        await this.insertMany(numbersToInsert, options);
      }
    }
  };

  /**
   * Método estático para confirmar pagamento de números
   */
  NumberStatusSchema.statics.confirmPayment = async function(
    rifaId: string,
    numbers: number[],
    userId: string
  ) {
    return this.updateMany(
      { 
        rifaId, 
        number: { $in: numbers },
        userId,
        status: NumberStatusEnum.RESERVED
      },
      {
        $set: {
          status: NumberStatusEnum.PAID,
          paidAt: new Date(),
          expiresAt: null // Remove a expiração
        }
      }
    );
  };

  /**
   * Método para contar números por status
   */
  NumberStatusSchema.statics.countByStatus = async function(rifaId: string) {
    return this.aggregate([
      { $match: { rifaId: new mongoose.Types.ObjectId(rifaId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { _id: 0, status: '$_id', count: 1 } }
    ]);
  };
}

// Verificar se o modelo já foi compilado para evitar erros em desenvolvimento
const NumberStatus = isServer 
  ? ((mongoose.models.NumberStatus as unknown as NumberStatusModel) || 
    mongoose.model<INumberStatus, NumberStatusModel>('NumberStatus', NumberStatusSchema as any))
  : null;

export default NumberStatus; 