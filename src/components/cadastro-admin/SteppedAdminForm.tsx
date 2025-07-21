'use client';

import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminFormProvider, useAdminFormContext } from '@/context/AdminFormContext';
import { FaShieldAlt, FaUser, FaLock, FaCog, FaCheck } from 'react-icons/fa';

// Importar os steps
import Step1PersonalInfo from './steps/Step1PersonalInfo';
import Step2Security from './steps/Step2Security';
import Step3Permissions from './steps/Step3Permissions';
import Step4Review from './steps/Step4Review';

const PageContainer = styled.div`
  min-height: 100vh;
  height: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  
  @media (max-width: 768px) {
    padding: 0.5rem;
  }
`;

const FormWrapper = styled.div`
  width: 100%;
  max-width: 1000px;
  background: white;
  border-radius: 16px;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  border: 1px solid #e2e8f0;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    margin-top: 1rem;
  }
`;

const Header = styled.div`
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  padding: 1.5rem 2rem;
  text-align: center;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: rgba(255, 255, 255, 0.2);
  }
  
  @media (max-width: 768px) {
    padding: 1.25rem 1.5rem;
  }
`;

const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.025em;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1rem;
  margin: 0;
  opacity: 0.9;
  font-weight: 400;
`;

const ProgressSection = styled.div`
  padding: 1rem 2rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
`;

const ProgressTrack = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  margin: 0;
`;

const ProgressLine = styled.div`
  position: absolute;
  top: 30%;
  left: 5%;
  width: 90%;
  height: 2px;
  background: #e2e8f0;
  transform: translateY(-50%);
  z-index: 1;
`;

const ProgressFill = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #4f46e5, #7c3aed);
  border-radius: 1px;
`;

const StepIndicator = styled(motion.div)<{ $active: boolean; $completed: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  position: relative;
  z-index: 2;
  border: 2px solid ${props => 
    props.$completed ? '#10b981' :
    props.$active ? '#4f46e5' : '#d1d5db'
  };
  background: ${props => 
    props.$completed ? '#10b981' :
    props.$active ? '#4f46e5' : '#ffffff'
  };
  color: ${props => 
    props.$completed || props.$active ? '#ffffff' : '#6b7280'
  };
  transition: all 0.2s ease-in-out;
  
  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
    font-size: 0.7rem;
  }
`;

const StepLabel = styled.div<{ $active: boolean; $completed: boolean }>`
  font-size: 0.7rem;
  font-weight: 600;
  color: ${props => 
    props.$completed ? '#10b981' :
    props.$active ? '#4f46e5' : '#6b7280'
  };
  text-align: center;
  margin-top: 0.375rem;
  
  @media (max-width: 768px) {
    font-size: 0.65rem;
    margin-top: 0.25rem;
  }
`;

const StepItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 100px;
  
  @media (max-width: 768px) {
    max-width: 70px;
  }
`;

const ContentArea = styled.div`
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1.25rem;
  }
`;

const Navigation = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2.5rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  gap: 1rem;
  
  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
    flex-direction: column-reverse;
    gap: 0.75rem;
  }
`;

const Button = styled(motion.button)<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  min-width: 100px;
  
  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    color: white;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    
    &:hover:not(:disabled) {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      transform: translateY(-1px);
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
  ` : `
    background: white;
    color: #374151;
    border: 1px solid #d1d5db;
    
    &:hover {
      background: #f9fafb;
      border-color: #9ca3af;
    }
  `}
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 0.875rem 1.5rem;
  }
`;

const stepIcons = [FaUser, FaLock, FaCog, FaCheck];
const stepLabels = ['Informações', 'Segurança', 'Permissões', 'Confirmação'];

const StepFormContent: React.FC = () => {
  const { step, isSliding, isSubmitting, handleNextStep, handlePrevStep, form, onSubmit } = useAdminFormContext();
  
  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1PersonalInfo />;
      case 2:
        return <Step2Security />;
      case 3:
        return <Step3Permissions />;
      case 4:
        return <Step4Review />;
      default:
        return <Step1PersonalInfo />;
    }
  };

  const isLastStep = step === 4;
  const progressPercentage = ((step - 1) / 3) * 100;

  return (
    <PageContainer>
      <FormWrapper>
        <Header>
          <Title>
            <FaShieldAlt style={{ marginRight: '0.5rem' }} />
            Cadastro Administrativo
          </Title>
          <Subtitle>
            Configure sua conta com privilégios administrativos
          </Subtitle>
        </Header>

        <ProgressSection>
          <ProgressTrack>
            <ProgressLine>
              <ProgressFill
                initial={{ width: '0%' }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              />
            </ProgressLine>
            
            {[1, 2, 3, 4].map((stepNum) => {
              const StepIcon = stepIcons[stepNum - 1];
              const isActive = step === stepNum;
              const isCompleted = step > stepNum;
              
              return (
                <StepItem key={stepNum}>
                  <StepIndicator
                    $active={isActive}
                    $completed={isCompleted}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isCompleted ? <FaCheck /> : <StepIcon />}
                  </StepIndicator>
                  <StepLabel $active={isActive} $completed={isCompleted}>
                    {stepLabels[stepNum - 1]}
                  </StepLabel>
                </StepItem>
              );
            })}
          </ProgressTrack>
        </ProgressSection>

        <ContentArea>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </ContentArea>

        <Navigation>
          <Button
            type="button"
            onClick={handlePrevStep}
            disabled={step === 1}
            style={{ visibility: step === 1 ? 'hidden' : 'visible' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Anterior
          </Button>

          {isLastStep ? (
            <Button
              $variant="primary"
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? 'Criando conta...' : 'Finalizar cadastro'}
            </Button>
          ) : (
            <Button
              $variant="primary"
              onClick={handleNextStep}
              disabled={isSliding}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Próximo
            </Button>
          )}
        </Navigation>
      </FormWrapper>
    </PageContainer>
  );
};

// Componente principal que envolve o conteúdo com o Provider do contexto
const SteppedAdminForm: React.FC<{ token: string }> = ({ token }) => {
    return (
      <AdminFormProvider token={token}>
        <StepFormContent />
      </AdminFormProvider>
    );
};

export default SteppedAdminForm;
