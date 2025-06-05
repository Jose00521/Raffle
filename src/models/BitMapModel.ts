import mongoose from 'mongoose';
import { IBitmap } from './interfaces/IBitmapInterface';

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

// Interface para métodos estáticos
interface BitMapModel extends mongoose.Model<IBitmap> {
  getBitmap(campaignId: string): Promise<IBitmap | null>;
  isNumberAvailable(bitmap: Buffer, number: number): boolean;
  markNumberAsTaken(campaignId: string, number: number): Promise<void>;
  markNumbersAsTaken(campaignId: string, numbers: number[]): Promise<void>;
  initializeBitmap(campaignId: string, totalNumbers: number): Promise<IBitmap>;
  selectRandomNumbers(campaignId: string, quantity: number): Promise<number[]>;
  countAvailableBits(bitmap: Buffer): number;
}

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
 * Marca um número como ocupado (indisponível) no bitmap
 * @param campaignId ID da campanha
 * @param number Número a marcar como ocupado (base 0)
 */
BitMapSchema.statics.markNumberAsTaken = async function(campaignId: string, number: number): Promise<void> {
  const bitmap = await this.findOne({ campaignId });
  if (!bitmap) throw new Error(`Bitmap not found for campaign ${campaignId}`);
  
  const byteIndex = Math.floor(number / 8);
  const bitIndex = number % 8;
  
  // Verificar se o bit já está marcado como indisponível (0)
  if ((bitmap.bitmap[byteIndex] & (1 << bitIndex)) === 0) {
    return; // Já está marcado como indisponível
  }
  
  // Atualizar o bit específico e decrementar o contador
  await this.updateOne(
    { campaignId },
    { 
      $bit: { 
        [`bitmap.${byteIndex}`]: { and: ~(1 << bitIndex) } 
      },
      $inc: { availableCount: -1 },
      $set: { updatedAt: new Date() }
    }
  );
};

/**
 * Marca múltiplos números como ocupados (indisponíveis) no bitmap
 * @param campaignId ID da campanha
 * @param numbers Array de números a marcar como ocupados (base 0)
 */
BitMapSchema.statics.markNumbersAsTaken = async function(campaignId: string, numbers: number[]): Promise<void> {
  // Otimização: usa uma única operação para atualizar múltiplos bits
  const bitmap = await this.findOne({ campaignId });
  if (!bitmap) throw new Error(`Bitmap not found for campaign ${campaignId}`);
  
  // Criar cópia do bitmap para modificação
  const newBitmap = Buffer.from(bitmap.bitmap);
  let takenCount = 0;
  
  // Marcar cada número como indisponível
  for (const number of numbers) {
    const byteIndex = Math.floor(number / 8);
    const bitIndex = number % 8;
    
    // Verificar se o bit já está marcado como indisponível (0)
    if ((newBitmap[byteIndex] & (1 << bitIndex)) !== 0) {
      // Marcar como indisponível
      newBitmap[byteIndex] &= ~(1 << bitIndex);
      takenCount++;
    }
  }
  
  // Atualizar o bitmap e o contador apenas se houver mudanças
  if (takenCount > 0) {
    await this.updateOne(
      { campaignId },
      { 
        $set: { 
          bitmap: newBitmap,
          availableCount: bitmap.availableCount - takenCount,
          updatedAt: new Date()
        }
      }
    );
  }
};

/**
 * Inicializa um novo bitmap para uma campanha
 * @param campaignId ID da campanha
 * @param totalNumbers Total de números na rifa
 * @returns Documento bitmap criado
 */
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
 * Conta o número de bits disponíveis (1) no bitmap
 * @param bitmap Buffer do bitmap
 * @returns Contagem de bits disponíveis
 */
BitMapSchema.statics.countAvailableBits = function(bitmap: Buffer): number {
  let count = 0;
  
  // Usar tabela de lookup para contagem rápida de bits
  const BITS_IN_BYTE = [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4,
                        1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5,
                        1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5,
                        2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6,
                        1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5,
                        2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6,
                        2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6,
                        3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7,
                        1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5,
                        2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6,
                        2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6,
                        3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7,
                        2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6,
                        3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7,
                        3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7,
                        4, 5, 5, 6, 5, 6, 6, 7, 5, 6, 6, 7, 6, 7, 7, 8];
  
  for (let i = 0; i < bitmap.length; i++) {
    count += BITS_IN_BYTE[bitmap[i]];
  }
  
  return count;
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

// Criar e exportar o modelo
export const BitMapModel = mongoose.models.BitMap as BitMapModel || 
                          mongoose.model<IBitmap, BitMapModel>('BitMap', BitMapSchema);

export default BitMapModel; 