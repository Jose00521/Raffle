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
import { CreatorFormProvider } from '@/context/CreatorFormContext';

const FormContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
    border-radius: 20px;
    pointer-events: none;
  }
  
  @media (max-width: 768px) {
    margin: 1rem;
    padding: 1.5rem;
    border-radius: 16px;
  }
`;

const FormHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
  z-index: 2;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: rgba(255,255,255,0.9);
  margin: 0;
  font-weight: 300;
`;

const ProgressContainer = styled.div`
  margin-bottom: 3rem;
  position: relative;
  z-index: 2;
`;

const ProgressBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  position: relative;
`;

const ProgressLine = styled.div`
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(255,255,255,0.2);
  border-radius: 1.5px;
  z-index: 1;
`;

const ProgressFill = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #4ade80, #22d3ee);
  border-radius: 1.5px;
  box-shadow: 0 0 10px rgba(74, 222, 128, 0.5);
`;

const StepCircle = styled(motion.div)<{ $active: boolean; $completed: boolean }>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => 
    props.$completed ? 'linear-gradient(135deg, #4ade80, #22d3ee)' :
    props.$active ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' :
    'rgba(255,255,255,0.2)'
  };
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
  position: relative;
  z-index: 3;
  border: 3px solid ${props =>
    props.$completed ? '#4ade80' :
    props.$active ? '#fbbf24' :
    'rgba(255,255,255,0.3)'
  };
  box-shadow: ${props =>
    props.$completed ? '0 0 20px rgba(74, 222, 128, 0.6)' :
    props.$active ? '0 0 20px rgba(251, 191, 36, 0.6)' :
    '0 4px 15px rgba(0,0,0,0.1)'
  };
  transition: all 0.3s ease;
`;

const StepLabel = styled.div<{ $active: boolean; $completed: boolean }>`
  text-align: center;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${props =>
    props.$completed || props.$active ? 'white' : 'rgba(255,255,255,0.7)'
  };
`;

const FormContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  position: relative;
  z-index: 2;
  min-height: 600px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  
  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
    min-height: 500px;
  }
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
`;

const Button = styled(motion.button)<{ $variant?: 'primary' | 'secondary' }>`
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
  
  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
  ` : `
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5db;
    
    &:hover {
      background: #e5e7eb;
      transform: translateY(-1px);
    }
  `}
  
  @media (max-width: 768px) {
    padding: 0.875rem 1.5rem;
    font-size: 0.9rem;
    min-width: 100px;
  }
`;

const stepIcons = [FaUser, FaLock, FaCog, FaCheck];
const stepLabels = ['Dados Pessoais', 'Segurança', 'Permissões', 'Revisão'];

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
    <FormContainer>
      <FormHeader>
        <Title>
          <FaShieldAlt style={{ marginRight: '0.5rem', color: '#fbbf24' }} />
          Cadastro Administrativo
        </Title>
        <Subtitle>
          Crie sua conta de administrador com acesso privilegiado
        </Subtitle>
      </FormHeader>

      <ProgressContainer>
        <ProgressBar>
          <ProgressLine>
            <ProgressFill
              initial={{ width: '0%' }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </ProgressLine>
          
          {[1, 2, 3, 4].map((stepNum) => {
            const StepIcon = stepIcons[stepNum - 1];
            const isActive = step === stepNum;
            const isCompleted = step > stepNum;
            
            return (
              <div key={stepNum} style={{ position: 'relative', zIndex: 3 }}>
                <StepCircle
                  $active={isActive}
                  $completed={isCompleted}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isCompleted ? <FaCheck /> : <StepIcon />}
                </StepCircle>
                <StepLabel $active={isActive} $completed={isCompleted}>
                  {stepLabels[stepNum - 1]}
                </StepLabel>
              </div>
            );
          })}
        </ProgressBar>
      </ProgressContainer>

      <FormContent>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: isSliding ? 50 : 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        <NavigationButtons>
          <Button
            type="button"
            onClick={handlePrevStep}
            disabled={step === 1}
            style={{ visibility: step === 1 ? 'hidden' : 'visible' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Voltar
          </Button>

          {isLastStep ? (
            <Button
              $variant="primary"
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? 'Cadastrando...' : 'Finalizar Cadastro'}
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
        </NavigationButtons>
      </FormContent>
    </FormContainer>
  );
};
// Componente principal que envolve o conteúdo com o Provider do contexto
const SteppedAdminForm: React.FC = () => {
    return (
      <AdminFormProvider>
        <FormContent />
      </AdminFormProvider>
    );
  };

export default SteppedAdminForm;
