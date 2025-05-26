'use client';

import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FaChevronDown, FaCheck } from 'react-icons/fa';
import { Portal } from './Portal';

interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  width?: string;
  disabled?: boolean;
  className?: string;
}

const DropdownContainer = styled.div<{ $width?: string }>`
  position: relative;
  width: ${props => props.$width || '100%'};
  max-width: 100%;
  display: inline-block;
`;

const DropdownButton = styled.button<{ $isOpen: boolean, $hasValue: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  border-radius: 8px;
  border: 2px solid rgba(0, 0, 0, 0);
  background-color: #f8f9fa;
  padding: 16px 15px 16px 15px;
  font-size: 1rem;
  color: ${props => props.$hasValue ? props.theme.colors?.text?.primary || '#333' : props.theme.colors?.text?.secondary || '#666'};
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  text-align: left;
  
  &:focus {
    outline: none;
    border: 2px solid #6a11cb;
    background-color: white;
  }
  
  &:hover {
    background-color: #f1f3f5;
  }
  
  &:disabled {
    background-color: #f3f4f6;
    cursor: not-allowed;
    opacity: 0.7;
  }
  
  ${props => props.$isOpen && `
    border: 2px solid #6a11cb;
    background-color: white;
  `}
  
  @media (max-height: 900px) {
    height: 45px !important;
  }
  
  @media (max-height: 800px) {
    height: 42px !important;
    font-size: 0.85rem;
    padding: 0 12px;
  }
  
  @media (max-height: 700px) {
    height: 38px !important;
    font-size: 0.8rem;
    padding: 0 10px;
  }
`;

const DropdownContent = styled.div<{ $maxHeight?: number }>`
  max-height: ${props => props.$maxHeight ? `${props.$maxHeight}px` : '240px'};
  overflow-y: auto;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  width: 100%;
  
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background-color: rgba(0, 0, 0, 0.03);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }
  
  @media (max-width: 768px) {
    max-height: ${props => props.$maxHeight ? `${props.$maxHeight}px` : '280px'};
  }
`;

const PortalContainer = styled.div<{ 
  $top: number; 
  $left: number; 
  $width: number;
  $direction: 'down' | 'up';
}>`
  position: absolute;
  top: ${props => props.$direction === 'down' ? `${props.$top}px` : 'auto'};
  bottom: ${props => props.$direction === 'up' ? `calc(100vh - ${props.$top}px + 10px)` : 'auto'};
  left: ${props => `${props.$left}px`};
  width: ${props => `${props.$width}px`};
  z-index: 9999;
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(${props => props.$direction === 'down' ? '-10px' : '10px'}); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const OptionsList = styled.ul`
  list-style: none;
  padding: 8px 0;
  margin: 0;
`;

const OptionItem = styled.li<{ $isSelected: boolean }>`
  padding: 12px 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: ${props => props.$isSelected ? '#6a11cb' : props.theme.colors?.text?.primary || '#333'};
  background-color: ${props => props.$isSelected ? 'rgba(106, 17, 203, 0.05)' : 'transparent'};
  font-weight: ${props => props.$isSelected ? '500' : 'normal'};
  
  &:hover {
    background-color: ${props => props.$isSelected ? 'rgba(106, 17, 203, 0.08)' : 'rgba(0, 0, 0, 0.04)'};
  }
  
  @media (max-width: 768px) {
    padding: 12px 15px; /* Larger touch target on mobile */
  }
`;

const IconWrapper = styled.span`
  margin-right: 10px;
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors?.primary || '#6a11cb'};
  font-size: 1.1rem;
`;

const CheckIcon = styled.span`
  color: #6a11cb;
  display: flex;
  align-items: center;
`;

const ChevronIcon = styled.span<{ $isOpen: boolean }>`
  transition: transform 0.2s ease;
  transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
`;

const SelectedText = styled.div`
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Selecione uma opção',
  icon,
  width,
  disabled = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    direction: 'down' as 'down' | 'up',
    maxHeight: 240
  });
  
  const selectedOption = options.find(option => option.value === value);
  
  // Função para calcular e ajustar a posição do dropdown com base no espaço disponível
  const calculatePosition = () => {
    if (!buttonRef.current) return;
    
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY;
    
    // Espaço disponível abaixo do botão
    const spaceBelow = viewportHeight - buttonRect.bottom;
    // Espaço disponível acima do botão
    const spaceAbove = buttonRect.top;
    
    // Altura estimada do dropdown (pode ser ajustada conforme necessário)
    const estimatedDropdownHeight = Math.min(240, options.length * 45);
    
    // Determinar se o dropdown deve aparecer abaixo ou acima do botão
    const direction = spaceBelow >= estimatedDropdownHeight || spaceBelow >= spaceAbove
      ? 'down'
      : 'up';
    
    // Calcular a altura máxima disponível
    const maxHeight = direction === 'down'
      ? Math.min(240, spaceBelow - 10) // -10 para margem
      : Math.min(240, spaceAbove - 10);
    
    setDropdownPosition({
      top: direction === 'down' ? buttonRect.bottom + scrollY : buttonRect.top + scrollY,
      left: buttonRect.left + window.scrollX,
      width: buttonRect.width,
      direction,
      maxHeight
    });
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Recalcular posição ao redimensionar a janela
  useEffect(() => {
    const handleResize = () => {
      if (isOpen) {
        calculatePosition();
      }
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, [isOpen]);
  
  const toggleDropdown = () => {
    if (!disabled) {
      if (!isOpen) {
        calculatePosition();
      }
      setIsOpen(!isOpen);
    }
  };
  
  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };
  
  return (
    <DropdownContainer ref={dropdownRef} $width={width} className={className}>
      <DropdownButton 
        ref={buttonRef}
        type="button"
        onClick={toggleDropdown}
        $isOpen={isOpen}
        $hasValue={!!selectedOption}
        disabled={disabled}
      >
        {icon && <IconWrapper>{icon}</IconWrapper>}
        <SelectedText>
          {selectedOption ? selectedOption.label : placeholder}
        </SelectedText>
        <ChevronIcon $isOpen={isOpen}>
          <FaChevronDown size={12} />
        </ChevronIcon>
      </DropdownButton>
      
      {isOpen && (
        <Portal>
          <PortalContainer
            $top={dropdownPosition.top}
            $left={dropdownPosition.left}
            $width={dropdownPosition.width}
            $direction={dropdownPosition.direction}
          >
            <DropdownContent $maxHeight={dropdownPosition.maxHeight}>
              <OptionsList>
                {options.map((option) => (
                  <OptionItem
                    key={option.value}
                    $isSelected={option.value === value}
                    onClick={() => handleSelect(option.value)}
                  >
                    {option.label}
                    {option.value === value && (
                      <CheckIcon>
                        <FaCheck size={12} />
                      </CheckIcon>
                    )}
                  </OptionItem>
                ))}
              </OptionsList>
            </DropdownContent>
          </PortalContainer>
        </Portal>
      )}
    </DropdownContainer>
  );
};

export default CustomDropdown; 