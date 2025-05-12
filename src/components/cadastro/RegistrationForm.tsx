'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { 
  FaUser, 
  FaIdCard, 
  FaCalendarAlt, 
  FaEnvelope, 
  FaLock, 
  FaLockOpen, 
  FaPhone, 
  FaMapMarkerAlt,
  FaCity,
  FaBuilding,
  FaRoad,
  FaMapPin,
  FaHome,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';

// Estilização dos componentes
const FormContainer = styled.div`
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
`;

const FormHeader = styled.div`
  background: ${({ theme }) => theme.colors.gradients.purple};
  padding: 2rem;
  color: white;
  text-align: center;
  margin-top: 0; /* Garantir que não haja margem no topo */
`;

const FormTitle = styled.h2`
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
`;

const FormSubtitle = styled.p`
  margin: 0.5rem 0 0;
  opacity: 0.8;
`;

const Form = styled.form`
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const FormSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.colors.primary};
  border-bottom: 2px solid ${({ theme }) => theme.colors.gray.medium};
  padding-bottom: 0.5rem;
`;

const FormRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const FormGroup = styled.div<{ $fullWidth?: boolean }>`
  flex: ${({ $fullWidth }) => ($fullWidth ? '1 0 100%' : '1 0 calc(50% - 0.75rem)')};
  position: relative;
  
  @media (max-width: 768px) {
    flex: 1 0 100%;
  }
`;

const InputLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
  transition: color 0.2s ease;
`;

const InputContainer = styled.div`
  position: relative;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.primary};
  opacity: 0.7;
  z-index: 1;
`;

const TogglePasswordButton = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.secondary};
  opacity: 0.8;
  z-index: 1;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    opacity: 1;
  }
  
  &:focus {
    outline: none;
  }
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.75rem;
  margin-top: 0.25rem;
  margin-left: 0.5rem;
  font-weight: 500;
`;

const PasswordStrengthMeter = styled.div`
  height: 4px;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.gray.light};
  margin-top: 0.5rem;
  border-radius: 2px;
  overflow: hidden;
`;

const PasswordStrengthIndicator = styled.div<{ $strength: number }>`
  height: 100%;
  width: ${({ $strength }) => `${$strength * 25}%`};
  background-color: ${({ $strength, theme }) => {
    if ($strength <= 1) return theme.colors.error;
    if ($strength === 2) return theme.colors.warning;
    if ($strength === 3) return theme.colors.info;
    return theme.colors.success;
  }};
  transition: width 0.3s ease, background-color 0.3s ease;
`;

const PasswordStrengthText = styled.p<{ $strength: number }>`
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: ${({ $strength, theme }) => {
    if ($strength <= 1) return theme.colors.error;
    if ($strength === 2) return theme.colors.warning;
    if ($strength === 3) return theme.colors.info;
    return theme.colors.success;
  }};
`;

const StyledInput = styled.input<{ $hasError?: boolean; $isFocused?: boolean }>`
  width: 100%;
  padding: 1rem 1rem 1rem 2.75rem;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background-color: #f5f5f5;
  border: 2px solid transparent;
  box-shadow: ${({ $hasError, $isFocused, theme }) => 
    $hasError 
      ? `0 0 0 1px ${theme.colors.error}` 
      : $isFocused 
        ? `0 0 0 2px ${theme.colors.primary}` 
        : 'none'};
  color: #333;
  
  &:focus {
    outline: none;
    background-color: white;
    border-color: ${({ theme }) => theme.colors.primary};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.light};
    opacity: 0.7;
  }
  
  &:hover:not(:focus) {
    background-color: #f0f0f0;
  }
  
  ${({ $hasError, theme }) => $hasError && `
    border-color: ${theme.colors.error};
  `}
`;

