'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import Modal from '../ui/Modal';
import { signIn } from 'next-auth/react';
import { toast } from 'react-toastify';
import authService from '@/services/api/auth-service';
import FormInput from '@/components/common/FormInput';
import { useRouter } from 'next/navigation';
import { validateCPF } from '@/utils/validators';
import { useAddressField } from '@/hooks/useAddressField';
import { useHookFormMask } from 'use-mask-input';
import { signupSchema, SignupFormData } from '@/zod/quicksignup.validation';
import { FaEnvelope, FaIdCard, FaPhone, FaUser } from 'react-icons/fa';
import { INumberPackageCampaign } from '@/hooks/useCampaignSelection';
import { PurchaseSummary } from '@/components/order/PurchaseSummary';


interface QuickSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  campaignSelection: INumberPackageCampaign;
}

const QuickSignupModal: React.FC<QuickSignupModalProps> = ({ isOpen, onClose, onSuccess, campaignSelection }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    clearErrors,
    trigger,
    setValue,
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode:'all',
    reValidateMode: 'onChange',
    delayError: 200,
    defaultValues: {
      nome: '',
      nomeSocial: '',
      email: '',
      cpf: '',
      telefone: '',
      confirmarTelefone: '',
      cep: '',
      estado: '',
      cidade: '',
      bairro: '',
      endereco: '',
      numero: '',
      complemento: '',
      senha: '',
      confirmarSenha: '',
    },
  });

  const registerWithMask = useHookFormMask(register);
  
  // Função para buscar endereço pelo CEP
  const { isLoadingCep, handleCepChange } = useAddressField(setValue, setError, clearErrors,trigger);


  const handleCepOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Chamar o onBlur do register first
    const cepRegistration = register('cep');
    cepRegistration.onChange(e);

    const cepValue = e.target.value.replace(/\D/g, '');
    
    handleCepChange(e);
  
  };

  const onSubmit = async (data: SignupFormData) => {
    try {
      setIsLoading(true);
      
      // Format data for API
      const formattedData = {
        name: data.nome,
        socialName: data.nomeSocial,
        email: data.email,
        cpf: data.cpf.replace(/[^\d]/g, ''),
        phone: data.telefone.replace(/[^\d]/g, ''),
        address: {
          zipCode: data.cep.replace(/\D/g, ''),
          state: data.estado,
          city: data.cidade,
          neighborhood: data.bairro,
          street: data.endereco,
          number: data.numero,
          complement: data.complemento || '',
        },
        password: data.senha,
        userType: 'participant',
      };
      
      // Call signup API
      const result = await authService.registerParticipant(formattedData as any);
      
      if (result) {
        // Auto login after signup
        const signInResult = await signIn('credentials', {
          redirect: false,
          email: data.email,
          password: data.senha,
        });
        
        if (signInResult?.error) {
          toast.error('Erro ao fazer login automático. Por favor faça login manualmente.');
        } else {
          toast.success('Cadastro realizado com sucesso!');
          reset();
          onClose();
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Erro ao criar conta. Por favor tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const validateStep = async (currentStep: number) => {
    let fieldsToValidate: (keyof SignupFormData)[] = [];
    
    switch(currentStep) {
      case 0:
        fieldsToValidate = ['telefone'];
        break;
      case 1:
        // Dados pessoais/do representante
        fieldsToValidate = ['nome', 'nomeSocial', 'email', 'cpf', 'telefone', 'confirmarTelefone'];
        break;
      case 3:
        // Se for empresa, valida os campos da empresa, senão valida endereço
          fieldsToValidate = ['cep', 'estado', 'cidade', 'bairro', 'endereco', 'numero', 'complemento'];
        break;
      default:
        return false;
    }
    
    try {
      const result = await trigger(fieldsToValidate);
      return result;
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    }
  };

  const handleModalClose = () => {
    reset();
    setCurrentStep(0);
    onClose();
  };
  
  const nextStep = async () => {
    const isStepValid = await validateStep(currentStep);
    if (isStepValid) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };
  
  const handleLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    handleModalClose();
    router.push('/login');
  };

  return (
    <Modal isOpen={isOpen} onClose={handleModalClose} maxWidth="700px">
      <ModalContent>
        <ModalHeader>
        </ModalHeader>
        
        <Form onSubmit={handleSubmit(onSubmit)}>
          {currentStep === 0 ? (
            <>
              <SectionTitle>Checkout</SectionTitle>
            
              <FormRow>
                <FormInput
                  id="telefone"
                  label="Informe o seu número de telefone"
                  placeholder="(00) 00000-0000"
                  icon={<FaPhone />}
                  mask="phone"
                  error={errors.telefone?.message}
                  required
                  {...registerWithMask('telefone', '(99) 99999-9999')}
                />
                
              </FormRow>

              <PurchaseSummary selection={campaignSelection} />
              
              <ButtonGroup>
                <SecondaryButton type="button" onClick={handleModalClose} disabled={isLoading}>
                  Cancelar
                </SecondaryButton>
                <PrimaryButton type="button" onClick={nextStep} disabled={isLoading}>
                  Continuar
                </PrimaryButton>
              </ButtonGroup>
            </>
          ) : currentStep === 1 ? (
            <>
              <SectionTitle>Dados pessoais</SectionTitle>
              
              <FormInput
                id="nome"
                label="Nome completo"
                icon={<FaUser />}
                placeholder="Seu nome completo"
                error={errors.nome?.message}
                required
                {...register('nome')}
              />
              
              <FormInput
                id="nomeSocial"
                label="Nome social"
                placeholder="Nome social (opcional)"
                error={errors.nomeSocial?.message}
                {...register('nomeSocial')}
              />
              
              <FormRow>
                <FormInput
                  id="email"
                  label="E-mail"
                  type="email"
                  icon={<FaEnvelope />}
                  placeholder="seu@email.com"
                  error={errors.email?.message}
                  required
                  {...register('email')}
                />
                
                <FormInput
                  id="cpf"
                  label="CPF"
                  icon={<FaIdCard />}
                  placeholder="000.000.000-00"
                  mask="cpf"
                  error={errors.cpf?.message}
                  required
                  {...registerWithMask('cpf', 'cpf')}
                />
              </FormRow>
              
              <FormRow>
                <FormInput
                  id="telefone"
                  label="Telefone"
                  icon={<FaPhone />}
                  placeholder="(00) 00000-0000"
                  mask="phone"
                  error={errors.telefone?.message}
                  required
                  {...registerWithMask('telefone', '(99) 99999-9999')}
                />
                
                <FormInput
                  id="confirmarTelefone"
                  label="Confirmar telefone"
                  icon={<FaPhone />}
                  placeholder="(00) 00000-0000"
                  mask="phone"
                  error={errors.confirmarTelefone?.message}
                  required
                  {...registerWithMask('confirmarTelefone', '(99) 99999-9999')}
                />
              </FormRow>
              
              <ButtonGroup>
                <SecondaryButton type="button" onClick={prevStep} disabled={isLoading}>
                  Voltar
                </SecondaryButton>
                <PrimaryButton type="button" onClick={nextStep} disabled={isLoading}>
                  Continuar
                </PrimaryButton>
              </ButtonGroup>
            </>
          ) : (
            <>
              <SectionTitle>Endereço</SectionTitle>
              
              <FormRow>
                <FormInput
                  id="cep"
                  label="CEP"
                  placeholder="00000-000"
                  error={errors.cep?.message}
                  required
                  {...registerWithMask('cep','99999-999')}
                  onChange={handleCepOnChange}
                />
                
                <FormInput
                  id="estado"
                  label="Estado"
                  placeholder="UF"
                  error={errors.estado?.message}
                  required
                  {...register('estado')}
                />
              </FormRow>
              
              <FormRow>
                <FormInput
                  id="cidade"
                  label="Cidade"
                  placeholder="Sua cidade"
                  error={errors.cidade?.message}
                  required
                  {...register('cidade')}
                />
                
                <FormInput
                  id="bairro"
                  label="Bairro"
                  placeholder="Seu bairro"
                  error={errors.bairro?.message}
                  required
                  {...register('bairro')}
                />
              </FormRow>
              
              <FormRow>
                <FormInput
                  id="endereco"
                  label="Endereço"
                  placeholder="Rua, Avenida, etc"
                  error={errors.endereco?.message}
                  required
                  {...register('endereco')}
                />
                
                <FormInput
                  id="numero"
                  label="Número"
                  placeholder="Nº"
                  error={errors.numero?.message}
                  required
                  {...register('numero')}
                />
              </FormRow>
              
              <FormInput
                id="complemento"
                label="Complemento"
                placeholder="Apartamento, bloco, etc (opcional)"
                error={errors.complemento?.message}
                {...register('complemento')}
              />
              
              <SectionTitle>Senha</SectionTitle>
              
              <FormRow>
                <FormInput
                  id="senha"
                  label="Senha"
                  type="password"
                  isPassword
                  placeholder="Mínimo 6 caracteres"
                  error={errors.senha?.message}
                  required
                  {...register('senha')}
                />
                
                <FormInput
                  id="confirmarSenha"
                  label="Confirmar senha"
                  type="password"
                  isPassword
                  placeholder="Repita sua senha"
                  error={errors.confirmarSenha?.message}
                  required
                  {...register('confirmarSenha')}
                />
              </FormRow>
              
              <SecurityInfo>
                <i className="fas fa-shield-alt"></i>
                Seus dados estão protegidos e não serão compartilhados
              </SecurityInfo>
              
              <ButtonGroup>
                <SecondaryButton type="button" onClick={prevStep} disabled={isLoading}>
                  Voltar
                </SecondaryButton>
                <PrimaryButton type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Processando...
                    </>
                  ) : (
                    'Criar conta e continuar'
                  )}
                </PrimaryButton>
              </ButtonGroup>
            </>
          )}
        </Form>
        
        {/* <LoginOption>
          Já tem uma conta?{' '}
          <LoginLink href="/login" onClick={handleLogin}>
            Faça login
          </LoginLink>
        </LoginOption> */}
      </ModalContent>
    </Modal>
  );
};

