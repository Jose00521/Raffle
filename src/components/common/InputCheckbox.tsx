import React from 'react';
import styled from 'styled-components';

const CheckboxContainer = styled.label`
  display: flex;
  position: relative;
  align-items: center !important;
  padding-left: 35px;
  margin-bottom: 12px;
  cursor: pointer;
  font-size: 16px;
  user-select: none;
  color: ${props => props.theme.colors?.gray?.dark || '#374151'};
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
  margin-left: 10px;
`;

const ErrorText = styled.div`
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 4px;
  font-weight: 500;
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
    <div>
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
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
};

export default InputCheckbox;