const DatePickerWrapper = styled.div<{ $hasError?: boolean; $isFocused?: boolean }>`
  .react-datepicker-wrapper {
    width: 100%;
  }
  
  .react-datepicker__input-container input {
    width: 100%;
    padding: 1rem 1rem 1rem 2.75rem;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.2s ease;
    background-color: #f5f5f5;
    border: 2px solid transparent;
    box-shadow: ${({ $hasError, $isFocused, theme }) => 
      $hasError 
        ? `0 0 0 1px ${theme.colors.error}` 
        : $isFocused 
          ? `0 0 0 2px ${theme.colors.primary}` 
          : 'none'};
    color: #333;
    cursor: pointer;
    
    &:focus {
      outline: none;
      background-color: white;
      border-color: ${({ theme }) => theme.colors.primary};
    }
    
    &::placeholder {
      color: ${({ theme }) => theme.colors.text.light};
      opacity: 0.7;
    }
    
    &:hover:not(:focus) {
      background-color: #f0f0f0;
    }
  }
  
  .react-datepicker {
    font-family: inherit;
    border-radius: 12px;
    border: none;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    padding: 0.5rem;
    background: white;
    z-index: 10;
  }
  
  .react-datepicker__triangle {
    display: none;
  }
  
  .react-datepicker__header {
    background-color: ${({ theme }) => theme.colors.primary};
    border-bottom: none;
    padding: 1rem 0 0.5rem;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }
  
  .react-datepicker__current-month {
    color: white;
    font-weight: 600;
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }
  
  .react-datepicker__day-name {
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
    width: 2rem;
    margin: 0.2rem;
  }
  
  .react-datepicker__month {
    margin: 0.4rem 0;
    padding: 0.4rem;
  }
  
  .react-datepicker__day {
    width: 2rem;
    height: 2rem;
    line-height: 2rem;
    margin: 0.2rem;
    border-radius: 50%;
    
    &:hover {
      background-color: ${({ theme }) => `${theme.colors.primary}20`};
      color: ${({ theme }) => theme.colors.primary};
    }
  }
  
  .react-datepicker__day--selected,
  .react-datepicker__day--keyboard-selected {
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
    font-weight: 600;
    
    &:hover {
      background-color: ${({ theme }) => theme.colors.primary};
      opacity: 0.9;
    }
  }
  
  .react-datepicker__navigation {
    top: 1.2rem;
  }
  
  .react-datepicker__navigation-icon::before {
    border-color: white;
    border-width: 2px 2px 0 0;
    height: 8px;
    width: 8px;
  }
  
  .react-datepicker__year-dropdown-container,
  .react-datepicker__month-dropdown-container {
    background-color: white;
    border-radius: 8px;
    padding: 0.5rem;
  }
  
  .react-datepicker__year-dropdown,
  .react-datepicker__month-dropdown {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
  
  .react-datepicker__year-option,
  .react-datepicker__month-option {
    padding: 0.5rem;
    
    &:hover {
      background-color: ${({ theme }) => `${theme.colors.primary}20`};
      color: ${({ theme }) => theme.colors.primary};
    }
  }
  
  .react-datepicker__year-option--selected,
  .react-datepicker__month-option--selected {
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
  }
`;

const SubmitButton = styled.button`
  background: ${({ theme }) => theme.colors.gradients.purple};
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  width: 100%;
  margin-top: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: ${({ theme }) => theme.shadows.md};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.2) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    transition: all 0.6s ease;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background: ${({ theme }) => theme.colors.gray.medium};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
    
    &::before {
      display: none;
    }
  }
`;

// Componente de Input Reutilizável
interface CustomInputProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  error?: string;
  type?: string;
  placeholder?: string;
  isPassword?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  maxLength?: number;
  register: any;
  registerOptions?: any;
  fullWidth?: boolean;
}

const CustomInput: React.FC<CustomInputProps> = ({
  id,
  label,
  icon,
  error,
  type = 'text',
  placeholder,
  isPassword = false,
  onChange,
  maxLength,
  register,
  registerOptions,
  fullWidth = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const togglePasswordVisibility = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };
  
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  
  return (
    <FormGroup $fullWidth={fullWidth}>
      <InputLabel htmlFor={id}>{label}</InputLabel>
      <InputContainer>
        <InputIcon>{icon}</InputIcon>
        <StyledInput
          id={id}
          type={inputType}
          placeholder={placeholder}
          maxLength={maxLength}
          $hasError={!!error}
          $isFocused={isFocused}
          {...register(id, {
            ...registerOptions,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
              if (onChange) onChange(e);
              if (registerOptions?.onChange) registerOptions.onChange(e);
            }
          })}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {isPassword && (
          <TogglePasswordButton
            type="button"
            onClick={togglePasswordVisibility}
            tabIndex={-1}
          >
            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
          </TogglePasswordButton>
        )}
      </InputContainer>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </FormGroup>
  );
};

