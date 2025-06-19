import React from 'react';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import { FaInfo, FaEdit, FaMoneyBillWave, FaMoneyBill, FaHashtag, FaCalendarAlt } from 'react-icons/fa';
import FormInput from '@/components/common/FormInput';
import FormTextArea from '@/components/common/FormTextArea';
import FormDatePicker from '@/components/common/FormDatePicker';
import CurrencyInput from '@/components/common/CurrencyInput';
import { FormSection, SectionTitle, FormRow, HelpText } from '../styles/FormStyles';
import { RaffleFormUpdateData } from '../types/RaffleFormTypes';
import { extractNumericValue } from '../utils/formUtils';

interface BasicInformationSectionProps {
  control: Control<RaffleFormUpdateData>;
  errors: FieldErrors<RaffleFormUpdateData>;
  isSubmitting: boolean;
  getValues: () => RaffleFormUpdateData;
  setValue: (name: keyof RaffleFormUpdateData, value: any) => void;
}

export const BasicInformationSection: React.FC<BasicInformationSectionProps> = ({
  control,
  errors,
  isSubmitting,
  getValues,
  setValue
}) => {
  return (
    <FormSection>
      <SectionTitle>
        <FaInfo /> Informações Básicas
      </SectionTitle>
      
      <Controller
        name="title"
        control={control}
        render={({ field }) => (
          <FormInput
            id="title"
            label="Título da Rifa"
            icon={<FaEdit />}
            placeholder="Ex: iPhone 15 Pro Max - 256GB"
            value={field.value}
            onChange={e => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            error={errors.title?.message}
            disabled={isSubmitting}
            fullWidth
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
              value={field.value || ''}
              onChange={e => {
                const price = parseFloat(e.target.value) || 0;
                field.onChange(price);
                
                const returnExpected = getValues().returnExpected;
                if (returnExpected && price > 0) {
                  const returnValue = extractNumericValue(returnExpected);
                  const totalNumbers = Math.ceil(returnValue / price);
                  setValue('totalNumbers', totalNumbers);
                }
              }}
              error={errors.individualNumberPrice?.message}
              disabled={isSubmitting}
              required
              currency="R$"
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
              value={field.value || ''}
              error={errors.returnExpected?.message}
              disabled={isSubmitting}
              currency="R$"
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
              value={field.value !== undefined ? field.value : ''}
              onChange={e => {
                const value = parseFloat(e.target.value) || 1;
                field.onChange(value);
              }}
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
              value={field.value !== undefined ? field.value : ''}
              onChange={e => {
                const value = parseFloat(e.target.value) || undefined;
                field.onChange(value);
              }}
              onBlur={field.onBlur}
              error={errors.maxNumbersPerUser?.message}
              disabled={isSubmitting}
              min={getValues().minNumbersPerUser || 1}
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
    </FormSection>
  );
}; 