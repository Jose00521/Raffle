import { NumberStatusRepository } from '../repositories/NumberStatusRepository';
import { INumberStatus } from '../models/NumberStatus';
import dbConnect from '../../lib/dbConnect';

/**
 * Serviço para gerenciamento de número de rifas
 * Fornece a camada de lógica de negócios relacionada aos números
 */
export class NumberStatusService {
  /**
   * Verifica conexão com o banco antes de cada operação
   */
  private static async ensureDbConnection() {
    await dbConnect();
  }

  /**
   * Obtém estatísticas de venda de uma rifa
   */
  static async getRifaStats(rifaId: string) {
    await this.ensureDbConnection();
    return NumberStatusRepository.getRifaStats(rifaId);
  }

  /**
   * Obtém números disponíveis para uma rifa
   */
  static async getAvailableNumbers(rifaId: string, page: number = 0, limit: number = 100) {
    await this.ensureDbConnection();
    return NumberStatusRepository.getAvailableNumbers(rifaId, page, limit);
  }

  /**
   * Conta quantos números estão disponíveis
   */
  static async getAvailableCount(rifaId: string) {
    await this.ensureDbConnection();
    return NumberStatusRepository.getAvailableCount(rifaId);
  }

  /**
   * Atribui automaticamente e reserva números disponíveis para um usuário
   */
  static async autoReserveNumbers(
    rifaId: string, 
    quantity: number, 
    userId: string,
    expirationMinutes: number = 15
  ) {
    await this.ensureDbConnection();
    return NumberStatusRepository.autoReserveNumbers(rifaId, quantity, userId, expirationMinutes);
  }

  /**
   * Reserva números específicos para um usuário
   */
  static async reserveNumbers(
    rifaId: string,
    numbers: number[],
    userId: string,
    expirationMinutes: number = 15
  ) {
    await this.ensureDbConnection();
    return NumberStatusRepository.reserveNumbers(rifaId, numbers, userId, expirationMinutes);
  }

  /**
   * Confirma o pagamento de números reservados
   */
  static async confirmPayment(rifaId: string, numbers: number[], userId: string) {
    await this.ensureDbConnection();
    return NumberStatusRepository.confirmPayment(rifaId, numbers, userId);
  }

  /**
   * Confirma o pagamento de todos os números reservados pelo usuário
   */
  static async confirmAllUserReservations(rifaId: string, userId: string) {
    await this.ensureDbConnection();
    return NumberStatusRepository.confirmAllUserReservations(rifaId, userId);
  }

  /**
   * Libera números reservados de volta para disponíveis
   */
  static async releaseReservedNumbers(rifaId: string, numbers: number[], userId: string) {
    await this.ensureDbConnection();
    return NumberStatusRepository.releaseReservedNumbers(rifaId, numbers, userId);
  }

  /**
   * Obtém os números comprados por um usuário
   */
  static async getUserPurchases(userId: string, page: number = 0, limit: number = 100) {
    await this.ensureDbConnection();
    return NumberStatusRepository.getUserPurchases(userId, page, limit);
  }

  /**
   * Define um número como vencedor
   */
  static async setWinnerNumber(rifaId: string, winningNumber: number) {
    await this.ensureDbConnection();
    return NumberStatusRepository.setWinnerNumber(rifaId, winningNumber);
  }
} 