// Schema de validação do formulário
const registerSchema = z.object({
  nomeCompleto: z.string().min(3, 'Nome completo é obrigatório'),
  nomeSocial: z.string().optional(),
  cpf: z.string().min(14, 'CPF inválido'),
  dataNascimento: z.date({
    required_error: "Data de nascimento é obrigatória",
    invalid_type_error: "Data de nascimento inválida",
  }),
  email: z.string().email('Email inválido'),
  senha: z
    .string()
    .min(8, 'A senha deve ter pelo menos 8 caracteres')
    .refine(
      (password) => /[A-Z]/.test(password),
      'A senha deve conter pelo menos uma letra maiúscula'
    )
    .refine(
      (password) => /[a-z]/.test(password),
      'A senha deve conter pelo menos uma letra minúscula'
    )
    .refine(
      (password) => /[0-9]/.test(password),
      'A senha deve conter pelo menos um número'
    )
    .refine(
      (password) => /[^A-Za-z0-9]/.test(password),
      'A senha deve conter pelo menos um caractere especial'
    ),
  confirmarSenha: z.string(),
  telefone: z.string().min(14, 'Telefone inválido'),
  confirmarTelefone: z.string(),
  cep: z.string().min(9, 'CEP inválido'),
  logradouro: z.string().min(1, 'Logradouro é obrigatório'),
  numero: z.string().min(1, 'Número é obrigatório'),
  bairro: z.string().min(1, 'Bairro é obrigatório'),
  complemento: z.string().optional(),
  uf: z.string().min(2, 'UF é obrigatória'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  pontoReferencia: z.string().optional(),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: "As senhas não conferem",
  path: ["confirmarSenha"],
}).refine((data) => data.telefone === data.confirmarTelefone, {
  message: "Os telefones não conferem",
  path: ["confirmarTelefone"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegistrationForm = () => {
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [datePickerFocused, setDatePickerFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null);
  
  const { 
    register, 
    handleSubmit, 
    control,
    formState: { errors }, 
    setValue,
    watch
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nomeCompleto: '',
      nomeSocial: '',
      cpf: '',
      email: '',
      senha: '',
      confirmarSenha: '',
      telefone: '',
      confirmarTelefone: '',
      cep: '',
      logradouro: '',
      numero: '',
      bairro: '',
      complemento: '',
      uf: '',
      cidade: '',
      pontoReferencia: '',
    }
  });
  
  const password = watch('senha');
  const confirmPassword = watch('confirmarSenha');
  
  // Check if passwords match
  useEffect(() => {
    if (confirmPassword) {
      setPasswordsMatch(password === confirmPassword);
    } else {
      setPasswordsMatch(null);
    }
  }, [password, confirmPassword]);
  
  // Calcula força da senha
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
  }, [password]);
  
  // Busca endereço pelo CEP
  const handleCepChange = async (e: { target: { value: string } }) => {
    const cep = e.target.value.replace(/\D/g, '');
    
    if (cep.length === 8) {
      try {
        const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
        
        if (!response.data.erro) {
          setValue('logradouro', response.data.logradouro);
          setValue('bairro', response.data.bairro);
          setValue('cidade', response.data.localidade);
          setValue('uf', response.data.uf);
          
          // Foco no campo número após preenchimento
          document.getElementById('numero')?.focus();
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };
  
  const getPasswordStrengthText = () => {
    switch(passwordStrength) {
      case 0: return 'Digite sua senha';
      case 1: return 'Senha fraca';
      case 2: return 'Senha média';
      case 3: return 'Senha forte';
      case 4: return 'Senha muito forte';
      default: return '';
    }
  };
  
  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    
    try {
      // Simulação de envio para API
      console.log('Dados do formulário:', data);
      
      // Aqui você faria a chamada para sua API
      // const response = await api.post('/register', data);
      
      alert('Cadastro realizado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      alert('Erro ao realizar cadastro. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Opções do react-hook-form para formatação de CPF
  const cpfOptions = {
    onChange: (e: { target: { value: string } }) => {
      const value = e.target.value;
      const cpf = value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
        
      e.target.value = cpf;
    }
  };
  
  // Opções do react-hook-form para formatação de telefone
  const telefoneOptions = {
    onChange: (e: { target: { value: string } }) => {
      const value = e.target.value;
      const telefone = value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
        
      e.target.value = telefone;
    }
  };
  
  // Opções do react-hook-form para formatação de CEP
  const cepOptions = {
    onChange: (e: { target: { value: string } }) => {
      const value = e.target.value;
      const cep = value
        .replace(/\D/g, '')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{3})\d+?$/, '$1');
        
      e.target.value = cep;
      
      if (cep.replace(/\D/g, '').length === 8) {
        handleCepChange({ target: { value: cep } });
      }
    }
  };
  
  return (
    <FormContainer>
      <FormHeader>
        <FormTitle>Crie sua conta</FormTitle>
        <FormSubtitle>Preencha os dados abaixo para se cadastrar</FormSubtitle>
      </FormHeader>
      
      <Form onSubmit={handleSubmit(onSubmit)}>
        {/* Seção de Informações Pessoais */}
        <FormSection>
          <SectionTitle>Informações Pessoais</SectionTitle>
          
          <FormRow>
            <CustomInput
              id="nomeCompleto"
              label="Nome Completo *"
              icon={<FaUser />}
              placeholder="Digite seu nome completo"
              register={register}
              error={errors.nomeCompleto?.message}
            />
            
            <CustomInput
              id="nomeSocial"
              label="Nome Social"
              icon={<FaUser />}
              placeholder="Digite seu nome social (opcional)"
              register={register}
            />
          </FormRow>
          
          <FormRow>
            <CustomInput
              id="cpf"
              label="CPF *"
              icon={<FaIdCard />}
              placeholder="000.000.000-00"
              register={register}
              registerOptions={cpfOptions}
              error={errors.cpf?.message}
            />
            
            <FormGroup>
              <InputLabel htmlFor="dataNascimento">Data de Nascimento *</InputLabel>
              <InputContainer>
                <InputIcon><FaCalendarAlt /></InputIcon>
                <DatePickerWrapper $hasError={!!errors.dataNascimento} $isFocused={datePickerFocused}>
                  <Controller
                    name="dataNascimento"
                    control={control}
                    render={({ field }) => (
                      <ReactDatePicker
                        selected={field.value}
                        onChange={(date: Date | null) => {
                          field.onChange(date);
                          // Close automatically after selection
                          (document.activeElement as HTMLElement)?.blur();
                        }}
                        onFocus={() => setDatePickerFocused(true)}
                        onBlur={() => setDatePickerFocused(false)}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="DD/MM/AAAA"
                        showYearDropdown
                        yearDropdownItemNumber={100}
                        scrollableYearDropdown
                        maxDate={new Date()}
                        calendarClassName="custom-datepicker-calendar"
                        popperClassName="datepicker-popper"
                        shouldCloseOnSelect={true}
                      />
                    )}
                  />
                </DatePickerWrapper>
              </InputContainer>
              {errors.dataNascimento && (
                <ErrorMessage>{errors.dataNascimento.message}</ErrorMessage>
              )}
            </FormGroup>
          </FormRow>
          
          <FormRow>
            <CustomInput
              id="email"
              label="E-mail *"
              icon={<FaEnvelope />}
              type="email"
              placeholder="Digite seu e-mail"
              register={register}
              error={errors.email?.message}
              fullWidth
            />
          </FormRow>
          
          <FormRow>
            <FormGroup>
              <InputLabel htmlFor="senha">Senha *</InputLabel>
              <InputContainer>
                <InputIcon><FaLock /></InputIcon>
                <StyledInput 
                  id="senha"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Digite sua senha"
                  $hasError={!!errors.senha}
                  {...register('senha')}
                />
                <TogglePasswordButton
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </TogglePasswordButton>
              </InputContainer>
              <PasswordStrengthMeter>
                <PasswordStrengthIndicator $strength={passwordStrength} />
              </PasswordStrengthMeter>
              <PasswordStrengthText $strength={passwordStrength}>
                {getPasswordStrengthText()}
              </PasswordStrengthText>
              {errors.senha && (
                <ErrorMessage>{errors.senha.message}</ErrorMessage>
              )}
            </FormGroup>
            
            <FormGroup>
              <InputLabel htmlFor="confirmarSenha">Confirmar Senha *</InputLabel>
              <InputContainer>
                <InputIcon><FaLockOpen /></InputIcon>
                <StyledInput 
                  id="confirmarSenha"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirme sua senha"
                  $hasError={!!errors.confirmarSenha}
                  style={{
                    borderColor: passwordsMatch === null 
                      ? 'transparent' 
                      : passwordsMatch 
                        ? '#28a745' 
                        : '#dc3545',
                    borderWidth: confirmPassword ? '2px' : 'inherit'
                  }}
                  {...register('confirmarSenha')}
                />
                <TogglePasswordButton
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </TogglePasswordButton>
              </InputContainer>
              {passwordsMatch === false && !errors.confirmarSenha && (
                <ErrorMessage>As senhas não conferem</ErrorMessage>
              )}
              {errors.confirmarSenha && (
                <ErrorMessage>{errors.confirmarSenha.message}</ErrorMessage>
              )}
            </FormGroup>
          </FormRow>
          
          <FormRow>
            <CustomInput
              id="telefone"
              label="Telefone *"
              icon={<FaPhone />}
              placeholder="(00) 00000-0000"
              register={register}
              registerOptions={telefoneOptions}
              error={errors.telefone?.message}
            />
            
            <CustomInput
              id="confirmarTelefone"
              label="Confirmar Telefone *"
              icon={<FaPhone />}
              placeholder="(00) 00000-0000"
              register={register}
              registerOptions={telefoneOptions}
              error={errors.confirmarTelefone?.message}
            />
          </FormRow>
        </FormSection>
        
        {/* Seção de Endereço */}
        <FormSection>
          <SectionTitle>Dados de Endereço</SectionTitle>
          
          <FormRow>
            <CustomInput
              id="cep"
              label="CEP *"
              icon={<FaMapPin />}
              placeholder="00000-000"
              register={register}
              registerOptions={cepOptions}
              error={errors.cep?.message}
            />
            
            <CustomInput
              id="uf"
              label="UF *"
              icon={<FaMapMarkerAlt />}
              placeholder="UF"
              maxLength={2}
              register={register}
              error={errors.uf?.message}
            />
          </FormRow>
          
          <FormRow>
            <CustomInput
              id="logradouro"
              label="Endereço *"
              icon={<FaRoad />}
              placeholder="Rua, Avenida, etc."
              register={register}
              error={errors.logradouro?.message}
              fullWidth 
            />
          </FormRow>
          
          <FormRow>
            <CustomInput
              id="numero"
              label="Número *"
              icon={<FaHome />}
              placeholder="Número"
              register={register}
              error={errors.numero?.message}
            />
            
            <CustomInput
              id="complemento"
              label="Complemento"
              icon={<FaBuilding />}
              placeholder="Apartamento, bloco, etc."
              register={register}
            />
          </FormRow>
          
          <FormRow>
            <CustomInput
              id="bairro"
              label="Bairro *"
              icon={<FaCity />}
              placeholder="Bairro"
              register={register}
              error={errors.bairro?.message}
            />
            
            <CustomInput
              id="cidade"
              label="Cidade *"
              icon={<FaCity />}
              placeholder="Cidade"
              register={register}
              error={errors.cidade?.message}
            />
          </FormRow>
          
          <FormRow>
            <CustomInput
              id="pontoReferencia"
              label="Ponto de Referência"
              icon={<FaMapMarkerAlt />}
              placeholder="Ex: Próximo ao supermercado XYZ"
              register={register}
              fullWidth
            />
          </FormRow>
        </FormSection>
        
        <SubmitButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Processando...' : 'Criar Conta'}
        </SubmitButton>
      </Form>
    </FormContainer>
  );
};

export default RegistrationForm; 