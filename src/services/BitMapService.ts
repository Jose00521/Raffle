import { BitMapModel, BitMapShardModel, BitMapMetaModel } from '../models/BitMapModel';
import mongoose from 'mongoose';

/**
 * Interfaces para tipagem
 */
interface IByteUpdates {
  [byteIndex: number]: number;
}

interface IShardUpdates {
  [shardIndex: number]: IByteUpdates;
}

interface INumbersByShardIndex {
  [shardIndex: number]: Array<{originalIndex: number, offset: number}>;
}

interface IBitOperations {
  [key: string]: { and: number } | { or: number };
}

interface IProjection {
  [key: string]: number;
}

/**
 * Tabela de lookup para contagem rápida de bits
 * Cada índice contém o número de bits 1 no valor binário correspondente (0-255)
 */
const BITS_IN_BYTE = [
  0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4,
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
  4, 5, 5, 6, 5, 6, 6, 7, 5, 6, 6, 7, 6, 7, 7, 8
];

/**
 * Tabela de lookup para posições de bits
 * Cada índice contém um array com as posições dos bits 1 no valor binário correspondente (0-255)
 */
const BITS_POSITIONS: {[key: number]: number[]} = {};

// Pré-calcular as posições dos bits para cada byte possível
for (let byte = 0; byte < 256; byte++) {
  BITS_POSITIONS[byte] = [];
  for (let bit = 0; bit < 8; bit++) {
    if (byte & (1 << bit)) {
      BITS_POSITIONS[byte].push(bit);
    }
  }
}

/**
 * Constantes de configuração para sharding de bitmap
 */
const BITMAP_CONFIG = {
  // Tamanho máximo de bitmap não shardado (em números)
  MAX_SINGLE_BITMAP_SIZE: 10_000_000,
  
  // Tamanho padrão de cada shard (em números)
  DEFAULT_SHARD_SIZE: 10_000_000,
  
  // Limite de tamanho de documento MongoDB (16MB)
  MONGODB_DOC_SIZE_LIMIT: 16 * 1024 * 1024,
  
  // Tamanho máximo seguro para buffer de bitmap (em bytes)
  // Deixamos margem para outros campos do documento
  MAX_SAFE_BUFFER_SIZE: 15 * 1024 * 1024,
  
  // Tamanho de segmento para seleção de números (em números)
  SEGMENT_SIZE: 1000,
  
  // Tamanho máximo de lote para operações em bulk
  MAX_BULK_BATCH_SIZE: 1000
};

/**
 * Serviço para gerenciar operações com bitmap de números de rifa
 * Implementa padrão Façade para simplificar as interações com o BitMapModel
 * Suporta tanto bitmap único quanto bitmap shardado para grandes volumes
 */
export class BitMapService {
  /**
   * Conta o número de bits 1 em um número usando tabela de lookup
   * @param num Número para contar bits
   * @returns Quantidade de bits 1
   */
  private static countBits(num: number): number {
    // Para números de 32 bits, dividimos em 4 bytes e somamos
    return BITS_IN_BYTE[num & 0xff] +
           BITS_IN_BYTE[(num >>> 8) & 0xff] +
           BITS_IN_BYTE[(num >>> 16) & 0xff] +
           BITS_IN_BYTE[(num >>> 24) & 0xff];
  }

  /**
   * Inicializa um bitmap para uma nova campanha
   * @param campaignId ID da campanha
   * @param totalNumbers Total de números na rifa
   * @returns Documento bitmap criado
   */
  static async initialize(campaignId: string, totalNumbers: number) {
    try {
      console.log(`Inicializando bitmap para campanha ${campaignId} com ${totalNumbers} números`);
      
      // Verificar se é necessário usar sharding
      if (totalNumbers <= BITMAP_CONFIG.MAX_SINGLE_BITMAP_SIZE) {
        // Usar bitmap tradicional para rifas menores
        console.log(`Usando bitmap tradicional para ${totalNumbers} números`);
      return await BitMapModel.initializeBitmap(campaignId, totalNumbers);
      } else {
        // Usar bitmap shardado para rifas grandes
        console.log(`Usando bitmap shardado para ${totalNumbers} números`);
        return await this.initializeShardedBitmap(campaignId, totalNumbers);
      }
    } catch (error) {
      console.error('Erro ao inicializar bitmap:', error);
      throw error;
    }
  }

  /**
   * Inicializa um bitmap shardado para uma nova campanha
   * @param campaignId ID da campanha
   * @param totalNumbers Total de números na rifa
   * @returns Metadados do bitmap shardado
   */
  private static async initializeShardedBitmap(campaignId: string, totalNumbers: number) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Calcular o número ideal de shards
      const shardSize = this.calculateOptimalShardSize(totalNumbers);
      const shardCount = Math.ceil(totalNumbers / shardSize);
      
      console.log(`Criando ${shardCount} shards de tamanho ${shardSize}`);
      
      // Criar metadados
      const meta = await BitMapMetaModel.create([{
        campaignId,
        totalNumbers,
        shardSize,
        shardCount,
        availableCount: totalNumbers
      }], { session });
      
      // Criar cada shard
      for (let i = 0; i < shardCount; i++) {
        const startNumber = i * shardSize;
        const endNumber = Math.min((i + 1) * shardSize - 1, totalNumbers - 1);
        const shardNumberCount = endNumber - startNumber + 1;
        
        // Calcular tamanho do buffer em bytes (1 bit por número)
        const bufferSize = Math.ceil(shardNumberCount / 8);
        
        // Criar buffer com todos os bits em 1 (disponíveis)
        const buffer = Buffer.alloc(bufferSize, 0xFF);
        
        // Ajustar bits excedentes no último byte
        const remainingBits = shardNumberCount % 8;
        if (remainingBits > 0) {
          // Limpar bits que excedem o total de números
          buffer[bufferSize - 1] = (1 << remainingBits) - 1;
        }
        
        await BitMapShardModel.create([{
          campaignId,
          shardIndex: i,
          startNumber,
          endNumber,
          bitmap: buffer,
          availableCount: shardNumberCount
        }], { session });
      }
      
