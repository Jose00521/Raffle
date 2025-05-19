'use client';

import React, { createContext, useContext, useState } from 'react';
import { z } from 'zod';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Função auxiliar para validar CPF
const validateCPF = (cpf: string) => {
  // Remove caracteres não numéricos
  console.log('Validando CPF:', cpf);
  
  // Garantir que temos uma string para trabalhar
  if (typeof cpf !== 'string') {
    console.error('CPF não é uma string:', cpf);
    return false;
  }
  
  const cleanCPF = cpf.replace(/\D/g, '');
  console.log('CPF limpo:', cleanCPF);
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleanCPF)) return false;
  
  // Algoritmo de validação do CPF
  let sum = 0;
  let remainder;
  
  // Primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;
  
  // Segundo dígito verificador
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum = sum + parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;
  
  return true;
};

// Schema de validação do formulário
export const registerSchema = z.object({
  nomeCompleto: z.string()
    .min(3, 'Nome completo deve ter pelo menos 3 caracteres')
    .max(50, 'Nome muito longo')
    .nonempty()
    .transform(value => value.trim())
    .superRefine((value, ctx) => {
      if (value.length < 3) return true;
      
      for (let i = 0; i < value.length; i++) {
        const char = value[i];
        if (!(
          (char >= 'a' && char <= 'z') || 
          (char >= 'A' && char <= 'Z') || 
          char === ' ' ||
          /[À-ÿ]/.test(char)
        )) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Nome completo deve conter apenas letras e espaços',
          });
          return false;
        }
      }
      return true;
    }),
  nomeSocial: z.string().optional(),
  cpf: z.string()
    .nonempty('CPF é obrigatório')
    .transform(val => {
      console.log('Transformando CPF:', val);
      return val.replace(/\D/g, '');
    })
    .refine(val => {
      console.log('Refinando comprimento CPF:', val);
      return val.length === 11;
    }, {
      message: 'CPF deve ter 11 dígitos'
    })
    .refine(val => {
      console.log('Validando regras CPF:', val);
      return validateCPF(val);
    }, {
      message: 'CPF inválido'
    }),
  dataNascimento: z.date({
    required_error: "Data de nascimento é obrigatória",
    invalid_type_error: "Data de nascimento inválida",
  }).refine(
    (date) => {
      // Verificar se a pessoa tem pelo menos 18 anos
      const today = new Date();
      const eighteenYearsAgo = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate()
      );
      return date <= eighteenYearsAgo;
    },
    { message: "Você deve ter pelo menos 18 anos para se cadastrar" }
  ),
  email: z
    .string()
    .min(1, 'E-mail é obrigatório')
    .superRefine((value, ctx) => {
      // Se estiver vazio, não validamos (já tratado pelo min(1))
      if (value.length <= 1) return true;
      
      // Otimização: Validação básica antes de usar regex completa
      const hasAt = value.includes('@');
      const hasDot = value.includes('.');
      
      if (!hasAt || !hasDot) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'E-mail deve conter @ e .',
        });
        return false;
      }
      
      // Só faz a validação completa se já tiver @ e .
      if (hasAt && hasDot) {
        // Regex simplificada para validar email básico
        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        
        if (!isValidEmail) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'E-mail inválido',
          });
          return false;
        }
      }
      
      return true;
    }),
  senha: z
    .string()
    .min(8, 'A senha deve ter pelo menos 8 caracteres')
    .refine(
      (password) => /[A-Z]/.test(password),
      'A senha deve conter pelo menos uma letra maiúscula'
    )
    .refine(
      (password) => /[a-z]/.test(password),
      'A senha deve conter pelo menos uma letra minúscula'
    )
    .refine(
      (password) => /[0-9]/.test(password),
      'A senha deve conter pelo menos um número'
    )
    .refine(
      (password) => /[^A-Za-z0-9]/.test(password),
      'A senha deve conter pelo menos um caractere especial'
    ),
  confirmarSenha: z.string().min(1, 'Por favor, confirme sua senha'),
  telefone: z
    .string()
    .min(1, 'Telefone é obrigatório')
    .transform(val => {
      console.log('Transformando telefone:', val);
      return val ? val.replace(/\D/g, '') : '';
    })
    .refine(val => {
      console.log('Verificando telefone preenchido:', val);
      return val.length > 0;
    }, {
      message: 'Telefone é obrigatório'
    })
    .refine(val => {
      console.log('Verificando comprimento telefone:', val);
      return val.length === 0 || val.length === 10 || val.length === 11;
    }, {
      message: 'Telefone deve ter 10 ou 11 dígitos'
    })
    .refine(val => {
      console.log('Verificando DDD telefone:', val);
      // Se não tem pelo menos 2 dígitos, não valida DDD
      if (val.length < 2) return true;
      const ddd = parseInt(val.substring(0, 2));
      return ddd >= 11;
    }, {
      message: 'DDD inválido'
    })
    .refine(val => {
      console.log('Verificando formato celular:', val);
      // Se não for celular (11 dígitos), não valida primeiro dígito
      if (val.length !== 11) return true;
      return val[2] === '9';
    }, {
      message: 'Celular deve começar com 9'
    }),
  confirmarTelefone: z
    .string()
    .min(1, 'Confirme seu telefone')
    .transform(val => {
      console.log('Transformando confirmarTelefone:', val);
      return val ? val.replace(/\D/g, '') : '';
    })
    .refine(val => {
      console.log('Verificando confirmarTelefone preenchido:', val);
      return val.length > 0;
    }, {
      message: 'Confirmação de telefone é obrigatória'
    })
    .refine(val => {
      console.log('Verificando comprimento confirmarTelefone:', val);
      return val.length === 0 || val.length === 10 || val.length === 11;
    }, {
      message: 'Telefone deve ter 10 ou 11 dígitos'
    })
    .refine(val => {
      console.log('Verificando DDD confirmarTelefone:', val);
      // Se não tem pelo menos 2 dígitos, não valida DDD
      if (val.length < 2) return true;
      const ddd = parseInt(val.substring(0, 2));
      return ddd >= 11;
    }, {
      message: 'DDD inválido'
    })
    .refine(val => {
      console.log('Verificando formato celular confirmarTelefone:', val);
      // Se não for celular (11 dígitos), não valida primeiro dígito
      if (val.length !== 11) return true;
      return val[2] === '9';
    }, {
      message: 'Celular deve começar com 9'
    }),
  cep: z
    .string()
    .min(1, 'CEP é obrigatório')
    .transform(val => {
      console.log('Transformando CEP:', val);
      return val ? val.replace(/\D/g, '') : '';
    })
    .refine(val => {
      console.log('Verificando CEP preenchido:', val);
      return val.length > 0;
    }, {
      message: 'CEP é obrigatório'
    })
    .refine(val => {
      console.log('Verificando comprimento CEP:', val);
      return val.length === 0 || val.length === 8;
    }, {
      message: 'CEP deve ter 8 dígitos'
    })
    .refine(val => {
      console.log('Verificando formato CEP:', val);
      // Se não estiver completo, não valida
      if (val.length !== 8) return true;
      
      // Validações específicas para CEPs válidos no Brasil poderiam ser adicionadas aqui
      // Por enquanto, apenas verificamos o formato básico (8 dígitos)
      return /^\d{8}$/.test(val);
    }, {
      message: 'CEP inválido'
    }),
  logradouro: z.string().min(3, 'Logradouro é obrigatório'),
  numero: z.string().min(1, 'Número é obrigatório'),
  bairro: z.string().min(2, 'Bairro é obrigatório'),
  complemento: z.string().optional(),
  uf: z
    .string()
    .min(2, 'UF é obrigatória')
    .max(2, 'UF deve ter apenas 2 caracteres')
    .refine(
      (uf) => {
        const estados = [
          'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
          'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
          'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
        ];
        return estados.includes(uf.toUpperCase());
      },
      { message: 'UF inválida' }
    ),
  cidade: z.string().min(2, 'Cidade é obrigatória'),
  pontoReferencia: z.string().optional(),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: "As senhas não conferem",
  path: ["confirmarSenha"],
}).refine((data) => {
  // Remove caracteres especiais antes de comparar
  console.log('Comparing phone numbers:', data.telefone, data.confirmarTelefone);
  
  // Se um dos telefones não estiver preenchido, não comparar
  if (!data.telefone || !data.confirmarTelefone) {
    return true;
  }
  
  const phone1 = data.telefone.replace(/\D/g, '');
  const phone2 = data.confirmarTelefone.replace(/\D/g, '');
  
  console.log('Cleaned phone numbers:', phone1, phone2);
  
  // Só compara se ambos tiverem pelo menos 10 dígitos (completos)
  if (phone1.length < 10 || phone2.length < 10) {
    return true;
  }
  
  return phone1 === phone2;
}, {
  message: "Os telefones não conferem",
  path: ["confirmarTelefone"],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// Interface do contexto do formulário
interface FormContextType {
  form: UseFormReturn<RegisterFormData>;
  step: number;
  isSliding: boolean;
  isSubmitting: boolean;
  handleNextStep: () => Promise<void>;
  handlePrevStep: () => void;
  setStep: (step: number) => void;
  setIsSubmitting: (value: boolean) => void;
  onSubmit: (data: RegisterFormData) => Promise<void>;
}

// Criação do contexto
const FormContext = createContext<FormContextType | undefined>(undefined);

// Provider do contexto
export const FormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [step, setStep] = useState(1);
  const [isSliding, setIsSliding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    criteriaMode: 'firstError',
    shouldFocusError: true,
    delayError: 800,
    defaultValues: {
      nomeCompleto: '',
      nomeSocial: '',
      cpf: '',
      email: '',
      dataNascimento: new Date('2000-01-01'),
      senha: '',
      confirmarSenha: '',
      telefone: '',
      confirmarTelefone: '',
      cep: '',
      logradouro: '',
      numero: '',
      bairro: '',
      complemento: '',
      uf: '',
      cidade: '',
      pontoReferencia: '',
    }
  });

  const { trigger } = form;

  const validateStep = async (currentStep: number) => {
    let isValid = false;
    
    try {
      if (currentStep === 1) {
        isValid = await trigger(['nomeCompleto', 'cpf', 'dataNascimento'], { 
          shouldFocus: true 
        });
      } else if (currentStep === 2) {
        // Validate email first
        const emailValid = await trigger('email', { shouldFocus: true });
        if (!emailValid) return false;
        
        // Then validate password fields
        const passwordValid = await trigger(['senha', 'confirmarSenha'], { shouldFocus: true });
        if (!passwordValid) return false;
        
        // Finally validate phone fields - get clean values first
        const telefoneValue = form.getValues('telefone').replace(/\D/g, '');
        const confirmTelefoneValue = form.getValues('confirmarTelefone').replace(/\D/g, '');
        
        // Check if phone fields have data
        if (!telefoneValue || !confirmTelefoneValue) {
          await trigger(['telefone', 'confirmarTelefone'], { shouldFocus: true });
          return false;
        }
        
        // Check if phone fields have valid length
        if (telefoneValue.length < 10 || confirmTelefoneValue.length < 10) {
          await trigger(['telefone', 'confirmarTelefone'], { shouldFocus: true });
          return false;
        }
        
        // Verify phone numbers match
        if (telefoneValue !== confirmTelefoneValue) {
          await trigger('confirmarTelefone', { shouldFocus: true });
          return false;
        }
        
        // Final phone validation
        isValid = await trigger(['telefone', 'confirmarTelefone'], { shouldFocus: true });
      } else if (currentStep === 3) {
        const cepValid = await trigger('cep', { shouldFocus: true });
        if (!cepValid) return false;
        
        isValid = await trigger(['logradouro', 'numero', 'bairro', 'cidade', 'uf'], { 
          shouldFocus: true 
        });
      }
    } catch (error) {
      console.error('Validation error:', error);
      isValid = false;
    }
    
    return isValid;
  };
  

  // Função para ir para a próxima etapa
  const handleNextStep = async () => {
    const isStepValid = await validateStep(step);
    
    if (isStepValid) {
      setIsSliding(true);
      // Reduzindo para 300ms para uma resposta mais rápida
      setTimeout(() => {
        setStep(step + 1);
        // Mantendo o pequeno atraso para uma transição suave
        setTimeout(() => {
          setIsSliding(false);
        }, 50);
      }, 300);
    }
  };

  // Função para ir para a etapa anterior
  const handlePrevStep = () => {
    setIsSliding(true);
    // Reduzindo para 300ms para uma resposta mais rápida
    setTimeout(() => {
      setStep(step - 1);
      // Mantendo o pequeno atraso para uma transição suave
      setTimeout(() => {
        setIsSliding(false);
      }, 50);
    }, 300);
  };

  // Função para enviar o formulário
  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    
    try {
      // Remover máscaras antes de enviar
      const dataToSubmit = {
        ...data,
        cpf: data.cpf.replace(/\D/g, ''),
        telefone: data.telefone.replace(/\D/g, ''),
        confirmarTelefone: data.confirmarTelefone.replace(/\D/g, ''),
        cep: data.cep.replace(/\D/g, '')
      };
      
      // Simulação de envio para API
      console.log('Dados do formulário:', dataToSubmit);
      
      // Aqui você faria a chamada para sua API
      // const response = await api.post('/register', data);
      
      alert('Cadastro realizado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      alert('Erro ao realizar cadastro. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Revalidar campos relacionados
  React.useEffect(() => {
    let validationTimeout: NodeJS.Timeout;
    
    const subscription = form.watch((value: Partial<RegisterFormData>, { name }) => {
      if (name) {
        clearTimeout(validationTimeout);
        
        // Delay validation to prevent excessive validation
        validationTimeout = setTimeout(() => {
          // For password fields, only validate if both fields have content
          if (name === 'senha' && value.confirmarSenha && value.senha && value.senha.length >= 8) {
            trigger('confirmarSenha');
          }
          if (name === 'confirmarSenha' && value.senha && value.confirmarSenha && value.confirmarSenha.length >= 8) {
            trigger('confirmarSenha');
          }
          
          // For phone fields, only validate if both fields have content and proper length
          if (name === 'telefone' && value.confirmarTelefone && value.confirmarTelefone.length >= 14) {
            trigger('confirmarTelefone');
          }
          if (name === 'confirmarTelefone' && value.telefone && value.telefone.length >= 14) {
            trigger('confirmarTelefone');
          }
        }, 200); // Tempo reduzido para tornar a validação mais responsiva
      }
    });
    
    return () => {
      subscription.unsubscribe();
      clearTimeout(validationTimeout);
    };
  }, [form, trigger]);

  return (
    <FormContext.Provider
      value={{
        form,
        step,
        isSliding,
        isSubmitting,
        handleNextStep,
        handlePrevStep,
        setStep,
        setIsSubmitting,
        onSubmit
      }}
    >
      {children}
    </FormContext.Provider>
  );
};

// Hook para acessar o contexto
export const useFormContext = () => {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
}; 