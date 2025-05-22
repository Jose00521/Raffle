'use client';

import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaUser, FaShieldAlt, FaMapMarked, FaUserPlus, FaArrowRight, FaArrowLeft, FaLock } from 'react-icons/fa';
import { FormProvider, useFormContext } from '../../context/UserFormContext';

import Step1Personal from './steps/Step1Personal';
import Step2Authentication from './steps/Step2Authentication';
import Step3Address from './steps/Step3Address';
import Step4Confirmation from './steps/Step4Confirmation';

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

const MemoizedStep1Personal = React.memo(Step1Personal);
const MemoizedStep2Authentication = React.memo(Step2Authentication);
const MemoizedStep3Address = React.memo(Step3Address);
const MemoizedStep4Confirmation = React.memo(Step4Confirmation);

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
  } = useFormContext();


  
  //Verificar validade dos campos quando o step mudar

  return (
    <FormContainer>
      <FormHeader>
        <FormTitle>Crie sua conta</FormTitle>
        <FormSubtitle>
          {step === 1 && 'Preencha suas informações pessoais'}
          {step === 2 && 'Configure sua conta e acesso'}
          {step === 3 && 'Informe seu endereço'}
          {step === 4 && 'Confirme seus dados'}
        </FormSubtitle>
      </FormHeader>
      
      <StepIndicator>
        <StepItem $active={step === 1} $completed={step > 1} onClick={() => step > 1 && setStep(1)}>
          <StepNumber $active={step === 1} $completed={step > 1}>
            {step > 1 ? <FaCheckCircle /> : 1}
          </StepNumber>
          <StepIcon $active={step === 1}><FaUser /></StepIcon>
        </StepItem>
        
        <StepConnector $completed={step > 1} />
        
        <StepItem $active={step === 2} $completed={step > 2} onClick={() => step > 2 && setStep(2)}>
          <StepNumber $active={step === 2} $completed={step > 2}>
            {step > 2 ? <FaCheckCircle /> : 2}
          </StepNumber>
          <StepIcon $active={step === 2}><FaShieldAlt /></StepIcon>
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
          <StepIcon $active={step === 4}><FaUserPlus /></StepIcon>
        </StepItem>
      </StepIndicator>
      
      <Form onSubmit={form.handleSubmit(onSubmit)}>
        <StepsContainer $step={step} $isSliding={isSliding}>
          {/* Etapa 1: Informações Pessoais */}
          <MemoizedStep1Personal />

          {/* Etapa 2: Autenticação */}
          <MemoizedStep2Authentication />

          {/* Etapa 3: Endereço */}
          <MemoizedStep3Address />

          {/* Etapa 4: Revisão e Confirmação */}
          <MemoizedStep4Confirmation />
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
              >
                Continuar <FaArrowRight />
              </NextButton>
            ) : (
              <SubmitButton 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processando...' : 'Criar Conta'}
              </SubmitButton>
            )}
          </div>
        </ButtonContainer>
      </Form>
    </FormContainer>
  );
};

// Componente principal que envolve o conteúdo com o Provider do contexto
const SteppedRegistrationForm: React.FC = () => {
  return (
    <FormProvider>
      <FormContent />
    </FormProvider>
  );
};

export default React.memo(SteppedRegistrationForm); 