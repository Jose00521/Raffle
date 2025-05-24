'use client';

import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import Link from 'next/link';
import { FaPhone, FaLock, FaArrowLeft, FaEye, FaEyeSlash, FaMobileAlt, FaUserPlus, FaShieldAlt } from 'react-icons/fa';
import { set, useForm } from 'react-hook-form';
import { LoginFormData, loginUserSchema } from '@/types/form';
import { zodResolver } from '@hookform/resolvers/zod';

import FormInput from '../common/FormInput';
import { useHookFormMask } from 'use-mask-input';
import userAPI from '@/API/userAPI';
import { getSession, signIn, useSession } from 'next-auth/react';
import { toast, ToastContainer } from 'react-toastify';
import { useRouter } from 'next/navigation';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: telefone, 2: senha
  const [showPassword, setShowPassword] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const [credentialsError, setCredentialsError] = useState(false);
  const { data: session, status } = useSession();

  const { register, setValue , getValues, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
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

  // Efeito para lidar com clique fora do modal para fechar
  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
  //       onClose();
  //     }
  //   };

  //   if (isOpen) {
  //     document.addEventListener('mousedown', handleClickOutside);
  //   }
    
  //   return () => {
  //     document.removeEventListener('mousedown', handleClickOutside);
  //   };
  // }, [isOpen, onClose]);

  // // Efeito para prevenir scroll do body quando modal estiver aberto
  // useEffect(() => {
  //   if (isOpen) {
  //     document.body.style.overflow = 'hidden';
  //   } else {
  //     document.body.style.overflow = '';
  //   }
    
  //   return () => {
  //     document.body.style.overflow = '';
  //   };
  // }, [isOpen]);

  // Reset do step quando o modal é fechado
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(1);
        setValue('telefone', '');
        setValue('password', '');
      }, 300);
    }
  }, [isOpen]);

  // Reset do erro de credenciais
  useEffect(() => {
    setCredentialsError(false);
  }, [getValues('telefone'), getValues('password')]);

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
    console.log('data',data);
    console.log('isSubmitting',isSubmitting);
    // Aqui você implementaria a lógica de autenticação

    const result = await signIn('credentials', {
      phone: data.telefone,
      password: data.password,
      redirect: false
    });

    console.log('result', result);

    if(result?.ok){
      console.log('session', session);
      if(session?.user?.role === 'creator'){
        router.push('/dashboard/criador');
      }
      if(session?.user?.role === 'participant' || session?.user?.role === 'user'){
        router.push('/dashboard/participante');
      }
    }
    

    if(result?.error === 'CredentialsSignin'){
      setCredentialsError(true);
    } else {
      setCredentialsError(false);
    }

    
    setIsSubmitting(false);
    // Após login bem-sucedido:
    // onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (step === 1 && getValues('telefone').length >= 14) {
        handleNextStep();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContainer ref={modalRef}>
        
        <ModalDecoration />
        <CloseButton onClick={onClose}>&times;</CloseButton>
        
        <ModalHeader>
          <ModalLogo>
            <LogoIcon><FaMobileAlt /></LogoIcon>
          </ModalLogo>
          <ModalTitle>Acessar minha conta</ModalTitle>
          <ModalSubtitle>
            {step === 1 ? 'Digite seu telefone para entrar' : 'Informe sua senha'}
          </ModalSubtitle>
        </ModalHeader>

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
                  error={errors.telefone?.message as string}
                  {...registerWithMask('telefone','(99) 99999-9999')}
                  // onKeyDown={handleKeyDown}
                />
          
              
              <Button 
                type="button" 
                onClick={handleNextStep}
                disabled={
                  getValues('telefone').replace(/\D/g, '').length < 11 || !!errors.telefone?.message 
                  || isSubmitting
                }
              >
                {isSubmitting ? 'Processando...' : 'Continuar'}
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
                  error={errors.password?.message as string}
                  placeholder="Digite sua senha"
                  {...register('password')}
                />

                {credentialsError && (
                  <ErrorBox>
                    <FaShieldAlt style={{ marginRight: 8 }} />
                    Telefone ou senha incorretos. Tente novamente.
                  </ErrorBox>
                )}
         
 
              <Button type="submit" disabled={getValues('password').length < 8 || !!errors.password?.message || isSubmitting}>
                {isSubmitting ? 'Processando...' : 'Entrar'}
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
      </ModalContainer>
    </ModalOverlay>
  );
};

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

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 10px;
  backdrop-filter: blur(8px);
  animation: ${css`${fadeIn} 0.3s ease`};
  overflow-y: auto;
`;

const ModalDecoration = styled.div`
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

