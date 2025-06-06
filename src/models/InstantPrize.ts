import mongoose from 'mongoose';
import { IInstantPrize } from './interfaces/IInstantPrizeInterfaces';
// Enum para categorias


// 🎯 SCHEMA BASE com discriminator
const BaseInstantPrizeSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
      index: true
    },
    categoryId: {
      type: String,
      required: true,
      index: true
    },
    number: {
      type: String,
      required: true,
      index: true
    },
    // 🔑 CAMPO DISCRIMINATOR
    type: {
      type: String,
      enum: ['money', 'item'],
      required: true
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    claimed: {
      type: Boolean,
      default: false,
      index: true
    },
    claimedAt: {
      type: Date,
      index: true
    }
  }, 
  { 
    timestamps: true,
    collection: 'instant_prizes',
    discriminatorKey: 'type' // 🔑 Chave do discriminator
  }
);

// Índices compostos para consultas comuns
BaseInstantPrizeSchema.index({ campaignId: 1, number: 1 }, { unique: true });
BaseInstantPrizeSchema.index({ campaignId: 1, categoryId: 1 });
BaseInstantPrizeSchema.index({ campaignId: 1, claimed: 1 });
BaseInstantPrizeSchema.index({ campaignId: 1, type: 1, categoryId: 1 });
BaseInstantPrizeSchema.index({ winner: 1, claimed: 1 });
BaseInstantPrizeSchema.index({ campaignId: 1, value: -1 });

// 🎯 MODELO BASE
const InstantPrize = mongoose.models.InstantPrize || 
  mongoose.model<IInstantPrize>('InstantPrize', BaseInstantPrizeSchema);

// 💰 SCHEMA ESPECÍFICO PARA PRÊMIOS EM DINHEIRO
const MoneyPrizeSchema = new mongoose.Schema({
  value: {
    type: Number,
    required: true,
    min: 0
  },
  // Campos específicos para prêmios em dinheiro (se houver no futuro)
  // Por enquanto, só os campos base são suficientes
}, {
  _id: false // Não criar _id separado
});

// 🎁 SCHEMA ESPECÍFICO PARA PRÊMIOS FÍSICOS
const ItemPrizeSchema = new mongoose.Schema({
  category: {
    type: String,
    default: null
  },
  // Referência para o prêmio completo no banco de prêmios
  prizeRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prize',
    default: null
  }
}, {
  _id: false // Não criar _id separado
});

// 🎯 DISCRIMINATORS - Safe registration to prevent hot reload issues
let MoneyPrize: mongoose.Model<any>;
let ItemPrize: mongoose.Model<any>;

try {
  // Try to get existing discriminators first
  MoneyPrize = mongoose.models.MoneyPrize || InstantPrize.discriminator('money', MoneyPrizeSchema);
  ItemPrize = mongoose.models.ItemPrize || InstantPrize.discriminator('item', ItemPrizeSchema);
} catch (error) {
  // If discriminators already exist, get them from models
  MoneyPrize = mongoose.models.MoneyPrize;
  ItemPrize = mongoose.models.ItemPrize;
}

// 🔍 INTERFACES TYPESCRIPT ESPECÍFICAS
interface IMoneyPrize extends IInstantPrize {
  type: 'money';
  value: number;
}

interface IItemPrize extends IInstantPrize {
  type: 'item';
  prizeRef?: mongoose.Types.ObjectId;
}

// 🚀 MÉTODOS ESTÁTICOS OTIMIZADOS
BaseInstantPrizeSchema.statics.createMoneyPrizes = async function(
  campaignId: string,
  categoryId: string,
  numbers: string[],
  value: number
) {
  const moneyPrizes = numbers.map(number => ({
    campaignId,
    categoryId,
    number,
    value,
    type: 'money'
  }));
  
  return await MoneyPrize.insertMany(moneyPrizes);
};

BaseInstantPrizeSchema.statics.createItemPrize = async function(
  campaignId: string,
  categoryId: string,
  number: string,
  value: number,
  prizeId: string,
  name: string,
  image?: string,
  prizeRef?: string
) {
  return await ItemPrize.create({
    campaignId,
    categoryId,
    number,
    value,
    type: 'item',
    prizeId,
    name,
    image,
    prizeRef
  });
};

BaseInstantPrizeSchema.statics.findMoneyPrizesByCategory = function(
  campaignId: string,
  categoryId: string
) {
  return MoneyPrize.find({ campaignId, categoryId }).lean();
};

BaseInstantPrizeSchema.statics.findItemPrizesByCategory = function(
  campaignId: string,
  categoryId: string
) {
  return ItemPrize.find({ campaignId, categoryId })
    .populate('prizeRef', 'name image value prizeCode')
    .lean();
};

// Exportar todos os modelos
export default InstantPrize;
export { MoneyPrize, ItemPrize };
export type { IMoneyPrize, IItemPrize }; 