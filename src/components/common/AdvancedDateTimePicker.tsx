'use client';

import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { format, addMonths, addDays, subMonths, isSameDay, isSameMonth, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, isAfter, isBefore, set } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FaCalendarAlt, FaClock, FaChevronLeft, FaChevronRight, FaTimes, FaCheck } from 'react-icons/fa';

interface AdvancedDateTimePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

// Styled components
const PickerContainer = styled.div`
  position: relative;
  width: 100%;
  font-family: inherit;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 24px;
`;

const Label = styled.label`
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

const InputField = styled.div<{ $hasError?: boolean; $isFocused?: boolean; $disabled?: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  height: 46px;
  padding: 0 15px 0 40px;
  border-radius: 8px;
  border: 2px solid ${props => 
    props.$hasError 
      ? '#ef4444' 
      : props.$isFocused 
        ? '#6a11cb' 
        : 'rgba(0, 0, 0, 0.1)'
  };
  background-color: ${props => 
    props.$disabled
      ? '#f3f4f6'
      : props.$isFocused 
        ? 'white' 
        : '#f5f5f5'
  };
  font-size: 0.9rem;
  transition: all 0.2s ease;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  box-shadow: ${({ $hasError, $isFocused }) => 
    $hasError 
      ? `0 0 0 1px #ef4444` 
      : $isFocused 
        ? `0 0 0 2px rgba(106, 17, 203, 0.2)` 
        : 'none'
  };
  
  &:hover:not(:disabled) {
    background-color: ${props => props.$isFocused ? 'white' : '#f0f0f0'};
  }
  
  @media (max-width: 768px) {
    height: 44px;
    font-size: 0.85rem;
  }
`;

const InputText = styled.span<{ $placeholder?: boolean }>`
  flex: 1;
  color: ${props => props.$placeholder ? '#a0aec0' : 'inherit'};
  opacity: ${props => props.$placeholder ? 0.7 : 1};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

const ClearButton = styled.button`
  background: none;
  border: none;
  color: #a0aec0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 50%;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: #6a11cb;
  }
`;

const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
  cursor: default;
`;

const PopupContent = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 360px;
  max-width: 95vw;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 480px) {
    width: 320px;
  }
`;

const PopupHeader = styled.div`
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CurrentDate = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
`;

const PopupBody = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Navigation = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const NavButton = styled.button`
  background: none;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6a11cb;
  
  &:hover {
    background-color: rgba(106, 17, 203, 0.1);
  }
  
  &:disabled {
    color: #d1d5db;
    cursor: not-allowed;
    
    &:hover {
      background-color: transparent;
    }
  }
`;

const MonthYearDisplay = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #333;
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
`;

const WeekdayLabel = styled.div`
  text-align: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: #6b7280;
  padding: 6px 0;
`;

const DayCell = styled.button<{ 
  $isToday?: boolean; 
  $isSelected?: boolean; 
  $isCurrentMonth?: boolean;
  $isDisabled?: boolean;
}>`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.9rem;
  border: none;
  background-color: ${props => {
    if (props.$isSelected) return '#6a11cb';
    if (props.$isToday) return 'rgba(106, 17, 203, 0.1)';
    return 'transparent';
  }};
  color: ${props => {
    if (props.$isSelected) return 'white';
    if (!props.$isCurrentMonth) return '#d1d5db';
    if (props.$isDisabled) return '#d1d5db';
    return '#333';
  }};
  font-weight: ${props => (props.$isToday || props.$isSelected) ? '600' : 'normal'};
  cursor: ${props => props.$isDisabled ? 'not-allowed' : 'pointer'};
  pointer-events: ${props => props.$isDisabled ? 'none' : 'auto'};
  
  &:hover:not(:disabled) {
    background-color: ${props => props.$isSelected ? '#6a11cb' : 'rgba(106, 17, 203, 0.1)'};
  }
  
  @media (max-width: 480px) {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }
`;

const TimeSection = styled.div`
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
  background-color: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media (max-width: 480px) {
    padding: 16px 8px 0;
  }
`;

const TimeTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 16px;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  svg {
    color: ${({ theme }) => theme.colors?.primary || '#6a11cb'};
  }
`;

const TimeControls = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
  
  @media (max-width: 480px) {
    gap: 14px;
  }
`;

const TimeInput = styled.input`
  width: 70px;
  height: 40px;
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  text-align: center;
  font-size: 1.1rem;
  background-color: white;
  color: #333;
  font-weight: 500;
  transition: all 0.2s ease;
  -webkit-appearance: none;
  -moz-appearance: textfield;
  
  &:focus {
    outline: none;
    border-color: #6a11cb;
    box-shadow: 0 0 0 2px rgba(106, 17, 203, 0.2);
    background-color: white;
  }
  
  &::placeholder {
    color: #a0aec0;
  }
  
  &:hover {
    border-color: #6a11cb;
  }
  
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

