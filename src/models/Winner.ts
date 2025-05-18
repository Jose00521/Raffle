import mongoose from 'mongoose';
import { generateEntityCode } from './utils/idGenerator';
const Schema = mongoose.Schema;


export interface IWinner {
    _id?: mongoose.Types.ObjectId;
    winnerCode?: string; // Snowflake ID único
    campaignId: mongoose.Types.ObjectId;
    position: number;
    number: string;
    prizes: mongoose.Types.ObjectId[];
    userId: mongoose.Types.ObjectId;
    prizesClaimed: boolean;
    awardedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const WinnerSchema = new Schema<IWinner>({
    winnerCode: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },
    campaignId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Campaign' 
    },
    position: {
        type: Number,
        required: true,
        min: 1
      },
    prizes: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Prize'
      },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
    number: {
        type: String,
        required: true
      },
    prizesClaimed: {
        type: Boolean,
        default: false
      },
    awardedAt: {
        type: Date,
        default: Date.now
      }
}, { timestamps: true , collection: 'winners'});

// Adiciona um hook pre-save para gerar automaticamente o código do ganhador
WinnerSchema.pre('save', function(this: any, next) {
  // Só gera o código se ele ainda não existir e se estiver no servidor
  if (!this.winnerCode && typeof window === 'undefined') {
    this.winnerCode = generateEntityCode(this._id, 'WN');
  }
  next();
});

// Add these indexes

WinnerSchema.index({ campaignId: 1 }); // For queries filtering by campaign
WinnerSchema.index({ userId: 1 }); // For queries finding user's wins
WinnerSchema.index({ createdAt: -1 }); // For sorting by most recent
WinnerSchema.index({ winnerCode: 1 }, { unique: true, sparse: true }); // For looking up by winnerCode

// Índices adicionais para otimização de consultas
WinnerSchema.index({ position: 1 }); // Para filtrar por posições específicas
WinnerSchema.index({ number: 1 }); // Para consultas por número sorteado
WinnerSchema.index({ userId: 1, prizesClaimed: 1 }); // Para verificar prêmios não reclamados por usuário
WinnerSchema.index({ prizesClaimed: 1, awardedAt: -1 }); // Para relatórios de prêmios não reclamados por data
WinnerSchema.index({ campaignId: 1, position: 1 }); // Para consultar vencedores por posição em uma campanha
WinnerSchema.index({ awardedAt: 1 }); // Para relatórios por período de sorteio

// Compound index for common query pattern
WinnerSchema.index({ campaignId: 1, createdAt: -1 }); // For listing winners by campaign, sorted by date

// Métodos estáticos do modelo
WinnerSchema.statics.findByWinnerCode = function(winnerCode: string) {
  return this.findOne({ winnerCode })
    .populate('userId', 'name userCode')
    .populate('campaignId', 'title campaignCode');
};

// Interface para o modelo com métodos estáticos
interface WinnerModel extends mongoose.Model<IWinner> {
  findByWinnerCode(winnerCode: string): Promise<IWinner | null>;
}

export default (mongoose.models.Winner as WinnerModel) || 
  mongoose.model<IWinner, WinnerModel>('Winner', WinnerSchema); 
