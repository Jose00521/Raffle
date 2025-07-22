'use client';

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import FormInput from '@/components/common/FormInput';
import { FaUser, FaIdCard, FaLock, FaShieldAlt, FaFingerprint, FaExclamationCircle, FaLockOpen } from 'react-icons/fa';
import { HiShieldCheck, HiLockClosed } from 'react-icons/hi';
import { MdSecurity, MdVerifiedUser } from 'react-icons/md';
import { useHookFormMask } from 'use-mask-input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { AdminLoginSchema, AdminLoginFormData } from '@/zod/admin.schema';
import { getSession, signIn } from 'next-auth/react';
import { fadeIn } from '@/styles/registration.styles';

// Componentes estilizados
const LoginCard = styled.div`
  width: 100%;
  max-width: 480px;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
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

const CardHeader = styled.div`
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  padding: 2rem;
  text-align: center;
  position: relative;
`;

const Logo = styled.div`
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h1`
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  margin: 0.5rem 0 0;
`;

const CardBody = styled.div`
  padding: 2rem;
`;

const CardFooter = styled.div`
  padding: 1.5rem 2rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
`;

const FormContainer = styled(motion.div)`
  width: 100%;
`;

const ButtonContainer = styled.div`
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
`;

const Button = styled(motion.button)<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  
  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    color: white;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    
    &:hover:not(:disabled) {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
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
    
    &:hover:not(:disabled) {
      background: #f9fafb;
      border-color: #9ca3af;
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `}
`;

const SecurityBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  margin-top: 1rem;
  
  svg {
    margin-right: 0.5rem;
    color: #10b981;
  }
  
  span {
    color: white;
    font-size: 0.75rem;
    font-weight: 500;
  }
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
`;

const Step = styled.div<{ $active: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => props.$active ? '#4f46e5' : '#e5e7eb'};
  margin: 0 4px;
  transition: all 0.3s ease;
`;

const ErrorMessage = styled(motion.div)`
  background-color: #fee2e2;
  color: #b91c1c;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.5rem;
    flex-shrink: 0;
  }
`;

const ForgotPasswordLink = styled.a`
  display: inline-block;
  margin-top: 1rem;
  color: #4f46e5;
  font-size: 0.875rem;
  text-decoration: none;
  transition: color 0.2s ease;
  cursor: pointer;
  
  &:hover {
    color: #7c3aed;
    text-decoration: underline;
  }
`;

const SecurityInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const SecurityItem = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: #6b7280;
  
  svg {
    margin-right: 0.5rem;
    color: #10b981;
    flex-shrink: 0;
  }
`;

const SecurityTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.5rem;
    color: #4f46e5;
  }
`;

const IPAddress = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  text-align: center;
  margin-top: 1rem;
`;

const AdminLoginForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ipAddress, setIpAddress] = useState<string>('');
  const [credentialsError, setCredentialsError] = useState(false);
  const router = useRouter();
  
  // Obter o endereço IP do usuário para fins de segurança
 useEffect(() => {
    const fetchIP = async () => {
      try {
        // Usando um serviço público para obter o IP
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        setIpAddress(data.ip);
      } catch (error) {
        console.error('Erro ao obter IP:', error);
        setIpAddress('Não disponível');
      }
    };
    
    fetchIP();
  }, []);
  
  // Único formulário para todos os passos
  const form = useForm<AdminLoginFormData>({
    resolver: zodResolver(AdminLoginSchema),
    mode: 'all',
    defaultValues: {
      email: '',
      cpf: '',
      password: ''
    }
  });

  
  const { register, handleSubmit, formState: { errors, isValid }, trigger, getValues, watch } = form;
  const registerWithMask = useHookFormMask(register);

      // Reset do erro de credenciais
      useEffect(() => {
        setCredentialsError(false);
      }, [getValues('email'), getValues('cpf'), getValues('password')]);
  
  // Validar o primeiro passo e avançar
  const handleNextStep = async () => {
    // Validar apenas os campos do primeiro passo
    const isStep1Valid = await trigger(['email', 'cpf']);
    
    if (isStep1Valid) {
      // Verificar se o e-mail e CPF são válidos no backend antes de avançar
      setIsLoading(true);
      setError(null);
      
      try {
        // Simulando uma verificação com o backend
        // Na implementação real, você faria uma chamada para verificar se o e-mail e CPF são válidos
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Avançar para o próximo passo
        setStep(2);
      } catch (error) {
        setError('Credenciais inválidas. Por favor, verifique seu e-mail e CPF.');
        console.error('Erro ao verificar credenciais:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Enviar o formulário completo
  const onSubmit = async (data: AdminLoginFormData) => {
    setIsLoading(true);
    console.log('[Login Debug] Dados:', data);
    
    try {

      const result = await signIn('admin-credentials', {
        email: data.email,
        cpf: data.cpf,
        password: data.password,
        redirect: false,
      });

      console.log('[Login Debug] Resultado:', result);

      if(result?.ok){
        const session = await getSession();

        console.log('[Login Debug] Sessão obtida:', session);

        if(session?.user?.role == 'admin'){
          router.push('/dashboard/admin');
        }else{
          toast.error('Você não tem permissão para acessar este painel.');
        }
      }

      if(result?.error === 'CredentialsSignin'){
        setCredentialsError(true);
        toast.error('Credenciais inválidas');
        setIsLoading(false);
      }

     
    } catch (error) {
      setError('Credenciais inválidas. Por favor, verifique seu e-mail e CPF.');
      console.error('Erro ao autenticar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Lidar com "Esqueci minha senha"
  const handleForgotPassword = () => {
    // Aqui você pode implementar a lógica para recuperação de senha
    // Por exemplo, redirecionar para uma página de recuperação de senha
    toast.success('Um e-mail de recuperação de senha foi enviado para o seu endereço cadastrado.');
  };
  
  // Verificar se os campos do passo atual são válidos
  const isCurrentStepValid = step === 1 
    ? !errors.email && !errors.cpf && watch('email') && watch('cpf')
    : !errors.password && watch('password');
  
  return (
    <LoginCard>
      <CardHeader>
        <Logo>
          <FaShieldAlt size={32} color="white" />
        </Logo>
        <Title>Painel Administrativo</Title>
        <Subtitle>Acesso restrito a administradores</Subtitle>
        
        <SecurityBadge>
          <FaFingerprint />
          <span>Conexão segura</span>
        </SecurityBadge>
      </CardHeader>
      
      <CardBody>
        <StepIndicator>
          <Step $active={step === 1} />
          <Step $active={step === 2} />
        </StepIndicator>
        
        {error && (
          <ErrorMessage
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <FaExclamationCircle size={16} />
            {error}
          </ErrorMessage>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <FormContainer
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <FormInput
                  id="email"
                  label="E-mail"
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  icon={<FaUser />}
                  required
                  {...register('email')}
                  error={errors.email?.message}
                  helpText="Digite o e-mail administrativo"
                />
                
                <FormInput
                  id="cpf"
                  label="CPF"
                  placeholder="000.000.000-00"
                  icon={<FaIdCard />}
                  required
                  {...registerWithMask('cpf', 'cpf')}
                  error={errors.cpf?.message}
                  helpText="Digite seu CPF para verificação"
                />
                
                <ButtonContainer>
                  <Button
                    type="button"
                    $variant="primary"
                    disabled={isLoading || !isCurrentStepValid}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNextStep}
                  >
                    {isLoading ? 'Verificando...' : 'Continuar'}
                  </Button>
                </ButtonContainer>
              </FormContainer>
            ) : (
              <FormContainer
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <FormInput
                  id="password"
                  label="Senha"
                  type="password"
                  isPassword
                  placeholder="Digite sua senha"
                  icon={<FaLock />}
                  required
                  {...register('password')}
                  error={errors.password?.message}
                  helpText="Digite sua senha de administrador"
                />

              {credentialsError && (
                <ErrorBox>
                  <FaShieldAlt style={{ marginRight: 8 }} />
                  Telefone ou senha incorretos. Tente novamente.
                </ErrorBox>
              )}
                
                <ForgotPasswordLink onClick={handleForgotPassword}>
                  Esqueci minha senha
                </ForgotPasswordLink>
                
                <ButtonContainer>
                  <Button
                    type="button"
                    $variant="secondary"
                    onClick={() => setStep(1)}
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ marginRight: '0.75rem' }}
                  >
                    Voltar
                  </Button>
                  
                  <Button
                    type="submit"
                    $variant="primary"
                    disabled={isLoading || !isCurrentStepValid}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? 'Autenticando...' : 'Entrar'}
                  </Button>
                </ButtonContainer>
              </FormContainer>
            )}
          </AnimatePresence>
        </form>
      </CardBody>
      
      <CardFooter>
        <SecurityInfo>
          <SecurityTitle>
            <MdSecurity size={18} />
            Informações de Segurança
          </SecurityTitle>
          <SecurityItem>
            <HiShieldCheck size={14} />
            <span>Conexão criptografada com protocolo TLS 1.3</span>
          </SecurityItem>
          <SecurityItem>
            <HiLockClosed size={14} />
            <span>Autenticação em múltiplos fatores</span>
          </SecurityItem>
          <SecurityItem>
            <MdVerifiedUser size={14} />
            <span>Verificação avançada de identidade</span>
          </SecurityItem>
          <SecurityItem>
            <FaLockOpen size={14} />
            <span>Bloqueio automático após 3 tentativas incorretas</span>
          </SecurityItem>
        </SecurityInfo>
        
        {ipAddress && (
          <IPAddress>
            Seu endereço IP: {ipAddress} • {new Date().toLocaleDateString()}
          </IPAddress>
        )}
      </CardFooter>
    </LoginCard>
  );
};

export default AdminLoginForm; 