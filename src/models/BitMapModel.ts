import mongoose from 'mongoose';
import { IBitmap, IBitmapShard, IBitmapMeta } from './interfaces/IBitmapInterface';

/**
 * Schema Mongoose para armazenar e manipular bitmaps de disponibilidade de números
 * Cada bit no buffer representa um número (1=disponível, 0=indisponível)
 */
const BitMapSchema = new mongoose.Schema<IBitmap>(
  {
    campaignId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Campaign', 
      required: true, 
    },
    totalNumbers: { 
      type: Number, 
      required: true 
    },
    bitmap: { 
      type: Buffer, 
      required: true 
    },
    availableCount: { 
      type: Number, 
      required: true 
    }
  },
  { 
    timestamps: true,
    collection: 'bitmaps'
  }
);

// Índice único para garantir um bitmap por campanha
BitMapSchema.index({ campaignId: 1 }, { unique: true });

/**
 * Schema Mongoose para armazenar e manipular shards de bitmap
 * Cada shard representa uma faixa de números dentro do bitmap total
 */
const BitMapShardSchema = new mongoose.Schema<IBitmapShard>(
  {
    campaignId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Campaign', 
      required: true, 
    },
    shardIndex: { 
      type: Number, 
      required: true 
    },
    startNumber: { 
      type: Number, 
      required: true 
    },
    endNumber: { 
      type: Number, 
      required: true 
    },
    bitmap: { 
      type: Buffer, 
      required: true 
    },
    availableCount: { 
      type: Number, 
      required: true 
    }
  },
  { 
    timestamps: true,
    collection: 'bitmap_shards'
  }
);

// Índice composto para garantir um shard único por campanha e índice de shard
BitMapShardSchema.index({ campaignId: 1, shardIndex: 1 }, { unique: true });

/**
 * Schema Mongoose para armazenar metadados sobre o bitmap shardado
 */
const BitMapMetaSchema = new mongoose.Schema<IBitmapMeta>(
  {
    campaignId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Campaign', 
      required: true, 
    },
    totalNumbers: { 
      type: Number, 
      required: true 
    },
    shardSize: { 
      type: Number, 
      required: true 
    },
    shardCount: { 
      type: Number, 
      required: true 
    },
    availableCount: { 
      type: Number, 
      required: true 
    }
  },
  { 
    timestamps: true,
    collection: 'bitmap_metas'
  }
);

// Índice único para garantir um metadado por campanha
BitMapMetaSchema.index({ campaignId: 1 }, { unique: true });

// Interface para métodos estáticos do modelo tradicional
interface BitMapModel extends mongoose.Model<IBitmap> {
  getBitmap(campaignId: string): Promise<IBitmap | null>;
  isNumberAvailable(bitmap: Buffer, number: number): boolean;
  markNumberAsTaken(campaignId: string, number: number): Promise<void>;
  markNumbersAsTaken(campaignId: string, numbers: number[]): Promise<void>;
  initializeBitmap(campaignId: string, totalNumbers: number): Promise<IBitmap>;
  selectRandomNumbers(campaignId: string, quantity: number): Promise<number[]>;
  countAvailableBits(bitmap: Buffer): number;
}

// Interface para métodos estáticos do modelo de shard
interface BitMapShardModel extends mongoose.Model<IBitmapShard> {
  getBitmapShard(campaignId: string, shardIndex: number): Promise<IBitmapShard | null>;
  isNumberAvailable(bitmap: Buffer, relativeNumber: number): boolean;
  markNumberAsTaken(campaignId: string, number: number): Promise<void>;
  markNumbersAsTaken(campaignId: string, numbers: number[]): Promise<void>;
}

// Interface para métodos estáticos do modelo de metadados
interface BitMapMetaModel extends mongoose.Model<IBitmapMeta> {
  getBitmapMeta(campaignId: string): Promise<IBitmapMeta | null>;
  updateAvailableCount(campaignId: string, delta: number): Promise<void>;
}

// ========== MÉTODOS DO BITMAP TRADICIONAL ==========

BitMapSchema.statics.initializeBitmap = async function(campaignId: string, totalNumbers: number): Promise<IBitmap> {
  // Calcular tamanho do buffer em bytes (1 bit por número)
  const bufferSize = Math.ceil(totalNumbers / 8);
  
  // Criar buffer com todos os bits em 1 (disponíveis)
  const buffer = Buffer.alloc(bufferSize, 0xFF);
  
  // Ajustar bits excedentes no último byte
  const remainingBits = totalNumbers % 8;
  if (remainingBits > 0) {
    // Limpar bits que excedem o total de números
    buffer[bufferSize - 1] = (1 << remainingBits) - 1;
  }
  
  // Criar e salvar o documento
  return this.create({
    campaignId,
    totalNumbers,
    bitmap: buffer,
    availableCount: totalNumbers
  });
};

