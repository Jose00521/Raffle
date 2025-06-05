import { injectable } from 'tsyringe';
import mongoose from 'mongoose';
import InstantPrize, { MoneyPrize, ItemPrize } from '../../models/InstantPrize';
import { 
  InstantPrizeRequest, 
  CreateMoneyPrizeData, 
  CreateItemPrizeData,
  IMoneyPrize,
  IItemPrize,
  SpecificItemPrize,
  MoneyPrizeCategory
} from '../../models/interfaces/IInstantPrizeInterfaces';

@injectable()
export class InstantPrizeService {
  
  /**
   * 🎯 MÉTODO PRINCIPAL - Processar prêmios instantâneos de forma híbrida
   */
  async processInstantPrizes(
    campaignId: string,
    totalNumbers: number,
    data: InstantPrizeRequest,
    session?: mongoose.ClientSession
  ): Promise<{ moneyPrizes: IMoneyPrize[], itemPrizes: IItemPrize[] }> {
    
    console.log(`🎯 Processando prêmios instantâneos para campanha ${campaignId}`);
    
    const results = {
      moneyPrizes: [] as IMoneyPrize[],
      itemPrizes: [] as IItemPrize[]
    };
    
    // Separar prêmios por tipo usando discriminated union
    const itemPrizes = data.prizes.filter((prize): prize is SpecificItemPrize => prize.type === 'item');
    const moneyCategories = data.prizes.filter((prize): prize is MoneyPrizeCategory => prize.type === 'money');
    
    console.log(`📊 ${itemPrizes.length} prêmios físicos, ${moneyCategories.length} categorias de dinheiro`);
    
    try {
      // Coletar números já utilizados pelos prêmios físicos
      const usedNumbers = new Set<string>();
      
      // 1. 🎁 Processar prêmios físicos específicos
      if (itemPrizes.length > 0) {
        console.log(`🎁 Criando ${itemPrizes.length} prêmios físicos específicos...`);
        
        const itemPrizePromises = itemPrizes.map(prize => 
          this.createItemPrize({
            campaignId,
            categoryId: prize.categoryId,
            prizeRef: prize.prizeId,
          }, session)
        );
        
        results.itemPrizes = await Promise.all(itemPrizePromises);
        console.log(`✅ ${results.itemPrizes.length} prêmios físicos criados`);
      }
      
      // 2. 💰 Processar prêmios em dinheiro (gerar números aleatórios)
      if (moneyCategories.length > 0) {
        console.log(`💰 Processando ${moneyCategories.length} categorias de prêmios em dinheiro...`);
        
        for (const category of moneyCategories) {
          console.log(`  💵 Categoria ${category.categoryId}: ${category.quantity}x R$ ${category.value}`);
          
          // Gerar números aleatórios únicos
          const randomNumbers = this.generateRandomNumbers(
            totalNumbers,
            category.quantity,
            usedNumbers
          );
          
          // Criar prêmios em dinheiro
          const moneyPrizes = await this.createMoneyPrizes({
            campaignId,
            categoryId: category.categoryId,
            numbers: randomNumbers,
            value: category.value
          }, session);
          
          results.moneyPrizes.push(...moneyPrizes);
          
          // Adicionar aos números usados para evitar duplicatas
          randomNumbers.forEach(num => usedNumbers.add(num));
          
          console.log(`    ✅ ${moneyPrizes.length} prêmios em dinheiro criados`);
        }
      }
      
      console.log(`🎉 Processamento concluído: ${results.itemPrizes.length} físicos + ${results.moneyPrizes.length} dinheiro`);
      
      return results;
      
    } catch (error) {
      console.error('❌ Erro ao processar prêmios instantâneos:', error);
      throw error;
    }
  }
  
  /**
   * 💰 Criar múltiplos prêmios em dinheiro
   */
  async createMoneyPrizes(
    data: CreateMoneyPrizeData,
    session?: mongoose.ClientSession
  ): Promise<IMoneyPrize[]> {
    
    const moneyPrizeDocuments = data.numbers.map(number => ({
      campaignId: new mongoose.Types.ObjectId(data.campaignId),
      categoryId: data.categoryId,
      number,
      value: data.value,
      type: 'money' as const,
      winner: null,
      claimed: false
    }));
    
    const options = session ? { session } : {};
    const result = await MoneyPrize.insertMany(moneyPrizeDocuments, options);
    return result.map(doc => doc.toObject()) as unknown as IMoneyPrize[];
  }
  
