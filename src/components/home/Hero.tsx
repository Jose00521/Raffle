'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Link from 'next/link';

const HeroContainer = styled.section`
  position: relative;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.primaryDark} 100%);
  color: white;
  padding: 6rem 2rem;
  overflow: hidden;
`;

const HeroOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.2);
  z-index: 1;
`;

const Pattern = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E");
  opacity: 0.3;
  z-index: 0;
`;

const HeroContent = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    flex-direction: column;
    text-align: center;
    gap: 3rem;
  }
`;

const HeroText = styled.div`
  flex: 1;
  max-width: 600px;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    max-width: 100%;
  }
`;

const HeroTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['5xl']};
  font-weight: 800;
  margin-bottom: 1.5rem;
  line-height: 1.2;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.fontSizes['3xl']};
  }
`;

const HeroSubtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: 400;
  margin-bottom: 2.5rem;
  opacity: 0.9;
  line-height: 1.6;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.fontSizes.lg};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  min-width: 300px !important;
  gap: 1rem;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: row;
    align-items: center !important;
    justify-content: center;
  }
`;

const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  color: ${({ theme }) => theme.colors.primary};
  padding: 1rem 2rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  font-size: ${({ theme }) => theme.fontSizes.md};
  text-decoration: none;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
`;

const SecondaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  color: white;
  padding: 1rem 2rem;
  border: 2px solid white;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  font-size: ${({ theme }) => theme.fontSizes.md};
  text-decoration: none;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    transform: translateY(-3px);
  }
`;

const HeroImage = styled.div`
  flex: 1;
  max-width: 800px;
  position: relative;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    max-width: 100%;
  }
`;

// Carrossel Components
const CarrosselContainer = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    height: 300px;
  }
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
  position: relative;
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

const CarrosselOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 50%);
  z-index: 2;
  pointer-events: none;
`;

const CarrosselCaption = styled.div`
  position: absolute;
  bottom: 50px;
  left: 20px;
  right: 20px;
  color: white;
  z-index: 3;
  text-align: left;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    bottom: 30px;
  }
`;

const CarrosselTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 1.2rem;
  }
`;

const CarrosselStatus = styled.span<{ $entregue?: boolean }>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  background-color: ${({ $entregue }) => $entregue ? 'rgba(76, 175, 80, 0.9)' : 'rgba(255, 193, 7, 0.9)'};
  margin-bottom: 0.5rem;
`;

