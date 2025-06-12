'use client';

import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { ICampaign } from '@/models/interfaces/ICampaignInterfaces';
import CampanhaDetalhes from '@/components/campaign/CampanhaDetalhes';
import { FaCalendarAlt, FaClock, FaGift, FaInfoCircle, FaRegBell, FaChevronUp, FaChevronDown, FaEye, FaEyeSlash, FaTimes, FaAngleUp } from 'react-icons/fa';

// Animações
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(106, 17, 203, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(106, 17, 203, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(106, 17, 203, 0);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

// Adicionar animação de slide para o card
const slideUp = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const slideDown = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(100%);
    opacity: 0;
  }
`;

// Container do banner "Em Breve"
const EmBreveContainer = styled.div`
  position: relative;
  width: 100%;
`;

// Banner elegante "Em Breve" com suporte a toggle
const EmBreveBanner = styled.div<{ $isCollapsed: boolean }>`
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
  background: linear-gradient(135deg, #6a11cb 0%, #8e44ad 100%);
  padding: ${props => props.$isCollapsed ? '0.75rem' : '1rem'};
  color: white;
  text-align: center;
  box-shadow: 0 4px 20px rgba(106, 17, 203, 0.25);
  animation: ${fadeIn} 0.5s ease-out forwards;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  @media (min-width: 768px) {
    padding: ${props => props.$isCollapsed ? '0.75rem 2rem' : '1rem 2rem'};
  }
`;

const EmBreveTitulo = styled.div`
  font-size: 1.2rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    animation: ${pulse} 2s infinite;
  }
  
  @media (min-width: 768px) {
    font-size: 1.5rem;
  }
`;

const EmBreveDescricao = styled.div<{ $isCollapsed: boolean }>`
  font-size: 0.9rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
  height: ${props => props.$isCollapsed ? '0' : 'auto'};
  overflow: hidden;
  transition: all 0.3s ease;
  opacity: ${props => props.$isCollapsed ? '0' : '0.9'};
  
  @media (min-width: 768px) {
    font-size: 1rem;
  }
`;

const EmBreveData = styled.div<{ $isCollapsed: boolean }>`
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50px;
  padding: 0.5rem 1rem;
  margin-top: ${props => props.$isCollapsed ? '0' : '0.75rem'};
  font-weight: 700;
  font-size: 1rem;
  display: ${props => props.$isCollapsed ? 'none' : 'inline-flex'};
  align-items: center;
  gap: 0.5rem;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  svg {
    font-size: 0.9rem;
  }
  
  @media (min-width: 768px) {
    font-size: 1.1rem;
    padding: 0.6rem 1.2rem;
    
    svg {
      font-size: 1rem;
    }
  }
`;

// Toggle button para mostrar/ocultar o banner
const ToggleButton = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.15);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 0.8rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }
  
  @media (min-width: 768px) {
    width: 36px;
    height: 36px;
    font-size: 0.9rem;
  }
`;

// Badge "Em Breve" para adicionar ao título
const EmBreveBadge = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: linear-gradient(135deg, #6a11cb 0%, #8e44ad 100%);
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 700;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  box-shadow: 0 4px 15px rgba(106, 17, 203, 0.3);
  animation: ${shimmer} 2.5s infinite linear;
  background-size: 200% 100%;
  
  svg {
    font-size: 0.7rem;
  }
  
  @media (min-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    
    svg {
      font-size: 0.8rem;
    }
  }
`;

// Estilos para o CSS Injection que desativa o botão original e esconde seções de compra
const CSSInjection = styled.div`
  /* Esconde o botão original de participar */
  #botao-comprar {
    opacity: 0 !important;
    pointer-events: none !important;
  }
  
  /* Esconde as seções de pacotes promocionais e seleção de quantidade */
  .pacotes-promocionais-container,
  .quantidade-selector,
  .compra-container,
  .compra-desktop,
  .valor-total-container,
  .botao-participar,
  .seguranca-info,
  .mensagem-incentivo,
  .pacotes-promocionais-grid,
  .pacotes-promocionais-titulo {
    display: none !important;
  }
  
  /* Estilo global para esconder todas as seções de compra */
  div[class*="Compra"],
  div[class*="compra"],
  div[class*="Pacote"],
  div[class*="pacote"],
  div[class*="Quantidade"],
  div[class*="quantidade"],
  div[class*="Valor"],
  div[class*="valor"] {
    display: none !important;
  }
  
  /* Esconde elementos específicos adicionais */
  [id*="botao-comprar"],
  [class*="BotaoParticipar"],
  [class*="SegurancaInfo"],
  [class*="MensagemIncentivo"] {
    display: none !important;
  }
`;

// Componente de informação detalhada que substitui as seções de compra
const InfoCardContainer = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  bottom: 1rem;
  left: 0;
  right: 0;
  z-index: 999;
  display: flex;
  justify-content: center;
  padding: 0 1rem;
  transition: all 0.3s ease;
  pointer-events: ${props => props.$isVisible ? 'all' : 'none'};
  animation: ${props => props.$isVisible ? slideUp : slideDown} 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  
  @media (min-width: 768px) {
    bottom: 2rem;
  }
`;

const InfoCard = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  padding-bottom: 5rem; /* Espaço adicional para não sobrepor o botão */
  max-width: 500px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border: 1px solid rgba(106, 17, 203, 0.1);
  position: relative;
  
  @media (max-width: 768px) {
    padding-bottom: 4.5rem; /* Ajuste para mobile */
  }
`;

// Botão flutuante para mostrar/ocultar o card de informações
const FloatingToggle = styled.button<{ $isCardVisible: boolean }>`
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6a11cb 0%, #8e44ad 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(106, 17, 203, 0.3);
  z-index: 1000;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  font-size: 1.4rem;
  
  &:hover {
    transform: scale(1.05) translateY(-5px);
    box-shadow: 0 8px 25px rgba(106, 17, 203, 0.4);
  }
  
  @media (max-width: 768px) {
    bottom: 1rem;
    right: 1rem;
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }
`;

// Indicador de arraste para o card
const DragIndicator = styled.div`
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 4px;
  background-color: rgba(106, 17, 203, 0.2);
  border-radius: 10px;
`;

// Título do card com novo estilo
const InfoCardTitle = styled.div`
  font-weight: 700;
  font-size: 1.2rem;
  color: #4f378b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  
  svg {
    color: #6a11cb;
  }
`;

const InfoCardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem;
  background: #f8f7ff;
  border-radius: 8px;
  
  svg {
    color: #6a11cb;
    font-size: 1.2rem;
    flex-shrink: 0;
  }
`;

const InfoText = styled.div`
  font-size: 0.95rem;
  color: #4a4a4a;
  line-height: 1.4;
`;

const NotifyButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #6a11cb 0%, #8e44ad 100%);
  color: white;
  font-weight: 700;
  padding: 1rem;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(106, 17, 203, 0.2);
  }
  
  svg {
    animation: ${pulse} 2s infinite;
  }
