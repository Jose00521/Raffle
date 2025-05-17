import { NextResponse } from 'next/server';
import { CampaignController } from '@/server/controllers/CampaignController';

/**
 * Endpoint GET: Listar todas as campanhas ativas
 */
export async function GET() {
  const result = await CampaignController.listarCampanhasAtivas();
  
  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 500 }
    );
  }
  
  return NextResponse.json(result.data);
} 