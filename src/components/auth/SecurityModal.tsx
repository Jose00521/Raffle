'use client';

import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SecurityModal: React.FC<SecurityModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [viewportHeight, setViewportHeight] = useState(0);
  
  // Update viewport height and adjust modal content
  useEffect(() => {
    if (!isOpen) return;
    
    const updateViewportHeight = () => {
      const vh = window.innerHeight;
      setViewportHeight(vh);
      
      if (modalRef.current) {
        const modalPadding = 30;
        const availableHeight = vh - modalPadding;
        
        // Force modal to fit within viewport without scrolling
        modalRef.current.style.maxHeight = `${availableHeight}px`;
        modalRef.current.style.height = `auto`;
        
        // Improved scaling calculation based on device size
        const modalHeight = modalRef.current.scrollHeight;
        if (modalHeight > availableHeight) {
          // Smaller screens get more aggressive scaling
          let scale = Math.min(0.95, availableHeight / modalHeight);
          
          // For very small screens, scale more aggressively
          if (window.innerWidth <= 480) {
            scale = Math.min(0.9, availableHeight / modalHeight);
          }
          
          if (window.innerWidth <= 360) {
            scale = Math.min(0.85, availableHeight / modalHeight);
          }
          
          modalRef.current.style.transform = `scale(${scale})`;
          modalRef.current.style.transformOrigin = 'center top';
        } else {
          modalRef.current.style.transform = 'none';
        }
      }
    };
    
    // Update immediately and on resize
    updateViewportHeight();
    window.addEventListener('resize', updateViewportHeight);
    
    return () => {
      window.removeEventListener('resize', updateViewportHeight);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose} $viewportHeight={viewportHeight}>
      <ModalContent 
        ref={modalRef}
        className="modal-content modal-safe-pay" 
        onClick={e => e.stopPropagation()}
        $viewportHeight={viewportHeight}
      >
        <ButtonClose 
          className="btn-close" 
          data-bs-dismiss="modal" 
          aria-label="Close" 
          onClick={onClose}
        >
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 1L1 16M1 1L16 16L1 1Z" stroke="#333C50" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
        </ButtonClose>

        <ModalBody className="modal-body-safe" $viewportHeight={viewportHeight}>
          <ModalIcon>
            <img src="/icons/shield-check.svg" alt="ícone de segurança" />
          </ModalIcon>

          <TitleSafe className="title-safe" $viewportHeight={viewportHeight}>
            Não se preocupe, aqui é <TitleSpan>seguro!</TitleSpan>
          </TitleSafe>

          <DescriptionSafe className="description-safe" $viewportHeight={viewportHeight}>
            A plataforma de rifas que você está participando utiliza um ambiente protegido para processar o seu pagamento de forma
            <b> 100% segura,</b> com criptografia de ponta a ponta e que garante a segurança dos seus dados.
          </DescriptionSafe>

          <SubTitle className="sub-title" $viewportHeight={viewportHeight}>
            Ficou curioso? Veja como te protegemos:
          </SubTitle>

          <GroupContainer className="row group" $viewportHeight={viewportHeight}>
            <GroupItem className="col-12 col-md-6 d-flex align-items-start" $viewportHeight={viewportHeight}>
              <IconBox>
                <img src="/icons/shield-lock.svg" alt="ícone de escudo" />
              </IconBox>
              <div>
                <TitleGroup className="title-group" $viewportHeight={viewportHeight}>
                  Ambiente criptografado
                </TitleGroup>
                <DescriptionGroup className="description-group" $viewportHeight={viewportHeight}>
                  Sua participação é processada em ambiente seguro e criptografado.
                </DescriptionGroup>
              </div>
            </GroupItem>

            <GroupItem className="col-12 col-md-6 d-flex align-items-start" $viewportHeight={viewportHeight}>
              <IconBox>
                <img src="/icons/clock.svg" alt="ícone de relógio" />
              </IconBox>
              <div>
                <TitleGroup className="title-group" $viewportHeight={viewportHeight}>
                  Monitoramento 24/7
                </TitleGroup>
                <DescriptionGroup className="description-group" $viewportHeight={viewportHeight}>
                  Monitoramos nosso sistema 24 horas por dia.
                </DescriptionGroup>
              </div>
            </GroupItem>

            <GroupItem className="col-12 col-md-6 d-flex align-items-start" $viewportHeight={viewportHeight}>
              <IconBox>
                <img src="/icons/contact-card.svg" alt="ícone de cartão" />
              </IconBox>
              <div>
                <TitleGroup className="title-group" $viewportHeight={viewportHeight}>
                  Antifraude dedicado
                </TitleGroup>
                <DescriptionGroup className="description-group" $viewportHeight={viewportHeight}>
                  Dados sensíveis não ficam em nosso sistema.
                </DescriptionGroup>
              </div>
            </GroupItem>

            <GroupItem className="col-12 col-md-6 d-flex align-items-start" $viewportHeight={viewportHeight}>
              <IconBox>
                <img src="/icons/certificate.svg" alt="ícone de certificado" />
              </IconBox>
              <div>
                <TitleGroup className="title-group" $viewportHeight={viewportHeight}>
                  Certificados SSL
                </TitleGroup>
                <DescriptionGroup className="description-group" $viewportHeight={viewportHeight}>
                  Transações somente em rede segura.
                </DescriptionGroup>
              </div>
            </GroupItem>
          </GroupContainer>

          <ActionContainer className="text-center" data-bs-dismiss="modal" aria-label="Close" $viewportHeight={viewportHeight}>
            <ButtonSafe className="btn btn-success btn-safe" onClick={onClose} $viewportHeight={viewportHeight}>
              Estou seguro
              <HideSmallScreen>, quero participar</HideSmallScreen>!
            </ButtonSafe>
          </ActionContainer>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

// Base styled components
const ModalOverlay = styled.div<{ $viewportHeight: number }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 15px;
  backdrop-filter: blur(5px);
  overscroll-behavior: contain;
  opacity: 0;
  animation: fadeIn 0.3s ease forwards;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @media (max-height: 600px) {
    align-items: flex-start;
    padding-top: 10px;
  }
  
  @media (max-height: 400px) {
    padding: 5px;
  }
`;

const ButtonClose = styled.button`
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  padding: 8px;
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 10;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background-color: rgba(255, 255, 255, 1);
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  @media (max-width: 480px) {
    padding: 6px;
    top: 10px;
    right: 10px;
    width: 28px;
    height: 28px;
  }
  
  svg {
    width: 14px;
    height: 14px;
    
    @media (max-width: 480px) {
      width: 12px;
      height: 12px;
    }
  }
`;

const ModalIcon = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
  padding-top: 5px;
  
  img {
    max-width: 100%;
    height: auto;
    max-height: 68px;
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
    animation: floatIcon 5s ease-in-out infinite;
    
    @keyframes floatIcon {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }
    
    @media (max-width: 768px) {
      max-height: 60px;
    }
    
    @media (max-width: 480px) {
      max-height: 52px;
    }
    
    @media (max-width: 360px) {
      max-height: 45px;
    }
    
    @media (max-height: 600px) {
      max-height: 45px;
    }
    
    @media (max-height: 450px) {
      max-height: 36px;
    }
    
    @media (max-height: 400px) {
      max-height: 32px;
    }
  }
`;

// Using renamed component to avoid circular reference
const ActionContainer = styled.div<{ $viewportHeight: number }>`
  display: flex;
  justify-content: center;
  margin-top: 24px;
  
  @media (max-height: 600px) {
    margin-top: 16px;
  }
  
  @media (max-height: 450px) {
    margin-top: 12px;
  }
  
  @media (max-width: 360px) {
    margin-top: 14px;
  }
`;

const ModalContent = styled.div<{ $viewportHeight: number }>`
  background-color: white;
  border-radius: 20px;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 680px;
 
  padding: 40px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  margin: auto;
  max-height: calc(100vh - 30px);
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    padding: 30px 25px;
    max-width: 95%;
    max-height: calc(100vh - 30px);
  }
  
  @media (max-width: 520px) {
    padding: 25px 20px;
    max-width: 95%;
    border-radius: 15px;
  }
  
  @media (max-width: 375px) {
    padding: 20px 15px;
    max-width: 100%;
    border-radius: 12px;
  }
`;

const ModalBody = styled.div<{ $viewportHeight: number }>`
  text-align: center;
  position: relative;
  z-index: 2;
  
  &::before {
    content: '';
    position: absolute;
    top: -100px;
    right: -100px;
    width: 250px;
    height: 250px;
    background-color: rgba(40, 167, 69, 0.04);
    border-radius: 50%;
    z-index: -1;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -80px;
    left: -80px;
    width: 200px;
    height: 200px;
    background-color: rgba(40, 167, 69, 0.03);
    border-radius: 50%;
    z-index: -1;
  }
`;

const TitleSafe = styled.div<{ $viewportHeight: number }>`
  font-size: clamp(1.5rem, 5vw, 2rem);
  font-weight: 700;
  margin: 0 0 16px;
  color: #333C50;
  line-height: 1.15;
  position: relative;
  
  &::after {
    content: '';
    display: block;
    width: 40px;
    height: 3px;
    background-color: rgba(40, 167, 69, 0.5);
    margin: 10px auto 0;
    border-radius: 2px;
  }
  
  @media (max-width: 768px) {
    font-size: clamp(1.3rem, 4.5vw, 1.8rem);
    margin-bottom: 14px;
    
    &::after {
      width: 35px;
      margin-top: 8px;
    }
  }
  
  @media (max-width: 480px) {
    font-size: clamp(1.1rem, 4vw, 1.5rem);
    margin-bottom: 12px;
    
    &::after {
      width: 30px;
      height: 2px;
      margin-top: 6px;
    }
  }
  
  @media (max-width: 360px) {
    font-size: clamp(1rem, 3.5vw, 1.3rem);
    margin-bottom: 10px;
  }
`;

const TitleSpan = styled.span`
  color: #28a745;
  font-weight: 800;
  position: relative;
  z-index: 1;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 2px;
    left: 0;
    width: 100%;
    height: 6px;
    background-color: rgba(40, 167, 69, 0.15);
    z-index: -1;
    border-radius: 4px;
  }
  
  @media (max-width: 480px) {
    &::after {
      height: 4px;
      bottom: 1px;
    }
  }
`;

const DescriptionSafe = styled.div<{ $viewportHeight: number }>`
  font-size: clamp(0.95rem, 2.5vw, 1.05rem);
  margin-bottom: 24px;
  color: #555;
  max-width: 520px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.4;
  
  b {
    color: #28a745;
    font-weight: 700;
  }
  
  @media (max-width: 768px) {
    font-size: clamp(0.9rem, 2.3vw, 1rem);
    margin-bottom: 20px;
    line-height: 1.35;
  }
  
  @media (max-width: 480px) {
    font-size: clamp(0.8rem, 2.1vw, 0.95rem);
    margin-bottom: 16px;
    line-height: 1.3;
  }
  
  @media (max-width: 360px) {
    font-size: clamp(0.75rem, 2vw, 0.85rem);
    margin-bottom: 14px;
    line-height: 1.25;
  }
`;

const SubTitle = styled.div<{ $viewportHeight: number }>`
  font-size: clamp(1rem, 2.8vw, 1.15rem);
  font-weight: 600;
  margin-bottom: 16px;
  color: #333C50;
  
  @media (max-width: 768px) {
    font-size: clamp(0.95rem, 2.5vw, 1.1rem);
    margin-bottom: 14px;
  }
  
  @media (max-width: 480px) {
    font-size: clamp(0.85rem, 2.2vw, 1rem);
    margin-bottom: 12px;
  }
  
  @media (max-width: 360px) {
    font-size: clamp(0.8rem, 2vw, 0.9rem);
    margin-bottom: 10px;
  }
`;

const GroupContainer = styled.div<{ $viewportHeight: number }>`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 24px;
  width: 100%;
  
  @media (max-width: 768px) {
    gap: 16px;
    margin-bottom: 20px;
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 14px;
  }
  
  @media (max-width: 480px) {
    gap: 12px;
    margin-bottom: 16px;
  }
  
  @media (max-width: 360px) {
    gap: 10px;
    margin-bottom: 14px;
  }
`;

const IconBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 42px;
  height: 42px;
  background-color: rgba(40, 167, 69, 0.08);
  border-radius: 10px;
  margin-right: 12px;
  flex-shrink: 0;
  transition: all 0.2s ease;
  
  img {
    width: 22px;
    height: 22px;
    object-fit: contain;
  }
  
  @media (max-width: 768px) {
    width: 38px;
    height: 38px;
    margin-right: 10px;
    border-radius: 8px;
    
    img {
      width: 20px;
      height: 20px;
    }
  }
  
  @media (max-width: 480px) {
    width: 32px;
    height: 32px;
    margin-right: 8px;
    
    img {
      width: 18px;
      height: 18px;
    }
  }
  
  @media (max-width: 360px) {
    width: 28px;
    height: 28px;
    margin-right: 8px;
    border-radius: 6px;
    
    img {
      width: 16px;
      height: 16px;
    }
  }
`;

const GroupItem = styled.div<{ $viewportHeight: number }>`
  display: flex;
  align-items: flex-start;
  text-align: left;
  padding: 12px 14px;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  transition: all 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.03);
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.9);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
    
    ${IconBox} {
      background-color: rgba(40, 167, 69, 0.15);
    }
  }
  
  @media (max-width: 768px) {
    padding: 10px 12px;
    border-radius: 10px;
  }
  
  @media (max-width: 480px) {
    padding: 8px 10px;
    border-radius: 8px;
  }
  
  @media (max-width: 360px) {
    padding: 6px 8px;
    border-radius: 6px;
  }
