'use client';

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import Modal from '../ui/Modal';
import { signIn } from 'next-auth/react';
import { toast } from 'react-toastify';
import FormInput from '@/components/common/FormInput';
import { useRouter } from 'next/navigation';
import { validateCPF } from '@/utils/validators';
import { useAddressField } from '@/hooks/useAddressField';
import { useHookFormMask } from 'use-mask-input';
import { signupSchema, SignupFormData } from '@/zod/quicksignup.validation';
import { FaEnvelope, FaIdCard, FaPhone, FaUser, FaUserCheck, FaMapMarkerAlt, FaCity, FaShieldAlt, FaLock, FaCertificate, FaMapPin, FaRoad, FaHome, FaBuilding, FaGlobe, FaShoppingCart } from 'react-icons/fa';
import Image from 'next/image';
import { INumberPackageCampaign } from '@/hooks/useCampaignSelection';
import { PurchaseSummary } from '@/components/order/PurchaseSummary';
import { ICampaign } from '@/models/interfaces/ICampaignInterfaces';
import { CheckoutButton } from '@/components/ui';
import InputCheckbox from '../common/InputCheckbox';
import { TermsContainer, TermsLink, TermsText } from '@/styles/registration.styles';
import CustomDropdown from '../common/CustomDropdown';
import { brazilianStates } from '@/utils/constants';
import { IUser } from '@/models/interfaces/IUserInterfaces';
import userAPIClient from '@/API/userAPIClient';
import MaximumTrustHeader from '../security/MaximumTrustHeader';

const ModalContent = styled.div`
  padding: 0.5rem;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
    color: #1e293b;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const DataSection = styled.div`
  background: #fff;
  border-radius: 12px;
  border: 1px solid rgba(99, 102, 241, 0.1);
  overflow: hidden;
  margin: 0.5rem 0;
`;

const DataHeader = styled.div`
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;

  svg {
    color: #fff;
    width: 1rem;
    height: 1rem;
  }

  h3 {
    color: #fff;
    font-size: 0.875rem;
    font-weight: 600;
    margin: 0;
  }
`;

const DataGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  flex-wrap: nowrap;
  padding: 0.75rem;
  background: #fff;

  @media (max-width: 640px) {
  grid-template-columns: repeat(2, 1fr);
      flex-wrap: nowrap;
    gap: 0.375rem;
    padding: 0.5rem;
  }
`;

const DataItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  transition: all 0.2s ease;

  &:hover {
    background: #fff;
    border-color: rgba(99, 102, 241, 0.2);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  svg {
    color: #6366f1;
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
    opacity: 0.8;
  }
`;

const DataContent = styled.div`
  flex: 1;
  min-width: 0; // Evita overflow em textos longos
`;

const DataLabel = styled.div`
  font-size: 0.675rem;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin-bottom: 0.125rem;
`;

const DataValue = styled.div`
  font-size: 0.75rem;
  font-weight: 500;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

interface QuickSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  campanha: ICampaign;
  campaignSelection: INumberPackageCampaign;
}

