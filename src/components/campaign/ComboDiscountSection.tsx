'use client';

import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { FaPercentage, FaInfoCircle, FaTrashAlt, FaPlusCircle, FaEdit, FaCheck } from 'react-icons/fa';
import { Control, UseFormWatch, useForm, Controller, UseFormSetValue } from 'react-hook-form';
import { RaffleFormData } from '@/components/campaign/RaffleFormFields';
import { RaffleFormUpdateData } from './update-form/types';
import { formatCurrency } from '@/utils/formatters';

// Interface para representar um pacote de números
interface Package {
  name: string;
  description?: string;
  quantity: number;
  price: number;
  discount: number;
  isActive: boolean;
  highlight: boolean;
  order: number;
  maxPerUser?: number;
}

// Interface com as propriedades mínimas necessárias
interface FormDataBase {
  enablePackages?: boolean;
  numberPackages?: Package[];
  individualNumberPrice?: number;
}

// Interface para as props do componente
interface ComboDiscountSectionProps {
  control: Control<any>;
  watch: UseFormWatch<any>;
  initialData: Partial<FormDataBase>;
  isSubmitting?: boolean;
}

// Styled components
const ComboDiscountContainer = styled.div`
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
`;

const ComboSectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const ComboTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ComboDescription = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  margin: 0;
  max-width: 500px;
`;

const ToggleComboContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
  border: 1px solid rgba(106, 17, 203, 0.1);
  padding: 16px 20px;
  border-radius: 10px;
  background-color: rgba(106, 17, 203, 0.02);
  
  @media (max-width: 768px) {
    margin-bottom: 24px;
    padding: 14px 16px;
  }
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
    
    &:checked + span {
      background-color: #6a11cb;
    }
    
    &:checked + span:before {
      transform: translateX(24px);
    }
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;
  
  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
`;

const ToggleLabel = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

const CombosBuilderContainer = styled.div`
  margin-top: 24px;
`;

const ComboVisualizer = styled.div`
  background-color: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ theme }) => theme.colors?.gradients?.purple || 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)'};
    opacity: 0.8;
  }
  
  &:hover {
    box-shadow: 0 6px 30px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 14px;
  }
  
  @media (max-width: 480px) {
    padding: 18px;
    border-radius: 12px;
  }
`;

const ComboVisualizerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const ComboPriceInfo = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  display: flex;
  align-items: center;
  gap: 10px;
  
  span {
    font-size: 0.9rem;
    font-weight: 500;
    color: #666;
  }
  
  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`;

const ComboInfoText = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    color: #6a11cb;
    font-size: 1rem;
  }
`;

const ComboCardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

const ComboCard = styled.div`
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  border: 2px solid transparent;
  padding: 20px;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(106, 17, 203, 0.15);
    border-color: rgba(106, 17, 203, 0.3);
  }
`;

const ComboCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const ComboQuantity = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #333;
`;

const EditableQuantity = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const QuantityDisplay = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #333;
  min-width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  
  &:hover {
    color: #6a11cb;
  }
`;

const QuantityInput = styled.input`
  width: 80px;
  font-size: 1rem;
  font-weight: 700;
  color: #333;
  padding: 5px;
  border: 1px solid #6a11cb;
  border-radius: 6px;
  text-align: center;
  background-color: white;
`;

const ComboDiscount = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
  position: relative;
`;

const DiscountLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #666;
`;

const DiscountSlider = styled.input`
  width: 100%;
  height: 10px;
  -webkit-appearance: none;
  appearance: none;
  background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%);
  border-radius: 5px;
  outline: none;
  transition: all 0.3s ease;
  margin: 8px 0;
  will-change: transform;
  touch-action: none;
  cursor: grab;
  
  &::-webkit-slider-runnable-track {
    width: 100%;
    height: 10px;
    cursor: pointer;
    background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%);
    border-radius: 5px;
  }
  
  &::-webkit-slider-thumb {
    width: 22px;
    height: 22px;
    background: #fff;
    border: 2px solid #6a11cb;
    border-radius: 50%;
    cursor: pointer;
    -webkit-appearance: none;
    margin-top: -6px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    will-change: transform;
  }
  
  &::-moz-range-track {
    width: 100%;
    height: 10px;
    cursor: pointer;
    background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%);
    border-radius: 5px;
  }
  
  &::-moz-range-thumb {
    width: 22px;
    height: 22px;
    background: #fff;
    border: 2px solid #6a11cb;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    will-change: transform;
  }
`;

