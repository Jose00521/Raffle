import { NextRequest, NextResponse } from 'next/server';
/**
 * Endpoint GET: Obter detalhes de uma campanha específica por ID
 */


export async function POST( request: NextRequest,response: NextResponse) {
    try {
        // Envolva todo o código em try/catch
        const body = await request.json();
;

        return NextResponse.json({ message: 'Login realizado com sucesso' });

      } catch (error) {
        // Log detalhado do erro no servidor
        console.error("ERRO DETALHADO NA API:", error);
        return NextResponse.json({ message: 'Erro ao realizar login' }, { status: 500 });
      }
}