const Hero: React.FC = () => {
  // Sample data for carousel
  const carouselItems = [
    {
      image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1650&q=80",
      title: "HB20 2025 0KM + CG 160 Titan 2025 0KM",
      status: "ativo",
      id: "1"
    },
    {
      image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1464&q=80",
      title: "Jeep Compass Limited 2024 - Entregue para João Silva",
      status: "entregue",
      id: "2"
    },
    {
      image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1650&q=80",
      title: "Fiat Toro Freedom 2023 - Entregue para Maria Oliveira",
      status: "entregue",
      id: "3"
    },
        {
      image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1650&q=80",
      title: "Fiat Toro Freedom 2023 - Entregue para Maria Oliveira",
      status: "entregue",
      id: "4"
    },
        {
      image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1650&q=80",
      title: "Fiat Toro Freedom 2023 - Entregue para Maria Oliveira",
      status: "entregue",
      id: "5"
    }
  ];

  // Carrossel state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  // Funções de navegação
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % carouselItems.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
  };

  // Troca de slides automática
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isAutoplay) {
      intervalId = setInterval(() => {
        nextSlide();
      }, 5000); // Troca a cada 5 segundos
    }

    return () => clearInterval(intervalId);
  }, [isAutoplay, currentIndex]);

  // Pause no autoplay quando o usuário interagir
  const handleUserInteraction = () => {
    setIsAutoplay(false);
    // Reinicia o autoplay após 10 segundos de inatividade
    setTimeout(() => setIsAutoplay(true), 10000);
  };

  // Funções para handling de touch/swipe
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    handleUserInteraction();
    setIsDragging(true);
    
    // Captura posição inicial
    const clientX = 'touches' in e 
      ? (e as React.TouchEvent).touches[0].clientX 
      : (e as React.MouseEvent).clientX;
    
    setTouchStartX(clientX);
    setTouchEndX(clientX);
  };
  
  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    
    // Captura posição atual
    const clientX = 'touches' in e 
      ? (e as React.TouchEvent).touches[0].clientX 
      : (e as React.MouseEvent).clientX;
    
    setTouchEndX(clientX);
    
    // Calcula e aplica o offset para arrastar visualmente o slide
    const offset = clientX - touchStartX;
    setDragOffset(offset);
    
    // Previne scroll da página durante o deslize
    e.preventDefault();
  };
  
  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const diff = touchEndX - touchStartX;
    const threshold = 100; // Mínimo de pixels para considerar como swipe
    
    if (diff > threshold) {
      // Swipe para direita - slide anterior
      prevSlide();
    } else if (diff < -threshold) {
      // Swipe para esquerda - próximo slide
      nextSlide();
    }
    
    // Reset dos estados
    setIsDragging(false);
    setDragOffset(0);
  };
  
  // Função para cancelar o dragging se o mouse sair da área
  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragOffset(0);
    }
  };

  return (
    <HeroContainer>
      <Pattern />
      <HeroOverlay />
      <HeroContent>
        <HeroText>
          <HeroTitle>Concorra a Prêmios Incríveis!</HeroTitle>
          <HeroSubtitle>
            Participe das nossas campanhas e tenha a chance de ganhar carros, motos, 
            dinheiro em espécie e muito mais com apenas alguns reais.
          </HeroSubtitle>
          <ButtonGroup>
            <Link href="/campanhas">
              <PrimaryButton as="span">Ver Campanhas</PrimaryButton>
            </Link>
            <Link href="/comunicados">
              <SecondaryButton as="span">Comunicados</SecondaryButton>
            </Link>
          </ButtonGroup>
        </HeroText>
        
        <HeroImage>
          <CarrosselContainer
            onClick={handleUserInteraction}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove as any}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleTouchStart}
            onMouseMove={handleTouchMove as any}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleMouseLeave}
          >
            <CarrosselWrapper 
              style={{ 
                transform: `translateX(calc(-${currentIndex * 100}% + ${isDragging ? dragOffset : 0}px))`,
                transition: isDragging ? 'none' : 'transform 0.5s ease'
              }}
            >
              {carouselItems.map((item, index) => (
                <CarrosselSlide key={index}>
                  <CarrosselImagem 
                    src={item.image} 
                    alt={item.title}
                    draggable={false}
                  />
                  <CarrosselOverlay />
                  <CarrosselCaption>
                    <CarrosselStatus $entregue={item.status === 'entregue'}>
                      {item.status === 'entregue' ? 'Prêmio Entregue' : 'Campanha Ativa'}
                    </CarrosselStatus>
                    <CarrosselTitle>{item.title}</CarrosselTitle>
                  </CarrosselCaption>
                </CarrosselSlide>
              ))}
            </CarrosselWrapper>
            
            <CarrosselSetas>
              <SetaNavegacao onClick={(e) => { e.stopPropagation(); prevSlide(); }}>
                <i className="fas fa-chevron-left"></i>
              </SetaNavegacao>
              <SetaNavegacao onClick={(e) => { e.stopPropagation(); nextSlide(); }}>
                <i className="fas fa-chevron-right"></i>
              </SetaNavegacao>
            </CarrosselSetas>
            
            <IndicadoresPontos>
              {carouselItems.map((_, index) => (
                <PontoIndicador 
                  key={index} 
                  $ativo={index === currentIndex}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(index);
                    handleUserInteraction();
                  }}
                />
              ))}
            </IndicadoresPontos>
          </CarrosselContainer>
        </HeroImage>
      </HeroContent>
    </HeroContainer>
  );
};

export default Hero; 