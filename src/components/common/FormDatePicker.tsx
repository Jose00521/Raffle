'use client';

import React, { useState, ReactNode, useEffect } from 'react';
import styled from 'styled-components';
import ReactDatePicker, { registerLocale } from 'react-datepicker';
import { ptBR } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt, FaClock, FaExclamationCircle } from 'react-icons/fa';
import { useFormContext } from 'react-hook-form';

// Register Brazilian Portuguese locale
registerLocale('pt-BR', ptBR);

interface FormDatePickerProps {
  id: string;
  name?: string;
  label: string;
  icon?: ReactNode;
  placeholder?: string;
  selected?: Date | null;
  onChange: (date: Date | null) => void;
  onBlur: (date: Date | null) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  minDate?: Date;
  maxDate?: Date;
  showYearDropdown?: boolean;
  showMonthDropdown?: boolean;
  showTimeSelect?: boolean;
  timeFormat?: string;
  fullWidth?: boolean;
  className?: string;
  dateFormat?: string;
  isClearable?: boolean;
  triggerValidation?: (value: string) => void;
}

const InputGroup = styled.div<{ $fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  flex: ${props => props.$fullWidth ? '1 0 100%' : '1'};
  margin-bottom: 24px;
  position: relative;
  min-height: 82px; /* Altura do input (50px) + label (8px margin-bottom) + espaço para erro (24px) */
`;

const InputLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
`;

const RequiredMark = styled.span`
  color: #ef4444;
  margin-left: 4px;
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors?.primary || '#6a11cb'};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  pointer-events: none;
`;

const DatePickerWrapper = styled.div<{ $hasError?: boolean; $isFocused?: boolean; $hasIcon?: boolean }>`
  .react-datepicker-wrapper {
    width: 100%;
  }


  
  .react-datepicker__input-container {
    width: 100%;
    
    input {
      width: 100%;
      padding: ${props => props.$hasIcon ? '16px 15px 16px 40px' : '0 15px'} !important;
      border-radius: 8px;
      border: 2px solid ${props => props.$hasError ? '#ef4444' : props.$isFocused ? '#6a11cb' : 'rgba(0, 0, 0, 0.1)'};
      background-color: ${props => props.$isFocused ? 'white' : '#f8f9fa'};
      font-size: 1.0rem;
      transition: all 0.2s ease;

      
      &:focus {
        outline: none;
        border-color: ${props => props.$hasError ? '#ef4444' : '#6a11cb'};
        background-color: white;
      }
      
      &:disabled {
        background-color: #f3f4f6;
        cursor: not-allowed;
      }
      
      &::placeholder {
        color: #6d7280;
        opacity: 0.8;
      }
      
      &:hover:not(:focus) {
        background-color: #f0f0f0;
      }
      
      @media (max-width: 768px) {
        height: 44px;
        font-size: 0.85rem;
      }
      
      @media (max-width: 480px) {
        height: 42px;
        font-size: 0.8rem;
      }
    }
  }
  
  /* Calendar styling */
  .react-datepicker {
    font-family: inherit;
    border-radius: 12px;
    border: none;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    padding: 0.5rem;
    background: white;
    z-index: 100;
    color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
    
    @media (max-width: 480px) {
      width: 290px;
    }
  }
  
  .react-datepicker__triangle {
    display: none;
  }
  
  .react-datepicker__header {
    background-color: ${({ theme }) => theme.colors?.primary || '#6a11cb'};
    border-bottom: none;
    padding: 1rem 0 0.5rem;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }
  
  .react-datepicker__current-month {
    color: white;
    font-weight: 600;
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }
  
  .react-datepicker__day-name {
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
    width: 2rem;
    margin: 0.2rem;
    
    @media (max-width: 480px) {
      width: 1.8rem;
      margin: 0.15rem;
      font-size: 0.8rem;
    }
  }
  
  .react-datepicker__month {
    margin: 0.4rem 0;
    padding: 0.4rem;
  }
  
  .react-datepicker__day {
    width: 2rem;
    height: 2rem;
    line-height: 2rem;
    margin: 0.2rem;
    border-radius: 50%;
    
    @media (max-width: 480px) {
      width: 1.8rem;
      height: 1.8rem;
      line-height: 1.8rem;
      margin: 0.15rem;
      font-size: 0.8rem;
    }
    
    &:hover {
      background-color: ${({ theme }) => `${theme.colors?.primary || '#6a11cb'}20`};
      color: ${({ theme }) => theme.colors?.primary || '#6a11cb'};
    }
  }
  
  .react-datepicker__day--selected,
  .react-datepicker__day--keyboard-selected {
    background-color: ${({ theme }) => theme.colors?.primary || '#6a11cb'};
    color: white;
    font-weight: 600;
    
    &:hover {
      background-color: ${({ theme }) => theme.colors?.primary || '#6a11cb'};
      opacity: 0.9;
    }
  }
  
  .react-datepicker__day--disabled {
    color: #ccc;
    cursor: default;
    
    &:hover {
      background-color: transparent;
      color: #ccc;
    }
  }
  
  .react-datepicker__navigation {
    top: 1.2rem;
  }
  
  .react-datepicker__navigation-icon::before {
    border-color: white;
    border-width: 2px 2px 0 0;
    height: 8px;
    width: 8px;
  }
  
  /* Year and Month Dropdown Styling */
  .react-datepicker__year-dropdown-container,
  .react-datepicker__month-dropdown-container {
    padding: 0.5rem;
    font-size: 0.85rem;
    font-weight: 500;
    z-index: 5;
  }
  
  /* Direct styling for SELECT elements */
  .react-datepicker__month-select,
  .react-datepicker__year-select {
    background-color: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 4px;
    color: white;
    font-size: 0.9rem;
    padding: 4px 8px;
    cursor: pointer;
    
    &:focus {
      outline: none;
    }
    
    option {
      background-color: white;
      color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
    }
  }
  
  .react-datepicker__year-read-view,
  .react-datepicker__month-read-view {
    visibility: visible !important;
    opacity: 1 !important;
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
  
  .react-datepicker__year-dropdown,
  .react-datepicker__month-dropdown {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    max-height: 300px;
    overflow-y: auto;
    z-index: 10;
    margin-top: 5px;
  }
  
  .react-datepicker__year-option,
  .react-datepicker__month-option {
    padding: 0.5rem;
    color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
    
    &:hover {
      background-color: ${({ theme }) => `${theme.colors?.primary || '#6a11cb'}20`};
      color: ${({ theme }) => theme.colors?.primary || '#6a11cb'};
    }
  }
  
  .react-datepicker__year-option--selected_year,
  .react-datepicker__month-option--selected_month {
    background-color: ${({ theme }) => theme.colors?.primary || '#6a11cb'};
    color: white;
  }
  
  /* Month and Year select buttons styling */
  .react-datepicker__month-read-view--selected-month,
  .react-datepicker__year-read-view--selected-year {
    color: white;
    font-weight: 500;
  }
  
  .react-datepicker__month-read-view--down-arrow,
  .react-datepicker__year-read-view--down-arrow {
    border-color: white;
    top: 5px;
  }
  
  .react-datepicker__month-read-view:hover .react-datepicker__month-read-view--down-arrow,
  .react-datepicker__year-read-view:hover .react-datepicker__year-read-view--down-arrow {
    border-color: rgba(255, 255, 255, 0.8);
  }
  
  .react-datepicker__month-dropdown-container,
  .react-datepicker__year-dropdown-container {
    margin: 0 5px;
  }
  
  /* Time Selection Styling */
  .react-datepicker__time-container {
    border-left-color: rgba(0, 0, 0, 0.1);
    width: 100px;
  }
  
  .react-datepicker__header--time {
    padding-top: 8px;
    padding-bottom: 8px;
    background-color: ${({ theme }) => theme.colors?.primary || '#6a11cb'};
  }
  
  .react-datepicker-time__header {
    color: white;
    font-weight: 600;
    font-size: 0.9rem;
  }
  
  .react-datepicker__time-list-item {
    padding: 8px !important;
    display: flex;
    justify-content: center;
    height: auto !important;
    
    &:hover {
      background-color: ${({ theme }) => `${theme.colors?.primary || '#6a11cb'}20`} !important;
      color: ${({ theme }) => theme.colors?.primary || '#6a11cb'} !important;
    }
  }
  
  .react-datepicker__time-list-item--selected {
    background-color: ${({ theme }) => theme.colors?.primary || '#6a11cb'} !important;
    color: white !important;
    font-weight: bold;
  }
  
  /* Today Button */
  .react-datepicker__today-button {
    background-color: ${({ theme }) => `${theme.colors?.primary || '#6a11cb'}10`};
    color: ${({ theme }) => theme.colors?.primary || '#6a11cb'};
    border-top: 1px solid ${({ theme }) => `${theme.colors?.primary || '#6a11cb'}20`};
    padding: 0.6rem;
    font-weight: 600;
  }
  
  /* Clear Button */
  .react-datepicker__close-icon {
    right: 8px;
    &::after {
      background-color: ${({ theme }) => theme.colors?.primary || '#6a11cb'};
    }
  }
  
  /* Fix for popper positioning */
  .datepicker-popper {
    z-index: 9999 !important;
  }
`;

const ErrorText = styled.div`
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 6px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  position: absolute;
  bottom: -22px;
  left: 0;
  right: 0;
  min-height: 16px;
`;

const TimeIcon = styled.span`
  margin-right: 5px;
  display: inline-flex;
  align-items: center;
`;

const ErrorIcon = styled(FaExclamationCircle)`
  min-width: 14px;
  min-height: 14px;
`;

const FormDatePicker: React.FC<FormDatePickerProps> = ({
  id,
  name = id,
  label,
  icon = <FaCalendarAlt />,
  placeholder = 'Selecione a data',
  error,
  selected,
  disabled = false,
  required = false,
  minDate,
  onChange,
  onBlur,
  maxDate,
  showYearDropdown = true,
  showMonthDropdown = true,
  showTimeSelect = false,
  timeFormat = 'HH:mm',
  fullWidth = false,
  className,
  dateFormat = 'dd/MM/yyyy',
  isClearable = false,
  triggerValidation,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [touched, setTouched] = useState(false);
  const [valueChanged, setValueChanged] = useState(false);

  // Set the complete dateFormat if time selection is enabled
  const completeDateFormat = showTimeSelect 
    ? `${dateFormat} ${timeFormat}`
    : dateFormat;

  // Trigger validation após mudanças
  // useEffect(() => {
  //   if (touched && valueChanged && triggerValidation) {
  //     const validationTimeout = setTimeout(() => {
  //       triggerValidation('dataNascimento');
  //     }, 300);
      
  //     return () => clearTimeout(validationTimeout);
  //   }
  // }, [touched, valueChanged, triggerValidation, selected]);

  const handleDateChange = (date: Date | null) => {
    onChange(date);
    setValueChanged(true);
    console.log('handleDateChange', date);
    
    // Trigger validation com delay para melhor experiência
    if (triggerValidation) {
      setTimeout(() => {
        triggerValidation('dataNascimento');
      }, 300);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    setTouched(true);
    
    // Trigger validação quando perder o foco
    if (triggerValidation) {
      triggerValidation('dataNascimento');
    }
  };

  return (
    <InputGroup $fullWidth={fullWidth} className={className}>
      <InputLabel htmlFor={id}>
        {label}
        {required && <RequiredMark>*</RequiredMark>}
      </InputLabel>
      
      <InputWrapper>
        <InputIcon>{icon}</InputIcon>
        
        <DatePickerWrapper $hasError={!!error} $isFocused={isFocused} $hasIcon={!!icon}>
          <ReactDatePicker
            id={id}
            name={name}
            onFocus={() => setIsFocused(true)}
            onCalendarClose={handleBlur}
            onBlur={handleBlur}
            selected={selected}
            disabled={disabled}
            required={required}
            placeholderText={placeholder}
            onChange={handleDateChange}
            dateFormat={completeDateFormat}
            minDate={minDate}
            maxDate={maxDate}
            showYearDropdown={showYearDropdown}
            showMonthDropdown={showMonthDropdown}
            dropdownMode="scroll"
            yearDropdownItemNumber={100}
            scrollableYearDropdown
            shouldCloseOnSelect={!showTimeSelect}
            todayButton="Hoje"
            showPopperArrow={false}
            showTimeSelect={showTimeSelect}
            timeFormat={timeFormat}
            timeIntervals={15}
            timeCaption="Hora"
            isClearable={isClearable}
            locale="pt-BR"
            calendarClassName="custom-datepicker-calendar"
            popperClassName="datepicker-popper"
            timeInputLabel="Hora:"
            {...props}
          />
        </DatePickerWrapper>
      </InputWrapper>
      
      {error ? (
        <ErrorText>
          <ErrorIcon />
          {error}
        </ErrorText>
      ) : (
        <ErrorText style={{ visibility: 'hidden', pointerEvents: 'none' }} aria-hidden="true">
          <ErrorIcon />
          &nbsp;
        </ErrorText>
      )}
    </InputGroup>
  );
};

export default React.memo(FormDatePicker);