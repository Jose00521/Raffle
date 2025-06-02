'use client';

import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

interface ImageCarouselProps {
  images: string[];
  onImageClick?: (index: number) => void;
  autoplayInterval?: number;
  showZoomIndicator?: boolean;
  showThumbnails?: boolean;
  aspectRatio?: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  onImageClick,
  autoplayInterval = 5000,
  showZoomIndicator = false,
  showThumbnails = true,
  aspectRatio = '16/9'
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  // Estados para controle de swipe/deslize
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const isClickedRef = useRef(false);
  const [isMobile, setIsMobile] = useState(true);

  // Detectar se é mobile ou desktop
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Verificar imediatamente
    checkDevice();
    
    // Adicionar listener para redimensionamento
    window.addEventListener('resize', checkDevice);
    
    // Limpar listener
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Função para trocar para a próxima imagem
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  // Função para trocar para a imagem anterior
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Troca de imagem automática se autoplay estiver ativo
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isAutoplay && images.length > 1) {
      intervalId = setInterval(() => {
        nextImage();
      }, autoplayInterval);
    }

    return () => clearInterval(intervalId);
  }, [isAutoplay, currentImageIndex, autoplayInterval, images.length]);

  // Pause no autoplay quando o usuário interagir com o carrossel
  const handleUserInteraction = () => {
    setIsAutoplay(false);
    // Reinicia o autoplay após 10 segundos de inatividade
    setTimeout(() => setIsAutoplay(true), 10000);
  };

  // Função para handling de toque inicial
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    handleUserInteraction();
    
    // Não iniciar drag se o clique foi em um botão de navegação
    if ((e.target as Element).closest('.navegacao-seta')) {
      return;
    }
    
    setIsDragging(true);
    isClickedRef.current = true;
    
    // Captura posição inicial (funciona para touch e mouse)
    const clientX = 'touches' in e 
      ? (e as React.TouchEvent).touches[0].clientX 
      : (e as React.MouseEvent).clientX;
    
    setTouchStartX(clientX);
    setTouchEndX(clientX);
  };
  
  // Função para handling de movimento de toque
  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    
    // Captura posição atual (funciona para touch e mouse)
    const clientX = 'touches' in e 
      ? (e as React.TouchEvent).touches[0].clientX 
      : (e as React.MouseEvent).clientX;
    
    setTouchEndX(clientX);
    
    // Se moveu significativamente, não é um clique
    if (Math.abs(clientX - touchStartX) > 10) {
      isClickedRef.current = false;
    }
    
    // Calcula e aplica o offset para arrastar visualmente o slide
    const offset = clientX - touchStartX;
    setDragOffset(offset);
    
    // Previne scroll da página durante o deslize
    e.preventDefault();
  };
  
  // Função para handling do fim do toque
  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const diff = touchEndX - touchStartX;
    const threshold = 100; // Mínimo de pixels para considerar como swipe
    
    if (diff > threshold) {
      // Swipe para direita - slide anterior
      prevImage();
    } else if (diff < -threshold) {
      // Swipe para esquerda - próximo slide
      nextImage();
    } else if (isClickedRef.current && !isMobile && onImageClick) {
      // Foi um clique genuíno e não estamos em mobile
      onImageClick(currentImageIndex);
    }
    
    // Reset dos estados
    setIsDragging(false);
    setDragOffset(0);
    isClickedRef.current = false;
  };
  
  // Função para cancelar o dragging se o mouse sair da área
  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragOffset(0);
    }
  };

  // Função para selecionar uma imagem específica
  const handleSelectImage = (index: number) => {
    setCurrentImageIndex(index);
    handleUserInteraction();
  };

  return (
    <PainelImagem>
      {/* Carrossel de imagens com suporte a swipe */}
      <CarrosselContainer 
        onClick={handleUserInteraction}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove as any}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseMove={handleTouchMove as any}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleMouseLeave}
        $aspectRatio={aspectRatio}
      >
        <CarrosselWrapper 
          style={{ 
            transform: `translateX(calc(-${currentImageIndex * 100}% + ${isDragging ? dragOffset : 0}px))`,
            transition: isDragging ? 'none' : 'transform 0.5s ease'
          }}
        >
          {images.map((img, index) => (
            <CarrosselSlide key={index}>
              <CarrosselImagem 
                src={img} 
                alt={`Imagem ${index+1}`}
                draggable={false}
              />
              {showZoomIndicator && !isMobile && <ZoomIndicator><i className="fas fa-search-plus"></i></ZoomIndicator>}
            </CarrosselSlide>
          ))}
        </CarrosselWrapper>
        
        {images.length > 1 && (
          <>
            <CarrosselSetas>
              <SetaNavegacao 
                className="navegacao-seta"
                onClick={(e) => { 
                  e.stopPropagation();
                  prevImage();
                }}
              >
                <i className="fas fa-chevron-left"></i>
              </SetaNavegacao>
              <SetaNavegacao 
                className="navegacao-seta"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  nextImage();
                }}
              >
                <i className="fas fa-chevron-right"></i>
              </SetaNavegacao>
            </CarrosselSetas>
            
            <IndicadoresPontos>
              {images.map((_, index) => (
                <PontoIndicador 
                  key={index} 
                  className="navegacao-seta"
                  $ativo={index === currentImageIndex}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                    handleUserInteraction();
                  }}
                />
              ))}
            </IndicadoresPontos>
          </>
        )}
      </CarrosselContainer>
      
      {/* Miniaturas das imagens */}
      {showThumbnails && images.length > 1 && (
        <MiniaturasContainer>
          {images.map((img, index) => (
            <MiniaturaBotao
              key={index}
              $ativo={index === currentImageIndex}
              onClick={() => handleSelectImage(index)}
            >
              <MiniaturaImagem src={img} alt={`Miniatura ${index + 1}`} />
            </MiniaturaBotao>
          ))}
        </MiniaturasContainer>
      )}
    </PainelImagem>
  );
};

