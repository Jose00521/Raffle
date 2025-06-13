import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { CampaignController } from '@/server/controllers/CampaignController';
import { container } from '../../../../../server/container/container';
import { createErrorResponse } from '@/server/utils/errorHandler/api';
/**
 * Endpoint GET: Obter detalhes de uma campanha específica por ID
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {

  const { id } = await params;

  try {
      const campaignController = container.resolve(CampaignController);
      const campaign = await campaignController.getCampaignByIdPublic(id);
      return NextResponse.json(campaign);
  } catch (error) {
      return NextResponse.json(createErrorResponse('Erro ao buscar campanha por ID:', 500), { status: 500 });
  }
}