const ModalContainer = styled.div`
  background-color: white;
  border-radius: 20px;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 480px;
  padding: 40px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  margin: auto;
  max-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    padding: 30px 25px;
    max-width: 95%;
    max-height: calc(100vh - 30px);
  }
  
  @media (max-width: 520px) {
    padding: 25px 20px;
    max-width: 95%;
    border-radius: 15px;
  }
  
  @media (max-width: 375px) {
    padding: 20px 15px;
    max-width: 100%;
    border-radius: 12px;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 28px;
  position: absolute;
  top: 15px;
  right: 20px;
  cursor: pointer;
  color: #888;
  transition: color 0.2s, transform 0.2s;
  z-index: 5;
  
  &:hover {
    color: #333;
    transform: rotate(90deg);
  }
  
  @media (max-width: 480px) {
    font-size: 24px;
    top: 12px;
    right: 15px;
  }
`;

const ModalHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
  animation: ${css`${fadeIn} 0.4s ease`};
`;

const ModalLogo = styled.div`
  margin: 0 auto 20px;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.gradients.purple};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(106, 17, 203, 0.3);
  
  @media (max-width: 480px) {
    width: 60px;
    height: 60px;
    margin-bottom: 15px;
  }
  
  @media (max-width: 375px) {
    width: 50px;
    height: 50px;
    margin-bottom: 12px;
  }
`;

const LogoIcon = styled.div`
  color: white;
  font-size: 32px;
  
  @media (max-width: 480px) {
    font-size: 26px;
  }
  
  @media (max-width: 375px) {
    font-size: 22px;
  }
`;

const ModalTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 2rem;
  margin-bottom: 12px;
  font-weight: 700;
  
  @media (max-width: 480px) {
    font-size: 1.7rem;
    margin-bottom: 10px;
  }
  
  @media (max-width: 375px) {
    font-size: 1.5rem;
    margin-bottom: 8px;
  }
`;

const ModalSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1.1rem;
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
  
  @media (max-width: 375px) {
    font-size: 0.9rem;
  }
`;

const FormContainer = styled.form`
  width: 100%;
  position: relative;
  overflow: hidden;
  flex: 1;
`;

const StepIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  
  @media (max-width: 480px) {
    margin-bottom: 15px;
  }
`;

const StepDot = styled.div<{ $active: boolean; $completed: boolean }>`
  width: 14px;
  height: 14px;
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
  
  @media (max-width: 375px) {
    width: 12px;
    height: 12px;
  }
`;

const StepLine = styled.div<{ $completed: boolean }>`
  height: 2px;
  width: 80px;
  background-color: ${({ $completed, theme }) => 
    $completed ? theme.colors.success : theme.colors.gray.medium};
  margin: 0 8px;
  transition: background-color 0.3s ease;
  
  @media (max-width: 480px) {
    width: 60px;
  }
  
  @media (max-width: 375px) {
    width: 40px;
    margin: 0 6px;
  }
`;

const StepsContainer = styled.div<{ $step: number; $isSliding: boolean }>`
  display: flex;
  transition: transform 0.3s ease, opacity 0.2s ease;
  width: 200%;
  transform: translateX(${props => (props.$step === 1 ? '0%' : '-50%')});
  opacity: ${props => (props.$isSliding ? '0.8' : '1')};
  
  @media (max-width: 375px) {
    width: 220%;
    transform: translateX(${props => (props.$step === 1 ? '0%' : '-45%')});
  }
`;

const StepContent = styled.div`
  width: 50%;
  padding: 0 10px;
  flex-shrink: 0;
  
  @media (max-width: 375px) {
    width: 45%;
    padding: 0 5px;
  }
`;

const StepLabel = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
`;

const StepNumber = styled.div`
  width: 26px;
  height: 26px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-right: 10px;
  font-size: 0.9rem;
  
  @media (max-width: 480px) {
    width: 24px;
    height: 24px;
    font-size: 0.85rem;
    margin-right: 8px;
  }
  
  @media (max-width: 375px) {
    width: 22px;
    height: 22px;
    font-size: 0.8rem;
    margin-right: 6px;
  }
`;

const StepText = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.1rem;
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
  
  @media (max-width: 375px) {
    font-size: 0.9rem;
  }
`;

