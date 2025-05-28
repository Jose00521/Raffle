import { NextResponse } from 'next/server';
import { CampaignController } from '@/server/controllers/CampaignController';
import { container } from '@/server/container/container';

/**
 * Endpoint GET: Listar todas as campanhas ativas
 */
export async function GET() {
  const campaignController = container.resolve(CampaignController);
  const result = await campaignController.listarCampanhasAtivas();
  
  if (!result.success) {
    return NextResponse.json(
      { errors: result.errors },
      { status: 500 }
    );
  }
  
  return NextResponse.json(result.data);
} 