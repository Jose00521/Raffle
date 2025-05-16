'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styled from 'styled-components';
import { FaArrowLeft, FaRandom, FaTicketAlt, FaUsers, FaTrophy, FaSpinner, FaCheck, FaVolumeUp, FaVolumeMute, FaShieldAlt, FaLock, FaCheckCircle, FaAward } from 'react-icons/fa';
import Link from 'next/link';
import CreatorDashboard from '@/components/dashboard/CreatorDashboard';
import InputWithIcon from '@/components/common/InputWithIcon';
import SlotMachineDrawer from '@/components/raffle/SlotMachineDrawer';
import WinnerDetailCard, { WinnerInfo } from '@/components/raffle/WinnerDetailCard';

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  }
`;

const PageTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 30px;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  margin: 0 0 24px;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const FormRow = styled.div`
  display: flex;
  gap: 24px;
  align-items: flex-start;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const FormGroup = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DrawMethodsContainer = styled.div`
  display: flex;
  gap: 16px;
  margin: 16px 0 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const DrawMethodCard = styled.button<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: ${props => props.$active ? 'linear-gradient(135deg, rgba(106, 17, 203, 0.05) 0%, rgba(37, 117, 252, 0.05) 100%)' : 'white'};
  border: 1px solid ${props => props.$active ? 'rgba(106, 17, 203, 0.3)' : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 12px;
  cursor: pointer;
  flex: 1;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  }
  
  .icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${props => props.$active ? 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)' : '#f5f7fa'};
    color: ${props => props.$active ? 'white' : '#666'};
    border-radius: 50%;
    font-size: 1.5rem;
  }
  
  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
    color: ${props => props.$active ? '#6a11cb' : ({ theme }) => theme.colors?.text?.primary || '#333'};
  }
  
  p {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
    margin: 0;
    text-align: center;
  }
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 24px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  
  ${props => props.$primary 
    ? `
      background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
      color: white;
      border: none;
      
      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 20px rgba(106, 17, 203, 0.4);
      }
    `
    : `
      background: white;
      color: #666;
      border: 1px solid rgba(0, 0, 0, 0.1);
      
      &:hover {
        background: #f5f7fa;
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
      }
    `
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }
  
  @media (max-width: 480px) {
    padding: 14px 20px;
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 8px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    
    button {
      width: 100%;
    }
  }
`;

const PendingWinnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: linear-gradient(to right, rgba(106, 17, 203, 0.05), rgba(37, 117, 252, 0.05));
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(106, 17, 203, 0.1);
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const PendingWinnerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const WinnerAvatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
  color: white;
  font-size: 1.8rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 16px rgba(245, 158, 11, 0.3);
  
  @media (max-width: 480px) {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }
`;

const WinnerName = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: #111827;
  margin-bottom: 6px;
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const WinnerDetails = styled.div`
  display: flex;
  gap: 8px;
`;

const WinnerDetailBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: white;
  border-radius: 20px;
  font-size: 0.85rem;
  color: #666;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  
  strong {
    font-weight: 600;
    color: #333;
  }
`;

const PendingWinnerActions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ActionButtonPrimary = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(106, 17, 203, 0.3);
  }
`;

const ActionButtonSecondary = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: white;
  color: #4b5563;
  font-weight: 600;
  font-size: 0.9rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #f9fafb;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

const SoundToggleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.disabled ? '#f0f0f0' : 'white'};
  border: 1px solid rgba(0, 0, 0, 0.1);
  font-size: 1rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
  opacity: ${props => props.disabled ? 0.7 : 1};
  
  &:hover {
    background-color: ${props => props.disabled ? '#f0f0f0' : 'rgba(0, 0, 0, 0.05)'};
  }
  
  svg {
    margin-right: 8px;
  }
`;

const TrustDrawBadge = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 14px 20px;
  border-radius: 8px;
  margin-top: 16px;

  border: 1px solid rgba(16, 185, 129, 0.3);
  background: rgba(16, 185, 129, 0.05);
  position: relative;
  bottom: 0;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, #10b981, #059669);
  }
`;

const TrustDrawTitle = styled.div`
  display: flex;
  align-items: center;
  color: #059669;
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 6px;
  letter-spacing: 0.3px;
  
  svg {
    margin-right: 8px;
    font-size: 1.2rem;
  }
`;

const TrustDrawDescription = styled.div`
  font-size: 0.8rem;
  color: #4b5563;
  line-height: 1.5;
  text-align: center;
  max-width: 600px;

  strong {
    color: #059669;
  }
`;

const TrustDrawSeals = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 12px;
`;

const TrustSeal = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: #4b5563;
  gap: 4px;
  background: rgba(255, 255, 255, 0.7);
  padding: 4px 8px;
  border-radius: 12px;
  border: 1px solid rgba(16, 185, 129, 0.2);
  
  svg {
    color: #059669;
  }
`;

const TrustDrawLink = styled.a`
  font-size: 0.7rem;
  color: #059669;
  margin-top: 10px;
  text-decoration: underline;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 1;
  }
