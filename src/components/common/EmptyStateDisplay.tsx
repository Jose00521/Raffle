'use client';

import React from 'react';
import styled from 'styled-components';
import { FaInbox, FaSearch, FaFilter, FaPlus, FaChartLine, FaMoneyBillWave, FaTicketAlt, FaUsers } from 'react-icons/fa';

interface EmptyStateDisplayProps {
  type?: 'payments' | 'campaigns' | 'sales' | 'general';
  title?: string;
  description?: string;
  actionText?: string;
  onActionClick?: () => void;
  hasFilters?: boolean;
  onClearFilters?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 2px dashed #e2e8f0;
  text-align: center;
  min-height: 320px;
  position: relative;
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 40px 24px;
    min-height: 280px;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(106, 17, 203, 0.02) 0%, transparent 70%);
    pointer-events: none;
  }
`;

const IconContainer = styled.div`
  position: relative;
  margin-bottom: 24px;
  z-index: 1;
  
  .main-icon {
    font-size: 64px;
    color: #94a3b8;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
    
    @media (max-width: 768px) {
      font-size: 48px;
    }
  }
  
  .decorative-icons {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0.1;
    
    .icon-1 {
      position: absolute;
      top: -30px;
      left: -60px;
      font-size: 20px;
      color: #6a11cb;
      animation: float 3s ease-in-out infinite;
    }
    
    .icon-2 {
      position: absolute;
      top: -20px;
      right: -50px;
      font-size: 16px;
      color: #2575fc;
      animation: float 3s ease-in-out infinite 1s;
    }
    
    .icon-3 {
      position: absolute;
      bottom: -40px;
      left: -40px;
      font-size: 18px;
      color: #10b981;
      animation: float 3s ease-in-out infinite 2s;
    }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
`;

const Title = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #334155;
  margin: 0 0 12px 0;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const Description = styled.p`
  font-size: 1rem;
  color: #64748b;
  margin: 0 0 32px 0;
  line-height: 1.6;
  max-width: 480px;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    margin-bottom: 24px;
  }
`;

const ActionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  position: relative;
  z-index: 1;
  
  @media (min-width: 480px) {
    flex-direction: row;
    gap: 16px;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(106, 17, 203, 0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(106, 17, 203, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    padding: 10px 20px;
  }
`;

const SecondaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: white;
  color: #6a11cb;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #6a11cb;
    background: #f8fafc;
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    padding: 10px 20px;
  }
`;

const Suggestion = styled.div`
  margin-top: 24px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  position: relative;
  z-index: 1;
  
  .suggestion-text {
    font-size: 0.85rem;
    color: #64748b;
    margin: 0;
    line-height: 1.5;
  }
  
  .suggestion-items {
    list-style: none;
    padding: 0;
    margin: 8px 0 0 0;
    
    li {
      font-size: 0.8rem;
      color: #94a3b8;
      margin: 4px 0;
      
      &::before {
        content: '•';
        color: #6a11cb;
        margin-right: 8px;
      }
    }
  }
`;

const getEmptyStateConfig = (type: string) => {
  switch (type) {
    case 'payments':
      return {
        icon: <FaMoneyBillWave className="main-icon" />,
        title: 'Nenhum pagamento encontrado',
        description: 'Ainda não há pagamentos registrados para exibir. Quando seus clientes começarem a comprar números das suas rifas, os pagamentos aparecerão aqui.',
        actionText: 'Criar Nova Rifa',
        decorativeIcons: [
          <FaChartLine className="icon-1" key="1" />,
          <FaSearch className="icon-2" key="2" />,
          <FaPlus className="icon-3" key="3" />
        ],
        suggestions: [
          'Promova suas rifas nas redes sociais',
          'Ofereça prêmios atrativos',
          'Configure métodos de pagamento variados'
        ]
      };
    case 'campaigns':
      return {
        icon: <FaTicketAlt className="main-icon" />,
        title: 'Nenhuma campanha encontrada',
        description: 'Você ainda não criou nenhuma campanha. Crie sua primeira rifa e comece a vender números para seus participantes.',
        actionText: 'Criar Primeira Rifa',
        decorativeIcons: [
          <FaPlus className="icon-1" key="1" />,
          <FaChartLine className="icon-2" key="2" />,
          <FaMoneyBillWave className="icon-3" key="3" />
        ]
      };
    case 'sales':
      return {
        icon: <FaChartLine className="main-icon" />,
        title: 'Nenhuma venda registrada',
        description: 'Ainda não há vendas para exibir. Compartilhe suas rifas e atraia mais participantes para começar a ver resultados aqui.',
        actionText: 'Ver Minhas Rifas',
        decorativeIcons: [
          <FaMoneyBillWave className="icon-1" key="1" />,
          <FaUsers className="icon-2" key="2" />,
          <FaTicketAlt className="icon-3" key="3" />
        ]
      };
    default:
      return {
        icon: <FaInbox className="main-icon" />,
        title: 'Nenhum dado encontrado',
        description: 'Não há informações para exibir no momento. Tente ajustar os filtros ou aguarde novos dados serem carregados.',
        actionText: 'Atualizar',
        decorativeIcons: [
          <FaSearch className="icon-1" key="1" />,
          <FaFilter className="icon-2" key="2" />,
          <FaPlus className="icon-3" key="3" />
        ]
      };
  }
};

const EmptyStateDisplay: React.FC<EmptyStateDisplayProps> = ({
  type = 'general',
  title,
  description,
  actionText,
  onActionClick,
  hasFilters = false,
  onClearFilters,
  icon,
  className
}) => {
  const config = getEmptyStateConfig(type);
  
  const finalTitle = title || config.title;
  const finalDescription = description || config.description;
  const finalActionText = actionText || config.actionText;
  const finalIcon = icon || config.icon;

  return (
    <Container className={className}>
      <IconContainer>
        {finalIcon}
        <div className="decorative-icons">
          {config.decorativeIcons}
        </div>
      </IconContainer>
      
      <Title>{finalTitle}</Title>
      <Description>{finalDescription}</Description>
      
      <ActionsContainer>
        {onActionClick && (
          <ActionButton onClick={onActionClick}>
            <FaPlus size={14} />
            {finalActionText}
          </ActionButton>
        )}
        
        {hasFilters && onClearFilters && (
          <SecondaryButton onClick={onClearFilters}>
            <FaFilter size={14} />
            Limpar Filtros
          </SecondaryButton>
        )}
      </ActionsContainer>
      
      {config.suggestions && (
        <Suggestion>
          <p className="suggestion-text">
            <strong>Dicas para aumentar suas vendas:</strong>
          </p>
          <ul className="suggestion-items">
            {config.suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </Suggestion>
      )}
    </Container>
  );
};

export default EmptyStateDisplay; 