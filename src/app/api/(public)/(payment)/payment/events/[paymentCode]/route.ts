import { NextRequest } from 'next/server';
import Payment from '@/models/Payment';

//export const runtime = 'edge'; // Usar Edge Runtime para conexões de longa duração

export async function GET(
  request: NextRequest,
  { params }: { params: { paymentCode: string } }
) {
  console.log('Recebendo requisição para verificar status do pagamento');
  const { paymentCode } = await params;

  
  // Configurar headers para SSE
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start: async (controller) => {
      // Função para enviar eventos
      const sendEvent = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };
      
      // Verificar status inicial do pagamento
      let currentStatus: string | null = null;
      try {
        const payment = await Payment!.findOne({ paymentCode },'-_id')
        .populate('campaignId','-_id')
        .populate('userId', '-_id')
        .lean();
        
        if (!payment) {
          sendEvent({ type: 'error', message: 'Pagamento não encontrado' });
          controller.close();
          return;
        }
        
        currentStatus = payment.status;
        
        // Enviar status inicial
        sendEvent({ 
          type: 'status', 
          status: payment.status,
          message: 'Conexão estabelecida',
          paymentId: payment.paymentCode,
          campaignCode: (payment.campaignId as any)?.campaignCode,
          amount: payment.amount
        });
        
        // Se já estiver aprovado, enviar evento específico
        if (payment.status === 'APPROVED') {
          sendEvent({
            type: 'payment:approved',
            ...payment,
            campaignCode: (payment.campaignId as any)?.campaignCode,
            message: 'Pagamento já aprovado'
          });
        }
      } catch (error) {
        console.error('Erro ao verificar status inicial:', error);
        sendEvent({ type: 'error', message: 'Erro ao verificar status inicial' });
      }
      
      // Verificar periodicamente o status do pagamento
      const checkInterval = setInterval(async () => {
        try {
          console.log('Verificando status do pagamento');
          // Buscar status atual do pagamento (sempre verifica o banco)
          const updatedPayment = await Payment!.findOne({ paymentCode },'-_id')
          .populate('campaignId','-_id')
          .populate('userId', '-_id')
          .lean();
          
          if (!updatedPayment) {
            sendEvent({ type: 'error', message: 'Pagamento não encontrado' });
            clearInterval(checkInterval);
            clearInterval(heartbeatInterval);
            controller.close();
            return;
          }
          
          // Se o status mudou desde a última verificação, enviar evento
          if (updatedPayment.status !== currentStatus) {
            console.log(`[SSE] Status do pagamento ${paymentCode} mudou: ${currentStatus} -> ${updatedPayment.status}`);
            
            // Atualizar status atual
            currentStatus = updatedPayment.status;
            
            sendEvent({
              type: `payment:${updatedPayment.status.toLowerCase()}`,
              ...updatedPayment,
              paymentCode: updatedPayment.paymentCode || paymentCode,
              campaignCode: (updatedPayment.campaignId as any)?.campaignCode,
            });
            
            // Se o pagamento foi finalizado, encerrar a conexão
            if (['APPROVED', 'CANCELED', 'EXPIRED', 'FAILED'].includes(updatedPayment.status)) {
              console.log(`[SSE] Encerrando conexão para pagamento ${paymentCode} (status: ${updatedPayment.status})`);
              clearInterval(checkInterval);
              clearInterval(heartbeatInterval);
              controller.close();
            }
          }
        } catch (error) {
          console.error(`[SSE] Erro ao verificar pagamento ${paymentCode}:`, error);
          sendEvent({ type: 'error', message: 'Erro ao verificar pagamento' });
        }
      }, 3000); // Verificar a cada 3 segundos
      
      // Heartbeat para manter a conexão viva
      const heartbeatInterval = setInterval(() => {
        sendEvent({ type: 'heartbeat', timestamp: Date.now() });
      }, 30000); // A cada 30 segundos
      
      // Limpar intervalos quando a conexão for fechada
      request.signal.addEventListener('abort', () => {
        console.log(`[SSE] Conexão encerrada para pagamento ${paymentCode}`);
        clearInterval(checkInterval);
        clearInterval(heartbeatInterval);
      });
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive'
    }
  });
}