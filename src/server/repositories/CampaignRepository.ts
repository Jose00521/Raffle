import type { IDBConnection } from '@/server/lib/dbConnect';
import { ICampaign } from '@/models/interfaces/ICampaignInterfaces';
import { IInstantPrize } from '@/models/interfaces/IInstantPrizeInterfaces';
import { NumberStatusEnum } from '@/models/interfaces/INumberStatusInterfaces';
import mongoose from 'mongoose';
import Campaign from '@/models/Campaign';
import NumberStatus from '@/models/NumberStatus';
import InstantPrize from '@/models/InstantPrize';

import { injectable, inject } from 'tsyringe';

// Interface atualizada para prêmios instantâneos no novo formato do frontend
interface InstantPrizeData {
  type: 'money' | 'item';
  categoryId: string;
  quantity?: number;      // Para money prizes
  number?: string;        // Para item prizes (número temporário)
  value: number;
  prizeId?: string;       // Para item prizes
  name?: string;          // Para item prizes
  image?: string;         // Para item prizes
}

// Interface para o formato de entrada do frontend
interface InstantPrizesPayload {
  prizes: InstantPrizeData[];
}

// Interface legada para compatibilidade (será removida gradualmente)
interface InstantPrizeConfig {
  category: string;
  numbers: string[];
  value: number;
}

export interface ICampaignRepository {
  buscarCampanhasAtivas(): Promise<ICampaign[]>;
  buscarCampanhaPorId(id: string): Promise<ICampaign | null>;
  criarNovaCampanha(campaignData: ICampaign, instantPrizesData?: InstantPrizesPayload): Promise<ICampaign>;
  contarNumeroPorStatus(rifaId: string): Promise<any[]>;
  buscarUltimosNumerosVendidos(rifaId: string, limite: number): Promise<any[]>;
}

@injectable()
export class CampaignRepository	implements ICampaignRepository  {
  private db: IDBConnection;

  constructor(@inject('db') db: IDBConnection) {
    this.db = db;
  }

  /**
   * Gera números aleatórios únicos para prêmios instantâneos
   * CORRIGIDO: Agora garante 100% que não haverá duplicatas
   */
  private generateRandomNumbers(totalNumbers: number, quantity: number, excludeNumbers: Set<string>): string[] {
    const numbers: string[] = [];
    const maxAttempts = quantity * 20; // Aumentar tentativas para evitar problemas
    let attempts = 0;
    
    // Verificar se é possível gerar a quantidade solicitada
    const availableNumbers = totalNumbers - excludeNumbers.size;
    if (quantity > availableNumbers) {
      console.warn(`⚠️ Impossível gerar ${quantity} números únicos. Disponíveis: ${availableNumbers}`);
      // Reduzir quantidade para o máximo possível
      quantity = Math.max(0, availableNumbers);
    }
    
    while (numbers.length < quantity && attempts < maxAttempts) {
      // Gerar número aleatório entre 0 e totalNumbers-1
      const randomNum = Math.floor(Math.random() * totalNumbers);
      const formattedNumber = randomNum.toString().padStart(6, '0');
      
      // 🔒 VERIFICAÇÃO DUPLA: Set + Array para garantir unicidade total
      if (!excludeNumbers.has(formattedNumber) && !numbers.includes(formattedNumber)) {
        numbers.push(formattedNumber);
        excludeNumbers.add(formattedNumber); // ✅ CORRIGIDO: Atualizar o Set passado por referência
        console.log(`🔢 Número gerado: ${formattedNumber} (tentativa ${attempts + 1})`);
      }
      
      attempts++;
    }
    
    if (numbers.length < quantity) {
      console.warn(`⚠️ Só foi possível gerar ${numbers.length} números únicos de ${quantity} solicitados após ${attempts} tentativas`);
    } else {
      console.log(`✅ Gerados ${numbers.length} números únicos com sucesso`);
    }
    
    return numbers;
  }

