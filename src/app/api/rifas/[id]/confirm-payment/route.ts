import { NextRequest, NextResponse } from 'next/server';
import NumberStatusUtils from '../../../../../server/utils/numberStatusUtils';
import dbConnect from '../../../../../lib/dbConnect';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Conectar ao banco de dados
    await dbConnect();
    
    const rifaId = params.id;
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ID de usuário é obrigatório' },
        { status: 400 }
      );
    }
    
    // Confirmar pagamento de todos os números reservados pelo usuário
    const result = await NumberStatusUtils.confirmAllUserReservations(
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