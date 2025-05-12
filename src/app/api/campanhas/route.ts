import { NextResponse } from 'next/server';
import { CampanhaController } from '@/server/controllers/CampanhaController';

/**
 * Endpoint GET: Listar todas as campanhas ativas
 */
export async function GET() {
  const result = await CampanhaController.listarCampanhasAtivas();
  
  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 500 }
    );
  }
  
  return NextResponse.json(result.data);
} 