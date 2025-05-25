 'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast, ToastContainer, Bounce } from 'react-toastify';

// Schema de validação do formulário para criadores
const creatorFormSchema = z.object({
  accountType: z.enum(['pf', 'pj']),
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
  telefone: z.string().min(14, "Telefone inválido").max(15, "Telefone inválido"),
  dataNascimento: z.date({
    required_error: "Data de nascimento é obrigatória",
    invalid_type_error: "Data inválida",
  }).refine(date => {
    const today = new Date();
    const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    return date <= eighteenYearsAgo;
  }, "Você deve ter pelo menos 18 anos"),
  // Pessoa Física
  cpf: z.string().optional(),
  // Pessoa Jurídica
  nomeEmpresa: z.string().optional(),
  cnpj: z.string().optional(),
  // Endereço
  endereco: z.string().min(5, "Endereço inválido"),
  numero: z.string().min(1, "Número é obrigatório"),
  complemento: z.string().optional(),
  bairro: z.string().min(2, "Bairro inválido"),
  cidade: z.string().min(2, "Cidade inválida"),
  estado: z.string().min(2, "Estado inválido"),
  cep: z.string().min(9, "CEP inválido"),
  // Acesso
  senha: z.string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
    .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
    .regex(/[0-9]/, "Senha deve conter pelo menos um número"),
  confirmarSenha: z.string().min(1, "Confirme sua senha"),
  termsAgreement: z.boolean().refine(val => val === true, {
    message: "Você precisa aceitar os termos de uso",
  }),
}).refine(
  data => data.senha === data.confirmarSenha, {
    message: "As senhas não conferem",
    path: ["confirmarSenha"],
  }
).refine(
  data => data.accountType !== 'pf' || (data.cpf && data.cpf.length >= 14), {
    message: "CPF inválido",
    path: ["cpf"],
  }
).refine(
  data => data.accountType !== 'pj' || (data.nomeEmpresa && data.nomeEmpresa.length >= 3), {
    message: "Nome da empresa inválido",
    path: ["nomeEmpresa"],
  }
).refine(
  data => data.accountType !== 'pj' || (data.cnpj && data.cnpj.length >= 18), {
    message: "CNPJ inválido",
    path: ["cnpj"],
  }
);

export type CreatorFormData = z.infer<typeof creatorFormSchema>;

// Interface do contexto do formulário de criador
interface CreatorFormContextType {
  form: UseFormReturn<CreatorFormData>;
  step: number;
  isSliding: boolean;
  isSubmitting: boolean;
  accountType: 'pf' | 'pj';
  setAccountType: (type: 'pf' | 'pj') => void;
  handleNextStep: () => Promise<void>;
  handlePrevStep: () => void;
  setStep: (step: number) => void;
  onSubmit: (data: CreatorFormData) => Promise<void>;
}

// Criação do contexto
const CreatorFormContext = createContext<CreatorFormContextType | undefined>(undefined);

// Provider do contexto
export const CreatorFormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [step, setStep] = useState(1);
  const [isSliding, setIsSliding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accountType, setAccountType] = useState<'pf' | 'pj'>('pf');

  const form = useForm<CreatorFormData>({
    resolver: zodResolver(creatorFormSchema),
    mode: 'onChange',
    defaultValues: {
      accountType: 'pf',
      nome: '',
      email: '',
      telefone: '',
      cpf: '',
      nomeEmpresa: '',
      cnpj: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
      senha: '',
      confirmarSenha: '',
      termsAgreement: false,
    }
  });

  const { trigger, setValue, getValues } = form;

  // Atualizar o tipo de conta quando mudar
  useEffect(() => {
    setValue('accountType', accountType);
  }, [accountType, setValue]);

  // Validar etapa atual
  const validateStep = async (currentStep: number) => {
    let fieldsToValidate: (keyof CreatorFormData)[] = [];
    
    switch(currentStep) {
      case 1:
        return true; // Account type selection always valid
      case 2:
        fieldsToValidate = ['nome', 'email', 'telefone', 'dataNascimento'];
        if (accountType === 'pf') {
          fieldsToValidate.push('cpf');
        } else {
          fieldsToValidate.push('nomeEmpresa', 'cnpj');
        }
        break;
      case 3:
        fieldsToValidate = ['endereco', 'numero', 'bairro', 'cidade', 'estado', 'cep'];
        break;
      case 4:
        fieldsToValidate = ['senha', 'confirmarSenha', 'termsAgreement'];
        break;
      default:
        return false;
    }
    
    try {
      const result = await trigger(fieldsToValidate);
      return result;
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    }
  };

  // Função para ir para a próxima etapa
  const handleNextStep = async () => {
    const isStepValid = await validateStep(step);
    
    if (isStepValid) {
      setIsSliding(true);
      setTimeout(() => {
        setStep(step + 1);
        setTimeout(() => {
          setIsSliding(false);
        }, 50);
      }, 300);
    } else {
      toast.error('Por favor, corrija os erros antes de continuar.', {
        position: "bottom-center",
        autoClose: 3000,
      });
    }
  };

  // Função para ir para a etapa anterior
  const handlePrevStep = () => {
    setIsSliding(true);
    setTimeout(() => {
      setStep(step - 1);
      setTimeout(() => {
        setIsSliding(false);
      }, 50);
    }, 300);
  };

  // Função para enviar o formulário
  const onSubmit = async (data: CreatorFormData) => {
    setIsSubmitting(true);
    
    try {
      // Remover máscaras antes de enviar
      const cleanData = {
        ...data,
        cpf: data.cpf ? data.cpf.replace(/\D/g, '') : undefined,
        cnpj: data.cnpj ? data.cnpj.replace(/\D/g, '') : undefined,
        telefone: data.telefone.replace(/\D/g, ''),
        cep: data.cep.replace(/\D/g, ''),
      };
      
      console.log('Form data:', cleanData);
      
      // Simulação de envio
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Cadastro realizado com sucesso!');
      // Redirecionar após o cadastro
      setTimeout(() => {
        window.location.href = '/cadastro-sucesso';
      }, 1000);
      
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      toast.error('Erro ao realizar cadastro. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CreatorFormContext.Provider
      value={{
        form,
        step,
        isSliding,
        isSubmitting,
        accountType,
        setAccountType,
        handleNextStep,
        handlePrevStep,
        setStep,
        onSubmit
      }}
    >
      <ToastContainer limit={1} />
      {children}
    </CreatorFormContext.Provider>
  );
};

// Hook para acessar o contexto
export const useCreatorFormContext = () => {
  const context = useContext(CreatorFormContext);
  if (context === undefined) {
    throw new Error('useCreatorFormContext must be used within a CreatorFormProvider');
  }
  return context;
};