import styled, { keyframes, css } from 'styled-components';
import Link from 'next/link';

// Animações
export const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

export const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

export const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Container e Header
export const FormContainer = styled.div`
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.15);
  overflow: hidden !important;
  max-width: 100% !important;
  height: 100%;
  display: flex;
  flex-direction: column;
  animation: ${css`${fadeIn} 0.5s ease`};
  position: relative;

  @media (max-width: 480px) {
    margin: 0 !important;
    border-radius: 0;
    min-width: 100vw !important;
  }
`;

export const FormHeader = styled.div`
  background: linear-gradient(135deg, #6a11cb 0%, #8e44ad 100%);
  background-size: 200% 200%;
  max-width: 100% !important;
  animation: ${css`${gradientMove} 10s ease infinite`};
  padding: 1.5rem;
  color: white;
  text-align: center;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 60%);
    transform: rotate(30deg);
  }
  
  @media (max-width: 768px) {
    padding: 1.2rem 0.8rem;
  }
  
  @media (max-width: 480px) {
    padding: 1rem 0.7rem;
  }
`;

export const FormTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  letter-spacing: -0.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

export const FormSubtitle = styled.p`
  margin: 0.5rem 0 0;
  opacity: 0.9;
  font-size: 0.95rem;
  font-weight: 300;
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
    margin-top: 0.3rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

// Step Indicator
export const StepIndicator = styled.div`
  display: flex;
  align-items: center;
  max-width: 100vw !important;
  padding: 1rem 1.5rem;
  background-color: #f8fafc;
  border-bottom: 1px solid #e9ecef;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  position: relative;
  flex-shrink: 0;
  overflow-x: auto;
  justify-content: space-between;
  
  &::-webkit-scrollbar {
    height: 0;
    width: 0;
    background: transparent;
  }
  
  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    justify-content: space-between;
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem 0.5rem;
    height: auto !important;
    justify-content: space-between;
  }
`;

export const StepItem = styled.div<{ $active: boolean; $completed: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
  cursor: ${props => props.$completed ? 'pointer' : 'default'};
  transition: all 0.3s ease;
  width: auto;
  padding: 0 0.25rem;
  
  ${props => props.$active && css`
    transform: scale(1.05);
  `}
  
  @media (max-width: 768px) {
    padding: 0 0.1rem;
  }
  
  @media (max-width: 480px) {
    padding: 0;
  }
`;

export const StepNumber = styled.div<{ $active: boolean; $completed: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${props => 
    props.$completed 
      ? '#10b981' 
      : props.$active 
        ? '#6a11cb' 
        : '#e2e8f0'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.3rem;
  font-weight: 600;
  transition: all 0.3s ease;
  
  ${props => props.$active && !props.$completed && css`
    animation: ${pulse} 1.5s infinite;
    box-shadow: 0 0 0 5px rgba(106, 17, 203, 0.2);
  `}
  
  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
    font-size: 0.9rem;
  }
  
  @media (max-width: 480px) {
    width: 24px;
    height: 24px;
    font-size: 0.8rem;
  }
`;

export const StepIcon = styled.div<{ $active: boolean }>`
  color: ${props => props.$active ? '#6a11cb' : '#94a3b8'};
  font-size: 1.2rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.3rem;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-top: 0.2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
    margin-top: 0.1rem;
  }
`;

export const StepConnector = styled.div<{ $completed: boolean }>`
  flex: 1;
  height: 2px;
  background-color: ${props => props.$completed ? '#10b981' : '#e2e8f0'};
  transition: background-color 0.3s ease;
  min-width: 40px;
  
  @media (max-width: 768px) {
    min-width: 20px;
  }
  
  @media (max-width: 480px) {
    min-width: 10px;
  }
`;

// Form Layout
export const Form = styled.form`
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden !important;
  flex: 1;
`;

export const StepsContainer = styled.div<{ $step: number; $isSliding: boolean }>`
  display: flex;
  transition: transform 0.3s ease, opacity 0.2s ease;
  width: 500%; /* Increased to accommodate 5 steps for PJ */
  transform: translateX(${props => (props.$step - 1) * -20}%); /* Adjusted to 20% per step */
  opacity: ${props => (props.$isSliding ? '0.8' : '1')};
  flex: 1;
  overflow: hidden !important;
  
  & > * {
    width: 20%; /* Each step takes 20% of the container width */
    min-width: 20%;
    max-width: 20%;
    flex-shrink: 0;
  }