/**
 * Verifica se um número específico está disponível no bitmap
 * @param bitmap Buffer do bitmap
 * @param number Número a verificar (base 0)
 * @returns true se disponível, false se indisponível
 */

BitMapSchema.statics.isNumberAvailable = function(bitmap: Buffer, number: number): boolean {
  const byteIndex = Math.floor(number / 8);
  const bitIndex = number % 8;
  return (bitmap[byteIndex] & (1 << bitIndex)) !== 0;
};

/**
 * Busca o bitmap de uma campanha específica
 * @param campaignId ID da campanha
 * @returns Documento bitmap ou null se não encontrado
 */
BitMapSchema.statics.getBitmap = async function(campaignId: string): Promise<IBitmap | null> {
  return this.findOne({ campaignId });
};

/**
 * Seleciona números aleatórios disponíveis usando o bitmap
 * @param campaignId ID da campanha
 * @param quantity Quantidade de números a selecionar
 * @returns Array de números selecionados (base 1)
 */
BitMapSchema.statics.selectRandomNumbers = async function(campaignId: string, quantity: number): Promise<number[]> {
  const bitmap = await this.findOne({ campaignId });
  if (!bitmap) throw new Error(`Bitmap not found for campaign ${campaignId}`);
  
  // Verificar se há números suficientes disponíveis
  if (bitmap.availableCount < quantity) {
    throw new Error(`Not enough available numbers. Requested: ${quantity}, Available: ${bitmap.availableCount}`);
  }
  
  // Algoritmo de seleção
  // Usar abordagem Fisher-Yates em todos os números disponíveis
  const selected: number[] = [];
  const availablePositions: number[] = [];
  
  // Construir array de posições disponíveis
  for (let i = 0; i < bitmap.totalNumbers; i++) {
    // Usar o método estático explicitamente com o modelo, não com 'this'
    if (BitMapModel.isNumberAvailable(bitmap.bitmap, i)) {
      availablePositions.push(i);
    }
  }
  
  // Aplicar Fisher-Yates shuffle para os primeiros 'quantity' elementos
  for (let i = 0; i < Math.min(quantity, availablePositions.length); i++) {
    const j = i + Math.floor(Math.random() * (availablePositions.length - i));
    // Swap
    [availablePositions[i], availablePositions[j]] = [availablePositions[j], availablePositions[i]];
    // Adicionar à seleção (convertendo para base 1)
    selected.push(availablePositions[i] + 1);
  }
  
  return selected;
};

// ========== MÉTODOS DO BITMAP SHARDADO ==========

/**
 * Verifica se um número específico está disponível no bitmap do shard
 * @param bitmap Buffer do bitmap
 * @param relativeNumber Número relativo dentro do shard a verificar (base 0)
 * @returns true se disponível, false se indisponível
 */
BitMapShardSchema.statics.isNumberAvailable = function(bitmap: Buffer, relativeNumber: number): boolean {
  const byteIndex = Math.floor(relativeNumber / 8);
  const bitIndex = relativeNumber % 8;
  return (bitmap[byteIndex] & (1 << bitIndex)) !== 0;
};

/**
 * Busca um shard específico de bitmap
 * @param campaignId ID da campanha
 * @param shardIndex Índice do shard
 * @returns Documento shard ou null se não encontrado
 */
BitMapShardSchema.statics.getBitmapShard = async function(campaignId: string, shardIndex: number): Promise<IBitmapShard | null> {
  return this.findOne({ campaignId, shardIndex });
};

/**
 * Busca o metadado do bitmap de uma campanha específica
 * @param campaignId ID da campanha
 * @returns Documento de metadados ou null se não encontrado
 */
BitMapMetaSchema.statics.getBitmapMeta = async function(campaignId: string): Promise<IBitmapMeta | null> {
  return this.findOne({ campaignId });
};


// Criar e exportar os modelos
export const BitMapModel = mongoose.models.BitMap as BitMapModel || 
                          mongoose.model<IBitmap, BitMapModel>('BitMap', BitMapSchema);

export const BitMapShardModel = mongoose.models.BitMapShard as BitMapShardModel || 
                               mongoose.model<IBitmapShard, BitMapShardModel>('BitMapShard', BitMapShardSchema);

export const BitMapMetaModel = mongoose.models.BitMapMeta as BitMapMetaModel || 
                              mongoose.model<IBitmapMeta, BitMapMetaModel>('BitMapMeta', BitMapMetaSchema); 