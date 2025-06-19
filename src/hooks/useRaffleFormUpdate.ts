import { useState, useRef, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RaffleFormUpdateData, raffleUpdateFormSchema } from '@/components/campaign/types/RaffleFormTypes';
import { ICampaign } from '@/models/interfaces/ICampaignInterfaces';

interface UseRaffleFormUpdateProps {
  initialData: Partial<RaffleFormUpdateData>;
  onSubmit: (changes: any) => void;
}

export const useRaffleFormUpdate = ({ initialData, onSubmit }: UseRaffleFormUpdateProps) => {
  // Estados
  const [hasChanges, setHasChanges] = useState(false);
  const [changedFields, setChangedFields] = useState<string[]>([]);
  const [fieldChanges, setFieldChanges] = useState<any>({});
  
  // Refs
  const initializedRef = useRef(false);
  const originalDataRef = useRef<RaffleFormUpdateData | null>(null);
  
  // Valores padrão
  const defaultValues = useMemo(() => ({
    title: initialData.title || '',
    description: initialData.description || '',
    individualNumberPrice: initialData.individualNumberPrice !== undefined ? initialData.individualNumberPrice : 0,
    totalNumbers: initialData.totalNumbers || 100,
    drawDate: initialData.drawDate || '',
    status: initialData.status || 'ACTIVE',
    canceled: initialData.canceled || false,
    isScheduled: initialData.scheduledActivationDate && initialData.scheduledActivationDate > new Date().toISOString() || false,
    scheduledActivationDate: initialData.scheduledActivationDate || '',
    winnerPositions: initialData.winnerPositions || 1,
    prizeDistribution: initialData.prizeDistribution || [],
    winners: initialData.winners || [],
    enablePackages: initialData.enablePackages || false,
    numberPackages: initialData.numberPackages || [],
    instantPrizes: initialData.instantPrizes || [],
    prizeCategories: initialData.prizeCategories || {
      diamante: { active: false, quantity: 10, value: 2000 },
      master: { active: false, quantity: 20, value: 1000 },
      premiado: { active: false, quantity: 50, value: 500 }
    },
    regulation: initialData.regulation || '',
    returnExpected: initialData.returnExpected !== undefined ? initialData.returnExpected : '',
    minNumbersPerUser: initialData.minNumbersPerUser !== undefined ? initialData.minNumbersPerUser : 1,
    maxNumbersPerUser: initialData.maxNumbersPerUser !== undefined ? initialData.maxNumbersPerUser : undefined,
    images: Array.isArray(initialData.images) ? initialData.images : [],
    coverImage: initialData.coverImage || (Array.isArray(initialData.images) && initialData.images.length > 0 ? initialData.images[0] : undefined),
    mainPrize: initialData.mainPrize || '',
    valuePrize: initialData.valuePrize || ''
  } as RaffleFormUpdateData), [initialData]);

  // Hook form
  const form = useForm<RaffleFormUpdateData>({
    defaultValues,
    mode: 'all',
    shouldFocusError: true,
    resolver: zodResolver(raffleUpdateFormSchema)
  });

  // Detectar mudanças
  const detectChanges = useCallback(() => {
    if (!originalDataRef.current) return;
    
    try {
      const currentData = form.getValues();
      // Lógica de detecção de mudanças simplificada
      const changes = Object.keys(currentData).filter(key => {
        const originalValue = originalDataRef.current![key as keyof RaffleFormUpdateData];
        const currentValue = currentData[key as keyof RaffleFormUpdateData];
        return JSON.stringify(originalValue) !== JSON.stringify(currentValue);
      });
      
      setChangedFields(changes);
      setHasChanges(changes.length > 0);
    } catch (error) {
      // Ignorar erros
    }
  }, [form]);

  // Inicializar dados originais
  const initializeOriginalData = useCallback(() => {
    if (!initializedRef.current && Object.keys(defaultValues).length > 0) {
      originalDataRef.current = defaultValues;
      form.reset(defaultValues);
      initializedRef.current = true;
    }
  }, [defaultValues, form]);

  // Reset formulário
  const resetForm = useCallback(() => {
    if (originalDataRef.current) {
      form.reset(originalDataRef.current);
      setFieldChanges({});
      setChangedFields([]);
      setHasChanges(false);
    }
  }, [form]);

  // Submit formulário
  const handleSubmit = useCallback((data: RaffleFormUpdateData) => {
    if (!hasChanges) return;
    
    // Preparar dados para API
    const updateData = {
      campaignId: '', // Será preenchido pelo componente pai
      updatedFields: data,
      fieldsChanged: changedFields
    };
    
    onSubmit(updateData);
  }, [hasChanges, changedFields, onSubmit]);

  return {
    form,
    hasChanges,
    changedFields,
    fieldChanges,
    detectChanges,
    initializeOriginalData,
    resetForm,
    handleSubmit: form.handleSubmit(handleSubmit)
  };
}; 