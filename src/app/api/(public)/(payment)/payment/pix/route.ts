import { NextRequest, NextResponse } from "next/server";
import { GhostsPayService } from "@/server/services/gateways/ghostspay/GhostsPayService";
import { createErrorResponse , createSuccessResponse} from '@/server/utils/errorHandler/api';
import { container } from "@/server/container/container";
import { PaymentController } from "@/server/controllers/PaymentController";
import { IPaymentGhostErrorResponse, IPaymentGhostResponse, PaymentStatusEnum } from "@/models/interfaces/IPaymentInterfaces";
import { v4 as uuidv4 } from 'uuid';
import { unMaskUser } from "@/services/unMaskService";

export async function POST(request: NextRequest) {
    try {

      const bodyMasked = await request.json();

      const body = await unMaskUser(bodyMasked);

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

    
      if(response.ok){
        const updateResult = await paymentController.updatePixPaymentToPending({
          paymentCode: initialPayment.data?.paymentCode || '',
          gatewayResponse: data as IPaymentGhostResponse,
        });

        if(updateResult.success && updateResult.data){

          console.log('[PAYMENT_RESPONSE] Dados retornados:', {
            pixCode: updateResult.data.pixCode,
            pixQrCode: updateResult.data.pixQrCode,
            paymentCode: updateResult.data.paymentCode,
            expiresAt: updateResult.data.expiresAt
          });

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
        const error = data as IPaymentGhostErrorResponse;
        const errorResponse = NextResponse.json(createErrorResponse(error.issues?.[0].validation || error.message, response.status || 500));
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