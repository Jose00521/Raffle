'use client';

import React, { useState, useRef, useEffect } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { FaPlus, FaTrash, FaImage, FaLink, FaLock, FaUnlock, FaInfoCircle, FaQuestionCircle, FaTag, FaBuilding, FaCode, FaPercent, FaListAlt, FaTimes, FaEdit, FaCreditCard, FaQrcode, FaFileInvoice, FaPaypal, FaBitcoin, FaUniversity, FaGlobe, FaPalette, FaCog, FaClock, FaRedo, FaSpinner, FaExclamationCircle } from 'react-icons/fa';
import Modal from '../../ui/Modal';
import FormInput from '../../common/FormInput';
import FormTextArea from '../../common/FormTextArea';
import FormColorInput from '../../common/FormColorInput';
import CustomDropdown from '../../common/CustomDropdown';
import InputCheckbox from '../../common/InputCheckbox';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { PaymentGatewayTemplateStatus } from '@/mocks/gatewayMocks';
import { adminGatewayTemplateAPIClient } from '@/API/admin/adminGatewayTemplateAPIClient';
import { toast } from 'react-toastify';
import { zodResolver } from '@hookform/resolvers/zod';
import { GatewayTemplateFormSchema } from '@/zod/gateway-template.schema';
import debounce from 'lodash/debounce';

// Enums
export enum FieldType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  SELECT = 'SELECT',
  PASSWORD = 'PASSWORD',
  EMAIL = 'EMAIL'
}


// Interfaces
interface GatewayFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  initialData?: Partial<GatewayFormData>;
  isEditing?: boolean;
}

interface GatewayFormData {
  templateCode: string;
  name: string;
  description: string;
  provider: string;
  version: string;
  status: PaymentGatewayTemplateStatus;
  documentation: string;
  color: string;
  isPublic: boolean;
  logo?: File;
  logoUrl?: string; // URL do logo para modo de edição
  credentialFields: GatewayField[];
  settingFields: GatewayField[];
  supportedMethods: PaymentMethodConfig[];
  apiConfig: {
    baseUrl: string;
    testBaseUrl: string;
    apiVersion: string;
    timeout: number;
    retries: number;
  };
}

interface GatewayField {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  description?: string;
  group: 'credentials' | 'settings';
  isSecret: boolean;
  options?: { value: string, label: string }[];
}

interface PaymentMethodConfig {
  method: string;
  displayName: string;
  enabled: boolean;
  fees: {
    percentage: number;
    fixed?: number;
  };
}

// Estilos
const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: #f8fafc;
  padding: 1.25rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 0.375rem;
`;

const Select = styled.select`
  padding: 0.625rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.875rem;
  width: 100%;
  background-color: white;
  height: 55px;
  
  &:focus {
    outline: none;
    border-color: #64748b;
  }
`;

const Textarea = styled.textarea`
  padding: 0.625rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.875rem;
  width: 100%;
  min-height: 100px;
  resize: vertical;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #64748b;
    box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.2);
  }
`;

const FieldList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const DynamicField = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  gap: 0.75rem;
`;

const FieldHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FieldTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
  margin: 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Button = styled.button`
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
`;

const PrimaryButton = styled(Button)<{ $disabled?: boolean }>`
background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  border: none;
  ${props => props.$disabled && css`
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    opacity: 0.5;
    cursor: not-allowed;
  `}

`;

const SecondaryButton = styled(Button)`
  background-color: white;
  color: #64748b;
  border: 1px solid #cbd5e1;
  
  &:hover {
    background-color: #f8fafc;
    border-color: #94a3b8;
  }
`;

const DangerButton = styled(Button)`
  background-color: #ef4444;
  color: white;
  border: none;
  
  &:hover {
    background-color: #dc2626;
  }
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background-color: white;
  color: #64748b;
  cursor: pointer;
  
  &:hover {
    background-color: #f1f5f9;
    color: #475569;
  }
`;

const HelpText = styled.p`
  font-size: 0.75rem;
  color: #64748b;
  margin: 0;
`;

const ImagePreview = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const Logo = styled.img`
  max-width: 150px;
  max-height: 60px;
  border-radius: 4px;
  object-fit: contain;
  border: 1px solid #e2e8f0;
  padding: 0.5rem;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
  margin-top: 1rem;
`;

