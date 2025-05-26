'use client';

import React from 'react';
import { FaUser, FaBuilding } from 'react-icons/fa';
import { useCreatorFormContext } from '../../../context/CreatorFormContext';
import { 
  StepContent, 
  StepContentHeader, 
  StepContentIcon, 
  StepContentTitle,
} from '../../../styles/registration.styles';
import styled from 'styled-components';

// Estilos específicos para o seletor de tipo de conta
const AccountTypeContainer = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const AccountTypeCard = styled.div<{ $selected: boolean }>`
  flex: 1;
  padding: 1.5rem;
  border-radius: 12px;
  background: white;
  border: 2px solid ${props => props.$selected ? '#6a11cb' : '#e2e8f0'};
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${props => props.$selected ? '0 4px 15px rgba(106, 17, 203, 0.1)' : 'none'};
  
  &:hover {
    border-color: ${props => props.$selected ? '#6a11cb' : '#cbd5e1'};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
  
  @media (max-width: 768px) {
    padding: 1.25rem;
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const AccountTypeHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const AccountTypeIcon = styled.div<{ $selected: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${props => props.$selected ? '#6a11cb' : '#f1f5f9'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$selected ? 'white' : '#64748b'};
  transition: all 0.2s ease;
  
  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
  }
`;

const AccountTypeInfo = styled.div`
  flex: 1;
`;

const AccountTypeTitle = styled.h3<{ $selected: boolean }>`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${props => props.$selected ? '#6a11cb' : '#333'};
  margin: 0 0 5px 0;
  transition: color 0.2s ease;
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const AccountTypeDescription = styled.p`
  font-size: 0.9rem;
  color: #64748b;
  line-height: 1.4;
  margin: 0;
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;

const Step1AccountType: React.FC = () => {
  const { accountType, setAccountType } = useCreatorFormContext();

  return (
    <StepContent>
      <StepContentHeader>
        <StepContentIcon><FaBuilding /></StepContentIcon>
        <StepContentTitle>Tipo de Conta</StepContentTitle>
      </StepContentHeader>
      
      <AccountTypeContainer>
        <AccountTypeCard 
          $selected={accountType === 'individual'} 
          onClick={() => setAccountType('individual')}
        >
          <AccountTypeHeader>
            <AccountTypeIcon $selected={accountType === 'individual'}>
              <FaUser />
            </AccountTypeIcon>
            <AccountTypeInfo>
              <AccountTypeTitle $selected={accountType === 'individual'}>
                Pessoa Física
              </AccountTypeTitle>
              <AccountTypeDescription>
                Para pessoas que desejam criar rifas individualmente
              </AccountTypeDescription>
            </AccountTypeInfo>
          </AccountTypeHeader>
        </AccountTypeCard>
        
        <AccountTypeCard 
          $selected={accountType === 'company'} 
          onClick={() => setAccountType('company')}
        >
          <AccountTypeHeader>
            <AccountTypeIcon $selected={accountType === 'company'}>
              <FaBuilding />
            </AccountTypeIcon>
            <AccountTypeInfo>
              <AccountTypeTitle $selected={accountType === 'company'}>
                Pessoa Jurídica
              </AccountTypeTitle>
              <AccountTypeDescription>
                Para empresas e organizações que desejam criar rifas
              </AccountTypeDescription>
            </AccountTypeInfo>
          </AccountTypeHeader>
        </AccountTypeCard>
      </AccountTypeContainer>
    </StepContent>
  );
};

export default Step1AccountType;