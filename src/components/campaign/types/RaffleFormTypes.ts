import * as z from 'zod';

// Interface para IndividualPrize
export interface IndividualPrize {
  id?: string;
  type: 'money' | 'item';
  quantity: number;
  value: number;
  prizeId?: string;
  name?: string;
  image?: string;
  category?: string;
}

// Interface para PrizeCategory
export interface PrizeCategory {
  active: boolean;
  quantity: number;
  value: number;
  individualPrizes?: IndividualPrize[];
}

// Interface para InstantPrize
export interface InstantPrize {
  id?: string;
  categoryId?: string;
  number: string;
  value: number;
  claimed?: boolean;
  type?: 'money' | 'item';
  prizeId?: string;
  name?: string;
  image?: string;
}

// Interface para configuração de categorias de prêmios
export interface PrizeCategoriesConfig {
  diamante: PrizeCategory;
  master: PrizeCategory;
  premiado: PrizeCategory;
}

// Form data interface para atualização
export type RaffleFormUpdateData = {
  title: string;
  description: string;
  individualNumberPrice: number;
  totalNumbers: number;
  drawDate: string;
  minNumbersPerUser: number;
  maxNumbersPerUser?: number;
  status: string;
  canceled: boolean;
  isScheduled: boolean;
  scheduledActivationDate?: string;
  winnerPositions: number;
  prizeDistribution: Array<{
    position: number, 
    prizes: Array<{
      prizeId?: string, 
      name: string, 
      value: string, 
      image?: string | File
    }>,
    description?: string
  }>;
  winners: Array<string>;
  enablePackages: boolean;
  numberPackages: Array<{
    name: string,
    description?: string,
    quantity: number,
    price: number,
    discount: number,
    isActive: boolean,
    highlight: boolean,
    order: number,
    maxPerUser?: number
  }>;
  instantPrizes: InstantPrize[];
  prizeCategories?: PrizeCategoriesConfig;
  regulation: string;
  returnExpected: string;
  coverImage?: File | string;
  images: File[];
  mainPrize?: string;
  valuePrize?: string;
};

// Schema de validação
export const raffleUpdateFormSchema = z.object({
  title: z.string().min(1, 'O título é obrigatório'),
  description: z.string().min(1, 'A descrição é obrigatória'),
  individualNumberPrice: z.number().min(0.01, 'O preço deve ser maior que zero'),
  totalNumbers: z.number().min(1, 'O número de bilhetes deve ser maior que zero'),
  drawDate: z.string().min(1, 'A data do sorteio é obrigatória'),
  coverImage: z.any().optional(),
  images: z.array(z.any()),
  regulation: z.string().min(1, 'A regra é obrigatória'),
  status: z.string().optional().default('ACTIVE'),
  canceled: z.boolean().optional().default(false),
  minNumbersPerUser: z.number().min(1, 'Pelo menos um número é obrigatório'),
  maxNumbersPerUser: z.number().min(1, 'Pelo menos um número é obrigatório').optional(),
  returnExpected: z.string().optional(),
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
          prizeId: z.string().optional(),
          name: z.string(),
          value: z.string(),
          image: z.string().optional()
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
      discount: z.number().min(1, 'Desconto mínimo de 1%').max(50, 'Desconto máximo de 50%'),
      isActive: z.boolean().optional().default(true),
      highlight: z.boolean().optional().default(false),
      order: z.number().min(1, 'Ordem mínima de 1'),
      maxPerUser: z.number().min(1, 'Máximo de 1 usuário por pacote').optional()
    })
  ).optional().default([]),
  winners: z.array(z.string()).optional().default([])
}).superRefine((data, ctx) => {
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
  
  if (data.maxNumbersPerUser && data.minNumbersPerUser && data.maxNumbersPerUser < data.minNumbersPerUser) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Deve ser maior que o mínimo',
      path: ['maxNumbersPerUser']
    });
  }

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