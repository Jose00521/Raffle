'use client';

import React from 'react';
import { FaLock, FaShieldAlt } from 'react-icons/fa';
import { useCreatorFormContext } from '../../../context/CreatorFormContext';
import FormInput from '../../common/FormInput';
import InputCheckbox from '../../common/InputCheckbox';
import { 
  StepContent, 
  StepContentHeader, 
  StepContentIcon, 
  StepContentTitle,
  FormRow,
  FormGroup,
  TermsContainer,
  TermsText,
  TermsLink
} from '../../../styles/registration.styles';

const Step4Access: React.FC = () => {
  const { form } = useCreatorFormContext();
  const { 
    formState: { errors },
    register,
    watch
  } = form;

  const watchPassword = watch('senha', '');
  const termsAccepted = watch('termsAgreement', false);

  // Função para verificar a força da senha
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, text: '', color: '#94a3b8' };
    
    let strength = 0;
    
    // Adiciona pontuação com base em critérios
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1;
    
    // Define o texto e cor com base na pontuação
    let text = '';
    let color = '';
    
    switch (strength) {
      case 0:
      case 1:
        text = 'Muito fraca';
        color = '#ef4444';
        break;
      case 2:
        text = 'Fraca';
        color = '#f97316';
        break;
      case 3:
        text = 'Média';
        color = '#eab308';
        break;
      case 4:
        text = 'Boa';
        color = '#22c55e';
        break;
      case 5:
        text = 'Excelente';
        color = '#10b981';
        break;
      default:
        text = '';
        color = '#94a3b8';
    }
    
    return { strength, text, color };
  };

  const passwordStrength = getPasswordStrength(watchPassword);

  return (
    <StepContent>
      <StepContentHeader>
        <StepContentIcon><FaShieldAlt /></StepContentIcon>
        <StepContentTitle>Acesso à Plataforma</StepContentTitle>
      </StepContentHeader>
      
      <FormRow>
        <FormGroup>
          <FormInput
            id="senha"
            label="Senha"
            required
            icon={<FaLock />}
            placeholder="Digite sua senha"
            type="password"
            isPassword
            {...register('senha')}
            error={errors.senha?.message as string}
          />
          {watchPassword && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              marginTop: '5px',
              fontSize: '0.85rem'
            }}>
              <div style={{ 
                display: 'flex', 
                flex: 1, 
                height: '4px', 
                background: '#e2e8f0',
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${(passwordStrength.strength / 5) * 100}%`, 
                  background: passwordStrength.color,
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <span style={{ color: passwordStrength.color, fontWeight: 500 }}>
                {passwordStrength.text}
              </span>
            </div>
          )}
        </FormGroup>
        <FormGroup>
          <FormInput
            id="confirmarSenha"
            label="Confirmar Senha"
            required
            icon={<FaLock />}
            placeholder="Confirme sua senha"
            type="password"
            isPassword
            {...register('confirmarSenha')}
            error={errors.confirmarSenha?.message as string}
          />
        </FormGroup>
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
          {...register('termsAgreement')}
          error={errors.termsAgreement?.message as string}
        />
      </TermsContainer>
      
      <div style={{ 
        marginTop: '2rem', 
        background: '#f8fafc', 
        padding: '1rem', 
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }}>
        <h4 style={{ 
          margin: '0 0 0.5rem 0',
          fontSize: '1rem',
          color: '#334155',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <FaShieldAlt /> Informações Importantes
        </h4>
        <p style={{ 
          margin: 0,
          fontSize: '0.9rem',
          color: '#64748b',
          lineHeight: 1.5
        }}>
          Ao criar sua conta como criador, você poderá cadastrar e gerenciar suas próprias campanhas de rifas. 
          Após a criação da conta, terá acesso ao painel de controle onde poderá configurar suas rifas, acompanhar vendas 
          e muito mais.
        </p>
      </div>
    </StepContent>
  );
};

export default Step4Access; 