import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connect } from '@/server/config/database';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { BitMapService } from '@/services/BitMapService';
import Campaign from '@/models/Campaign';

/**
 * Endpoint para selecionar números aleatórios disponíveis usando Bitmap
 * 
 * POST /api/campaigns/random-numbers
 * 
 * @param {NextRequest} req - A requisição Next.js
 * @returns {NextResponse} - Resposta da API com os números selecionados
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
    const { campaignId, quantity = 1 } = data;
    
    if (!campaignId) {
      return NextResponse.json(
        { error: 'ID da campanha é obrigatório' },
        { status: 400 }
      );
    }
    
    if (typeof quantity !== 'number' || quantity < 1 || quantity > 1000) {
      return NextResponse.json(
        { error: 'Quantidade deve ser um número entre 1 e 1000' },
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
    
    // Verificar se a campanha está ativa
    if (campaign.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Campanha não está ativa' },
        { status: 400 }
      );
    }
    
    // Verificar se há números disponíveis suficientes
    const stats = await BitMapService.getAvailabilityStats(campaignId);
    
    if (stats.available < quantity) {
      return NextResponse.json(
        { 
          error: 'Não há números disponíveis suficientes',
          available: stats.available,
          requested: quantity
        },
        { status: 400 }
      );
    }
    
    // Registrar o início da operação
    const startTime = Date.now();
    
    // Selecionar números aleatórios disponíveis
    const numbers = await BitMapService.selectRandomNumbers(campaignId, quantity);
    
    // Calcular tempo de execução
    const executionTime = Date.now() - startTime;
    
    // Enviar resposta
    return NextResponse.json({
      success: true,
      numbers,
      stats: {
        available: stats.available,
        total: stats.total,
        percentAvailable: stats.percentAvailable,
        executionTimeMs: executionTime
      }
    });
  } catch (error: any) {
    console.error('Erro ao selecionar números aleatórios:', error);
    
    return NextResponse.json(
      { error: `Erro interno do servidor: ${error.message}` },
      { status: 500 }
    );
  }
} 