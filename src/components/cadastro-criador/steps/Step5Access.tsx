'use client';

import React from 'react';
import { FaLock, FaShieldAlt, FaUniversity, FaMoneyBillWave, FaQrcode } from 'react-icons/fa';
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
  TermsLink,
  FormGroup2
} from '../../../styles/registration.styles';
import { usePasswordField } from '@/hooks/usePasswordField';
import debounce from 'lodash/debounce';
import { usePasswordConfirmation } from '@/hooks/usePasswordConfirmation';

const Step5Access: React.FC = () => {
  const { form } = useCreatorFormContext();
  const { 
    formState: { errors },
    register,
    trigger,
    setError,
    clearErrors,
    formState,
    watch
  } = form;

  const watchPassword = watch('senha', '');
  const watchConfirmPassword = watch('confirmarSenha', '');
  const termsAccepted = watch('termsAgreement', false);

  // Função para verificar a força da senha
  const { passwordStrength } = usePasswordField(watchPassword);
  const { passwordsMatch, isValidating  } = usePasswordConfirmation({
    password: watchPassword,
    confirmPassword: watchConfirmPassword,
    setError,
    clearErrors,
    debounceTime: 300 // 300ms é um bom valor para debounce de senha
  });


  const handleBlurPassword = () => {
    debounce(() => {
      trigger(['senha', 'confirmarSenha']);
    }, 100);
  };

  return (
    <StepContent>
      <StepContentHeader>
        <StepContentIcon><FaShieldAlt /></StepContentIcon>
        <StepContentTitle>Acesso e Conta Bancária</StepContentTitle>
      </StepContentHeader>
      
      <div>
        <h4 style={{ 
          margin: '0 0 1rem 0',
          fontSize: '1rem',
          color: '#334155',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <FaLock /> Dados de Acesso
        </h4>
        
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
                fontSize: '0.85rem',
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
          <FormGroup2>
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
          </FormGroup2>
        </FormRow>
      </div>
      
      
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
          Seus dados bancários serão utilizados apenas para processar pagamentos de prêmios e são armazenados 
          com segurança. Após a criação da conta, terá acesso ao painel de controle onde poderá configurar suas rifas, 
          acompanhar vendas e muito mais.
        </p>
      </div>
    </StepContent>
  );
};

export default Step5Access; 