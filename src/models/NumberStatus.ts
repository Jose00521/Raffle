import mongoose from 'mongoose';
import { INumberStatus, NumberStatusEnum } from './interfaces/INumberStatusInterfaces';
import NumberRange from './NumberRange';
import { CampaignStatsHistory } from './CampaignStatsHistory';
import InstantPrize from './InstantPrize';

// Verificar se estamos no servidor
const isServer = typeof window === 'undefined';

// Interface para prêmios instantâneos categorizados
interface InstantPrizeConfig {
  category: string;
  numbers: string[];
  value: number;
}

// Só criar o schema se estiver no servidor
const NumberStatusSchema = isServer ? new mongoose.Schema<INumberStatus>(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
      index: true
    },
    number: {
      type: String,  // Alterado para String para manter formato padronizado
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: [NumberStatusEnum.RESERVED, NumberStatusEnum.PAID], // Apenas status não-disponíveis
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    reservedAt: Date,
    paidAt: Date,
    expiresAt: Date,
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  },
  {
    timestamps: true,
    collection:'numbers_status'
  }
) : null;

// Interface para o modelo com métodos estáticos
interface NumberStatusModel extends mongoose.Model<INumberStatus> {
  initializeForRifa(rifaId: string, creatorId: string, totalNumbers: number, instantPrizes: InstantPrizeConfig[], session: mongoose.ClientSession | null): Promise<void>;
  confirmPayment(rifaId: string, numbers: string[], userId: string): Promise<any>;
  isNumberAvailable(rifaId: string, number: number | string): Promise<boolean>;
  reserveNumbers(rifaId: string, numbers: Array<number | string>, userId: string, expirationMinutes?: number): Promise<INumberStatus[]>;
  releaseReservedNumbers(rifaId: string, numbers: Array<number | string>, userId: string): Promise<any>;
  updateCampaignStats(rifaId: string, creatorId: string, updates: { available?: number, reserved?: number, paid?: number, revenue?: number }): Promise<any>;
}

