import RangePartition from '@/models/RangePartition';
import NumberStatus from '@/models/NumberStatus';
import { CampaignStatsHistory } from '@/models/CampaignStatsHistory';

/**
 * Serviço otimizado para seleção aleatória de números em rifas
 * Usa RangePartition para performance máxima com milhões de números
 */
export class OptimizedRandomSelector {
  
  /**
   * Método principal: Seleção aleatória inteligente
   * Escolhe automaticamente a melhor estratégia baseada no tamanho da rifa
   */
  static async getRandomAvailableNumbers(
    campaignId: string, 
    count: number
  ): Promise<{
    success: boolean;
    numbers: number[];
    strategy: string;
    executionTime: number;
    message?: string;
  }> {
    const startTime = Date.now();
    
    try {
      // Verificar estatísticas da campanha para escolher estratégia
      const stats = await this.getCampaignAvailabilityStats(campaignId);
      
      console.log(`📊 Estatísticas da campanha ${campaignId}:`, {
        totalNumbers: stats.totalNumbers,
        availableNumbers: stats.availableNumbers,
        availabilityRate: stats.availabilityRate
      });
      
      let selectedNumbers: number[] = [];
      let strategy = '';
      
      // Decidir estratégia baseada no tamanho e disponibilidade
      if (stats.totalNumbers >= 100000 && await this.hasPartitions(campaignId)) {
        // Estratégia 1: RangePartition (para rifas grandes com partições)
        console.log('🚀 Usando estratégia RangePartition (otimizada)');
        selectedNumbers = await this.usePartitionStrategy(campaignId, count);
        strategy = 'RangePartition';
        
      } else if (stats.availabilityRate > 0.5) {
        // Estratégia 2: Amostragem simples (alta disponibilidade)
        console.log('🎯 Usando estratégia de amostragem simples (alta disponibilidade)');
        selectedNumbers = await this.useSamplingStrategy(campaignId, count, stats);
        strategy = 'Sampling';
        
      } else if (stats.availabilityRate > 0.1) {
        // Estratégia 3: Busca inteligente (média disponibilidade)
        console.log('🔍 Usando estratégia de busca inteligente (média disponibilidade)');
        selectedNumbers = await this.useIntelligentSearch(campaignId, count, stats);
        strategy = 'IntelligentSearch';
        
      } else {
        // Estratégia 4: Pré-seleção (baixa disponibilidade)
        console.log('📋 Usando estratégia de pré-seleção (baixa disponibilidade)');
        selectedNumbers = await this.usePreSelectionStrategy(campaignId, count);
        strategy = 'PreSelection';
      }
      
      const executionTime = Date.now() - startTime;
      
      return {
        success: true,
        numbers: selectedNumbers,
        strategy,
        executionTime,
        message: `Selecionados ${selectedNumbers.length} números usando ${strategy} em ${executionTime}ms`
      };
      
    } catch (error) {
      console.error('Erro na seleção aleatória:', error);
      const executionTime = Date.now() - startTime;
      
      return {
        success: false,
        numbers: [],
        strategy: 'Error',
        executionTime,
        message: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      };
    }
  }
  
  /**
   * Estratégia 1: RangePartition - Ultra otimizada para rifas gigantes
   */
  private static async usePartitionStrategy(
    campaignId: string, 
    count: number
  ): Promise<number[]> {
    return await RangePartition!.getRandomAvailableNumbers(campaignId, count);
  }
  
  /**
   * Estratégia 2: Amostragem simples - Para alta disponibilidade
   */
  private static async useSamplingStrategy(
    campaignId: string, 
    count: number, 
    stats: any
  ): Promise<number[]> {
    const maxAttempts = count * 3; // Buffer limitado para alta disponibilidade
    const selectedNumbers = new Set<number>();
    
    for (let attempts = 0; attempts < maxAttempts && selectedNumbers.size < count; attempts++) {
      const randomNum = Math.floor(Math.random() * stats.totalNumbers);
      
      // Verificação rápida
      const isAvailable = await NumberStatus!.isNumberAvailable(campaignId, randomNum);
      if (isAvailable) {
        selectedNumbers.add(randomNum);
      }
    }
    
    return Array.from(selectedNumbers);
  }
  
