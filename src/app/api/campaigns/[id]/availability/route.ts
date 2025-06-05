import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/server/config/database';
import { BitMapService } from '@/services/BitMapService';
import Campaign from '@/models/Campaign';

/**
 * Endpoint para verificar disponibilidade de números em uma campanha
 * 
 * GET /api/campaigns/[id]/availability
 * 
 * @param {NextRequest} req - A requisição Next.js
 * @param {Object} params - Parâmetros da rota
 * @returns {NextResponse} - Resposta da API com estatísticas de disponibilidade
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Conectar ao banco de dados
    await connect();
    
    const campaignId = params.id;
    
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
    
    // Obter estatísticas de disponibilidade
    try {
      const stats = await BitMapService.getAvailabilityStats(campaignId);
      
      return NextResponse.json({
        success: true,
        campaignId,
        availability: {
          total: stats.total,
          available: stats.available,
          taken: stats.taken,
          percentAvailable: stats.percentAvailable.toFixed(2) + '%'
        }
      });
    } catch (error: any) {
      // Se ocorrer erro, pode ser porque o bitmap ainda não foi inicializado
      if (error.message.includes('não encontrado')) {
        return NextResponse.json({
          success: false,
          message: 'Bitmap não inicializado para esta campanha',
          campaignId,
          availability: {
            total: campaign.totalNumbers,
            available: campaign.totalNumbers,
            taken: 0,
            percentAvailable: '100.00%'
          },
          needsInitialization: true
        });
      }
      
      throw error;
    }
  } catch (error: any) {
    console.error('Erro ao verificar disponibilidade:', error);
    
    return NextResponse.json(
      { error: `Erro interno do servidor: ${error.message}` },
      { status: 500 }
    );
  }
}

/**
 * Endpoint para verificar disponibilidade de números específicos
 * 
 * POST /api/campaigns/[id]/availability
 * 
 * @param {NextRequest} req - A requisição Next.js
 * @param {Object} params - Parâmetros da rota
 * @returns {NextResponse} - Resposta da API com disponibilidade dos números
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Conectar ao banco de dados
    await connect();
    
    const campaignId = params.id;
    
    if (!campaignId) {
      return NextResponse.json(
        { error: 'ID da campanha é obrigatório' },
        { status: 400 }
      );
    }
    
    // Obter dados da requisição
    const data = await req.json();
    const { numbers } = data;
    
    if (!Array.isArray(numbers) || numbers.length === 0) {
      return NextResponse.json(
        { error: 'Array de números é obrigatório' },
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
    
    // Verificar disponibilidade de cada número
    const results = await Promise.all(
      numbers.map(async (number) => {
        try {
          const isAvailable = await BitMapService.isNumberAvailable(campaignId, number);
          return {
            number,
            available: isAvailable
          };
        } catch (error) {
          return {
            number,
            available: false,
            error: 'Erro ao verificar disponibilidade'
          };
        }
      })
    );
    
    // Calcular estatísticas dos resultados
    const totalRequested = numbers.length;
    const totalAvailable = results.filter(r => r.available).length;
    
    return NextResponse.json({
      success: true,
      campaignId,
      results,
      stats: {
        requested: totalRequested,
        available: totalAvailable,
        unavailable: totalRequested - totalAvailable,
        percentAvailable: ((totalAvailable / totalRequested) * 100).toFixed(2) + '%'
      }
    });
  } catch (error: any) {
    console.error('Erro ao verificar disponibilidade de números específicos:', error);
    
    return NextResponse.json(
      { error: `Erro interno do servidor: ${error.message}` },
      { status: 500 }
    );
  }
}