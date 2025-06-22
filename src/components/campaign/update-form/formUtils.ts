import * as z from 'zod';
import { 
  RaffleFormUpdateData, 
  FieldChanges,
  InstantPrizesPayload,
  PrizeDistribution
} from './types';
import { ICampaign } from '@/models/interfaces/ICampaignInterfaces';
import { parseCurrencyToNumber } from '@/utils/formatNumber';

/**
 * Schema de validação para o formulário de atualização de rifas
 */
export const raffleUpdateFormSchema = z.object({
  title: z.string().min(1, 'O título é obrigatório'),
  description: z.string().min(1, 'A descrição é obrigatória'),
  individualNumberPrice: z.number().min(0.01, 'O preço deve ser maior que zero'),
  totalNumbers: z.number().min(1, 'O número de bilhetes deve ser maior que zero'),
  drawDate: z.string().min(1, 'A data do sorteio é obrigatória'),
  coverImage: z.any().optional(), // Optional for updates
  images: z.array(z.any()),
  regulation: z.string().min(1, 'A regra é obrigatória'),
  status: z.string().optional().default('ACTIVE'),
  canceled: z.boolean().optional().default(false),
  minNumbersPerUser: z.number().min(1, 'Pelo menos um número é obrigatório'),
  maxNumbersPerUser: z.number().min(1, 'Pelo menos um número é obrigatório').optional(),
  returnExpected: z.number().min(0, 'O valor de retorno esperado não pode ser negativo').optional(),
  isScheduled: z.boolean(),
  scheduledActivationDate: z.string().optional(),
  prizeCategories: z.any().optional(),
  instantPrizes: z.array(z.any()),
  winnerPositions: z.number().min(1, 'Pelo menos um vencedor é necessário').max(5, 'Máximo de 5 vencedores permitidos'),
  prizeDistribution: z.array(
    z.object({
      position: z.number(),
      prizes: z.array(
        z.object({
          prizeCode: z.string().optional(),
          name: z.string(),
          value: z.string(),
          image: z.string().optional(),
          images: z.array(z.any()).optional().default([])
        })
      ).min(1, 'Pelo menos um prêmio é necessário por posição'),
      description: z.string().optional()
    })
  ).min(1, 'Pelo menos um prêmio é necessário'),
  enablePackages: z.boolean().optional().default(false),
  numberPackages: z.array(
    z.object({
      name: z.string(),
      description: z.string().optional(),
      quantity: z.number().min(2, 'Quantidade mínima de 2 números'),
      price: z.number().min(1, 'Preço mínimo de 1 real'),
      discount: z.number().min(1, 'Desconto mínimo de 1%').max(100, 'Desconto máximo de 50%'),
      isActive: z.boolean().optional().default(true),
      highlight: z.boolean().optional().default(false),
      order: z.number().min(1, 'Ordem mínima de 1'),
      maxPerUser: z.number().min(1, 'Máximo de 1 usuário por pacote').optional()
    })
  ).optional().default([]),
  winners: z.array(z.string()).optional().default([])
}).superRefine((data, ctx) => {
  // Validação para agendamento
  if (data.isScheduled) {
    if (!data.scheduledActivationDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'A data de agendamento é obrigatória quando o agendamento está ativado',
        path: ['scheduledActivationDate']
      });
    } else {
      const scheduledDate = new Date(data.scheduledActivationDate);
      const now = new Date();
      
      if (scheduledDate <= now) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'A data de agendamento deve ser no futuro',
          path: ['scheduledActivationDate']
        });
      }
    }
  }
  
  // Validação para números mínimos e máximos por usuário
  if (data.maxNumbersPerUser && data.minNumbersPerUser && data.maxNumbersPerUser < data.minNumbersPerUser) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Deve ser maior que o mínimo',
      path: ['maxNumbersPerUser']
    });
  }

  if (data.maxNumbersPerUser && data.minNumbersPerUser && data.maxNumbersPerUser < data.minNumbersPerUser) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Deve ser menor que o máximo',
      path: ['minNumbersPerUser']
    });
  }
  
  // Validação para prêmio principal
  const principalPrizePosition = data.prizeDistribution.find(p => p.position === 1);
  if (!principalPrizePosition || !principalPrizePosition.prizes || principalPrizePosition.prizes.length === 0 || 
      !principalPrizePosition.prizes.some(prize => prize.name && prize.name.trim() !== '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'É necessário configurar pelo menos um prêmio principal',
      path: ['prizeDistribution']
    });
  }
}) as z.ZodType<RaffleFormUpdateData>;

/**
 * Função para detectar mudanças entre dois objetos
 * @param original Objeto original
 * @param current Objeto atual
 * @param path Caminho atual para o campo (usado na recursão)
 * @returns Objeto com as mudanças detectadas
 */
