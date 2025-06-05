import mongoose from 'mongoose';
import { NumberStatusEnum } from './interfaces/INumberStatusInterfaces';
import NumberStatus from './NumberStatus';

// Interface para o modelo de partição de range
export interface IRangePartition {
  campaignId: mongoose.Types.ObjectId | string;
  partitionId: number;
  startNumber: number;
  endNumber: number;
  totalNumbers: number;
  availableNumbers: number;
  reservedNumbers: number;
  soldNumbers: number;
  availabilityDensity: number; // availableNumbers / totalNumbers
  lastUpdated: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Verificar se estamos no servidor
const isServer = typeof window === 'undefined';

// Só criar o schema se estiver no servidor
const RangePartitionSchema = isServer ? new mongoose.Schema<IRangePartition>(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
      index: true
    },
    partitionId: {
      type: Number,
      required: true,
      index: true
    },
    startNumber: {
      type: Number,
      required: true,
      index: true
    },
    endNumber: {
      type: Number,
      required: true,
      index: true
    },
    totalNumbers: {
      type: Number,
      required: true,
      default: function() {
        return this.endNumber - this.startNumber + 1;
      }
    },
    availableNumbers: {
      type: Number,
      required: true,
      default: function() {
        return this.totalNumbers;
      }
    },
    reservedNumbers: {
      type: Number,
      required: true,
      default: 0
    },
    soldNumbers: {
      type: Number,
      required: true,
      default: 0
    },
    availabilityDensity: {
      type: Number,
      required: true,
      default: 1.0,
      min: 0,
      max: 1
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
      required: true
    }
  },
  {
    timestamps: true,
    collection: 'range_partitions'
  }
) : null;

// Criar índices para consultas otimizadas
if (isServer && RangePartitionSchema) {
  // Índice composto para buscar partições de uma campanha
  RangePartitionSchema.index({ 
    campaignId: 1, 
    partitionId: 1 
  }, { unique: true });
  
  // Índice para buscar por densidade (seleção aleatória otimizada)
  RangePartitionSchema.index({ 
    campaignId: 1, 
    availabilityDensity: -1 
  });
  
  // Índice para buscar partições que contêm um número específico
  RangePartitionSchema.index({ 
    campaignId: 1, 
    startNumber: 1, 
    endNumber: 1 
  });
  
  // Índice para ordenar por última atualização
  RangePartitionSchema.index({ 
    campaignId: 1, 
    lastUpdated: -1 
  });
}

// Interface para o modelo com métodos estáticos
interface RangePartitionModel extends mongoose.Model<IRangePartition> {
  initializeForCampaign(campaignId: string, totalNumbers: number, partitionSize?: number): Promise<any[]>;
  updatePartitionStats(campaignId: string, numbers: number[]): Promise<void>;
  getHighDensityPartitions(campaignId: string, minDensity?: number, limit?: number): Promise<IRangePartition[]>;
  getPartitionForNumber(campaignId: string, number: number): Promise<IRangePartition | null>;
  recalculatePartitionStats(campaignId: string, partitionId: number): Promise<IRangePartition | null>;
  getRandomAvailableNumbers(campaignId: string, count: number): Promise<number[]>;
  sampleFromPartition(campaignId: string, partition: IRangePartition, needed: number): Promise<number[]>;
}

