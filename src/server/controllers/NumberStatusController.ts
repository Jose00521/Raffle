import { NextRequest, NextResponse } from 'next/server';
import { NumberStatusService } from '../services/NumberStatusService';

/**
 * Controlador para endpoints relacionados a números de rifas
 * Recebe requisições HTTP e delega ao serviço apropriado
 */
export class NumberStatusController {
  /**
   * Obtém estatísticas de uma rifa
   */
  static async getRifaStats(
    request: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const rifaId = params.id;
      
      // Buscar estatísticas usando o serviço
      const stats = await NumberStatusService.getRifaStats(rifaId);
      
      // Retornar as estatísticas como JSON
      return NextResponse.json(stats);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return NextResponse.json(
        { error: 'Falha ao buscar estatísticas da rifa' },
        { status: 500 }
      );
    }
  }

  /**
   * Reserva números automaticamente
   */
  static async autoReserveNumbers(
    request: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const rifaId = params.id;
      const { quantity, userId } = await request.json();
      
      if (!quantity || !userId) {
        return NextResponse.json(
          { error: 'Quantidade e ID de usuário são obrigatórios' },
          { status: 400 }
        );
      }
      
      // Reservar números automaticamente
      const result = await NumberStatusService.autoReserveNumbers(
        rifaId,
        quantity,
        userId
      );
      
      // Retornar o resultado como JSON
      return NextResponse.json(result);
    } catch (error) {
      console.error('Erro ao reservar números:', error);
      return NextResponse.json(
        { error: 'Falha ao reservar números', success: false },
        { status: 500 }
      );
    }
  }

  /**
   * Confirma o pagamento de todos os números reservados por um usuário
   */
  static async confirmPayment(
    request: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const rifaId = params.id;
      const { userId } = await request.json();
      
      if (!userId) {
        return NextResponse.json(
          { error: 'ID de usuário é obrigatório' },
          { status: 400 }
        );
      }
      
      // Confirmar pagamento de todos os números do usuário
      const result = await NumberStatusService.confirmAllUserReservations(
        rifaId,
        userId
      );
      
      // Retornar o resultado como JSON
      return NextResponse.json(result);
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      return NextResponse.json(
        { error: 'Falha ao confirmar pagamento', success: false },
        { status: 500 }
      );
    }
  }
} 