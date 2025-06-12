'use client';

import React from 'react';
import styled, { keyframes } from 'styled-components';
import Link from 'next/link';

// Animations
const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const glow = keyframes`
  0%, 100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.2);
  }
`;

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const ContentWrapper = styled.div`
  max-width: 600px;
  text-align: center;
  animation: ${fadeIn} 1s ease-out;
  position: relative;
  z-index: 2;
`;

const SvgContainer = styled.div`
  width: 300px;
  height: 400px;
  margin: 0 auto 2rem;
  animation: ${float} 3s ease-in-out infinite;
  
  @media (max-width: 768px) {
    width: 250px;
    height: 330px;
  }
  
  @media (max-width: 480px) {
    width: 200px;
    height: 280px;
  }
`;

const StyledSvg = styled.svg`
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3));
  
  .bench-legs {
    fill: #8B4513;
  }
  
  .top-bench {
    fill: #A0522D;
  }
  
  .bottom-bench {
    fill: #CD853F;
  }
  
  .lamp-details {
    fill: #2C3E50;
  }
  
  .lamp-accent {
    fill: #34495E;
  }
  
  .lamp-light {
    fill: #F39C12;
    animation: ${glow} 2s ease-in-out infinite;
  }
  
  .lamp-light__glow {
    animation: ${glow} 2s ease-in-out infinite;
  }
  
  .lamp-bottom {
    fill: #2C3E50;
  }
`;

const Title = styled.h1`
  font-size: 4rem;
  font-weight: 800;
  color: white;
  margin: 0 0 1rem;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    font-size: 3rem;
  }
  
  @media (max-width: 480px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 1.5rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const Description = styled.p`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 2.5rem;
  line-height: 1.6;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const Button = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  text-decoration: none;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  }
  
  @media (max-width: 480px) {
    padding: 0.8rem 1.5rem;
    font-size: 0.9rem;
  }
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: rgba(255, 255, 255, 0.3);
  
  &:hover {
    background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
    transform: translateY(-2px) scale(1.05);
  }
`;

export default function NotFound() {
  return (
    <Container>
      <ContentWrapper>
        <SvgContainer>
          <StyledSvg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="51.5 -15.288 385 505.565"
          >
            <g className="bench-legs">
              <path d="M202.778,391.666h11.111v98.611h-11.111V391.666z M370.833,390.277h11.111v100h-11.111V390.277z M183.333,456.944h11.111
        v33.333h-11.111V456.944z M393.056,456.944h11.111v33.333h-11.111V456.944z"></path>
            </g>
            <g className="top-bench">
              <path d="M396.527,397.917c0,1.534-1.243,2.777-2.777,2.777H190.972c-1.534,0-2.778-1.243-2.778-2.777v-8.333
        c0-1.535,1.244-2.778,2.778-2.778H393.75c1.534,0,2.777,1.243,2.777,2.778V397.917z M400.694,414.583
        c0,1.534-1.243,2.778-2.777,2.778H188.194c-1.534,0-2.778-1.244-2.778-2.778v-8.333c0-1.534,1.244-2.777,2.778-2.777h209.723
        c1.534,0,2.777,1.243,2.777,2.777V414.583z M403.473,431.25c0,1.534-1.244,2.777-2.778,2.777H184.028
        c-1.534,0-2.778-1.243-2.778-2.777v-8.333c0-1.534,1.244-2.778,2.778-2.778h216.667c1.534,0,2.778,1.244,2.778,2.778V431.25z"></path>
            </g>
            <g className="bottom-bench">
              <path d="M417.361,459.027c0,0.769-1.244,1.39-2.778,1.39H170.139c-1.533,0-2.777-0.621-2.777-1.39v-4.86
        c0-0.769,1.244-0.694,2.777-0.694h244.444c1.534,0,2.778-0.074,2.778,0.694V459.027z"></path>
              <path d="M185.417,443.75H400c0,0,18.143,9.721,17.361,10.417l-250-0.696C167.303,451.65,185.417,443.75,185.417,443.75z"></path>
            </g>
            <g id="lamp">
              <path className="lamp-details" d="M125.694,421.997c0,1.257-0.73,3.697-1.633,3.697H113.44c-0.903,0-1.633-2.44-1.633-3.697V84.917
        c0-1.257,0.73-2.278,1.633-2.278h10.621c0.903,0,1.633,1.02,1.633,2.278V421.997z"></path>
              <path className="lamp-accent" d="M128.472,93.75c0,1.534-1.244,2.778-2.778,2.778h-13.889c-1.534,0-2.778-1.244-2.778-2.778V79.861
        c0-1.534,1.244-2.778,2.778-2.778h13.889c1.534,0,2.778,1.244,2.778,2.778V93.75z"></path>

              <circle className="lamp-light" cx="119.676" cy="44.22" r="40.51"></circle>
              <path className="lamp-details" d="M149.306,71.528c0,3.242-13.37,13.889-29.861,13.889S89.583,75.232,89.583,71.528c0-4.166,13.369-13.889,29.861-13.889
        S149.306,67.362,149.306,71.528z"></path>
              <radialGradient className="light-gradient" id="SVGID_1_" cx="119.676" cy="44.22" r="65" gradientUnits="userSpaceOnUse">
                <stop offset="0%" style={{stopColor:"#FFFFFF", stopOpacity: 1}}></stop>
                <stop offset="50%" style={{stopColor:"#EDEDED", stopOpacity: 0.5}}>
                  <animate attributeName="stop-opacity" values="0.0; 0.5; 0.0" dur="5000ms" repeatCount="indefinite"></animate>
                </stop>
                <stop offset="100%" style={{stopColor:"#EDEDED", stopOpacity: 0}}></stop>
              </radialGradient>
              <circle className="lamp-light__glow" fill="url(#SVGID_1_)" cx="119.676" cy="44.22" r="65"></circle>
              <path className="lamp-bottom" d="M135.417,487.781c0,1.378-1.244,2.496-2.778,2.496H106.25c-1.534,0-2.778-1.118-2.778-2.496v-74.869
        c0-1.378,1.244-2.495,2.778-2.495h26.389c1.534,0,2.778,1.117,2.778,2.495V487.781z"></path>
            </g>
          </StyledSvg>
        </SvgContainer>
        
        <Title>404</Title>
        <Subtitle>Oops! Página não encontrada</Subtitle>
        <Description>
          A página que você está procurando parece ter saído do mapa. 
          Que tal voltar para casa ou explorar nossas campanhas ativas?
        </Description>
        
        <ButtonContainer>
          <PrimaryButton href="/">
            Voltar ao Início
          </PrimaryButton>
          <Button href="/campanhas">
            Ver Campanhas
          </Button>
        </ButtonContainer>
      </ContentWrapper>
    </Container>
  );
} 