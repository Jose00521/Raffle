'use client';

import React from 'react';
import styled, { keyframes, css } from 'styled-components';

interface CheckoutButtonProps {
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  isLoading?: boolean;
  children?: React.ReactNode;
}

// Animações
const slideTop = keyframes`
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-50px) rotate(90deg);
  }
  60% {
    transform: translateY(-50px) rotate(90deg);
  }
  100% {
    transform: translateY(-6px) rotate(90deg);
  }
`;

const slidePost = keyframes`
  50% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-50px);
  }
`;

const fadeInFwd = keyframes`
  0% {
    opacity: 0;
    transform: translateY(-5px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Styled Components
const CheckoutContainer = styled.button<{ $disabled?: boolean; $isLoading?: boolean }>`
  background-color: #ffffff;
  display: flex;
  width: 100%;
  min-width: 280px;
  height: 55px;
  position: relative;
  border-radius: 8px;
  transition: 0.3s ease-in-out;
  border: none;
  cursor: ${({ $disabled, $isLoading }) => ($disabled || $isLoading) ? 'not-allowed' : 'pointer'};
  overflow: hidden;
  opacity: ${({ $disabled }) => $disabled ? 0.7 : 1};
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 0;
  
  ${({ $isLoading }) => $isLoading && css`
    animation: ${subtleGlow} 2s ease-in-out infinite;
    opacity: 0.95;
  `}
  
  &:hover:not(:disabled) {
    transform: ${({ $isLoading }) => $isLoading ? 'none' : 'scale(1.03)'};
  }
  
  &:hover:not(:disabled) .left-side {
    width: ${({ $isLoading }) => $isLoading ? '110px' : '100%'};
  }
  
  &:hover:not(:disabled) .card {
    animation: ${slideTop} 1.2s cubic-bezier(0.645, 0.045, 0.355, 1) both;
  }
  
  &:hover:not(:disabled) .post {
    animation: ${slidePost} 1s cubic-bezier(0.165, 0.84, 0.44, 1) both;
  }
  
  &:hover:not(:disabled) .dollar {
    animation: ${fadeInFwd} 0.3s 1s backwards;
  }
  
  -webkit-appearance: none;
  -webkit-transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  -webkit-perspective: 1000;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000;
  
  @media (max-width: 768px) {
    min-width: 260px;
    height: 50px;
  }
  
  @media (max-width: 576px) {
    width: 100%;
    min-width: auto;
    height: 48px;
  }
  
  @media (max-width: 480px) {
    height: 45px;
    transform: scale(0.98) translateZ(0);
    
    &:hover:not(:disabled) {
      transform: ${({ $isLoading }) => $isLoading ? 'scale(0.98) translateZ(0)' : 'scale(1.01) translateZ(0)'};
    }
  }
`;

const LeftSide = styled.div<{ $isLoading?: boolean }>`
  background: ${({ $isLoading }) => $isLoading 
    ? 'linear-gradient(135deg, #5de2a3, #4dd08a, #5de2a3, #4dd08a)'
    : 'linear-gradient(135deg, #5de2a3, #4dd08a)'
  };
  background-size: ${({ $isLoading }) => $isLoading ? '300% 300%' : '100% 100%'};
  width: 110px;
  height: 100%;
  border-radius: 6px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: 0.3s;
  flex-shrink: 0;
  overflow: hidden;
  
  -webkit-transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  transform: translateZ(0);
  backface-visibility: hidden;
  
  ${({ $isLoading }) => $isLoading && css`
    opacity: 0.9;
  `}
  
  @media (max-width: 768px) {
    width: 100px;
  }
  
  @media (max-width: 576px) {
    width: 90px;
  }
  
  @media (max-width: 480px) {
    width: 85px;
  }
