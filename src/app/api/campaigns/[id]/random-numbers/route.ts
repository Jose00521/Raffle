import { NextRequest, NextResponse } from 'next/server';
import { OptimizedRandomSelector } from '@/services/OptimizedRandomSelector';
import NumberStatus from '@/models/NumberStatus';
import { DBConnection } from '@/server/lib/dbConnect';

/**
 * GET /api/campaigns/[id]/random-numbers
 * Endpoint para seleção aleatória otimizada de números (SEM RESERVA)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dbConnection = new DBConnection();
    await dbConnection.connect();
    
    const { searchParams } = new URL(request.url);
    const count = parseInt(searchParams.get('count') || '10');
    
    const campaignId = params.id;
    
    // Validações
    if (!campaignId) {
      return NextResponse.json({
        success: false,
        message: 'ID da campanha é obrigatório'
      }, { status: 400 });
    }
    
    if (count < 1 || count > 100) {
      return NextResponse.json({
        success: false,
        message: 'Quantidade deve estar entre 1 e 100'
      }, { status: 400 });
    }
    
    console.log(`🎯 Solicitação de seleção aleatória: ${count} números para campanha ${campaignId}`);
    
    // Usar o OptimizedRandomSelector (SEM RESERVA)
    const result = await OptimizedRandomSelector.getRandomAvailableNumbers(
      campaignId, 
      count
    );
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: result.message || 'Erro na seleção de números'
      }, { status: 500 });
    }
    
    // Resposta simples com números selecionados (sem reserva)
    return NextResponse.json({
      success: true,
      data: {
        numbers: result.numbers,
        count: result.numbers.length,
        strategy: result.strategy,
        executionTime: result.executionTime,
        message: result.message
      },
      meta: {
        campaignId,
        requestedCount: count,
        timestamp: new Date().toISOString(),
        note: "Números selecionados mas NÃO reservados. Validação final será no pagamento."
      }
    });
    
  } catch (error) {
    console.error('Erro no endpoint de seleção aleatória:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

/**
 * POST /api/campaigns/[id]/random-numbers/purchase
 * Endpoint para COMPRA AUTOMÁTICA - usuário informa apenas quantidade
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dbConnection = new DBConnection();
    await dbConnection.connect();
    
    const body = await request.json();
    const { count, userId, paymentData } = body;
    
    const campaignId = params.id;
    
    // Validações
    if (!campaignId || !userId || !count) {
      return NextResponse.json({
        success: false,
        message: 'campaignId, userId e count são obrigatórios'
      }, { status: 400 });
    }
    
    if (count < 1 || count > 100) {
      return NextResponse.json({
        success: false,
        message: 'Quantidade deve estar entre 1 e 100'
      }, { status: 400 });
    }
    
    console.log(`💰 Compra automática: ${count} números para usuário ${userId}`);
    
    // 1. ENCONTRAR números disponíveis automaticamente
    const selectionResult = await OptimizedRandomSelector.getRandomAvailableNumbers(
      campaignId, 
      count
    );
    
    if (!selectionResult.success || selectionResult.numbers.length === 0) {
      return NextResponse.json({
        success: false,
        message: `Não foi possível encontrar ${count} números disponíveis`,
        availableCount: selectionResult.numbers.length,
        strategy: selectionResult.strategy
      }, { status: 404 });
    }
    
    // 2. Se não conseguiu a quantidade total, informar quantos estão disponíveis
    if (selectionResult.numbers.length < count) {
      return NextResponse.json({
        success: false,
        message: `Apenas ${selectionResult.numbers.length} números disponíveis de ${count} solicitados`,
        availableCount: selectionResult.numbers.length,
        suggestion: `Tente comprar ${selectionResult.numbers.length} números ou menos`
      }, { status: 409 });
    }
    
    // 3. TODOS OS NÚMEROS ENCONTRADOS - Processar compra direta
    try {
      // Marcar números como VENDIDOS (pular fase de reserva)
      const soldDocs = await NumberStatus!.processDirectPurchase(
        campaignId,
        selectionResult.numbers,
        userId,
        paymentData
      );
      
      console.log(`✅ Compra automática concluída: ${soldDocs.purchased.length} números vendidos`);
      
      return NextResponse.json({
        success: true,
        data: {
          purchasedNumbers: soldDocs.purchased.map((doc: any) => parseInt(doc.number)),
          count: soldDocs.purchased.length,
          totalValue: soldDocs.purchased.length * (paymentData?.pricePerNumber || 0),
          instantPrizes: soldDocs.instantPrizes || [],
          selectionStrategy: selectionResult.strategy,
          selectionTime: selectionResult.executionTime,
          transaction: {
            userId,
            purchasedAt: new Date(),
            paymentData
          }
        },
        meta: {
          campaignId,
          requestedCount: count,
          actualCount: soldDocs.purchased.length,
          timestamp: new Date().toISOString(),
          strategy: 'AutomaticPurchase'
        }
      });
      
    } catch (purchaseError) {
      console.error('Erro na compra automática:', purchaseError);
      
      // Se falhou, pode ser race condition - números foram vendidos durante seleção
      return NextResponse.json({
        success: false,
        message: 'Erro no processamento da compra. Números podem ter sido vendidos para outros usuários durante a seleção.',
        error: purchaseError instanceof Error ? purchaseError.message : 'Erro na compra',
        suggestion: 'Tente novamente - sistema encontrará novos números disponíveis'
      }, { status: 409 });
    }
    
  } catch (error) {
    console.error('Erro no endpoint de compra automática:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
} 