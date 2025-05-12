import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { CampanhaController } from '@/server/controllers/CampanhaController';

/**
 * Endpoint GET: Obter detalhes de uma campanha específica por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const result = await CampanhaController.obterDetalhesCampanha(id);
  
  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: result.statusCode || 500 }
    );
  }
  
  return NextResponse.json(result.data);
} 