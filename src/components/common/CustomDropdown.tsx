'use client';

import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FaChevronDown, FaCheck } from 'react-icons/fa';

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
  height: 46px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background-color: white;
  padding: 0 15px;
  font-size: 0.9rem;
  color: ${props => props.$hasValue ? props.theme.colors?.text?.primary || '#333' : props.theme.colors?.text?.secondary || '#666'};
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  text-align: left;
  
  &:focus {
    outline: none;
    border-color: #6a11cb;
    box-shadow: 0 0 0 2px rgba(106, 17, 203, 0.1);
  }
  
  &:hover {
    border-color: rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
    opacity: 0.7;
  }
  
  ${props => props.$isOpen && `
    border-color: #6a11cb;
    box-shadow: 0 0 0 2px rgba(106, 17, 203, 0.1);
  `}
`;

const DropdownContent = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  right: 0;
  max-height: 240px;
  overflow-y: auto;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 100;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.$isOpen ? 'translateY(0)' : 'translateY(-10px)'};
  transition: all 0.2s ease;
  
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
    max-height: 280px;
  }
`;

const OptionsList = styled.ul`
  list-style: none;
  padding: 8px 0;
  margin: 0;
`;

const OptionItem = styled.li<{ $isSelected: boolean }>`
  padding: 10px 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.9rem;
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
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
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
  placeholder = 'Select an option',
  icon,
  width,
  disabled = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(option => option.value === value);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const toggleDropdown = () => {
    if (!disabled) {
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
      
      <DropdownContent $isOpen={isOpen}>
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
    </DropdownContainer>
  );
};

export default CustomDropdown; 