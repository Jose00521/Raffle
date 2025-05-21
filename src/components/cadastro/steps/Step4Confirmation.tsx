'use client';

import React from 'react';
import { FaUser, FaShieldAlt, FaMapMarked, FaUserPlus } from 'react-icons/fa';
import { useFormContext } from '../../../context/UserFormContext';
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
  TermsCheckboxContainer,
  TermsCheckbox,
  TermsLabel,
  TermsLink
} from '../../../styles/registration.styles';

const Step4Confirmation: React.FC = () => {
  const { form } = useFormContext();
  const watch = form.watch;

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
        <TermsCheckbox 
          type="checkbox" 
          id="termsAgreement" 
          required
        />
        <TermsLabel htmlFor="termsAgreement">
          Li e concordo com os <TermsLink href="/termos-de-uso" target="_blank">Termos de Uso</TermsLink> e <TermsLink href="/politica-de-privacidade" target="_blank">Política de Privacidade</TermsLink>
        </TermsLabel>
      </TermsCheckboxContainer>
    </StepContent>
  );
};

export default Step4Confirmation; 