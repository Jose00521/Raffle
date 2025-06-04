import mongoose from 'mongoose';
import { NumberStatusEnum } from './interfaces/INumberStatusInterfaces';

// Interface para o modelo de range de números
export interface INumberRange {
  campaignId: mongoose.Types.ObjectId | string;
  startNumber: number;
  endNumber: number;
  status: string;
  excludedNumbers?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Verificar se estamos no servidor
const isServer = typeof window === 'undefined';

// Só criar o schema se estiver no servidor
const NumberRangeSchema = isServer ? new mongoose.Schema<INumberRange>(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
      index: true
    },
    startNumber: {
      type: Number,
      required: true,
      index: true
    },
    endNumber: {
      type: Number,
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: [NumberStatusEnum.AVAILABLE],
      default: NumberStatusEnum.AVAILABLE,
      required: true
    },
  },
  {
    timestamps: true,
    collection: 'number_ranges'
  }
) : null;

// Criar índice composto para buscas de faixas
if (isServer && NumberRangeSchema) {
  NumberRangeSchema.index({ 
    campaignId: 1, 
    startNumber: 1, 
    endNumber: 1 
  });
}

// Interface para o modelo com métodos estáticos
interface NumberRangeModel extends mongoose.Model<INumberRange> {
  initializeForRifa(rifaId: string, totalNumbers: number, excludeNumbers?: string[]): Promise<INumberRange>;
  isNumberInRange(rifaId: string, number: number): Promise<boolean>;
}

if (isServer && NumberRangeSchema) {
  /**
   * Método estático para inicializar uma faixa de números para uma nova rifa
   */
  NumberRangeSchema.statics.initializeForRifa = async function(
    rifaId: string, 
    totalNumbers: number,
    excludeNumbers: string[] = []
  ): Promise<INumberRange> {
    console.log(`Inicializando range para rifa ${rifaId} com ${totalNumbers} números`);
    
    // Se houver muitas exclusões, não usar o array excludedNumbers
    const useExcludedArray = excludeNumbers.length <= 10000;
    
    const rangeData: Partial<INumberRange> = {
      campaignId: rifaId,
      startNumber: 0,
      endNumber: totalNumbers - 1,
      status: NumberStatusEnum.AVAILABLE
    };
    
    if (useExcludedArray && excludeNumbers.length > 0) {
      rangeData.excludedNumbers = excludeNumbers;
    }
    
    return await this.create(rangeData);
  };
  
  /**
   * Método para verificar se um número está em algum range disponível
   */
  NumberRangeSchema.statics.isNumberInRange = async function(
    rifaId: string,
    number: number
  ): Promise<boolean> {
    // Buscar um range que contenha este número
    const range = await this.findOne({
      campaignId: rifaId,
      startNumber: { $lte: number },
      endNumber: { $gte: number },
      status: NumberStatusEnum.AVAILABLE
    });
    
    // Se não encontrou range, o número não está disponível
    if (!range) {
      return false;
    }
    
    // Verificar se o número está na lista de exclusões
    if (range.excludedNumbers && range.excludedNumbers.length > 0) {
      // Formatar o número para garantir consistência
      const formattedNumber = number.toString().padStart(
        range.endNumber.toString().length, '0'
      );
      
      if (range.excludedNumbers.includes(formattedNumber)) {
        return false;
      }
    }
    
    // Se passou pelas verificações, está em um range disponível
    return true;
  };
}

// Verificar se o modelo já foi compilado para evitar erros em desenvolvimento
const NumberRange = isServer 
  ? ((mongoose.models.NumberRange as unknown as NumberRangeModel) || 
    mongoose.model<INumberRange, NumberRangeModel>('NumberRange', NumberRangeSchema as any))
  : null;

export default NumberRange; 