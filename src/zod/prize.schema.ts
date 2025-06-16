import { z } from 'zod';

export const prizeSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  value: z.string().min(1, 'Valor é obrigatório'),

});

export type PrizeForm = z.infer<typeof prizeSchema>;
