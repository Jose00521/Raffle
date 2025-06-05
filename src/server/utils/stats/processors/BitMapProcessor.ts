import { BitMapService } from '@/services/BitMapService';
import { PaymentEvent } from '../interfaces/PaymentEvent';

/**
 * Processador que lida com a atualização do bitmap após eventos de pagamento
 * Substituindo o RangePartitionProcessor com um processador Bitmap
 */
export class BitMapProcessor {
  /**
   * Processa eventos de pagamento e atualiza o bitmap correspondente
   * @param events Lista de eventos de pagamento
   * @returns Promise<void>
   */
  async processPaymentEvents(events: PaymentEvent[]): Promise<void> {
    try {
      // Agrupar números por campanha para processamento em lote
      const numbersByCampaign: Record<string, number[]> = {};
      
      // Organizar todos os números vendidos agrupados por campanha
      for (const event of events) {
        const campaignId = event.campaignId.toString();
        
        if (!numbersByCampaign[campaignId]) {
          numbersByCampaign[campaignId] = [];
        }
        
        // Obter números deste evento (pode estar em event.numbers ou ser derivado de outras propriedades)
        const numbers = event.numbers || [];
        if (numbers.length > 0) {
          // Converter strings para números
          const numericNumbers = numbers.map(num => 
            typeof num === 'string' ? parseInt(num, 10) : num
          );
          numbersByCampaign[campaignId].push(...numericNumbers);
        }
      }
      
      // Processar cada campanha em paralelo
      await Promise.all(
        Object.entries(numbersByCampaign).map(async ([campaignId, numbers]) => {
          if (numbers.length > 0) {
            console.log(`🔄 Atualizando bitmap para campanha ${campaignId}: ${numbers.length} números`);
            try {
              await BitMapService.markNumbersAsTaken(campaignId, numbers);
            } catch (error) {
              console.error(`Erro ao atualizar bitmap para campanha ${campaignId}:`, error);
              // Não lançar erro para evitar falha na atualização de estatísticas
            }
          }
        })
      );
    } catch (error) {
      console.error('Erro ao atualizar bitmaps para eventos de pagamento:', error);
      // Não lançar erro para evitar falha na atualização de estatísticas
    }
  }
} 