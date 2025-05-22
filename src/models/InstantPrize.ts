import mongoose from 'mongoose';
import { IInstantPrize } from './interfaces/IInstantPrizeInterfaces';
// Enum para categorias


// Schema de InstantPrize
const InstantPrizeSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
      index: true
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InstantPrizeCategory',
    },
    number: {
      type: String,
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    claimed: {
      type: Boolean,
      default: false,
      index: true
    },
    claimedAt: {
      type: Date
    }
  }, 
  { 
    timestamps: true,
    collection: 'instant_prizes' 
  }
);

// Índices compostos para consultas comuns
InstantPrizeSchema.index({ campaignId: 1, number: 1 }, { unique: true });
InstantPrizeSchema.index({ campaignId: 1, categoryId: 1 });
InstantPrizeSchema.index({ campaignId: 1, claimed: 1 });
InstantPrizeSchema.index({ campaignId: 1, categoryId: 1, createdAt: -1 });

// Índices adicionais para otimizar consultas frequentes
InstantPrizeSchema.index({ winner: 1 }, { sparse: true }); // Para consultas por ganhador (sparse para ignorar valores null)
InstantPrizeSchema.index({ claimed: 1, claimedAt: -1 }); // Para relatórios de prêmios reclamados por data
InstantPrizeSchema.index({ categoryId: 1, value: -1 }); // Para ordenação por valor dentro de categoria
InstantPrizeSchema.index({ campaignId: 1, value: -1 }); // Para listagem de prêmios mais valiosos por campanha
InstantPrizeSchema.index({ winner: 1, claimed: 1 }); // Para verificar status de prêmios por usuário

export default mongoose.models.InstantPrize || mongoose.model<IInstantPrize>('InstantPrize', InstantPrizeSchema); 