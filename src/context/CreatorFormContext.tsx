 'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast, ToastContainer, Bounce } from 'react-toastify';
import { creatorFormSchema , CreatorFormData} from '@/zod/creator.schema';


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
  const [accountType, setAccountType] = useState<'individual' | 'company'>('individual');

  const form = useForm<CreatorFormData>({
    resolver: zodResolver(creatorFormSchema),
    mode: 'onChange',
 
  });

  const { trigger, setValue, getValues } = form;

  // Atualizar o tipo de conta quando mudar
  useEffect(() => {
    setValue('tipoPessoa', accountType);
  }, [accountType, setValue]);

  // Validar etapa atual
  const validateStep = async (currentStep: number) => {
    let fieldsToValidate: (keyof CreatorFormData)[] = [];
    
    switch(currentStep) {
      case 1:
        return true; // Account type selection always valid
      case 2:
        fieldsToValidate = ['nomeCompleto', 'email', 'telefone'];
        if (accountType === 'individual') {
          fieldsToValidate.push('cpf');
        } else {
          fieldsToValidate.push('nomeFantasia', 'cnpj');
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