`;

const TitleGroup = styled.div<{ $viewportHeight: number }>`
  font-weight: 700;
  font-size: clamp(0.9rem, 2.3vw, 1rem);
  margin-bottom: 4px;
  color: #333C50;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: clamp(0.85rem, 2.1vw, 0.95rem);
    margin-bottom: 3px;
  }
  
  @media (max-width: 480px) {
    font-size: clamp(0.8rem, 2vw, 0.9rem);
    margin-bottom: 2px;
  }
  
  @media (max-width: 360px) {
    font-size: clamp(0.75rem, 1.8vw, 0.85rem);
    line-height: 1.15;
  }
`;

const DescriptionGroup = styled.div<{ $viewportHeight: number }>`
  font-size: clamp(0.8rem, 2vw, 0.9rem);
  color: #666;
  line-height: 1.3;
  
  @media (max-width: 768px) {
    font-size: clamp(0.75rem, 1.9vw, 0.85rem);
    line-height: 1.25;
  }
  
  @media (max-width: 480px) {
    font-size: clamp(0.7rem, 1.8vw, 0.8rem);
    line-height: 1.2;
  }
  
  @media (max-width: 360px) {
    font-size: clamp(0.65rem, 1.7vw, 0.75rem);
    line-height: 1.15;
  }
`;

const ButtonSafe = styled.button<{ $viewportHeight: number }>`
  background: linear-gradient(to right, #28a745, #218838);
  color: white;
  border: none;
  border-radius: 30px;
  padding: 0.8rem 2.2rem;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(40, 167, 69, 0.25);
  display: inline-block;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent);
    transform: translateX(-100%);
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(40, 167, 69, 0.35);
    background: linear-gradient(to right, #218838, #1e7e34);
    
    &::before {
      animation: shimmer 1.5s infinite;
    }
  }
  
  @keyframes shimmer {
    100% {
      transform: translateX(100%);
    }
  }
  
  &:active {
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    padding: 0.7rem 1.8rem;
    font-size: 0.95rem;
    border-radius: 25px;
  }
  
  @media (max-width: 480px) {
    padding: 0.6rem 1.5rem;
    font-size: 0.9rem;
    border-radius: 20px;
  }
  
  @media (max-width: 360px) {
    padding: 0.5rem 1.3rem;
    font-size: 0.85rem;
    border-radius: 18px;
  }
`;

const HideSmallScreen = styled.span`
  @media (max-width: 480px), (max-height: 600px) {
    display: none;
  }
`;

export default SecurityModal; 