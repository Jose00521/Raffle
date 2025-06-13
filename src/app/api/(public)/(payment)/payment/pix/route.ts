import { NextRequest, NextResponse } from "next/server";
import { GhostsPayService } from "@/server/services/gateways/ghostspay/GhostsPayService";
import { createErrorResponse , createSuccessResponse} from '@/server/utils/errorHandler/api';
import { container } from "@/server/container/container";
import { PaymentController } from "@/server/controllers/PaymentController";
import { PaymentStatusEnum } from "@/models/interfaces/IPaymentInterfaces";
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
    try {

      const body = await request.json();

      console.log('body payment pix', body);

              // 🔑 Extrai chave de idempotência do header (padrão da indústria)
              const idempotencyKey = request.headers.get('Idempotency-Key') || 
              request.headers.get('idempotency-key') ||
              body.idempotencyKey ||
              uuidv4();

      const paymentController = container.resolve(PaymentController);

      
      const initialPayment = await paymentController.createInitialPixPaymentAttempt({
        gateway: 'ghostspay',
        body,
        idempotencyKey
      });

    
      const {response, data} = await GhostsPayService().createPixPayment({
        ...body,
        paymentCode: initialPayment.data?.paymentCode || '',
      });

      console.log('data from ghostspay', data);
      console.log('response from ghostspay', response);
    
      if(response.ok){
        const updateResult = await paymentController.updatePixPaymentToPending({
          paymentCode: initialPayment.data?.paymentCode || '',
          gatewayResponse: data,
        });

        if(updateResult.success && updateResult.data){

          // 🔑 Cria resposta com header de idempotência
          const response = NextResponse.json(createSuccessResponse({
            ...updateResult.data,
          }, 'Pagamento criado com sucesso', 200));
          
          // 🎯 Adiciona header de idempotência na resposta (padrão da indústria)
          response.headers.set('Idempotency-Key', idempotencyKey);
          
          return response;

        } else {
          // Erro CRÍTICO: O PIX foi gerado no gateway, mas falhamos em salvar no nosso banco.
          // Isso precisa ser logado para análise manual.
          const errorResponse = NextResponse.json(createErrorResponse(updateResult.message || 'Falha ao gravar os dados do pagamento.', 500));
          errorResponse.headers.set('Idempotency-Key', idempotencyKey);
          return errorResponse;
        }

      } else {
        // A chamada ao gateway falhou. Atualizamos nosso registro para refletir isso.
        await paymentController.updatePixPaymentToFailed({
          paymentCode: initialPayment.data?.paymentCode || '',
          gatewayResponse: {
            status: PaymentStatusEnum.FAILED,
          }, // Passa a resposta de erro do gateway para ser logada
        });

        // Retorna o erro do gateway para o cliente.
        const errorMessage = (data as any)?.message || 'Erro na comunicação com o gateway';
        const errorResponse = NextResponse.json(createErrorResponse(errorMessage, response.status || 500));
        errorResponse.headers.set('Idempotency-Key', idempotencyKey);
        return errorResponse;
      }
    
    } catch (error: any) {
      console.error("Erro inesperado no endpoint de pagamento:", error);
      const errorResponse = NextResponse.json(createErrorResponse(error.message || 'Erro interno no servidor.', 500));
      // 🔑 Tenta adicionar idempotencyKey se disponível
      const idempotencyKey = request.headers.get('Idempotency-Key') || 
                            request.headers.get('idempotency-key');
      if (idempotencyKey) {
        errorResponse.headers.set('Idempotency-Key', idempotencyKey);
      }
      return errorResponse;
    }

}