import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { connect } from '@/server/config/database';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import NumberStatus from '@/models/NumberStatus';
import Campaign from '@/models/Campaign';
import { BitMapService } from '@/services/BitMapService';

/**
 * Endpoint para inicializar números de uma campanha usando Bitmap
 * 
 * POST /api/admin/campaigns/initialize-bitmap
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
    const { campaignId, instantPrizes = [] } = data;
    
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
    
    // Verificar se o usuário é o criador da campanha
    if (campaign.creatorId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Você não tem permissão para inicializar esta campanha' },
        { status: 403 }
      );
    }
    
    // Verificar se os números já foram inicializados
    const existingBitmap = await BitMapService.getAvailabilityStats(campaignId);
    if (existingBitmap && existingBitmap.total > 0) {
      return NextResponse.json(
        { 
          message: 'Os números desta campanha já foram inicializados',
          stats: existingBitmap
        },
        { status: 200 }
      );
    }
    
    // Iniciar uma sessão de transação
    const session_mongo = await mongoose.startSession();
    session_mongo.startTransaction();
    
    try {
      // Inicializar os números da campanha
      await NumberStatus!.initializeForRifa(
        campaignId,
        session.user.id,
        campaign.totalNumbers,
        instantPrizes,
        session_mongo
      );
      
      // Atualizar o status da campanha
      await Campaign.findByIdAndUpdate(
        campaignId,
        { 
          $set: { 
            isInitialized: true,
            status: 'ACTIVE'
          } 
        },
        { session: session_mongo }
      );
      
      // Commit da transação
      await session_mongo.commitTransaction();
      
      // Obter estatísticas atualizadas
      const stats = await BitMapService.getAvailabilityStats(campaignId);
      
      return NextResponse.json({
        success: true,
        message: 'Números inicializados com sucesso',
        campaignId,
        stats
      });
    } catch (error: any) {
      // Rollback em caso de erro
      await session_mongo.abortTransaction();
      
      return NextResponse.json(
        { error: `Erro ao inicializar números: ${error.message}` },
        { status: 500 }
      );
    } finally {
      // Finalizar a sessão
      session_mongo.endSession();
    }
  } catch (error: any) {
    console.error('Erro no endpoint de inicialização de números:', error);
    
    return NextResponse.json(
      { error: `Erro interno do servidor: ${error.message}` },
      { status: 500 }
    );
  }
} 