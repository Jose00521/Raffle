import { NextRequest, NextResponse } from "next/server";
import { GhostsPayService } from "@/server/services/gateways/ghostspay/GhostsPayService";
import { createErrorResponse , createSuccessResponse} from '@/server/utils/errorHandler/api';
import { container } from "@/server/container/container";
import { PaymentController } from "@/server/controllers/PaymentController";
import { PaymentStatusEnum } from "@/models/interfaces/IPaymentInterfaces";

export async function POST(request: NextRequest) {
    try {

      const body = await request.json();

      const paymentController = container.resolve(PaymentController);

      
      const initialPayment = await paymentController.createInitialPixPaymentAttempt({
        gateway: 'ghostspay',
        body,
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


          return NextResponse.json(createSuccessResponse({
            ...updateResult.data
          }, 'Pagamento criado com sucesso', 200));

        } else {
          // Erro CRÍTICO: O PIX foi gerado no gateway, mas falhamos em salvar no nosso banco.
          // Isso precisa ser logado para análise manual.
          return NextResponse.json(createErrorResponse(updateResult.message || 'Falha ao gravar os dados do pagamento.', 500));
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
        return NextResponse.json(createErrorResponse(errorMessage, response.status || 500));
      }
    
    } catch (error: any) {
      console.error("Erro inesperado no endpoint de pagamento:", error);
      return NextResponse.json(createErrorResponse(error.message || 'Erro interno no servidor.', 500));
    }

}