'use client';

import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { FaTimes, FaChevronLeft, FaChevronRight, FaExpand, FaCompress, FaHeart, FaShare, FaAngleDown } from 'react-icons/fa';
import { MdZoomIn } from 'react-icons/md';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  campaignTitle?: string;
  campaignPrice?: string;
  onParticipate?: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  images,
  currentIndex,
  campaignTitle = "Rifa Exclusiva",
  campaignPrice = "R$ 10,00",
  onParticipate
}) => {
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  const [isAnimating, setIsAnimating] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset the active index when the modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveIndex(currentIndex);
      setIsClosing(false);
      setImageLoaded(false);
      setIsZoomed(false);
      // Disable body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable body scroll when modal is closed
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, currentIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          handleClose();
          break;
        case 'ArrowLeft':
          handlePrevImage();
          break;
        case 'ArrowRight':
          handleNextImage();
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'z':
          toggleZoom();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, activeIndex, isZoomed]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setIsZoomed(false);
  };

  const toggleZoom = () => {
    if (isZoomed) {
      setIsZoomed(false);
    } else {
      setIsZoomed(true);
    }
  };

  const togglePanel = () => {
    setIsPanelCollapsed(!isPanelCollapsed);
  };

  const handleClose = () => {
    setIsClosing(true);
    // Add slight delay to allow the closing animation to play
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const handleNextImage = () => {
    if (isAnimating || isZoomed) return;
    
    setIsAnimating(true);
    setImageLoaded(false);
    setActiveIndex((prev) => (prev + 1) % images.length);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  const handlePrevImage = () => {
    if (isAnimating || isZoomed) return;
    
    setIsAnimating(true);
    setImageLoaded(false);
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isZoomed) return;
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isZoomed) return;
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || isZoomed) return;
    
    const distance = touchStart - touchEnd;
    const isSignificantSwipe = Math.abs(distance) > 50;
    
    if (isSignificantSwipe) {
      if (distance > 0) {
        // Swipe left, next image
        handleNextImage();
      } else {
        // Swipe right, prev image
        handlePrevImage();
      }
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleParticipate = () => {
    handleClose();
    if (onParticipate) {
      setTimeout(() => {
        onParticipate();
      }, 300);
    }
  };

  const shareRaffle = () => {
    if (navigator.share) {
      navigator.share({
        title: campaignTitle,
        text: `Confira esta rifa incrível: ${campaignTitle}`,
        url: window.location.href,
      })
      .catch((error) => console.log('Erro ao compartilhar:', error));
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay $isClosing={isClosing} onClick={handleClose}>
      <ModalContainer 
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        $isFullscreen={isFullscreen}
        $isClosing={isClosing}
        ref={containerRef}
      >
        {!isPanelCollapsed && (
          <TopBar>
            <LogoWrapper>
              <span>✨ Premium</span>
            </LogoWrapper>
            
            <ModalControls>
              <ControlButton onClick={shareRaffle} title="Compartilhar">
                <FaShare />
              </ControlButton>
              <ControlButton onClick={toggleZoom} title="Zoom" $active={isZoomed}>
                <MdZoomIn />
              </ControlButton>
              <FullscreenButton onClick={toggleFullscreen} title={isFullscreen ? "Sair da tela cheia" : "Entrar em tela cheia"}>
                {isFullscreen ? <FaCompress /> : <FaExpand />}
              </FullscreenButton>
              <CloseButton onClick={handleClose} title="Fechar galeria">
                <FaTimes />
              </CloseButton>
            </ModalControls>
          </TopBar>
        )}
        
        <CollapseButton onClick={togglePanel} title={isPanelCollapsed ? "Mostrar controles" : "Esconder controles"}>
          <FaAngleDown style={{ transform: isPanelCollapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}/>
        </CollapseButton>
        
        <ImageContainer $isFullscreen={isFullscreen} $isPanelCollapsed={isPanelCollapsed}>
          {!imageLoaded && <LoadingSpinner />}
          
          {!isZoomed && (
            <NavigationButton $left onClick={handlePrevImage} aria-label="Imagem anterior">
              <FaChevronLeft />
            </NavigationButton>
          )}
          
          <ImageWrapper 
            $isAnimating={isAnimating} 
            $isZoomed={isZoomed}
            onClick={isZoomed ? toggleZoom : undefined}
            style={{ cursor: isZoomed ? 'zoom-out' : 'default' }}
          >
            <MainImage 
              ref={imageRef}
              src={images[activeIndex]} 
              alt={`Imagem ${activeIndex + 1} - ${campaignTitle}`}
              $isAnimating={isAnimating}
              $isLoaded={imageLoaded}
              $isZoomed={isZoomed}
              onLoad={handleImageLoad}
              onClick={isZoomed ? undefined : toggleZoom}
              style={{ cursor: isZoomed ? 'zoom-out' : 'zoom-in' }}
            />
          </ImageWrapper>
          
          {!isZoomed && (
            <NavigationButton $right onClick={handleNextImage} aria-label="Próxima imagem">
              <FaChevronRight />
            </NavigationButton>
          )}

          {!isZoomed && !imageLoaded && (
            <ZoomHint>
              <MdZoomIn /> Clique para ampliar
            </ZoomHint>
          )}
          
          <CTAContainer $isVisible={imageLoaded && !isZoomed}>
            <CTAHeading>{campaignTitle}</CTAHeading>
            <CTAButton onClick={handleParticipate}>

              <span>Participar Agora</span>

            </CTAButton>
          </CTAContainer>
        </ImageContainer>
        
        {!isPanelCollapsed && (
          <BottomControls>
            <ImageCounter>
              <CurrentImage>{activeIndex + 1}</CurrentImage>
              <TotalImages>/ {images.length}</TotalImages>
            </ImageCounter>
            
            <ThumbnailsContainer>
              <ThumbnailsWrapper>
                {images.map((image, index) => (
                  <ThumbnailButton
                    key={index}
                    $isActive={activeIndex === index}
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Ver imagem ${index + 1}`}
                    disabled={activeIndex === index}
                  >
                    <ThumbnailImage src={image} alt={`Miniatura ${index + 1}`} />
                    {activeIndex === index && <ActiveIndicator />}
                  </ThumbnailButton>
                ))}
              </ThumbnailsWrapper>
            </ThumbnailsContainer>
            
            <ActionButtons>
              <LikeButton>
                <FaHeart />
              </LikeButton>
              <ShareButton onClick={shareRaffle}>
                <FaShare />
                <span>Compartilhar</span>
              </ShareButton>
            </ActionButtons>
          </BottomControls>
        )}
      </ModalContainer>
    </ModalOverlay>
  );
};

// Keyframes animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const zoomIn = keyframes`
  from { transform: scale(0.95); }
  to { transform: scale(1); }
`;

const zoomOut = keyframes`
  from { transform: scale(1); }
  to { transform: scale(0.95); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const shine = keyframes`
  0% { background-position: -100px; }
  40%, 100% { background-position: 300px; }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const beat = keyframes`
  0% { transform: scale(1); }
  25% { transform: scale(1.2); }
  40% { transform: scale(1); }
  60% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const ModalOverlay = styled.div<{ $isClosing: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 15px;
  backdrop-filter: blur(10px);
  animation: ${props => props.$isClosing ? 
    css`${fadeOut} 0.3s ease forwards` : 
    css`${fadeIn} 0.4s ease`
  };
`;

const ModalContainer = styled.div<{ $isFullscreen: boolean, $isClosing: boolean }>`
  position: relative;
  width: 100%;
  height: 100%;
  max-width: ${props => props.$isFullscreen ? '100%' : '1600px'};
  max-height: ${props => props.$isFullscreen ? '100%' : '90vh'};
  display: flex;
  flex-direction: column;
  border-radius: ${props => props.$isFullscreen ? '0' : '12px'};
  overflow: hidden;
  background-color: rgba(15, 15, 15, 0.8);
  box-shadow: ${props => props.$isFullscreen ? 'none' : '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05)'};
  animation: ${props => {
    if (props.$isClosing) {
      return css`${zoomOut} 0.3s ease forwards`;
    } else if (props.$isFullscreen) {
      return css`${fadeIn} 0.3s ease`;
    } else {
      return css`${zoomIn} 0.4s ease`;
    }
  }};
  transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.8), transparent);
  z-index: 20;
`;

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  color: #ffcc00;
  font-weight: 600;
  font-size: 1rem;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  
  span {
    background: linear-gradient(to right, #ffcc00, #ff9500);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const ModalControls = styled.div`
  display: flex;
  gap: 10px;
  z-index: 20;
`;

const CloseButton = styled.button`
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  &:hover {
    background: rgba(255, 0, 0, 0.5);
    transform: scale(1.1);
    border-color: rgba(255, 0, 0, 0.3);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const FullscreenButton = styled(CloseButton)`
  background: rgba(0, 0, 0, 0.6);
  
  &:hover {
    background: rgba(30, 144, 255, 0.5);
    border-color: rgba(30, 144, 255, 0.3);
  }
`;

const ControlButton = styled(CloseButton)<{ $active?: boolean }>`
  background: ${props => props.$active ? 'rgba(0, 255, 100, 0.5)' : 'rgba(0, 0, 0, 0.6)'};
  
  &:hover {
    background: rgba(0, 255, 100, 0.5);
    border-color: rgba(0, 255, 100, 0.3);
  }
`;

const CollapseButton = styled.button`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 5px;
  z-index: 25;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  svg {
    transition: transform 0.3s ease;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const ImageContainer = styled.div<{ $isFullscreen: boolean, $isPanelCollapsed: boolean }>`
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: radial-gradient(circle at center, #111 40%, black 100%);
  transition: all 0.3s ease;
  padding: ${props => {
    if (props.$isPanelCollapsed) return '30px 20px 20px';
    return props.$isFullscreen ? '0' : '20px';
  }};
`;

const ImageWrapper = styled.div<{ $isAnimating: boolean; $isZoomed: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease, opacity 0.3s ease;
  transform: ${props => props.$isAnimating ? 'scale(0.98)' : 'scale(1)'};
  opacity: ${props => props.$isAnimating ? '0.8' : '1'};
  overflow: ${props => props.$isZoomed ? 'auto' : 'visible'};
`;

const MainImage = styled.img<{ 
  $isAnimating: boolean; 
  $isLoaded: boolean;
  $isZoomed: boolean;
}>`
  max-width: ${props => props.$isZoomed ? 'none' : '100%'};
  max-height: ${props => props.$isZoomed ? 'none' : 'calc(100% - 80px)'};
  width: ${props => props.$isZoomed ? 'auto' : 'auto'};
  height: ${props => props.$isZoomed ? 'auto' : 'auto'};
  object-fit: contain;
  transition: all 0.3s ease;
  opacity: ${props => (props.$isLoaded ? '1' : '0')};
  transform: ${props => props.$isZoomed ? 'scale(1.5)' : 'scale(1)'};
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const LoadingSpinner = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: #ffcc00;
  animation: ${spin} 1s linear infinite;
  box-shadow: 0 0 15px rgba(255, 204, 0, 0.3);
`;

const ZoomHint = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 5px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  animation: ${fadeIn} 0.5s ease-in-out;
  z-index: 10;
  pointer-events: none;
`;

const NavigationButton = styled.button<{ $left?: boolean; $right?: boolean }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${({ $left }) => $left && `left: 20px;`}
  ${({ $right }) => $right && `right: 20px;`}
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.5rem;
  z-index: 5;
  opacity: 0.7;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-50%) scale(1.1);
    opacity: 1;
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
  }
  
  &:active {
    transform: translateY(-50%) scale(0.95);
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
    
    ${({ $left }) => $left && `left: 10px;`}
    ${({ $right }) => $right && `right: 10px;`}
  }
`;

const BottomControls = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
  
  @media (max-width: 768px) {
    padding: 15px 0;
  }
`;

const ImageCounter = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  
  @media (max-width: 768px) {
    margin-bottom: 10px;
  }
`;

const CurrentImage = styled.span`
  color: white;
  font-size: 1.3rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
`;

const TotalImages = styled.span`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
  margin-left: 3px;
`;

const ThumbnailsContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  overflow-x: auto;
  padding: 0 20px;
  -webkit-overflow-scrolling: touch;
  
  /* Scrollbar styling */
  &::-webkit-scrollbar {
    height: 5px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 10px;
  }
  
  /* Firefox scrollbar */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1);
  
  @media (max-width: 768px) {
    padding: 0 10px;
  }
`;

const ThumbnailsWrapper = styled.div`
  display: flex;
  gap: 12px;
  padding: 5px 0;
  
  @media (max-width: 768px) {
    gap: 8px;
  }
`;

const ThumbnailButton = styled.button<{ $isActive: boolean }>`
  position: relative;
  width: 80px;
  height: 60px;
  padding: 0;
  border: none;
  border-radius: 8px;
  overflow: hidden;
  cursor: ${props => props.$isActive ? 'default' : 'pointer'};
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
  opacity: ${({ $isActive }) => ($isActive ? '1' : '0.6')};
  transform: ${({ $isActive }) => ($isActive ? 'scale(1.05)' : 'scale(1)')};
  box-shadow: ${({ $isActive }) => 
    $isActive ? '0 6px 15px rgba(0, 0, 0, 0.4), 0 0 0 2px rgba(255, 204, 0, 0.5)' : 'none'};
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  &:hover:not(:disabled) {
    opacity: 1;
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1);
  }
  
  &:disabled {
    cursor: default;
  }
  
  @media (max-width: 768px) {
    width: 60px;
    height: 45px;
  }
`;

const ThumbnailImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  
  ${ThumbnailButton}:hover:not(:disabled) & {
    transform: scale(1.1);
  }
`;

const ActiveIndicator = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  background: linear-gradient(to right, #ffcc00, #ff7b00);
  animation: ${pulse} 2s infinite;
  box-shadow: 0 0 10px rgba(255, 204, 0, 0.5);
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 15px;
  
  @media (max-width: 768px) {
    gap: 10px;
    margin-top: 10px;
  }
`;

const LikeButton = styled.button`
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 0, 80, 0.3);
    color: #ff7096;
    transform: scale(1.1);
    border-color: rgba(255, 0, 80, 0.5);
    
    svg {
      animation: ${beat} 0.6s ease-in-out;
    }
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const ShareButton = styled.button`
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  height: 40px;
  border-radius: 20px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(30, 144, 255, 0.2);
    transform: translateY(-2px);
    border-color: rgba(30, 144, 255, 0.5);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: translateY(0) scale(0.98);
  }
`;

const CTAContainer = styled.div<{ $isVisible: boolean }>`
  position: absolute;
  bottom: 90px;
  right: 30px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
  transform: ${props => props.$isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)'};
  opacity: ${props => props.$isVisible ? '1' : '0'};
  border: 1px solid rgba(255, 204, 0, 0.3);
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  pointer-events: ${props => props.$isVisible ? 'all' : 'none'};
  animation: ${float} 4s ease-in-out infinite;
  z-index: 15;
  
  @media (max-width: 768px) {
    bottom: 80px;
    right: 20px;
    padding: 12px;
  }
`;

const CTAHeading = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: white;
  margin-bottom: 10px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
`;

const CTAButton = styled.button`
  position: relative;
  padding: 10px 16px;
  background: linear-gradient(to bottom right, #00c853, #009624);
  border: none;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 200, 83, 0.3);
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to right, 
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.6) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    transform: translateX(-100%);
  }
  
  &:hover {
    transform: translateY(-3px);
    background: linear-gradient(to bottom right, #00e676, #00c853);
    box-shadow: 0 7px 15px rgba(0, 200, 83, 0.4);
    
    &::after {
      animation: ${shine} 1.5s infinite;
    }
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(0, 200, 83, 0.2);
  }
`;

const PriceTag = styled.div`
  position: absolute;
  top: -10px;
  left: -10px;
  background: #ffcc00;
  color: black;
  font-weight: 700;
  font-size: 0.8rem;
  padding: 3px 8px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transform: rotate(-10deg);
`;

const HotLabel = styled.div`
  position: absolute;
  top: -8px;
  right: -15px;
  background: #ff3d00;
  color: white;
  font-weight: 600;
  font-size: 0.65rem;
  padding: 2px 6px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transform: rotate(10deg);
`;

export default ImageModal; 