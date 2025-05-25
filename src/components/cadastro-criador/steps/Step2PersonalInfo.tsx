'use client';

import React from 'react';
import { Controller } from 'react-hook-form';
import { FaUser, FaIdCard, FaCalendarAlt, FaEnvelope, FaPhone, FaBuilding } from 'react-icons/fa';
import { useCreatorFormContext } from '../../../context/CreatorFormContext';
import FormInput from '../../common/FormInput';
import FormDatePicker from '../../common/FormDatePicker';
import { 
  StepContent, 
  StepContentHeader, 
  StepContentIcon, 
  StepContentTitle,
  FormRow,
  FormGroup,
  StyledFormDatePickerWrapper
} from '../../../styles/registration.styles';
import { useHookFormMask } from 'use-mask-input';

const Step2PersonalInfo: React.FC = () => {
  const { form, accountType } = useCreatorFormContext();
  const { 
    control, 
    formState: { errors },
    trigger,
    register,
  } = form;

  const registerWithMask = useHookFormMask(register);

  return (
    <StepContent>
      <StepContentHeader>
        <StepContentIcon><FaUser /></StepContentIcon>
        <StepContentTitle>Dados Pessoais</StepContentTitle>
      </StepContentHeader>
      
      {accountType === 'pf' ?
        (<FormRow>
          <FormInput
            id="nome"
            label="Nome Completo"
            required
            icon={<FaUser />}
            placeholder="Digite seu nome completo"
          {...register('nome')}
          error={errors.nome?.message as string}
          fullWidth
        />
      </FormRow>) :
      (         
         <FormInput
          id="representanteLegal"
          label="Representante Legal"
          required
          icon={<FaUser />}
          placeholder="Digite seu nome completo"
          {...register('representanteLegal')}
          error={errors.representanteLegal?.message as string}
          fullWidth
 />)
      }
      
      <FormRow>
        <FormGroup>
          <FormInput
            id="email"
            label="Email"
            required
            icon={<FaEnvelope />}
            placeholder="Digite seu email"
            type="email"
            {...register('email')}
            error={errors.email?.message as string}
          />
        </FormGroup>
        <FormGroup>
          <FormInput
            id="telefone"
            label="Telefone"
            required
            icon={<FaPhone />}
            placeholder="(00) 00000-0000"
            {...registerWithMask('telefone', '(99) 99999-9999')}
            error={errors.telefone?.message as string}
          />
        </FormGroup>
      </FormRow>
      
      <FormRow>
        <FormGroup>
          <Controller
            name="dataNascimento"
            control={control}
            render={({ field }) => (
              <StyledFormDatePickerWrapper>
                <FormDatePicker
                  id="dataNascimento"
                  label="Data de Nascimento"
                  selected={field.value}
                  icon={<FaCalendarAlt />}
                  placeholder="DD/MM/AAAA"
                  required
                  showYearDropdown
                  showMonthDropdown
                  maxDate={new Date()}
                  {...register('dataNascimento')}
                  error={errors.dataNascimento?.message as string}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  triggerValidation={() => trigger('dataNascimento')}
                />
              </StyledFormDatePickerWrapper>
            )}
          />
        </FormGroup>
        
        {accountType === 'pf' ? (
          <FormGroup>
            <FormInput
              id="cpf"
              label="CPF"
              required
              icon={<FaIdCard />}
              placeholder="000.000.000-00"
              {...registerWithMask('cpf', 'cpf')}
              error={errors.cpf?.message as string}
            />
          </FormGroup>
        ) : null}
      </FormRow>
      
      {accountType === 'pj' && (
        <>
          <FormRow>
            <FormInput
              id="nomeEmpresa"
              label="Nome da Empresa"
              required
              icon={<FaBuilding />}
              placeholder="Digite o nome da sua empresa"
              {...register('nomeEmpresa')}
              error={errors.nomeEmpresa?.message as string}
              fullWidth
            />
          </FormRow>
          
          <FormRow>
            <FormInput
              id="cnpj"
              label="CNPJ"
              required
              icon={<FaIdCard />}
              placeholder="00.000.000/0000-00"
              {...registerWithMask('cnpj', 'cnpj')}
              error={errors.cnpj?.message as string}
              fullWidth
            />
          </FormRow>
        </>
      )}
    </StepContent>
  );
};

export default Step2PersonalInfo; 