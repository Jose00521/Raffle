'use client';

import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Controller } from 'react-hook-form';
import { 
  FaEdit, 
  FaMoneyBillWave, 
  FaHashtag, 
  FaCalendarAlt, 
  FaInfoCircle,
  FaExclamationTriangle,
  FaMoneyBill,
  FaCalculator,
  FaMoneyBillAlt
} from 'react-icons/fa';

// Componentes
import FormInput from '@/components/common/FormInput';
import FormTextArea from '@/components/common/FormTextArea';
import FormDatePicker from '@/components/common/FormDatePicker';
import CurrencyInput from '@/components/common/CurrencyInput';
import { formatCurrency } from '@/utils/formatNumber';

// Tipos
import { BasicInfoSectionProps } from './types';

// Styled components
const FormRow = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
    margin-bottom: 20px;
  }
`;

const SubSectionDivider = styled.div`
  margin: 32px 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    rgba(106, 17, 203, 0.1) 0%,
    rgba(106, 17, 203, 0.2) 50%,
    rgba(106, 17, 203, 0.1) 100%
  );
`;

const HelpText = styled.p`
  margin: 10px 0 0;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  font-style: italic;
  line-height: 1.5;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const InfoAlert = styled.div`
  background-color: rgba(37, 117, 252, 0.1);
  border-left: 4px solid #2575fc;
  border-radius: 6px;
  padding: 12px 16px;
  margin: 16px 0;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  
  svg {
    color: #2575fc;
    font-size: 1.2rem;
    margin-top: 2px;
  }
  
  div {
    flex: 1;
    
    h5 {
      font-size: 0.95rem;
      font-weight: 600;
      color: #2575fc;
      margin: 0 0 4px 0;
    }
    
    p {
      font-size: 0.85rem;
      color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
      margin: 0;
      line-height: 1.5;
    }
  }
`;

const CalculationDisplay = styled.div`
  background-color: rgba(106, 17, 203, 0.05);
  border-radius: 8px;
  padding: 12px 16px;
  margin: 8px 0 16px;
  
  h5 {
    font-size: 0.9rem;
    font-weight: 600;
    color: #6a11cb;
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
    gap: 8px;
    
    svg {
      font-size: 1rem;
    }
  }
  
  .calculation {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 8px;
    
    .formula-item {
      background: white;
      border: 1px solid rgba(106, 17, 203, 0.2);
      border-radius: 6px;
      padding: 8px 12px;
      font-weight: 600;
      min-width: 80px;
      text-align: center;
    }
    
    .operator {
      font-size: 1.2rem;
      font-weight: 700;
      color: #6a11cb;
    }
    
    .result {
      background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
      color: white;
      border-radius: 6px;
      padding: 8px 12px;
      font-weight: 700;
      min-width: 80px;
      text-align: center;
    }
  }
  
  .explanation {
    font-size: 0.8rem;
    color: #666;
    text-align: center;
    margin-top: 8px;
  }
`;

const ValueRangeDisplay = styled.div`
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(22, 163, 74, 0.05) 100%);
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 12px;
  padding: 16px 20px;
  margin: 16px 0;
  
  h5 {
    font-size: 0.95rem;
    font-weight: 600;
    color: #22c55e;
    margin: 0 0 12px 0;
    display: flex;
    align-items: center;
    gap: 8px;
    
    svg {
      font-size: 1rem;
    }
  }
  
  .value-range-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 12px;
  }
  
  .value-item {
    background: white;
    border-radius: 10px;
    padding: 16px;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    &.min {
      border-left: 4px solid #22c55e;
      
      .value-label {
        color: #22c55e;
      }
    }
    
    &.max {
      border-left: 4px solid #3b82f6;
      
      .value-label {
        color: #3b82f6;
      }
    }
    
    &.unlimited {
      border-left: 4px solid #f59e0b;
      
      .value-label {
        color: #f59e0b;
      }
      
      .value-amount {
        color: #f59e0b;
      }
    }
  }
  
  .value-label {
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }
  
  .value-amount {
    font-size: 1.4rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 4px;
  }
  
  .value-description {
    font-size: 0.8rem;
    color: #6b7280;
    font-weight: 500;
  }
  
  .value-explanation {
    font-size: 0.85rem;
    color: #6b7280;
    text-align: center;
    font-style: italic;
  }
  
  @media (max-width: 640px) {
    .value-range-grid {
      grid-template-columns: 1fr;
      gap: 12px;
    }
    
    .value-item {
      padding: 12px;
    }
    
    .value-amount {
      font-size: 1.2rem;
    }
  }
`;