`;

interface CampanhaEmBreveProps {
  campaign: ICampaign;
}

const CampanhaEmBreve: React.FC<CampanhaEmBreveProps> = ({ campaign }) => {
  // Estado para controlar se o banner está colapsado ou não
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Estado para controlar se o card de informações está visível
  const [isCardVisible, setIsCardVisible] = useState(true);
  
  // Formatar a data de ativação
  const dataAtivacao = campaign.scheduledActivationDate 
    ? new Date(campaign.scheduledActivationDate).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Em breve';
    
  // Formatar a data do sorteio
  const dataSorteio = new Date(campaign.drawDate).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  // Calcular número de prêmios
  const numeroPremios = campaign.prizes?.length || 0;

  // Toggle para mostrar/ocultar o banner
  const toggleBanner = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  // Toggle para mostrar/ocultar o card de informações
  const toggleInfoCard = () => {
    setIsCardVisible(!isCardVisible);
  };

  return (
    <EmBreveContainer>
      {/* CSS para desativar o botão original */}
      <CSSInjection />
      
      {/* Banner "Em Breve" no topo com toggle */}
      <EmBreveBanner $isCollapsed={isCollapsed}>
        <EmBreveTitulo>
          <FaClock /> {isCollapsed ? 'Em Breve' : 'Campanha Em Breve'}
        </EmBreveTitulo>
        <EmBreveDescricao $isCollapsed={isCollapsed}>
          Esta campanha foi agendada pelo criador e ainda não está disponível para participação.
        </EmBreveDescricao>
        <EmBreveData $isCollapsed={isCollapsed}>
          <FaCalendarAlt /> Disponível a partir de: {dataAtivacao}
        </EmBreveData>
        
        {/* Botão de toggle */}
        <ToggleButton onClick={toggleBanner} aria-label={isCollapsed ? "Mostrar detalhes" : "Ocultar detalhes"}>
          {isCollapsed ? <FaEye /> : <FaEyeSlash />}
        </ToggleButton>
      </EmBreveBanner>
      
      {/* Badge "Em Breve" */}
      <EmBreveBadge>
        <FaClock /> Em Breve
      </EmBreveBadge>
      
      {/* Componente original da campanha */}
      <CampanhaDetalhes campanhaDetalhes={campaign} />
      
      {/* Card de informações que substitui as seções de compra */}
      <InfoCardContainer $isVisible={isCardVisible}>
        <InfoCard>
          <DragIndicator />
          <InfoCardTitle>
            <FaInfoCircle /> Informações da Campanha
          </InfoCardTitle>
          <InfoCardContent>
            <InfoItem>
              <FaCalendarAlt />
              <InfoText>
                <strong>Início da Campanha:</strong> {dataAtivacao}
              </InfoText>
            </InfoItem>
            <InfoItem>
              <FaCalendarAlt />
              <InfoText>
                <strong>Data do Sorteio:</strong> {dataSorteio}
              </InfoText>
            </InfoItem>
            <InfoItem>
              <FaGift />
              <InfoText>
                <strong>Prêmios:</strong> {numeroPremios} {numeroPremios === 1 ? 'prêmio incrível' : 'prêmios incríveis'}
              </InfoText>
            </InfoItem>
          </InfoCardContent>
          <NotifyButton>
            <FaRegBell /> Receber Notificação Quando Iniciar
          </NotifyButton>
        </InfoCard>
      </InfoCardContainer>
      
      {/* Botão flutuante para mostrar/ocultar o card de informações */}
      <FloatingToggle 
        onClick={toggleInfoCard} 
        $isCardVisible={isCardVisible}
        aria-label={isCardVisible ? "Fechar informações" : "Ver informações da campanha"}
        style={{ 
          position: 'fixed',
          zIndex: 1001,
          bottom: isCardVisible ? '4rem' : '1.5rem',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {isCardVisible ? <FaTimes /> : <FaInfoCircle />}
      </FloatingToggle>
    </EmBreveContainer>
  );
};

export default CampanhaEmBreve; 