// Styled components
const ModalContent = styled.div`
  padding: 2.5rem 3rem;
  max-height: 85vh;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    padding: 2rem;
  }
  
  @media (max-width: 576px) {
    padding: 1.5rem;
  }
`;

const ModalHeader = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
`;

const WelcomeMessage = styled.h2`
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.75rem;
  color: ${({ theme }) => theme.colors.primary};
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const SubTitle = styled.p`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  margin-top: 1.5rem;
  color: ${({ theme }) => theme.colors.text.primary};
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -0.5rem;
    left: 0;
    width: 3rem;
    height: 3px;
    background: linear-gradient(90deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
    border-radius: 3px;
  }
  
  &:first-of-type {
    margin-top: 0;
  }
`;

const FormRow = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  
  & > div {
    flex: 1;
    width: 100%;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
    margin-bottom: 20px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  
  & > div:not(${FormRow}) {
    margin-bottom: 24px;
  }
`;


const SecurityInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 1rem;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  background-color: rgba(46, 204, 113, 0.08);
  border-radius: 8px;
  border: 1px solid rgba(46, 204, 113, 0.2);
  
  i {
    color: #27ae60;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 2rem;
  
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const Button = styled.button`
  padding: 1rem 1.5rem;
  height: 55px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  @media (max-width: 576px) {
    width: 100%;
  }
`;

const PrimaryButton = styled(Button)`
  flex: 2;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
  color: white;
  border: none;
  box-shadow: 0 4px 12px ${({ theme }) => `${theme.colors.primary}40`};
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px ${({ theme }) => `${theme.colors.primary}50`};
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const SecondaryButton = styled(Button)`
  flex: 1;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.text.primary};
  border: 1px solid rgba(0, 0, 0, 0.1);
  
  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.gray.light};
    border-color: rgba(0, 0, 0, 0.2);
  }
`;

const LoginOption = styled.div`
  text-align: center;
  margin-top: 2rem;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const LoginLink = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

export default QuickSignupModal;
