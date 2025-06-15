'use client';

import React from 'react';
import { FaCheckCircle, FaUser, FaBuilding, FaMapMarked, FaShieldAlt, FaArrowRight, FaArrowLeft, FaLock, FaIdCard } from 'react-icons/fa';
import { CreatorFormProvider, useCreatorFormContext } from '@/context/CreatorFormContext';
import LoadingDots from '../common/LoadingDots';

import Step1AccountType from './steps/Step1AccountType';
import Step2PersonalInfo from './steps/Step2PersonalInfo';
import Step3CompanyInfo from './steps/Step3CompanyInfo';
import Step4Address from './steps/Step4Address';
import Step5Access from './steps/Step5Access';

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
const MemoizedStep3CompanyInfo = React.memo(Step3CompanyInfo);
const MemoizedStep4Address = React.memo(Step4Address);
const MemoizedStep5Access = React.memo(Step5Access);

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
    accountType,
    onSubmit
  } = useCreatorFormContext();

  // Determinar o número máximo de etapas com base no tipo de conta
  const maxSteps = accountType === 'company' ? 5 : 4;
  
  // Verificar se está na última etapa
  const isLastStep = step === maxSteps;

  return (
    <FormContainer>
      <FormHeader>
        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
          
        </div>
        <FormTitle>Cadastro de Criador</FormTitle>
        <FormSubtitle>
          {step === 1 && 'Escolha o tipo de conta que melhor se adapta ao seu perfil'}
          {accountType === 'company' && step === 2 && 'Dados do Representante Legal'}
          {accountType === 'individual' && step === 2 && 'Dados Pessoais'}
          {accountType === 'company' && step === 3 && 'Dados da Empresa'}
          {accountType === 'individual' && step === 3 && 'Endereço'}
          {accountType === 'company' && step === 4 && 'Endereço'}
          {accountType === 'company' && step === 5 && 'Acesso e Conta Bancária'}
          {accountType === 'individual' && step === 4 && 'Acesso e Conta Bancária'}
        </FormSubtitle>
      </FormHeader>
      
      {accountType === 'company' ? (
        // Indicador de etapas para Pessoa Jurídica (5 etapas)
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
            <StepIcon $active={step === 3}><FaIdCard /></StepIcon>
          </StepItem>
          
          <StepConnector $completed={step > 3} />
          
          <StepItem $active={step === 4} $completed={step > 4} onClick={() => step > 4 && setStep(4)}>
            <StepNumber $active={step === 4} $completed={step > 4}>
              {step > 4 ? <FaCheckCircle /> : 4}
            </StepNumber>
            <StepIcon $active={step === 4}><FaMapMarked /></StepIcon>
          </StepItem>
          
          <StepConnector $completed={step > 4} />
          
          <StepItem $active={step === 5} $completed={step > 5}>
            <StepNumber $active={step === 5} $completed={step > 5}>
              {step > 5 ? <FaCheckCircle /> : 5}
            </StepNumber>
            <StepIcon $active={step === 5}><FaShieldAlt /></StepIcon>
          </StepItem>
        </StepIndicator>
      ) : (
        // Indicador de etapas para Pessoa Física (4 etapas)
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
      )}
      
      <Form onSubmit={form.handleSubmit(onSubmit)}>
        <StepsContainer $step={step} $isSliding={isSliding}>
          {/* Etapa 1: Tipo de Conta */}
          <MemoizedStep1AccountType />

          {/* Etapa 2: Informações Pessoais */}
          <MemoizedStep2PersonalInfo />

          {/* Etapa 3: Informações da Empresa (somente para PJ) ou endereço (PF) */}
          {accountType === 'company' ? <MemoizedStep3CompanyInfo /> : <MemoizedStep4Address />}

          {/* Etapa 4: Endereço (PJ) ou Acesso (PF) */}
          {accountType === 'company' ? <MemoizedStep4Address /> : <MemoizedStep5Access />}

          {/* Etapa 5: Acesso (apenas para PJ) */}
          <MemoizedStep5Access />
        </StepsContainer>
        
        <ButtonContainer>
          <SecurityText>
                            <FaLock /> 🛡️ Criptografia Nível Militar: Proteção AES-256-GCM para máxima segurança dos seus dados
          </SecurityText>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {step > 1 && (
              <BackButton type="button" onClick={handlePrevStep}>
                <FaArrowLeft /> Voltar
              </BackButton>
            )}
            
            {!isLastStep ? (
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