const DiscountBadge = styled.div<{ $percentage: number }>`
  background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 70px;
`;

const ComboPriceCalculation = styled.div`
  margin: 15px 0;
  padding: 15px 0;
  border-top: 1px dashed rgba(0, 0, 0, 0.1);
  border-bottom: 1px dashed rgba(0, 0, 0, 0.1);
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const PriceLabel = styled.div``;

const PriceValue = styled.div`
  font-weight: 600;
`;

const DiscountedValue = styled.div`
  font-weight: 700;
  color: #6a11cb;
  font-size: 1rem;
`;

const SavingsValue = styled.div`
  color: #10b981;
  font-weight: 600;
`;

const ComboActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
`;

const ComboActionButton = styled.button<{ $variant?: 'danger' | 'default' | 'primary' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: ${props => {
    if (props.$variant === 'danger') return 'rgba(239, 68, 68, 0.1)';
    if (props.$variant === 'primary') return 'rgba(106, 17, 203, 0.1)';
    return 'transparent';
  }};
  color: ${props => {
    if (props.$variant === 'danger') return '#ef4444';
    if (props.$variant === 'primary') return '#6a11cb';
    return '#6b7280';
  }};
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => {
      if (props.$variant === 'danger') return 'rgba(239, 68, 68, 0.15)';
      if (props.$variant === 'primary') return 'rgba(106, 17, 203, 0.15)';
      return 'rgba(0, 0, 0, 0.05)';
    }};
    transform: translateY(-2px);
  }
  
  svg {
    font-size: 0.95rem;
  }
`;

const QuantityPicker = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const QuantityButton = styled.button`
  background: rgba(106, 17, 203, 0.1);
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 600;
  color: #6a11cb;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(106, 17, 203, 0.2);
    transform: scale(1.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ComboPreview = styled.div`
  background-color: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ theme }) => theme.colors?.gradients?.purple || 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)'};
    opacity: 0.8;
  }
  
  &:hover {
    box-shadow: 0 6px 30px rgba(0, 0, 0, 0.1);
  }
`;

const ComboPreviewTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    color: #6a11cb;
  }
`;

const ComboPreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ComboPreviewItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  
  &:last-child {
    border-bottom: none;
  }
`;

const ComboPreviewBadge = styled.div<{ $percentage: number }>`
  background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 70px;
`;

const ComboPreviewQuantity = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #333;
`;

const ComboPreviewLabel = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  color: #666;
`;

const ComboPreviewPrice = styled.div`
  font-size: 0.9rem;
  font-weight: 700;
  color: #6a11cb;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ComboPreviewOriginalPrice = styled.div`
  text-decoration: line-through;
  font-weight: 400;
  color: #666;
`;

const ComboPreviewDiscountedPrice = styled.div`
  font-weight: 700;
`;

const AddComboButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, rgba(106, 17, 203, 0.1) 0%, rgba(37, 117, 252, 0.1) 100%);
  border: none;
  border-radius: 12px;
  padding: 20px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #6a11cb;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(106, 17, 203, 0.1);
  height: 100%;
  
  &:hover {
    background: linear-gradient(135deg, rgba(106, 17, 203, 0.15) 0%, rgba(37, 117, 252, 0.15) 100%);
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(106, 17, 203, 0.15);
  }
  
  svg {
    font-size: 1.2rem;
  }
`;

const ComboName = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #6a11cb;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const EditableName = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const NameInput = styled.input`
  font-size: 1rem;
  font-weight: 600;
  padding: 6px 10px;
  border: 1px solid rgba(106, 17, 203, 0.3);
  border-radius: 6px;
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: #6a11cb;
    box-shadow: 0 0 0 2px rgba(106, 17, 203, 0.1);
  }
