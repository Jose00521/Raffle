'use client';

import React from 'react';
import { FaCheckCircle, FaUser, FaBuilding, FaMapMarked, FaShieldAlt, FaArrowRight, FaArrowLeft, FaLock } from 'react-icons/fa';
import { CreatorFormProvider, useCreatorFormContext } from '@/context/CreatorFormContext';
import LoadingDots from '../common/LoadingDots';

import Step1AccountType from './steps/Step1AccountType';
import Step2PersonalInfo from './steps/Step2PersonalInfo';
import Step3Address from './steps/Step3Address';
import Step4Access from './steps/Step4Access';

import { 
  FormContainer,
  FormHeader,
  FormTitle,
  FormSubtitle,
  StepIndicator,
  StepItem,
  StepIcon,
  StepNumber,
  StepConnector,
  Form,
  StepsContainer,
  ButtonContainer,
  BackButton,
  NextButton,
  SubmitButton,
  SecurityText
} from '../../styles/registration.styles';
import Image from 'next/image';

const MemoizedStep1AccountType = React.memo(Step1AccountType);
const MemoizedStep2PersonalInfo = React.memo(Step2PersonalInfo);
const MemoizedStep3Address = React.memo(Step3Address);
const MemoizedStep4Access = React.memo(Step4Access);

// Componente interno para o conteúdo do formulário
const FormContent: React.FC = () => {
  const { 
    form, 
    step, 
    isSliding, 
    handleNextStep, 
    handlePrevStep, 
    setStep, 
    isSubmitting,
    onSubmit
  } = useCreatorFormContext();

  return (
    <FormContainer>
      <FormHeader>
        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
          
        </div>
        <FormTitle>Cadastro de Criador</FormTitle>
        <FormSubtitle>
          {step === 1 && 'Escolha o tipo de conta que melhor se adapta ao seu perfil'}
          {step === 2 && 'Preencha seus dados pessoais'}
          {step === 3 && 'Informe seu endereço para contato'}
          {step === 4 && 'Configure seu acesso à plataforma'}
        </FormSubtitle>
      </FormHeader>
      
      <StepIndicator>
        <StepItem $active={step === 1} $completed={step > 1} onClick={() => step > 1 && setStep(1)}>
          <StepNumber $active={step === 1} $completed={step > 1}>
            {step > 1 ? <FaCheckCircle /> : 1}
          </StepNumber>
          <StepIcon $active={step === 1}><FaBuilding /></StepIcon>
        </StepItem>
        
        <StepConnector $completed={step > 1} />
        
        <StepItem $active={step === 2} $completed={step > 2} onClick={() => step > 2 && setStep(2)}>
          <StepNumber $active={step === 2} $completed={step > 2}>
            {step > 2 ? <FaCheckCircle /> : 2}
          </StepNumber>
          <StepIcon $active={step === 2}><FaUser /></StepIcon>
        </StepItem>
        
        <StepConnector $completed={step > 2} />
        
        <StepItem $active={step === 3} $completed={step > 3} onClick={() => step > 3 && setStep(3)}>
          <StepNumber $active={step === 3} $completed={step > 3}>
            {step > 3 ? <FaCheckCircle /> : 3}
          </StepNumber>
          <StepIcon $active={step === 3}><FaMapMarked /></StepIcon>
        </StepItem>
        
        <StepConnector $completed={step > 3} />
        
        <StepItem $active={step === 4} $completed={step > 4}>
          <StepNumber $active={step === 4} $completed={step > 4}>
            {step > 4 ? <FaCheckCircle /> : 4}
          </StepNumber>
          <StepIcon $active={step === 4}><FaShieldAlt /></StepIcon>
        </StepItem>
      </StepIndicator>
      
      <Form onSubmit={form.handleSubmit(onSubmit)}>
        <StepsContainer $step={step} $isSliding={isSliding}>
          {/* Etapa 1: Tipo de Conta */}
          <MemoizedStep1AccountType />

          {/* Etapa 2: Informações Pessoais */}
          <MemoizedStep2PersonalInfo />

          {/* Etapa 3: Endereço */}
          <MemoizedStep3Address />

          {/* Etapa 4: Acesso */}
          <MemoizedStep4Access />
        </StepsContainer>
        
        <ButtonContainer>
          <SecurityText>
            <FaLock /> Seus dados estão protegidos por criptografia
          </SecurityText>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {step > 1 && (
              <BackButton type="button" onClick={handlePrevStep}>
                <FaArrowLeft /> Voltar
              </BackButton>
            )}
            
            {step < 4 ? (
              <NextButton 
                type="button" 
                onClick={handleNextStep}
                disabled={isSubmitting}
              >
                {isSubmitting ? <LoadingDots size="small" color="white" /> : (
                  <>Continuar <FaArrowRight /></>
                )}
              </NextButton>
            ) : (
              <SubmitButton 
                type="submit" 
                disabled={isSubmitting || !form.formState.isValid || !form.getValues('termsAgreement')}
              >
                {isSubmitting ? <LoadingDots size="small" color="white" /> : 'Criar Conta'}
              </SubmitButton>
            )}
          </div>
        </ButtonContainer>
      </Form>
    </FormContainer>
  );
};

// Componente principal que envolve o conteúdo com o Provider do contexto
const SteppedCreatorForm: React.FC = () => {
  return (
    <CreatorFormProvider>
      <FormContent />
    </CreatorFormProvider>
  );
};

export default React.memo(SteppedCreatorForm); 