import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { CampaignController } from '@/server/controllers/CampaignController';
import { container } from '../../../../server/container/container';
/**
 * Endpoint GET: Obter detalhes de uma campanha específica por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const campaignController = container.resolve(CampaignController);
  const result = await campaignController.obterDetalhesCampanha(id);
  
  if (!result.success) {
    return NextResponse.json(result, { status: result.statusCode || 500 });
  }
  
  return NextResponse.json(result.data);
} 