'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';

interface OptimizedSliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  updateVisuals?: (value: number) => void;
  className?: string;
}

const SliderContainer = styled.div`
  position: relative;
  width: 100%;
  height: 30px;
  padding: 10px 0;
  touch-action: pan-y;
`;

const SliderTrack = styled.div`
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 10px;
  transform: translateY(-50%);
  background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%);
  border-radius: 5px;
  will-change: transform;
`;

const SliderThumb = styled.div`
  position: absolute;
  top: 50%;
  width: 22px;
  height: 22px;
  background: #fff;
  border: 2px solid #6a11cb;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  cursor: grab;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 1;
  will-change: transform, left;
  touch-action: none;
  
  &:active {
    cursor: grabbing;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
    transform: translate(-50%, -50%) scale(1.1);
  }
  
  &.dragging {
    cursor: grabbing;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
  }
`;

const HiddenInput = styled.input`
  position: absolute;
  opacity: 0;
  pointer-events: none;
`;

const OptimizedSlider: React.FC<OptimizedSliderProps> = ({
  min,
  max,
  value,
  onChange,
  updateVisuals,
  className
}) => {
  const [localValue, setLocalValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startValueRef = useRef(0);
  const currentValueRef = useRef(value);
  const trackWidthRef = useRef(0);
  const trackLeftRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  // Sincronizar o valor props -> local state apenas quando não estamos arrastando
  useEffect(() => {
    if (!isDraggingRef.current) {
      setLocalValue(value);
      currentValueRef.current = value;
      positionThumb(value);
    }
  }, [value]);

  // Calcular e posicionar o thumb baseado no valor
  const positionThumb = useCallback((val: number) => {
    if (!thumbRef.current || !containerRef.current) return;
    
    // Calcular a posição percentual do thumb
    const percentage = ((val - min) / (max - min)) * 100;
    const boundedPercentage = Math.max(0, Math.min(100, percentage));
    
    // Aplicar a posição usando transform para melhor performance
    thumbRef.current.style.left = `${boundedPercentage}%`;
  }, [min, max]);

  // Converter posição X para valor
  const positionToValue = useCallback((posX: number): number => {
    if (trackWidthRef.current === 0) return min;
    
    const percentage = Math.max(0, Math.min(1, (posX - trackLeftRef.current) / trackWidthRef.current));
    const rawValue = min + percentage * (max - min);
    return Math.round(rawValue);
  }, [min, max]);

  // Atualizar medidas na montagem e redimensionamento
  const updateMeasurements = useCallback(() => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    trackWidthRef.current = rect.width;
    trackLeftRef.current = rect.left;
  }, []);

  useEffect(() => {
    updateMeasurements();
    window.addEventListener('resize', updateMeasurements);
    
    return () => {
      window.removeEventListener('resize', updateMeasurements);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [updateMeasurements]);

  // Iniciar arrasto
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!thumbRef.current || !containerRef.current) return;
    
    // Impedir seleção de texto durante arrasto
    e.preventDefault();
    
    // Garantir que as medidas estejam atualizadas
    updateMeasurements();
    
    // Capturar o ponteiro
    thumbRef.current.setPointerCapture(e.pointerId);
    
    // Adicionar classe visual
    thumbRef.current.classList.add('dragging');
    
    // Configurar estado de arrasto
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startValueRef.current = currentValueRef.current;
    
    // Permitir clique direto no track para mover o thumb
    if (e.currentTarget === containerRef.current) {
      const newValue = positionToValue(e.clientX);
      currentValueRef.current = newValue;
      
      // Atualizar visualização imediatamente
      animationFrameRef.current = requestAnimationFrame(() => {
        positionThumb(newValue);
        if (updateVisuals) updateVisuals(newValue);
      });
    }
  }, [updateMeasurements, positionToValue, positionThumb, updateVisuals]);

  // Mover durante arrasto
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    
    // Calcular o novo valor baseado no movimento
    const newValue = positionToValue(e.clientX);
    
    // Só atualizar se mudou (evita processamento desnecessário)
    if (newValue !== currentValueRef.current) {
      currentValueRef.current = newValue;
      
      // Cancelar frame anterior se existir
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // Usar requestAnimationFrame para limitar atualizações visuais
      animationFrameRef.current = requestAnimationFrame(() => {
        positionThumb(newValue);
        if (updateVisuals) updateVisuals(newValue);
      });
    }
  }, [positionToValue, positionThumb, updateVisuals]);

  // Finalizar arrasto
  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current || !thumbRef.current) return;
    
    // Remover captura do ponteiro
    thumbRef.current.releasePointerCapture(e.pointerId);
    
    // Remover classe visual
    thumbRef.current.classList.remove('dragging');
    
    // Finalizar estado de arrasto
    isDraggingRef.current = false;
    
    // Atualizar estado React apenas no final do arrasto
    setLocalValue(currentValueRef.current);
    onChange(currentValueRef.current);
    
    // Certificar que as atualizações visuais estão completas
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      positionThumb(currentValueRef.current);
    });
  }, [onChange, positionThumb]);

  // Cancelar arrasto (ex: escape key)
  const handlePointerCancel = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current || !thumbRef.current) return;
    
    // Liberar captura
    thumbRef.current.releasePointerCapture(e.pointerId);
    thumbRef.current.classList.remove('dragging');
    
    // Resetar para valor original
    isDraggingRef.current = false;
    currentValueRef.current = startValueRef.current;
    
    // Atualizar UI para o valor original
    setLocalValue(startValueRef.current);
    positionThumb(startValueRef.current);
    
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, [positionThumb]);

  // Posicionar o thumb na montagem inicial
  useEffect(() => {
    positionThumb(value);
  }, [value, positionThumb]);

  return (
    <SliderContainer 
      ref={containerRef} 
      className={className}
      onPointerDown={handlePointerDown}
    >
      <SliderTrack />
      <SliderThumb
        ref={thumbRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      />
      <HiddenInput 
        type="range"
        min={min}
        max={max}
        value={localValue}
        readOnly
      />
    </SliderContainer>
  );
};

export default OptimizedSlider; 