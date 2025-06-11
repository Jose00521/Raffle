import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/server/config/database';
import { BitMapService } from '@/services/BitMapService';
import Campaign from '@/models/Campaign';
import NumberStatus from '@/models/NumberStatus';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/(auth)/auth/[...nextauth]/route';

/**
 * Endpoint para verificar e garantir que uma campanha tenha seu bitmap inicializado
 * 
 * POST /api/campaigns/ensure-bitmap
 * 
 * @param {NextRequest} req - A requisição Next.js
 * @returns {NextResponse} - Resposta da API
 */
export async function POST(req: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }
    
    // Conectar ao banco de dados
    await connect();
    
    // Obter dados da requisição
    const data = await req.json();
    const { campaignId } = data;
    
    if (!campaignId) {
      return NextResponse.json(
        { error: 'ID da campanha é obrigatório' },
        { status: 400 }
      );
    }
    
    // Verificar se a campanha existe
    const campaign = await Campaign.findById(campaignId);
    
    if (!campaign) {
      return NextResponse.json(
        { error: 'Campanha não encontrada' },
        { status: 404 }
      );
    }
    
    // Verificar se o bitmap já existe
    try {
      const stats = await BitMapService.getAvailabilityStats(campaignId);
      
      return NextResponse.json({
        success: true,
        message: 'Bitmap já inicializado',
        campaignId,
        stats
      });
    } catch (error: any) {
      // Se o bitmap não existe, inicializar
      if (error.message.includes('não encontrado')) {
        // Inicializar o bitmap
        await BitMapService.initialize(campaignId, campaign.totalNumbers);
        
        // Obter estatísticas
        const stats = await BitMapService.getAvailabilityStats(campaignId);
        
        // Atualizar status da campanha
        await Campaign.findByIdAndUpdate(
          campaignId,
          { 
            $set: { 
              isInitialized: true
            } 
          }
        );
        
        return NextResponse.json({
          success: true,
          message: 'Bitmap inicializado com sucesso',
          campaignId,
          stats
        });
      }
      
      // Se for outro erro, relançar
      return NextResponse.json(
        { error: `Erro ao verificar bitmap: ${error.message}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Erro no endpoint de inicialização de bitmap:', error);
    
    return NextResponse.json(
      { error: `Erro interno do servidor: ${error.message}` },
      { status: 500 }
    );
  }
} 