const QuickSignupModal: React.FC<QuickSignupModalProps> = ({ isOpen, onClose, onSuccess, campaignSelection, campanha }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isStepValid, setIsStepValid] = useState(false);
  const [foundUser, setFoundUser] = useState<any>(null);
  const [isUserFound, setIsUserFound] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Bloqueia o scroll da página quando o modal está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [isOpen]);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema) as any,
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
      uf: '',
      cidade: '',
      bairro: '',
      logradouro: '',
      numero: '',
      complemento: '',
      hasAddress: false,
      termsAgreement: false,
    },
  });
  
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
  } = form;

  const hasAddress = watch('hasAddress',false);
  const termsAccepted = watch('termsAgreement',false);

  // Monitorar todos os campos do formulário para validação em tempo real
  const watchedFields = watch();

  // Função de validação de step otimizada - versão síncrona para validação rápida
  const isCurrentStepValid = (): boolean => {
    switch(currentStep) {
      case 0:
        // Step de telefone
        return Boolean(
          watchedFields.telefone && 
          watchedFields.telefone.replace(/\D/g, '').length === 11 && 
          !errors.telefone
        );
      
      case 1:
        // Step de dados pessoais
        return Boolean(
          watchedFields.nome && 
          watchedFields.email && 
          watchedFields.cpf && 
          watchedFields.telefone && 
          watchedFields.confirmarTelefone && 
          termsAccepted &&
          !errors.nome && 
          !errors.email && 
          !errors.cpf && 
          !errors.telefone && 
          !errors.confirmarTelefone &&
          !errors.termsAgreement
        );
      
      case 2:
        // Step de endereço - só valida se hasAddress for true
        if (!hasAddress) return true;
        
        return Boolean(
          watchedFields.cep && 
          watchedFields.uf && 
          watchedFields.cidade && 
          watchedFields.bairro && 
          watchedFields.logradouro && 
          watchedFields.numero &&
          !errors.cep && 
          !errors.uf && 
          !errors.cidade && 
          !errors.bairro && 
          !errors.logradouro && 
          !errors.numero
        );
      
      case 3:
      case 4:
      case 10:
        // Steps que não precisam de validação ou são sempre válidos
        return true;
      
      default:
        return false;
    }
  };

  // Função de validação de step otimizada - versão assíncrona para validação completa
  const validateStep = async (currentStep: number) => {
    let fieldsToValidate: (keyof SignupFormData)[] = [];
    
    switch(currentStep) {
      case 0:
        fieldsToValidate = ['telefone'];
        break;
      case 1:
        // Dados pessoais/do representante
        fieldsToValidate = ['nome', 'nomeSocial', 'email', 'cpf', 'telefone', 'confirmarTelefone','hasAddress', 'termsAgreement'];
        break;
      case 2:
        // Step de endereço - só valida se hasAddress for true
        if (hasAddress) {
          fieldsToValidate = ['cep', 'uf', 'cidade', 'bairro', 'logradouro', 'numero', 'complemento'];
        } else {
          return true; // Se não tem endereço, step é válido
        }
        break;
      case 3:
        // Step de senha - sempre valida senha
        return true;
        break;
      case 4:
        // Step de resumo - não precisa validar nada, só mostrar dados
        return true;
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

  // Atualizar isStepValid sempre que os campos ou step mudarem
  useEffect(() => {
    const stepValid = isCurrentStepValid();
    setIsStepValid(Boolean(stepValid));
  }, [watchedFields, currentStep, hasAddress, termsAccepted, errors]);

  const registerWithMask = useHookFormMask(register);
  
  // Função para buscar endereço pelo CEP
  const { isLoadingCep, handleCepChange, clearAddressFields } = useAddressField(setValue, setError, clearErrors,trigger);
  const [isLoadingVerify, setIsLoadingVerify] = useState(false);


  const selectedUF = watch('uf');
  

  
  const handleStateChange = (value: string) => {
    setValue('uf', value, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
  };

  const verifyIfMainDataExists = async (data: {cpf: string, email: string, phone: string}) => {
    const response = await userAPIClient.verifyIfMainDataExists(data);
    if(response.statusCode === 200) {
      return false;
    }
    return response;
  }

  const verifyMainData  = async (step: number) => {
    const {cpf, email, telefone} = form.getValues();

    const response = await verifyIfMainDataExists({cpf: cpf.replace(/\D/g, ''), email, phone: telefone.replace(/\D/g, '')});

    console.log('response validation',response);

    if(response) {          
        response.issues.forEach((issue: {field: string, message: string}) => {
          setError(issue.field as keyof SignupFormData, { message: issue.message });
        });
        return;
    }else{
      setCurrentStep(step); // Pula endereço e senha, vai direto para resumo
    }
  }

  const onSubmit = async (data: SignupFormData) => {
    try {
      setIsSubmitting(true);
      
      // Se não tem endereço, criar dados para checkout direto (sem cadastro completo)
      const formattedData: Partial<IUser>  = {
        name: data.nome,
        socialName: data.nomeSocial,
        email: data.email,
        cpf: data.cpf.replace(/[^\d]/g, ''),
        phone: data.telefone.replace(/[^\d]/g, ''),
        address: {
          zipCode: data.cep?.replace(/\D/g, '') || '',
          state: data.uf || '',
          city: data.cidade || '',
          neighborhood: data.bairro || '',
          street: data.logradouro || '',
          number: data.numero || '',
          complement: data.complemento || '',
        },
        role: 'user',
        consents: {
          termsAndConditions: data.termsAgreement,
          marketingEmails: data.termsAgreement,
          dataSharing: data.termsAgreement,
        },
        isActive: true,
        statistics: {
          participationCount: 0,
          totalSpent: 0,
          rafflesWon: 0,
          lastParticipation: new Date(),
        }
      };
        
        //router.push(`/campanhas/${campaignSelection.campaignCode}/checkout`);
      
      
      // Call signup API
      const result = await userAPIClient.quickUserCreate(formattedData as Partial<IUser>);

      
      if (result.success) {

        localStorage.setItem('checkoutData', JSON.stringify({
          campaignSelection,
          campanha,
          foundUser:{
            ...result.data,
          },
        }));

        
        router.push(`/campanhas/${campaignSelection.campaignCode}/checkout`);
        // Não desligar o loading aqui pois a página vai mudar
      }else{
        toast.error(result.message);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Erro ao criar conta. Por favor tente novamente.',{
        position: "top-center",
      });
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    // reset();
    // setCurrentStep(0);
    onClose();
  };
  
  const nextStep = async () => {
    const isStepValid = await validateStep(currentStep);
    if (isStepValid) {
      // Se estamos no step 1 (dados pessoais) e hasAddress é false, ir direto para resumo (step 4)
      if (currentStep === 1 && !hasAddress) {
        await verifyMainData(4);

      } else if(currentStep === 1 && hasAddress) {
        await verifyMainData(currentStep + 1);
      }
      else if(currentStep === 2 && hasAddress) {
        setCurrentStep(4);
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };
  
  const prevStep = () => {
    // Se estamos no step 4 (resumo) e hasAddress é false, voltar para o step 1 (dados pessoais)
    if (currentStep === 4 && !hasAddress) {
      setCurrentStep(1); // Pula endereço e senha, volta direto para step 1 (dados pessoais)
    } else if(currentStep === 4 && hasAddress) {
      setCurrentStep(2);
    } else {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleVerify = async (e: React.MouseEvent) => {
    e.preventDefault();
    const phone = form.getValues('telefone').replace(/\D/g, '');

    const isPhoneValid = await validateStep(0);

    if(!isPhoneValid) {
      setError('telefone', { message: errors.telefone?.message as string });
      return;
    }

    setIsLoadingVerify(true);

    const response  = await userAPIClient.verifyIfUserExists(phone);

    if(response.statusCode === 200) {
      // Usuário encontrado - mostrar dados para confirmação
      setFoundUser(response.data);
      setIsUserFound(true);
      setCurrentStep(10); // Step especial para usuário encontrado
    }else{
      // Usuário não encontrado - continuar com cadastro
      setIsUserFound(false);
      nextStep();
    }

    setIsLoadingVerify(false);
  
  };

  const submitUserFound = async () => {
    setIsLoading(true);
    
    try {
      const checkoutData = {
        campaignSelection,
        foundUser,
        campanha,
      };
      
      localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
      
      // Verificar se foi salvo corretamente
      const savedData = localStorage.getItem('checkoutData');
      console.log('[QUICK_SIGNUP] Dados salvos verificação:', savedData?.substring(0, 200) + '...');
      
      // Adicionar um pequeno delay para mostrar a animação de loading
      await new Promise(resolve => setTimeout(resolve, 800));
      
      console.log('[QUICK_SIGNUP] Navegando para:', `/campanhas/${campaignSelection.campaignCode}/checkout`);
      router.push(`/campanhas/${campaignSelection.campaignCode}/checkout`);
      
      // Não desligar o loading aqui pois a página vai mudar
      // setIsLoading(false) será chamado quando a página mudar
    } catch (error) {
      console.error('[QUICK_SIGNUP] Erro ao processar:', error);
      setIsLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleModalClose} >
      <ModalContent>
        <ModalHeader>
          <HeaderActions>
            <CloseButton onClick={handleModalClose} disabled={isLoading || isSubmitting}>
              Fechar
            </CloseButton>
          </HeaderActions>
          <MaximumTrustHeader />
        </ModalHeader>
        
        <Form onSubmit={handleSubmit(onSubmit)}>
          {currentStep === 0 ? (
            <>
              <StepTitle>Checkout</StepTitle>
            
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
                <PrimaryButton type="button" onClick={handleVerify} disabled={isLoading || isLoadingVerify || !isStepValid}>
                  {isLoadingVerify ? (
                    <LoadingContainer>
                      <LoadingSpinner />Verificando...
                    </LoadingContainer>
                  ) : (
                    'Continuar'
                  )}
                </PrimaryButton>
              </ButtonGroup>
            </>
          ) : currentStep === 1 ? (
            <div key="personal-data-step">
              <StepSubtitle>
                <FaUser />
                Dados do participante
              </StepSubtitle>
              
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
              

              <FormRow>
              <InputCheckbox
                id="hasAddress"
                label="Preecher endereco para receber o prêmio"
                checked={hasAddress}
                onChange={(e) => {
                  if(!e.target.checked){
                    clearAddressFields();
                  }
                  form.setValue('hasAddress', e.target.checked, { 
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true
                  });
                }}
                error={errors.hasAddress?.message as string}
              />
              </FormRow>

 
              <TermsContainer>
                <InputCheckbox
                  id="termsAgreement"
                  label={
                    <TermsText>
                      Li e concordo com os <TermsLink href="/termos-de-uso">Termos de Uso</TermsLink> e <TermsLink href="/politica-de-privacidade">Política de Privacidade</TermsLink> da plataforma.
                    </TermsText>
                  }
                  checked={termsAccepted}
                  onChange={(e) => {
                    form.setValue('termsAgreement', e.target.checked, { 
                      shouldValidate: true,
                      shouldDirty: true,
                      shouldTouch: true
                    });
                  }}
                  error={errors.termsAgreement?.message as string}
                />
              </TermsContainer>

              
              <ButtonGroup>
                <SecondaryButton type="button" onClick={prevStep} disabled={isLoading}>
                  Voltar
                </SecondaryButton>
                <PrimaryButton type="button" onClick={nextStep} disabled={isLoading || !isStepValid}>
                  Continuar
                </PrimaryButton>
              </ButtonGroup>
            </div>
          ) : currentStep === 10 ? (
            <>
              {foundUser && (
                <>
 
                  <DataSection>
                    <DataHeader>
                      <FaUserCheck />
                      <h3>Dados do Comprador</h3>
                    </DataHeader>
                    <DataGrid>
                      <DataItem>
                        <FaUser />
                        <DataContent>
                          <DataLabel>Nome</DataLabel>
                          <DataValue>{foundUser.name}</DataValue>
                        </DataContent>
                      </DataItem>
                      <DataItem>
                        <FaEnvelope />
                        <DataContent>
                          <DataLabel>Email</DataLabel>
                          <DataValue>{foundUser.email}</DataValue>
                        </DataContent>
                      </DataItem>
                      <DataItem>
                        <FaPhone />
                        <DataContent>
                          <DataLabel>Telefone</DataLabel>
                          <DataValue>{foundUser.phone}</DataValue>
                        </DataContent>
                      </DataItem>
                      <DataItem>
                        <FaIdCard />
                        <DataContent>
                          <DataLabel>CPF</DataLabel>
                          <DataValue>{foundUser.cpf}</DataValue>
                        </DataContent>
                      </DataItem>
                      {foundUser.address && (
                        <>
                          <DataItem>
                            <FaMapMarkerAlt />
                            <DataContent>
                              <DataLabel>Endereço</DataLabel>
                              <DataValue>
                                {foundUser.address.street_display}, {foundUser.address.number_display}
                                {foundUser.address.complement_display && `, ${foundUser.address.complement_display}`}
                              </DataValue>
                            </DataContent>
                          </DataItem>
                          <DataItem>
                            <FaCity />
                            <DataContent>
                              <DataLabel>Cidade</DataLabel>
                              <DataValue>
                                {foundUser.address.city}, {foundUser.address.state} - CEP: {foundUser.address.zipCode_display}
                              </DataValue>
                            </DataContent>
                          </DataItem>
                        </>
                      )}
                    </DataGrid>
                  </DataSection>
                  
                  <SectionDivider />
                  
                  <PurchaseSummary selection={campaignSelection} />
                  
                  <ButtonGroup>
                    <SecondaryButton type="button" onClick={() => setCurrentStep(0)} disabled={isLoading}>
                      Voltar
                    </SecondaryButton>
                    <div className="checkout-button-wrapper">
                      <CheckoutButton type="button" onClick={submitUserFound} disabled={isLoading} isLoading={isLoading}>
                        Prosseguir para Pagamento
                      </CheckoutButton>
                    </div>
                  </ButtonGroup>
                </>
              )}
            </>
          ) : currentStep === 2 ? (
            <div key="address-step">
              <StepTitle>Endereço</StepTitle>
              
              <FormRow>
                <FormInput
                  id="cep"
                  label="CEP"
                  icon={isLoadingCep ? <LoadingSpinner /> : <FaMapPin />}
                  placeholder="00000-000"
                  error={errors.cep?.message}
                  required
                  {...registerWithMask('cep','99999-999')}
                  onChange={handleCepChange}
                />
                

        
          <StyledDropdownWrapper>
            <CustomDropdown
              id="uf"
              label="Estado"
              options={brazilianStates}
              value={selectedUF || ''}
              {...register('uf')}
              onChange={handleStateChange}
              placeholder="Selecione o estado"
              icon={<FaGlobe />}
              disabled={isLoadingCep}
              direction="down"
              error={errors.uf?.message}
            />
          </StyledDropdownWrapper>
        
              </FormRow>
              
              <FormRow>
                <FormInput
                  id="cidade"
                  label="Cidade"
                  icon={<FaCity />}
                  placeholder="Sua cidade"
                  error={errors.cidade?.message}
                  required
                  {...register('cidade')}
                />
                
                <FormInput
                  id="bairro"
                  label="Bairro"
                  icon={<FaMapMarkerAlt />}
                  placeholder="Seu bairro"
                  error={errors.bairro?.message}
                  required
                  {...register('bairro')}
                />
              </FormRow>
              
              <FormRow>
                <FormInput
                  id="logradouro"
                  label="Endereço"
                  icon={<FaRoad />}
                  placeholder="Rua, Avenida, etc"
                  error={errors.logradouro?.message}
                  required
                  {...register('logradouro')}
                />
                
                <FormInput
                  id="numero"
                  label="Número"
                  icon={<FaHome />}
                  placeholder="Nº"
                  error={errors.numero?.message}
                  required
                  {...register('numero')}
                />
              </FormRow>
              
              <FormInput
                id="complemento"
                label="Complemento"
                icon={<FaBuilding />}
                placeholder="Apartamento, bloco, etc (opcional)"
                error={errors.complemento?.message}
                {...register('complemento')}
              />
              
              <ButtonGroup>
                <SecondaryButton type="button" onClick={prevStep} disabled={isLoading}>
                  Voltar
                </SecondaryButton>
                <PrimaryButton type="button" onClick={nextStep} disabled={isLoading || !isStepValid}>
                  Continuar
                </PrimaryButton>
              </ButtonGroup>
            </div>
          ) : currentStep === 3 ? (
            <>
              <StepTitle>Senha</StepTitle>
              
              {/* <FormRow>
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
              </FormRow> */}
              
              <SecurityInfo>
                <i className="fas fa-shield-alt"></i>
                🔐 Segurança Máxima: Seus dados pessoais são protegidos por criptografia nível militar (AES-256-GCM) e jamais serão compartilhados com terceiros
              </SecurityInfo>
              
              <ButtonGroup>
                <SecondaryButton type="button" onClick={prevStep} disabled={isLoading}>
                  Voltar
                </SecondaryButton>
                <PrimaryButton type="submit" disabled={isLoading || !isStepValid}>
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
          ) : currentStep === 4 ? (
            <div key="summary-step">
              <StepTitle>Resumo da Compra</StepTitle>
              
              <DataGroup>
                <DataHeader>
                  <FaUser />
                  <h3>Dados Pessoais</h3>
                </DataHeader>
                <DataContent>
                  <DataRow>
                    <DataLabel>Nome</DataLabel>
                    <DataValue>{watch('nome')}</DataValue>
                  </DataRow>
                  <DataRow>
                    <DataLabel>CPF</DataLabel>
                    <DataValue>{watch('cpf')}</DataValue>
                  </DataRow>
                  <DataRow>
                    <DataLabel>Email</DataLabel>
                    <DataValue>{watch('email')}</DataValue>
                  </DataRow>
                  <DataRow>
                    <DataLabel>Telefone</DataLabel>
                    <DataValue>{watch('telefone')}</DataValue>
                  </DataRow>
                </DataContent>
              </DataGroup>

              {hasAddress && (
                <DataGroup>
                  <DataHeader>
                    <FaMapMarkerAlt />
                    <h3>Endereço de Entrega</h3>
                  </DataHeader>
                  <DataContent>
                    <DataRow>
                      <DataLabel>Endereço</DataLabel>
                      <DataValue>
                        {watch('logradouro')}, {watch('numero')}
                        {watch('complemento') && `, ${watch('complemento')}`}
                      </DataValue>
                    </DataRow>
                    <DataRow>
                      <DataLabel>Bairro</DataLabel>
                      <DataValue>{watch('bairro')}</DataValue>
                    </DataRow>
                    <DataRow>
                      <DataLabel>Cidade/UF</DataLabel>
                      <DataValue>
                        {watch('cidade')}/{watch('uf')}
                      </DataValue>
                    </DataRow>
                    <DataRow>
                      <DataLabel>CEP</DataLabel>
                      <DataValue>{watch('cep')}</DataValue>
                    </DataRow>
                  </DataContent>
                </DataGroup>
              )}

              <DataGroup>
                <DataHeader>
                  <FaShoppingCart />
                  <h3>Detalhes da Compra</h3>
                </DataHeader>
                <DataContent>
                  <PurchaseSummary selection={campaignSelection} />
                </DataContent>
              </DataGroup>

              <ButtonGroup>
                <SecondaryButton type="button" onClick={prevStep} disabled={isLoading}>
                  Voltar
                </SecondaryButton>
                <div className="checkout-button-wrapper">
                  <CheckoutButton type="submit" disabled={isSubmitting} isLoading={isSubmitting}>
                    Prosseguir para Pagamento
                  </CheckoutButton>
                </div>
              </ButtonGroup>
            </div>
          ) : null}
        </Form>
        
        <SecurityFooter>
          <SecurityText>
            <span><FaShieldAlt />Proteção Nível Militar: Seus dados são guardados com criptografia AES-512 - o mesmo padrão usado por bancos e governos para máxima segurança</span>
          </SecurityText>
          
          <TrustLogos>
            <LogoItem>
              <Image 
                src="/icons/loterias-caixa-logo.svg" 
                alt="Loteria Federal" 
                width={80} 
                height={80}
                className="logo-image"
              />
              {/* <div className="logo-text">Autorizado<br/>Loteria Federal</div> */}
            </LogoItem>
            
            <LogoItem>
              <Image 
                src="/icons/pix-banco-central.svg" 
                alt="PIX Banco Central" 
                width={80} 
                height={80}
                className="logo-image"
              />
              {/* <div className="logo-text">Pagamento<br/>PIX Seguro</div> */}
            </LogoItem>
          </TrustLogos>
        </SecurityFooter>
        
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
const TrustBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #f8fffe 0%, #ffffff 100%);
  border: 1px solid rgba(46, 204, 113, 0.15);
  border-radius: 8px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.6rem 1rem;
  }
  
  @media (max-width: 576px) {
    padding: 0.5rem 0.75rem;
    margin-bottom: 1rem;
  }
`;


const StyledDropdownWrapper = styled.div`
  width: 100%;
  position: relative;
  z-index: 10;
  
  .dropdown-label {
    display: block;
    margin-bottom: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    color: #333;
  }
  
  .required-mark {
    color: #ef4444;
    margin-left: 4px;
  }
  
  .error-message {
    color: #ef4444;
    font-size: 0.8rem;
    margin-top: 6px;
    font-weight: 500;
  }
`;

const TrustItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  color: #2c3e50;
  font-weight: 500;
  
  svg {
    font-size: 0.9rem;
    color: #27ae60;
  }
  
  @media (max-width: 768px) {
    font-size: 0.7rem;
    
    svg {
      font-size: 0.8rem;
    }
  }
  
  @media (max-width: 576px) {
    font-size: 0.65rem;
    
    svg {
      font-size: 0.75rem;
    }
  }
`;

const TrustDivider = styled.div`
  width: 1px;
  height: 16px;
  background: rgba(46, 204, 113, 0.2);
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const LotteryBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #2c3e50;
  font-weight: 600;
  
  .lottery-logo {
    width: 24px;
    height: 24px;
    filter: brightness(1.1);
  }
  
  @media (max-width: 768px) {
    font-size: 0.7rem;
    gap: 0.4rem;
    
    .lottery-logo {
      width: 22px;
      height: 22px;
    }
  }
  
  @media (max-width: 576px) {
    font-size: 0.65rem;
    gap: 0.35rem;
    
    .lottery-logo {
      width: 20px;
      height: 20px;
    }
  }
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
  
  /* Espaçamento reduzido para checkboxes */
  &:has(input[type="checkbox"]) {
    margin-bottom: 12px;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
    margin-bottom: 20px;
    
    &:has(input[type="checkbox"]) {
      margin-bottom: 8px;
    }
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
  margin-bottom: 0rem;
  background-color: rgba(46, 204, 113, 0.08);
  border-radius: 8px;
  border: 1px solid rgba(46, 204, 113, 0.2);
  
  i {
    color: #27ae60;
  }
`;

const SecurityFooter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1rem;
  padding: 0.50rem;
  background: linear-gradient(135deg, #f8fffe 0%, #ffffff 100%);
  border-radius: 8px;
  border: 1px solid rgba(46, 204, 113, 0.1);
  
  @media (max-width: 576px) {
    margin-top: 0.75rem;
    padding: 0.6rem;
    gap: 0.6rem;
  }
`;

const SecurityText = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  color: #4a5568;
  text-align: center;
  line-height: 1.4;
  font-weight: 500;
  
  span {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-align: center;
    
    svg {
      color: #27ae60;
      font-size: 1rem;
      flex-shrink: 0;
      filter: drop-shadow(0 1px 2px rgba(39, 174, 96, 0.2));
      margin-right: 0.2rem;
    }
  }
  
  @media (max-width: 576px) {
    font-size: 0.65rem;
    
    span {
      gap: 0.4rem;
      
      svg {
        font-size: 0.9rem;
        margin-right: 0.15rem;
      }
    }
  }
  
  @media (max-width: 480px) {
    span {
      flex-direction: column;
      gap: 0.3rem;
      
      svg {
        font-size: 1.1rem;
        margin-right: 0;
      }
    }
  }
`;


const fadeIn = keyframes`
  0% {
    opacity: 0;
    transform: translateX(-10px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
`;

const spin = keyframes`
  0% { 
    transform: rotate(0deg);
  }
  100% { 
    transform: rotate(360deg);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  margin-right: 12px;
  animation: ${fadeIn} 0.3s ease-out;
  
  @media (max-width: 480px) {
    margin-right: 10px;
  }
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(46, 204, 113, 0.2);
  border-top: 2px solid #2ecc71;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-right: 8px;
  
  @media (max-width: 480px) {
    width: 14px;
    height: 14px;
    margin-right: 6px;
  }
`;

const TrustLogos = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  
  @media (max-width: 576px) {
    gap: 1.25rem;
  }
`;

const LogoItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  
  .logo-image {
    filter: brightness(1.1);
    transition: all 0.2s ease;
    
    &:hover {
      transform: scale(1.05);
    }
  }
  
  .logo-text {
    font-size: 0.55rem;
    color: #6c757d;
    font-weight: 500;
    text-align: center;
    line-height: 1.1;
  }
  
  @media (max-width: 576px) {
    gap: 0.25rem;
    
    .logo-text {
      font-size: 0.5rem;
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: auto;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(226, 232, 240, 0.8);
  background: white;
  
  .checkout-button-wrapper {
    flex: 2;
  }

  @media (max-width: 576px) {
    flex-direction: column;
    gap: 0.5rem;
    
    .checkout-button-wrapper {
      width: 100%;
    }
    
    button {
      width: 100%;
    }
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.25rem;
  height: 45px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
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

    @media (min-width: 738px) {
    height: 55px !important;
    font-size: 0.9rem;
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

  @media (min-width: 738px) {
    height: 55px !important;
    font-size: 0.9rem;
  }

  @media (max-width: 738px) {
    height: 55px !important;
    font-size: 0.9rem;
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

// User Data Section Styled Components
const DataGroup = styled.div`
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  margin-bottom: 0.75rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const DataRow = styled.div`
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 0.75rem;
  align-items: baseline;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;

  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 0.25rem;
    margin-bottom: 0.75rem;
  }
`;

const SectionDivider = styled.div`
  height: 1px;
  background: linear-gradient(90deg, transparent, ${({ theme }) => theme.colors.gray.medium}20, transparent);
  margin: 1.25rem 0;
  
  @media (max-width: 768px) {
    margin: 1rem 0;
  }
`;

// Atualizar o step 4 (resumo)
const SummaryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1rem;
`;

const SummarySection = styled.div`
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const SummaryHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: linear-gradient(to right, #f8fafc, #f1f5f9);
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);

  svg {
    color: #4f46e5;
    font-size: 1.1rem;
  }

  h3 {
    font-size: 0.95rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
  }
`;

const SummaryContent = styled.div`
  padding: 1.25rem;
`;

const SummaryRow = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 1rem;
  align-items: baseline;
  margin-bottom: 0.75rem;

  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 0.25rem;
    margin-bottom: 1rem;
  }
`;

const SummaryLabel = styled.span`
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
`;

const SummaryValue = styled.span`
  font-size: 0.9rem;
  color: #0f172a;
  font-weight: 500;
  word-break: break-word;
`;

const StepTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a237e;
  margin: 0.5rem 0 1rem;
  position: relative;
  display: inline-block;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 40px;
    height: 3px;
    background: linear-gradient(90deg, #6366f1, #4f46e5);
    border-radius: 4px;
  }
`;

const StepSubtitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    color: #6366f1;
    width: 1.25rem;
    height: 1.25rem;
  }

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, rgba(99, 102, 241, 0.2), transparent);
    margin-left: 0.75rem;
  }
`;

export default QuickSignupModal;
