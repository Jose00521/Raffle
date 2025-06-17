import { NextRequest, NextResponse } from 'next/server';
import { activateCampaigns } from '@/server/cron/jobs/activateCampaigns';

export async function GET(request: NextRequest) {
  // Verificar se é uma requisição do Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('[Vercel Cron] Executando ativação de campanhas...');
    await activateCampaigns();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Campanhas ativadas com sucesso',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Vercel Cron] Erro ao ativar campanhas:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
} 