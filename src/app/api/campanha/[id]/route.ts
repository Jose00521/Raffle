import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { CampaignController } from '@/server/controllers/CampaignController';

/**
 * Endpoint GET: Obter detalhes de uma campanha específica por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const result = await CampaignController.obterDetalhesCampanha(id);
  
  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: result.statusCode || 500 }
    );
  }
  
  return NextResponse.json(result.data);
} 