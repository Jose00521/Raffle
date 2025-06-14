import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FaExclamationCircle } from 'react-icons/fa';

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 6px;
  position: relative;
  min-height: 45px; /* Reserva espaço para o erro */
  
  @media (max-height: 800px) {
    min-height: 42px;
  }
  
  @media (max-height: 700px) {
    min-height: 40px;
  }
`;

const CheckboxContainer = styled.label`
  display: flex;
  position: relative;
  align-items: center !important;
  padding-left: 35px;
  cursor: pointer;
  font-size: 14px;
  user-select: none;
  color: ${props => props.theme.colors?.gray?.dark || '#374151'};
  line-height: 1.4;
`;

const CustomCheckbox = styled.input`
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;

  &:checked ~ .checkmark {
    background-color: #6a11cb;
  }

  &:checked ~ .checkmark::after {
    display: block;
  }
`;

const Checkmark = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  height: 25px;
  width: 25px;
  background-color: #eee;
  border-radius: 4px;
  transition: background-color 0.3s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);

  &::after {
    content: "";
    position: absolute;
    display: none;
    left: 9px;
    top: 5px;
    width: 5px;
    height: 10px;
    border: solid white;
    border-width: 0 3px 3px 0;
    transform: rotate(45deg);
    animation: checkAnim 0.2s forwards;
  }

  @keyframes checkAnim {
    0% {
      height: 0;
    }
    100% {
      height: 10px;
    }
  }
`;

const LabelText = styled.span`
  margin-left: 8px;
  line-height: 1.4;
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ErrorText = styled.div`
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 4px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  animation: ${fadeIn} 0.2s ease;
  position: absolute;
  bottom: -18px;
  left: 0;
  right: 0;
  min-height: 14px;
  line-height: 1.3;
  
  @media (max-height: 800px) {
    margin-top: 3px;
    font-size: 0.7rem;
    bottom: -16px;
    min-height: 13px;
  }
  
  @media (max-height: 700px) {
    margin-top: 2px;
    font-size: 0.65rem;
    bottom: -14px;
    min-height: 12px;
  }
`;

const ErrorIcon = styled(FaExclamationCircle)`
  min-width: 12px;
  min-height: 12px;
  
  @media (max-height: 800px) {
    min-width: 11px;
    min-height: 11px;
  }
  
  @media (max-height: 700px) {
    min-width: 10px;
    min-height: 10px;
  }
`;

interface InputCheckboxProps {
  id: string;
  name?: string;
  label: string | React.ReactNode;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
}

const InputCheckbox: React.FC<InputCheckboxProps> = ({
  id,
  label,
  name,
  checked = false,
  onChange,
  onBlur,
  error,
  disabled = false,
  required = false,
  onClick,
  ...rest
}) => {
  return (
    <CheckboxGroup>
      <CheckboxContainer>
        <CustomCheckbox
          id={id}
          name={name || id}
          checked={checked}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          type="checkbox"
          onClick={onClick}
          {...rest}
        />
        <Checkmark className="checkmark"></Checkmark>
        <LabelText>{label}</LabelText>
      </CheckboxContainer>
      
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
    </CheckboxGroup>
  );
};

export default InputCheckbox;