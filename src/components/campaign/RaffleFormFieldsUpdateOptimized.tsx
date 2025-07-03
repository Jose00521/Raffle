'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, Controller, useFormContext, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Componentes e utilitários
import { 
  FormSection,
  BasicInfoSection,
  ImagesSection,
  RegulationSection,
  SchedulingSection,
  InstantPrizesSection,
  CombosSection,
  FormActions,
  PrizesSection,
  raffleUpdateFormSchema,
  prepareUpdateDataForApi
} from './update-form';

// Componentes para seleção e criação de prêmios
import PrizeSelectorModal from '../prize/PrizeSelectorModal';
import PrizeCreatorModal from '../prize/PrizeCreatorModal';
import creatorPrizeAPIClient from '@/API/creator/creatorPrizeAPIClient';
import { IPrize } from '@/models/interfaces/IPrizeInterfaces';

// Utilitários externos
import { formatCurrency } from '@/utils/formatNumber';

// Tipos
import type { 
  RaffleFormUpdateData, 
  InstantPrizesPayload,
  PrizeDistribution,
  FieldChanges
} from './update-form';
import { ICampaign } from '@/models/interfaces/ICampaignInterfaces';

// Props do componente
interface RaffleFormFieldsUpdateOptimizedProps {
  initialData: Partial<RaffleFormUpdateData>;
  onSubmit: (changes: {
    campaignId: string;
    updatedFields: Partial<ICampaign>;
    instantPrizesChanges?: InstantPrizesPayload;
    fieldsChanged: string[];
  }) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  campaignId: string;
}

