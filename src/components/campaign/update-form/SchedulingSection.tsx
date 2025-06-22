'use client';

import React from 'react';
import { Controller } from 'react-hook-form';
import { FaRegCalendarAlt } from 'react-icons/fa';
import styled from 'styled-components';
import AdvancedDateTimePicker from '@/components/common/AdvancedDateTimePicker';
import { SchedulingSectionProps } from './types';

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
  border: 1px solid rgba(106, 17, 203, 0.1);
  padding: 16px 20px;
  border-radius: 10px;
  background-color: rgba(106, 17, 203, 0.02);
  
  @media (max-width: 768px) {
    margin-bottom: 24px;
    padding: 14px 16px;
  }
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
    
    &:checked + span {
      background-color: #6a11cb;
    }
    
    &:checked + span:before {
      transform: translateX(24px);
    }
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;
  
  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
`;

const ToggleLabel = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

/**
 * Componente para a seção de agendamento do formulário
 */
const SchedulingSection: React.FC<SchedulingSectionProps> = ({ 
  control, 
  errors, 
  watch, 
  setValue, 
  isSubmitting 
}) => {
  const isScheduled = watch('isScheduled');

  return (
    <>
      <ToggleContainer>
        <ToggleSwitch>
          <Controller
            name="isScheduled"
            control={control}
            render={({ field }) => (
              <input
                type="checkbox"
                checked={field.value}
                onChange={e => {
                  const newValue = e.target.checked;
                  field.onChange(newValue);
                  
                  if (!newValue) {
                    setValue('scheduledActivationDate', '');
                  }
                }}
                disabled={isSubmitting}
              />
            )}
          />
          <ToggleSlider />
        </ToggleSwitch>
        <ToggleLabel>
          Agendar publicação da rifa
        </ToggleLabel>
      </ToggleContainer>
      
      {isScheduled && (
        <Controller
          name="scheduledActivationDate"
          control={control}
          render={({ field }) => (
            <AdvancedDateTimePicker
              value={field.value ? new Date(field.value) : null}
              onChange={(date) => field.onChange(date ? date.toISOString() : '')}
              minDate={new Date()}
              label="Data de Publicação"
              icon={<FaRegCalendarAlt />}
              placeholder="Selecione a data e hora"
              required={isScheduled}
              error={errors.scheduledActivationDate?.message}
              disabled={isSubmitting}
            />
          )}
        />
      )}
    </>
  );
};

export default SchedulingSection; 