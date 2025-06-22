import 'reflect-metadata';
import { NextRequest, NextResponse } from 'next/server';
import { CampaignService } from '@/server/services/CampaignService';
import { ApiResponse, createErrorResponse } from '@/server/utils/errorHandler/api';
import { CampaignController } from '@/server/controllers/CampaignController';
import { container } from '@/server/container/container';
import { withAuth } from '@/lib/auth/apiAuthHelper';
import { Session } from 'next-auth';

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
export const GET = withAuth(async (request: NextRequest, { params, session }: { params: { id: string }, session: Session }) => {
  try {
    const campaignController = container.resolve(CampaignController);
    const result = await campaignController.listActiveCampaigns(session);

    return NextResponse.json(result, { status: result.statusCode || 200 });
  } catch (error) {
    console.error('Erro na API de listagem de campanhas:', error);
    return NextResponse.json(createErrorResponse('Erro ao buscar campanhas', 500), { status: 500 });
  }
}, { allowedRoles: ['creator'] });


  export const POST = withAuth(async (request: NextRequest, { params, session }: { params: { id: string }, session: Session }) => {
    try {
      const body = await request.formData();
  
      console.log("Body recebido:", body);
  
      // Validações básicas
      if (!body.get('campaign')) {
        return NextResponse.json({
          success: false,
          message: 'Dados da campanha são obrigatórios'
        }, { status: 400 });
      }
  
      console.log(`🎯 API: Recebida solicitação de criação de campanha: ${body.get('campaign')}`);
      
      if (body.get('instantPrizes')) {
        console.log(`📦 API: Recebidos prêmios instantâneos:`, body.get('instantPrizes'));
      }
  
      const campaign = JSON.parse(body.get('campaign') as string);
      const instantPrizes = JSON.parse(body.get('instantPrizes') as string);
      const coverImage = body.get('coverImage') as File;
      const images = body.getAll('images') as File[];
  
      // Resolver o controller
      const campaignController = container.resolve(CampaignController);
      
      // Criar a campanha usando nossa implementação atualizada
      const result = await campaignController.criarNovaCampanha(
        {
          ...campaign,coverImage,images
        },
        session,
        instantPrizes as InstantPrizesPayload
      );
  
      if (!result.success) {
        return NextResponse.json({
          success: false, 
          message: result.message || 'Erro ao criar campanha',
          errors: result.errors
        }, { status: result.statusCode || 500 });
      }
  
      console.log(`✅ API: Campanha criada com sucesso - ${result.data?._id}`);
  
      return NextResponse.json({
        success: true,
        data: result.data,
        message: result.message
      }, { status: result.statusCode || 201 });
  
    } catch (error) {
      console.error('Erro na API de criação de campanha:', error);
      
      return NextResponse.json({
        success: false,
        message: 'Erro interno do servidor ao criar campanha',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }, { status: 500 });
    }
  }, { allowedRoles: ['creator'] });
