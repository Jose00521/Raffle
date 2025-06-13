import { NextRequest, NextResponse } from 'next/server';
import { CampaignController } from '@/server/controllers/CampaignController';
import { container } from '@/server/container/container';
import { createErrorResponse } from '@/server/utils/errorHandler/api';

// Interface atualizada para prêmios instantâneos no novo formato do frontend
interface InstantPrizeData {
  type: 'money' | 'item';
  categoryId: string;
  quantity?: number;      // Para money prizes
  number?: string;        // Para item prizes (número temporário)
  value: number;
  prizeId?: string;       // Para item prizes
}

// Interface para o formato de entrada do frontend
interface InstantPrizesPayload {
  prizes: InstantPrizeData[];
}

/**
 * 📊 Endpoint GET: Listar campanhas ativas
 */
export async function GET() {
  try {
    const campaignController = container.resolve(CampaignController);
    const result = await campaignController.listarCampanhasAtivas();

    return NextResponse.json(result, { status: result.statusCode || 200 });
  } catch (error) {
    console.error('Erro na API de listagem de campanhas:', error);
    return NextResponse.json(createErrorResponse('Erro ao buscar campanhas', 500), { status: 500 });
  }
}