  /**
   * Estratégia 3: Busca inteligente - Para média disponibilidade
   */
  private static async useIntelligentSearch(
    campaignId: string, 
    count: number, 
    stats: any
  ): Promise<number[]> {
    // Gerar candidatos em lotes e verificar em batch
    const batchSize = 100;
    const selectedNumbers: number[] = [];
    
    while (selectedNumbers.length < count) {
      // Gerar lote de candidatos
      const candidates = [];
      for (let i = 0; i < batchSize; i++) {
        candidates.push(Math.floor(Math.random() * stats.totalNumbers));
      }
      
      // Verificar disponibilidade em batch
      const occupiedNumbers = await NumberStatus!.find({
        campaignId,
        number: { $in: candidates.map(n => n.toString().padStart(6, '0')) }
      }, { number: 1 }).lean();
      
      const occupiedSet = new Set(occupiedNumbers.map(doc => parseInt(doc.number)));
      
      // Adicionar números disponíveis
      for (const candidate of candidates) {
        if (!occupiedSet.has(candidate) && selectedNumbers.length < count) {
          if (!selectedNumbers.includes(candidate)) {
            selectedNumbers.push(candidate);
          }
        }
      }
      
      // Evitar loop infinito
      if (selectedNumbers.length === 0 && occupiedSet.size === candidates.length) {
        break;
      }
    }
    
    return selectedNumbers;
  }
  
  /**
   * Estratégia 4: Pré-seleção - Para baixa disponibilidade
   */
  private static async usePreSelectionStrategy(
    campaignId: string, 
    count: number
  ): Promise<number[]> {
    // Buscar números disponíveis diretamente do range e excluir ocupados
    const range = await this.getCampaignRange(campaignId);
    if (!range) return [];
    
    // Buscar todos os números ocupados
    const occupiedNumbers = await NumberStatus!.find(
      { campaignId }, 
      { number: 1 }
    ).lean();
    
    const occupiedSet = new Set(occupiedNumbers.map(doc => parseInt(doc.number)));
    
    // Gerar lista de disponíveis e embaralhar
    const available: number[] = [];
    for (let i = range.startNumber; i <= range.endNumber; i++) {
      if (!occupiedSet.has(i) && !range.instantPrizeNumbers?.includes(i.toString())) {
        available.push(i);
      }
    }
    
    // Embaralhar e retornar
    for (let i = available.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [available[i], available[j]] = [available[j], available[i]];
    }
    
    return available.slice(0, count);
  }
  
  /**
   * Métodos auxiliares
   */
  private static async getCampaignAvailabilityStats(campaignId: string) {
    const snapshot = await CampaignStatsHistory.getLatestSnapshot(campaignId);
    
    if (snapshot) {
      return {
        totalNumbers: snapshot.totalNumbers,
        availableNumbers: snapshot.availableNumbers,
        availabilityRate: snapshot.availableNumbers / snapshot.totalNumbers
      };
    }
    
    // Fallback: calcular na hora
    const range = await this.getCampaignRange(campaignId);
    const occupiedCount = await NumberStatus!.countDocuments({ campaignId });
    
    const totalNumbers = range ? (range.endNumber - range.startNumber + 1) : 0;
    const availableNumbers = totalNumbers - occupiedCount;
    
    return {
      totalNumbers,
      availableNumbers,
      availabilityRate: totalNumbers > 0 ? availableNumbers / totalNumbers : 0
    };
  }
  
  private static async hasPartitions(campaignId: string): Promise<boolean> {
    if (!RangePartition) return false;
    
    const partitionCount = await RangePartition.countDocuments({ campaignId });
    return partitionCount > 0;
  }
  
  private static async getCampaignRange(campaignId: string) {
    const NumberRange = (await import('@/models/NumberRange')).default;
    if (!NumberRange) return null;
    
    return await NumberRange.findOne({ campaignId }).lean();
  }
  
  /**
   * Método para atualizar estatísticas das partições após reservas/vendas
   */
  static async updatePartitionStatsAfterReservation(
    campaignId: string, 
    numbers: number[]
  ): Promise<void> {
    if (!RangePartition || !numbers.length) return;
    
    try {
      await RangePartition.updatePartitionStats(campaignId, numbers);
      console.log(`✅ Estatísticas das partições atualizadas para ${numbers.length} números`);
    } catch (error) {
      console.error('Erro ao atualizar estatísticas das partições:', error);
    }
  }
  
  /**
   * Método para recalcular todas as partições de uma campanha
   */
  static async recalculateAllPartitions(campaignId: string): Promise<void> {
    if (!RangePartition) return;
    
    try {
      const partitions = await RangePartition.find({ campaignId }, { partitionId: 1 });
      
      console.log(`🔄 Recalculando ${partitions.length} partições para campanha ${campaignId}`);
      
      for (const partition of partitions) {
        await RangePartition.recalculatePartitionStats(campaignId, partition.partitionId);
      }
      
      console.log(`✅ Todas as partições recalculadas para campanha ${campaignId}`);
    } catch (error) {
      console.error('Erro ao recalcular partições:', error);
    }
  }
} 