`;

// Form Components
export const FormRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  width: 100%;
  
  & > div {
    flex: 1;
    min-width: 0; /* Ensures children don't overflow */
  }
  
  @media (max-width: 768px) {
    gap: 0.6rem;
    margin-bottom: 0.5rem;
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.4rem;
  }
`;

export const FormGroup = styled.div<{ $fullWidth?: boolean }>`
  flex: ${props => props.$fullWidth ? 1 : 'auto'};
  max-width: 100%;
  position: relative;
  min-height: 75px; /* Reduce space for field + error message */
  margin-bottom: 0;
`;

export const FormGroup2 = styled.div<{ $fullWidth?: boolean }>`
  max-width: 100%;
  position: relative;
  min-height: 75px; /* Reduce space for field + error message */
  margin-bottom: 0 !important;
`;

// Step Content
export const StepContent = styled.div`
  padding: 1rem !important;
  flex: 1;
  width: 100%; /* Take full width of its parent (which is 20% of StepsContainer) */
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  scrollbar-width: thin;
  scrollbar-color: rgba(106, 17, 203, 0.5) rgba(241, 242, 243, 0.5);
  
  /* Garante espaçamento consistente entre grupos de campos */
  & ${FormRow}:last-child {
    margin-bottom: 0; /* Remove margem extra no último grupo */
  }
  
  /* Ajuste para garantir que os FormGroups mantenham altura consistente */
  & ${FormGroup} {
    display: flex;
    flex-direction: column;
  }
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(241, 242, 243, 0.5);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(106, 17, 203, 0.5);
    border-radius: 3px;
  }

  @media (max-width: 768px) {
    padding: 0.75rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem;
  }
`;

export const StepContentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  width: 100%;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    margin-bottom: 1.25rem;
    padding-bottom: 0.6rem;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
  }
`;

export const StepContentIcon = styled.div`
  font-size: 1.1rem;
  color: #6a11cb;
  background: rgba(106, 17, 203, 0.1);
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    width: 28px;
    height: 28px;
    border-radius: 6px;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
    width: 24px;
    height: 24px;
    border-radius: 6px;
  }
`;

export const StepContentTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  overflow: visible;
  white-space: normal;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

// Buttons
export const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  border: 1px solid #d1d5db;
  color: #4b5563;
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  
  &:hover {
    background-color: #f3f4f6;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }
  
  @media (max-width: 480px) {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
  }
`;

export const NextButton = styled.button<{ $isValid?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: ${props => props.$isValid === false ? '#a0aec0' : 'linear-gradient(135deg, #6a11cb 0%, #8e44ad 100%)'};
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: ${props => props.$isValid === false ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  box-shadow: ${props => props.$isValid === false ? 'none' : '0 4px 12px rgba(106, 17, 203, 0.2)'};
  position: relative;
  overflow: hidden;
  opacity: ${props => props.$isValid === false ? '0.7' : '1'};
  min-width: 140px;
  min-height: 45px;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: 0.6s;
    display: ${props => props.$isValid === false ? 'none' : 'block'};
  }
  
  &:hover {
    transform: ${props => props.$isValid === false ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.$isValid === false ? 'none' : '0 8px 16px rgba(106, 17, 203, 0.3)'};
    
    &::after {
      left: ${props => props.$isValid === false ? '-100%' : '100%'};
    }
  }
  
  &:active {
    transform: ${props => props.$isValid === false ? 'none' : 'translateY(0)'};
    box-shadow: ${props => props.$isValid === false ? 'none' : '0 4px 8px rgba(106, 17, 203, 0.2)'};
  }
  
  &:disabled {
    background: #94a3b8;
    opacity: 0.7;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
    
    &::after {
      display: none;
    }
  }
  
  @media (max-width: 480px) {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
  }
`;

export const SubmitButton = styled(NextButton)`
  background-size: 200% 200%;
  animation: ${props => props.$isValid === false ? 'none' : css`${gradientMove} 3s ease infinite`};
  min-width: 140px;
  min-height: 45px;
  
  &:disabled {
    background: #94a3b8;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
    opacity: 0.7;
    
    &::after {
      display: none;
    }
  }
`;

// Password Specific
export const PasswordContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
`;

export const PasswordStrengthMeter = styled.div`
  height: 8px;
  background-color: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 0.75rem;
`;

export const PasswordStrengthIndicator = styled.div<{ $strength: number }>`
  height: 100%;
  background-color: ${props => {
    switch (props.$strength) {
      case 0: return '#dc3545';
      case 1: return '#ffc107';
      case 2: return '#0dcaf0';
      case 3: return '#6a11cb';
      case 4: return '#10b981';
      default: return '#e2e8f0';
    }
  }};
  width: ${props => props.$strength * 25}%;
  transition: width 0.3s ease, background-color 0.3s ease;
`;

export const PasswordStrengthText = styled.div<{ $strength: number }>`
  font-size: 0.8rem;
  margin-top: 0.25rem;
  text-align: right;
  color: ${props => {
    switch (props.$strength) {
      case 0: return '#dc3545';
      case 1: return '#ffc107';
      case 2: return '#0dcaf0';
      case 3: return '#6a11cb';
      case 4: return '#10b981';
      default: return '#64748b';
    }
  }};
  font-weight: 500;
`;

// Confirmation Page
export const ConfirmationSection = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
    margin-bottom: 1.25rem;
  }
