import { IPaymentPattern } from "@/models/interfaces/IPaymentInterfaces";
import { v4 as uuidv4 } from 'uuid';

const paymentAPIClient = {
    createPixPayment: async (data: IPaymentPattern) => {
        // 🔑 Gera chave de idempotência única para esta tentativa
        const idempotencyKey = data.idempotencyKey || uuidv4();

        console.log(`[PAYMENT_CLIENT] Criando pagamento PIX. Idempotency-Key: ${idempotencyKey}`);

        try {
            const response = await fetch('/api/payment/pix', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Idempotency-Key': idempotencyKey // 🎯 Header padrão da indústria
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            // 🔍 Captura header de idempotência da resposta
            const responseIdempotencyKey = response.headers.get('Idempotency-Key');
            
            // Log da resposta com a chave de idempotência
            console.log(`[PAYMENT_CLIENT] Resposta recebida. Key: ${idempotencyKey}`, {
                success: result.success,
                status: response.status,
                requestKey: idempotencyKey,
                responseKey: responseIdempotencyKey,
                keysMatch: idempotencyKey === responseIdempotencyKey
            });

            // 🎯 Adiciona a chave da resposta no resultado para debug
            if (result.success && responseIdempotencyKey) {
                result.idempotencyKey = responseIdempotencyKey;
            }

            return result;

        } catch (error) {
            console.error(`[PAYMENT_CLIENT] Erro no pagamento. Key: ${idempotencyKey}`, error);
            throw error;
        }
    },

    // 🔄 Método para retry com mesma chave (casos específicos)
    retryPixPayment: async (data: IPaymentPattern, existingIdempotencyKey: string) => {
        console.log(`[PAYMENT_CLIENT] Tentando novamente com chave existente: ${existingIdempotencyKey}`);

        try {
        const response = await fetch('/api/payment/pix', {
            method: 'POST',
            headers: {
                    'Content-Type': 'application/json',
                    'Idempotency-Key': existingIdempotencyKey // 🔄 Reutiliza chave
            },
            body: JSON.stringify(data),
        });

            const result = await response.json();
            
            // 🔍 Verifica se a chave retornou corretamente
            const responseIdempotencyKey = response.headers.get('Idempotency-Key');
            console.log(`[PAYMENT_CLIENT] Retry - Key: ${existingIdempotencyKey}, Response Key: ${responseIdempotencyKey}`);
            
            return result;

        } catch (error) {
            console.error(`[PAYMENT_CLIENT] Erro no retry. Key: ${existingIdempotencyKey}`, error);
            throw error;
    }
}
};

export default paymentAPIClient;