export const detectChanges = (original: any, current: any, path: string = ''): FieldChanges => {
  const changes: FieldChanges = {};
  
  // Handle arrays
  if (Array.isArray(original) && Array.isArray(current)) {
    if (JSON.stringify(original) !== JSON.stringify(current)) {
      changes[path] = {
        original: original,
        current: current,
        hasChanged: true
      };
    }
    return changes;
  }
  
  // Handle objects
  if (typeof original === 'object' && original !== null && typeof current === 'object' && current !== null) {
    const allKeys = new Set([...Object.keys(original), ...Object.keys(current)]);
    
    for (const key of allKeys) {
      const currentPath = path ? `${path}.${key}` : key;
      const originalValue = original[key];
      const currentValue = current[key];
      
      if (typeof originalValue === 'object' && originalValue !== null && 
          typeof currentValue === 'object' && currentValue !== null) {
        Object.assign(changes, detectChanges(originalValue, currentValue, currentPath));
      } else if (originalValue !== currentValue) {
        changes[currentPath] = {
          original: originalValue,
          current: currentValue,
          hasChanged: true
        };
      }
    }
    
    return changes;
  }
  
  // Handle primitive values
  if (original !== current) {
    changes[path] = {
      original: original,
      current: current,
      hasChanged: true
    };
  }
  
  return changes;
};




  // Função separada para processar prizeDistribution, seguindo o princípio de responsabilidade única
  const processPrizeDistribution = (prizeDistribution: PrizeDistribution[]) => {
    // Primeiro, processamos normalmente todas as posições
    const processedPositions = prizeDistribution;
    return processedPositions;
  };


/**
 * Prepara os dados do formulário para envio à API
 * @param data Dados do formulário
 * @param changes Mudanças detectadas
 * @param campaignId ID da campanha
 * @returns Objeto formatado para a API
 */
export const prepareUpdateDataForApi = (
  data: RaffleFormUpdateData, 
  dirtyFields: FieldChanges,
  campaignId: string
): {
  campaignId: string;
  updatedFields: Partial<ICampaign>;
  instantPrizesChanges?: InstantPrizesPayload;
  fieldsChanged: string[];
} => {
  console.log("data antes de enviar", data);
    
    

  console.log("dirtyFields", dirtyFields);
  console.log("Dados completos do formulário:", data);
  console.log("prizeDistribution:", data.prizeDistribution);

  const updatedFields: any = {};
  let fieldsChanged = Object.keys(dirtyFields);
  
  // Processar apenas os campos que mudaram
  fieldsChanged.forEach(field => {
    switch (field) {
      case 'title':
      case 'description':
      case 'regulation':
      case 'status':
      case 'canceled':
      case 'isScheduled':
      case 'minNumbersPerUser':
      case 'maxNumbersPerUser':
      case 'winnerPositions':
      case 'enablePackages':
      case 'numberPackages':
        updatedFields[field] = data[field as keyof RaffleFormUpdateData];
        break;

        case 'coverImage':
        case 'images':
            if (!updatedFields.coverImage && data.coverImage) {
              updatedFields.coverImage = data.coverImage;
            }
            if (!updatedFields.images) {
              updatedFields.images = data.images.filter(img => img !== data.coverImage);
            }
            break;
        
      case 'individualNumberPrice':
        updatedFields.individualNumberPrice = typeof data.individualNumberPrice === 'string' 
          ? parseFloat(data.individualNumberPrice) 
          : Number(data.individualNumberPrice);
        break;
        
      case 'totalNumbers':
        updatedFields.totalNumbers = Number(data.totalNumbers);
        break;
        
      case 'drawDate':
        updatedFields.drawDate = new Date(data.drawDate);
        break;
        
      case 'scheduledActivationDate':
        updatedFields.scheduledActivationDate = data.isScheduled && data.scheduledActivationDate 
          ? new Date(data.scheduledActivationDate) 
          : null;
        break;
        
      case 'prizeDistribution':
        // Processar cada posição e seus prêmios usando a função dedicada
        updatedFields.prizeDistribution = processPrizeDistribution(data.prizeDistribution);
        break;
        
      case 'returnExpected':
        // Garantir que returnExpected seja tratado corretamente
        if (data.returnExpected) {
          updatedFields.returnExpected = parseCurrencyToNumber(data.returnExpected as number);
        } else {
          updatedFields.returnExpected = 0;
        }
        break;

      case 'individualNumberPrice':
        if (data.individualNumberPrice) {
          updatedFields.individualNumberPrice = parseCurrencyToNumber(data.individualNumberPrice as number);
        } else {
          updatedFields.individualNumberPrice = 0;
        }
        break;
    }
  });
  
  // SEMPRE incluir prizeDistribution se houver prêmios configurados
  // Isso garante que mesmo que o campo não seja marcado como "dirty",
  // os prêmios serão enviados corretamente
  
  // Preparar alterações de prêmios instantâneos
  let instantPrizesChanges: InstantPrizesPayload | undefined;
  
  if (fieldsChanged.includes('instantPrizes') || fieldsChanged.includes('prizeCategories')) {
    const prizes: any[] = [];
    
    // Processar prêmios instantâneos
    if (data.instantPrizes && data.instantPrizes.length > 0) {
      data.instantPrizes.forEach(prize => {
        prizes.push({
          type: prize.type || 'money',
          categoryId: prize.categoryId || '',
          number: prize.number,
          value: prize.value,
          prizeId: prize.prizeId,
          name: prize.name,
          image: prize.image
        });
      });
    }
    
    instantPrizesChanges = { prizes };
  }
  
  return {
    campaignId,
    updatedFields,
    instantPrizesChanges,
    fieldsChanged
  };
}; 