'use client';

import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { format, addMonths, addDays, subMonths, isSameDay, isSameMonth, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, isAfter, isBefore, isWithinInterval, isSameWeek, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaTimes, FaCheck, FaArrowRight } from 'react-icons/fa';

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  presets?: Array<{
    label: string;
    range: DateRange;
  }>;
}

// Styled components
const PickerContainer = styled.div`
  position: relative;
  width: 100%;
  font-family: inherit;
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const InputField = styled.div<{ $hasError?: boolean; $isFocused?: boolean; $disabled?: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  height: 52px;
  padding: 0 20px 0 48px;
  border-radius: 10px;
  border: 2px solid ${props => 
    props.$hasError 
      ? '#ef4444' 
      : props.$isFocused 
        ? '#6a11cb' 
        : 'rgba(0, 0, 0, 0.08)'
  };
  background-color: ${props => 
    props.$disabled
      ? '#f3f4f6'
      : props.$isFocused 
        ? 'white' 
        : '#fafbfc'
  };
  font-size: 1rem;
  transition: all 0.3s ease;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  box-shadow: ${({ $hasError, $isFocused }) => 
    $hasError 
      ? `0 0 0 2px #ef4444` 
      : $isFocused 
        ? `0 0 0 4px rgba(106, 17, 203, 0.08)` 
        : '0 2px 6px rgba(0, 0, 0, 0.02)'
  };
  
  &:hover:not(:disabled) {
    background-color: ${props => props.$isFocused ? 'white' : '#f1f3f5'};
  }
  
  @media (max-width: 768px) {
    height: 48px;
    font-size: 0.9rem;
    padding: 0 16px 0 44px;
  }
`;

const InputText = styled.div<{ $placeholder?: boolean }>`
  flex: 1;
  color: ${props => props.$placeholder ? '#666' : 'inherit'};
  opacity: ${props => props.$placeholder ? 0.8 : 1};
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const DateText = styled.span`
  font-weight: 500;
  white-space: nowrap;
`;

const ArrowIcon = styled.span`
  color: #6a11cb;
  display: flex;
  align-items: center;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors?.primary || '#6a11cb'};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  pointer-events: none;
  font-size: 1rem;
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  color: #a0aec0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  
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
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
  width: 1000px;
  max-width: 95vw;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    width: 95vw;
    flex-direction: column;
  }
`;

const PopupHeader = styled.div`
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderTitle = styled.div`
  font-size: 1.3rem;
  font-weight: 700;
`;

const PopupBody = styled.div`
  display: flex;
  flex: 1;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const CalendarSection = styled.div`
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
`;

const PresetSection = styled.div`
  width: 240px;
  border-right: 1px solid #e5e7eb;
  padding: 24px;
  background-color: #f8fafc;
  
  @media (max-width: 768px) {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
  }
`;

const PresetTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 16px;
  color: #333;
`;

const PresetList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PresetItem = styled.button<{ $active?: boolean }>`
  padding: 12px 16px;
  border-radius: 8px;
  border: none;
  background-color: ${props => props.$active ? '#6a11cb' : 'white'};
  color: ${props => props.$active ? 'white' : '#333'};
  text-align: left;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: ${props => props.$active ? '600' : '400'};
  
  &:hover {
    background-color: ${props => props.$active ? '#6a11cb' : 'rgba(106, 17, 203, 0.1)'};
    color: ${props => props.$active ? 'white' : '#6a11cb'};
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 20px;
`;

const WeekdayLabel = styled.div`
  text-align: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: #6b7280;
  padding: 8px 0;
`;

const DayCell = styled.button<{ 
  $isToday?: boolean; 
  $isSelected?: boolean; 
  $isInRange?: boolean;
  $isRangeStart?: boolean;
  $isRangeEnd?: boolean;
  $isCurrentMonth?: boolean;
  $isDisabled?: boolean;
  $isHovered?: boolean;
}>`
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${props => {
    if (props.$isRangeStart && props.$isRangeEnd) return '50%';
    if (props.$isRangeStart) return '50% 8px 8px 50%';
    if (props.$isRangeEnd) return '8px 50% 50% 8px';
    if (props.$isInRange) return '8px';
    return '50%';
  }};
  font-size: 0.9rem;
  border: none;
  background-color: ${props => {
    if (props.$isSelected || props.$isRangeStart || props.$isRangeEnd) return '#6a11cb';
    if (props.$isInRange || props.$isHovered) return 'rgba(106, 17, 203, 0.1)';
    if (props.$isToday) return 'rgba(106, 17, 203, 0.15)';
    return 'transparent';
  }};
  color: ${props => {
    if (props.$isSelected || props.$isRangeStart || props.$isRangeEnd) return 'white';
    if (!props.$isCurrentMonth) return '#d1d5db';
    if (props.$isDisabled) return '#d1d5db';
    if (props.$isInRange) return '#6a11cb';
    return '#333';
  }};
  font-weight: ${props => (props.$isToday || props.$isSelected || props.$isRangeStart || props.$isRangeEnd) ? '600' : 'normal'};
  cursor: ${props => props.$isDisabled ? 'not-allowed' : 'pointer'};
  pointer-events: ${props => props.$isDisabled ? 'none' : 'auto'};
  transition: all 0.2s ease;
  position: relative;
  
  &:hover:not(:disabled) {
    background-color: ${props => {
      if (props.$isSelected || props.$isRangeStart || props.$isRangeEnd) return '#6a11cb';
      return 'rgba(106, 17, 203, 0.15)';
    }};
  }
  
  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    font-size: 0.8rem;
  }