// Adicionar novos estilos para o sistema de tags
const PaymentMethodContainer = styled.div`
  margin-top: 1rem;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
  margin-bottom: 1.5rem;
`;

const MethodTag = styled.div<{ $isActive?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 8px;
  background-color: white;
  border: 1px solid ${props => props.$isActive ? '#3b82f6' : '#e2e8f0'};
  color: ${props => props.$isActive ? '#3b82f6' : '#64748b'};
  font-size: 0.875rem;
  transition: all 0.2s ease;
  width: 220px;
  
  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  }
`;

const MethodHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 0.5rem;
`;

const MethodTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #334155;
`;

const MethodActions = styled.div`
  display: flex;
  gap: 0.25rem;
`;

const TagIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TagActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: 0.5rem;
`;

const TagActionButton = styled.button<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  border: none;
  background-color: ${props => props.$danger ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)'};
  color: ${props => props.$danger ? '#ef4444' : '#6366f1'};
  font-size: 0.625rem;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.$danger ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.2)'};
  }
`;

const AddMethodContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

export const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(106, 17, 203, 0.3);
  border-radius: 50%;
  border-top-color: #6a11cb;
  animation: ${spin} 1s linear infinite;
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ErrorText = styled.div<{ $success?: boolean }>`
  color: ${props => props.$success ? '#10b981' : '#ef4444'};
  font-size: 0.8rem;
  margin-top: 6px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  animation: ${fadeIn} 0.2s ease;
  min-height: 16px;
  margin-top: 6px;
  
  @media (max-height: 800px) {
    margin-top: 4px;
    font-size: 0.75rem;
    bottom: -20px;
  }
  
  @media (max-height: 700px) {
    margin-top: 3px;
    font-size: 0.7rem;
    bottom: -18px;
  }
`;

const ErrorIcon = styled(FaExclamationCircle)`
  min-width: 14px;
  min-height: 14px;