const InputGroup = styled.div`
  position: relative;
  
  @media (max-width: 375px) {
    margin-bottom: 2px;
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.primary};
  z-index: 1;
  font-size: 1.1rem;
  
  @media (max-width: 480px) {
    font-size: 1rem;
    left: 12px;
  }
  
  @media (max-width: 375px) {
    font-size: 0.9rem;
    left: 10px;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 16px 15px 16px 45px;
  border: 2px solid ${({ theme }) => theme.colors.gray.light};
  border-radius: 12px;
  font-size: 1.1rem;
  transition: all 0.2s;
  background-color: #f8f9fa;
  color: #333;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: white;
    box-shadow: 0 0 0 4px rgba(106, 17, 203, 0.1);
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.light};
  }
  
  @media (max-width: 480px) {
    padding: 14px 12px 14px 38px;
    font-size: 1rem;
    border-radius: 10px;
  }
  
  @media (max-width: 375px) {
    padding: 12px 10px 12px 32px;
    font-size: 0.9rem;
    border-radius: 8px;
  }
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  font-size: 1.3rem;
  transition: transform 0.2s, color 0.2s;
  margin-right: 8px;
  display: flex;
  align-items: center;
  padding: 0;
  
  &:hover {
    transform: scale(1.1);
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  @media (max-width: 480px) {
    font-size: 1.2rem;
    margin-right: 6px;
  }
  
  @media (max-width: 375px) {
    font-size: 1.1rem;
    margin-right: 4px;
  }
`;

const TogglePasswordButton = styled.button`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.gray.medium};
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1.2rem;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
    right: 12px;
  }
  
  @media (max-width: 375px) {
    font-size: 1rem;
    right: 10px;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.gradients.purple};
  background-size: 200% 200%;
  animation: ${css`${gradientMove} 3s ease infinite`};
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 20px;
  box-shadow: 0 4px 10px rgba(106, 17, 203, 0.2);
  
  @media (max-width: 480px) {
    padding: 14px;
    font-size: 1rem;
    margin-bottom: 15px;
    border-radius: 10px;
  }
  
  @media (max-width: 375px) {
    padding: 12px;
    font-size: 0.9rem;
    margin-bottom: 12px;
    border-radius: 8px;
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

const ForgotPassword = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-size: 1rem;
  margin-top: 15px;
  transition: all 0.2s;
  font-weight: 500;
  
  &:hover {
    transform: translateY(-1px);
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
    margin-top: 12px;
    gap: 5px;
  }
  
  @media (max-width: 375px) {
    font-size: 0.85rem;
    margin-top: 10px;
    gap: 4px;
  }
`;

const CreateAccountContainer = styled.div`
  margin-top: 40px;
  padding-top: 25px;
  border-top: 1px solid ${({ theme }) => theme.colors.gray.light};
  text-align: center;
  
  @media (max-width: 480px) {
    margin-top: 30px;
    padding-top: 20px;
  }
  
  @media (max-width: 375px) {
    margin-top: 25px;
    padding-top: 15px;
  }
`;

const CreateAccountText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1rem;
  margin-bottom: 12px;
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
    margin-bottom: 10px;
  }
  
  @media (max-width: 375px) {
    font-size: 0.85rem;
    margin-bottom: 8px;
  }
`;

const CreateAccountLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s;
  font-size: 1.1rem;
  
  &:hover {
    transform: translateY(-1px);
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
    gap: 6px;
  }
  
  @media (max-width: 375px) {
    font-size: 0.9rem;
    gap: 5px;
  }
`;

const SecurityInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 20px;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.success};
  font-weight: 500;
  
  @media (max-width: 480px) {
    margin-top: 15px;
    font-size: 0.75rem;
    gap: 5px;
  }
  
  @media (max-width: 375px) {
    margin-top: 12px;
    font-size: 0.7rem;
    gap: 4px;
  }
`;

const SecurityDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.success};
  animation: ${css`${pulse} 2s infinite`};
  
  @media (max-width: 375px) {
    width: 6px;
    height: 6px;
  }
`;

const ButtonsRow = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 15px;
  margin-bottom: 15px;
  
  @media (max-width: 480px) {
    gap: 8px;
    margin-top: 12px;
    margin-bottom: 12px;
  }
  
  @media (max-width: 375px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const LoginButton = styled(Button)`
  flex: 3;
  margin-bottom: 0;
`;

const DemoButton = styled.button`
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: rgba(106, 17, 203, 0.1);
  border: 1px solid ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 12px;
  padding: 0 10px;
  
  &:hover {
    background-color: rgba(106, 17, 203, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(106, 17, 203, 0.1);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
    padding: 0 8px;
    border-radius: 10px;
  }
  
  @media (max-width: 375px) {
    padding: 12px 8px;
    font-size: 0.9rem;
  }
`;

const ErrorBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.error};
  color: ${({ theme }) => theme.colors.white};
  border: 1.5px solid ${({ theme }) => theme.colors.error};
  border-radius: 10px;
  padding: 12px 18px;
  margin-bottom: 18px;
  font-size: 1rem;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(255,0,0,0.07);
  animation: ${fadeIn} 0.3s;
`;

export default LoginModal; 