`;

const CalendarContainer = styled.div`
  display: flex;
  gap: 32px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 24px;
  }
`;

const MonthContainer = styled.div`
  flex: 1;
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
  text-align: center;
  flex: 1;
`;

const SelectionInfo = styled.div`
  background-color: rgba(106, 17, 203, 0.05);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  border: 1px solid rgba(106, 17, 203, 0.1);
`;

const SelectionTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: #6a11cb;
  margin-bottom: 8px;
`;

const SelectionDates = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.9rem;
  color: #333;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  background-color: #f8fafc;
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.$primary 
    ? `
      background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
      color: white;
      
      &:hover {
        box-shadow: 0 4px 12px rgba(106, 17, 203, 0.3);
        transform: translateY(-1px);
      }
    `
    : `
      background-color: white;
      color: #6b7280;
      border: 1px solid #e5e7eb;
      
      &:hover {
        background-color: #f3f4f6;
        border-color: #d1d5db;
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

// Default presets
const DEFAULT_PRESETS = [
  {
    label: 'Hoje',
    range: { 
      startDate: new Date(), 
      endDate: new Date() 
    }
  },
  {
    label: 'Ontem',
    range: { 
      startDate: addDays(new Date(), -1), 
      endDate: addDays(new Date(), -1) 
    }
  },
  {
    label: 'Últimos 7 dias',
    range: { 
      startDate: addDays(new Date(), -6), 
      endDate: new Date() 
    }
  },
  {
    label: 'Últimos 30 dias',
    range: { 
      startDate: addDays(new Date(), -29), 
      endDate: new Date() 
    }
  },
  {
    label: 'Este mês',
    range: { 
      startDate: startOfMonth(new Date()), 
      endDate: endOfMonth(new Date()) 
    }
  },
  {
    label: 'Mês passado',
    range: { 
      startDate: startOfMonth(addMonths(new Date(), -1)), 
      endDate: endOfMonth(addMonths(new Date(), -1)) 
    }
  }
];

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = 'Selecione o período',
  required = false,
  error,
  disabled = false,
  icon = <FaCalendarAlt />,
  presets = DEFAULT_PRESETS
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange>(value);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [selectionStep, setSelectionStep] = useState<'start' | 'end'>('start');
  const [isNavigating, setIsNavigating] = useState(false);
  
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
  
  // Generate calendar days for two months
  const getDaysInMonth = (month: Date) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });
    
    const firstDayOfMonth = getDay(start);
    const prevMonthDays = [];
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      prevMonthDays.push(addDays(start, -i - 1));
    }
    
    const lastDayOfMonth = getDay(end);
    const nextMonthDays = [];
    for (let i = 1; i <= 6 - lastDayOfMonth; i++) {
      nextMonthDays.push(addDays(end, i));
    }
    
    return [...prevMonthDays.reverse(), ...days, ...nextMonthDays];
  };
  
  const handleDayClick = (day: Date) => {
    if (selectionStep === 'start' || (tempRange.startDate && tempRange.endDate)) {
      setTempRange({ startDate: day, endDate: null });
      setSelectionStep('end');
    } else if (selectionStep === 'end' && tempRange.startDate) {
      if (isBefore(day, tempRange.startDate)) {
        setTempRange({ startDate: day, endDate: tempRange.startDate });
      } else {
        setTempRange({ ...tempRange, endDate: day });
      }
      setSelectionStep('start');
    }
  };
  
  const handlePresetClick = (preset: { label: string; range: DateRange }) => {
    setTempRange(preset.range);
    setSelectionStep('start');
    
    // Navegar automaticamente para o mês da data inicial do preset
    if (preset.range.startDate) {
      const startDate = preset.range.startDate;
      setIsNavigating(true);
      
      // Pequeno delay para feedback visual suave
      setTimeout(() => {
        setCurrentMonth(startDate);
        setIsNavigating(false);
      }, 150);
    }
  };
  
  const handleOpen = () => {
    if (!disabled) {
      setIsOpen(true);
      setTempRange(value);
      setSelectionStep('start');
      setCurrentMonth(value.startDate || new Date());
    }
  };
  
  const handleCancel = () => {
    setIsOpen(false);
    setTempRange(value);
  };
  
  const handleConfirm = () => {
    onChange(tempRange);
    setIsOpen(false);
  };
  
  const handleClear = () => {
    onChange({ startDate: null, endDate: null });
  };
  
  const formatDateRange = (range: DateRange) => {
    if (!range.startDate && !range.endDate) return placeholder;
    if (range.startDate && !range.endDate) {
      return `${format(range.startDate, "dd/MM/yyyy", { locale: ptBR })} - ...`;
    }
    if (range.startDate && range.endDate) {
      if (isSameDay(range.startDate, range.endDate)) {
        return format(range.startDate, "dd/MM/yyyy", { locale: ptBR });
      }
      return `${format(range.startDate, "dd/MM/yyyy", { locale: ptBR })} - ${format(range.endDate, "dd/MM/yyyy", { locale: ptBR })}`;
    }
    return placeholder;
  };
  
  const isDateInRange = (day: Date) => {
    if (!tempRange.startDate || !tempRange.endDate) return false;
    return isWithinInterval(day, { start: tempRange.startDate, end: tempRange.endDate });
  };
  
  const isDateInHoverRange = (day: Date) => {
    if (!tempRange.startDate || !hoveredDate || tempRange.endDate) return false;
    const start = isBefore(tempRange.startDate, hoveredDate) ? tempRange.startDate : hoveredDate;
    const end = isAfter(tempRange.startDate, hoveredDate) ? tempRange.startDate : hoveredDate;
    return isWithinInterval(day, { start, end });
  };
  
  const firstMonthDays = getDaysInMonth(currentMonth);
  const secondMonthDays = getDaysInMonth(addMonths(currentMonth, 1));
  
  const hasValue = value.startDate || value.endDate;
  
  return (
    <PickerContainer ref={containerRef}>
      <InputWrapper>
        <InputIcon>{icon}</InputIcon>
        
        <InputField 
          $hasError={!!error} 
          $isFocused={isOpen} 
          $disabled={disabled}
          onClick={handleOpen}
        >
          <InputText $placeholder={!hasValue}>
            {hasValue ? (
              <>
                <DateText>{formatDateRange(value)}</DateText>
              </>
            ) : (
              placeholder
            )}
          </InputText>
          
          {hasValue && !disabled && (
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
        <PopupOverlay onClick={(e) => e.stopPropagation()}>
          <PopupContent onClick={(e) => e.stopPropagation()}>
            <PopupHeader>
              <HeaderTitle>Selecionar Período</HeaderTitle>
            </PopupHeader>
            
            <PopupBody>
              <PresetSection>
                <PresetTitle>Períodos Rápidos</PresetTitle>
                <PresetList>
                  {presets.map((preset, index) => (
                    <PresetItem
                      key={index}
                      onClick={() => handlePresetClick(preset)}
                      $active={Boolean(
                        tempRange.startDate && tempRange.endDate && preset.range.startDate && preset.range.endDate &&
                        isSameDay(tempRange.startDate, preset.range.startDate) &&
                        isSameDay(tempRange.endDate, preset.range.endDate)
                      )}
                    >
                      {preset.label}
                    </PresetItem>
                  ))}
                </PresetList>
              </PresetSection>
              
              <CalendarSection>
                
                  <SelectionInfo>
                    <SelectionTitle>Período Selecionado</SelectionTitle>
                    {tempRange.startDate || tempRange.endDate ? (
                    <SelectionDates>
                      <span>
                        {tempRange.startDate 
                          ? format(tempRange.startDate, "dd 'de' MMM, yyyy", { locale: ptBR })
                          : 'Data inicial'
                        }
                      </span>
                      <ArrowIcon><FaArrowRight size={12} /></ArrowIcon>
                      <span>
                        {tempRange.endDate 
                          ? format(tempRange.endDate, "dd 'de' MMM, yyyy", { locale: ptBR })
                          : 'Data final'
                        }
                      </span>
                    </SelectionDates>
                    ) : (
                      <SelectionDates>
                        <span>Data inicial</span>
                        <ArrowIcon><FaArrowRight size={12} /></ArrowIcon>
                        <span>Data final</span>
                      </SelectionDates>
                    )}
                  </SelectionInfo>
                
                
                <CalendarContainer>
                  {/* Primeiro mês */}
                  <MonthContainer>
                    <Navigation>
                      <NavButton onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                        <FaChevronLeft />
                      </NavButton>
                      <MonthYearDisplay>
                        {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                      </MonthYearDisplay>
                      <div style={{ width: '36px' }} />
                    </Navigation>
                    
                    <CalendarGrid>
                      {WEEKDAYS.map(day => (
                        <WeekdayLabel key={day}>{day}</WeekdayLabel>
                      ))}
                      
                      {firstMonthDays.map((day, index) => {
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const isSelectedStart = tempRange.startDate ? isSameDay(day, tempRange.startDate) : false;
                        const isSelectedEnd = tempRange.endDate ? isSameDay(day, tempRange.endDate) : false;
                        const isInRange = isDateInRange(day);
                        const isInHoverRange = isDateInHoverRange(day);
                        const isCurrentDay = isToday(day);
                        const isDisabled = (minDate && isBefore(day, minDate)) || (maxDate && isAfter(day, maxDate));
                        
                        return (
                          <DayCell
                            key={index}
                            $isToday={isCurrentDay}
                            $isSelected={isSelectedStart || isSelectedEnd}
                            $isRangeStart={isSelectedStart}
                            $isRangeEnd={isSelectedEnd}
                            $isInRange={isInRange}
                            $isHovered={isInHoverRange}
                            $isCurrentMonth={isCurrentMonth}
                            $isDisabled={isDisabled}
                            onClick={() => !isDisabled && handleDayClick(day)}
                            onMouseEnter={() => setHoveredDate(day)}
                            onMouseLeave={() => setHoveredDate(null)}
                            disabled={isDisabled}
                          >
                            {format(day, 'd')}
                          </DayCell>
                        );
                      })}
                    </CalendarGrid>
                  </MonthContainer>
                  
                  {/* Segundo mês */}
                  <MonthContainer>
                    <Navigation>
                      <div style={{ width: '36px' }} />
                      <MonthYearDisplay>
                        {format(addMonths(currentMonth, 1), 'MMMM yyyy', { locale: ptBR })}
                      </MonthYearDisplay>
                      <NavButton onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                        <FaChevronRight />
                      </NavButton>
                    </Navigation>
                    
                    <CalendarGrid>
                      {WEEKDAYS.map(day => (
                        <WeekdayLabel key={day}>{day}</WeekdayLabel>
                      ))}
                      
                      {secondMonthDays.map((day, index) => {
                        const isCurrentMonth = isSameMonth(day, addMonths(currentMonth, 1));
                        const isSelectedStart = tempRange.startDate ? isSameDay(day, tempRange.startDate) : false;
                        const isSelectedEnd = tempRange.endDate ? isSameDay(day, tempRange.endDate) : false;
                        const isInRange = isDateInRange(day);
                        const isInHoverRange = isDateInHoverRange(day);
                        const isCurrentDay = isToday(day);
                        const isDisabled = (minDate && isBefore(day, minDate)) || (maxDate && isAfter(day, maxDate));
                        
                        return (
                          <DayCell
                            key={index}
                            $isToday={isCurrentDay}
                            $isSelected={isSelectedStart || isSelectedEnd}
                            $isRangeStart={isSelectedStart}
                            $isRangeEnd={isSelectedEnd}
                            $isInRange={isInRange}
                            $isHovered={isInHoverRange}
                            $isCurrentMonth={isCurrentMonth}
                            $isDisabled={isDisabled}
                            onClick={() => !isDisabled && handleDayClick(day)}
                            onMouseEnter={() => setHoveredDate(day)}
                            onMouseLeave={() => setHoveredDate(null)}
                            disabled={isDisabled}
                          >
                            {format(day, 'd')}
                          </DayCell>
                        );
                      })}
                    </CalendarGrid>
                  </MonthContainer>
                </CalendarContainer>
              </CalendarSection>
            </PopupBody>
            
            <ActionButtons>
              <ActionButton onClick={handleCancel}>
                <FaTimes size={12} /> Cancelar
              </ActionButton>
              
              <ActionButton $primary onClick={handleConfirm}>
                <FaCheck size={12} /> Confirmar Período
              </ActionButton>
            </ActionButtons>
          </PopupContent>
        </PopupOverlay>
      )}
    </PickerContainer>
  );
};

export default DateRangePicker; 