`;

// Componente Principal
const GatewayFormModal: React.FC<GatewayFormModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  initialData,
  isEditing = false
}) => {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  // Variável de estado para armazenar o arquivo selecionado
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const defaultValues: GatewayFormData = {
    templateCode: '',
    name: '',
    description: '',
    provider: '',
    version: '1.0.0',
    status: PaymentGatewayTemplateStatus.DRAFT,
    documentation: '',
    color: '#6366f1', // Cor padrão roxa
    isPublic: true,
    credentialFields: [{
      name: '',
      label: '',
      type: FieldType.TEXT,
      required: false,
      placeholder: '',
      description: '',
      group: 'credentials',
      isSecret: false
    }],
    settingFields: [],
    supportedMethods: [
      {
        method: 'PIX',
        displayName: 'Pix',
        enabled: true,
        fees: {
          percentage: 0,
        }
      }
    ],
    apiConfig: {
      baseUrl: '',
      testBaseUrl: '',
      apiVersion: '1.0',
      timeout: 30000,
      retries: 3
    }
  };
  
  const { 
    control, 
    register, 
    handleSubmit, 
    setError,
    formState: { errors, isSubmitting ,isValid}, 
    reset,
    trigger,
  } = useForm<GatewayFormData>({
    resolver: zodResolver(GatewayTemplateFormSchema as any),
    defaultValues:  defaultValues,
    mode:'all',
    shouldFocusError: true,
    reValidateMode: 'onBlur',
    
  });
  
  const { fields: credentialFields, append: appendCredential, remove: removeCredential } = useFieldArray({
    control,
    name: 'credentialFields',
  });
  
  const { fields: settingFields, append: appendSetting, remove: removeSetting } = useFieldArray({
    control,
    name: 'settingFields',
  });
  
  const { fields: methodFields, append: appendMethod, remove: removeMethod } = useFieldArray({
    control,
    name: 'supportedMethods',
  });
  
  // Resetar o formulário quando for aberto
  const resetForm = () => {
    if (isOpen) {
      reset(initialData || defaultValues);
      
      // Limpar o arquivo e preview quando o modal é aberto ou fechado
      setLogoFile(null);
      setLogoPreview(null);
      
      // Se estiver em modo de edição e tiver um logo URL, carregar a prévia
      if (isEditing && initialData && initialData.logoUrl) {
        setLogoPreview(initialData.logoUrl);
      }
    }
  };

  const verifyIfAlreadyExists = async (event: React.ChangeEvent<HTMLInputElement>)=>{
    setSuccessMessage('');
    const debouncedVerify = debounce(async () => {
      const result = await adminGatewayTemplateAPIClient.verifyIfAlreadyExists(event.target.value);

      if(result.success){

        if(result.data){
          setError('templateCode', {message: 'Nome de template já em uso'});

          setIsVerifying(false);
          }else{
          setSuccessMessage('Nome de template disponível para uso');
          setIsVerifying(false);
        }

      }else{
        setError('templateCode', {message: 'Erro ao verificar se o template já existe'});
        setIsVerifying(false);
      }
      }, 800);

      const temaplateCodeIsValid = await trigger('templateCode');
      if(temaplateCodeIsValid){
        setIsVerifying(true);
        debouncedVerify();
      }
  }
  
  // Lidar com a visualização prévia do logo
  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Armazenar o arquivo selecionado
      setLogoFile(file);
      
      // Criar preview do arquivo
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setLogoFile(null);
      setLogoPreview(null);
      setError('logo', {message: 'Logo é obrigatória'});
    }
  };
  
  // Adicionar campo de credencial
  const addCredentialField = () => {
    appendCredential({
      name: '',
      label: '',
      type: FieldType.TEXT,
      required: false,
      placeholder: '',
      description: '',
      group: 'credentials',
      isSecret: false
    });
  };
  
  // Adicionar campo de configuração
  const addSettingField = () => {
    appendSetting({
      name: '',
      label: '',
      type: FieldType.TEXT,
      required: false,
      placeholder: '',
      description: '',
      group: 'settings',
      isSecret: false
    });
  };
  
  // Adicionar método de pagamento
  const addPaymentMethod = () => {
    appendMethod({
      method: '',
      displayName: '',
      enabled: true,
      fees: {
        percentage: 0,
      }
    });
  };
  
  // Processar o envio do formulário
  const processSubmit = async (data: GatewayFormData) => {
    const formData = new FormData();
    console.log('Dados do formulário de gateway:', data);
    
    // Adicionar campos básicos
    formData.append('templateCode', data.templateCode);
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('provider', data.provider);
    formData.append('version', data.version);
    formData.append('status', data.status);
    formData.append('documentation', data.documentation);
    formData.append('color', data.color);
    formData.append('isPublic', String(data.isPublic));
    
    // Adicionar logo se existir (usar a variável de estado ao invés do valor do formulário)
    if (logoFile) {
      formData.append('logo', logoFile);
      console.log('Anexando logo:', logoFile);
    } else {
      console.log('Nenhum logo foi selecionado');
      setError('logo', {message: 'Logo é obrigatória'});
    }
    
    // Verificar o que está no FormData
    console.log('Logo no FormData:', formData.get('logo'));
    
    // Adicionar campos como JSON
    formData.append('credentialFields', JSON.stringify(data.credentialFields));
    formData.append('settingFields', JSON.stringify(data.settingFields));
    formData.append('supportedMethods', JSON.stringify(data.supportedMethods));
    formData.append('apiConfig', JSON.stringify(data.apiConfig));
    
    if(isValid && logoFile){
      const result = await adminGatewayTemplateAPIClient.createGateway(formData);

    if(result.success){
      toast.success('Gateway criado com sucesso');
      onClose();
      resetForm();
      console.log(result.data);
    }else{
      toast.error('Erro ao criar gateway');
      console.error(result);
    }
    }
  };
  
  const statusOptions = [
    { value: PaymentGatewayTemplateStatus.ACTIVE, label: 'Ativo' },
    { value: PaymentGatewayTemplateStatus.INACTIVE, label: 'Inativo' },
    { value: PaymentGatewayTemplateStatus.DRAFT, label: 'Rascunho' },
    { value: PaymentGatewayTemplateStatus.PENDING, label: 'Pendente' },
    { value: PaymentGatewayTemplateStatus.DEPRECATED, label: 'Descontinuado' }
  ];
  
  const fieldTypeOptions = [
    { value: FieldType.TEXT, label: 'Texto' },
    { value: FieldType.PASSWORD, label: 'Senha' },
    { value: FieldType.NUMBER, label: 'Número' },
    { value: FieldType.BOOLEAN, label: 'Booleano' },
    { value: FieldType.SELECT, label: 'Seleção' },
    { value: FieldType.EMAIL, label: 'E-mail' }
  ];
  
  const paymentMethodOptions = [
    { value: 'CREDIT_CARD', label: 'Cartão de Crédito' },
    { value: 'DEBIT_CARD', label: 'Cartão de Débito' },
    { value: 'PIX', label: 'PIX' },
    { value: 'BILLET', label: 'Boleto' },
    { value: 'BANK_TRANSFER', label: 'Transferência Bancária' },
    { value: 'CRYPTO', label: 'Criptomoeda' },
    { value: 'PAYPAL', label: 'PayPal' }
  ];

  
  // Adicionar estado para gerenciar o método de pagamento selecionado para edição
  const [editingMethodIndex, setEditingMethodIndex] = useState<number | null>(null);
  const [newMethodType, setNewMethodType] = useState<string>('');

  // Função para obter o ícone de um método de pagamento
  const getMethodIcon = (methodType: string) => {
    switch (methodType.toUpperCase()) {
      case 'CREDIT_CARD':
        return <FaCreditCard />;
      case 'DEBIT_CARD':
        return <FaCreditCard />;
      case 'PIX':
        return <FaQrcode />;
      case 'BILLET':
      case 'BOLETO':
        return <FaFileInvoice />;
      case 'PAYPAL':
        return <FaPaypal />;
      case 'CRYPTO':
      case 'BITCOIN':
        return <FaBitcoin />;
      case 'BANK_TRANSFER':
        return <FaUniversity />;
      default:
        return <FaTag />;
    }
  };

  // Função para obter o nome de exibição padrão de um método
  const getDefaultDisplayName = (methodType: string) => {
    switch (methodType.toUpperCase()) {
      case 'CREDIT_CARD': return 'Cartão de Crédito';
      case 'DEBIT_CARD': return 'Cartão de Débito';
      case 'PIX': return 'PIX';
      case 'BILLET': return 'Boleto';
      case 'BOLETO': return 'Boleto';
      case 'PAYPAL': return 'PayPal';
      case 'CRYPTO': return 'Criptomoeda';
      case 'BITCOIN': return 'Bitcoin';
      case 'BANK_TRANSFER': return 'Transferência Bancária';
      default: return methodType;
    }
  };

  // Função para adicionar um novo método de pagamento
  const handleAddPaymentMethod = () => {
    if (newMethodType) {
      appendMethod({
        method: newMethodType,
        displayName: getDefaultDisplayName(newMethodType),
        enabled: true,
        fees: {
          percentage: 0,
        }
      });
      setNewMethodType('');
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="900px">
      <SectionTitle>
        {isEditing ? 'Editar Gateway de Pagamento' : 'Adicionar Novo Gateway de Pagamento'}
      </SectionTitle>
      
      <FormContainer onSubmit={handleSubmit(processSubmit)}>
        {/* Seção de informações básicas - adicionar campos de cor e isPublic */}
        <FormSection>
          <SectionTitle>
            <FaInfoCircle size={16} />
            Informações Básicas
          </SectionTitle>
          
          <FormRow>
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Nome é obrigatório' }}
              render={({ field }) => (
                <FormInput
                  id="name"
                  label="Nome do Gateway"
                  placeholder="Ex: MercadoPago"
                  icon={<FaTag />}
                  required
                  {...field} 
                  error={errors.name?.message}
                />
              )}
            />
            
            <Controller
              name="templateCode"
              control={control}
              rules={{ required: 'Código é obrigatório' }}
              render={({ field }) => (
                <FormInput
                  id="templateCode"
                  label="Código do Template"
                  placeholder="Ex: MERCADOPAGO_V1"
                  icon={isVerifying ? <LoadingSpinner /> : <FaCode />}
                  error={errors.templateCode?.message}
                  success={successMessage}
                  required
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    verifyIfAlreadyExists(e);
                  }} 
                  onBlur={(e) => {
                    field.onBlur();
                    verifyIfAlreadyExists(e);
                  }}
                />
              )}
            />
          </FormRow>
          
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <FormTextArea
                id="description"
                label="Descrição"
                placeholder="Descreva o gateway de pagamento detalhadamente"
                icon={<FaInfoCircle />}
                rows={5}
                {...field}
              />
            )}
          />
          
          <FormRow>
            <Controller
              name="provider"
              control={control}
              rules={{ required: 'Provedor é obrigatório' }}
              render={({ field }) => (
                <FormInput
                  id="provider"
                  label="Provedor"
                  placeholder="Ex: MercadoPago S.A."
                  icon={<FaBuilding />}
                  error={errors.provider?.message}
                  required
                  {...field}
                />
              )}
            />
            
            <Controller
              name="version"
              control={control}
              render={({ field }) => (
                <FormInput
                  id="version"
                  label="Versão"
                  placeholder="Ex: 1.0.0"
                  icon={<FaCode />}
                  {...field}
                />
              )}
            />
          </FormRow>
          
          <FormRow>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <CustomDropdown
                  id="status"
                  label="Status"
                  options={statusOptions}
                  value={field.value}
                  onChange={field.onChange}
                  icon={<FaListAlt />}
                />
              )}
            />
            
            <Controller
              name="documentation"
              control={control}
              render={({ field }) => (
                <FormInput
                  id="documentation"
                  label="Link da Documentação"
                  placeholder="https://developers.mercadopago.com"
                  error={errors.documentation?.message}
                  icon={<FaLink />}
                  {...field}
                />
              )}
            />
          </FormRow>
          
          <FormField>
            <Label htmlFor="logo">
              <FaImage size={14} />
              Logo
            </Label>
            <input 
              id="logo"
              type="file"
              accept="image/*"
              {...register('logo')}
              onChange={handleLogoChange}
              ref={fileInputRef}
              style={{
                padding: '0.625rem',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontSize: '0.875rem',
                width: '100%',
                backgroundColor: 'white'
              }}
            />
            {errors.logo && (
              <ErrorText>
                <ErrorIcon />
                {errors.logo.message}
              </ErrorText>
            )}
            
            {logoPreview && (
              <ImagePreview>
                <Logo src={logoPreview} alt="Logo preview" />
              </ImagePreview>
            )}
            <HelpText>Recomendado: 150x60px, formato PNG com fundo transparente</HelpText>

          </FormField>

          <FormRow>
            <Controller
              name="color"
              control={control}
              render={({ field }) => (
                <FormColorInput
                  id="color"
                  label="Cor do Gateway"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.color?.message}
                  defaultColor="#6366f1"
                  helpText="Escolha uma cor para identificação visual do gateway"
                />
              )}
            />
            
            <Controller
              name="isPublic"
              control={control}
              render={({ field: { onChange, value } }) => (
                <div style={{ marginTop: '1.75rem' }}>
                  <InputCheckbox
                    id="isPublic"
                    label="Gateway público (visível para todos os usuários)"
                    checked={value}
                    onChange={(e) => onChange(e.target.checked)}
                  />
                </div>
              )}
            />
          </FormRow>
        </FormSection>
        
        {/* Nova Seção: Configuração Técnica */}
        <FormSection>
          <SectionTitle>
            <FaCog size={16} />
            Configuração Técnica da API
          </SectionTitle>
          
          <HelpText>
            Configure os endpoints e parâmetros técnicos necessários para a integração com este gateway.
          </HelpText>
          
          <FormRow>
            <Controller
              name="apiConfig.baseUrl"
              control={control}
              rules={{ required: 'URL Base é obrigatória' }}
              render={({ field }) => (
                <FormInput
                  id="apiConfig.baseUrl"
                  label="URL Base da API"
                  placeholder="https://api.gateway.com/v1"
                  icon={<FaGlobe />}
                  required
                  error={errors.apiConfig?.baseUrl?.message}
                  {...field}
                />
              )}
            />
            
            <Controller
              name="apiConfig.testBaseUrl"
              control={control}
              render={({ field }) => (
                <FormInput
                  id="apiConfig.testBaseUrl"
                  label="URL Base da API de Teste (Sandbox)"
                  placeholder="https://sandbox-api.gateway.com/v1"
                  error={errors.apiConfig?.testBaseUrl?.message}
                  icon={<FaGlobe />}
                  {...field}
                />
              )}
            />
          </FormRow>
          
          <FormRow>
            <Controller
              name="apiConfig.apiVersion"
              control={control}
              render={({ field }) => (
                <FormInput
                  id="apiConfig.apiVersion"
                  label="Versão da API"
                  placeholder="Ex: v1"
                  icon={<FaCode />}
                  error={errors.apiConfig?.apiVersion?.message}
                  {...field}
                />
              )}
            />
          </FormRow>
          
          <FormRow>
            <Controller
              name="apiConfig.timeout"
              control={control}
              render={({ field }) => (
                <FormInput
                  id="apiConfig.timeout"
                  label="Timeout (ms)"
                  type="number"
                  placeholder="30000"
                  icon={<FaClock />}
                  error={errors.apiConfig?.timeout?.message}
                  {...field}
                />
              )}
            />
            
            <Controller
              name="apiConfig.retries"
              control={control}
              render={({ field }) => (
                <FormInput
                  id="apiConfig.retries"
                  label="Número de Tentativas"
                  type="number"
                  placeholder="3"
                  icon={<FaRedo />}
                  error={errors.apiConfig?.retries?.message}
                  {...field}
                />
              )}
            />
          </FormRow>
        </FormSection>
        
        {/* Campos de Credenciais */}
        <FormSection>
          <SectionTitle>
            <FaLock size={16} />
            Campos de Credenciais
          </SectionTitle>
          
          <HelpText>
            Defina os campos necessários para a autenticação com o gateway (chaves de API, tokens, etc).
            Campos marcados como secretos serão criptografados no banco de dados.
          </HelpText>
          
          <FieldList>
            {credentialFields.map((field, index) => (
              <DynamicField key={field.id}>
                <FieldHeader>
                  <FieldTitle>
                    {field.name || `Campo ${index + 1}`}
                  </FieldTitle>
                  <IconButton type="button" onClick={() => removeCredential(index)}>
                    <FaTrash size={12} />
                  </IconButton>
                </FieldHeader>
                
                <FormRow>
                  <Controller 
                    name={`credentialFields.${index}.name`}
                    control={control}
                    rules={{ required: 'Nome é obrigatório' }}
                    render={({ field }) => (
                      <FormInput
                        id={`credentialFields.${index}.name`}
                        label="Nome Técnico"
                        placeholder="Ex: api_key"
                        icon={<FaCode />}
                        error={errors.credentialFields?.[index]?.name?.message}
                        required
                        {...field}
                      />
                    )}
                  />
                  
                  <Controller
                    name={`credentialFields.${index}.label` as const}
                    control={control}
                    rules={{ required: 'Rótulo é obrigatório' }}
                    render={({ field }) => (
                      <FormInput
                        id={`credentialFields.${index}.label`}
                        label="Rótulo de Exibição"
                        placeholder="Ex: Chave de API"
                        icon={<FaTag />}
                        error={errors.credentialFields?.[index]?.label?.message}
                        required
                        {...field}
                      />
                    )}
                  />
                </FormRow>
                
                <FormRow>
                  <Controller
                    name={`credentialFields.${index}.type`}
                    control={control}
                    rules={{ required: 'Rótulo de exibição é obrigatório' }}
                    render={({ field }) => (
                      <CustomDropdown
                        id={`credentialFields.${index}.type`}
                        label="Tipo de Campo"
                        options={fieldTypeOptions}
                        value={field.value}
                        onChange={field.onChange}
                        icon={<FaListAlt />}
                      />
                    )}
                  />
                  
                  <FormField>
                    <Label>Configurações</Label>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '10px' }}>
                      <Controller
                        name={`credentialFields.${index}.required`}
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <InputCheckbox
                            id={`credentialFields.${index}.required`}
                            label="Obrigatório"
                            checked={value}
                            onChange={(e) => onChange(e.target.checked)}
                          />
                        )}
                      />
                      
                      <Controller
                        name={`credentialFields.${index}.isSecret`}
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <InputCheckbox
                            id={`credentialFields.${index}.isSecret`}
                            label={<div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FaLock size={12} /> Campo Secreto</div>}
                            checked={value}
                            onChange={(e) => onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>
                  </FormField>
                </FormRow>
                

                <Controller
                  name={`credentialFields.${index}.placeholder` as const}
                  control={control}
                  rules={{ required: 'Placeholder é obrigatório' }}
                  render={({ field }) => (
                    <FormInput
                      id={`credentialFields.${index}.placeholder`}
                      label="Placeholder"
                      placeholder="Digite aqui o placeholder do campo"
                      icon={<FaInfoCircle />}
                      error={errors.credentialFields?.[index]?.placeholder?.message}
                      {...field}
                    />
                  )}
                />
                
                <Controller
                  name={`credentialFields.${index}.description` as const}
                  control={control}
                  rules={{ required: 'Descrição é obrigatória' }}
                  render={({ field }) => (
                    <FormInput
                      id={`credentialFields.${index}.description`}
                      label="Descrição/Ajuda"
                      placeholder="Ex: Encontre esta chave no dashboard do provedor"
                      icon={<FaInfoCircle />}
                      error={errors.credentialFields?.[index]?.description?.message}
                      {...field}
                    />
                  )}
                />
              </DynamicField>
            ))}
          </FieldList>
          {errors.credentialFields && (
            <ErrorText>
              {
                errors.credentialFields.message ?(
                  <ErrorIcon />
                ):(
                  <></> 
                )
              }
              {errors.credentialFields.message}
            </ErrorText>
          )}
          
          <ButtonGroup>
            <SecondaryButton type="button" onClick={addCredentialField}>
              <FaPlus size={12} /> Adicionar Campo de Credencial
            </SecondaryButton>
          </ButtonGroup>
        </FormSection>
        
        {/* Campos de Configuração */}
        <FormSection>
          <SectionTitle>
            <FaUnlock size={16} />
            Campos de Configuração
          </SectionTitle>
          
          <HelpText>
            Defina campos de configuração adicionais para o gateway (configurações de ambiente, opções, etc).
          </HelpText>
          
          <FieldList>
            {settingFields.map((field, index) => (
              <DynamicField key={field.id}>
                <FieldHeader>
                  <FieldTitle>
                    {field.name || `Campo ${index + 1}`}
                  </FieldTitle>
                  <IconButton type="button" onClick={() => removeSetting(index)}>
                    <FaTrash size={12} />
                  </IconButton>
                </FieldHeader>
                
                <FormRow>
                  <Controller
                    name={`settingFields.${index}.name` as const}
                    control={control}
                    rules={{ required: 'Nome é obrigatório' }}
                    render={({ field }) => (
                      <FormInput
                        id={`settingFields.${index}.name`}
                        label="Nome Técnico"
                        placeholder="Ex: sandbox_mode"
                        error={errors.settingFields?.[index]?.name?.message}
                        icon={<FaCode />}
                        required
                        {...field}
                      />
                    )}
                  />
                  
                  <Controller
                    name={`settingFields.${index}.label` as const}
                    control={control}
                    rules={{ required: 'Rótulo é obrigatório' }}
                    render={({ field }) => (
                      <FormInput
                        id={`settingFields.${index}.label`}
                        label="Rótulo de Exibição"
                        placeholder="Ex: Modo Sandbox"
                        error={errors.settingFields?.[index]?.label?.message}
                        icon={<FaTag />}
                        required
                        {...field}
                      />
                    )}
                  />
                </FormRow>
                
                <FormRow>
                  <Controller
                    name={`settingFields.${index}.type`}
                    control={control}
                    render={({ field }) => (
                      <CustomDropdown
                        id={`settingFields.${index}.type`}
                        label="Tipo de Campo"
                        options={fieldTypeOptions}
                        value={field.value}
                        onChange={field.onChange}
                        icon={<FaListAlt />}
                      />
                    )}
                  />
                  
                  <FormField>
                    <Label>Configurações</Label>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '10px' }}>
                      <Controller
                        name={`settingFields.${index}.required`}
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <InputCheckbox
                            id={`settingFields.${index}.required`}
                            label="Obrigatório"
                            error={errors.settingFields?.[index]?.required?.message}
                            checked={value}
                            onChange={(e) => onChange(e.target.checked)}
                          />
                        )}
                      />
                    </div>
                  </FormField>
                </FormRow>
                
                <Controller
                  name={`settingFields.${index}.description` as const}
                  control={control}
                  render={({ field }) => (
                    <FormInput
                      id={`settingFields.${index}.description`}
                      label="Descrição/Ajuda"
                      placeholder="Ex: Ative para usar o ambiente de testes"
                      icon={<FaInfoCircle />}
                      error={errors.settingFields?.[index]?.description?.message}
                      {...field}
                    />
                  )}
                />
              </DynamicField>
            ))}
          </FieldList>
          
          <ButtonGroup>
            <SecondaryButton type="button" onClick={addSettingField}>
              <FaPlus size={12} /> Adicionar Campo de Configuração
            </SecondaryButton>
          </ButtonGroup>
        </FormSection>
        
        {/* Métodos de Pagamento */}
        <FormSection>
          <SectionTitle>
            <FaQuestionCircle size={16} />
            Métodos de Pagamento Suportados
          </SectionTitle>
          
          <HelpText>
            Selecione os métodos de pagamento que este gateway suporta e defina as taxas aplicáveis.
          </HelpText>
          
          <PaymentMethodContainer>
            <AddMethodContainer>
              <div style={{ width: '100%' }}>
                <CustomDropdown
                  id="newMethod"
                  label="Adicionar método de pagamento"
                  options={paymentMethodOptions.filter(option => 
                    !methodFields.some(method => method.method === option.value)
                  )}
                  value={newMethodType}
                  onChange={(value) => setNewMethodType(value)}
                  icon={<FaPlus />}
                  placeholder="Selecione um método para adicionar"
                />
              </div>
              
              <SecondaryButton 
                type="button" 
                onClick={handleAddPaymentMethod}
                disabled={!newMethodType}
                style={{ marginTop: '1.75rem' }}
              >
                <FaPlus size={12} /> Adicionar
              </SecondaryButton>
            </AddMethodContainer>
            
            <TagsContainer>
              {methodFields.map((method, index) => (
                <MethodTag 
                  key={method.id} 
                  $isActive={method.enabled}
                >
                  <MethodHeader>
                    <MethodTitle>
                      <TagIcon>
                        {getMethodIcon(method.method)}
                      </TagIcon>
                      {method.displayName}
                    </MethodTitle>
                    <MethodActions>
                      <TagActionButton 
                        $danger 
                        type="button" 
                        onClick={() => removeMethod(index)}
                      >
                        <FaTimes />
                      </TagActionButton>
                    </MethodActions>
                  </MethodHeader>

                  {/* Taxa do método de pagamento */}
                  <Controller
                    name={`supportedMethods.${index}.fees.percentage` as const}
                    control={control}
                    rules={{ 
                      min: 0
                    }}
                    render={({ field }) => (
                      <FormInput
                        id={`supportedMethods.${index}.fees.percentage`}
                        label="Taxa (%)"
                        type="number"
                        step="0.01"
                        min="0"
                        icon={<FaPercent />}
                        {...field}
                      />
                    )}
                  />
                  
                  {/* Campo de ativação */}
                  <Controller
                    name={`supportedMethods.${index}.enabled`}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <InputCheckbox
                        id={`supportedMethods.${index}.enabled`}
                        label="Método ativo"
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                      />
                    )}
                  />
                </MethodTag>
              ))}
            </TagsContainer>
          </PaymentMethodContainer>
        </FormSection>
        
        <ModalFooter>
          <SecondaryButton type="button" onClick={onClose}>
            Cancelar
          </SecondaryButton>
          <PrimaryButton type="submit" $disabled={!isValid || !logoFile || isSubmitting}>
            {isSubmitting ? 'Salvando...' : isEditing ? 'Atualizar Gateway' : 'Adicionar Gateway'}
          </PrimaryButton>
        </ModalFooter>
      </FormContainer>
    </Modal>
  );
};

export default GatewayFormModal; 