`;

export const ConfirmationSectionTitle = styled.h4`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1rem;
  font-weight: 600;
  color: #1e293b;
  font-size: 1.1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
  }
`;

export const ConfirmationRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  padding: 0.25rem 0;
  
  &:not(:last-child) {
    border-bottom: 1px dashed #edf2f7;
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.25rem;
  }
`;

export const ConfirmationLabel = styled.span`
  font-weight: 500;
  color: #4b5563;
`;

export const ConfirmationValue = styled.span`
  font-weight: 400;
  color: #1e293b;
  
  @media (max-width: 480px) {
    font-weight: 500;
  }
`;

// Terms Section
export const TermsCheckboxContainer = styled.div`
  display: flex;
  margin-top: 1.5rem;
  padding: 1.5rem;
  align-items: center !important;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  
  a {
    color: #6a11cb;
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

export const TermsContainer = styled.div`
  margin-top: 1.5rem;
  padding: 0.5rem 0;
`;

export const TermsText = styled.span`
  font-size: 0.9rem;
  color: #4b5563;
  line-height: 1.5;
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

export const TermsLink = styled(Link)`
  color: #6a11cb;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s ease;
  
  &:hover {
    color: #8e44ad;
    text-decoration: underline;
  }
`;

// Misc Components
export const StyledFormDatePickerWrapper = styled.div`
  .react-datepicker-wrapper {
    width: 100%;
  }

  .react-datepicker__input-container input {
    width: 100%;
    height: 100%;
    padding: 0.75rem 0.75rem 0.75rem 2rem;
    border: 1px solid ${props => props.theme.colors?.gray?.light || '#d1d5db'};
    border-radius: 8px;
    font-size: 1rem;
    color: #4b5563;
    
    &:focus {
      outline: none;
      border-color: #6a11cb;
    }
  }
`;

export const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(106, 17, 203, 0.3);
  border-radius: 50%;
  border-top-color: #6a11cb;
  animation: ${spin} 1s linear infinite;
`;

export const SecurityText = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
  
  svg {
    color: #6a11cb;
    font-size: 1rem;
  }
  
  @media (max-height: 800px) {
    font-size: 0.8rem;
    gap: 6px;
    
    svg {
      font-size: 0.9rem;
    }
  }
  
  @media (max-height: 700px) {
    font-size: 0.75rem;
    gap: 5px;
    
    svg {
      font-size: 0.85rem;
    }
  }
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
    
    svg {
      font-size: 0.9rem;
    }
  }
  
  @media (max-width: 480px) {
    font-size: 0.75rem;
    
    svg {
      font-size: 0.85rem;
    }
  }
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  border-top: 1px solid #e9ecef;
  background-color: #f8fafc;
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    padding: 0.75rem 1.25rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem 1rem;
  }
`;