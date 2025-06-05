import mongoose from 'mongoose';
import { injectable, inject } from 'tsyringe';
import type { IDBConnection } from '@/server/lib/dbConnect';
import { User } from '@/models/User';
import Prize from '@/models/Prize';
import { ICampaign } from '@/models/interfaces/ICampaignInterfaces';

// Interfaces para os dados processados
interface InstantPrizeData {
  type: 'money' | 'item';
  categoryId: string;
  quantity?: number;
  number?: string;
  numbers?: string[];
  value: number;
  prizeId?: string;
  name?: string;
  image?: string;
}

interface InstantPrizesPayload {
  prizes: InstantPrizeData[];
}

/**
 * 🎯 Serviço especializado no processamento de dados de campanhas
 * Responsabilidades:
 * - Conversão de Snowflake IDs para ObjectIds
 * - Geração de números aleatórios para prêmios
 * - Processamento de prêmios instantâneos
 */
@injectable()
export class CampaignDataProcessorService {
  constructor(@inject('db') private db: IDBConnection) {}

  // ========================================
  // 🔧 MÉTODOS PRIVADOS DE APOIO
  // ========================================

  /**
   * 🔐 Converte Snowflake IDs da campanha usando o serviço especializado
   */
   async convertCampaignSnowflakeIds(campaignData: ICampaign): Promise<ICampaign> {
    console.log(`🔐 [CampaignRepository] Convertendo Snowflake IDs da campanha...`);
    
    const campaignDataWithRealIds = { ...campaignData };
    
    // Converter criador
    if (campaignData.createdBy) {
      const createdByStr = String(campaignData.createdBy);
      campaignDataWithRealIds.createdBy = await this.convertUserSnowflakeToObjectId(createdByStr);
      console.log(`✅ [CampaignRepository] Criador convertido: ${createdByStr} -> ${campaignDataWithRealIds.createdBy}`);
    } else {
      throw new Error('createdBy é obrigatório para criar uma campanha');
    }
    
    // Converter prêmios principais
    if (campaignData.prizeDistribution?.length) {
      campaignDataWithRealIds.prizeDistribution = await this.convertMainPrizesDistribution(campaignData.prizeDistribution);
    }
    
    return campaignDataWithRealIds;
  }

  /**
   * 🔐 Converte Snowflake IDs dos prêmios principais
   */
   async convertMainPrizesDistribution(prizeDistribution: any[]): Promise<any[]> {
    console.log(`🏆 [CampaignRepository] Convertendo ${prizeDistribution.length} distribuições de prêmios principais...`);
    
    const convertedDistribution = [];
    
    for (let i = 0; i < prizeDistribution.length; i++) {
      const distribution = prizeDistribution[i];
      
      if (distribution.prizes?.length) {
        console.log(`🔍 [CampaignRepository] Convertendo ${distribution.prizes.length} prêmios da posição ${distribution.position}...`);
        
        const realPrizeIds = await this.convertPrizeSnowflakesToObjectIds(distribution.prizes as string[]);
        
        convertedDistribution.push({
          ...distribution,
          prizes: realPrizeIds as any[]
        });
        
        console.log(`✅ [CampaignRepository] Posição ${distribution.position}: ${distribution.prizes.length} prêmios convertidos`);
      } else {
        convertedDistribution.push(distribution);
      }
    }
    
    return convertedDistribution;
  }

  /**
   * 🔐 Converte Snowflake IDs dos prêmios instantâneos
   */
   async convertInstantPrizesSnowflakeIds(instantPrizesData?: InstantPrizesPayload): Promise<InstantPrizesPayload | undefined> {
    if (!instantPrizesData?.prizes?.length) {
      return undefined;
    }
    
    console.log(`🎁 [CampaignRepository] Convertendo prêmios instantâneos...`);
    
    const convertedPrizes: InstantPrizeData[] = [];
    
    for (const prize of instantPrizesData.prizes) {
      const convertedPrize = { ...prize };
      
      // Só converter prizeId se for um prêmio físico (type='item') e tiver prizeId
      if (prize.type === 'item' && prize.prizeId) {
        try {
          const realPrizeId = await this.convertSinglePrizeSnowflakeToObjectId(prize.prizeId);
          console.log(`🎁 [CampaignRepository] Prêmio instantâneo convertido: ${prize.prizeId} -> ${realPrizeId}`);
          
          convertedPrize.prizeId = String(realPrizeId);
        } catch (error) {
          console.error(`❌ [CampaignRepository] Erro ao converter prêmio instantâneo ${prize.prizeId}:`, error);
          throw error;
        }
      }
      
      convertedPrizes.push(convertedPrize);
    }
    
    console.log(`✅ [CampaignRepository] ${convertedPrizes.length} prêmios instantâneos processados`);
    
    return { prizes: convertedPrizes };
  }

