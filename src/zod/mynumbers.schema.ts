import { validateCPF } from "@/utils/validators";
import { z } from "zod";

export const myNumbersSchema = z.object({
    cpf: z.string()
    .nonempty('CPF é obrigatório')
    .transform(val => {
      return val.replace(/\D/g, '');
    })
    .refine(val => {
      return val.length === 11;     
    }, {
      message: 'CPF deve ter 11 dígitos'
    })
    .refine(val => {
      return validateCPF(val);
    }, {
      message: 'CPF inválido'
    }),
  });

export type MyNumbersFormData = z.infer<typeof myNumbersSchema>;