if (isServer && RangePartitionSchema) {
  /**
   * Inicializa partições para uma nova campanha
   */
  RangePartitionSchema.statics.initializeForCampaign = async function(
    campaignId: string,
    totalNumbers: number,
    partitionSize: number = 1000000 // 1M números por partição (padrão)
  ): Promise<any[]> {
    console.log(`Inicializando partições para campanha ${campaignId} com ${totalNumbers} números`);
    
    // Calcular número de partições necessárias
    const numberOfPartitions = Math.ceil(totalNumbers / partitionSize);
    
    const partitions: Partial<IRangePartition>[] = [];
    
    for (let i = 0; i < numberOfPartitions; i++) {
      const startNumber = i * partitionSize;
      const endNumber = Math.min((i + 1) * partitionSize - 1, totalNumbers - 1);
      const partitionTotalNumbers = endNumber - startNumber + 1;
      
      partitions.push({
        campaignId,
        partitionId: i,
        startNumber,
        endNumber,
        totalNumbers: partitionTotalNumbers,
        availableNumbers: partitionTotalNumbers,
        reservedNumbers: 0,
        soldNumbers: 0,
        availabilityDensity: 1.0,
        lastUpdated: new Date()
      });
    }
    
    // Remover partições existentes (se houver) e criar novas
    await this.deleteMany({ campaignId });
    const createdPartitions = await this.insertMany(partitions);
    
    console.log(`✅ Criadas ${createdPartitions.length} partições para a campanha ${campaignId}`);
    return createdPartitions;
  };

  /**
   * Atualiza estatísticas de partições baseado em números alterados
   */
  RangePartitionSchema.statics.updatePartitionStats = async function(
    campaignId: string,
    numbers: number[]
  ): Promise<void> {
    if (!numbers.length) return;
    
    // Agrupar números por partição
    const partitionGroups = new Map<number, number[]>();
    
    for (const number of numbers) {
      // Buscar a partição que contém este número
      const partition = await this.findOne({
        campaignId,
        startNumber: { $lte: number },
        endNumber: { $gte: number }
      });
      
      if (partition) {
        if (!partitionGroups.has(partition.partitionId)) {
          partitionGroups.set(partition.partitionId, []);
        }
        partitionGroups.get(partition.partitionId)!.push(number);
      }
    }
    
    // Atualizar cada partição afetada
    for (const [partitionId, affectedNumbers] of partitionGroups) {
      const thisModel = this as RangePartitionModel;
      await thisModel.recalculatePartitionStats(campaignId, partitionId);
    }
  };

  /**
   * Busca partições com alta densidade de disponibilidade
   */
  RangePartitionSchema.statics.getHighDensityPartitions = async function(
    campaignId: string,
    minDensity: number = 0.1,
    limit: number = 10
  ): Promise<IRangePartition[]> {
    return await this.find({
      campaignId,
      availabilityDensity: { $gte: minDensity }
    })
    .sort({ availabilityDensity: -1 })
    .limit(limit)
    .lean();
  };

  /**
   * Encontra a partição que contém um número específico
   */
  RangePartitionSchema.statics.getPartitionForNumber = async function(
    campaignId: string,
    number: number
  ): Promise<IRangePartition | null> {
    return await this.findOne({
      campaignId,
      startNumber: { $lte: number },
      endNumber: { $gte: number }
    }).lean();
  };

  /**
   * Recalcula estatísticas de uma partição específica
   */
  RangePartitionSchema.statics.recalculatePartitionStats = async function(
    campaignId: string,
    partitionId: number
  ): Promise<IRangePartition | null> {
    const partition = await this.findOne({ campaignId, partitionId });
    if (!partition) return null;
    
    // Contar números reservados e vendidos nesta partição
    const [reservedCount, soldCount] = await Promise.all([
      NumberStatus!.countDocuments({
        campaignId,
        number: {
          $gte: partition.startNumber.toString().padStart(6, '0'),
          $lte: partition.endNumber.toString().padStart(6, '0')
        },
        status: NumberStatusEnum.RESERVED
      }),
      NumberStatus!.countDocuments({
        campaignId,
        number: {
          $gte: partition.startNumber.toString().padStart(6, '0'),
          $lte: partition.endNumber.toString().padStart(6, '0')
        },
        status: NumberStatusEnum.PAID
      })
    ]);
    
    // Calcular números disponíveis e densidade
    const availableNumbers = partition.totalNumbers - reservedCount - soldCount;
    const availabilityDensity = availableNumbers / partition.totalNumbers;
    
    // Atualizar partição
    return await this.findOneAndUpdate(
      { campaignId, partitionId },
      {
        $set: {
          availableNumbers,
          reservedNumbers: reservedCount,
          soldNumbers: soldCount,
          availabilityDensity,
          lastUpdated: new Date()
        }
      },
      { new: true }
    );
  };

  /**
   * Método principal: Seleção aleatória otimizada usando partições
   */
  RangePartitionSchema.statics.getRandomAvailableNumbers = async function(
    campaignId: string,
    count: number
  ): Promise<number[]> {
    console.log(`🎯 Iniciando seleção aleatória otimizada: ${count} números para campanha ${campaignId}`);
    
    // 1. Buscar partições com melhor disponibilidade
    const thisModel = this as RangePartitionModel;
    const partitions = await thisModel.getHighDensityPartitions(campaignId, 0.05, 20);
    
    if (!partitions.length) {
      console.warn('⚠️ Nenhuma partição com disponibilidade encontrada');
      return [];
    }
    
    const selectedNumbers: number[] = [];
    const maxAttempts = count * 5; // Buffer de segurança
    let attempts = 0;
    
    // 2. Distribuir seleção pelas melhores partições
    for (const partition of partitions) {
      if (selectedNumbers.length >= count || attempts >= maxAttempts) break;
      
      // Calcular quantos números selecionar desta partição
      const needed = count - selectedNumbers.length;
      const maxFromPartition = Math.min(
        needed,
        Math.ceil(needed * partition.availabilityDensity),
        partition.availableNumbers
      );
      
      if (maxFromPartition <= 0) continue;
      
      // 3. Amostragem inteligente dentro da partição
      const partitionNumbers = await thisModel.sampleFromPartition(
        campaignId,
        partition,
        maxFromPartition
      );
      
      selectedNumbers.push(...partitionNumbers);
      attempts += partitionNumbers.length;
    }
    
    console.log(`✅ Selecionados ${selectedNumbers.length} números em ${attempts} tentativas`);
    return selectedNumbers.slice(0, count);
  };

  /**
   * Amostragem inteligente dentro de uma partição específica
   */
  RangePartitionSchema.statics.sampleFromPartition = async function(
    campaignId: string,
    partition: IRangePartition,
    needed: number
  ): Promise<number[]> {
    // Gerar candidatos aleatórios na faixa da partição
    const candidates = new Set<number>();
    const maxCandidates = needed * 3; // Buffer 3x para compensar números ocupados
    
    while (candidates.size < maxCandidates) {
      const randomNum = Math.floor(
        Math.random() * (partition.endNumber - partition.startNumber + 1)
      ) + partition.startNumber;
      
      candidates.add(randomNum);
    }
    
    // Verificar disponibilidade em batch (1 consulta)
    const candidatesArray = Array.from(candidates);
    const occupiedNumbers = await NumberStatus!.find({
      campaignId,
      number: { 
        $in: candidatesArray.map(n => n.toString().padStart(6, '0'))
      }
    }, { number: 1 }).lean();
    
    const occupiedSet = new Set(
      occupiedNumbers.map(doc => parseInt(doc.number))
    );
    
    // Filtrar números disponíveis
    const availableNumbers = candidatesArray
      .filter(num => !occupiedSet.has(num))
      .slice(0, needed);
    
    return availableNumbers;
  };
}

// Verificar se o modelo já foi compilado para evitar erros em desenvolvimento
const RangePartition = isServer 
  ? ((mongoose.models.RangePartition as unknown as RangePartitionModel) || 
    mongoose.model<IRangePartition, RangePartitionModel>('RangePartition', RangePartitionSchema as any))
  : null;

export default RangePartition; 