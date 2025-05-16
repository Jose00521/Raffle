import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { FaTimes, FaSpinner, FaVolumeUp, FaVolumeMute, FaShieldAlt, FaCheckCircle } from 'react-icons/fa';
import confetti from 'canvas-confetti';
import { WinnerInfo } from './WinnerDetailCard';

// Container para o confetti que fica acima de tudo
const ConfettiContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999; // Aumentar significativamente para garantir que esteja acima de tudo
  pointer-events: none; // Permitir cliques nos elementos abaixo
  overflow: hidden;
`;

// Styled components para o sorteador
const AnimationContainer = styled.div<{ $visible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(37, 117, 252, 0.95) 0%, rgba(106, 17, 203, 0.95) 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000; // Importante: deve ser menor que o z-index do ConfettiContainer (9999)
  transform: ${props => props.$visible ? 'translateY(0)' : 'translateY(100%)'};
  transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  overflow: hidden;
`;

const AnimationInner = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  max-width: 90%;
  
  h2 {
    font-size: 2rem;
    color: white;
    margin: 0;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    
    @media (max-width: 768px) {
      font-size: 1.5rem;
    }
  }
`;

const NumberAnimation = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 32px 0;
  position: relative;
  padding: 20px;
  border-radius: 20px;
  background: rgba(0, 0, 0, 0.2);
  box-shadow: 
    0 0 30px rgba(255, 255, 255, 0.1),
    inset 0 0 20px rgba(0, 0, 0, 0.3);
  
  /* Efeito de brilho em volta */
  &::before {
    content: '';
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    background: linear-gradient(45deg, 
      rgba(255, 255, 255, 0.1) 0%, 
      rgba(255, 255, 255, 0) 50%, 
      rgba(255, 255, 255, 0.1) 100%
    );
    border-radius: 25px;
    z-index: -1;
    animation: glow 3s infinite alternate;
  }
  
  @keyframes glow {
    0% { opacity: 0.3; }
    100% { opacity: 1; }
  }
  
  @media (max-width: 768px) {
    gap: 10px;
    padding: 15px;
  }
`;

const SlotMachine = styled.div<{ $stopping?: boolean; $index?: number }>`
  width: 80px;
  height: 120px;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  box-shadow: ${props => {
    if (props.$stopping) {
      // Intensified lighting effect when stopping
      return `0 0 25px rgba(255, 255, 255, 0.8), 
              0 10px 30px rgba(0, 0, 0, 0.3)`;
    }
    return '0 10px 30px rgba(0, 0, 0, 0.3)';
  }};
  transition: box-shadow 0.5s ease, transform 0.3s ease;
  transform: ${props => props.$stopping ? 'scale(1.05)' : 'scale(1)'};
  
  /* Linhas de destaque superior e inferior */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.15) 0%,
      rgba(255, 255, 255, 0.05) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    pointer-events: none;
    z-index: 1;
  }
  
  /* Efeito de destaque nos cantos */
  &::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 40px;
    transform: translateY(-50%);
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 
      0 -1px 8px rgba(255, 255, 255, 0.3),
      0 1px 8px rgba(255, 255, 255, 0.3),
      inset 0 0 15px rgba(255, 255, 255, 0.3);
    z-index: 1;
    pointer-events: none;
    border-top: 1px solid rgba(255, 255, 255, 0.8);
    border-bottom: 1px solid rgba(255, 255, 255, 0.8);
  }
  
  @media (max-width: 768px) {
    width: 50px;
    height: 80px;
  }
`;

const SlotReel = styled.div<{ $status: 'spinning' | 'stopping' | 'stopped'; $finalPosition: number; $index: number }>`
  position: absolute;
  top: ${props => props.$status === 'stopped' ? `-${props.$finalPosition * 100}%` : '0'};
  left: 0;
  width: 100%;
  height: 1000%;  // 10 números × 100% cada
  display: flex;
  flex-direction: column;
  transition: ${props => props.$status === 'stopping' ? `top ${1.2 + (props.$index * 0.2)}s cubic-bezier(0.34, 1.56, 0.64, 1)` : 'none'};
  animation: ${props => {
    if (props.$status === 'spinning') {
      const direction = props.$index % 2 === 0 ? 'spinUp' : 'spinDown';
      const delay = props.$index * 0.15;
      const duration = 2.0 - (props.$index * 0.1);
      return `${direction} ${duration}s ${delay}s infinite linear`;
    }
    return 'none';
  }};
  will-change: transform;
  
  /* Adiciona um pequeno efeito de bouncing quando para */
  &.bounce {
    animation: ${props => {
      if (props.$status === 'stopping') {
        return 'bounce 0.5s ease-out';
      }
      return 'none';
    }};
  }
  
  @keyframes bounce {
    0% { transform: translateY(0); }
    25% { transform: translateY(-5%); }
    50% { transform: translateY(3%); }
    75% { transform: translateY(-2%); }
    100% { transform: translateY(0); }
  }
  
  @keyframes spinUp {
    0% { transform: translateY(0); }
    100% { transform: translateY(-100%); } /* Uma rotação completa para cima */
  }
  
  @keyframes spinDown {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(0); } /* Uma rotação completa para baixo */
  }
`;

