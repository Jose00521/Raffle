'use client';

import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import Link from 'next/link';
import { FaPhone, FaLock, FaArrowLeft, FaEye, FaEyeSlash, FaMobileAlt, FaUserPlus, FaShieldAlt } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { LoginFormData, loginUserSchema } from '@/zod/user.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import FormInput from '@/components/common/FormInput';
import { useHookFormMask } from 'use-mask-input';
import { getSession, signIn, useSession } from 'next-auth/react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from '@/components/layout/Layout';
import LoadingDots from '@/components/common/LoadingDots';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: telefone, 2: senha
  const [isSliding, setIsSliding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [credentialsError, setCredentialsError] = useState(false);
  const { data: session, status } = useSession();

  const { register, setValue, getValues, handleSubmit, formState: { errors }, watch } = useForm<LoginFormData>({
    resolver: zodResolver(loginUserSchema),
    mode: 'all',
    delayError: 200,
    criteriaMode: 'firstError',
    defaultValues: {
      telefone: '',
      password: '',
    },
  });
  const registerWithMask = useHookFormMask(register);
  const password = watch('password');

  useEffect(() => {
    setCredentialsError(false);
  }, [getValues('telefone').length, getValues('password').length]);

  const handleNextStep = () => {
    if (getValues('telefone').replace(/\D/g, '').length >= 11) { // Garantir que o telefone está completo
      setIsSliding(true);
      setTimeout(() => {
        setStep(2);
        setIsSliding(false);
      }, 300);
    }
  };

  const handlePrevStep = () => {
    setIsSliding(true);
    setTimeout(() => {
      setStep(1);
      setIsSliding(false);
    }, 300);
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    
    const result = await signIn('credentials', {
      phone: data.telefone,
      password: data.password,
      redirect: false,
      
    });


    if(result?.ok){

      const session = await getSession();

      console.log('[Login Debug] Sessão obtida:', session);

      if(session?.user?.role == 'creator'){
        router.replace('/dashboard/criador');
      }
      if(session?.user?.role == 'participant' || session?.user?.role == 'user'){
        router.replace('/dashboard/participante');
      }
      

      }
    
    if(result?.error === 'CredentialsSignin'){
      setCredentialsError(true);
      toast.error('Credenciais inválidas');
      setIsSubmitting(false);
    }
    
  };

  return (

      <PageContainer>
        <ToastContainer />
        
      <LoginContainer>
        <PageDecoration />
        
        <LoginHeader>
          <LogoContainer>
            <LogoIcon><FaMobileAlt /></LogoIcon>
          </LogoContainer>
          <LoginTitle>Acessar minha conta</LoginTitle>
          <LoginSubtitle>
            {step === 1 ? 'Digite seu telefone para entrar' : 'Informe sua senha'}
          </LoginSubtitle>
        </LoginHeader>

        <FormContainer onSubmit={handleSubmit(onSubmit)}>
          <StepIndicator>
            <StepDot $active={step === 1} $completed={step > 1} />
            <StepLine $completed={step > 1} />
            <StepDot $active={step === 2} $completed={false} />
          </StepIndicator>

          <StepsContainer $step={step} $isSliding={isSliding}>
            {/* Etapa 1: Telefone */}
            <StepContent>
              <StepLabel>
                <StepNumber>1</StepNumber>
                <StepText>Telefone</StepText>
              </StepLabel>
              
              <FormInput
                id="telefone"
                icon={<FaPhone />}
                placeholder="(00) 00000-0000"
                {...registerWithMask('telefone','(99) 99999-9999')}
                error={errors.telefone?.message as string}
              />
              
              <Button 
                type="button" 
                onClick={handleNextStep}
                disabled={
                  getValues('telefone').replace(/\D/g, '').length < 11 || !!errors.telefone?.message 
                  || isSubmitting
                }
              >
                {isSubmitting ? <LoadingDots size="small" color="white" /> : 'Continuar'}
              </Button>
            </StepContent>

            {/* Etapa 2: Senha */}
            <StepContent>
              <StepLabel>
                <BackButton type="button" onClick={handlePrevStep}>
                  <FaArrowLeft />
                </BackButton>
                <StepNumber>2</StepNumber>
                <StepText>Senha</StepText>
              </StepLabel>
              
              <FormInput
                id="password"
                icon={<FaLock />}
                isPassword
                placeholder="Digite sua senha"
                {...register('password')}
                error={errors.password?.message as string}
              />

              {credentialsError && (
                <ErrorBox>
                  <FaShieldAlt style={{ marginRight: 8 }} />
                  Telefone ou senha incorretos. Tente novamente.
                </ErrorBox>
              )}
              
              <Button 
                type="submit" 
                disabled={getValues('password').length < 8 || !!errors.password?.message || isSubmitting}
              >
                {isSubmitting ? <LoadingDots size="small" color="white" /> : 'Entrar'}
              </Button>
            </StepContent>
          </StepsContainer>

          <ForgotPassword href="/recuperar-senha">
            <FaShieldAlt /> Esqueci minha senha
          </ForgotPassword>
        </FormContainer>

        <CreateAccountContainer>
          <CreateAccountText>Não tem uma conta?</CreateAccountText>
          <CreateAccountLink href="/cadastro-tipo">
            <FaUserPlus /> Criar conta
          </CreateAccountLink>
        </CreateAccountContainer>

        <SecurityInfo>
          Login seguro <SecurityDot />
        </SecurityInfo>
      </LoginContainer>
    </PageContainer>

  );
}