`;

// Dados de exemplo com diferentes quantidades de números
const mockCampaign = {
  id: '1',
  title: 'iPhone 15 Pro Max - 256GB',
  status: 'ativa',
  totalNumbers: 100000, // Isso gerará 4 dígitos (0-999)
  price: 25,
  initialDate: new Date(2023, 6, 15),
  drawDate: new Date(2023, 9, 20)
};

// Outros tamanhos de rifas para testar
const rifaSizes = {
  small: 99,       // 2 dígitos (00-99)
  medium: 999,     // 3 dígitos (000-999)
  large: 9999,     // 4 dígitos (0000-9999)
  xlarge: 99999    // 5 dígitos (00000-99999)
};

// Usado apenas para testes visuais - pode ser removido em produção
const changeCampaignSize = (size: 'small' | 'medium' | 'large' | 'xlarge') => {
  const newCampaign = { ...mockCampaign };
  newCampaign.totalNumbers = rifaSizes[size] || mockCampaign.totalNumbers;
  return newCampaign;
};

export default function SortearPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [campaign, setCampaign] = useState<any>({});
  const [drawMethod, setDrawMethod] = useState<'automatic' | 'manual'>('automatic');
  const [manualNumber, setManualNumber] = useState('');
  const [showAnimation, setShowAnimation] = useState(false);
  const [isPerformingDraw, setIsPerformingDraw] = useState(false);
  const [pendingWinner, setPendingWinner] = useState<WinnerInfo | null>(null);
  const [digitCount, setDigitCount] = useState(3);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  
  // Calcula o número de dígitos necessários com base no total de números da rifa
  const calculateDigitCount = (totalNumbers: number) => {
    // Números de 1-9 precisam de 1 dígito, 1-99 precisam de 2 dígitos etc.
    return Math.max(2, Math.ceil(Math.log10(Math.max(1, totalNumbers))));
  };
  
  useEffect(() => {
    // Simular carregamento dos dados
    const timer = setTimeout(() => {
      setCampaign(mockCampaign);
      
      // Define o número de dígitos baseado no total de números da campanha
      const digits = calculateDigitCount(mockCampaign.totalNumbers);
      setDigitCount(digits);
      
      // Só depois marca o carregamento como concluído
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [id]);
  
  const handleStartDraw = () => {
    setIsPerformingDraw(true);
    setShowAnimation(true);
    setShowWinnerModal(false);
  };
  
  const handleCloseDrawer = () => {
    setShowAnimation(false);
    setIsPerformingDraw(false);
  };
  
  const handleConfirmWinner = (winner: WinnerInfo) => {
    // Aqui você adicionaria a lógica para salvar o ganhador no banco de dados
    
    // Limpar estados
    setShowAnimation(false);
    setShowWinnerModal(false);
    setIsPerformingDraw(false);
    setPendingWinner(null);
    
    // Opcional: redirecionar para outra página ou mostrar notificação
    // router.push(`/dashboard/criador/campanha/${id}`);
  };
  
  const handleRejectWinner = () => {
    // Limpar estados
    setShowAnimation(false);
    setShowWinnerModal(false);
    setIsPerformingDraw(false);
    setPendingWinner(null);
  };
  
  const handleWinnerFound = (winner: WinnerInfo) => {
    // Só guardar o ganhador como pendente se ainda não existir um
    if (!pendingWinner) {
      setPendingWinner(winner);
      // Automaticamente mostrar o modal quando a animação terminar e o ganhador for encontrado
      setShowWinnerModal(true);
    }
  };
  
  const handleShowDetails = () => {
    setShowWinnerModal(true);
  };
  
  const handleCloseModal = () => {
    setShowWinnerModal(false);
  };
  
  if (isLoading) {
    return (
      <CreatorDashboard>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <FaSpinner size={40} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      </CreatorDashboard>
    );
  }
  
  return (
    <CreatorDashboard>
      <PageWrapper>
        <PageHeader>
          <Link href={`/dashboard/criador/campanha/${id}`} passHref>
            <BackButton>
              <FaArrowLeft />
            </BackButton>
          </Link>
          <PageTitle>
            <FaTrophy style={{ color: '#f59e0b' }} />
            Realizar Sorteio: {campaign.title}
          </PageTitle>
        </PageHeader>
        
        <Card>
          <SectionTitle>
            <FaRandom /> Escolha o método de sorteio
          </SectionTitle>
          
          <DrawMethodsContainer>
            <DrawMethodCard 
              $active={drawMethod === 'automatic'} 
              onClick={() => setDrawMethod('automatic')}
            >
              <div className="icon">
                <FaRandom />
              </div>
              <h3>Sorteio Automático</h3>
              <p>O sistema sorteará um número aleatório entre os números vendidos</p>
            </DrawMethodCard>
            
            <DrawMethodCard 
              $active={drawMethod === 'manual'} 
              onClick={() => setDrawMethod('manual')}
            >
              <div className="icon">
                <FaTicketAlt />
              </div>
              <h3>Sorteio Manual</h3>
              <p>Informe manualmente o número sorteado (ex: sorteio da loteria federal)</p>
            </DrawMethodCard>
          </DrawMethodsContainer>
          
          {drawMethod === 'manual' && (
            <FormContainer>
              <FormRow>
                <FormGroup>
                  <InputWithIcon
                    id="manualNumber"
                    name="manualNumber"
                    label="Número sorteado"
                    icon={<FaTicketAlt />}
                    placeholder="Digite o número sorteado"
                    value={manualNumber}
                    onChange={(e) => setManualNumber(e.target.value)}
                    disabled={isPerformingDraw}
                  />
                </FormGroup>
              </FormRow>
            </FormContainer>
          )}
          
          <ButtonsContainer>
            <ActionButton 
              onClick={() => router.back()}
              disabled={isPerformingDraw || pendingWinner !== null}
            >
              Cancelar
            </ActionButton>
            
            <ActionButton 
              $primary 
              onClick={handleStartDraw}
              disabled={
                (drawMethod === 'manual' && !manualNumber) || 
                isPerformingDraw || 
                pendingWinner !== null
              }
            >
              {isPerformingDraw ? (
                <>
                  <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                  Processando...
                </>
              ) : (
                <>
                  <FaRandom />
                  {drawMethod === 'automatic' ? 'Iniciar Sorteio Automático' : 'Verificar Ganhador'}
                </>
              )}
            </ActionButton>
          </ButtonsContainer>
        </Card>
        
        {pendingWinner && !showAnimation && (
          <Card>
            <SectionTitle>
              <FaTrophy style={{ color: '#f59e0b' }} /> Ganhador Pendente de Confirmação
            </SectionTitle>
            
            <PendingWinnerContainer>
              <PendingWinnerInfo>
                <WinnerAvatar>
                  {pendingWinner.name.charAt(0).toUpperCase()}
                </WinnerAvatar>
                
                <div>
                  <WinnerName>{pendingWinner.name}</WinnerName>
                  <WinnerDetails>
                    <WinnerDetailBadge>
                      <FaTicketAlt size={12} /> Número: <strong>{pendingWinner.winningNumber}</strong>
                    </WinnerDetailBadge>
                    <WinnerDetailBadge>
                      <FaUsers size={12} /> {pendingWinner.phone}
                    </WinnerDetailBadge>
                  </WinnerDetails>
                </div>
              </PendingWinnerInfo>
              
              <PendingWinnerActions>
                <ActionButtonSecondary onClick={handleRejectWinner}>
                  Rejeitar
                </ActionButtonSecondary>
                
                <ActionButtonSecondary onClick={handleShowDetails}>
                  Detalhes
                </ActionButtonSecondary>
                
                <ActionButtonPrimary onClick={() => handleConfirmWinner(pendingWinner)}>
                  <FaCheck /> Confirmar
                </ActionButtonPrimary>
              </PendingWinnerActions>
            </PendingWinnerContainer>
          </Card>
        )}
      </PageWrapper>
      
      {/* Componente de sorteio - apenas para a animação */}
      <SlotMachineDrawer
        isVisible={showAnimation}
        drawMethod={drawMethod}
        digitCount={digitCount}
        manualNumber={manualNumber}
        onClose={handleCloseDrawer}
        onWinnerFound={handleWinnerFound}
      />
      
      {/* Modal de detalhes do ganhador separado da animação */}
      {pendingWinner && (
        <WinnerDetailCard 
          winner={pendingWinner}
          isOpen={showWinnerModal}
          detailsMode={true}
          onClose={handleCloseModal}
          onConfirm={handleConfirmWinner}
        />
      )}

              
<TrustDrawBadge>
          <TrustDrawTitle>
            <FaShieldAlt /> Tecnologia Trust Draw™ de Sorteio Seguro
          </TrustDrawTitle>
          <TrustDrawDescription>
            Nossos sorteios são realizados através de <strong>algoritmos criptográficos SHA-256</strong> que garantem total imparcialidade e transparência. A tecnologia Trust Draw™ foi projetada para eliminar qualquer possibilidade de manipulação, utilizando <strong>geração de números verdadeiramente aleatórios (TRNG)</strong> com entropia certificada pelos mais rígidos padrões de segurança do mercado. Cada sorteio é registrado e auditável, proporcionando confiança total para todos os participantes.
          </TrustDrawDescription>
          <TrustDrawSeals>
            <TrustSeal>
              <FaLock /> Criptografado
            </TrustSeal>
            <TrustSeal>
              <FaCheckCircle /> Certificado
            </TrustSeal>
            <TrustSeal>
              <FaAward /> ISO 27001
            </TrustSeal>
          </TrustDrawSeals>
          <TrustDrawLink>
            Saiba Mais • Certificação #TD39278-II
          </TrustDrawLink>
        </TrustDrawBadge>
    </CreatorDashboard>
  );
} 