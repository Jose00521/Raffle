import { usePasswordField } from '@/hooks/usePasswordField';
import React from 'react'
import { FaCheck, FaShieldAlt, FaTimes } from 'react-icons/fa';
import styled from 'styled-components';

interface PasswordRequirementsCompleteProps {
  password: string;
}

const PasswordStrengthContainer = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const PasswordStrengthTitle = styled.h4`
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PasswordRequirements = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const RequirementItem = styled.div<{ $met: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: ${props => props.$met ? '#059669' : '#6b7280'};
  transition: color 0.2s ease;
`;

const RequirementIcon = styled.div<{ $met: boolean }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${props => props.$met ? '#10b981' : '#d1d5db'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  transition: all 0.2s ease;
`;

const PasswordStrengthBar = styled.div`
  margin-top: 1rem;
`;

const PasswordStrengthBarContainer = styled.div`
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
`;

const PasswordStrengthFill = styled.div<{ $strength: number, $color: string }>`
  height: 100%;
  background: ${props => props.$color};
  width: ${props => (props.$strength / 5) * 100}%;
  transition: all 0.3s ease;
`;

const PasswordStrengthLabel = styled.div<{ $strength: number, $color: string }>`
  font-size: 0.8rem;
  font-weight: 500;
  margin-top: 0.5rem;
  color: ${props => props.$color};
`;

const PasswordRequirementsComplete: React.FC<PasswordRequirementsCompleteProps> = ({ password }) => {

  const { passwordStrength, getPasswordRequirements } = usePasswordField(password);

  return (
    <>
    {/* {password && ( */}
        <PasswordStrengthContainer>
          <PasswordStrengthTitle>
            <FaShieldAlt />
            Força da Senha
          </PasswordStrengthTitle>
          
          <PasswordRequirements>
            {
              Object.entries(getPasswordRequirements(password)).map(([key, value]) => (
                <RequirementItem key={key} $met={value.requirement}>
                  <RequirementIcon $met={value.requirement}>
                    {value.requirement ? <FaCheck /> : <FaTimes />}
                  </RequirementIcon>
                  {value.text}
                </RequirementItem>
              ))
            }
          </PasswordRequirements>
          
          <PasswordStrengthBar>
            <PasswordStrengthBarContainer>
              <PasswordStrengthFill $strength={passwordStrength.strength} $color={passwordStrength.color} />
            </PasswordStrengthBarContainer>
            <PasswordStrengthLabel $strength={passwordStrength.strength} $color={passwordStrength.color}>
              {passwordStrength.text}
            </PasswordStrengthLabel>
          </PasswordStrengthBar>
        </PasswordStrengthContainer>
      {/* )} */}
      </>
  )
}

export default PasswordRequirementsComplete

