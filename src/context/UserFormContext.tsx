'use client';

import React, { createContext, useContext, useState } from 'react';
import { z } from 'zod';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerUserSchema } from '../types/form';
import { IRegularUser, IUser } from '@/models/User';
import userAPI from '@/API/userAPI';
// Função auxiliar para validar CPF

// Schema de validação do formulário

export type RegisterFormData = z.infer<typeof registerUserSchema>;

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

  const form = useForm<RegisterFormData>({resolver: zodResolver(registerUserSchema), 
    mode: 'all',
    delayError: 200,
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
      }, 200);
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
    console.log(JSON.stringify(data, null, 2));    
    
    try {
      // Remover máscaras antes de enviar
      const dataToSubmit: IUser = {
        role: 'user',
        name: data.nomeCompleto,
        email: data.email,
        password: data.senha,
        cpf: data.cpf.replace(/\D/g, ''),
        phone: data.telefone.replace(/\D/g, ''),
        address:{
          zipCode:data.cep.replace(/\D/g, ''),
          street: data.logradouro,
          number: data.numero,
          complement: data.complemento,
          neighborhood: data.bairro,
          city: data.cidade,
          state: data.uf
        },
        birthDate: new Date(data.dataNascimento),
        isActive: true,
        consents: {
          marketingEmails: true,
          termsAndConditions: true,
          dataSharing: true
        },
        purchasedNumbers: [],
        statistics: {
          participationCount: 0,
          totalSpent: 0,
          rafflesWon: 0
        }
      };
      
      // Simulação de envio para API
      const response = await userAPI.createUser(dataToSubmit);
      console.log(response);
      
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      alert('Erro ao realizar cadastro. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

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