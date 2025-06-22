import React from 'react';
import { Control, UseFormSetValue, UseFormWatch, UseFormGetValues, FieldErrors } from 'react-hook-form';
import { RaffleFormUpdateData } from './types';
import ComboDiscountSectionComponent from '../ComboDiscountSection';

interface CombosSectionProps {
  control: Control<RaffleFormUpdateData>;
  watch: UseFormWatch<RaffleFormUpdateData>;
  setValue: UseFormSetValue<RaffleFormUpdateData>;
  getValues: UseFormGetValues<RaffleFormUpdateData>;
  errors: FieldErrors<RaffleFormUpdateData>;
  isSubmitting: boolean;
  hasBasicRequirements?: boolean;
  basicRequirementsMessage?: string;
}

/**
 * ComboSection component for managing discount packages in raffle update form
 */
const CombosSection: React.FC<CombosSectionProps> = ({
  control,
  watch,
  setValue,
  getValues,
  errors,
  isSubmitting,
  hasBasicRequirements = true,
  basicRequirementsMessage = ""
}) => {
  // Obter os valores atuais para passar como initialData
  const currentValues = getValues();
  
  // Garantir que os pacotes de números existam e tenham valores padrão
  const numberPackages = currentValues.numberPackages || [];

  // Preparar dados iniciais completos
  const initialData = {
    individualNumberPrice: currentValues.individualNumberPrice,
    enablePackages: currentValues.enablePackages !== undefined ? currentValues.enablePackages : false,
    numberPackages: numberPackages
  };

  return (
    <ComboDiscountSectionComponent 
      control={control}
      watch={watch}
      initialData={initialData}
      isSubmitting={isSubmitting || !hasBasicRequirements}
    />
  );
};

export default CombosSection; 