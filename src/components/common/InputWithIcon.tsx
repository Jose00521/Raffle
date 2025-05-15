import React, { ReactNode } from 'react';
import styled from 'styled-components';

interface InputWithIconProps {
  id: string;
  name: string;
  label: string;
  icon: ReactNode;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
`;

const InputLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
`;

const RequiredMark = styled.span`
  color: #ef4444;
  margin-left: 4px;
`;

const InputWrapper = styled.div<{ $hasError?: boolean }>`
  display: flex;
  align-items: center;
  background: white;
  border-radius: 8px;
  border: 2px solid ${({ $hasError }) => 
    $hasError ? '#ef4444' : 'rgba(106, 17, 203, 0.1)'};
  padding: 0 16px;
  transition: all 0.2s ease;
  
  &:focus-within {
    border-color: ${({ $hasError }) => 
      $hasError ? '#ef4444' : '#6a11cb'};
    box-shadow: 0 0 0 3px ${({ $hasError }) => 
      $hasError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(106, 17, 203, 0.1)'};
  }
`;

const IconWrapper = styled.div`
  color: #666;
  font-size: 1rem;
  margin-right: 10px;
`;

const StyledInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  padding: 12px 0;
  font-size: 0.95rem;
  color: #333;
  outline: none;
  width: 100%;
  
  &::placeholder {
    color: #a3a3a3;
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const ErrorText = styled.div`
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 4px;
  font-weight: 500;
`;

const InputWithIcon: React.FC<InputWithIconProps> = ({
  id,
  name,
  label,
  icon,
  placeholder,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  className,
}) => {
  return (
    <InputContainer className={className}>
      <InputLabel htmlFor={id}>
        {label}
        {required && <RequiredMark>*</RequiredMark>}
      </InputLabel>
      
      <InputWrapper $hasError={!!error}>
        <IconWrapper>{icon}</IconWrapper>
        <StyledInput
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          disabled={disabled}
        />
      </InputWrapper>
      
      {error && <ErrorText>{error}</ErrorText>}
    </InputContainer>
  );
};

export default InputWithIcon; 