`;

const ComboDiscountSection: React.FC<ComboDiscountSectionProps> = ({
  control,
  watch,
  initialData,
  isSubmitting = false
}) => {
  // Estado para acompanhar qual quantidade está sendo editada
  const [editingQuantityIndex, setEditingQuantityIndex] = useState<number | null>(null);
  const [tempQuantity, setTempQuantity] = useState<string>("");
  const quantityInputRef = useRef<HTMLInputElement>(null);
  
  // Estado para acompanhar qual nome está sendo editado
  const [editingNameIndex, setEditingNameIndex] = useState<number | null>(null);
  const [tempName, setTempName] = useState<string>("");
  const nameInputRef = useRef<HTMLInputElement>(null);
  
  // Refs para o slider
  const slidersRef = useRef<{[key: number]: HTMLInputElement}>({});
  const sliderValuesRef = useRef<{[key: number]: number}>({});
  const isDraggingRef = useRef<boolean>(false);
  
  // Estado para armazenar valores temporários do slider para feedback visual
  const [tempSliderValues, setTempSliderValues] = useState<Record<number, number>>({});
  
  // Preço individual usado em vários cálculos
  const individualNumberPrice = watch('individualNumberPrice') || 0;
  
  // Calcula o preço com desconto
  const calculateDiscountedPrice = (quantity: number, discount: number): number => {
    return individualNumberPrice * quantity * (1 - discount / 100);
  };
  
  // Calcula a economia
  const calculateSavings = (quantity: number, discount: number): number => {
    return individualNumberPrice * quantity * (discount / 100);
  };

  // Função para iniciar a edição da quantidade
  const startEditingQuantity = (index: number, currentValue: number) => {
    setEditingQuantityIndex(index);
    setTempQuantity(currentValue.toString());
    setTimeout(() => {
      if (quantityInputRef.current) {
        quantityInputRef.current.focus();
        quantityInputRef.current.select();
      }
    }, 10);
  };

  // Função para iniciar a edição do nome
  const startEditingName = (index: number, currentValue: string) => {
    setEditingNameIndex(index);
    setTempName(currentValue);
    setTimeout(() => {
      if (nameInputRef.current) {
        nameInputRef.current.focus();
        nameInputRef.current.select();
      }
    }, 10);
  };

  // Função para salvar a quantidade editada
  const saveQuantityEdit = (field: any, index: number) => {
    const quantity = parseInt(tempQuantity);
    if (!isNaN(quantity) && quantity >= 2) {
      const newCombos = [...field.value];
      newCombos[index].quantity = quantity;
      newCombos[index].price = calculateDiscountedPrice(quantity, newCombos[index].discount);
      field.onChange(newCombos);
    }
    setEditingQuantityIndex(null);
  };
  
  // Função para salvar o nome editado
  const saveNameEdit = (field: any, index: number) => {
    if (tempName.trim()) {
      const newCombos = [...field.value];
      newCombos[index].name = tempName.trim();
      field.onChange(newCombos);
    }
    setEditingNameIndex(null);
  };

  // Função para cancelar a edição da quantidade
  const cancelQuantityEdit = () => {
    setEditingQuantityIndex(null);
  };
  
  // Função para cancelar a edição do nome
  const cancelNameEdit = () => {
    setEditingNameIndex(null);
  };

  return (
    <ComboDiscountContainer>
      <ComboSectionHeader>
        <ComboTitle>
          <FaPercentage /> Combos com Desconto
        </ComboTitle>
        <ComboDescription>
          Ofereça descontos para quem comprar múltiplos números de uma vez
        </ComboDescription>
      </ComboSectionHeader>
      
      <Controller
        name="enablePackages"
        control={control}
        defaultValue={initialData.enablePackages || false}
        render={({ field }) => (
          <ToggleComboContainer>
            <ToggleSwitch>
              <input
                type="checkbox"
                checked={field.value}
                onChange={e => field.onChange(e.target.checked)}
                disabled={isSubmitting}
              />
              <ToggleSlider />
            </ToggleSwitch>
            <ToggleLabel>
              Ativar combos com desconto
            </ToggleLabel>
          </ToggleComboContainer>
        )}
      />
      
      {watch('enablePackages') && (
        <CombosBuilderContainer>
          <ComboVisualizer>
            <ComboVisualizerHeader>
              <ComboPriceInfo>
                <span>Preço por número:</span>
                <strong>R$ {formatCurrency(watch('individualNumberPrice') || 0)}</strong>
              </ComboPriceInfo>
              <ComboInfoText>
                <FaInfoCircle /> Arraste para ajustar os descontos até 100%
              </ComboInfoText>
            </ComboVisualizerHeader>
            
            <ComboCardsContainer>
              <Controller
                name="numberPackages"
                control={control}
                defaultValue={initialData.numberPackages || [
                  { name: 'Combo Pequeno', quantity: 5, price: 0, discount: 5, isActive: true, highlight: false, order: 1 },
                  { name: 'Combo Médio', quantity: 10, price: 0, discount: 10, isActive: true, highlight: false, order: 2 },
                  { name: 'Combo Grande', quantity: 20, price: 0, discount: 15, isActive: true, highlight: false, order: 3 }
                ]}
                render={({ field }) => (
                  <>
                    {field.value.map((combo: Package, index: number) => (
                      <ComboCard key={index}>
                        {editingNameIndex === index ? (
                          <EditableName>
                            <NameInput
                              ref={nameInputRef}
                              type="text"
                              value={tempName}
                              onChange={(e) => setTempName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  saveNameEdit(field, index);
                                } else if (e.key === 'Escape') {
                                  cancelNameEdit();
                                }
                              }}
                              onBlur={() => saveNameEdit(field, index)}
                            />
                            <ComboActionButton 
                              $variant="primary"
                              onClick={() => saveNameEdit(field, index)}
                            >
                              <FaCheck />
                            </ComboActionButton>
                          </EditableName>
                        ) : (
                          <ComboName onClick={() => startEditingName(index, combo.name)}>
                            {combo.name} <FaEdit size={14} style={{ marginLeft: 5, opacity: 0.6 }} />
                          </ComboName>
                        )}

                        <ComboCardHeader>
                          {editingQuantityIndex === index ? (
                            <EditableQuantity>
                              <QuantityInput
                                ref={quantityInputRef}
                                type="number"
                                min="2"
                                value={tempQuantity}
                                onChange={(e) => setTempQuantity(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    saveQuantityEdit(field, index);
                                  } else if (e.key === 'Escape') {
                                    cancelQuantityEdit();
                                  }
                                }}
                                onBlur={() => saveQuantityEdit(field, index)}
                              />
                              <ComboActionButton 
                                $variant="primary"
                                onClick={() => saveQuantityEdit(field, index)}
                              >
                                <FaCheck />
                              </ComboActionButton>
                            </EditableQuantity>
                          ) : (
                            <ComboQuantity onClick={() => startEditingQuantity(index, combo.quantity)}>
                              {combo.quantity} números <FaEdit size={14} style={{ marginLeft: 5, opacity: 0.6 }} />
                            </ComboQuantity>
                          )}
                          <DiscountBadge $percentage={combo.discount} id={`discount-badge-${index}`}>
                            {combo.discount}% OFF
                          </DiscountBadge>
                        </ComboCardHeader>
                        
                        <ComboDiscount>
                          <DiscountLabel>
                            <span>Desconto:</span>
                            <span>{tempSliderValues[index] !== undefined ? `${tempSliderValues[index]}%` : `${combo.discount}%`}</span>
                          </DiscountLabel>
                          <DiscountSlider
                            type="range"
                            min={1}
                            max={100}
                            value={tempSliderValues[index] !== undefined ? tempSliderValues[index] : combo.discount}
                            onPointerDown={(e: React.PointerEvent<HTMLInputElement>) => {
                              // Inicializar valor temporário
                              setTempSliderValues(prev => ({...prev, [index]: combo.discount}));
                              // Garantir que o ponteiro fique "preso" ao elemento durante o arrasto
                              e.currentTarget.setPointerCapture(e.pointerId);
                            }}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              // Atualizar apenas o estado temporário para feedback visual
                              const newValue = parseInt(e.target.value);
                              setTempSliderValues(prev => ({...prev, [index]: newValue}));
                            }}
                            onPointerUp={() => {
                              // Atualizar o estado real apenas quando o usuário terminar
                              const finalValue = tempSliderValues[index];
                              if (finalValue !== undefined && finalValue !== combo.discount) {
                                const newCombos = [...field.value];
                                newCombos[index].discount = finalValue;
                                newCombos[index].price = calculateDiscountedPrice(combo.quantity, finalValue);

                                field.onChange(newCombos);
                              }
                              
                              // Limpar valor temporário
                              setTimeout(() => {
                                setTempSliderValues(prev => {
                                  const newValues = {...prev};
                                  delete newValues[index];
                                  return newValues;
                                });
                              }, 100);
                            }}
                          />
                        </ComboDiscount>
                        
                        <ComboPriceCalculation>
                          <PriceRow>
                            <PriceLabel>Preço original:</PriceLabel>
                            <PriceValue>
                              <s>R$ {(individualNumberPrice * combo.quantity).toFixed(2).replace('.', ',')}</s>
                            </PriceValue>
                          </PriceRow>
                          <PriceRow>
                            <PriceLabel>Com desconto:</PriceLabel>
                            <DiscountedValue>
                              R$ {calculateDiscountedPrice(
                                combo.quantity, 
                                tempSliderValues[index] !== undefined ? tempSliderValues[index] : combo.discount
                              ).toFixed(2).replace('.', ',')}
                            </DiscountedValue>
                          </PriceRow>
                          <PriceRow>
                            <PriceLabel>Economia:</PriceLabel>
                            <SavingsValue>
                              R$ {calculateSavings(
                                combo.quantity,
                                tempSliderValues[index] !== undefined ? tempSliderValues[index] : combo.discount
                              ).toFixed(2).replace('.', ',')}
                            </SavingsValue>
                          </PriceRow>
                        </ComboPriceCalculation>
                        
                        <ComboActions>
                          <ComboActionButton
                            $variant="danger"
                            onClick={() => {
                              const newCombos = [...field.value];
                              newCombos.splice(index, 1);
                              field.onChange(newCombos);
                            }}
                            title="Remover combo"
                          >
                            <FaTrashAlt /> Remover
                          </ComboActionButton>
                          
                          <QuantityPicker>
                            <QuantityButton
                              onClick={() => {
                                const newCombos = [...field.value];
                                if (newCombos[index].quantity > 2) {
                                  newCombos[index].quantity -= 1;
                                  field.onChange(newCombos);
                                }
                              }}
                              disabled={combo.quantity <= 2}
                            >-</QuantityButton>
                            <span>{combo.quantity}</span>
                            <QuantityButton
                              onClick={() => {
                                const newCombos = [...field.value];
                                newCombos[index].quantity += 1;
                                field.onChange(newCombos);
                              }}
                            >+</QuantityButton>
                          </QuantityPicker>
                        </ComboActions>
                      </ComboCard>
                    ))}
                    
                    {field.value.length < 5 && (
                      <AddComboButton
                        onClick={() => {
                          const lastCombo = field.value[field.value.length - 1];
                          const newQuantity = lastCombo ? lastCombo.quantity * 2 : 5;
                          const newDiscount = lastCombo ? Math.min(lastCombo.discount + 5, 100) : 5;
                          const newPrice = calculateDiscountedPrice(newQuantity, newDiscount);
                          
                          field.onChange([
                            ...field.value,
                            { 
                              name: `Combo de ${newQuantity}`,
                              description: `Pacote com ${newQuantity} números`,
                              quantity: newQuantity, 
                              price: newPrice, 
                              discount: newDiscount,
                              isActive: true,
                              highlight: false,
                              order: field.value.length + 1
                            }
                          ]);
                        }}
                      >
                        <FaPlusCircle />
                        <span>Adicionar Combo</span>
                      </AddComboButton>
                    )}
                  </>
                )}
              />
            </ComboCardsContainer>
          </ComboVisualizer>
          
          <ComboPreview>
            <ComboPreviewTitle>
              <FaPercentage /> Pré-visualização dos Combos
            </ComboPreviewTitle>
            <ComboPreviewContainer>
              {watch('numberPackages') && watch('numberPackages').map((combo: Package, index: number) => (
                <ComboPreviewItem key={index}>
                  <ComboPreviewBadge $percentage={combo.discount}>
                    {combo.discount}% OFF
                  </ComboPreviewBadge>
                  <ComboPreviewQuantity>{combo.quantity}</ComboPreviewQuantity>
                  <ComboPreviewLabel>números</ComboPreviewLabel>
                  <ComboPreviewPrice>
                    <ComboPreviewOriginalPrice>
                      R$ {((watch('individualNumberPrice') || 0) * combo.quantity).toFixed(2).replace('.', ',')}
                    </ComboPreviewOriginalPrice>
                    <ComboPreviewDiscountedPrice>
                      R$ {calculateDiscountedPrice(combo.quantity, combo.discount).toFixed(2).replace('.', ',')}
                    </ComboPreviewDiscountedPrice>
                  </ComboPreviewPrice>
                </ComboPreviewItem>
              ))}
            </ComboPreviewContainer>
          </ComboPreview>
        </CombosBuilderContainer>
      )}
    </ComboDiscountContainer>
  );
};

export default React.memo(ComboDiscountSection); 