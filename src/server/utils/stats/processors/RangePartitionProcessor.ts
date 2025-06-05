import { PaymentEvent } from '../interfaces/PaymentEvent';
import RangePartition from '@/models/RangePartition';
import logger from '../../../../lib/logger/logger';

/**
 * Processador responsável por atualizar as estatísticas das partições
 * quando vendas são detectadas pelo Change Stream
 */
export class RangePartitionProcessor {
  
  /**
   * Processa eventos de pagamento para atualizar partições
   */
  public async processPaymentEvents(events: PaymentEvent[]): Promise<void> {
    if (!events.length) return;
    
    try {
      // Agrupar eventos por campanha
      const eventsByCampaign = this.groupEventsByCampaign(events);
      
      // Processar cada campanha
      for (const [campaignId, campaignEvents] of eventsByCampaign) {
        await this.updateCampaignPartitions(campaignId, campaignEvents);
      }
      
    } catch (error) {
      logger.error('Erro no RangePartitionProcessor:', error);
      throw error;
    }
  }
  
  /**
   * Agrupa eventos por campanha
   */
  private groupEventsByCampaign(events: PaymentEvent[]): Map<string, PaymentEvent[]> {
    const grouped = new Map<string, PaymentEvent[]>();
    
    for (const event of events) {
      const campaignId = event.campaignId.toString();
      
      if (!grouped.has(campaignId)) {
        grouped.set(campaignId, []);
      }
      
      grouped.get(campaignId)!.push(event);
    }
    
    return grouped;
  }
  
  /**
   * Atualiza partições de uma campanha específica
   */
  private async updateCampaignPartitions(
    campaignId: string, 
    events: PaymentEvent[]
  ): Promise<void> {
    try {
      // Verificar se a campanha tem partições
      if (!await this.campaignHasPartitions(campaignId)) {
        return; // Campanha não usa RangePartition
      }
      
      // Coletar todos os números afetados
      const affectedNumbers: number[] = [];
      
      for (const event of events) {
        if (event.numbers && event.numbers.length > 0) {
          // Converter números para inteiros
          const numbers = event.numbers.map(num => {
            return typeof num === 'string' ? parseInt(num) : num;
          });
          
          affectedNumbers.push(...numbers);
        }
      }
      
      if (affectedNumbers.length === 0) {
        return;
      }
      
      logger.info(`🔄 Atualizando partições para campanha ${campaignId}: ${affectedNumbers.length} números`);
      
      // Atualizar estatísticas das partições
      await RangePartition?.updatePartitionStats(campaignId, affectedNumbers);
      
      logger.info(`✅ Partições atualizadas para campanha ${campaignId}`);
      
    } catch (error) {
      logger.error(`Erro ao atualizar partições da campanha ${campaignId}:`, error);
      // Não re-throw para não quebrar o batch completo
    }
  }
  
  /**
   * Verifica se uma campanha usa RangePartition
   */
  private async campaignHasPartitions(campaignId: string): Promise<boolean> {
    try {
      if (!RangePartition) return false;
      
      const partitionCount = await RangePartition.countDocuments({ 
        campaignId: campaignId 
      });
      
      return partitionCount > 0;
      
    } catch (error) {
      logger.error(`Erro ao verificar partições da campanha ${campaignId}:`, error);
      return false;
    }
  }
  
  /**
   * Recalcula todas as partições de uma campanha (para sincronização)
   */
  public async recalculateAllPartitions(campaignId: string): Promise<void> {
    try {
      if (!await this.campaignHasPartitions(campaignId)) {
        return;
      }
      
      logger.info(`🔄 Recalculando todas as partições da campanha ${campaignId}`);
      
      const partitions = await RangePartition!.find({ 
        campaignId 
      }, { partitionId: 1 });
      
      for (const partition of partitions) {
        await RangePartition!.recalculatePartitionStats(
          campaignId, 
          partition.partitionId
        );
      }
      
      logger.info(`✅ Todas as partições recalculadas para campanha ${campaignId}`);
      
    } catch (error) {
      logger.error(`Erro ao recalcular partições da campanha ${campaignId}:`, error);
      throw error;
    }
  }
} 