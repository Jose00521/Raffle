'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaTimes, FaTrashAlt, FaSave, FaEdit } from 'react-icons/fa';

// Hooks personalizados
import { useRaffleFormUpdate } from '@/hooks/useRaffleFormUpdate';
import { usePrizeManager } from '@/hooks/usePrizeManager';

// Tipos e utilitários
import { RaffleFormUpdateData } from './types/RaffleFormTypes';
import { checkBasicRequirements, getBasicRequirementsMessage, prepareUpdateDataForApi } from './utils/formUtils';

// Componentes de seção
import { BasicInformationSection } from './sections/BasicInformationSection';

// Componentes de UI compartilhados
import { FormContainer, FormActions, ActionButton, ChangeIndicator } from './styles/FormStyles';
import PrizeSelectorModal from '../prize/PrizeSelectorModal';
import PrizeCreatorModal from '../prize/PrizeCreatorModal';

// Interfaces
interface RaffleFormFieldsUpdateProps {
  initialData: Partial<RaffleFormUpdateData>;
  onSubmit: (changes: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  campaignId: string;
}

interface UpdateIndicatorProps {
  hasChanges: boolean;
  changedFieldsCount: number;
}

interface ChangesSummaryProps {
  hasChanges: boolean;
  changedFields: string[];
  fieldChanges: any;
}

// Componente para indicador de atualizações
const UpdateIndicator: React.FC<UpdateIndicatorProps> = ({ hasChanges, changedFieldsCount }) => {
  if (!hasChanges) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '25px',
      fontWeight: '600',
      fontSize: '0.9rem',
      boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      zIndex: 1000
    }}>
      <FaSave />
      {changedFieldsCount} campo{changedFieldsCount > 1 ? 's' : ''} alterado{changedFieldsCount > 1 ? 's' : ''}
    </div>
  );
};

// Componente para resumo das mudanças
const ChangesSummary: React.FC<ChangesSummaryProps> = ({ hasChanges, changedFields, fieldChanges }) => {
  if (!hasChanges) return null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%)',
      border: '1px solid rgba(59, 130, 246, 0.2)',
      borderRadius: '12px',
      padding: '20px',
      margin: '20px 0'
    }}>
      <h4 style={{
        fontSize: '1rem',
        fontWeight: '600',
        color: '#3b82f6',
        margin: '0 0 16px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <FaEdit /> Mudanças Detectadas ({changedFields.length})
      </h4>
      <div>
        {Object.keys(fieldChanges).map(fieldPath => {
          if (!fieldChanges[fieldPath].hasChanged) return null;
          
          const change = fieldChanges[fieldPath];
          const fieldName = fieldPath.split('.').pop() || fieldPath;
          
          return (
            <div key={fieldPath} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 12px',
              background: 'white',
              borderRadius: '8px',
              border: '1px solid rgba(59, 130, 246, 0.1)',
              marginBottom: '8px'
            }}>
              <span style={{ fontWeight: '600', color: '#1f2937', minWidth: '120px' }}>
                {fieldName}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: '#ef4444', textDecoration: 'line-through' }}>
                  {typeof change.original === 'object' 
                    ? JSON.stringify(change.original).substring(0, 50) + '...' 
                    : String(change.original).substring(0, 50)}
                </span>
                <span style={{ color: '#6b7280' }}>→</span>
                <span style={{ color: '#22c55e', fontWeight: '600' }}>
                  {typeof change.current === 'object' 
                    ? JSON.stringify(change.current).substring(0, 50) + '...' 
                    : String(change.current).substring(0, 50)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Componente principal
export const RaffleFormFieldsUpdate: React.FC<RaffleFormFieldsUpdateProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  campaignId
}) => {
  const session = useSession();

  // Hooks personalizados
  const {
    form,
    hasChanges,
    changedFields,
    fieldChanges,
    detectChanges,
    initializeOriginalData,
    resetForm,
    handleSubmit
  } = useRaffleFormUpdate({
    initialData,
    onSubmit: (updateData) => {
      const preparedData = prepareUpdateDataForApi(updateData.updatedFields, fieldChanges, campaignId);
      onSubmit(preparedData);
    }
  });

  const prizeManager = usePrizeManager();

  // Extrair valores do formulário
  const { control, watch, setValue, getValues, formState: { errors } } = form;
  const watchedFields = watch();
  const totalNumbers = watch('totalNumbers');
  const price = watch('individualNumberPrice');
  const returnExpected = watch('returnExpected');

  // Verificar requisitos básicos
  const hasBasicRequirements = checkBasicRequirements(totalNumbers, price, returnExpected);
  const basicRequirementsMessage = getBasicRequirementsMessage(totalNumbers, price, returnExpected);

  // Inicializar dados originais
  useEffect(() => {
    initializeOriginalData();
  }, [initializeOriginalData]);

  // Detectar mudanças quando os campos mudarem
  useEffect(() => {
    const timer = setTimeout(() => {
      detectChanges();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [JSON.stringify(watchedFields), detectChanges]);

  return (
    <FormContainer>
      {/* Indicador de mudanças */}
      <UpdateIndicator 
        hasChanges={hasChanges} 
        changedFieldsCount={changedFields.length} 
      />

      {/* Resumo das mudanças */}
      <ChangesSummary 
        hasChanges={hasChanges}
        changedFields={changedFields}
        fieldChanges={fieldChanges}
      />

      <form onSubmit={handleSubmit}>
        {/* Seção de Informações Básicas */}
        <div style={{ position: 'relative' }}>
          <ChangeIndicator $hasChanges={changedFields.some(field => 
            ['title', 'description', 'individualNumberPrice', 'totalNumbers', 'drawDate', 
             'minNumbersPerUser', 'maxNumbersPerUser', 'returnExpected'].includes(field)
          )} />
          
          <BasicInformationSection
            control={control}
            errors={errors}
            isSubmitting={isSubmitting}
            getValues={getValues}
            setValue={setValue}
          />
        </div>

        {/* Ações do formulário */}
        <FormActions>
          <ActionButton
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <FaTimes />
            Cancelar
          </ActionButton>
          
          <ActionButton
            type="button"
            onClick={resetForm}
            disabled={isSubmitting || !hasChanges}
          >
            <FaTrashAlt />
            Resetar
          </ActionButton>
          
          <ActionButton
            type="submit"
            $variant="primary"
            disabled={isSubmitting || !hasChanges}
          >
            <FaSave />
            {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
          </ActionButton>
        </FormActions>
      </form>
      
      {/* Modais para prêmios */}
      <PrizeSelectorModal 
        isOpen={prizeManager.showPrizeSelector}
        onClose={prizeManager.closePrizeSelector}
        onSelectPrize={prizeManager.currentPrizeSelectHandler}
        availablePrizes={prizeManager.availablePrizes}
      />
      
      <PrizeCreatorModal
        isOpen={prizeManager.showNewPrizeModal}
        onClose={prizeManager.closeNewPrizeModal}
        onPrizeCreated={prizeManager.handlePrizeCreated}
      />
    </FormContainer>
  );
};

export default RaffleFormFieldsUpdate; 