const SlotDigit = styled.div`
  height: 10%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.5rem;
  font-weight: 800;
  color: white;
  text-shadow: 
    0 2px 5px rgba(0, 0, 0, 0.5),
    0 0 10px rgba(255, 255, 255, 0.5);
  user-select: none;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const SlotMask = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  height: 40%;
  pointer-events: none;
  z-index: 3;
  
  &.top {
    top: 0;
    background: linear-gradient(to bottom, 
      rgba(0, 0, 0, 0.9) 0%,
      rgba(0, 0, 0, 0.5) 40%,
      transparent 100%
    );
  }
  
  &.bottom {
    bottom: 0;
    background: linear-gradient(to top, 
      rgba(0, 0, 0, 0.9) 0%,
      rgba(0, 0, 0, 0.5) 40%,
      transparent 100%
    );
  }
`;

const CloseModalButton = styled.button`
  position: absolute;
  right: 20px;
  top: 20px;
  background: rgba(0, 0, 0, 0.3);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  font-size: 1.2rem;
  z-index: 10;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.5);
    transform: scale(1.1);
  }
`;

const SoundControlButton = styled.button`
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.3);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  font-size: 1.2rem;
  z-index: 10;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.5);
    transform: scale(1.1);
  }
`;

const SecurityBadge = styled.div`
  background: rgba(16, 185, 129, 0.9);
  color: white;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  position: absolute;
  bottom: 25px;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.4);
  max-width: 90%;
  text-align: center;
  line-height: 1.4;
  letter-spacing: 0.3px;
  z-index: 20;
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0% {
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.6);
    }
    50% {
      box-shadow: 0 4px 20px rgba(16, 185, 129, 0.9);
    }
    100% {
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.6);
    }
  }
  
  svg {
    font-size: 1.3rem;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, 
      rgba(255, 255, 255, 0.3) 0%, 
      rgba(255, 255, 255, 0) 100%
    );
    border-radius: 8px;
    z-index: -1;
  }
`;

export interface SlotMachineDrawerProps {
  isVisible: boolean;
  drawMethod: 'automatic' | 'manual';
  digitCount: number;
  manualNumber?: string;
  onClose: () => void;
  onWinnerFound?: (winner: WinnerInfo) => void;
}

