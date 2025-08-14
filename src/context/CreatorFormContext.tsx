'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast, ToastContainer, Bounce } from 'react-toastify';
import { creatorFormSchema, CreatorFormData } from '@/zod/creator.schema';
import { useRouter } from 'next/navigation';
import creatorAPIClient from '@/API/creator/creatorAPIClient';
import { ICreator } from '@/models/interfaces/IUserInterfaces';
import mongoose from 'mongoose';
// Helper function to create default values with correct type
const createDefaultValues = () => {
  return {
    tipoPessoa: 'individual' as const,
    termsAgreement: false,
    nomeCompleto: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    telefone: '',
    confirmarTelefone: '',
    cpf: '',
    cep: '',
    logradouro: '',
    numero: '',
    bairro: '',
    cidade: '',
    uf: '',
    complemento: '',
    // Fields for company that will be used only when tipoPessoa is 'company'
    categoriaEmpresa: '',
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
  } as Partial<CreatorFormData>;
};

// Interface do contexto do formulário de criador
interface CreatorFormContextType {
  form: UseFormReturn<CreatorFormData>;
  step: number;
  isSliding: boolean;
  isSubmitting: boolean;
  accountType: 'individual' | 'company';
  setAccountType: (type: 'individual' | 'company') => void;
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
  const [accountType, setAccountType] = useState<'individual' | 'company'>('company');
  const router = useRouter();
  
  const form = useForm<CreatorFormData>({
    resolver: zodResolver(creatorFormSchema),
    mode: 'all',
    reValidateMode: 'onChange',
    defaultValues: createDefaultValues()
  });

  const { trigger, setValue, getValues, setError, clearErrors } = form;

  // Atualizar o tipo de conta quando mudar
  useEffect(() => {
    setValue('tipoPessoa', accountType);
  }, [accountType, setValue]);
  
  // Ajustar os passos quando o tipo de conta mudar
  useEffect(() => {
    // Se mudar de company para individual
    if (accountType === 'individual') {
      // Quando é pessoa física, temos apenas 4 passos
      // Se estiver em um passo específico de empresa (passo 3 - dados da empresa),
      // ajustar para o passo correspondente para pessoa física
      if (step > 4) {
        // Não pode ter passo maior que 4 para pessoa física
        setIsSliding(true);
        setTimeout(() => {
          setStep(4); // Último passo para pessoa física
          setTimeout(() => {
            setIsSliding(false);
          }, 50);
        }, 300);
      }
    }
  }, [accountType, step, setStep, setIsSliding]);

  // Validar etapa atual
  const validateStep = async (currentStep: number) => {
    let fieldsToValidate: (keyof CreatorFormData)[] = [];
    
    switch(currentStep) {
      case 1:
        return true; // Account type selection always valid
      case 2:
        // Dados pessoais/do representante
        fieldsToValidate = ['nomeCompleto', 'email', 'telefone', 'confirmarTelefone', 'cpf', 'dataNascimento'];
        break;
      case 3:
        // Se for empresa, valida os campos da empresa, senão valida endereço
        if (accountType === 'company') {
          fieldsToValidate = ['cnpj', 'razaoSocial', 'nomeFantasia', 'categoriaEmpresa' as keyof CreatorFormData];
        } else {
          // Para pessoa física, o passo 3 já é o endereço
          fieldsToValidate = ['logradouro', 'numero', 'bairro', 'cidade', 'uf', 'cep'];
        }
        break;
      case 4:
        // Endereço (para pessoa jurídica) ou acesso/dados bancários (para pessoa física)
        if (accountType === 'company') {
          fieldsToValidate = ['logradouro', 'numero', 'bairro', 'cidade', 'uf', 'cep'];
        } else {
          // Para pessoa física, o passo 4 é acesso e dados bancários
          fieldsToValidate = ['senha', 'confirmarSenha', 'termsAgreement'];
        
        }
        break;
      case 5:
        // Acesso e dados bancários (apenas para pessoa jurídica)
        if (accountType === 'company') {
          fieldsToValidate = ['senha', 'confirmarSenha', 'termsAgreement'];
          
        }
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
      const cleanData: Partial<ICreator> = {
        role: 'creator',
        personType: data.tipoPessoa,
        name: data.tipoPessoa === 'individual' ? data.nomeCompleto : data.nomeFantasia,
        phone: data.telefone.replace(/\D/g, ''),
        email: data.email,
        password: data.senha,
        cpf: data.cpf ? data.cpf.replace(/\D/g, '') : undefined,
        birthDate: new Date(data.dataNascimento),
        legalName: data.razaoSocial,
        legalRepresentative: data.tipoPessoa === 'company' ? data.nomeCompleto : undefined,
        companyCategory: data.tipoPessoa === 'company' ? data.categoriaEmpresa : undefined,
        cnpj: data.cnpj ? data.cnpj.replace(/\D/g, '') : undefined,
        address: {
          street: data.logradouro,
          number: data.numero,
          complement: data.complemento || '',
          neighborhood: data.bairro,
          city: data.cidade,
          state: data.uf,
          zipCode: data.cep.replace(/\D/g, '')
        },
        bankAccount: [],
        statistics: {
          rafflesCreated: 0,
          activeRaffles: 0,
          totalRevenue: 0,
          conversionRate: 0,
          lastRaffleCreated: new Date()
        },
        settings: {
          allowCommissions: true,
          commissionPercentage: 0,
          receiveReports: true
        },
        isActive: true,
        verification: {
          status: 'pending',
          documents: {
            identityFront: {
              path: '',
              uploadedAt: new Date(),
              verified: false
            }
          },
          verificationNotes: '',
          rejectionReason: '',
          reviewedAt: new Date(),
          reviewedBy: mongoose.Types.ObjectId.createFromHexString('665266526652665266526652'),
          expiresAt: new Date()
        },
        consents: {
          termsAndConditions: data.termsAgreement,
          marketingEmails: data.termsAgreement,
          dataSharing: data.termsAgreement
        }
      };
      
      // Adicionar campos específicos por tipo de conta
      if (data.tipoPessoa === 'company') {
        Object.assign(cleanData, {
          representanteLegal: data.nomeCompleto || "",
          companyName: data.nomeFantasia || "",
          legalName: data.razaoSocial || ""
        });
      }
      
      
      
      // Envio para a API

      const response = await creatorAPIClient.createCreator(cleanData);
      
      if(response.success){
        toast.success('Cadastro realizado com sucesso!');
        // Redirecionar após o cadastro
        router.push('/cadastro-sucesso');
        setIsSubmitting(false)
      }else{
        toast.error(response.message);
        setIsSubmitting(false);
      }
    
      
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      toast.error('Erro ao realizar cadastro. Tente novamente.');
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