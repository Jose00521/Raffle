'use client';

import React from 'react';
import styled from 'styled-components';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  colorOn?: string;
  colorOff?: string;
}

const SwitchContainer = styled.div<{ $disabled?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  opacity: ${({ $disabled }) => ($disabled ? '0.6' : '1')};
`;

const SwitchLabel = styled.label<{ $size: string , $disabled?: boolean}>`
  display: inline-block;
  position: relative;
  width: ${({ $size }) => ($size === 'small' ? '40px' : $size === 'large' ? '70px' : '60px')};
  height: ${({ $size }) => ($size === 'small' ? '24px' : $size === 'large' ? '40px' : '34px')};
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
`;

const HiddenInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
`;

const Slider = styled.span<{ $size: string; $colorOn: string; $colorOff: string }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  cursor: inherit;
  background-color: ${({ $colorOff }) => $colorOff};
  border-radius: 34px;
  transition: background-color 0.3s ease;

  &:before {
    position: absolute;
    content: "";
    height: ${({ $size }) => ($size === 'small' ? '18px' : $size === 'large' ? '32px' : '26px')};
    width: ${({ $size }) => ($size === 'small' ? '18px' : $size === 'large' ? '32px' : '26px')};
    left: ${({ $size }) => ($size === 'small' ? '3px' : $size === 'large' ? '4px' : '4px')};
    bottom: ${({ $size }) => ($size === 'small' ? '3px' : $size === 'large' ? '4px' : '4px')};
    background-color: #ffffff;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  }

  ${HiddenInput}:checked + & {
    background-color: ${({ $colorOn }) => $colorOn};
  }

  ${HiddenInput}:checked + &:before {
    transform: translateX(
      ${({ $size }) => ($size === 'small' ? '16px' : $size === 'large' ? '30px' : '26px')}
    );
  }

  ${HiddenInput}:focus + & {
    box-shadow: 0 0 1px ${({ $colorOn }) => $colorOn};
  }
`;

const LabelText = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
`;

/**
 * Um componente de toggle switch elegante e customizável.
 * 
 * @example
 * // Uso básico
 * <ToggleSwitch checked={isActive} onChange={setIsActive} />
 * 
 * @example
 * // Com label e tamanho personalizado
 * <ToggleSwitch 
 *   checked={isActive}
 *   onChange={setIsActive}
 *   label="Status"
 *   size="large"
 *   colorOn="#4CAF50"
 *   colorOff="#F44336"
 * />
 */
const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  className,
  size = 'medium',
  colorOn = '#66bb6a',
  colorOff = '#ff6b6b'
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      onChange(e.target.checked);
    }
  };

  const getSizeValue = () => {
    return size;
  };

  return (
    <SwitchContainer className={className} $disabled={disabled}>
      {label && <LabelText>{label}</LabelText>}
      <SwitchLabel $size={getSizeValue()} $disabled={disabled}>
        <HiddenInput
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
        />
        <Slider $size={getSizeValue()} $colorOn={colorOn} $colorOff={colorOff} />
      </SwitchLabel>
    </SwitchContainer>
  );
};

export default ToggleSwitch; 