const SlotMachineDrawer: React.FC<SlotMachineDrawerProps> = ({
  isVisible,
  drawMethod,
  digitCount,
  manualNumber = '',
  onClose,
  onWinnerFound
}) => {
  const confettiRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const confettiInstance = useRef<any>(null);
  const hasInitializedRef = useRef<boolean>(false);
  
  // Audio refs
  const spinningAudioRef = useRef<HTMLAudioElement | null>(null);
  const stopDigitAudioRef = useRef<HTMLAudioElement | null>(null);
  const winnerAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Estados
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [animationText, setAnimationText] = useState('');
  const [digitAnimations, setDigitAnimations] = useState<number[]>([]);
  const [spinCompleted, setSpinCompleted] = useState(false);
  const [digitStopDelay, setDigitStopDelay] = useState(0);
  
  // Initialize audio elements on component mount
  useEffect(() => {
    // Create audio elements if they don't exist
    try {
      console.log('Tentando carregar arquivos de áudio...');
      if (!spinningAudioRef.current) {
        spinningAudioRef.current = new Audio('/sounds/spinning.mp3');
        spinningAudioRef.current.loop = true;
        spinningAudioRef.current.volume = 0.6;
        console.log('Arquivo spinning.mp3 carregado');
      }
      
      if (!stopDigitAudioRef.current) {
        stopDigitAudioRef.current = new Audio('/sounds/stop-digit.mp3');
        stopDigitAudioRef.current.volume = 0.7;
        console.log('Arquivo stop-digit.mp3 carregado');
      }
      
      if (!winnerAudioRef.current) {
        winnerAudioRef.current = new Audio('/sounds/winner.mp3');
        winnerAudioRef.current.volume = 0.8;
        console.log('Arquivo winner.mp3 carregado');
      }

      // Preload the audio files
      spinningAudioRef.current.load();
      stopDigitAudioRef.current.load();
      winnerAudioRef.current.load();
    } catch (error) {
      console.warn('Error loading audio files:', error);
      // Reset audio refs to null if they couldn't be loaded
      spinningAudioRef.current = null;
      stopDigitAudioRef.current = null;
      winnerAudioRef.current = null;
    }
    
    // Cleanup function to stop and release audio
    return () => {
      if (spinningAudioRef.current) {
        spinningAudioRef.current.pause();
        spinningAudioRef.current.currentTime = 0;
      }
      
      if (stopDigitAudioRef.current) {
        stopDigitAudioRef.current.pause();
        stopDigitAudioRef.current.currentTime = 0;
      }
      
      if (winnerAudioRef.current) {
        winnerAudioRef.current.pause();
        winnerAudioRef.current.currentTime = 0;
      }
    };
  }, []);
  
  // Handle visibility changes to start/stop audio
  useEffect(() => {
    if (isVisible) {
      // If drawer becomes visible, play the spinning sound
      if (drawMethod === 'automatic' && spinningAudioRef.current) {
        spinningAudioRef.current.play().catch(err => {
          console.warn('Could not play spinning sound:', err);
          // Silently fail - sound isn't critical to the user experience
        });
      }
    } else {
      // If drawer is hidden, pause all sounds
      if (spinningAudioRef.current) {
        spinningAudioRef.current.pause();
        spinningAudioRef.current.currentTime = 0;
      }
      
      if (stopDigitAudioRef.current) {
        stopDigitAudioRef.current.pause();
        stopDigitAudioRef.current.currentTime = 0;
      }
      
      if (winnerAudioRef.current) {
        winnerAudioRef.current.pause();
        winnerAudioRef.current.currentTime = 0;
      }
    }
  }, [isVisible, drawMethod]);
  
  // Play digit stop sound when digitStopDelay changes
  useEffect(() => {
    if (digitStopDelay > 0 && stopDigitAudioRef.current) {
      // Clone the audio for overlapping sounds
      try {
        const clonedAudio = stopDigitAudioRef.current.cloneNode(true) as HTMLAudioElement;
        
        // Increase pitch slightly for each subsequent digit to create tension
        const rate = 1 + (digitStopDelay * 0.05);
        clonedAudio.playbackRate = rate;
        
        // Play the sound
        clonedAudio.play().catch(err => {
          console.warn('Could not play stop digit sound:', err);
          // Silently fail - sound isn't critical to the user experience
        });
        
        // Cleanup the cloned audio after it plays
        clonedAudio.addEventListener('ended', () => {
          clonedAudio.remove();
        });
      } catch (error) {
        console.warn('Error cloning audio:', error);
      }
    }
  }, [digitStopDelay]);
  
  // Mock winner (em produção seria buscado do backend)
  const mockWinner: WinnerInfo = {
    name: "Rafael Oliveira",
    phone: "(11) 98765-4321",
    email: "rafael@email.com",
    address: "Rua das Flores, 123 - São Paulo, SP",
    numbers: ["512", "513", "514"],
    winningNumber: "513",
    purchaseDate: new Date(2023, 8, 5, 14, 30)
  };
  
  // Gera um array de números aleatórios para o resultado do sorteio
  const generateRandomWinningNumbers = () => {
    const maxNumber = Math.pow(10, digitCount) - 1;
    const randomNumber = Math.floor(Math.random() * maxNumber) + 1;
    
    // Converte para string e preenche com zeros à esquerda
    const paddedNumber = randomNumber.toString().padStart(digitCount, '0');
    
    // Converte cada caractere para número e retorna como array
    return paddedNumber.split('').map(Number);
  };
  
  // Inicializa os dígitos quando o componente se torna visível
  useEffect(() => {
    if (!isVisible || hasInitializedRef.current) return;
    
    hasInitializedRef.current = true;
    
    setDigitAnimations(Array(digitCount).fill(0));
    setSpinCompleted(false);
    setDigitStopDelay(0);
    
    // Se for sorteio automático, inicia automaticamente
    if (drawMethod === 'automatic') {
      handleAutomaticDraw();
    } else if (drawMethod === 'manual' && manualNumber) {
      handleManualDraw();
    }
  }, [isVisible]);
  
  // Reset do estado quando o modal fecha
  useEffect(() => {
    if (!isVisible) {
      hasInitializedRef.current = false;
    }
  }, [isVisible]);
  
  // Inicializa o canvas confetti
  useEffect(() => {
    if (confettiRef.current && !canvasRef.current) {
      // Criar o canvas para o confetti
      const canvas = document.createElement('canvas');
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '9999';
      
      // Adicionar o canvas ao container
      confettiRef.current.appendChild(canvas);
      canvasRef.current = canvas;
      
      // Criar a instância do confetti
      confettiInstance.current = confetti.create(canvas, {
        resize: true,
        useWorker: true
      });
    }
    
    return () => {
      // Limpar o canvas quando o componente for desmontado
      if (canvasRef.current && confettiRef.current) {
        confettiRef.current.removeChild(canvasRef.current);
        canvasRef.current = null;
      }
    };
  }, []);
  
  // Função auxiliar para criar confetti mais intenso e visível
  const triggerConfetti = useCallback((options: any = {}) => {
    if (!confettiInstance.current) return;

    const defaultOptions = {
      particleCount: 80,
      spread: 70,
      origin: { x: 0.5, y: 0.3 },
      colors: ['#6a11cb', '#2575fc', '#f59e0b', '#10b981', '#ffffff'],
      disableForReducedMotion: true,
      shapes: ['circle', 'square']
    };

    confettiInstance.current({
      ...defaultOptions,
      ...options
    });
  }, []);

  // Explosão de confetti em vários ângulos para um efeito mais impressionante
  const triggerWinnerConfetti = useCallback(() => {
    // Explosão central
    triggerConfetti({
      particleCount: 150,
      spread: 90,
      startVelocity: 45
    });

    // Explosões laterais com pequeno delay
    setTimeout(() => {
      triggerConfetti({
        particleCount: 100,
        angle: 60,
        spread: 50,
        origin: { x: 0.2, y: 0.5 }
      });
    }, 150);

    setTimeout(() => {
      triggerConfetti({
        particleCount: 100,
        angle: 120,
        spread: 50,
        origin: { x: 0.8, y: 0.5 }
      });
    }, 300);

    // Chuva de confetti de cima
    setTimeout(() => {
      triggerConfetti({
        particleCount: 200,
        angle: 90,
        spread: 180,
        origin: { x: 0.5, y: 0 },
        gravity: 1
      });
    }, 500);
  }, [triggerConfetti]);
  
  // Inicia o sorteio automático
  const handleAutomaticDraw = () => {
    setAnimationText('Sorteando o número vencedor...');
    
    // Gerar o número vencedor ANTES de iniciar a animação
    const winningDigits = generateRandomWinningNumbers();
    
    // IMPORTANTE: Já definimos o número vencedor desde o início
    // para evitar que os números "pulem" durante a animação
    setDigitAnimations(winningDigits);
    
    // Após um tempo, começar a parar os reels em sequência
    setTimeout(() => {
      // Indicar que o spin está terminando
      setSpinCompleted(true);
      
      // Controlar a sequência de parada com delays
      const stopSequence = () => {
        // Efeito de suspense antes da primeira parada
        setTimeout(() => {
          setAnimationText('Os dígitos estão chegando...');
        }, 1000);
        
        // Loop para parar um dígito de cada vez, com intervalos progressivos
        const stopDigits = () => {
          // Aumentar progressivamente o tempo entre as paradas de cada dígito
          // para criar mais suspense nos últimos dígitos
          const baseDelay = 1000;
          
          // Para criar mais suspense, aumentamos exponencialmente o tempo 
          // entre as paradas dos últimos dígitos
          for (let i = 0; i < digitCount; i++) {
            // Os últimos dígitos têm um delay significativamente maior
            // Fator multiplicador que cresce exponencialmente para os últimos dígitos
            const suspenseFactor = Math.pow(1.4, i);
            const delay = baseDelay + (i * 600 * suspenseFactor);
            
            setTimeout(() => {
              setDigitStopDelay(i + 1);
              
              // Mensagens mais dramáticas conforme se aproxima do final
              if (i === 0) {
                setAnimationText('Primeiro dígito definido!');
              } else if (i === digitCount - 1) {
                // Para o último dígito, mantemos a mesma mensagem que já foi definida
                // ao final do penúltimo dígito, mas com mais efeitos visuais
                
                // Efeitos especiais adicionais para o último dígito
                if (confettiRef.current) {
                  // Efeito preliminar para construir o suspense
                  confettiInstance.current({
                    particleCount: 30,
                    spread: 50,
                    origin: { x: 0.5, y: 0.3 },
                    colors: ['#f59e0b'],
                    gravity: 0.7
                  });
                }
                
                // Stop the spinning sound when the last digit stops
                if (spinningAudioRef.current) {
                  spinningAudioRef.current.pause();
                  spinningAudioRef.current.currentTime = 0;
                }
              } else if (i === digitCount - 2) {
                setAnimationText('Penúltimo dígito definido!');
                
                // Importante: logo após terminar de definir o penúltimo dígito,
                // já mudamos o texto para anunciar o último dígito
                setTimeout(() => {
                  setAnimationText('Último dígito chegando... Momento decisivo!');
                }, 1200); // Pequeno atraso para dar tempo do penúltimo dígito terminar visualmente
              } else {
                setAnimationText(`${i + 1}º dígito definido!`);
              }
              
              // Efeito de confetti com intensidade crescente a cada dígito
              if (confettiRef.current) {
                confettiInstance.current({
                  particleCount: 15 + (i * 15),
                  spread: 40 + (i * 15),
                  origin: { x: 0.3 + (i * 0.1), y: 0.3 },
                  colors: ['#6a11cb', '#2575fc', '#f59e0b'].slice(0, i + 1),
                  gravity: 0.8 + (i * 0.1),
                  zIndex: 9999
                });
              }
              
              // No handleAutomaticDraw, quando o último dígito para:
              if (i === digitCount - 1) {
                setTimeout(() => {
                  // Grande efeito de confetti para o último dígito
                  triggerConfetti({
                    particleCount: 150,
                    spread: 100,
                    gravity: 1.2
                  });
                  
                  // Atualizar texto
                  setAnimationText('Número sorteado! Buscando ganhador...');
                  
                  // Após um tempo, mostrar o ganhador
                  setTimeout(() => {
                    // Explosão final de confetti em várias direções
                    triggerWinnerConfetti();
                    
                    // Play winner sound
                    if (winnerAudioRef.current) {
                      winnerAudioRef.current.play().catch(err => {
                        console.warn('Could not play winner sound:', err);
                        // Silently fail - sound isn't critical to the user experience
                      });
                    }
                    
                    // Notificar a página sobre o ganhador e fechar a animação
                    setTimeout(() => {
                      if (onWinnerFound) {
                        onWinnerFound(mockWinner);
                      }
                      
                      // Fechar a animação após um breve momento
                      setTimeout(() => {
                        onClose();
                      }, 1500);
                    }, 1200);
                  }, 2000);
                }, 800);
              }
            }, delay);
          }
        };
        
        // Iniciar sequência de parada
        stopDigits();
      };
      
      // Iniciar a sequência de parada
      stopSequence();
    }, 3000); // Tempo total de giro antes de iniciar parada
  };
  
  // Inicia o sorteio manual
  const handleManualDraw = () => {
    setAnimationText('Verificando o número sorteado...');
    
    // Para sorteio manual, mostrar os dígitos informados
    // Garantir que o número tenha a quantidade certa de dígitos
    const digits = manualNumber.padStart(digitCount, '0').split('').map(Number);
    setDigitAnimations(digits);
    
    // Em sorteio manual, já começamos com os dígitos parados
    setSpinCompleted(true);
    
    // Simulação da verificação com sequência de etapas
    setTimeout(() => {
      setAnimationText('Verificando número informado...');
      
      // Verificar cada dígito sequencialmente
      const verifyDigitsSequence = () => {
        for (let i = 0; i < digitCount; i++) {
          setTimeout(() => {
            // Play stop digit sound for each digit verification
            if (stopDigitAudioRef.current) {
              const clonedAudio = stopDigitAudioRef.current.cloneNode(true) as HTMLAudioElement;
              clonedAudio.volume = 0.5; // Slightly lower volume for manual mode
              clonedAudio.playbackRate = 1 + (i * 0.1); // Increasing pitch
              clonedAudio.play().catch(err => {
                console.warn('Could not play winner sound:', err);
                // Silently fail - sound isn't critical to the user experience
              });
            }
            
            if (i === 0) {
              setAnimationText('Verificando primeiro dígito...');
            } else if (i === digitCount - 1) {
              // Para o último dígito, a mensagem já foi definida após o penúltimo
            } else if (i === digitCount - 2) {
              setAnimationText(`Verificando ${i + 1}º dígito (penúltimo)...`);
              
              // Depois de verificar o penúltimo, já anunciamos o último
              setTimeout(() => {
                setAnimationText('Verificando o último dígito... Momento decisivo!');
              }, 800); // Tempo para processar visualmente o penúltimo dígito
            } else {
              setAnimationText(`Verificando ${i + 1}º dígito...`);
            }
            
            // Pequeno efeito quando verifica cada dígito
            if (confettiRef.current && i > 0) {
              confettiInstance.current({
                particleCount: 10 + (i * 5),
                spread: 30,
                origin: { x: 0.4 + (i * 0.1), y: 0.3 },
                colors: ['#6a11cb', '#f59e0b'],
                zIndex: 9999
              });
            }
            
            // No último dígito mostrar a confirmação
            if (i === digitCount - 1) {
              setTimeout(() => {
                setAnimationText('Número confirmado! Buscando ganhador...');
                
                // Efeito de confetti mais intenso na confirmação final
                confettiInstance.current({
                  particleCount: 80,
                  spread: 90
                });
                
                // Depois de um tempo, mostrar o ganhador
                // Importante: esperar mais tempo para garantir que a verificação visual termine
                setTimeout(() => {
                  // Grande explosão de confetti para o resultado final
                  triggerWinnerConfetti();
                  
                  // Play winner sound
                  if (winnerAudioRef.current) {
                    winnerAudioRef.current.play().catch(err => {
                      console.warn('Could not play winner sound:', err);
                      // Silently fail - sound isn't critical to the user experience
                    });
                  }
                  
                  // Notificar a página sobre o ganhador e fechar a animação
                  setTimeout(() => {
                    if (onWinnerFound) {
                      onWinnerFound(mockWinner);
                    }
                    
                    // Fechar a animação após um breve momento
                    setTimeout(() => {
                      onClose();
                    }, 1500);
                  }, 1000);
                }, 2000);
              }, 1000);
            }
          }, 600 * (i + 1));
        }
      };
      
      verifyDigitsSequence();
    }, 1000);
  };
  
  // Adicionar este useEffect para ajustar o body quando o confetti estiver sendo exibido
  useEffect(() => {
    if (isVisible) {
      // Garantir que o body não bloqueie o confetti
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Restaurar o overflow quando o componente for desmontado
        document.body.style.overflow = '';
      };
    }
  }, [isVisible]);
  
  // Funu00e7u00e3o para ligar/desligar o som
  const toggleSound = () => {
    setIsSoundEnabled(prev => !prev);
  };
  
  // Renderiza o componente
  return (
    <>
      <AnimationContainer $visible={isVisible}>
        <CloseModalButton onClick={onClose}>
          <FaTimes />
        </CloseModalButton>
        
        <SoundControlButton onClick={toggleSound}>
          {isSoundEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
        </SoundControlButton>
        
        <SecurityBadge>
          <FaShieldAlt /> Algoritmo 100% auditado e certificado com Trust Draw™
        </SecurityBadge>
        
        <AnimationInner>
          <h2>{animationText}</h2>
          
          <NumberAnimation>
            {digitAnimations.map((finalDigit, index) => (
              <SlotMachine 
                key={index}
                $stopping={spinCompleted && digitStopDelay === index + 1}
                $index={index}
              >
                {/* Máscaras de sombreamento */}
                <SlotMask className="top" />
                <SlotMask className="bottom" />
                
                {/* Rolo de números */}
                <SlotReel
                  $status={
                    drawMethod === 'manual' 
                      ? 'stopped' 
                      : (spinCompleted && digitStopDelay > index)
                        ? 'stopped' 
                        : spinCompleted && digitStopDelay === index + 1
                          ? 'stopping'
                          : 'spinning'
                  }
                  $finalPosition={finalDigit}
                  $index={index}
                  className={spinCompleted && digitStopDelay === index + 1 ? 'bounce' : ''}
                >
                  {/* Números de 0-9 */}
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <SlotDigit key={num}>
                      {num}
                    </SlotDigit>
                  ))}
                </SlotReel>
              </SlotMachine>
            ))}
          </NumberAnimation>
        </AnimationInner>
      </AnimationContainer>
      
      {/* Container separado para o confetti que fica acima de tudo - posicionado por último no DOM para garantir que esteja no topo */}
      <ConfettiContainer ref={confettiRef} />
    </>
  );
};

export default SlotMachineDrawer; 