  /**
   * Processa os prêmios instantâneos do novo formato e gera números aleatórios
   * CORRIGIDO: Melhor controle de duplicatas e validação
   */
  private processInstantPrizes(instantPrizesData: InstantPrizesPayload, totalNumbers: number): InstantPrizeConfig[] {
    if (!instantPrizesData?.prizes || instantPrizesData.prizes.length === 0) {
      return [];
    }

    console.log(`🎯 Processando ${instantPrizesData.prizes.length} prêmios instantâneos`);
    
    const result: InstantPrizeConfig[] = [];
    const usedNumbers = new Set<string>(); // 🔒 Controle global de números usados
    
    // 🔍 VALIDAÇÃO PRÉVIA: Verificar números específicos de prêmios físicos
    const specificNumbers = new Set<string>();
    instantPrizesData.prizes.forEach(prize => {
      if (prize.type === 'item' && prize.number) {
        const formattedNumber = prize.number.padStart(6, '0');
        
        // Verificar se o número está dentro do range válido
        const numValue = parseInt(formattedNumber, 10);
        if (numValue >= totalNumbers) {
          console.warn(`⚠️ Número ${formattedNumber} está fora do range válido (0-${totalNumbers-1})`);
          return; // Pular este prêmio
        }
        
        // Verificar duplicata
        if (specificNumbers.has(formattedNumber)) {
          console.error(`❌ ERRO: Número ${formattedNumber} está duplicado nos prêmios físicos!`);
          throw new Error(`Número ${formattedNumber} está duplicado nos prêmios físicos`);
        }
        
        specificNumbers.add(formattedNumber);
        usedNumbers.add(formattedNumber); // Marcar como usado
      }
    });
    
    console.log(`🔍 Encontrados ${specificNumbers.size} números específicos para prêmios físicos`);
    
    // Agrupar prêmios por categoria e tipo
    const prizeGroups = new Map<string, InstantPrizeData[]>();
    
    instantPrizesData.prizes.forEach(prize => {
      const groupKey = `${prize.categoryId}-${prize.type}`;
      if (!prizeGroups.has(groupKey)) {
        prizeGroups.set(groupKey, []);
      }
      prizeGroups.get(groupKey)!.push(prize);
    });

    // Processar cada grupo
    prizeGroups.forEach((prizes, groupKey) => {
      const firstPrize = prizes[0];
      
      if (firstPrize.type === 'money') {
        // Para prêmios em dinheiro, agregar as quantidades
        prizes.forEach(prize => {
          if (prize.quantity && prize.quantity > 0) {
            console.log(`💰 Gerando ${prize.quantity} números para prêmios de R$ ${prize.value} (categoria: ${prize.categoryId})`);
            
            // 🔒 CORRIGIDO: Passar o Set por referência para manter consistência
            const numbers = this.generateRandomNumbers(totalNumbers, prize.quantity, usedNumbers);
            
            if (numbers.length > 0) {
              result.push({
                category: prize.categoryId,
                numbers,
                value: prize.value
              });
              
              console.log(`✅ Categoria ${prize.categoryId}: ${numbers.length} prêmios de R$ ${prize.value}`);
            }
          }
        });
        
      } else if (firstPrize.type === 'item') {
        // Para prêmios físicos, cada item é individual
        prizes.forEach(prize => {
          let numbers: string[] = [];
          
          if (prize.number) {
            const formattedNumber = prize.number.padStart(6, '0');
            
            // 🔒 VERIFICAÇÃO: Se o número já foi validado e marcado como usado
            if (usedNumbers.has(formattedNumber)) {
              numbers = [formattedNumber];
              console.log(`🎁 Usando número específico: ${formattedNumber} para item ${prize.name || 'Sem nome'}`);
            } else {
              console.error(`❌ Número ${formattedNumber} não foi devidamente validado!`);
            }
          } else {
            // Gerar um número aleatório
            console.log(`🎲 Gerando número aleatório para item ${prize.name || 'Sem nome'}`);
            numbers = this.generateRandomNumbers(totalNumbers, 1, usedNumbers);
          }
          
          if (numbers.length > 0) {
            result.push({
              category: prize.categoryId,
              numbers,
              value: prize.value
            });
            
            console.log(`🎁 Item ${prize.name || 'Sem nome'}: número ${numbers[0]} (R$ ${prize.value})`);
          } else {
            console.error(`❌ Falha ao obter número para item ${prize.name || 'Sem nome'}`);
          }
        });
      }
    });

    // 🔍 VALIDAÇÃO FINAL: Verificar se há duplicatas
    const allNumbers = new Set<string>();
    let totalPrizeNumbers = 0;
    
    result.forEach(category => {
      category.numbers.forEach(number => {
        totalPrizeNumbers++;
        if (allNumbers.has(number)) {
          console.error(`❌ ERRO CRÍTICO: Número ${number} está duplicado!`);
          throw new Error(`Número ${number} está duplicado nos prêmios instantâneos`);
        }
        allNumbers.add(number);
      });
    });

    console.log(`✅ Processamento concluído: ${result.length} categorias de prêmios criadas`);
    console.log(`🔢 Total de números únicos: ${allNumbers.size} de ${totalPrizeNumbers} esperados`);
    console.log(`📊 Porcentagem de números com prêmios: ${((allNumbers.size / totalNumbers) * 100).toFixed(2)}%`);
    
    return result;
  }