// Componente para exibir resumo das alterações
const ChangesSummaryOptimized = () => {
  const { formState, getValues } = useFormContext();
  const { dirtyFields } = formState;
  const values = getValues();
  
  if (Object.keys(dirtyFields).length === 0) return null;
  
  const formatFieldValue = (value: any) => {
    if (value === undefined || value === null) return 'Não definido';
    if (typeof value === 'number') return formatCurrency(value);
    if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
    if (typeof value === 'string') return value || 'Vazio';
    if (Array.isArray(value)) return `${value.length} itens`;
    if (typeof value === 'object') return 'Objeto complexo';
    return String(value);
  };
  
  const getFieldDisplayName = (field: string) => {
    const displayNames: Record<string, string> = {
      'title': 'Título',
      'description': 'Descrição',
      'individualNumberPrice': 'Preço por Número',
      'totalNumbers': 'Total de Números',
      'drawDate': 'Data do Sorteio',
      'minNumbersPerUser': 'Mínimo de Números por Usuário',
      'maxNumbersPerUser': 'Máximo de Números por Usuário',
      'returnExpected': 'Retorno Esperado',
      'regulation': 'Regulamento',
      'isScheduled': 'Agendamento Ativado',
      'scheduledActivationDate': 'Data de Ativação',
      'enablePackages': 'Pacotes Ativados',
      'numberPackages': 'Pacotes de Números',
      'images': 'Imagens',
      'coverImage': 'Imagem de Capa',
      'instantPrizes': 'Prêmios Instantâneos',
      'prizeCategories': 'Categorias de Prêmios',
    };
    
    return displayNames[field] || field;
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-l-4 border-green-500">
      <h3 className="text-lg font-semibold mb-4 text-green-600">Campos alterados</h3>
      <div className="space-y-2">
        {Object.keys(dirtyFields).map(field => (
          <div key={field} className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span className="font-medium">{getFieldDisplayName(field)}</span>
            <span className="text-gray-700">{formatFieldValue(values[field])}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente para indicar que há alterações
const UpdateIndicatorOptimized = () => {
  const { formState } = useFormContext();
  const { isDirty, dirtyFields } = formState;
  
  if (!isDirty) return null;
  
  const changedCount = Object.keys(dirtyFields).length;
  
  return (
    <div className="fixed bottom-6 right-6 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-5 rounded-full shadow-lg flex items-center gap-2 cursor-pointer z-50">
      {/* <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg> */}
      <span className="font-semibold">{changedCount} campo{changedCount !== 1 ? 's' : ''} alterado{changedCount !== 1 ? 's' : ''}</span>
      <span className="bg-white text-green-600 rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">{changedCount}</span>
    </div>
  );
};

/**
 * Componente principal otimizado para atualização de rifas
 * Usa recursos nativos do React Hook Form para rastreamento de mudanças
 */
const RaffleFormFieldsUpdateOptimized: React.FC<RaffleFormFieldsUpdateOptimizedProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  campaignId
}) => {
  // Estado para controlar se o resumo de mudanças está visível
  const [showSummary, setShowSummary] = useState(false);
  

  
  
  // Processar dados iniciais uma única vez
  const processedInitialData = useMemo(() => {
    // Garantir que numberPackages tenha valores padrão se estiver vazio
    
    // Garantir que a imagem de capa seja válida
    let coverImage = initialData.coverImage;
    const images = [
      initialData.coverImage,
      ...(initialData.images || [])
    ]
    
    // Se não há imagem de capa definida ou a imagem de capa não está no array de imagens
    if (!coverImage && images.length > 0) {
      coverImage = images[0];
      console.log('Definindo imagem de capa inicial para a primeira imagem:', coverImage);
    }
    
    // Processar o valor do retorno esperado corretamente
    
    return {
      title: initialData.title || '',
      description: initialData.description || '',
      individualNumberPrice: initialData.individualNumberPrice !== undefined ? Number(initialData.individualNumberPrice) : 0,
      totalNumbers: initialData.totalNumbers ? Number(initialData.totalNumbers) : 100,
      drawDate: initialData.drawDate || '',
      status: initialData.status || 'ACTIVE',
      canceled: initialData.canceled || false,
      isScheduled: initialData.isScheduled,
      scheduledActivationDate: initialData.scheduledActivationDate || '',
      winnerPositions: initialData.winnerPositions || 1,
      prizeDistribution: initialData.prizeDistribution || [],
      winners: initialData.winners || [],
      enablePackages: initialData.enablePackages,
      numberPackages: initialData.numberPackages || [],
      instantPrizes: initialData.instantPrizes || [],
      prizeCategories: initialData.prizeCategories || {
        diamante: { active: false, quantity: 10, value: 2000 },
        master: { active: false, quantity: 20, value: 1000 },
        premiado: { active: false, quantity: 50, value: 500 }
      },
      regulation: initialData.regulation || '',
      returnExpected: initialData.returnExpected || '',
      minNumbersPerUser: initialData.minNumbersPerUser !== undefined ? Number(initialData.minNumbersPerUser) : 1,
      maxNumbersPerUser: initialData.maxNumbersPerUser !== undefined ? Number(initialData.maxNumbersPerUser) : undefined,
      images: images,
      coverImage: coverImage,
      mainPrize: initialData.mainPrize || '',
      valuePrize: initialData.valuePrize || ''
    } as RaffleFormUpdateData;
  }, [initialData]);

  // Configurar React Hook Form
  const methods = useForm<RaffleFormUpdateData>({
    defaultValues: processedInitialData,
    mode: 'onChange',  // Usar onChange para detectar mudanças em tempo real
    resolver: zodResolver(raffleUpdateFormSchema),
    shouldUnregister: false,
    criteriaMode: 'all',
    reValidateMode: 'onChange'
  });
  
  // Adicionar um efeito para registrar manualmente o campo prizeDistribution
  useEffect(() => {
    // Registrar o campo prizeDistribution manualmente para garantir que as mudanças sejam detectadas
    methods.register('prizeDistribution');
    
    // Limpar ao desmontar
    return () => {
      methods.unregister('prizeDistribution');
    };
  }, [methods]);
  
  const { 
    control, 
    handleSubmit, 
    watch, 
    setValue, 
    getValues,
    reset,
    formState: { errors, isDirty, dirtyFields } 
  } = methods;

  // Observar campos principais para cálculos automáticos
  const totalNumbers = watch('totalNumbers');
  const price = watch('individualNumberPrice');
  const returnExpected = watch('returnExpected');
  


  // Calcular total de números quando o preço ou retorno esperado mudar
  useEffect(() => {
    console.log(price, returnExpected)
    if (price > 0 && returnExpected) {
      try {
        if (returnExpected > 0) {
          const calculatedTotalNumbers = Math.ceil(returnExpected / price);
          console.log(calculatedTotalNumbers)
          setValue('totalNumbers', calculatedTotalNumbers,{
            shouldDirty:true
          });
        }
      } catch (error) {
        // Ignorar erros de conversão
      }
    }
  }, [price, returnExpected, setValue]);

  // 🔒 VALIDAÇÃO DE CAMPOS OBRIGATÓRIOS PARA FUNCIONALIDADES AVANÇADAS
  const hasBasicRequirements = useMemo(() => {
    const priceNum = typeof price === 'string' ? parseFloat(price) : price;
    return totalNumbers > 0 && priceNum > 0 && returnExpected;
  }, [totalNumbers, price, returnExpected]);

  const basicRequirementsMessage = useMemo(() => {
    const priceNum = typeof price === 'string' ? parseFloat(price) : price;
    if (!priceNum || priceNum <= 0) {
      return "Defina o preço por número primeiro";
    }
    if (!returnExpected) {
      return "Defina o retorno esperado primeiro";
    }
    if (!totalNumbers || totalNumbers <= 0) {
      return "Aguarde o cálculo automático do total de números";
    }
    return "";
  }, [totalNumbers, price, returnExpected]);

  // Extrair função numérica para uso em vários componentes
  const extractNumericValue = useCallback((valueString: string): number => {
    try {
      // Se o valor for vazio, retornar 0
      if (!valueString || typeof valueString !== 'string') {
        return 0;
      }
      
      // Verificar se o valor contém apenas zeros
      if (/^[R$\s]*0[,.]?0*$/.test(valueString)) {
        return 0;
      }
      
      // Remover o símbolo da moeda (R$) e espaços
      let cleanValue = valueString.replace(/[R$\s]/g, '');
      
      // Tratar formato brasileiro (1.234,56):
      // 1. Remover pontos (separadores de milhar)
      cleanValue = cleanValue.replace(/\./g, '');
      
      // 2. Substituir vírgula por ponto para o JavaScript entender como decimal
      cleanValue = cleanValue.replace(/,/g, '.');
      
      // Converter para número com parseFloat para preservar os decimais
      const numericValue = parseFloat(cleanValue);
      
      // Log para debug
      console.log(`Extração de valor numérico: "${valueString}" → "${cleanValue}" → ${numericValue}`);
      
      return isNaN(numericValue) ? 0 : numericValue;
    } catch (error) {
      console.error("Erro ao extrair valor numérico:", error);
      return 0;
    }
  }, []);

  // Preparar dados para envio à API
  const prepareDataForApi = useCallback((data: RaffleFormUpdateData) => {
    return prepareUpdateDataForApi(data, dirtyFields as FieldChanges, campaignId);
  }, [isDirty, dirtyFields, campaignId]);

  // Handler para envio do formulário
  const onFormSubmit = (data: RaffleFormUpdateData) => {
    console.log("Dados do formulário:", data);
    
    // Processar os dados para envio
    const updateData = prepareDataForApi(data);
    
    if (updateData) {
      onSubmit(updateData);
    }
  };
  


  // Resetar para valores originais
  const handleReset = () => {
    reset(processedInitialData);
  };


  return (
    <FormProvider {...methods}>
      <div className="flex flex-col gap-10 w-full bg-transparent">
        {/* Indicador de mudanças */}
        <UpdateIndicatorOptimized />
        
        {/* Resumo de mudanças */}
        {showSummary && <ChangesSummaryOptimized />}
        
        <form onSubmit={handleSubmit(onFormSubmit)}>
          {/* Basic Information Section */}
          <FormSection 
            title="Informações Básicas"
            icon="info"
            hasChanges={Object.keys(dirtyFields).some(field => 
              ['title', 'description', 'individualNumberPrice', 
               'totalNumbers', 'drawDate', 'minNumbersPerUser', 
               'maxNumbersPerUser', 'returnExpected'].includes(field)
            )}
          >
            <BasicInfoSection 
              control={control}
              errors={errors}
              watch={watch}
              setValue={setValue}
              getValues={getValues}
              isSubmitting={isSubmitting}
              hasBasicRequirements={Boolean(hasBasicRequirements)}
              basicRequirementsMessage={basicRequirementsMessage}
              extractNumericValue={extractNumericValue}
            />
          </FormSection>

          {/* Prizes Section - Novo componente adicionado */}
          <FormSection 
            title="Configuração de Prêmios"
            icon="trophy"
            hasChanges={Object.keys(dirtyFields).some(field => 
              ['winnerPositions', 'prizeDistribution'].includes(field)
            )}
          >
            <PrizesSection 
              control={control}
              errors={errors}
              watch={watch}
              setValue={setValue}
              getValues={getValues}
              isSubmitting={isSubmitting}
            />
          </FormSection>

          {/* Combos Section */}
          <FormSection 
            title="Pacotes com Desconto"
            icon="tag"
            hasChanges={Object.keys(dirtyFields).some(field => 
              ['enablePackages', 'numberPackages'].includes(field)
            )}
          >
            <CombosSection 
              control={control}
              errors={errors}
              watch={watch}
              setValue={setValue}
              getValues={getValues}
              isSubmitting={isSubmitting}
              hasBasicRequirements={Boolean(hasBasicRequirements)}
              basicRequirementsMessage={basicRequirementsMessage}
            />
          </FormSection>
          
          {/* Upload Images Section */}
          <FormSection 
            title="Imagens"
            icon="upload"
            hasChanges={Object.keys(dirtyFields).some(field => 
              ['images', 'coverImage'].includes(field)
            )}
          >
            <ImagesSection 
              control={control}
              errors={errors}
              setValue={setValue}
              isSubmitting={isSubmitting}
            />
          </FormSection>
          
          {/* Regulation Section */}
          <FormSection 
            title="Regulamento"
            icon="regulation"
            hasChanges={Object.keys(dirtyFields).includes('regulation')}
          >
            <RegulationSection 
              control={control}
              errors={errors}
              watch={watch}
              isSubmitting={isSubmitting}
            />
          </FormSection>
          
          {/* Scheduling Section */}
          <FormSection 
            title="Agendamento"
            icon="calendar"
            hasChanges={Object.keys(dirtyFields).some(field => 
              ['isScheduled', 'scheduledActivationDate'].includes(field)
            )}
            className="agendamento"
          >
            <SchedulingSection 
              control={control}
              errors={errors}
              watch={watch}
              setValue={setValue}
              isSubmitting={isSubmitting}
            />
          </FormSection>
          
          {/* Prize Configuration Section */}
          <FormSection 
            title="Configuração de Prêmios Instantâneos"
            icon="gift"
            hasChanges={Object.keys(dirtyFields).some(field => 
              ['instantPrizes', 'prizeCategories'].includes(field)
            )}
          >
            <InstantPrizesSection 
              control={control}
              setValue={setValue}
              watch={watch}
              totalNumbers={totalNumbers}
              hasBasicRequirements={Boolean(hasBasicRequirements)}
              basicRequirementsMessage={basicRequirementsMessage}
              isSubmitting={isSubmitting}
              errors={errors}
            />
          </FormSection>
          
          {/* Form Actions */}
          <FormActions 
            onCancel={onCancel}
            onReset={handleReset}
            hasChanges={isDirty}
            isSubmitting={isSubmitting}
          />
        </form>
      </div>


    </FormProvider>
  );
};

export default RaffleFormFieldsUpdateOptimized; 