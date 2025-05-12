import NumberStatus, { NumberStatusEnum, INumberStatus } from '../../models/NumberStatus';
import mongoose from 'mongoose';

/**
 * Repositório para gerenciamento de status de números de rifas
 * Encapsula todas as operações de banco de dados relacionadas a NumberStatus
 */
export class NumberStatusRepository {
  /**
   * Obtém números disponíveis para uma rifa com paginação
   */
  static async getAvailableNumbers(
    rifaId: string,
    page: number = 0,
    limit: number = 100
  ): Promise<number[]> {
    const skip = page * limit;
    
    const results = await (NumberStatus!).find(
      { rifaId, status: NumberStatusEnum.AVAILABLE },
      { number: 1, _id: 0 }
    )
      .sort({ number: 1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    return results.map((item: { number: number }) => item.number);
  }

  /**
   * Obtém o total de números disponíveis para uma rifa
   */
  static async getAvailableCount(rifaId: string): Promise<number> {
    return await NumberStatus!.countDocuments({ 
      rifaId, 
      status: NumberStatusEnum.AVAILABLE 
    });
  }

  /**
   * Atribui automaticamente e reserva números disponíveis para um usuário
   * Esta função seleciona automaticamente os primeiros números disponíveis
   */
  static async autoReserveNumbers(
    rifaId: string,
    quantity: number,
    userId: string,
    expirationMinutes: number = 15
  ): Promise<{
    success: boolean;
    reservedNumbers: number[];
    message?: string;
  }> {
    try {
      // Verificar se há números suficientes disponíveis
      const availableCount = await this.getAvailableCount(rifaId);
      
      if (availableCount < quantity) {
        return {
          success: false,
          reservedNumbers: [],
          message: `Apenas ${availableCount} números disponíveis, mas foram solicitados ${quantity}`
        };
      }
      
      // Buscar os primeiros 'quantity' números disponíveis
      const availableNumbers = await NumberStatus!.find(
        { rifaId, status: NumberStatusEnum.AVAILABLE },
        { number: 1, _id: 0 }
      )
        .sort({ number: 1 })
        .limit(quantity)
        .lean();
      
      const selectedNumbers = availableNumbers.map(item => item.number);
      
      // Configurar a expiração
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + expirationMinutes);
      
      // Reservar os números para o usuário
      await NumberStatus!.updateMany(
        { 
          rifaId, 
          number: { $in: selectedNumbers },
          status: NumberStatusEnum.AVAILABLE
        },
        {
          $set: {
            status: NumberStatusEnum.RESERVED,
            userId,
            reservedAt: new Date(),
            expiresAt
          }
        }
      );
      
      return {
        success: true,
        reservedNumbers: selectedNumbers
      };
    } catch (error) {
      console.error('Error auto-reserving numbers:', error);
      return {
        success: false,
        reservedNumbers: [],
        message: 'Erro ao reservar números automaticamente'
      };
    }
  }

  /**
   * Confirma o pagamento de números reservados
   */
  static async confirmPayment(
    rifaId: string,
    numbers: number[],
    userId: string
  ): Promise<{
    success: boolean;
    paidCount: number;
    failedNumbers: number[];
  }> {
    try {
      // Verificar se os números estão reservados para este usuário
      const reservedStatus = await NumberStatus!.find({
        rifaId,
        number: { $in: numbers },
        userId,
        status: NumberStatusEnum.RESERVED
      }).lean();

      const reservedNumbers = reservedStatus.map(status => status.number);
      const failedNumbers = numbers.filter(num => !reservedNumbers.includes(num));
      
      if (reservedNumbers.length === 0) {
        return {
          success: false,
          paidCount: 0,
          failedNumbers: numbers
        };
      }

      // Confirmar o pagamento
      const result = await NumberStatus!.confirmPayment(
        rifaId,
        reservedNumbers,
        userId
      );

      return {
        success: true,
        paidCount: reservedNumbers.length,
        failedNumbers
      };
    } catch (error) {
      console.error('Error confirming payment:', error);
      return {
        success: false,
        paidCount: 0,
        failedNumbers: numbers
      };
    }
  }
  
  /**
   * Confirma o pagamento de todos os números reservados por um usuário em uma rifa
   */
  static async confirmAllUserReservations(
    rifaId: string,
    userId: string
  ): Promise<{
    success: boolean;
    paidCount: number;
    paidNumbers: number[];
  }> {
    try {
      // Buscar todos os números reservados pelo usuário nesta rifa
      const reservedStatus = await NumberStatus!.find({
        rifaId,
        userId,
        status: NumberStatusEnum.RESERVED
      }).lean();
      
      if (reservedStatus.length === 0) {
        return {
          success: false,
          paidCount: 0,
          paidNumbers: []
        };
      }
      
      const reservedNumbers = reservedStatus.map(status => status.number);
      
      // Confirmar o pagamento de todos os números
      await NumberStatus!.updateMany(
        {
          rifaId,
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
      
      return {
        success: true,
        paidCount: reservedNumbers.length,
        paidNumbers: reservedNumbers
      };
    } catch (error) {
      console.error('Error confirming all reservations:', error);
      return {
        success: false,
        paidCount: 0,
        paidNumbers: []
      };
    }
  }

  /**
   * Libera números reservados de volta para disponíveis
   */
  static async releaseReservedNumbers(
    rifaId: string,
    numbers: number[],
    userId: string
  ): Promise<boolean> {
    try {
      const result = await NumberStatus!.updateMany(
        {
          rifaId,
          number: { $in: numbers },
          userId,
          status: NumberStatusEnum.RESERVED
        },
        {
          $set: {
            status: NumberStatusEnum.AVAILABLE,
            userId: null,
            reservedAt: null,
            expiresAt: null
          }
        }
      );
      
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error releasing reserved numbers:', error);
      return false;
    }
  }

  /**
   * Obtém os números comprados por um usuário
   */
  static async getUserPurchases(
    userId: string,
    page: number = 0,
    limit: number = 100
  ): Promise<INumberStatus[]> {
    const skip = page * limit;
    
    return NumberStatus!.find(
      { userId, status: NumberStatusEnum.PAID },
      { rifaId: 1, number: 1, paidAt: 1 }
    )
      .populate('rifaId', 'title image drawDate')
      .sort({ paidAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  /**
   * Define um número como vencedor
   */
  static async setWinnerNumber(
    rifaId: string,
    winningNumber: number
  ): Promise<boolean> {
    try {
      // Verificar se o número existe e está pago
      const numberStatus = await NumberStatus!.findOne({
        rifaId,
        number: winningNumber,
        status: NumberStatusEnum.PAID
      });

      if (!numberStatus) {
        return false;
      }

      // Atualizar metadata para indicar que é o vencedor
      await NumberStatus!.updateOne(
        { _id: numberStatus._id },
        {
          $set: {
            'metadata.isWinner': true,
            'metadata.winnerDeclaredAt': new Date()
          }
        }
      );

      return true;
    } catch (error) {
      console.error('Error setting winner number:', error);
      return false;
    }
  }

  /**
   * Obtém estatísticas de venda de uma rifa
   */
  static async getRifaStats(rifaId: string): Promise<{
    totalNumbers: number;
    available: number;
    reserved: number;
    sold: number;
    percentComplete: number;
  }> {
    const stats = await NumberStatus!.countByStatus(rifaId);
    
    // Construir objeto com as contagens
    const result = {
      totalNumbers: 0,
      available: 0,
      reserved: 0,
      sold: 0,
      percentComplete: 0
    };
    
    // Popular as estatísticas por status
    stats.forEach(item => {
      if (item.status === NumberStatusEnum.AVAILABLE) {
        result.available = item.count;
      } else if (item.status === NumberStatusEnum.RESERVED) {
        result.reserved = item.count;
      } else if (item.status === NumberStatusEnum.PAID) {
        result.sold = item.count;
      }
    });
    
    // Calcular totais
    result.totalNumbers = result.available + result.reserved + result.sold;
    result.percentComplete = result.totalNumbers > 0 
      ? Math.round((result.sold / result.totalNumbers) * 100) 
      : 0;
    
    return result;
  }
} 