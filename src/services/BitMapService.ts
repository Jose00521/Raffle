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
        
        const shard = await BitMapShardModel.getBitmapShard(campaignId, shardIndex);
        if (!shard) return false;
        
        return BitMapShardModel.isNumberAvailable(shard.bitmap, relativeNumber);
      } else {
        // Bitmap tradicional
        const bitmap = await BitMapModel.getBitmap(campaignId);
        if (!bitmap) return false;
        
        return BitMapModel.isNumberAvailable(bitmap.bitmap, zeroBasedNumber);
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
    
    // Calcular quais bytes precisamos verificar
    const byteIndices = new Set<number>();
    zeroBasedNumbers.forEach(number => {
      byteIndices.add(Math.floor(number / 8));
    });
    
    // Projeção para incluir apenas os bytes necessários
    const projection: IProjection = { _id: 1 };
    byteIndices.forEach(byteIndex => {
      projection[`bitmap.${byteIndex}`] = 1;
    });
    
    // Buscar apenas os bytes necessários do bitmap
    const bitmap = await BitMapModel.findOne({ campaignId }, projection);
    
    if (bitmap) {
      // Verificar cada número
      for (let i = 0; i < zeroBasedNumbers.length; i++) {
        const number = zeroBasedNumbers[i];
        const byteIndex = Math.floor(number / 8);
        const bitIndex = number % 8;
        
        // Bit 1 = disponível
        if (bitmap.bitmap[byteIndex] & (1 << bitIndex)) {
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
          // Calcular quais bytes precisamos verificar
          const byteSet = new Set<number>();
          shardNumbers.forEach(({ offset }: { offset: number }) => {
            byteSet.add(Math.floor(offset / 8));
          });
          
          // Converter Set para array e ordenar para otimizar a projeção
          const byteIndices = Array.from(byteSet).sort((a, b) => a - b);
          
          // Otimizar a projeção para buscar apenas intervalos contíguos de bytes
          const projection: IProjection = { _id: 1 };
          
          if (byteIndices.length > 0) {
            let startByte = byteIndices[0];
            let endByte = startByte;
            
            for (let k = 1; k < byteIndices.length; k++) {
              if (byteIndices[k] === endByte + 1) {
                // Byte contíguo, estender o intervalo
                endByte = byteIndices[k];
              } else {
                // Intervalo não contíguo, adicionar o intervalo atual e iniciar um novo
                for (let b = startByte; b <= endByte; b++) {
                  projection[`bitmap.${b}`] = 1;
                }
                startByte = byteIndices[k];
                endByte = startByte;
              }
            }
            
            // Adicionar o último intervalo
            for (let b = startByte; b <= endByte; b++) {
              projection[`bitmap.${b}`] = 1;
            }
          }
          
          // Buscar apenas os bytes necessários do shard
          const shard = await BitMapShardModel.findOne(
            { campaignId, shardIndex: parseInt(shardIndex) },
            projection
          );
          
          if (!shard) return;
          
          // Verificar cada número neste shard
          for (const { originalIndex, offset } of shardNumbers) {
            const byteIndex = Math.floor(offset / 8);
            const bitIndex = offset % 8;
            
            // Bit 1 = disponível
            if (shard.bitmap[byteIndex] & (1 << bitIndex)) {
              result[originalIndex] = true;
            }
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
  
  /**
   * Implementação otimizada para marcar múltiplos números como ocupados em bitmap tradicional
   */
  private static async markNumbersAsTakenTraditionalOptimized(
    campaignId: string, 
    zeroBasedNumbers: number[],
    session?: mongoose.ClientSession
  ) {
    // Agrupar por byte para minimizar operações
    const byteUpdates: IByteUpdates = {};
    
    for (const number of zeroBasedNumbers) {
      const byteIndex = Math.floor(number / 8);
      const bitIndex = number % 8;
      
      if (!byteUpdates[byteIndex]) {
        byteUpdates[byteIndex] = 0;
      }
      
      byteUpdates[byteIndex] |= (1 << bitIndex);
    }
    
    // Construir operação de atualização para todos os bytes afetados
    const bitOperations: IBitOperations = {};
    let numBitsChanged = 0;
    
    Object.entries(byteUpdates).forEach(([byteIndex, bitMask]) => {
      // Contar bits usando a tabela de lookup
      numBitsChanged += this.countBits(bitMask as number);
      
      bitOperations[`bitmap.${byteIndex}`] = { and: ~(bitMask as number) };
    });
    
    // Uma única operação para atualizar todos os bytes
    await BitMapModel.updateOne(
      { campaignId },
      {
        $bit: bitOperations,
        $inc: { availableCount: -numBitsChanged },
        $set: { updatedAt: new Date() }
      },
      { session }
    );
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
    
    // Para grandes volumes, usamos bulkWrite para máxima eficiência
    const bulkOps: mongoose.AnyBulkWriteOperation[] = [];
    const shardUpdates: IShardUpdates = {};
    
    // Agrupar números por shard
    for (const number of zeroBasedNumbers) {
      const shardIndex = Math.floor(number / shardSize);
      const offset = number % shardSize;
      const byteIndex = Math.floor(offset / 8);
      const bitIndex = offset % 8;
      
      if (!shardUpdates[shardIndex]) {
        shardUpdates[shardIndex] = {};
      }
      
      if (!shardUpdates[shardIndex][byteIndex]) {
        shardUpdates[shardIndex][byteIndex] = 0;
      }
      
      shardUpdates[shardIndex][byteIndex] |= (1 << bitIndex);
    }
    
    // Criar operações em lote para cada shard
    for (const [shardIndex, byteUpdates] of Object.entries(shardUpdates)) {
      const bitOperations: IBitOperations = {};
      let numBitsChanged = 0;
      
      Object.entries(byteUpdates).forEach(([byteIndex, bitMask]) => {
        // Contar bits usando a tabela de lookup em vez do loop while
        numBitsChanged += this.countBits(bitMask as number);
        
        bitOperations[`bitmap.${byteIndex}`] = { and: ~(bitMask as number) };
      });
      
      bulkOps.push({
        updateOne: {
          filter: { campaignId, shardIndex: parseInt(shardIndex) },
          update: {
            $bit: bitOperations,
            $inc: { availableCount: -numBitsChanged },
            $set: { updatedAt: new Date() }
          }
        }
      });
    }
    
    // Executar todas as operações em um único bulkWrite
    if (bulkOps.length > 0) {
      if (session) {
        await BitMapShardModel.bulkWrite(bulkOps, { session });
        
        // Atualizar metadados
        await BitMapMetaModel.updateOne(
          { campaignId },
          { 
            $inc: { totalAvailableCount: -zeroBasedNumbers.length },
            $set: { updatedAt: new Date() }
          },
          { session }
        );
      } else {
        await BitMapShardModel.bulkWrite(bulkOps, { session });
        
        // Atualizar metadados
        await BitMapMetaModel.updateOne(
          { campaignId },
          { 
            $inc: { totalAvailableCount: -zeroBasedNumbers.length },
            $set: { updatedAt: new Date() }
          },
          { session }
        );
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
    // Agrupar por byte para minimizar operações
    const byteUpdates: IByteUpdates = {};
    
    for (const number of zeroBasedNumbers) {
      const byteIndex = Math.floor(number / 8);
      const bitIndex = number % 8;
      
      if (!byteUpdates[byteIndex]) {
        byteUpdates[byteIndex] = 0;
      }
      
      byteUpdates[byteIndex] |= (1 << bitIndex);
    }
    
    // Construir operação de atualização para todos os bytes afetados
    const bitOperations: IBitOperations = {};
    let numBitsChanged = 0;
    
    Object.entries(byteUpdates).forEach(([byteIndex, bitMask]) => {
      // Contar bits usando a tabela de lookup
      numBitsChanged += this.countBits(bitMask as number);
      
      bitOperations[`bitmap.${byteIndex}`] = { or: (bitMask as number) };
    });
    
    // Uma única operação para atualizar todos os bytes
    await BitMapModel.updateOne(
      { campaignId },
      {
        $bit: bitOperations,
        $inc: { availableCount: numBitsChanged },
        $set: { updatedAt: new Date() }
      },
      { session }
    );
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
    
    // Para grandes volumes, usamos bulkWrite para máxima eficiência
    const bulkOps: mongoose.AnyBulkWriteOperation[] = [];
    const shardUpdates: IShardUpdates = {};
    
    // Agrupar números por shard
    for (const number of zeroBasedNumbers) {
      const shardIndex = Math.floor(number / shardSize);
      const offset = number % shardSize;
      const byteIndex = Math.floor(offset / 8);
      const bitIndex = offset % 8;
      
      if (!shardUpdates[shardIndex]) {
        shardUpdates[shardIndex] = {};
      }
      
      if (!shardUpdates[shardIndex][byteIndex]) {
        shardUpdates[shardIndex][byteIndex] = 0;
      }
      
      shardUpdates[shardIndex][byteIndex] |= (1 << bitIndex);
    }
    
    // Criar operações em lote para cada shard
    for (const [shardIndex, byteUpdates] of Object.entries(shardUpdates)) {
      const bitOperations: IBitOperations = {};
      let numBitsChanged = 0;
      
      Object.entries(byteUpdates).forEach(([byteIndex, bitMask]) => {
        // Contar bits usando a tabela de lookup em vez do loop while
        numBitsChanged += this.countBits(bitMask as number);
        
        bitOperations[`bitmap.${byteIndex}`] = { or: (bitMask as number) };
      });
      
      bulkOps.push({
        updateOne: {
          filter: { campaignId, shardIndex: parseInt(shardIndex) },
          update: {
            $bit: bitOperations,
            $inc: { availableCount: numBitsChanged },
            $set: { updatedAt: new Date() }
          }
        }
      });
    }
    
    // Executar todas as operações em um único bulkWrite
    if (bulkOps.length > 0) {
      if (session) {
        await BitMapShardModel.bulkWrite(bulkOps, { session });
        
        // Atualizar metadados
        await BitMapMetaModel.updateOne(
          { campaignId },
          { 
            $inc: { totalAvailableCount: zeroBasedNumbers.length },
            $set: { updatedAt: new Date() }
          },
          { session }
        );
      } else {
        await BitMapShardModel.bulkWrite(bulkOps);
        
        // Atualizar metadados
        await BitMapMetaModel.updateOne(
          { campaignId },
          { 
            $inc: { totalAvailableCount: zeroBasedNumbers.length },
            $set: { updatedAt: new Date() }
          }
        );
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
    
    // Estratégia: selecionar números de shards com base na proporção de números disponíveis
    const selected: number[] = [];
    
    // Obter todos os shards e suas contagens disponíveis
    const shards = await BitMapShardModel.find({ campaignId }).sort({ shardIndex: 1 });
    
    // Calcular quantos números selecionar de cada shard com base na proporção
    const shardsToSelect: Array<{shardIndex: number, count: number}> = [];
    let remainingToSelect = quantity;
    
    for (const shard of shards) {
      if (remainingToSelect <= 0) break;
      
      // Calcular proporção de números a selecionar deste shard
      const proportion = shard.availableCount / meta.availableCount;
      let numbersFromShard = Math.min(
        Math.floor(quantity * proportion),
        shard.availableCount,
        remainingToSelect
      );
      
      // Garantir que pelo menos 1 número seja selecionado se houver disponível
      if (numbersFromShard === 0 && shard.availableCount > 0 && remainingToSelect > 0) {
        numbersFromShard = 1;
      }
      
      if (numbersFromShard > 0) {
        shardsToSelect.push({ shardIndex: shard.shardIndex, count: numbersFromShard });
        remainingToSelect -= numbersFromShard;
      }
    }
    
    // Se ainda faltam números para selecionar, distribuir entre os shards disponíveis
    if (remainingToSelect > 0) {
      let shardIndex = 0;
      while (remainingToSelect > 0 && shardIndex < shards.length) {
        const shard = shards[shardIndex];
        const shardSelectInfo = shardsToSelect.find(s => s.shardIndex === shard.shardIndex);
        
        const alreadySelected = shardSelectInfo?.count || 0;
        const remaining = shard.availableCount - alreadySelected;
        
        if (remaining > 0) {
          const additional = Math.min(remaining, remainingToSelect);
          
          if (shardSelectInfo) {
            shardSelectInfo.count += additional;
          } else {
            shardsToSelect.push({ shardIndex: shard.shardIndex, count: additional });
          }
          
          remainingToSelect -= additional;
        }
        
        shardIndex++;
      }
    }
    
    // Selecionar números de cada shard usando algoritmo otimizado
    for (const { shardIndex, count } of shardsToSelect) {
      const shard = shards.find(s => s.shardIndex === shardIndex)!;
      const shardNumbers = await this.selectNumbersFromShard(shard, count);
      
      // Converter para números globais (base 1)
      for (const offset of shardNumbers) {
        const globalNumber = shard.startNumber + offset + 1; // +1 para base 1
        selected.push(globalNumber);
      }
    }
    
    return selected;
  }
  
  /**
   * Seleciona números aleatórios disponíveis de um shard específico
   * Usa algoritmo Fisher-Yates para garantir distribuição uniforme
   * @param shard Documento do shard
   * @param count Quantidade de números a selecionar
   * @returns Array de offsets selecionados (base 0)
   */
  private static async selectNumbersFromShard(shard: any, count: number): Promise<number[]> {
    // Para shards grandes, usar abordagem por segmentos
    if ((shard.endNumber - shard.startNumber + 1) > BITMAP_CONFIG.SEGMENT_SIZE * 10) {
      return this.selectNumbersFromLargeShard(shard, count);
    }
    
    // Para shards menores, construir array de posições disponíveis usando lookup table
    const availablePositions: number[] = [];
    const shardSize = shard.endNumber - shard.startNumber + 1;
    
    // Percorrer bytes do bitmap
    for (let byteIndex = 0; byteIndex < shard.bitmap.length; byteIndex++) {
      const byte = shard.bitmap[byteIndex];
      
      // Pular bytes sem bits disponíveis
      if (byte > 0) {
        // Obter posições de bits disponíveis diretamente da tabela de lookup
        const bitPositions = BITS_POSITIONS[byte];
        
        // Calcular posição absoluta e adicionar ao array
        for (const bitPos of bitPositions) {
          const position = byteIndex * 8 + bitPos;
          
          // Verificar se a posição está dentro dos limites do shard
          if (position < shardSize) {
            availablePositions.push(position);
          }
        }
      }
    }
    
    // Aplicar Fisher-Yates shuffle para os primeiros 'count' elementos
    for (let i = 0; i < Math.min(count, availablePositions.length); i++) {
      const j = i + Math.floor(Math.random() * (availablePositions.length - i));
      // Swap
      [availablePositions[i], availablePositions[j]] = [availablePositions[j], availablePositions[i]];
    }
    
    // Retornar apenas a quantidade solicitada
    return availablePositions.slice(0, count);
  }
  
  /**
   * Seleciona números aleatórios disponíveis de um shard grande
   * Usa abordagem por segmentos para otimizar memória e desempenho
   * @param shard Documento do shard
   * @param count Quantidade de números a selecionar
   * @returns Array de offsets selecionados (base 0)
   */
  private static async selectNumbersFromLargeShard(shard: any, count: number): Promise<number[]> {
    const selected: number[] = [];
    const shardSize = shard.endNumber - shard.startNumber + 1;
    const segmentSize = BITMAP_CONFIG.SEGMENT_SIZE;
    const segmentCount = Math.ceil(shardSize / segmentSize);
    
    // 1. Identificar segmentos com números disponíveis
    const segmentsWithAvailable: number[] = [];
    
    for (let segment = 0; segment < segmentCount; segment++) {
      const startByte = Math.floor((segment * segmentSize) / 8);
      const endByte = Math.floor(((segment + 1) * segmentSize - 1) / 8);
      
      // Verificar rapidamente se há algum bit 1 neste segmento
      let hasAvailable = false;
      for (let byteIndex = startByte; byteIndex <= endByte && byteIndex < shard.bitmap.length; byteIndex++) {
        if (shard.bitmap[byteIndex] > 0) {
          hasAvailable = true;
          break;
        }
      }
      
      if (hasAvailable) {
        segmentsWithAvailable.push(segment);
      }
    }
    
    // 2. Embaralhar segmentos para distribuição aleatória Fisher-Yates
    for (let i = segmentsWithAvailable.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [segmentsWithAvailable[i], segmentsWithAvailable[j]] = [segmentsWithAvailable[j], segmentsWithAvailable[i]];
    }
    
    // 3. Coletar números disponíveis dos segmentos
    for (const segment of segmentsWithAvailable) {
      if (selected.length >= count) break;
      
      const startOffset = segment * segmentSize;
      const endOffset = Math.min((segment + 1) * segmentSize - 1, shardSize - 1);
      const startByteIndex = Math.floor(startOffset / 8);
      const endByteIndex = Math.floor(endOffset / 8);
      
      // Coletar números disponíveis neste segmento usando lookup table
      const availableInSegment: number[] = [];
      
      for (let byteIndex = startByteIndex; byteIndex <= endByteIndex; byteIndex++) {
        const byte = shard.bitmap[byteIndex];
        
        // Pular bytes sem bits disponíveis
        if (byte > 0) {
          // Obter posições de bits disponíveis diretamente da tabela de lookup
          const bitPositions = BITS_POSITIONS[byte];
          
          for (const bitPos of bitPositions) {
            const position = byteIndex * 8 + bitPos;
            
            // Verificar se a posição está dentro do segmento atual e do shard
            if (position >= startOffset && position <= endOffset && position < shardSize) {
              availableInSegment.push(position);
            }
          }
        }
      }
      
      // Embaralhar números disponíveis no segmento
      for (let i = availableInSegment.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableInSegment[i], availableInSegment[j]] = [availableInSegment[j], availableInSegment[i]];
      }
      
      // Adicionar à seleção
      const remaining = count - selected.length;
      selected.push(...availableInSegment.slice(0, remaining));
    }
    
    return selected;
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
   * Obtém estatísticas detalhadas sobre o bitmap de uma campanha
   * @param campaignId ID da campanha
   * @returns Estatísticas do bitmap
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
        const totalNumbers = meta.totalNumbers;
        const availableCount = meta.availableCount;
        const takenCount = totalNumbers - availableCount;
        
        // Contar shards com números disponíveis
        const shards = await BitMapShardModel.find({ campaignId });
        const shardsWithAvailable = shards.filter(shard => shard.availableCount > 0).length;
        
        return {
          totalNumbers,
          availableCount,
          takenCount,
          availablePercentage: (availableCount / totalNumbers) * 100,
          takenPercentage: (takenCount / totalNumbers) * 100,
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
          throw new Error(`Bitmap não encontrado para a campanha ${campaignId}`);
        }
        
        const totalNumbers = bitmap.totalNumbers;
        const availableCount = bitmap.availableCount;
        const takenCount = totalNumbers - availableCount;
        
        return {
          totalNumbers,
          availableCount,
          takenCount,
          availablePercentage: (availableCount / totalNumbers) * 100,
          takenPercentage: (takenCount / totalNumbers) * 100,
          isSharded: false
        };
      }
    } catch (error) {
      console.error(`Erro ao obter estatísticas do bitmap:`, error);
      throw error;
    }
  }
}