  /**
   * Busca todas as campanhas ativas
   */
   async buscarCampanhasAtivas(): Promise<ICampaign[]> {
    try {
      await this.db.connect();
      const campaigns = await Campaign.find({ status: 'ACTIVE' }).exec();

      const campaingStats = campaigns.map(campaign=>{
        return {
          ...campaign.toObject(),
        }
      })

      return campaigns;
    } catch (error) {
      console.error('Erro ao buscar campanhas ativas:', error);
      throw error;
    }
  }

    /**
   * Busca uma campanha específica por ID
   */
   async buscarCampanhaPorId(id: string): Promise<ICampaign | null> {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }
      
      await this.db.connect();
      const campaign: ICampaign | null = await Campaign.findById(id).lean() as ICampaign | null;
      return campaign;
    }

  /**
   * 🚀 MÉTODO ATUALIZADO: Criar campanha com novo formato de prêmios instantâneos
   */
  async criarNovaCampanha(
    campaignData: ICampaign, 
    instantPrizesData?: InstantPrizesPayload
  ): Promise<ICampaign> {
    const session = await mongoose.startSession();
    
    try {
      await this.db.connect();
      session.startTransaction();
      
      console.log(`🎯 Criando nova campanha: ${campaignData.title} (${campaignData.totalNumbers} números)`);
      
      // 1. Criar campanha
      const campaign = await Campaign.create([campaignData], { session });
      const campaignId = campaign[0]._id;
      const creatorId = campaignData.createdBy;
      
      console.log(`✅ Campanha criada com ID: ${campaignId}`);
      
      // 2. Processar prêmios instantâneos do novo formato
      let instantPrizesConfig: InstantPrizeConfig[] = [];
      
      if (instantPrizesData) {
        console.log('📦 Formato de entrada dos prêmios:', instantPrizesData);
        instantPrizesConfig = this.processInstantPrizes(instantPrizesData, campaignData.totalNumbers);
        console.log('🔄 Prêmios processados:', instantPrizesConfig);
      }
      
      // 3. 🚀 USAR NOSSA IMPLEMENTAÇÃO OTIMIZADA
      // Inicializar números, ranges, partições, prêmios instantâneos e estatísticas
      await NumberStatus!.initializeForRifa(
        String(campaignId),           // Converter ObjectId para string
        String(creatorId || ''),      // Converter ObjectId para string
        campaignData.totalNumbers,
        instantPrizesConfig,          // Usar o formato processado
        session                       // Usar a mesma transação
      );
      
      console.log(`✅ Inicialização completa: ranges, partições, prêmios e estatísticas criados`);
      
      // 4. Commit da transação
      await session.commitTransaction();
      
      // 5. Buscar campanha criada com prêmios instantâneos populados
      const campaignCompleta = await Campaign.findById(campaignId)
        .populate('createdBy', 'name email userCode')
        .lean();
      
      console.log(`🎉 Campanha ${campaignId} criada com sucesso!`);
      
      return campaignCompleta as unknown as ICampaign;
      
    } catch (error) {
      await session.abortTransaction();
      console.error('Erro ao criar nova campanha:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Conta o número de números por status para uma campanha
   */
   async contarNumeroPorStatus(rifaId: string) {
    await this.db.connect();
    
    return NumberStatus!.aggregate([
      { $match: { rifaId: new mongoose.Types.ObjectId(rifaId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { _id: 0, status: '$_id', count: 1 } }
    ]);
  }

  /**
   * Busca os últimos números vendidos de uma campanha
   */
   async buscarUltimosNumerosVendidos(rifaId: string, limite: number = 10) {
    this.db.connect();
    
    return NumberStatus!.find(
      { rifaId, status: NumberStatusEnum.PAID },
      { number: 1, paidAt: 1, userId: 1, _id: 0 }
    )
      .sort({ paidAt: -1 })
      .limit(limite)
      .populate('userId', 'name')
      .lean();
  }
} 