// Adicionar os índices e métodos estáticos apenas se estiver no servidor
if (isServer && NumberStatusSchema) {
  // Índice composto para consultas rápidas por rifa e status
  NumberStatusSchema.index({ campaignId: 1, status: 1 });

  // Índice composto para consultas por número específico em uma rifa
  NumberStatusSchema.index({ campaignId: 1, number: 1 }, { unique: true });

  // TTL index para expirar reservas automaticamente
  NumberStatusSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  
  // Índices adicionais para otimização
  
  // Para busca rápida de números por usuário (histórico de compras)
  NumberStatusSchema.index({ userId: 1, campaignId: 1 });
  
  // Para busca de números reservados que expirarão em breve (monitoramento)
  NumberStatusSchema.index({ status: 1, expiresAt: 1 });
  
  // Para verificação rápida da disponibilidade de intervalos de números
  NumberStatusSchema.index({ campaignId: 1, status: 1, number: 1 });
  
  // Para ordenar números por data de reserva/pagamento
  NumberStatusSchema.index({ campaignId: 1, status: 1, reservedAt: -1 });
  NumberStatusSchema.index({ campaignId: 1, status: 1, paidAt: -1 });
  
  // Para estatísticas de números por usuário
  NumberStatusSchema.index({ userId: 1, status: 1 });

  /**
   * Método para atualizar estatísticas da campanha
   */
  NumberStatusSchema.statics.updateCampaignStats = async function(
    rifaId: string,
    creatorId: string,
    updates: { available?: number, reserved?: number, paid?: number, revenue?: number }
  ) {
    try {
      // Buscar ou criar snapshot de estatísticas para hoje
      const campaignDoc = await mongoose.model('Campaign').findById(rifaId).lean();
      
      if (!campaignDoc) {
        throw new Error(`Campanha ${rifaId} não encontrada`);
      }
      
      // Garantir que estamos tratando um objeto e não um array
      const campaign = campaignDoc as any;
      
      const status = campaign.status || 'ACTIVE';
      const totalNumbers = campaign.totalNumbers || 0;
      
      // Obter ou criar o snapshot de hoje
      let snapshot = await CampaignStatsHistory.getOrCreateTodaySnapshot(
        rifaId, 
        creatorId, 
        status,
        totalNumbers
      );
      
      // Preparar atualizações
      const updateObj: any = {
        lastUpdated: new Date()
      };
      
      // Atualizar valores específicos se fornecidos
      if (updates.available !== undefined) {
        updateObj.availableNumbers = updates.available;
      }
      
      if (updates.reserved !== undefined) {
        updateObj.reservedNumbers = updates.reserved;
      }
      
      if (updates.paid !== undefined) {
        updateObj.soldNumbers = updates.paid;
        
        // Atualizar incrementais apenas se houver venda
        if (updates.paid > snapshot.soldNumbers) {
          const soldIncrement = updates.paid - snapshot.soldNumbers;
          updateObj.periodNumbersSold = (snapshot.periodNumbersSold || 0) + soldIncrement;
        }
      }
      
      // Atualizar receita se fornecida
      if (updates.revenue !== undefined) {
        updateObj.totalRevenue = updates.revenue;
        
        // Atualizar receita do período se houve aumento
        if (updates.revenue > snapshot.totalRevenue) {
          const revenueIncrement = updates.revenue - snapshot.totalRevenue;
          updateObj.periodRevenue = (snapshot.periodRevenue || 0) + revenueIncrement;
        }
      }
      
      // Calcular percentual de conclusão
      if (totalNumbers > 0) {
        const soldNumbers = updates.paid !== undefined ? updates.paid : snapshot.soldNumbers;
        updateObj.percentComplete = Math.round((soldNumbers / totalNumbers) * 100);
      }
      
      // Atualizar estatísticas
      await CampaignStatsHistory.updateOne(
        { campaignId: rifaId, dateKey: snapshot.dateKey },
        { $set: updateObj }
      );
      
      return true;
    } catch (error) {
      console.error(`Erro ao atualizar estatísticas da campanha ${rifaId}:`, error);
      throw error;
    }
  };

  /**
   * Método estático OTIMIZADO para inicializar rifa usando ranges
   */
  NumberStatusSchema.statics.initializeForRifa = async function(
    rifaId: string, 
    creatorId: string,
    totalNumbers: number, 
    instantPrizes: InstantPrizeConfig[] = [], 
    session: mongoose.ClientSession | null = null
  ): Promise<void> {
    console.log(`Inicializando rifa ${rifaId} com abordagem de ranges (${totalNumbers} números)`);
    
    try {
      // Usar transação se fornecida ou criar uma nova
      const useTransaction = !!session;
      const sessionToUse = session || await mongoose.startSession();
      
      if (!useTransaction) {
        sessionToUse.startTransaction();
      }
      
      try {
        // Extrair todos os números de prêmios instantâneos
        const allInstantPrizeNumbers: string[] = [];
        instantPrizes.forEach(prize => {
          prize.numbers.forEach(num => {
            allInstantPrizeNumbers.push(num);
          });
        });
        
        // Verificar se há números duplicados entre categorias
        const uniqueNumbers = new Set(allInstantPrizeNumbers);
        if (uniqueNumbers.size !== allInstantPrizeNumbers.length) {
          throw new Error('Existem números duplicados entre as diferentes categorias de prêmios instantâneos');
        }
        
        // 1. Criar o range principal de números disponíveis
        await NumberRange!.initializeForRifa(rifaId, totalNumbers, allInstantPrizeNumbers);
        
        // 2. Inicializar/atualizar estatísticas da campanha
        const availableCount = totalNumbers; // Todos os números estão disponíveis para algum propósito (regular ou prêmio instantâneo)
        
        // Usar cast para acessar o método no modelo
        const thisModel = this as NumberStatusModel;
        await thisModel.updateCampaignStats(rifaId, creatorId, {
          available: availableCount,
          reserved: 0,
          paid: 0,
          revenue: 0
        });
        
        // 3. Registrar os prêmios instantâneos
        if (instantPrizes.length > 0) {
          console.log(`Registrando prêmios instantâneos para ${allInstantPrizeNumbers.length} números em ${instantPrizes.length} categorias`);
          
          // Processar cada categoria de prêmio
          for (const prize of instantPrizes) {
            console.log(`Processando categoria ${prize.category} com ${prize.numbers.length} números`);
            
            // Processar em lotes para evitar sobrecarga de memória
            const BATCH_SIZE = 1000;
            for (let i = 0; i < prize.numbers.length; i += BATCH_SIZE) {
              const batch = prize.numbers.slice(i, i + BATCH_SIZE);
              
              // Criar documentos para prêmios instantâneos
              const prizeDocsToInsert = batch.map(number => ({
                campaignId: rifaId,
                categoryId: prize.category,
                number,
                value: prize.value,
                winner: null,
                claimed: false,
                claimedAt: null
              }));
              
              if (prizeDocsToInsert.length > 0) {
                // Usar bulkWrite com updateOne para garantir upsert
                const bulkOps = prizeDocsToInsert.map(doc => ({
                  updateOne: {
                    filter: { campaignId: doc.campaignId, number: doc.number },
                    update: { $set: doc },
                    upsert: true
                  }
                }));
                
                await InstantPrize.bulkWrite(bulkOps, { session: sessionToUse });
              }
            }
          }
        }
        
        // Finalizar a transação se foi iniciada aqui
        if (!useTransaction) {
          await sessionToUse.commitTransaction();
        }
        
        console.log(`Rifa ${rifaId} inicializada com sucesso usando ranges`);
      } catch (error) {
        // Reverter transação se foi iniciada aqui
        if (!useTransaction) {
          await sessionToUse.abortTransaction();
        }
        throw error;
      } finally {
        // Finalizar sessão se foi iniciada aqui
        if (!useTransaction) {
          sessionToUse.endSession();
        }
      }
    } catch (error) {
      console.error(`Erro ao inicializar rifa ${rifaId} com ranges:`, error);
      throw error;
    }
  };
  
  /**
   * Método para verificar se um número está disponível
   */
  NumberStatusSchema.statics.isNumberAvailable = async function(
    rifaId: string,
    number: number | string
  ): Promise<boolean> {
    // Normalizar o número para string
    const numValue = typeof number === 'string' ? parseInt(number, 10) : number;
    const numStr = typeof number === 'string' ? number : numValue.toString();
    
    // 1. Verificar se existe documento individual para este número (reservado/vendido)
    const individualDoc = await this.findOne({
      campaignId: rifaId,
      number: numStr
    }).lean();
    
    // Se existe documento individual de reserva/venda, o número não está disponível
    if (individualDoc) {
      return false;
    }
    
    // 2. Verificar se é um número de prêmio instantâneo
    // (Esses números estão "disponíveis" para compra, mas têm um comportamento especial)
    const instantPrize = await InstantPrize.findOne({
      campaignId: rifaId,
      number: numStr
    }).lean();
    
    // 3. Se não for um número de reserva/venda nem de prêmio instantâneo,
    // verificar se está em algum range disponível
    if (!instantPrize) {
      const isInRange = await NumberRange!.isNumberInRange(rifaId, numValue);
      return isInRange;
    }
    
    // Se for um número de prêmio instantâneo, está disponível para compra
    return true;
  };

  /**
   * Método para reservar números
   */
  NumberStatusSchema.statics.reserveNumbers = async function(
    rifaId: string,
    numbers: Array<number | string>,
    userId: string,
    expirationMinutes: number = 15
  ): Promise<INumberStatus[]> {
    // Iniciar uma transação
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + expirationMinutes);
      
      // Formatar os números para consistência
      const formattedNumbers = numbers.map(num => {
        if (typeof num === 'number') {
          return num.toString();
        }
        return num;
      });
      
      // Verificar se todos os números estão disponíveis
      for (const num of formattedNumbers) {
        // Chamada segura com validação de tipo
        const thisModel = this as NumberStatusModel;
        const isAvailable = await thisModel.isNumberAvailable(rifaId, num);
        if (!isAvailable) {
          throw new Error(`Número ${num} não está disponível`);
        }
      }
      
      // Preparar documentos para inserção
      const docsToInsert = formattedNumbers.map(num => ({
        campaignId: rifaId,
        number: num,
        status: NumberStatusEnum.RESERVED,
        userId,
        reservedAt: new Date(),
        expiresAt,
        paidAt: null
      }));
      
      // Inserir documentos de reserva
      const reservedDocs = await this.insertMany(docsToInsert, { session });
      
      // Buscar campanha para obter o criador
      const campaignDoc = await mongoose.model('Campaign').findById(rifaId, 'creatorId').lean();
      
      if (!campaignDoc) {
        throw new Error('Campanha não encontrada');
      }
      
      // Converter para objeto simples
      const campaign = campaignDoc as any;
      
      // Buscar estatísticas atuais
      const stats = await CampaignStatsHistory.getLatestSnapshot(rifaId);
      if (stats) {
        // Atualizar estatísticas
        const thisModel = this as NumberStatusModel;
        await thisModel.updateCampaignStats(
          rifaId,
          campaign.creatorId,
          {
            available: stats.availableNumbers - formattedNumbers.length,
            reserved: stats.reservedNumbers + formattedNumbers.length
          }
        );
      }
      
      // Commit da transação
      await session.commitTransaction();
      
      return reservedDocs;
    } catch (error) {
      // Rollback em caso de erro
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  };

  /**
   * Método para liberar números reservados
   */
  NumberStatusSchema.statics.releaseReservedNumbers = async function(
    rifaId: string,
    numbers: Array<number | string>,
    userId: string
  ) {
    // Formatar os números para consistência
    const formattedNumbers = numbers.map(num => {
      if (typeof num === 'number') {
        return num.toString();
      }
      return num;
    });
    
    // Iniciar uma transação
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Buscar os documentos que serão removidos para contar
      const docsToRelease = await this.find({
        campaignId: rifaId,
        number: { $in: formattedNumbers },
        userId,
        status: NumberStatusEnum.RESERVED
      }).session(session);
      
      const releasedCount = docsToRelease.length;
      
      // Remover as reservas
      await this.deleteMany({
        campaignId: rifaId,
        number: { $in: formattedNumbers },
        userId,
        status: NumberStatusEnum.RESERVED
      }).session(session);
      
      // Buscar campanha para obter o criador
      const campaignDoc = await mongoose.model('Campaign').findById(rifaId, 'creatorId').lean();
      
      if (!campaignDoc) {
        throw new Error('Campanha não encontrada');
      }
      
      // Converter para objeto simples
      const campaign = campaignDoc as any;
      
      // Atualizar estatísticas se algum número foi liberado
      if (releasedCount > 0) {
        // Buscar estatísticas atuais
        const stats = await CampaignStatsHistory.getLatestSnapshot(rifaId);
        if (stats) {
          // Atualizar estatísticas
          const thisModel = this as NumberStatusModel;
          await thisModel.updateCampaignStats(
            rifaId,
            campaign.creatorId,
            {
              available: stats.availableNumbers + releasedCount,
              reserved: stats.reservedNumbers - releasedCount
            }
          );
        }
      }
      
      // Commit da transação
      await session.commitTransaction();
      
      return { released: releasedCount };
    } catch (error) {
      // Rollback em caso de erro
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  };

  /**
   * Método estático para confirmar pagamento de números
   */
  NumberStatusSchema.statics.confirmPayment = async function(
    rifaId: string,
    numbers: string[],
    userId: string
  ) {
    // Iniciar uma transação
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Contar quantos números serão afetados
      const docsToUpdate = await this.find({
        campaignId: rifaId,
        number: { $in: numbers },
        userId,
        status: NumberStatusEnum.RESERVED
      }).session(session);
      
      const updatedCount = docsToUpdate.length;
      
      // Atualizar os documentos
      await this.updateMany(
        { 
          campaignId: rifaId, 
          number: { $in: numbers },
          userId,
          status: NumberStatusEnum.RESERVED
        },
        {
          $set: {
            status: NumberStatusEnum.PAID,
            paidAt: new Date(),
            expiresAt: null // Remove a expiração
          }
        },
        { session }
      );
      
      // Buscar campanha para obter o criador e preço dos números
      const campaignDoc = await mongoose.model('Campaign').findById(rifaId, 'creatorId pricePerNumber').lean();
      
      if (!campaignDoc) {
        throw new Error('Campanha não encontrada');
      }
      
      // Converter para objeto simples
      const campaign = campaignDoc as any;
      
      // Atualizar estatísticas se algum número foi pago
      if (updatedCount > 0) {
        // Calcular receita gerada
        const revenue = updatedCount * (campaign.pricePerNumber || 0);
        
        // Buscar estatísticas atuais
        const stats = await CampaignStatsHistory.getLatestSnapshot(rifaId);
        if (stats) {
          // Calcular nova receita total
          const newTotalRevenue = stats.totalRevenue + revenue;
          
          // Atualizar estatísticas
          const thisModel = this as NumberStatusModel;
          await thisModel.updateCampaignStats(
            rifaId,
            campaign.creatorId,
            {
              reserved: stats.reservedNumbers - updatedCount,
              paid: stats.soldNumbers + updatedCount,
              revenue: newTotalRevenue
            }
          );
        }
        
        // Verificar se algum número ganhou prêmio instantâneo
        const instantPrizes = await InstantPrize.find({
          campaignId: rifaId,
          number: { $in: numbers },
          claimed: false
        }).session(session);
        
        // Se houver prêmios instantâneos, atualizá-los
        if (instantPrizes.length > 0) {
          const prizeNumbers = instantPrizes.map(prize => prize.number);
          
          // Atualizar prêmios instantâneos
          await InstantPrize.updateMany(
            {
              campaignId: rifaId,
              number: { $in: prizeNumbers }
            },
            {
              $set: {
                winner: userId,
                claimed: true,
                claimedAt: new Date()
              }
            },
            { session }
          );
          
          // Adicionar metadados aos documentos de números
          await this.updateMany(
            {
              campaignId: rifaId,
              number: { $in: prizeNumbers },
              userId
            },
            {
              $set: {
                'metadata.instantPrize': true,
                'metadata.prizeDetails': instantPrizes.map(prize => ({
                  category: prize.categoryId,
                  value: prize.value
                }))
              }
            },
            { session }
          );
        }
      }
      
      // Commit da transação
      await session.commitTransaction();
      
      return { 
        updated: updatedCount,
        instantPrizes: await InstantPrize.find({
          campaignId: rifaId,
          number: { $in: numbers },
          winner: userId
        }).lean()
      };
    } catch (error) {
      // Rollback em caso de erro
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  };
}

// Verificar se o modelo já foi compilado para evitar erros em desenvolvimento
const NumberStatus = isServer 
  ? ((mongoose.models.NumberStatus as unknown as NumberStatusModel) || 
    mongoose.model<INumberStatus, NumberStatusModel>('NumberStatus', NumberStatusSchema as any))
  : null;

export default NumberStatus; 