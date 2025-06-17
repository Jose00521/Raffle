import { z } from "zod";

export const phoneOnlySchema = z.object({
    telefone: z
      .string()
      .min(1, 'Telefone é obrigatório')
      .transform(val => {
        return val ? val.replace(/\D/g, '') : '';
      })
      .refine(val => {
        return val.length > 0;
      }, {
        message: 'Telefone é obrigatório'
      })
      .refine(val => {
        return val.length === 0 || val.length === 11;
      }, {
        message: 'Telefone deve ter 11 dígitos'
      })
      .refine(val => {
        // Se não tem pelo menos 2 dígitos, não valida DDD
        if (val.length < 2) return true;
        const ddd = parseInt(val.substring(0, 2));
        return ddd >= 11;
      }, {
        message: 'DDD inválido'
      })
      .refine(val => {
        // O primeiro dígito após o DDD para celular deve ser 9
        return val[2] === '9';
      }, {
        message: 'Celular deve começar com 9'
      }),
  });