`;

const RightSide = styled.div<{ $isLoading?: boolean }>`
  display: flex;
  align-items: center;
  overflow: hidden;
  cursor: pointer;
  justify-content: space-between;
  white-space: nowrap;
  transition: 0.3s;
  flex: 1;
  position: relative;
  height: 100%;
  
  ${({ $isLoading }) => $isLoading && css`
    background-color: rgba(248, 255, 254, 0.5);
  `}
  
  &:hover {
    background-color: ${({ $isLoading }) => $isLoading ? 'transparent' : '#f9f7f9'};
  }
`;

const CheckoutText = styled.div`
  font-size: 14px;
  font-family: "Inter", "Lexend Deca", -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 600;
  margin-left: 16px;
  color: #2c3e50;
  letter-spacing: -0.025em;
  display: flex;
  justify-content: center;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  flex: 1;
  height: 100%;
  
  @media (max-width: 768px) {
    font-size: 13px;
    margin-left: 14px;
  }
  
  @media (max-width: 576px) {
    font-size: 12px;
    
    white-space: normal;
    line-height: 1.2;
  }
  
  @media (max-width: 480px) {
    font-size: 11px;
    margin-left: 10px;
  }
`;

const Card = styled.div`
  width: 50px;
  height: 32px;
  background: linear-gradient(135deg, #c7ffbc, #b5f7aa);
  border-radius: 5px;
  position: absolute;
  display: flex;
  z-index: 10;
  flex-direction: column;
  align-items: center;
  box-shadow: 
    6px 6px 8px -1px rgba(77, 200, 143, 0.6);
  
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  will-change: transform;
  
  @media (max-width: 768px) {
    width: 45px;
    height: 28px;
  }
  
  @media (max-width: 576px) {
    width: 40px;
    height: 26px;
  }
  
  @media (max-width: 480px) {
    width: 38px;
    height: 24px;
  }
`;

const CardLine = styled.div`
  width: 45px;
  height: 9px;
  background: linear-gradient(135deg, #80ea69, #6bd154);
  border-radius: 2px;
  margin-top: 5px;
  
  @media (max-width: 768px) {
    width: 40px;
    height: 8px;
    margin-top: 4px;
  }
  
  @media (max-width: 576px) {
    width: 35px;
    height: 7px;
    margin-top: 4px;
  }
  
  @media (max-width: 480px) {
    width: 33px;
    height: 6px;
    margin-top: 3px;
  }
`;

const Buttons = styled.div`
  width: 6px;
  height: 6px;
  background-color: #379e1f;
  box-shadow: 
    0 -7px 0 0 #26850e, 
    0 7px 0 0 #56be3e;
  border-radius: 50%;
  margin-top: 4px;
  transform: rotate(90deg);
  margin: 7px 0 0 -22px;
  
  @media (max-width: 768px) {
    width: 5px;
    height: 5px;
    box-shadow: 
      0 -6px 0 0 #26850e, 
      0 6px 0 0 #56be3e;
    margin: 6px 0 0 -20px;
  }
  
  @media (max-width: 576px) {
    width: 4px;
    height: 4px;
    box-shadow: 
      0 -5px 0 0 #26850e, 
      0 5px 0 0 #56be3e;
    margin: 5px 0 0 -18px;
  }
  
  @media (max-width: 480px) {
    width: 4px;
    height: 4px;
    margin: 5px 0 0 -16px;
  }
`;

const Post = styled.div`
  width: 45px;
  height: 55px;
  background-color: #dddde0;
  position: absolute;
  z-index: 11;
  bottom: 8px;
  top: 55px;
  border-radius: 4px;
  overflow: hidden;
  
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  will-change: transform;
  
  @media (max-width: 768px) {
    width: 40px;
    height: 50px;
    top: 50px;
  }
  
  @media (max-width: 576px) {
    width: 36px;
    height: 45px;
    top: 48px;
  }
  
  @media (max-width: 480px) {
    width: 34px;
    height: 42px;
    top: 45px;
  }
`;

const PostLine = styled.div`
  width: 34px;
  height: 6px;
  background-color: #545354;
  position: absolute;
  border-radius: 0 0 2px 2px;
  right: 6px;
  top: 6px;
  
  &::before {
    content: '';
    position: absolute;
    width: 34px;
    height: 6px;
    background-color: #757375;
    top: -6px;
  }
  
  @media (max-width: 768px) {
    width: 30px;
    height: 5px;
    right: 5px;
    top: 5px;
    
    &::before {
      width: 30px;
      height: 5px;
      top: -5px;
    }
  }
  
  @media (max-width: 576px) {
    width: 26px;
    height: 4px;
    right: 5px;
    top: 5px;
    
    &::before {
      width: 26px;
      height: 4px;
      top: -4px;
    }
  }
  
  @media (max-width: 480px) {
    width: 24px;
    height: 4px;
    right: 5px;
    top: 4px;
    
    &::before {
      width: 24px;
      height: 4px;
      top: -4px;
    }
  }
`;

const Screen = styled.div`
  width: 34px;
  height: 16px;
  background-color: #ffffff;
  position: absolute;
  top: 16px;
  right: 6px;
  border-radius: 2px;
  
  @media (max-width: 768px) {
    width: 30px;
    height: 14px;
    top: 14px;
    right: 5px;
  }
  
  @media (max-width: 576px) {
    width: 26px;
    height: 12px;
    top: 13px;
    right: 5px;
  }
  
  @media (max-width: 480px) {
    width: 24px;
    height: 11px;
    top: 12px;
    right: 5px;
  }
`;

const Numbers = styled.div`
  width: 8px;
  height: 8px;
  background-color: #838183;
  box-shadow: 
    0 -12px 0 0 #838183, 
    0 12px 0 0 #838183;
  border-radius: 1px;
  position: absolute;
  transform: rotate(90deg);
  left: 18px;
  top: 37px;
  
  @media (max-width: 768px) {
    width: 7px;
    height: 7px;
    box-shadow: 
      0 -10px 0 0 #838183, 
      0 10px 0 0 #838183;
    left: 16px;
    top: 33px;
  }
  
  @media (max-width: 576px) {
    width: 6px;
    height: 6px;
    box-shadow: 
      0 -8px 0 0 #838183, 
      0 8px 0 0 #838183;
    left: 15px;
    top: 30px;
  }
  
  @media (max-width: 480px) {
    width: 5px;
    height: 5px;
    box-shadow: 
      0 -7px 0 0 #838183, 
      0 7px 0 0 #838183;
    left: 14px;
    top: 28px;
  }
`;

const NumbersLine2 = styled.div`
  width: 8px;
  height: 8px;
  background-color: #aaa9ab;
  box-shadow: 
    0 -12px 0 0 #aaa9ab, 
    0 12px 0 0 #aaa9ab;
  border-radius: 1px;
  position: absolute;
  transform: rotate(90deg);
  left: 18px;
  top: 48px;
  
  @media (max-width: 768px) {
    width: 7px;
    height: 7px;
    box-shadow: 
      0 -10px 0 0 #aaa9ab, 
      0 10px 0 0 #aaa9ab;
    left: 16px;
    top: 42px;
  }
  
  @media (max-width: 576px) {
    width: 6px;
    height: 6px;
    box-shadow: 
      0 -8px 0 0 #aaa9ab, 
      0 8px 0 0 #aaa9ab;
    left: 15px;
    top: 38px;
  }
  
  @media (max-width: 480px) {
    width: 5px;
    height: 5px;
    box-shadow: 
      0 -7px 0 0 #aaa9ab, 
      0 7px 0 0 #aaa9ab;
    left: 14px;
    top: 35px;
  }
`;

const Dollar = styled.div`
  position: absolute;
  font-size: 12px;
  font-family: "Inter", "Lexend Deca", -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 700;
  width: 100%;
  left: 0;
  top: 0;
  color: #4b953b;
  text-align: center;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  
  @media (max-width: 768px) {
    font-size: 11px;
  }
  
  @media (max-width: 576px) {
    font-size: 10px;
  }
  
  @media (max-width: 480px) {
    font-size: 9px;
  }
`;

// Animações de Loading Profissionais
const spin = keyframes`
  0% { 
    transform: rotate(0deg);
  }
  100% { 
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
`;

const fadeIn = keyframes`
  0% {
    opacity: 0;
    transform: translateX(-10px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
`;

const subtleGlow = keyframes`
  0%, 100% {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
  50% {
    box-shadow: 0 4px 20px rgba(46, 204, 113, 0.15);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  margin-right: 12px;
  animation: ${fadeIn} 0.3s ease-out;
  
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  
  @media (max-width: 480px) {
    margin-right: 10px;
  }
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(46, 204, 113, 0.2);
  border-top: 2px solid #2ecc71;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-right: 8px;
  
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  will-change: transform;
  
  @media (max-width: 480px) {
    width: 14px;
    height: 14px;
    margin-right: 6px;
  }
`;

const LoadingText = styled.span`
  font-family: "Inter", "Lexend Deca", -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #2c3e50;
  animation: ${pulse} 2s ease-in-out infinite;
  
  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const LoadingDots = styled.span`
  font-family: "Inter", "Lexend Deca", -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #2ecc71;
  margin-left: 2px;
  animation: ${pulse} 1.5s ease-in-out infinite;
  
  &::after {
    content: '...';
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const ArrowIcon = styled.span`
  margin-right: 16px;
  font-size: 16px;
  color: #27ae60;
  font-weight: bold;
  transition: all 0.3s ease;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  height: 100%;
  
  @media (max-width: 768px) {
    font-size: 14px;
    margin-right: 14px;
  }
  
  @media (max-width: 480px) {
    font-size: 13px;
    margin-right: 12px;
  }
`;

const CheckoutButton: React.FC<CheckoutButtonProps> = ({ 
  onClick, 
  disabled = false, 
  isLoading = false,
  children = "Prosseguir para Pagamento",
  type = 'button'
}) => {
  // Texto responsivo para telas pequenas
  const [responsiveText, setResponsiveText] = React.useState(children);
  
  React.useEffect(() => {
    const updateText = () => {
      if (isLoading) {
        if (window.innerWidth <= 480) {
          setResponsiveText("Processando");
        } else if (window.innerWidth <= 576) {
          setResponsiveText("Processando");
        } else {
          setResponsiveText("Processando");
        }
        return;
      }
      
      if (window.innerWidth <= 480) {
        setResponsiveText(children === "Prosseguir para Pagamento" ? "Prosseguir para Pagamento" : children);
      } else if (window.innerWidth <= 576) {
        setResponsiveText(children === "Prosseguir para Pagamento" ? "Prosseguir para Pagamento" : children);
      } else {
        setResponsiveText(children);
      }
    };
    
    updateText();
    
    window.addEventListener('resize', updateText);
    return () => window.removeEventListener('resize', updateText);
  }, [children, isLoading]);

  return (
    <CheckoutContainer 
      onClick={type === 'submit' ? undefined : onClick}
      type={type}
      disabled={disabled || isLoading}
      $disabled={disabled || isLoading}
      $isLoading={isLoading}
    >
      <LeftSide className="left-side" $isLoading={isLoading}>
        <Card className="card">
          <CardLine />
          <Buttons />
        </Card>
        <Post className="post">
          <PostLine />
          <Screen>
            <Dollar className="dollar">$</Dollar>
          </Screen>
          <Numbers />
          <NumbersLine2 />
        </Post>
      </LeftSide>
      
      <RightSide $isLoading={isLoading}>
        <CheckoutText>
          {isLoading && (
            <LoadingContainer>
              <LoadingSpinner />
            </LoadingContainer>
          )}
          {isLoading ? (
            <>
              <LoadingText>{responsiveText}</LoadingText>
              <LoadingDots />
            </>
          ) : (
            responsiveText
          )}
        </CheckoutText>
        {!isLoading && (
          <ArrowIcon>→</ArrowIcon>
        )}
      </RightSide>
    </CheckoutContainer>
  );
};

export default CheckoutButton;