  /**
   * 🎁 Criar prêmio físico específico
   */
  async createItemPrize(
    data: CreateItemPrizeData,
    session?: mongoose.ClientSession
  ): Promise<IItemPrize> {
    
    const itemPrizeDocument = {
      campaignId: new mongoose.Types.ObjectId(data.campaignId),
      categoryId: data.categoryId,
      type: 'item' as const,
      prizeRef: data.prizeRef ? new mongoose.Types.ObjectId(data.prizeRef) : undefined,
      winner: null,
      claimed: false
    };
    
    const options = session ? { session } : {};
    const result = await ItemPrize.create([itemPrizeDocument], options);
    return result[0].toObject() as unknown as IItemPrize;
  }
  
  /**
   * 🎲 Gerar números aleatórios únicos
   */
  private generateRandomNumbers(
    totalNumbers: number,
    quantity: number,
    excludeNumbers: Set<string>
  ): string[] {
    const numbers = new Set<string>();
    let attempts = 0;
    const maxAttempts = quantity * 10; // Segurança contra loop infinito
    
    while (numbers.size < quantity && attempts < maxAttempts) {
      const randomNum = Math.floor(Math.random() * totalNumbers) + 1;
      const formattedNum = randomNum.toString().padStart(6, '0');
      
      if (!excludeNumbers.has(formattedNum)) {
        numbers.add(formattedNum);
      }
      
      attempts++;
    }
    
    if (numbers.size < quantity) {
      throw new Error(`Não foi possível gerar ${quantity} números únicos. Gerados apenas ${numbers.size}`);
    }
    
    return Array.from(numbers);
  }
  
  /**
   * 📊 Obter estatísticas de prêmios por campanha
   */
  async getCampaignPrizeStats(campaignId: string) {
    const [moneyStats, itemStats] = await Promise.all([
      MoneyPrize.aggregate([
        { $match: { campaignId: new mongoose.Types.ObjectId(campaignId) } },
        {
          $group: {
            _id: '$categoryId',
            count: { $sum: 1 },
            totalValue: { $sum: '$value' },
            claimed: { $sum: { $cond: ['$claimed', 1, 0] } }
          }
        }
      ]),
      ItemPrize.aggregate([
        { $match: { campaignId: new mongoose.Types.ObjectId(campaignId) } },
        {
          $group: {
            _id: '$categoryId',
            count: { $sum: 1 },
            totalValue: { $sum: '$value' },
            claimed: { $sum: { $cond: ['$claimed', 1, 0] } }
          }
        }
      ])
    ]);
    
    return {
      money: moneyStats,
      items: itemStats,
      summary: {
        totalMoneyPrizes: moneyStats.reduce((sum, cat) => sum + cat.count, 0),
        totalItemPrizes: itemStats.reduce((sum, cat) => sum + cat.count, 0),
        totalMoneyValue: moneyStats.reduce((sum, cat) => sum + cat.totalValue, 0),
        totalItemValue: itemStats.reduce((sum, cat) => sum + cat.totalValue, 0)
      }
    };
  }
  
  /**
   * 🔍 Buscar prêmios por tipo e categoria
   */
  async findPrizesByType(
    campaignId: string,
    type: 'money' | 'item',
    categoryId?: string,
    page: number = 1,
    limit: number = 50
  ) {
    const skip = (page - 1) * limit;
    const filter: any = { campaignId: new mongoose.Types.ObjectId(campaignId) };
    
    if (categoryId) {
      filter.categoryId = categoryId;
    }
    
    if (type === 'money') {
      return MoneyPrize.find(filter)
        .sort({ number: 1 })
        .skip(skip)
        .limit(limit)
        .lean();
    } else {
      return ItemPrize.find(filter)
        .populate('prizeRef', 'name image value prizeCode')
        .sort({ number: 1 })
        .skip(skip)
        .limit(limit)
        .lean();
    }
  }
  
  /**
   * 🏆 Verificar se um número específico tem prêmio
   */
  async checkNumberForPrize(campaignId: string, number: string) {
    const filter = {
      campaignId: new mongoose.Types.ObjectId(campaignId),
      number
    };
    
    // Buscar em ambos os tipos
    const [moneyPrize, itemPrize] = await Promise.all([
      MoneyPrize.findOne(filter),
      ItemPrize.findOne(filter)
    ]);
    
    return moneyPrize || itemPrize;
  }
} 