// Keyframes para animações
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const PageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
  padding: 20px;
`;

const LoginContainer = styled.div`
  background-color: white;
  border-radius: 20px;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  padding: 40px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  animation: ${css`${fadeIn} 0.5s ease`};
  
  @media (max-width: 768px) {
    padding: 30px 25px;
    max-width: 95%;
  }
  
  @media (max-width: 480px) {
    padding: 25px 20px;
    max-width: 100%;
    border-radius: 15px;
  }
`;

const PageDecoration = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 10px;
  background: ${({ theme }) => theme.colors.gradients.purple};
  background-size: 200% 200%;
  animation: ${css`${gradientMove} 3s ease infinite`};
  border-radius: 20px 20px 0 0;
  box-shadow: 0 2px 10px rgba(106, 17, 203, 0.2);
`;

const LoginHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
  animation: ${css`${fadeIn} 0.4s ease`};
`;

const LogoContainer = styled.div`
  margin: 0 auto 20px;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.gradients.purple};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(106, 17, 203, 0.2);
  
  @media (max-width: 480px) {
    width: 70px;
    height: 70px;
  }
`;

const LogoIcon = styled.div`
  color: white;
  font-size: 36px;
  
  @media (max-width: 480px) {
    font-size: 30px;
  }
`;

const LoginTitle = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 2.2rem;
  margin-bottom: 15px;
  font-weight: 700;
  
  @media (max-width: 480px) {
    font-size: 1.8rem;
  }
`;

const LoginSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1.2rem;
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const FormContainer = styled.form`
  width: 100%;
  position: relative;
  overflow: hidden;
`;

const StepIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
`;

const StepDot = styled.div<{ $active: boolean; $completed: boolean }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  transition: all 0.3s ease;
  
  ${({ $active, $completed, theme }) => {
    if ($completed) {
      return `
        background-color: ${theme.colors.success};
        border: 2px solid ${theme.colors.success};
      `;
    } else if ($active) {
      return css`
        background-color: ${theme.colors.primary};
        border: 2px solid ${theme.colors.primary};
        animation: ${pulse} 1.5s infinite;
      `;
    } else {
      return `
        background-color: white;
        border: 2px solid ${theme.colors.gray.medium};
      `;
    }
  }}
`;

const StepLine = styled.div<{ $completed: boolean }>`
  height: 3px;
  width: 100px;
  background-color: ${({ $completed, theme }) => 
    $completed ? theme.colors.success : theme.colors.gray.medium};
  margin: 0 10px;
  transition: background-color 0.3s ease;
  
  @media (max-width: 480px) {
    width: 70px;
  }
`;

const StepsContainer = styled.div<{ $step: number; $isSliding: boolean }>`
  display: flex;
  transition: transform 0.3s ease, opacity 0.2s ease;
  width: 200%;
  transform: translateX(${props => (props.$step === 1 ? '0%' : '-50%')});
  opacity: ${props => (props.$isSliding ? '0.8' : '1')};
`;

const StepContent = styled.div`
  width: 50%;
  padding: 0 10px;
  flex-shrink: 0;
`;

const StepLabel = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const StepNumber = styled.div`
  width: 30px;
  height: 30px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-right: 12px;
  font-size: 1rem;
  
  @media (max-width: 480px) {
    width: 26px;
    height: 26px;
  }
`;

const StepText = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.2rem;
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  font-size: 1.4rem;
  transition: transform 0.2s, color 0.2s;
  margin-right: 10px;
  display: flex;
  align-items: center;
  padding: 0;
  
  &:hover {
    transform: scale(1.1);
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 18px;
  border: none;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.gradients.purple};
  background-size: 200% 200%;
  animation: ${css`${gradientMove} 3s ease infinite`};
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 50px !important;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(106, 17, 203, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60px;
  
  @media (max-width: 480px) {
    padding: 16px;
    font-size: 1.1rem;
    min-height: 55px;
  }
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(106, 17, 203, 0.3);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 4px 8px rgba(106, 17, 203, 0.2);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    background: ${({ theme }) => theme.colors.gray.medium};
    box-shadow: none;
  }
`;

const ErrorBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.error || '#ff3b30'};
  color: ${({ theme }) => theme.colors.white || '#ffffff'};
  border: 1.5px solid ${({ theme }) => theme.colors.error || '#ff3b30'};
  border-radius: 10px;
  padding: 14px 18px;
  margin-top: 15px;
  margin-bottom: 15px;
  font-size: 1rem;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(255,0,0,0.07);
  animation: ${fadeIn} 0.3s;
`;

const ForgotPassword = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-size: 1.1rem;
  margin-top: 10px;
  transition: all 0.2s;
  font-weight: 500;
  
  &:hover {
    transform: translateY(-1px);
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const CreateAccountContainer = styled.div`
  margin-top: 40px;
  padding-top: 25px;
  border-top: 1px solid ${({ theme }) => theme.colors.gray.light};
  text-align: center;
`;

const CreateAccountText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1.1rem;
  margin-bottom: 15px;
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const CreateAccountLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s;
  font-size: 1.2rem;
  
  &:hover {
    transform: translateY(-1px);
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const SecurityInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 30px;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.success};
  font-weight: 500;
`;

const SecurityDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.success};
  animation: ${css`${pulse} 2s infinite`};
`; 

