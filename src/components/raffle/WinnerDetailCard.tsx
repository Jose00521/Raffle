import React from 'react';
import styled from 'styled-components';
import { FaTrophy, FaCheck, FaFileAlt, FaWhatsapp, FaPhone, FaEnvelope, FaTimes } from 'react-icons/fa';

// Modal container and backdrop
const ModalBackdrop = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(37, 117, 252, 0.95) 0%, rgba(106, 17, 203, 0.95) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: opacity 0.3s ease, visibility 0.3s ease;
`;

// Styled components
const WinnerCard = styled.div`
  background: white;
  border-radius: 24px;
  padding: 40px;
  width: 90%;
  max-width: 600px;
  text-align: left;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  transform: translateY(0);
  animation: winner-appear 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  
  @keyframes winner-appear {
    0% { 
      opacity: 0;
      transform: translateY(30px);
    }
    100% { 
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @media (max-width: 768px) {
    padding: 30px;
  }
  
  @media (max-width: 480px) {
    padding: 24px;
    border-radius: 20px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
`;

const WinnerHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  
  .icon {
    width: 70px;
    height: 70px;
    background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 2rem;
    flex-shrink: 0;
    box-shadow: 0 10px 25px rgba(249, 115, 22, 0.4);
    
    @media (max-width: 768px) {
      width: 60px;
      height: 60px;
      font-size: 1.8rem;
    }
    
    @media (max-width: 480px) {
      width: 50px;
      height: 50px;
      font-size: 1.5rem;
    }
  }
  
  h3 {
    font-size: 1.8rem;
    margin: 0 0 6px;
    color: #111827;
    
    @media (max-width: 768px) {
      font-size: 1.5rem;
    }
    
    @media (max-width: 480px) {
      font-size: 1.3rem;
    }
  }
  
  p {
    margin: 0;
    color: #6b7280;
    font-size: 1rem;
    
    @media (max-width: 480px) {
      font-size: 0.9rem;
    }
  }
`;

const WinnerDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const WinnerDetailItem = styled.div`
  h4 {
    margin: 0 0 4px;
    font-size: 0.9rem;
    color: #666;
    font-weight: 500;
  }
  
  p {
    margin: 0;
    font-size: 1.1rem;
    color: #333;
    font-weight: 600;
    
    @media (max-width: 768px) {
      font-size: 1rem;
    }
  }
`;

const WinnerActions = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 32px;
  
  @media (max-width: 480px) {
    flex-direction: column;
    
    button {
      width: 100%;
    }
  }
`;

const ContactActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 16px;
  margin-bottom: 16px;
  
  @media (max-width: 480px) {
    flex-wrap: wrap;
    
    button {
      flex: 1 0 48%;
    }
  }
`;

const ContactButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &.whatsapp {
    background: #25D366;
    color: white;
    
    &:hover {
      background: #128C7E;
      transform: translateY(-2px);
    }
  }
  
  &.phone {
    background: #0088cc;
    color: white;
    
    &:hover {
      background: #006699;
      transform: translateY(-2px);
    }
  }
  
  &.email {
    background: #EA4335;
    color: white;
    
    &:hover {
      background: #C5221F;
      transform: translateY(-2px);
    }
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

// Types
export interface WinnerInfo {
  name: string;
  phone: string;
  email: string;
  address?: string;
  numbers: string[];
  winningNumber: string;
  purchaseDate: Date;
  id?: string;
}

interface WinnerDetailCardProps {
  winner: WinnerInfo;
  isOpen: boolean;
  detailsMode?: boolean;
  onClose: () => void;
  onConfirm: (winner: WinnerInfo) => void;
}

const WinnerDetailCard: React.FC<WinnerDetailCardProps> = ({
  winner,
  isOpen,
  detailsMode = false,
  onClose,
  onConfirm
}) => {
  const handleConfirmWinner = () => {
    onConfirm(winner);
  };

  return (
    <ModalBackdrop $isOpen={isOpen}>
      <CloseButton onClick={onClose}>
        <FaTimes />
      </CloseButton>
      
      <WinnerCard>
        <WinnerHeader>
          <div className="icon">
            <FaTrophy />
          </div>
          <div>
            <h3>{detailsMode ? 'Detalhes do Ganhador' : 'Ganhador Encontrado!'}</h3>
            <p>{detailsMode ? 'Informações completas para contato' : 'Parabéns ao vencedor da campanha'}</p>
          </div>
        </WinnerHeader>
        
        <WinnerDetails>
          <WinnerDetailItem>
            <h4>Nome</h4>
            <p>{winner.name}</p>
          </WinnerDetailItem>
          
          <WinnerDetailItem>
            <h4>Telefone</h4>
            <p>{winner.phone}</p>
          </WinnerDetailItem>
          
          <WinnerDetailItem>
            <h4>Email</h4>
            <p>{winner.email}</p>
          </WinnerDetailItem>
          
          <WinnerDetailItem>
            <h4>Número Premiado</h4>
            <p>{winner.winningNumber}</p>
          </WinnerDetailItem>
          
          <WinnerDetailItem>
            <h4>Total de Números</h4>
            <p>{winner.numbers.length} números</p>
          </WinnerDetailItem>
          
          <WinnerDetailItem>
            <h4>Data de Compra</h4>
            <p>{winner.purchaseDate.toLocaleDateString('pt-BR')}</p>
          </WinnerDetailItem>
          
          {winner.address && (
            <WinnerDetailItem style={{ gridColumn: '1 / -1' }}>
              <h4>Endereço</h4>
              <p>{winner.address}</p>
            </WinnerDetailItem>
          )}
          
          <WinnerDetailItem style={{ gridColumn: '1 / -1' }}>
            <h4>Todos os Números Adquiridos</h4>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '8px',
              marginTop: '8px'
            }}>
              {winner.numbers.map(num => (
                <div key={num} style={{
                  padding: '4px 10px',
                  background: num === winner.winningNumber ? 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)' : '#f0f0f0',
                  borderRadius: '4px',
                  color: num === winner.winningNumber ? 'white' : '#333',
                  fontWeight: num === winner.winningNumber ? 'bold' : 'normal',
                  boxShadow: num === winner.winningNumber ? '0 4px 12px rgba(249, 115, 22, 0.3)' : 'none'
                }}>
                  {num}
                </div>
              ))}
            </div>
          </WinnerDetailItem>
          
          <WinnerDetailItem style={{ gridColumn: '1 / -1' }}>
            <h4>Informações de Contato Adicionais</h4>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '8px',
              marginTop: '8px',
              padding: '12px',
              background: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #eaeaea'
            }}>
              <p style={{ margin: 0 }}>
                <strong>Melhor horário para contato:</strong> Horário comercial (9h às 18h)
              </p>
              <p style={{ margin: 0 }}>
                <strong>Preferência de contato:</strong> {winner.phone.includes('WhatsApp') ? 'WhatsApp' : 'Telefone/Email'}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Data e hora da compra:</strong> {winner.purchaseDate.toLocaleDateString('pt-BR')} às {winner.purchaseDate.toLocaleTimeString('pt-BR')}
              </p>
            </div>
          </WinnerDetailItem>
        </WinnerDetails>
        
        {detailsMode && (
          <ContactActions>
            <ContactButton 
              className="whatsapp"
              href={`https://wa.me/${winner.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaWhatsapp /> Contatar por WhatsApp
            </ContactButton>
            <ContactButton 
              className="phone"
              href={`tel:${winner.phone.replace(/\D/g, '')}`}
            >
              <FaPhone /> Ligar para Ganhador
            </ContactButton>
            <ContactButton 
              className="email"
              href={`mailto:${winner.email}`}
            >
              <FaEnvelope /> Enviar Email
            </ContactButton>
          </ContactActions>
        )}
        
        <WinnerActions>
          <ActionButton onClick={onClose}>
            <FaTimes /> Voltar
          </ActionButton>
          
          <ActionButton $primary onClick={handleConfirmWinner}>
            <FaCheck /> Confirmar Ganhador
          </ActionButton>
          
          <ActionButton>
            <FaFileAlt /> Gerar Certificado
          </ActionButton>
        </WinnerActions>
      </WinnerCard>
    </ModalBackdrop>
  );
};

export default WinnerDetailCard; 