  /**
   * 🎁 Processa dados de prêmios instantâneos usando o serviço especializado
   */
   processInstantPrizesData(instantPrizesData?: InstantPrizesPayload, totalNumbers?: number): InstantPrizeData[] {
    if (!instantPrizesData || !totalNumbers) {
      return [];
    }
    
    console.log('📦 [CampaignRepository] Processando prêmios instantâneos com IDs convertidos...');
    const instantPrizesConfig = this.processInstantPrizes(instantPrizesData, totalNumbers);
    console.log('🔄 [CampaignRepository] Prêmios processados:', instantPrizesConfig);
    
    return instantPrizesConfig;
  }

  /**
   * 🔐 Converte Snowflake ID do usuário para ObjectId real
   */
  async convertUserSnowflakeToObjectId(userSnowflakeId: string): Promise<mongoose.Types.ObjectId> {
    try {
      await this.db.connect();
      
      console.log(`🔍 [CampaignProcessor] Buscando usuário: ${userSnowflakeId}`);
      
      const user = await User.findOne({ userCode: userSnowflakeId })
        .select('_id')
        .lean() as { _id: mongoose.Types.ObjectId } | null;
      
      if (!user) {
        const error = `Usuário não encontrado: ${userSnowflakeId}`;
        console.error(`❌ [CampaignProcessor] ${error}`);
        throw new Error(error);
      }
      
      console.log(`✅ [CampaignProcessor] Usuário encontrado: ${userSnowflakeId} -> ${user._id}`);
      return user._id;
      
    } catch (error) {
      console.error(`❌ [CampaignProcessor] Erro ao buscar usuário ${userSnowflakeId}:`, error);
      throw error;
    }
  }

  /**
   * 🔐 Converte lista de Snowflake IDs de prêmios para ObjectIds reais
   */
  async convertPrizeSnowflakesToObjectIds(prizeSnowflakeIds: string[]): Promise<mongoose.Types.ObjectId[]> {
    if (!prizeSnowflakeIds?.length) {
      return [];
    }

    try {
      await this.db.connect();
      
      console.log(`🔍 [CampaignProcessor] Buscando ${prizeSnowflakeIds.length} prêmios`);
      
      const prizes = await Prize.find({ 
        prizeCode: { $in: prizeSnowflakeIds } 
      }).select('_id prizeCode').lean();
      
      this.validateAllPrizesFound(prizes, prizeSnowflakeIds);
      
      return this.maintainOriginalOrder(prizeSnowflakeIds, prizes);
      
    } catch (error) {
      console.error(`❌ [CampaignProcessor] Erro ao buscar prêmios:`, error);
      throw error;
    }
  }

  /**
   * 🔐 Converte um único Snowflake ID de prêmio para ObjectId real
   */
  async convertSinglePrizeSnowflakeToObjectId(prizeSnowflakeId: string): Promise<mongoose.Types.ObjectId> {
    try {
      await this.db.connect();
      
      console.log(`🔍 [CampaignProcessor] Buscando prêmio: ${prizeSnowflakeId}`);
      
      const prize = await Prize.findOne({ prizeCode: prizeSnowflakeId })
        .select('_id')
        .lean() as { _id: mongoose.Types.ObjectId } | null;
      
      if (!prize) {
        const error = `Prêmio não encontrado: ${prizeSnowflakeId}`;
        console.error(`❌ [CampaignProcessor] ${error}`);
        throw new Error(error);
      }
      
      console.log(`✅ [CampaignProcessor] Prêmio encontrado: ${prizeSnowflakeId} -> ${prize._id}`);
      return prize._id;
      
    } catch (error) {
      console.error(`❌ [CampaignProcessor] Erro ao buscar prêmio ${prizeSnowflakeId}:`, error);
      throw error;
    }
  }