const TimeLabel = styled.div`
  font-size: 0.85rem;
  color: #6b7280;
  margin-top: 6px;
  text-align: center;
  font-weight: 500;
`;

const TimeGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  background-color: white;
  border-radius: 10px;
  padding: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
`;

const TimeSeparator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 8px;
  color: #6b7280;
  padding: 0 4px;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.$primary 
    ? `
      background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
      color: white;
      
      &:hover {
        box-shadow: 0 2px 10px rgba(106, 17, 203, 0.3);
      }
    `
    : `
      background-color: #f3f4f6;
      color: #6b7280;
      
      &:hover {
        background-color: #e5e7eb;
      }
    `
  }
`;

const ErrorText = styled.div`
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 6px;
  font-weight: 500;
`;

// Weekday names in Portuguese
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const AdvancedDateTimePicker: React.FC<AdvancedDateTimePickerProps> = ({
  value,
  onChange,
  minDate = new Date(),
  label,
  placeholder = 'Selecione data e hora',
  required = false,
  error,
  disabled = false,
  icon = <FaCalendarAlt />
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value || new Date());
  const [tempDate, setTempDate] = useState<Date | null>(value);
  const [hours, setHours] = useState(value ? value.getHours().toString().padStart(2, '0') : '12');
  const [minutes, setMinutes] = useState(value ? value.getMinutes().toString().padStart(2, '0') : '00');
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Handle outside click to close the popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  // Generate calendar days
  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    
    const days = eachDayOfInterval({ start, end });
    
    // Get the first day of the month (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfMonth = getDay(start);
    
    // Add days from previous month to fill the first row
    const prevMonthDays = [];
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      prevMonthDays.push(addDays(start, -i - 1));
    }
    
    // Add days from next month to fill the last row
    const lastDayOfMonth = getDay(end);
    const nextMonthDays = [];
    for (let i = 1; i <= 6 - lastDayOfMonth; i++) {
      nextMonthDays.push(addDays(end, i));
    }
    
    return [...prevMonthDays.reverse(), ...days, ...nextMonthDays];
  };
  
  const handlePrevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const handleNextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const handleDayClick = (day: Date, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Keep the time from the existing tempDate or default to current time
    const newDate = tempDate
      ? set(day, { 
          hours: parseInt(hours, 10) || 0, 
          minutes: parseInt(minutes, 10) || 0, 
          seconds: 0 
        })
      : set(day, { 
          hours: parseInt(hours, 10) || 0, 
          minutes: parseInt(minutes, 10) || 0, 
          seconds: 0 
        });
    
    setTempDate(newDate);
  };
  
  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    
    // Permitir campo vazio ou número entre 0-23
    if (val === '' || (parseInt(val, 10) >= 0 && parseInt(val, 10) <= 23)) {
      // Remover zero à esquerda, exceto se for apenas "0"
      if (val.length > 1 && val.startsWith('0')) {
        val = val.replace(/^0+/, '');
      }
      
      setHours(val);
      
      if (tempDate && val !== '') {
        const newDate = set(tempDate, { hours: parseInt(val, 10) });
        setTempDate(newDate);
      }
    }
  };
  
  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    
    // Permitir campo vazio ou número entre 0-59
    if (val === '' || (parseInt(val, 10) >= 0 && parseInt(val, 10) <= 59)) {
      // Remover zero à esquerda, exceto se for apenas "0"
      if (val.length > 1 && val.startsWith('0')) {
        val = val.replace(/^0+/, '');
      }
      
      setMinutes(val);
      
      if (tempDate && val !== '') {
        const newDate = set(tempDate, { minutes: parseInt(val, 10) });
        setTempDate(newDate);
      }
    }
  };
  
  const handleOpen = () => {
    if (!disabled) {
      setIsOpen(true);
      
      // Initialize with current value or current date
      if (value) {
        setCurrentMonth(value);
        setTempDate(value);
        setHours(value.getHours().toString().padStart(2, '0'));
        setMinutes(value.getMinutes().toString().padStart(2, '0'));
      } else {
        const now = new Date();
        setTempDate(now);
        setHours(now.getHours().toString().padStart(2, '0'));
        setMinutes(now.getMinutes().toString().padStart(2, '0'));
      }
    }
  };
  
  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
  };
  
  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (tempDate) {
      // Ensure hours and minutes are set
      const h = hours === '' ? 0 : parseInt(hours, 10);
      const m = minutes === '' ? 0 : parseInt(minutes, 10);
      
      // Format hours and minutes for display when confirming
      setHours(h.toString().padStart(2, '0'));
      setMinutes(m.toString().padStart(2, '0'));
      
      const confirmedDate = set(tempDate, { 
        hours: h, 
        minutes: m, 
        seconds: 0 
      });
      
      onChange(confirmedDate);
    } else {
      onChange(null);
    }
    
    setIsOpen(false);
  };
  
  const handleClear = () => {
    onChange(null);
  };
  
  // Format the selected date and time for display
  const formatDateTime = (date: Date | null) => {
    if (!date) return placeholder;
    return format(date, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
  };
  
  const calendarDays = getDaysInMonth();
  
  return (
    <InputGroup>
      {label && (
        <Label>
          {label}
          {required && <RequiredMark>*</RequiredMark>}
        </Label>
      )}
      
      <PickerContainer ref={containerRef}>
        <InputWrapper>
          <InputIcon>{icon}</InputIcon>
          
          <InputField 
            $hasError={!!error} 
            $isFocused={isOpen} 
            $disabled={disabled}
            onClick={handleOpen}
          >
            <InputText $placeholder={!value}>
              {value ? formatDateTime(value) : placeholder}
            </InputText>
            
            {value && !disabled && (
              <ClearButton onClick={(e) => { 
                e.stopPropagation(); 
                handleClear(); 
              }}>
                <FaTimes size={14} />
              </ClearButton>
            )}
          </InputField>
        </InputWrapper>
        
        {error && <ErrorText>{error}</ErrorText>}
        
        {isOpen && (
          <PopupOverlay onClick={(e) => {
            e.stopPropagation();
            // Não fechamos ao clicar no overlay para evitar fechamentos acidentais
          }}>
            <PopupContent onClick={(e) => e.stopPropagation()}>
              <PopupHeader>
                <CurrentDate>
                  {tempDate ? format(tempDate, "d 'de' MMMM, yyyy", { locale: ptBR }) : 'Selecione a data'}
                </CurrentDate>
              </PopupHeader>
              
              <PopupBody>
                <Navigation>
                  <NavButton onClick={handlePrevMonth} type="button" onMouseDown={(e) => e.preventDefault()}>
                    <FaChevronLeft />
                  </NavButton>
                  
                  <MonthYearDisplay>
                    {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                  </MonthYearDisplay>
                  
                  <NavButton onClick={handleNextMonth} type="button" onMouseDown={(e) => e.preventDefault()}>
                    <FaChevronRight />
                  </NavButton>
                </Navigation>
                
                <CalendarGrid>
                  {WEEKDAYS.map(day => (
                    <WeekdayLabel key={day}>{day}</WeekdayLabel>
                  ))}
                  
                  {calendarDays.map((day, index) => {
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isSelectedDay = tempDate ? isSameDay(day, tempDate) : false;
                    const isCurrentDay = isToday(day);
                    const isDisabled = isBefore(day, minDate) && !isSameDay(day, minDate);
                    
                    return (
                      <DayCell
                        key={index}
                        $isToday={isCurrentDay}
                        $isSelected={isSelectedDay}
                        $isCurrentMonth={isCurrentMonth}
                        $isDisabled={isDisabled}
                        onClick={(e) => !isDisabled && handleDayClick(day, e)}
                        type="button"
                        disabled={isDisabled}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        {format(day, 'd')}
                      </DayCell>
                    );
                  })}
                </CalendarGrid>
                
                <TimeSection>
                  <TimeTitle>
                    <FaClock /> Horário
                  </TimeTitle>
                  
                  <TimeControls>
                    <TimeGroup>
                      <TimeInput
                        value={hours}
                        onChange={handleHoursChange}
                        onBlur={() => {
                          if (hours !== '') {
                            setHours(parseInt(hours, 10).toString().padStart(2, '0'));
                          }
                        }}
                        maxLength={2}
                        placeholder="00"
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        type="number"
                        min="0"
                        max="23"
                      />
                      <TimeLabel>Horas</TimeLabel>
                    </TimeGroup>
                    
                    <TimeSeparator>:</TimeSeparator>
                    
                    <TimeGroup>
                      <TimeInput
                        value={minutes}
                        onChange={handleMinutesChange}
                        onBlur={() => {
                          if (minutes !== '') {
                            setMinutes(parseInt(minutes, 10).toString().padStart(2, '0'));
                          }
                        }}
                        maxLength={2}
                        placeholder="00"
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        type="number"
                        min="0"
                        max="59"
                      />
                      <TimeLabel>Minutos</TimeLabel>
                    </TimeGroup>
                  </TimeControls>
                </TimeSection>
                
                <ActionButtons>
                  <ActionButton 
                    onClick={handleCancel} 
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <FaTimes size={12} /> Cancelar
                  </ActionButton>
                  
                  <ActionButton 
                    $primary 
                    onClick={handleConfirm}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <FaCheck size={12} /> Confirmar
                  </ActionButton>
                </ActionButtons>
              </PopupBody>
            </PopupContent>
          </PopupOverlay>
        )}
      </PickerContainer>
    </InputGroup>
  );
};

export default AdvancedDateTimePicker; 