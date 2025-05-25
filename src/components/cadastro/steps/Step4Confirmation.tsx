'use client';

import React from 'react';
import { FaUser, FaShieldAlt, FaMapMarked, FaUserPlus } from 'react-icons/fa';
import { RegisterFormData, useFormContext } from '../../../context/UserFormContext';
import { 
  StepContent, 
  StepContentHeader, 
  StepContentIcon, 
  StepContentTitle,
  ConfirmationSection,
  ConfirmationSectionTitle,
  ConfirmationRow,
  ConfirmationLabel,
  ConfirmationValue,
  TermsCheckboxContainer
} from '../../../styles/registration.styles';

import InputCheckbox from '@/components/common/InputCheckbox';

const Step4Confirmation: React.FC = () => {
  const { form } = useFormContext();
  const { register, formState: { errors }, setValue, getValues, watch } = form;
  
  const termsAgreement = watch('termsAgreement'); 

  const handleTermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('termsAgreement', e.target.checked, { 
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
  };

  return (
    <StepContent>
      <StepContentHeader>
        <StepContentIcon><FaUserPlus /></StepContentIcon>
        <StepContentTitle>Confirme seus Dados</StepContentTitle>
      </StepContentHeader>
      
      <ConfirmationSection>
        <ConfirmationSectionTitle>
          <FaUser />
          Informações Pessoais
        </ConfirmationSectionTitle>
        
        <ConfirmationRow>
          <ConfirmationLabel>Nome Completo:</ConfirmationLabel>
          <ConfirmationValue>{watch('nomeCompleto')}</ConfirmationValue>
        </ConfirmationRow>
        
        {watch('nomeSocial') && (
          <ConfirmationRow>
            <ConfirmationLabel>Nome Social:</ConfirmationLabel>
            <ConfirmationValue>{watch('nomeSocial')}</ConfirmationValue>
          </ConfirmationRow>
        )}
        
        <ConfirmationRow>
          <ConfirmationLabel>CPF:</ConfirmationLabel>
          <ConfirmationValue>{watch('cpf')}</ConfirmationValue>
        </ConfirmationRow>
        
        <ConfirmationRow>
          <ConfirmationLabel>Data de Nascimento:</ConfirmationLabel>
          <ConfirmationValue>
            {watch('dataNascimento') && watch('dataNascimento').toLocaleDateString('pt-BR')}
          </ConfirmationValue>
        </ConfirmationRow>
      </ConfirmationSection>
      
      <ConfirmationSection>
        <ConfirmationSectionTitle>
          <FaShieldAlt />
          Dados de Acesso
        </ConfirmationSectionTitle>
        
        <ConfirmationRow>
          <ConfirmationLabel>E-mail:</ConfirmationLabel>
          <ConfirmationValue>{watch('email')}</ConfirmationValue>
        </ConfirmationRow>
        
        <ConfirmationRow>
          <ConfirmationLabel>Telefone:</ConfirmationLabel>
          <ConfirmationValue>{watch('telefone')}</ConfirmationValue>
        </ConfirmationRow>
      </ConfirmationSection>
      
      <ConfirmationSection>
        <ConfirmationSectionTitle>
          <FaMapMarked />
          Endereço
        </ConfirmationSectionTitle>
        
        <ConfirmationRow>
          <ConfirmationLabel>CEP:</ConfirmationLabel>
          <ConfirmationValue>{watch('cep')}</ConfirmationValue>
        </ConfirmationRow>
        
        <ConfirmationRow>
          <ConfirmationLabel>Endereço Completo:</ConfirmationLabel>
          <ConfirmationValue>
            {watch('logradouro')}, {watch('numero')}
            {watch('complemento') && `, ${watch('complemento')}`}
          </ConfirmationValue>
        </ConfirmationRow>
        
        <ConfirmationRow>
          <ConfirmationLabel>Bairro:</ConfirmationLabel>
          <ConfirmationValue>{watch('bairro')}</ConfirmationValue>
        </ConfirmationRow>
        
        <ConfirmationRow>
          <ConfirmationLabel>Cidade/UF:</ConfirmationLabel>
          <ConfirmationValue>{watch('cidade')}/{watch('uf')}</ConfirmationValue>
        </ConfirmationRow>
        
        {watch('pontoReferencia') && (
          <ConfirmationRow>
            <ConfirmationLabel>Ponto de Referência:</ConfirmationLabel>
            <ConfirmationValue>{watch('pontoReferencia')}</ConfirmationValue>
          </ConfirmationRow>
        )}
      </ConfirmationSection>
      
      <TermsCheckboxContainer>
        <InputCheckbox
          id="termsAgreement"
          label={<>Li e concordo com os <a href="/termos-de-uso" target="_blank" rel="noopener noreferrer">Termos de Uso</a> e <a href="/politica-de-privacidade" target="_blank" rel="noopener noreferrer">Política de Privacidade</a></>}
          checked={!!termsAgreement}
          {...register('termsAgreement')}
          onChange={handleTermsChange}
          required
          error={errors.termsAgreement?.message as string}
        />
      </TermsCheckboxContainer>
    </StepContent>
  );
};

export default Step4Confirmation; 