      await session.commitTransaction();
      return meta[0];
    } catch (error) {
      await session.abortTransaction();
      console.error('Erro ao inicializar bitmap shardado:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }
  
  /**
   * Calcula o tamanho ideal de cada shard com base no total de números
   * @param totalNumbers Total de números na rifa
   * @returns Tamanho ideal de cada shard
   */
  private static calculateOptimalShardSize(totalNumbers: number): number {
    // Calcular quantos bytes são necessários para representar o bitmap completo
    const totalBitmapBytes = Math.ceil(totalNumbers / 8);
    
    // Se o bitmap total for menor que o limite seguro, podemos usar shards maiores
    if (totalBitmapBytes <= BITMAP_CONFIG.MAX_SAFE_BUFFER_SIZE) {
      return BITMAP_CONFIG.DEFAULT_SHARD_SIZE;
    }
    
    // Caso contrário, calculamos o tamanho ideal de shard para ficar dentro do limite
    // Cada byte representa 8 números, então multiplicamos por 8
    const maxNumbersPerShard = BITMAP_CONFIG.MAX_SAFE_BUFFER_SIZE * 8;
    
    // Arredondar para um número "redondo" para facilitar cálculos
    // Por exemplo, 9.876.543 -> 9.000.000
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxNumbersPerShard)));
    return Math.floor(maxNumbersPerShard / magnitude) * magnitude;
  }
  
  /**
   * Verifica se um número está disponível
   * @param campaignId ID da campanha
   * @param number Número a verificar (base 1)
   * @returns true se disponível, false se indisponível
   */
  static async isNumberAvailable(campaignId: string, number: number) {
    try {
      // Converter para base 0 para operações internas
      const zeroBasedNumber = number - 1;
      
      // Verificar se estamos usando bitmap shardado
      const meta = await BitMapMetaModel.getBitmapMeta(campaignId);
      
      if (meta) {
        // Bitmap shardado
        const shardIndex = Math.floor(zeroBasedNumber / meta.shardSize);
        const relativeNumber = zeroBasedNumber % meta.shardSize;
        
        // Buscar o shard diretamente da collection para garantir dados atualizados
        const shardDoc = await BitMapShardModel.collection.findOne({ 
          campaignId, 
          shardIndex 
        });
        
        if (!shardDoc) return false;
        
        // Extrair o bitmap do documento
        const bitmapData = shardDoc.bitmap;
        
        // Converter o bitmap binário para um Buffer que podemos manipular
        let bitmapBuffer: Buffer = Buffer.from(bitmapData);
        
        const byteIndex = Math.floor(relativeNumber / 8);
        const bitIndex = relativeNumber % 8;
        
        // Verificar se o byte existe antes de acessá-lo
        if (byteIndex >= bitmapBuffer.length) {
          return false;
        }
        
        // Bit 1 = disponível
        return (bitmapBuffer[byteIndex] & (1 << bitIndex)) !== 0;
      } else {
        // Bitmap tradicional - buscar diretamente da collection para garantir dados atualizados
        const bitmapDoc = await BitMapModel.findOne({ campaignId });
        if (!bitmapDoc) return false;
        
        // Extrair o bitmap do documento
        const bitmapData = bitmapDoc.bitmap;
        
        // Converter o bitmap binário para um Buffer que podemos manipular
        let bitmapBuffer: Buffer = Buffer.from(bitmapData);
        
        const byteIndex = Math.floor(zeroBasedNumber / 8);
        const bitIndex = zeroBasedNumber % 8;
        
        // Verificar se o byte existe antes de acessá-lo
        if (byteIndex >= bitmapBuffer.length) {
          return false;
        }
        
        // Bit 1 = disponível
        return (bitmapBuffer[byteIndex] & (1 << bitIndex)) !== 0;
      }
    } catch (error) {
      console.error(`Erro ao verificar disponibilidade do número ${number}:`, error);
      return false;
    }
  }
  
  /**
   * Verifica a disponibilidade de múltiplos números de forma otimizada
   * @param campaignId ID da campanha
   * @param numbers Array de números a verificar (base 1)
   * @returns Array de booleanos indicando disponibilidade de cada número
   */
  static async checkNumbersAvailability(campaignId: string, numbers: number[]): Promise<boolean[]> {
    try {
      if (numbers.length === 0) return [];
      
      // Converter para base 0 para operações internas
      const zeroBasedNumbers = numbers.map(n => n - 1);
      
      // Verificar se estamos usando bitmap shardado
      const meta = await BitMapMetaModel.getBitmapMeta(campaignId);
      
      if (meta) {
        // Bitmap shardado
        return await this.checkNumbersAvailabilitySharded(campaignId, zeroBasedNumbers, meta);
      } else {
        // Bitmap tradicional
        return await this.checkNumbersAvailabilityTraditional(campaignId, zeroBasedNumbers);
      }
    } catch (error) {
      console.error(`Erro ao verificar disponibilidade de números:`, error);
      return new Array(numbers.length).fill(false);
    }
  }
  
  /**
   * Implementação otimizada para verificar disponibilidade de múltiplos números em bitmap tradicional
   */
  private static async checkNumbersAvailabilityTraditional(campaignId: string, zeroBasedNumbers: number[]): Promise<boolean[]> {
    const result = new Array(zeroBasedNumbers.length).fill(false);
    
    // Buscar o bitmap completo diretamente da collection para garantir dados atualizados
    const bitmapDoc = await BitMapModel.findOne({ campaignId });
    if (!bitmapDoc) {
      return result; // Retorna todos como indisponíveis se não encontrar o bitmap
    }
    
    // Extrair o bitmap do documento
    const bitmapData = bitmapDoc.bitmap;
    
    this.showBitmap(bitmapData, 'bitmap que vem em checkNumbersAvailabilityTraditional');
    
    // Converter o bitmap binário para um Buffer que podemos manipular
    let bitmapBuffer: Buffer = Buffer.from(bitmapData);
    
   
    let bitIndexCount = 1;
    bitmapBuffer.forEach((byte, index) => {
      console.log('byte', byte.toString(2));
       byte.toString(2).split('').reverse().forEach((bit, bitIndex) => {
        console.log('bit', bit,bitIndexCount);
        bitIndexCount++;
       });
    });
    
    // Verificar cada número
    for (let i = 0; i < zeroBasedNumbers.length; i++) {
      const number = zeroBasedNumbers[i];
      const byteIndex = Math.floor(number / 8);
      const bitIndex = number % 8;
      
      // Verificar se o byte existe antes de acessá-lo
      if (byteIndex < bitmapBuffer.length) {
        // Bit 1 = disponível
        if (bitmapBuffer[byteIndex] & (1 << bitIndex)) {
          result[i] = true;
        }
      }
    }
    
    return result;
  }
  
  /**
   * Implementação otimizada para verificar disponibilidade de múltiplos números em bitmap shardado
   */
  private static async checkNumbersAvailabilitySharded(campaignId: string, zeroBasedNumbers: number[], meta: any): Promise<boolean[]> {
    const shardSize = meta.shardSize;
    const result = new Array(zeroBasedNumbers.length).fill(false);
    
    // Para grandes volumes, dividimos em lotes para evitar sobrecarga de memória
    const BATCH_SIZE = BITMAP_CONFIG.MAX_BULK_BATCH_SIZE;
    
    for (let i = 0; i < zeroBasedNumbers.length; i += BATCH_SIZE) {
      const batch = zeroBasedNumbers.slice(i, i + BATCH_SIZE);
      const batchIndices = Array.from({ length: batch.length }, (_, idx) => i + idx);
      
      // Agrupar números por shard para minimizar consultas
      const numbersByShardIndex: INumbersByShardIndex = {};
      
      for (let j = 0; j < batch.length; j++) {
        const number = batch[j];
        const shardIndex = Math.floor(number / shardSize);
        
        if (!numbersByShardIndex[shardIndex]) {
          numbersByShardIndex[shardIndex] = [];
        }
        
        numbersByShardIndex[shardIndex].push({
          originalIndex: batchIndices[j],
          offset: number % shardSize
        });
      }
      
      // Processar cada shard em paralelo para este lote
      const shardPromises = Object.entries(numbersByShardIndex).map(
        async ([shardIndex, shardNumbers]) => {
          try {
            // Buscar o shard diretamente da collection para garantir dados atualizados
            const shardDoc = await BitMapShardModel.findOne({ 
              campaignId, 
              shardIndex: parseInt(shardIndex) 
            });
            
            if (!shardDoc || !shardDoc.bitmap) {
              console.error(`Shard não encontrado ou bitmap undefined: campaignId=${campaignId}, shardIndex=${shardIndex}`);
              return;
            }
            
            // Extrair o bitmap do documento
            const bitmapData = shardDoc.bitmap;
            
            // Converter o bitmap binário para um Buffer que podemos manipular
            let bitmapBuffer: Buffer = Buffer.from(bitmapData);

            //this.showBitmap(bitmapData, 'bitmap que vem em checkNumbersAvailabilitySharded');

            // let bitIndexCount = 1;
            // bitmapBuffer.forEach((byte, index) => {
            //   console.log('byte', byte.toString(2));
            //    byte.toString(2).split('').reverse().forEach((bit, bitIndex) => {
            //     console.log('bit', bit,bitIndexCount);
            //     bitIndexCount++;
            //    });
            // });
            
            // Verificar cada número neste shard
            for (const { originalIndex, offset } of shardNumbers) {
              const byteIndex = Math.floor(offset / 8);
              const bitIndex = offset % 8;
              
              // Verificar se o byte existe antes de acessá-lo
              if (byteIndex < bitmapBuffer.length) {
                // Bit 1 = disponível
                if (bitmapBuffer[byteIndex] & (1 << bitIndex)) {
                  result[originalIndex] = true;
                }
              }
            }
          } catch (error) {
            console.error(`Erro ao verificar disponibilidade no shard ${shardIndex}:`, error);
            // Não propagar o erro para não interromper todo o processamento
          }
        }
      );
      
      await Promise.all(shardPromises);
    }
    
    return result;
  }
  
  /**
   * Marca múltiplos números como ocupados (indisponíveis)
   * @param campaignId ID da campanha
   * @param numbers Array de números a marcar como ocupados (base 1)
   * @param session Sessão MongoDB opcional para transações
   */
  static async markNumbersAsTaken(campaignId: string, numbers: number[], session?: mongoose.ClientSession) {
    try {
      if (numbers.length === 0) return;
      
      // Converter para base 0 para operações internas
      const zeroBasedNumbers = numbers.map(n => n - 1);
      
      // Verificar se estamos usando bitmap shardado
      const meta = await BitMapMetaModel.getBitmapMeta(campaignId);
      
      if (meta) {
        // Bitmap shardado - usar versão otimizada
        await this.markNumbersAsTakenShardedOptimized(campaignId, zeroBasedNumbers, meta, session);
      } else {
        // Bitmap tradicional - usar versão otimizada
        await this.markNumbersAsTakenTraditionalOptimized(campaignId, zeroBasedNumbers, session);
      }
    } catch (error) {
      console.error(`Erro ao marcar números ${numbers.join(', ')} como ocupados:`, error);
      throw error;
    }
  }

  private static async markNumbersAsTakenTraditionalOptimized(campaignId: string, zeroBasedNumbers: number[], session?: mongoose.ClientSession): Promise<number> {
    // Buscar o bitmap completo
    const bitmap = await BitMapModel.findOne({ campaignId });
    if (!bitmap) {
      throw new Error(`Bitmap não encontrado para a campanha ${campaignId}`);
    }
  
    // Converter o bitmap binário para um Buffer que podemos manipular
    let bitmapBuffer: Buffer = Buffer.from(bitmap?.bitmap);

    console.log('bitmapBuffer original', bitmapBuffer);
    
    // Criar uma cópia do buffer para modificar
    let updatedBuffer = Buffer.from(bitmapBuffer);
    let numBitsChanged = 0;
  
    // Modificar os bits específicos
    for (const number of zeroBasedNumbers) {
      const byteIndex = Math.floor(number / 8);
      const bitIndex = number % 8;
  
      // Verificar se o bit já está marcado como indisponível
      const currentByte = updatedBuffer[byteIndex];
      const bitMask = 1 << bitIndex;
      const isAvailable = (currentByte & bitMask) !== 0;
  
      if (isAvailable) {
        // Marcar o bit como indisponível (0)
        updatedBuffer[byteIndex] = updatedBuffer[byteIndex] & ~bitMask;
        numBitsChanged++;
      }
    }
 
    this.showBitmap(updatedBuffer, 'bitmap marcado como indisponível em markNumbersAsTakenTraditionalOptimized');

    console.log(`Marcando ${numBitsChanged} bits como indisponíveis`);
    
    if (numBitsChanged > 0) {
      try {
        // Forçar a atualização direta no MongoDB
        const result = await BitMapModel.collection.updateOne(
          { _id: bitmap._id },
          { 
            $set: { 
              bitmap: updatedBuffer,
              updatedAt: new Date()
            }, 
            $inc: { availableCount: -numBitsChanged } 
          }
        );
        
        console.log('Resultado da atualização MongoDB:', result);
        
        // Verificar se a atualização foi bem-sucedida
        if (result.modifiedCount === 0) {
          console.error('Falha ao atualizar bitmap no MongoDB');
        } else {
          console.log('bitmap atualizado com sucesso');
        }
      } catch (error) {
        console.error('Erro ao atualizar bitmap no MongoDB:', error);
        throw error;
      }
    } else {
      console.log(`Nenhum bit alterado para campanha ${campaignId}`);
    }
  
    return numBitsChanged;
  }
  
  /**
   * Implementação otimizada para marcar múltiplos números como ocupados em bitmap shardado
   */
  private static async markNumbersAsTakenShardedOptimized(
    campaignId: string, 
    zeroBasedNumbers: number[], 
    meta: any,
    session?: mongoose.ClientSession
  ) {
    const shardSize = meta.shardSize;
    
    // Agrupar números por shard
    const numbersByShardIndex: Record<number, number[]> = {};
    
    for (const number of zeroBasedNumbers) {
      const shardIndex = Math.floor(number / shardSize);
      const offset = number % shardSize;
      
      if (!numbersByShardIndex[shardIndex]) {
        numbersByShardIndex[shardIndex] = [];
      }
      
      numbersByShardIndex[shardIndex].push(offset);
    }
    
    let totalBitsChanged = 0;
    
    // Processar cada shard
    for (const [shardIndexStr, offsets] of Object.entries(numbersByShardIndex)) {
      const shardIndex = parseInt(shardIndexStr);
      
      // Buscar o shard diretamente da collection para garantir dados atualizados
      const shardDoc = await BitMapShardModel.findOne({ 
        campaignId, 
        shardIndex
      });
      
      if (!shardDoc) {
        console.error(`Shard não encontrado: campaignId=${campaignId}, shardIndex=${shardIndex}`);
        continue;
      }
      
      // Extrair o bitmap do documento
      const bitmapData = shardDoc.bitmap;
      
      // Converter o bitmap binário para um Buffer que podemos manipular
      let bitmapBuffer: Buffer = Buffer.from(bitmapData);
      
      // Criar uma cópia do buffer para modificar
      let updatedBuffer = Buffer.from(bitmapBuffer);
      let numBitsChanged = 0;
      
      // Modificar os bits específicos
      for (const offset of offsets) {
        const byteIndex = Math.floor(offset / 8);
        const bitIndex = offset % 8;
        
        // Verificar se o bit já está marcado como indisponível
        const currentByte = updatedBuffer[byteIndex];
        const bitMask = 1 << bitIndex;
        const isAvailable = (currentByte & bitMask) !== 0;
        
        if (isAvailable) {
          // Marcar o bit como indisponível (0)
          updatedBuffer[byteIndex] = updatedBuffer[byteIndex] & ~bitMask;
          numBitsChanged++;
        }
      }

      //this.showBitmap(updatedBuffer, 'bitmap marcado como indisponível em markNumbersAsTakenShardedOptimized');
      
      if (numBitsChanged > 0) {
        try {
          // Forçar a atualização direta no MongoDB
          const result = await BitMapShardModel.collection.updateOne(
            { _id: shardDoc._id },
            { 
              $set: { 
                bitmap: updatedBuffer,
                updatedAt: new Date()
              }, 
              $inc: { availableCount: -numBitsChanged } 
            }
          );
          
          console.log(`Resultado da atualização do shard ${shardIndex}:`, result);
          
          // Verificar se a atualização foi bem-sucedida
          if (result.modifiedCount === 0) {
            console.error(`Falha ao atualizar bitmap do shard ${shardIndex} no MongoDB`);
          } else {
            console.log(`Bitmap do shard ${shardIndex} atualizado com sucesso`);
            totalBitsChanged += numBitsChanged;
          }
        } catch (error) {
          console.error(`Erro ao atualizar bitmap do shard ${shardIndex} no MongoDB:`, error);
          // Não lançar o erro para continuar com outros shards
        }
      }
    }
    
    // Atualizar metadados se houve alterações
    if (totalBitsChanged > 0) {
      try {
        const result = await BitMapMetaModel.collection.updateOne(
          { campaignId },
          { 
            $inc: { availableCount: -totalBitsChanged },
            $set: { updatedAt: new Date() }
          }
        );
        
        console.log('Resultado da atualização dos metadados:', result);
        
        if (result.modifiedCount === 0) {
          console.error('Falha ao atualizar metadados do bitmap no MongoDB');
        } else {
          console.log('Metadados do bitmap atualizados com sucesso');
        }
      } catch (error) {
        console.error('Erro ao atualizar metadados do bitmap no MongoDB:', error);
        throw error;
      }
    }
  }
  
  /**
   * Marca múltiplos números como disponíveis
   * @param campaignId ID da campanha
   * @param numbers Array de números a marcar como disponíveis (base 1)
   * @param session Sessão MongoDB opcional para transações
   */
  static async markNumbersAsAvailable(campaignId: string, numbers: number[], session?: mongoose.ClientSession) {
    try {
      if (numbers.length === 0) return;
      
      // Converter para base 0 para operações internas
      const zeroBasedNumbers = numbers.map(n => n - 1);
      
      // Verificar se estamos usando bitmap shardado
      const meta = await BitMapMetaModel.getBitmapMeta(campaignId);
      
      if (meta) {
        // Bitmap shardado - usar versão otimizada
        await this.markNumbersAsAvailableShardedOptimized(campaignId, zeroBasedNumbers, meta, session);
      } else {
        // Bitmap tradicional - usar versão otimizada
        await this.markNumbersAsAvailableTraditionalOptimized(campaignId, zeroBasedNumbers, session);
      }
    } catch (error) {
      console.error(`Erro ao marcar números ${numbers.join(', ')} como disponíveis:`, error);
      throw error;
    }
  }
  
  /**
   * Implementação otimizada para marcar múltiplos números como disponíveis em bitmap tradicional
   */
  private static async markNumbersAsAvailableTraditionalOptimized(
    campaignId: string, 
    zeroBasedNumbers: number[],
    session?: mongoose.ClientSession
  ) {
    // Buscar o bitmap completo diretamente da collection para garantir dados atualizados
    const bitmapDoc = await BitMapModel.findOne({ campaignId });
    if (!bitmapDoc) {
      throw new Error(`Bitmap não encontrado para a campanha ${campaignId}`);
    }
    
    // Extrair o bitmap do documento
    const bitmapData = bitmapDoc.bitmap;
    
    // Converter o bitmap binário para um Buffer que podemos manipular
    let bitmapBuffer: Buffer = Buffer.from(bitmapData);
    
    // Criar uma cópia do buffer para modificar
    let updatedBuffer = Buffer.from(bitmapBuffer);
    let numBitsChanged = 0;
  
    // Modificar os bits específicos
    for (const number of zeroBasedNumbers) {
      const byteIndex = Math.floor(number / 8);
      const bitIndex = number % 8;
  
      // Verificar se o bit já está marcado como disponível
      const currentByte = updatedBuffer[byteIndex];
      const bitMask = 1 << bitIndex;
      const isAvailable = (currentByte & bitMask) !== 0;
  
      if (!isAvailable) {
        // Marcar o bit como disponível (1)
        updatedBuffer[byteIndex] = updatedBuffer[byteIndex] | bitMask;
        numBitsChanged++;
      }
    }

    this.showBitmap(updatedBuffer, 'bitmap marcado como disponível em markNumbersAsAvailableTraditionalOptimized');
    console.log(`Marcando ${numBitsChanged} bits como disponíveis`);
    
    if (numBitsChanged > 0) {
      try {
        // Forçar a atualização direta no MongoDB
        const result = await BitMapModel.updateOne(
          { _id: bitmapDoc._id },
          { 
            $set: { 
              bitmap: updatedBuffer,
              updatedAt: new Date()
            }, 
            $inc: { availableCount: numBitsChanged } 
          }
        );
        
        console.log('Resultado da atualização MongoDB:', result);
        
        // Verificar se a atualização foi bem-sucedida
        if (result.modifiedCount === 0) {
          console.error('Falha ao atualizar bitmap no MongoDB');
        } else {
          console.log('bitmap atualizado com sucesso');
        }
      } catch (error) {
        console.error('Erro ao atualizar bitmap no MongoDB:', error);
        throw error;
      }
    } else {
      console.log(`Nenhum bit alterado para campanha ${campaignId}`);
    }
  }
  
  /**
   * Implementação otimizada para marcar múltiplos números como disponíveis em bitmap shardado
   */
  private static async markNumbersAsAvailableShardedOptimized(
    campaignId: string, 
    zeroBasedNumbers: number[], 
    meta: any,
    session?: mongoose.ClientSession
  ) {
    const shardSize = meta.shardSize;
    
    // Agrupar números por shard
    const numbersByShardIndex: Record<number, number[]> = {};
    
    for (const number of zeroBasedNumbers) {
      const shardIndex = Math.floor(number / shardSize);
      const offset = number % shardSize;
      
      if (!numbersByShardIndex[shardIndex]) {
        numbersByShardIndex[shardIndex] = [];
      }
      
      numbersByShardIndex[shardIndex].push(offset);
    }
    
    let totalBitsChanged = 0;
    
    // Processar cada shard
    for (const [shardIndexStr, offsets] of Object.entries(numbersByShardIndex)) {
      const shardIndex = parseInt(shardIndexStr);
      
      // Buscar o shard diretamente da collection para garantir dados atualizados
      const shardDoc = await BitMapShardModel.findOne({ 
        campaignId, 
        shardIndex
      });
      
      if (!shardDoc) {
        console.error(`Shard não encontrado: campaignId=${campaignId}, shardIndex=${shardIndex}`);
        continue;
      }
      
      // Extrair o bitmap do documento
      const bitmapData = shardDoc.bitmap;
      
      // Converter o bitmap binário para um Buffer que podemos manipular
      let bitmapBuffer: Buffer = Buffer.from(bitmapData);
      
      // Criar uma cópia do buffer para modificar
      let updatedBuffer = Buffer.from(bitmapBuffer);
      let numBitsChanged = 0;
      
      // Modificar os bits específicos
      for (const offset of offsets) {
        const byteIndex = Math.floor(offset / 8);
        const bitIndex = offset % 8;
        
        // Verificar se o bit já está marcado como disponível
        const currentByte = updatedBuffer[byteIndex];
        const bitMask = 1 << bitIndex;
        const isAvailable = (currentByte & bitMask) !== 0;
        
        if (!isAvailable) {
          // Marcar o bit como disponível (1)
          updatedBuffer[byteIndex] = updatedBuffer[byteIndex] | bitMask;
          numBitsChanged++;
        }
      }
      
      if (numBitsChanged > 0) {
        try {
          // Forçar a atualização direta no MongoDB
          const result = await BitMapShardModel.collection.updateOne(
            { _id: shardDoc._id },
            { 
              $set: { 
                bitmap: updatedBuffer,
                updatedAt: new Date()
              }, 
              $inc: { availableCount: numBitsChanged } 
            }
          );
          
          console.log(`Resultado da atualização do shard ${shardIndex}:`, result);
          
          // Verificar se a atualização foi bem-sucedida
          if (result.modifiedCount === 0) {
            console.error(`Falha ao atualizar bitmap do shard ${shardIndex} no MongoDB`);
          } else {
            console.log(`Bitmap do shard ${shardIndex} atualizado com sucesso`);
            totalBitsChanged += numBitsChanged;
          }
        } catch (error) {
          console.error(`Erro ao atualizar bitmap do shard ${shardIndex} no MongoDB:`, error);
          // Não lançar o erro para continuar com outros shards
        }
      }
    }
    
    // Atualizar metadados se houve alterações
    console.log('totalBitsChanged', totalBitsChanged);
    if (totalBitsChanged > 0) {
      try {
        const result = await BitMapMetaModel.updateOne(
          { campaignId },
          { 
            $inc: { availableCount: totalBitsChanged },
            $set: { updatedAt: new Date() }
          }
        );
        
        console.log('Resultado da atualização dos metadados:', result);
        
        if (result.modifiedCount === 0) {
          console.error('Falha ao atualizar metadados do bitmap no MongoDB');
        } else {
          console.log('Metadados do bitmap atualizados com sucesso');
        }
      } catch (error) {
        console.error('Erro ao atualizar metadados do bitmap no MongoDB:', error);
        throw error;
      }
    }
  }

  /**
   * Seleciona números aleatórios disponíveis
   * @param campaignId ID da campanha
   * @param quantity Quantidade de números a selecionar
   * @returns Array de números selecionados (base 1)
   */
  static async selectRandomNumbers(campaignId: string, quantity: number) {
    try {
      // Verificar se estamos usando bitmap shardado
      const meta = await BitMapMetaModel.getBitmapMeta(campaignId);
      
      if (meta) {
        // Bitmap shardado
        return await this.selectRandomNumbersSharded(campaignId, quantity, meta);
      } else {
        // Bitmap tradicional
      return await BitMapModel.selectRandomNumbers(campaignId, quantity);
      }
    } catch (error) {
      console.error(`Erro ao selecionar ${quantity} números aleatórios:`, error);
      throw error;
    }
  }

  /**
   * Seleciona números aleatórios disponíveis usando bitmap shardado
   * @param campaignId ID da campanha
   * @param quantity Quantidade de números a selecionar
   * @param meta Metadados do bitmap shardado
   * @returns Array de números selecionados (base 1)
   */
  private static async selectRandomNumbersSharded(campaignId: string, quantity: number, meta: any) {
    // Verificar se há números suficientes disponíveis
    if (meta.availableCount < quantity) {
      throw new Error(`Não há números suficientes disponíveis. Solicitados: ${quantity}, Disponíveis: ${meta.availableCount}`);
    }
    
    // Obter todos os shards com números disponíveis
    const shards = await BitMapShardModel.find({ 
      campaignId, 
      availableCount: { $gt: 0 } 
    });
    
    // Abordagem híbrida para máxima aleatoriedade e eficiência
    const allSelectedNumbers: number[] = [];
    
    // Calcular quantos números selecionar de cada shard
    const totalAvailable = shards.reduce((sum, shard) => sum + shard.availableCount, 0);
    const shardsToSelect: Array<{shard: any, count: number}> = [];
    
    // Distribuir a quantidade proporcionalmente entre os shards
    let remainingToSelect = quantity;
    
    // Primeira passagem: distribuir proporcionalmente
    for (const shard of shards) {
      if (remainingToSelect <= 0) break;
      
      // Usar proporção para distribuição inicial
      const proportion = shard.availableCount / totalAvailable;
      let numbersFromShard = Math.floor(quantity * proportion);
      
      // Garantir pelo menos 1 número por shard se possível
      if (numbersFromShard === 0 && shard.availableCount > 0 && remainingToSelect > 0) {
        numbersFromShard = 1;
      }
      
      // Não exceder o disponível ou o restante necessário
      numbersFromShard = Math.min(numbersFromShard, shard.availableCount, remainingToSelect);
      
      if (numbersFromShard > 0) {
        shardsToSelect.push({ shard, count: numbersFromShard });
        remainingToSelect -= numbersFromShard;
      }
    }
    
    // Segunda passagem: distribuir o restante aleatoriamente
    if (remainingToSelect > 0) {
      // Criar array de shards com capacidade restante
      const shardsWithCapacity = shards.filter(shard => {
        const alreadySelected = shardsToSelect.find(s => s.shard.shardIndex === shard.shardIndex)?.count || 0;
        return shard.availableCount > alreadySelected;
      });
      
      // Embaralhar os shards para distribuição aleatória
      for (let i = shardsWithCapacity.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shardsWithCapacity[i], shardsWithCapacity[j]] = [shardsWithCapacity[j], shardsWithCapacity[i]];
      }
      
      // Distribuir o restante
      let shardIndex = 0;
      while (remainingToSelect > 0 && shardIndex < shardsWithCapacity.length) {
        const shard = shardsWithCapacity[shardIndex];
        const existingSelection = shardsToSelect.find(s => s.shard.shardIndex === shard.shardIndex);
        
        const alreadySelected = existingSelection?.count || 0;
        const remaining = shard.availableCount - alreadySelected;
        
        if (remaining > 0) {
          // Adicionar um número por vez para distribuição mais uniforme
          const additional = Math.min(1, remaining, remainingToSelect);
          
          if (existingSelection) {
            existingSelection.count += additional;
          } else {
            shardsToSelect.push({ shard, count: additional });
          }
          
          remainingToSelect -= additional;
        }
        
        // Avançar para o próximo shard ou voltar ao início se chegou ao fim
        shardIndex = (shardIndex + 1) % shardsWithCapacity.length;
      }
    }
    
    // Embaralhar a ordem de processamento dos shards
    for (let i = shardsToSelect.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shardsToSelect[i], shardsToSelect[j]] = [shardsToSelect[j], shardsToSelect[i]];
    }
    
    // Selecionar números de cada shard
    for (const { shard, count } of shardsToSelect) {
      if (count <= 0) continue;
      
      // Usar método otimizado para selecionar números do shard
      const shardNumbers = await this.selectTrulyRandomNumbersFromShard(shard, count);
      
      // Converter para números globais (base 1)
      for (const offset of shardNumbers) {
        const globalNumber = shard.startNumber + offset + 1; // +1 para base 1
        allSelectedNumbers.push(globalNumber);
      }
    }
    
    // Embaralhar completamente o resultado final usando Fisher-Yates
    for (let i = allSelectedNumbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allSelectedNumbers[i], allSelectedNumbers[j]] = [allSelectedNumbers[j], allSelectedNumbers[i]];
    }
    
    return allSelectedNumbers;
  }
  
  /**
   * Seleciona números verdadeiramente aleatórios de um shard
   * Implementação otimizada para garantir máxima aleatoriedade
   * @param shard Documento do shard
   * @param count Quantidade de números a selecionar
   * @returns Array de offsets selecionados (base 0)
   */
  private static async selectTrulyRandomNumbersFromShard(shard: any, count: number): Promise<number[]> {
    const shardSize = shard.endNumber - shard.startNumber + 1;
    
    // Para shards muito grandes, usar amostragem por reservatório
    if (shard.availableCount > 100000 && count < shard.availableCount / 10) {
      return this.reservoirSamplingFromShard(shard, count);
    }
    
    // Para shards menores ou quando precisamos de muitos números,
    // coletar todos os números disponíveis e embaralhar
    const availablePositions: number[] = [];
    
    // Coletar todos os números disponíveis usando lookup table
    for (let byteIndex = 0; byteIndex < shard.bitmap.length; byteIndex++) {
      const byte = shard.bitmap[byteIndex];
      
      if (byte > 0) {
        const bitPositions = BITS_POSITIONS[byte];
        
        for (const bitPos of bitPositions) {
          const position = byteIndex * 8 + bitPos;
          
          if (position < shardSize) {
            availablePositions.push(position);
          }
        }
      }
    }
    
    // Embaralhar completamente usando Fisher-Yates
    for (let i = availablePositions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availablePositions[i], availablePositions[j]] = [availablePositions[j], availablePositions[i]];
    }
    
    // Retornar apenas a quantidade solicitada
    return availablePositions.slice(0, count);
  }
  
  /**
   * Implementa o algoritmo Reservoir Sampling para selecionar números aleatórios
   * de um shard grande sem precisar armazenar todos os números disponíveis
   * @param shard Documento do shard
   * @param count Quantidade de números a selecionar
   * @returns Array de offsets selecionados (base 0)
   */
  private static reservoirSamplingFromShard(shard: any, count: number): number[] {
    const shardSize = shard.endNumber - shard.startNumber + 1;
    const reservoir: number[] = [];
    let seen = 0;
    
    // Percorrer todos os números do shard
    for (let byteIndex = 0; byteIndex < shard.bitmap.length; byteIndex++) {
      
      const byte = shard.bitmap[byteIndex];
      
      if (byte > 0) {
        const bitPositions = BITS_POSITIONS[byte];
        
        for (const bitPos of bitPositions) {
          const position = byteIndex * 8 + bitPos;
          
          if (position < shardSize) {
            seen++;
            
            if (reservoir.length < count) {
              // Preencher o reservatório inicialmente
              reservoir.push(position);
            } else {
              // Substituir elementos com probabilidade decrescente
              const j = Math.floor(Math.random() * seen);
              if (j < count) {
                reservoir[j] = position;
              }
            }
          }
        }
      }
    }
    
    // Embaralhar o resultado final
    for (let i = reservoir.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [reservoir[i], reservoir[j]] = [reservoir[j], reservoir[i]];
    }
    
    return reservoir;
  }
  
  /**
   * Seleciona números específicos se disponíveis, complementando com aleatórios se necessário
   * @param campaignId ID da campanha
   * @param quantity Quantidade total de números desejada
   * @param preferredNumbers Array de números preferidos (base 1)
   * @returns Array de números selecionados (base 1)
   */
  static async selectNumbers(campaignId: string, quantity: number, preferredNumbers?: number[]): Promise<number[]> {
    try {
      let selectedNumbers: number[] = [];
      
      // 1. Verificar números preferidos primeiro (se fornecidos)
      if (preferredNumbers && preferredNumbers.length > 0) {
        const availabilityResult = await this.checkNumbersAvailability(campaignId, preferredNumbers);
        
        // Filtrar apenas os números disponíveis
        for (let i = 0; i < preferredNumbers.length; i++) {
          if (availabilityResult[i]) {
            selectedNumbers.push(preferredNumbers[i]);
            
            // Se já temos números suficientes, retornar
            if (selectedNumbers.length >= quantity) {
              return selectedNumbers.slice(0, quantity);
            }
          }
        }
      }
      
      // 2. Se precisamos de mais números, selecionar aleatoriamente
      if (selectedNumbers.length < quantity) {
        const remainingQuantity = quantity - selectedNumbers.length;
        const randomNumbers = await this.selectRandomNumbers(campaignId, remainingQuantity);
        selectedNumbers = [...selectedNumbers, ...randomNumbers];
      }
      
      return selectedNumbers;
    } catch (error) {
      console.error(`Erro ao selecionar números:`, error);
      throw error;
    }
  }

  /**
   * Obtém a contagem de números disponíveis
   * @param campaignId ID da campanha
   * @returns Quantidade de números disponíveis
   */
  static async getAvailableCount(campaignId: string): Promise<number> {
    try {
      // Verificar se estamos usando bitmap shardado
      const meta = await BitMapMetaModel.getBitmapMeta(campaignId);
      
      if (meta) {
        // Bitmap shardado
        return meta.availableCount;
      } else {
        // Bitmap tradicional
      const bitmap = await BitMapModel.getBitmap(campaignId);
        if (!bitmap) return 0;
        
        return bitmap.availableCount;
      }
    } catch (error) {
      console.error(`Erro ao obter contagem de números disponíveis:`, error);
      return 0;
    }
  }
  
  /**
   * Obtém a contagem total de números
   * @param campaignId ID da campanha
   * @returns Quantidade total de números
   */
  static async getTotalCount(campaignId: string): Promise<number> {
    try {
      // Verificar se estamos usando bitmap shardado
      const meta = await BitMapMetaModel.getBitmapMeta(campaignId);
      
      if (meta) {
        // Bitmap shardado
        return meta.totalNumbers;
      } else {
        // Bitmap tradicional
      const bitmap = await BitMapModel.getBitmap(campaignId);
        if (!bitmap) return 0;
        
        return bitmap.totalNumbers;
      }
    } catch (error) {
      console.error(`Erro ao obter contagem total de números:`, error);
      return 0;
    }
  }
  
  /**
   * Reserva números para um usuário (para geração de PIX)
   * Marca os números como indisponíveis no bitmap
   * @param campaignId ID da campanha
   * @param numbers Array de números a reservar (base 1)
   * @param session Sessão MongoDB opcional para transações
   */
  static async reserveNumbers(campaignId: string, numbers: number[], session?: mongoose.ClientSession): Promise<void> {
    try {
      // Marcar como indisponíveis no bitmap
      await this.markNumbersAsTaken(campaignId, numbers, session);
    } catch (error) {
      console.error(`Erro ao reservar números ${numbers.join(', ')}:`, error);
      throw error;
    }
  }
  
  /**
   * Libera números reservados (quando o PIX expira)
   * Marca os números como disponíveis novamente no bitmap
   * @param campaignId ID da campanha
   * @param numbers Array de números a liberar (base 1)
   * @param session Sessão MongoDB opcional para transações
   */
  static async releaseReservedNumbers(campaignId: string, numbers: number[], session?: mongoose.ClientSession): Promise<void> {
    try {
      // Marcar como disponíveis no bitmap
      await this.markNumbersAsAvailable(campaignId, numbers, session);
    } catch (error) {
      console.error(`Erro ao liberar números reservados ${numbers.join(', ')}:`, error);
      throw error;
    }
  }
  
  /**
   * Reserva números aleatórios para um usuário
   * Seleciona números aleatórios disponíveis e os marca como indisponíveis em uma única operação
   * @param campaignId ID da campanha
   * @param quantity Quantidade de números a reservar
   * @param preferredNumbers Array opcional de números preferidos a tentar reservar primeiro
   * @returns Array de números reservados (base 1)
   */
  static async reserveRandomNumbers(
    campaignId: string, 
    quantity: number,
    preferredNumbers?: number[],
    session: mongoose.ClientSession | null = null
  ): Promise<number[]> {
      // Usar transação se fornecida ou criar uma nova
      const useTransaction = !!session;
      const sessionToUse = session || await mongoose.startSession();
      
      if (!useTransaction) {
        sessionToUse.startTransaction();
      }
    
    try {
      // 1. Selecionar números aleatórios
      let selectedNumbers: number[];
      
      if (preferredNumbers && preferredNumbers.length > 0) {
        // Usar o método que tenta números preferidos primeiro
        selectedNumbers = await this.selectNumbers(campaignId, quantity, preferredNumbers);
      } else {
        // Usar seleção puramente aleatória
        selectedNumbers = await this.selectRandomNumbers(campaignId, quantity);
      }
      
      if (selectedNumbers.length < quantity) {
        throw new Error(`Não foi possível selecionar a quantidade desejada de números. Solicitados: ${quantity}, Selecionados: ${selectedNumbers.length}`);
      }
      
      // 2. Marcar os números como indisponíveis
      await this.markNumbersAsTaken(campaignId, selectedNumbers, sessionToUse);
      
      // 3. Confirmar a transação
      if (!useTransaction) {
        await sessionToUse.commitTransaction();
      }
      
      return selectedNumbers;
    } catch (error) {
      // Em caso de erro, reverter a transação
      if (!useTransaction) {
        await sessionToUse.abortTransaction();
      }
      console.error(`Erro ao reservar números aleatórios:`, error);
      throw error;
    } finally {
      if (!useTransaction) {
        sessionToUse.endSession();
      }
    }
  }
  
  /**
   * Reserva números específicos para um usuário
   * Verifica se os números estão disponíveis e os marca como indisponíveis em uma única operação
   * @param campaignId ID da campanha
   * @param numbers Array de números específicos a reservar (base 1)
   * @param allowPartial Se true, permite reservar parcialmente os números disponíveis
   * @returns Objeto com os números que foram reservados e os que não estavam disponíveis
   */
  static async reserveSpecificNumbers(
    campaignId: string, 
    numbers: number[],
    allowPartial: boolean = false
  ): Promise<{
    reserved: number[],
    unavailable: number[]
  }> {
    if (!numbers || numbers.length === 0) {
      return { reserved: [], unavailable: [] };
    }
    
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // 1. Verificar quais números estão disponíveis
      const availability = await this.checkNumbersAvailability(campaignId, numbers);
      
      // 2. Filtrar apenas os números disponíveis
      const availableNumbers: number[] = [];
      const unavailableNumbers: number[] = [];
      
      for (let i = 0; i < numbers.length; i++) {
        if (availability[i]) {
          availableNumbers.push(numbers[i]);
        } else {
          unavailableNumbers.push(numbers[i]);
        }
      }
      
      // 3. Verificar se podemos prosseguir
      if (availableNumbers.length === 0) {
        await session.abortTransaction();
        return { reserved: [], unavailable: numbers };
      }
      
      if (!allowPartial && availableNumbers.length < numbers.length) {
        await session.abortTransaction();
        return { reserved: [], unavailable: unavailableNumbers };
      }
      
      // 4. Marcar os números disponíveis como indisponíveis
      await this.markNumbersAsTaken(campaignId, availableNumbers, session);
      
      // 5. Confirmar a transação
      await session.commitTransaction();
      
      return {
        reserved: availableNumbers,
        unavailable: unavailableNumbers
      };
    } catch (error) {
      // Em caso de erro, reverter a transação
      await session.abortTransaction();
      console.error(`Erro ao reservar números específicos:`, error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Deleta completamente os dados de bitmap de uma campanha
   * @param campaignId ID da campanha
   * @param session Sessão MongoDB opcional para transações
   * @returns Objeto com informações sobre a operação de exclusão
   */
  static async deleteBitmap(campaignId: string, session?: mongoose.ClientSession): Promise<{
    deleted: boolean;
    wasSharded: boolean;
    deletedShards?: number;
    message: string;
  }> {
    try {
      // Verificar se estamos usando bitmap shardado
      const meta = await BitMapMetaModel.getBitmapMeta(campaignId);
      
      // Usar transação se fornecida ou criar uma nova
      const useTransaction = !!session;
      const sessionToUse = session || await mongoose.startSession();
      
      if (!useTransaction) {
        sessionToUse.startTransaction();
      }
      
      try {
        if (meta) {
          // Bitmap shardado - deletar todos os shards e metadados
          const deleteShardResult = await BitMapShardModel.deleteMany(
            { campaignId }, 
            { session: sessionToUse }
          );
          
          const deleteMetaResult = await BitMapMetaModel.deleteOne(
            { campaignId }, 
            { session: sessionToUse }
          );
          
          if (!useTransaction) {
            await sessionToUse.commitTransaction();
          }
          
          return {
            deleted: true,
            wasSharded: true,
            deletedShards: deleteShardResult.deletedCount || 0,
            message: `Bitmap shardado excluído com sucesso: ${deleteShardResult.deletedCount} shards e metadados removidos`
          };
        } else {
          // Bitmap tradicional - deletar documento único
          const deleteResult = await BitMapModel.deleteOne(
          { campaignId },
            { session: sessionToUse }
          );
          
          if (!useTransaction) {
            await sessionToUse.commitTransaction();
          }
          
          if (deleteResult.deletedCount === 0) {
            return {
              deleted: false,
              wasSharded: false,
              message: `Nenhum bitmap encontrado para a campanha ${campaignId}`
            };
          }
          
          return {
            deleted: true,
            wasSharded: false,
            message: `Bitmap tradicional excluído com sucesso`
          };
        }
      } catch (error) {
        if (!useTransaction) {
          await sessionToUse.abortTransaction();
        }
        throw error;
      } finally {
        if (!useTransaction) {
          sessionToUse.endSession();
        }
      }
    } catch (error) {
      console.error(`Erro ao deletar bitmap da campanha ${campaignId}:`, error);
      throw error;
    }
  }
  
  /**
   * Obtém estatísticas do bitmap de uma campanha
   */
  static async getBitmapStats(campaignId: string): Promise<{
    totalNumbers: number;
    availableCount: number;
    takenCount: number;
    availablePercentage: number;
    takenPercentage: number;
    isSharded: boolean;
    shardInfo?: {
      shardCount: number;
      shardSize: number;
      shardsWithAvailableNumbers: number;
    }
  }> {
    try {
      // Verificar se estamos usando bitmap shardado
      const meta = await BitMapMetaModel.getBitmapMeta(campaignId);
      
      if (meta) {
        // Bitmap shardado
        const shards = await BitMapShardModel.find({ campaignId });
        const shardsWithAvailable = shards.filter(s => s.availableCount > 0).length;
        
        return {
          totalNumbers: meta.totalNumbers,
          availableCount: meta.availableCount,
          takenCount: meta.totalNumbers - meta.availableCount,
          availablePercentage: (meta.availableCount / meta.totalNumbers) * 100,
          takenPercentage: ((meta.totalNumbers - meta.availableCount) / meta.totalNumbers) * 100,
          isSharded: true,
          shardInfo: {
            shardCount: meta.shardCount,
            shardSize: meta.shardSize,
            shardsWithAvailableNumbers: shardsWithAvailable
          }
        };
      } else {
        // Bitmap tradicional
        const bitmap = await BitMapModel.getBitmap(campaignId);
        
        if (!bitmap) {
          throw new Error(`Bitmap não encontrado para campanha ${campaignId}`);
        }
        
        return {
          totalNumbers: bitmap.totalNumbers,
          availableCount: bitmap.availableCount,
          takenCount: bitmap.totalNumbers - bitmap.availableCount,
          availablePercentage: (bitmap.availableCount / bitmap.totalNumbers) * 100,
          takenPercentage: ((bitmap.totalNumbers - bitmap.availableCount) / bitmap.totalNumbers) * 100,
          isSharded: false
        };
      }
    } catch (error) {
      console.error(`Erro ao obter estatísticas do bitmap:`, error);
      throw error;
    }
  }

  private static showBitmap(bitmap: Buffer, message?: string) {
    console.log(message || 'bitmap');
    let bitmapBuffer: Buffer = Buffer.from(bitmap);
    bitmapBuffer.forEach((byte, index) => {
      console.log('byte', byte.toString(2));
    });
  }
} 