// Estilos
const PainelImagem = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const CarrosselContainer = styled.div<{ $aspectRatio: string }>`
  position: relative;
  width: 100%;
  aspect-ratio: ${props => props.$aspectRatio};
  border-radius: ${({ theme }) => theme.borderRadius?.lg || '12px'};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows?.md || '0 4px 16px rgba(0, 0, 0, 0.08)'};
  cursor: pointer;
`;

const CarrosselWrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.5s ease;
`;

const CarrosselSlide = styled.div`
  flex-shrink: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  position: relative;
  
  @media (max-width: 767px) {
    cursor: default;
  }
`;

const CarrosselImagem = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const CarrosselSetas = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ${CarrosselContainer}:hover & {
    opacity: 1;
  }
`;

const SetaNavegacao = styled.button`
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: scale(1.1);
  }
`;

const IndicadoresPontos = styled.div`
  position: absolute;
  bottom: 15px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
`;

const PontoIndicador = styled.button<{ $ativo: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: none;
  background-color: ${({ $ativo }) => 
    $ativo ? 'white' : 'rgba(255, 255, 255, 0.5)'
  };
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.2);
    background-color: white;
  }
`;

const MiniaturasContainer = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  scrollbar-width: thin;
  -webkit-overflow-scrolling: touch;
  
  /* Esconde a scrollbar mas mantém a funcionalidade */
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors?.gray?.light || '#f0f0f0'};
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors?.gray?.dark || '#ccc'};
    border-radius: 10px;
  }
  
  /* Para desktop, volta para grid em vez de scroll horizontal */
  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    overflow-x: visible;
  }
`;

const MiniaturaBotao = styled.button<{ $ativo: boolean }>`
  padding: 0;
  border: ${({ $ativo, theme }) => 
    $ativo ? `2px solid ${theme.colors?.primary || '#6a11cb'}` : '2px solid transparent'
  };
  border-radius: ${({ theme }) => theme.borderRadius?.md || '8px'};
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  aspect-ratio: 16/9;
  min-width: 100px;
  max-width: 100px;
  width: 20%;
  flex-shrink: 0;
  
  @media (min-width: 768px) {
    min-width: unset;
    max-width: unset;
    width: auto;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows?.md || '0 4px 16px rgba(0, 0, 0, 0.08)'};
  }
`;

const MiniaturaImagem = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ZoomIndicator = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  font-size: 1.5rem;
  
  ${CarrosselSlide}:hover & {
    opacity: 0.8;
  }
`;

export default ImageCarousel; 