  /**
   * 🎲 Gera números aleatórios únicos para prêmios instantâneos
   */
  generateRandomNumbers(totalNumbers: number, quantity: number, excludeNumbers: Set<string>): string[] {
    const numbers: string[] = [];
    const maxAttempts = quantity * 20;
    let attempts = 0;
    
    const availableCount = totalNumbers - excludeNumbers.size;
    const safeQuantity = this.calculateSafeQuantity(quantity, availableCount);
    
    console.log(`🎲 [CampaignProcessor] Gerando ${safeQuantity} números únicos de ${totalNumbers} disponíveis`);
    
    while (numbers.length < safeQuantity && attempts < maxAttempts) {
      const randomNumber = this.generateSingleRandomNumber(totalNumbers);
      
      if (this.isNumberAvailable(randomNumber, excludeNumbers, numbers)) {
        numbers.push(randomNumber);
        excludeNumbers.add(randomNumber);
        
        if (numbers.length % 100 === 0) {
          console.log(`🔢 [CampaignProcessor] Progresso: ${numbers.length}/${safeQuantity} números gerados`);
        }
      }
      
      attempts++;
    }
    
    this.logGenerationResult(numbers.length, quantity, attempts);
    return numbers;
  }

  /**
   * 🎁 Processa prêmios instantâneos do formato frontend para formato interno
   */
  processInstantPrizes(instantPrizesData: InstantPrizesPayload, totalNumbers: number): InstantPrizeData[] {
    if (!instantPrizesData?.prizes?.length) {
      console.log(`📦 [CampaignProcessor] Nenhum prêmio instantâneo para processar`);
      return [];
    }

    console.log(`🎯 [CampaignProcessor] Processando ${instantPrizesData.prizes.length} prêmios instantâneos`);
    
    const usedNumbers = new Set<string>();
    const prizeGroups = this.groupPrizesByTypeAndCategory(instantPrizesData.prizes);
    const result: InstantPrizeData[] = [];
    
    this.validateSpecificNumbers(instantPrizesData.prizes, totalNumbers, usedNumbers);
    
    prizeGroups.forEach((prizes, groupKey) => {
      const processedPrizes = this.processGroupByType(prizes, totalNumbers, usedNumbers);
      result.push(...processedPrizes);
    });
    
    this.validateFinalResult(result);
    this.logProcessingResult(result, totalNumbers);
    
    return result;
  }

  // ========================================
  // 🔧 MÉTODOS PRIVADOS DE APOIO
  // ========================================

  private validateAllPrizesFound(prizes: any[], requestedIds: string[]): void {
    if (prizes.length !== requestedIds.length) {
      const foundCodes = prizes.map(p => p.prizeCode);
      const missingCodes = requestedIds.filter(code => !foundCodes.includes(code));
      const error = `Prêmios não encontrados: ${missingCodes.join(', ')}`;
      console.error(`❌ [CampaignProcessor] ${error}`);
      throw new Error(error);
    }
  }

  private maintainOriginalOrder(originalIds: string[], prizes: any[]): mongoose.Types.ObjectId[] {
    const objectIds: mongoose.Types.ObjectId[] = [];
    
    for (const snowflakeId of originalIds) {
      const prize = prizes.find(p => p.prizeCode === snowflakeId);
      if (prize) {
        objectIds.push(prize._id as mongoose.Types.ObjectId);
        console.log(`✅ [CampaignProcessor] Prêmio mapeado: ${snowflakeId} -> ${prize._id}`);
      }
    }
    
    return objectIds;
  }

  private calculateSafeQuantity(requested: number, available: number): number {
    if (requested > available) {
      console.warn(`⚠️ [CampaignProcessor] Reduzindo quantidade: ${requested} -> ${available}`);
      return Math.max(0, available);
    }
    return requested;
  }

  private generateSingleRandomNumber(totalNumbers: number): string {
    const randomNum = Math.floor(Math.random() * totalNumbers);
    return randomNum.toString().padStart(6, '0');
  }

  private isNumberAvailable(number: string, excludeNumbers: Set<string>, currentNumbers: string[]): boolean {
    return !excludeNumbers.has(number) && !currentNumbers.includes(number);
  }

  private logGenerationResult(generated: number, requested: number, attempts: number): void {
    if (generated < requested) {
      console.warn(`⚠️ [CampaignProcessor] Gerados ${generated}/${requested} após ${attempts} tentativas`);
    } else {
      console.log(`✅ [CampaignProcessor] ${generated} números únicos gerados com sucesso`);
    }
  }

  private groupPrizesByTypeAndCategory(prizes: InstantPrizeData[]): Map<string, InstantPrizeData[]> {
    const groups = new Map<string, InstantPrizeData[]>();
    
    prizes.forEach(prize => {
      const groupKey = `${prize.categoryId}-${prize.type}`;
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(prize);
    });
    
    return groups;
  }