/**
 * Componente para a seção de informações básicas do formulário
 */
const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  control,
  errors,
  watch,
  setValue,
  getValues,
  isSubmitting,
  hasBasicRequirements,
  basicRequirementsMessage,
  extractNumericValue
}) => {
  // Observar campos relevantes
  const price = watch('individualNumberPrice');
  const returnExpected = watch('returnExpected');
  const minNumbers = watch('minNumbersPerUser');
  const maxNumbers = watch('maxNumbersPerUser');
  const totalNumbers = watch('totalNumbers');
  const title = watch('title');
  
  // Valores observados para uso interno
  const observedValues = {
    title,
    price,
    returnExpected,
    minNumbers,
    maxNumbers,
    totalNumbers
  };
  
  // Calcular total de números quando o preço ou retorno esperado mudar
  useEffect(() => {
    if (price > 0 && returnExpected) {
      const returnValue = typeof returnExpected === 'number' 
        ? returnExpected 
        : extractNumericValue(returnExpected.toString());
      
      if (returnValue > 0) {
        const calculatedTotalNumbers = Math.ceil(returnValue / price);
        setValue('totalNumbers', calculatedTotalNumbers);
      }
    }
  }, [price, returnExpected, extractNumericValue, setValue]);

  return (
    <>
          <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <FormInput
              id="title"
              name="title"
              label="Título da Rifa"
              icon={<FaEdit />}
              placeholder="Ex: iPhone 15 Pro Max - 256GB"
              value={field.value}
              onChange={e => field.onChange(e.target.value)}
              onBlur={field.onBlur}
              error={errors.title?.message}
              disabled={isSubmitting}
            />
          )}
        />
      
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <FormTextArea
            id="description"
            label="Descrição"
            icon={<FaEdit />}
            placeholder="Descreva a sua rifa em detalhes"
            value={field.value}
            onChange={e => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            error={errors.description?.message}
            disabled={isSubmitting}
            fullWidth
            rows={5}
          />
        )}
      />
      <HelpText>Uma boa descrição aumenta as chances de venda dos números.</HelpText>
      
      <SubSectionDivider />
      
      <FormRow>
        <Controller
          name="individualNumberPrice"
          control={control}
          render={({ field }) => (
            <CurrencyInput
              id="individualNumberPrice"
              label="Preço por Número"
              icon={<FaMoneyBillWave />}
              placeholder="Ex: R$10,00"
              value={field.value}
              onChange={e => {
                // Garantir que o valor seja tratado como número
                const price = typeof e.target.value === 'number' ? e.target.value : parseFloat(e.target.value) || 0;
                field.onChange(price);
                
                // Se temos um retorno esperado, calcular total de números
                const returnExpected = getValues('returnExpected');
                if (returnExpected) {
                  const returnValue = typeof returnExpected === 'number' 
                    ? returnExpected 
                    : extractNumericValue(returnExpected.toString());
                  
                  // Só calcular se ambos os valores forem válidos e maiores que zero
                  if (price > 0 && returnValue > 0) {
                    const totalNumbers = Math.ceil(returnValue / price);
                    setValue('totalNumbers', totalNumbers);
                  }
                }
              }}
              error={errors.individualNumberPrice?.message}
              disabled={isSubmitting}
              required
              currency="BRL"
            />
          )}
        />

        <Controller
          name="returnExpected"
          control={control}
          render={({ field }) => (
            <CurrencyInput
              id="returnExpected"
              label="Retorno Esperado"
              icon={<FaMoneyBill />}
              placeholder="Ex: R$10.000,00"
              value={field.value}
              onChange={e => {
                // Garantir que o valor seja tratado como número
                const returnExpected = typeof e.target.value === 'number' ? e.target.value : parseFloat(e.target.value) || 0;
                field.onChange(returnExpected);
                
                // Se temos preço por número, calcular total de números
                const price = getValues('individualNumberPrice') || 0;
                
                // Só calcular se ambos os valores forem válidos e maiores que zero
                if (price > 0 && field.value > 0) {
                  const totalNumbers = Math.ceil(field.value / price);
                  setValue('totalNumbers', totalNumbers);
                }
              }}
              error={errors.returnExpected?.message}
              disabled={isSubmitting}
              currency="BRL"
              helpText="O valor total que você deseja arrecadar com esta rifa"
            />
          )}
        />
      </FormRow>
      
      <FormRow>
        <Controller
          name="minNumbersPerUser"
          control={control}
          render={({ field }) => (
            <FormInput
              id="minNumbersPerUser"
              label="Mínimo de Números por Usuário"
              icon={<FaHashtag />}
              placeholder="Ex: 1"
              type="number"
              value={field.value !== undefined && field.value !== null ? field.value : ''}
              onChange={e => field.onChange(Number(e.target.value))}
              onBlur={field.onBlur}
              error={errors.minNumbersPerUser?.message}
              disabled={isSubmitting}
              required
              min={1}
              step="1"
              helpText="Quantidade mínima de números que um usuário deve comprar"
            />
          )}
        />

        <Controller
          name="maxNumbersPerUser"
          control={control}
          render={({ field }) => (
            <FormInput
              id="maxNumbersPerUser"
              label="Máximo de Números por Usuário"
              icon={<FaHashtag />}
              placeholder="Ex: 100 (opcional)"
              type="number"
              value={field.value !== undefined && field.value !== null ? field.value : ''}
              onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
              onBlur={field.onBlur}
              error={errors.maxNumbersPerUser?.message}
              disabled={isSubmitting}
              min={watch('minNumbersPerUser') || 1}
              step="1"
              helpText="Quantidade máxima de números que um usuário pode comprar (opcional)"
            />
          )}
        />
      </FormRow>

      <FormRow>
        <Controller
          name="drawDate"
          control={control}
          render={({ field }) => (
            <FormDatePicker
              id="drawDate"
              label="Data do Sorteio"
              icon={<FaCalendarAlt />}
              placeholder="Selecione a data"
              selected={field.value ? new Date(field.value) : null}
              onChange={(date) => field.onChange(date ? date.toISOString() : '')}
              onBlur={field.onBlur}
              error={errors.drawDate?.message}
              disabled={isSubmitting}
              required
              minDate={new Date()}
              showYearDropdown
              showMonthDropdown
              dateFormat="dd/MM/yyyy"
              showTimeSelect={false}
              isClearable
            />
          )}
        />
      </FormRow>
        
      {hasBasicRequirements && (
        <CalculationDisplay>
          <h5><FaCalculator /> Cálculo do Total de Números</h5>
          <div className="calculation">
            <div className="formula-item">
              {formatCurrency(returnExpected)}
            </div>
            <div className="operator">÷</div>
            <div className="formula-item">
              {formatCurrency(price)}
            </div>
            <div className="operator">=</div>
            <div className="result">
              {totalNumbers} números
            </div>
          </div>
          <div className="explanation">
            Retorno esperado ÷ Preço por número = Total de números a serem vendidos
          </div>
        </CalculationDisplay>
      )}

      {price > 0 && (minNumbers > 0 || maxNumbers) && (
        <ValueRangeDisplay>
          <h5><FaMoneyBillAlt /> Valores por Participante</h5>
          <div className="value-range-grid">
            <div className="value-item min">
              <div className="value-label">Valor Mínimo</div>
              <div className="value-amount">
                {formatCurrency((minNumbers || 0) * (price || 0))}
              </div>
              <div className="value-description">
                {minNumbers || 0} número{(minNumbers || 0) > 1 ? 's' : ''}
              </div>
            </div>
            
            {maxNumbers && (
              <div className="value-item max">
                <div className="value-label">Valor Máximo</div>
                <div className="value-amount">
                  {formatCurrency((maxNumbers || 0) * (price || 0))}
                </div>
                <div className="value-description">
                  {maxNumbers || 0} número{(maxNumbers || 0) > 1 ? 's' : ''}
                </div>
              </div>
            )}
            
            {!maxNumbers && (
              <div className="value-item unlimited">
                <div className="value-label">Valor Máximo</div>
                <div className="value-amount">Ilimitado</div>
                <div className="value-description">Sem limite definido</div>
              </div>
            )}
          </div>
          <div className="value-explanation">
            Faixa de valores que cada participante pode investir na sua rifa
          </div>
        </ValueRangeDisplay>
      )}
      
      <InfoAlert>
        <FaInfoCircle />
        <div>
          <h5>Importante!</h5>
          <p>Configure o preço por número e o retorno esperado primeiro. O total de números será calculado automaticamente. 
          Estas informações são essenciais antes de configurar os combos com desconto e os prêmios instantâneos.</p>
        </div>
      </InfoAlert>
    </>
  );
};

export default BasicInfoSection; 