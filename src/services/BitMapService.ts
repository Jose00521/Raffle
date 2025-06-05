import { BitMapModel } from '../models/BitMapModel';
import mongoose from 'mongoose';

/**
 * Serviço para gerenciar operações com bitmap de números de rifa
 * Implementa padrão Façade para simplificar as interações com o BitMapModel
 */
export class BitMapService {
  /**
   * Inicializa um bitmap para uma nova campanha
   * @param campaignId ID da campanha
   * @param totalNumbers Total de números na rifa
   * @returns Documento bitmap criado
   */
  static async initialize(campaignId: string, totalNumbers: number) {
    try {
      console.log(`Inicializando bitmap para campanha ${campaignId} com ${totalNumbers} números`);
      return await BitMapModel.initializeBitmap(campaignId, totalNumbers);
    } catch (error) {
      console.error('Erro ao inicializar bitmap:', error);
      throw error;
    }
  }

  /**
   * Verifica se um número específico está disponível
   * @param campaignId ID da campanha
   * @param number Número a verificar (base 1)
   * @returns true se disponível, false se indisponível
   */
  static async isNumberAvailable(campaignId: string, number: number): Promise<boolean> {
    try {
      // Ajustar para base 0 para operações internas
      const adjustedNumber = number - 1;
      
      // Buscar o bitmap
      const bitmap = await BitMapModel.getBitmap(campaignId);
      if (!bitmap) {
        throw new Error(`Bitmap não encontrado para campanha ${campaignId}`);
      }
      
      // Verificar disponibilidade
      return BitMapModel.isNumberAvailable(bitmap.bitmap, adjustedNumber);
    } catch (error) {
      console.error(`Erro ao verificar disponibilidade do número ${number}:`, error);
      throw error;
    }
  }

  /**
   * Marca números como indisponíveis (quando reservados ou comprados)
   * @param campaignId ID da campanha
   * @param numbers Array de números a marcar (base 1)
   */
  static async markNumbersAsTaken(campaignId: string, numbers: number[]): Promise<void> {
    try {
      // Ajustar para base 0 para operações internas
      const adjustedNumbers = numbers.map(n => n - 1);
      
      // Marcar números como indisponíveis
      await BitMapModel.markNumbersAsTaken(campaignId, adjustedNumbers);
    } catch (error) {
      console.error(`Erro ao marcar números como indisponíveis:`, error);
      throw error;
    }
  }

  /**
   * Seleciona números aleatórios disponíveis
   * @param campaignId ID da campanha
   * @param quantity Quantidade de números a selecionar
   * @returns Array de números selecionados (já em base 1)
   */
  static async selectRandomNumbers(campaignId: string, quantity: number): Promise<number[]> {
    try {
      return await BitMapModel.selectRandomNumbers(campaignId, quantity);
    } catch (error) {
      console.error(`Erro ao selecionar ${quantity} números aleatórios:`, error);
      throw error;
    }
  }

  /**
   * Obtém informações sobre disponibilidade de números
   * @param campaignId ID da campanha
   * @returns Objeto com total, disponíveis e porcentagem
   */
  static async getAvailabilityStats(campaignId: string): Promise<{ 
    total: number, 
    available: number, 
    taken: number, 
    percentAvailable: number 
  }> {
    try {
      const bitmap = await BitMapModel.getBitmap(campaignId);
      if (!bitmap) {
        throw new Error(`Bitmap não encontrado para campanha ${campaignId}`);
      }
      
      const total = bitmap.totalNumbers;
      const available = bitmap.availableCount;
      const taken = total - available;
      const percentAvailable = (available / total) * 100;
      
      return {
        total,
        available,
        taken,
        percentAvailable
      };
    } catch (error) {
      console.error(`Erro ao obter estatísticas de disponibilidade:`, error);
      throw error;
    }
  }

  /**
   * Restaura números para o estado de disponível (quando reservas expiram)
   * @param campaignId ID da campanha
   * @param numbers Array de números a restaurar (base 1)
   */
  static async restoreNumbers(campaignId: string, numbers: number[]): Promise<void> {
    try {
      // Obter o bitmap atual
      const bitmap = await BitMapModel.getBitmap(campaignId);
      if (!bitmap) {
        throw new Error(`Bitmap não encontrado para campanha ${campaignId}`);
      }
      
      // Ajustar para base 0 para operações internas
      const adjustedNumbers = numbers.map(n => n - 1);
      
      // Criar cópia do bitmap para modificação
      const newBitmap = Buffer.from(bitmap.bitmap);
      let restoredCount = 0;
      
      // Restaurar cada número para disponível (bit = 1)
      for (const number of adjustedNumbers) {
        const byteIndex = Math.floor(number / 8);
        const bitIndex = number % 8;
        
        // Verificar se o bit já está marcado como disponível (1)
        if ((newBitmap[byteIndex] & (1 << bitIndex)) === 0) {
          // Marcar como disponível
          newBitmap[byteIndex] |= (1 << bitIndex);
          restoredCount++;
        }
      }
      
      // Atualizar o bitmap e o contador apenas se houver mudanças
      if (restoredCount > 0) {
        await BitMapModel.updateOne(
          { campaignId },
          { 
            $set: { 
              bitmap: newBitmap,
              availableCount: bitmap.availableCount + restoredCount,
              updatedAt: new Date()
            }
          }
        );
      }
    } catch (error) {
      console.error(`Erro ao restaurar números:`, error);
      throw error;
    }
  }
} 