  private validateSpecificNumbers(prizes: InstantPrizeData[], totalNumbers: number, usedNumbers: Set<string>): void {
    const specificNumbers = new Set<string>();
    
    prizes.forEach(prize => {
      if (prize.type === 'item' && prize.number) {
        const formattedNumber = prize.number.padStart(6, '0');
        const numValue = parseInt(formattedNumber, 10);
        
        if (numValue >= totalNumbers) {
          throw new Error(`Número ${formattedNumber} fora do range válido (0-${totalNumbers-1})`);
        }
        
        if (specificNumbers.has(formattedNumber)) {
          throw new Error(`Número ${formattedNumber} duplicado nos prêmios físicos`);
        }
        
        specificNumbers.add(formattedNumber);
        usedNumbers.add(formattedNumber);
      }
    });
    
    console.log(`🔍 [CampaignProcessor] ${specificNumbers.size} números específicos validados`);
  }

  private processGroupByType(prizes: InstantPrizeData[], totalNumbers: number, usedNumbers: Set<string>): InstantPrizeData[] {
    const firstPrize = prizes[0];
    const result: InstantPrizeData[] = [];
    
    if (firstPrize.type === 'money') {
      result.push(...this.processMoneyPrizes(prizes, totalNumbers, usedNumbers));
    } else if (firstPrize.type === 'item') {
      result.push(...this.processItemPrizes(prizes, totalNumbers, usedNumbers));
    }
    
    return result;
  }

  private processMoneyPrizes(prizes: InstantPrizeData[], totalNumbers: number, usedNumbers: Set<string>): InstantPrizeData[] {
    const result: InstantPrizeData[] = [];
    
    prizes.forEach(prize => {
      if (prize.quantity && prize.quantity > 0) {
        console.log(`💰 [CampaignProcessor] Gerando ${prize.quantity} números para R$ ${prize.value}`);
        
        const numbers = this.generateRandomNumbers(totalNumbers, prize.quantity, usedNumbers);
        
        if (numbers.length > 0) {
          result.push({
            categoryId: prize.categoryId,
            type: 'money',
            numbers,
            value: prize.value
          });
        }
      }
    });
    
    return result;
  }

  private processItemPrizes(prizes: InstantPrizeData[], totalNumbers: number, usedNumbers: Set<string>): InstantPrizeData[] {
    const result: InstantPrizeData[] = [];
    
    prizes.forEach(prize => {
      const numbers = this.getItemPrizeNumbers(prize, totalNumbers, usedNumbers);
      
      if (numbers.length > 0) {
        result.push({
          categoryId: prize.categoryId,
          type: 'item',
          numbers,
          prizeId: prize.prizeId,
          value: prize.value
        });
        
        console.log(`🎁 [CampaignProcessor] Item ${prize.name || 'Sem nome'}: ${numbers[0]}`);
      }
    });
    
    return result;
  }

  private getItemPrizeNumbers(prize: InstantPrizeData, totalNumbers: number, usedNumbers: Set<string>): string[] {
    if (prize.number) {
      const formattedNumber = prize.number.padStart(6, '0');
      return usedNumbers.has(formattedNumber) ? [formattedNumber] : [];
    }
    
    console.log(`🎲 [CampaignProcessor] Gerando número aleatório para ${prize.name || 'item'}`);
    return this.generateRandomNumbers(totalNumbers, 1, usedNumbers);
  }

  private validateFinalResult(result: InstantPrizeData[]): void {
    const allNumbers = new Set<string>();
    let totalCount = 0;
    
    result.forEach(category => {
      category.numbers?.forEach(number => {
        totalCount++;
        if (allNumbers.has(number)) {
          throw new Error(`Número ${number} duplicado nos prêmios instantâneos`);
        }
        allNumbers.add(number);
      });
    });
    
    console.log(`🔍 [CampaignProcessor] Validação final: ${allNumbers.size} números únicos`);
  }

  private logProcessingResult(result: InstantPrizeData[], totalNumbers: number): void {
    const totalPrizeNumbers = result.reduce((sum, cat) => sum + (cat.numbers?.length || 0), 0);
    const percentage = ((totalPrizeNumbers / totalNumbers) * 100).toFixed(2);
    
    console.log(`✅ [CampaignProcessor] Processamento concluído:`);
    console.log(`   - ${result.length} categorias criadas`);
    console.log(`   - ${totalPrizeNumbers} números com prêmios`);
    console.log(`   - ${percentage}% dos números têm prêmios`);
  }
} 