'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaGift, FaPlus, FaSearch, FaTrophy,FaEdit, FaFilter, FaSortAmountDown, FaSortAmountUp, FaMoneyBillWave, FaCalendarAlt } from 'react-icons/fa';
import ParticipantDashboard from '@/components/dashboard/ParticipantDashboard';
import { IPrize } from '@/models/interfaces/IPrizeInterfaces';
import { motion } from 'framer-motion';
import CreatorDashboard from '@/components/dashboard/CreatorDashboard';
import InputWithIcon from '@/components/common/InputWithIcon';
import Link from 'next/link';
import prizeAPIClient from '@/API/prizeAPIClient';
import { ApiResponse } from '@/server/utils/errorHandler/api';
import { useRouter } from 'next/navigation';

// Mock data for initial development
export const MOCK_PRIZES: IPrize[] = [
  {
    _id: '1',
    name: 'iPhone 14 Pro Max',
    description: 'Smartphone Apple 256GB de armazenamento',
    image: 'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?q=80&w=1470&auto=format&fit=crop',
    images: [],
    value: 'R$ 8.500,00',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: '2',
    name: 'Console PlayStation 5',
    description: 'Edição Digital com um controle DualSense',
    image: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?q=80&w=1528&auto=format&fit=crop',
    images: [],
    value: 'R$ 3.800,00',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: '3',
    name: 'TV Samsung 65" 4K',
    description: 'Smart TV com tecnologia QLED',
    image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=1474&auto=format&fit=crop',
    images: [],
    value: 'R$ 5.200,00',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: '4',
    name: 'Notebook Dell XPS 13',
    description: 'Intel Core i7, 16GB RAM, 512GB SSD',
    image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=1470&auto=format&fit=crop',
    images: [],
    value: 'R$ 7.900,00',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: '5',
    name: 'Pacote Viagem para Cancún',
    description: '7 dias com passagens e hospedagem all-inclusive',
    image: 'https://images.unsplash.com/photo-1682553064441-b3637beb0efd?q=80&w=1470&auto=format&fit=crop',
    images: [],
    value: 'R$ 12.000,00',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Styled components for this page
const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
`;

const PageTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  display: flex;
  align-items: center;
  gap: 12px;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  width: 300px;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 12px 24px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(106, 17, 203, 0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(106, 17, 203, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const FiltersBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(to right, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.9));
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(226, 232, 240, 0.8);
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  
  @media (max-width: 768px) {
    justify-content: space-between;
  }
`;

const FilterButton = styled.button<{ $active?: boolean }>`
  background-color: ${props => props.$active ? 'rgba(106, 17, 203, 0.1)' : 'rgba(255, 255, 255, 0.7)'};
  color: ${props => props.$active ? '#6a11cb' : '#64748b'};
  border: ${props => props.$active ? '1px solid rgba(106, 17, 203, 0.3)' : '1px solid rgba(226, 232, 240, 0.8)'};
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.$active ? 'rgba(106, 17, 203, 0.15)' : 'rgba(255, 255, 255, 0.9)'};
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  }
`;

const ResultsCount = styled.div`
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  
  span {
    color: #6a11cb;
    font-weight: 600;
  }
`;

const PrizesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 32px;
  padding: 8px 4px;
  
  @media (min-width: 1400px) {
    grid-template-columns: repeat(5, 1fr);
  }
  
  @media (max-width: 1200px) and (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: 767px) and (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 28px;
    padding: 4px 0;
  }
`;

const PrizeCard = styled(motion.div)`
  background-color: white;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid rgba(226, 232, 240, 0.8);
  
  &:hover {
    box-shadow: 0 18px 38px rgba(106, 17, 203, 0.15);
    transform: translateY(-8px);
  }
`;

const PrizeImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 240px;
  overflow: hidden;
  
  @media (max-width: 768px) {
    height: 220px;
  }
`;

const PrizeImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.5s ease;
  
  ${PrizeCard}:hover & {
    transform: scale(1.08);
  }
`;

const PrizeOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 30px 20px 20px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0) 100%);
  color: white;
  transition: opacity 0.3s ease;
  z-index: 2;
`;

const PrizeValue = styled.div`
  font-weight: 700;
  font-size: 1.2rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  overflow: visible;
  padding: 6px 12px;
  max-width: 100%;
  
  svg {
    filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.3));
    flex-shrink: 0;
    font-size: 1.1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const PrizeContent = styled.div`
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 12px;
`;

const PrizeName = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: #1e293b;
  line-height: 1.3;
  transition: color 0.2s ease;
  
  ${PrizeCard}:hover & {
    color: #6a11cb;
  }
`;

const Button = styled.button<{ $variant?: 'primary' | 'danger' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 42px;
  padding: 0 18px;
  border-radius: 10px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 1px solid transparent;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  
  ${({ $variant }) => $variant === 'danger' 
    ? `
      color: #ef4444;
      background-color: #fef2f2;
      border-color: #fee2e2;
      
      &:hover {
        background-color: #fee2e2;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.08);
      }
    ` 
    : `
      color: white;
      background: linear-gradient(to right, #4f46e5, #6366f1);
      
      &:hover {
        background: linear-gradient(to right, #4338ca, #4f46e5);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
      }
    `
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    padding: 0 14px;
    
    span {
      display: none;
    }
  }
`;

const PrizeDescription = styled.p`
  font-size: 0.95rem;
  color: #64748b;
  margin: 0 0 auto;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 3rem;
`;

const CategoryBadge = styled.span`
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(106, 17, 203, 0.9);
  color: white;
  padding: 8px 14px;
  border-radius: 30px;
  font-size: 0.85rem;
  font-weight: 600;
  backdrop-filter: blur(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 3;
  
  svg {
    font-size: 0.8rem;
  }
  
  ${PrizeCard}:hover & {
    background: rgba(106, 17, 203, 1);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
  }
`;

const PrizeFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(226, 232, 240, 0.8);
  gap: 12px;
  
  @media (max-width: 360px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const PrizeDate = styled.div`
  font-size: 0.85rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
`;

const FormatPrizeValueBox = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #6a11cb;
  background: rgba(106, 17, 203, 0.08);
  padding: 12px 20px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s ease;
  min-width: fit-content;
  max-width: 100%;
  white-space: nowrap;
  overflow: visible;
  
  ${PrizeCard}:hover & {
    background: rgba(106, 17, 203, 0.12);
  }
  
  svg {
    color: #7c3aed;
    flex-shrink: 0;
    font-size: 1.1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.95rem;
    padding: 10px 16px;
  }
`;

// Loading skeleton components
const LoadingSkeletonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 32px;
  padding: 8px 4px;
  
  @media (min-width: 1400px) {
    grid-template-columns: repeat(4, 1fr);
  }
  
  @media (max-width: 1200px) and (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: 767px) and (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 28px;
    padding: 4px 0;
  }
`;

const LoadingSkeletonCard = styled.div`
  background-color: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  height: 100%;
  border: 1px solid rgba(226, 232, 240, 0.8);
  display: flex;
  flex-direction: column;
  position: relative;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(106, 17, 203, 0.1);
  }
`;

const SkeletonImage = styled.div`
  height: 220px;
  background: linear-gradient(-90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%);
  background-size: 400% 400%;
  animation: shimmer 1.8s ease-in-out infinite;
  
  @keyframes shimmer {
    0% {
      background-position: 100% 50%;
    }
    50% {
      background-position: 0% 50%;
    }
    100% {
      background-position: 100% 50%;
    }
  }
`;

const SkeletonContent = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const SkeletonTitle = styled.div`
  height: 24px;
  margin-bottom: 16px;
  background: linear-gradient(-90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%);
  background-size: 400% 400%;
  animation: shimmer 1.8s ease-in-out infinite;
  animation-delay: 0.1s;
  border-radius: 4px;
`;

const SkeletonDescription = styled.div`
  height: 16px;
  margin-bottom: 8px;
  background: linear-gradient(-90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%);
  background-size: 400% 400%;
  animation: shimmer 1.8s ease-in-out infinite;
  animation-delay: 0.2s;
  border-radius: 4px;
  width: 100%;
  
  &:last-of-type {
    width: 70%;
    animation-delay: 0.3s;
  }
`;

const SkeletonFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid rgba(226, 232, 240, 0.8);
`;

const SkeletonDate = styled.div`
  height: 14px;
  width: 90px;
  background: linear-gradient(-90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%);
  background-size: 400% 400%;
  animation: shimmer 1.8s ease-in-out infinite;
  animation-delay: 0.4s;
  border-radius: 4px;
`;

const SkeletonPrice = styled.div`
  height: 32px;
  width: 100px;
  background: linear-gradient(-90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%);
  background-size: 400% 400%;
  animation: shimmer 1.8s ease-in-out infinite;
  animation-delay: 0.5s;
  border-radius: 8px;
`;

const SkeletonBadge = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  height: 24px;
  width: 80px;
  background: linear-gradient(-90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%);
  background-size: 400% 400%;
  animation: shimmer 1.8s ease-in-out infinite;
  animation-delay: 0.2s;
  border-radius: 30px;
`;

const EmptyState = styled.div`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%);
  border-radius: 16px;
  padding: 64px 32px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(226, 232, 240, 0.8);
  backdrop-filter: blur(8px);
`;

const EmptyStateIcon = styled.div`
  font-size: 3.5rem;
  color: rgba(106, 17, 203, 0.2);
  margin-bottom: 24px;
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 0.8;
    }
    50% {
      transform: scale(1.1);
      opacity: 1;
    }
    100% {
      transform: scale(1);
      opacity: 0.8;
    }
  }
`;

const EmptyStateTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 12px;
  color: #1e293b;
`;

const EmptyStateText = styled.p`
  font-size: 1rem;
  color: #64748b;
  margin: 0 auto 32px;
  max-width: 500px;
  line-height: 1.6;
`;

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.43, 0.13, 0.23, 0.96]
    }
  })
};

export default function PrizesDashboard() {
  const router = useRouter();
  
  const [prizes, setPrizes] = useState<IPrize[]>(MOCK_PRIZES);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDesc, setSortDesc] = useState(false);
  
  useEffect(()=> {
    // Simulando carregamento de dados da API
    setLoading(true);
    const fetchPrizes = async () => {
      const response = await prizeAPIClient.getAllPrizes();
      if (response.success) {
        console.log("Prêmios recebidos da API:", response.data);
        setPrizes(response.data);
        setLoading(false);
      }
    };

    fetchPrizes();
  }, []);
  
  // Filter prizes based on search query
  const filteredPrizes = prizes.filter((prize: IPrize) => 
    prize.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prize.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (id: string | undefined) => {
    router.push(`/dashboard/criador/premios/${id}`);
  };
  
  
  
  // Formatar valor do prêmio para exibição
  const extractNumericValue = (valueString: string): number => {
    try {
      // Remove qualquer caractere que não seja dígito, ponto ou vírgula
      const cleanString = valueString.replace(/[^\d,.]/g, '');
      
      // Substitui vírgula por ponto para processamento numérico
      const normalizedString = cleanString.replace(/,/g, '.');
      
      // Converte para número
      const value = parseFloat(normalizedString);
      
      // Retorna 0 se não for um número válido
      return isNaN(value) ? 0 : value;
    } catch (error) {
      console.error("Erro ao extrair valor numérico:", error);
      return 0;
    }
  };

    // Sort prizes by value
    const sortedPrizes = [...filteredPrizes].sort((a: IPrize, b: IPrize) => {
      const valueA = extractNumericValue(a.value);
      const valueB = extractNumericValue(b.value);
      
      return sortDesc ? valueB - valueA : valueA - valueB;
    });
    
    const handleSortToggle = () => {
      setSortDesc(!sortDesc);
    };

  const formatPrizeValue = (value: string | number): string => {
    if (!value) return 'R$ 0,00';
    
    // Se for um número, converte para string
    const valueString = typeof value === 'number' ? value.toString() : value;
    
    // Verificar se o valor já está formatado como moeda
    if (valueString.includes('R$')) {
      return valueString;
    }
    
    // Tenta converter para número
    const numericValue = extractNumericValue(valueString);
    
    // Formata como moeda brasileira
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(numericValue);
  };
  
  // Função para formatar data no formato brasileiro (dia/mês/ano)
  const formatDate = (date?: Date | string): string => {
    if (!date) return 'Data não disponível';
    
    try {
      return new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return 'Data inválida';
    }
  };
  
  return (
    <CreatorDashboard>
      <PageHeader>
        <PageTitle>
          <FaTrophy style={{ color: '#f59e0b' }} />
          Prêmios
        </PageTitle>
        
        <HeaderActions>
          <SearchContainer>
            <InputWithIcon
              id="search-prizes"
              name="search"
              label=""
              icon={<FaSearch />}
              placeholder="Buscar prêmios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchContainer>
          <Link href="/dashboard/criador/premios/adicionar">
            <AddButton>
              <FaPlus />
              Adicionar
            </AddButton>
          </Link>
        </HeaderActions>
      </PageHeader>
      
      <FiltersBar>
        <FilterGroup>
          <FilterButton>
            <FaFilter size={14} />
            Filtrar
          </FilterButton>
          
          <FilterButton 
            $active={true}
            onClick={handleSortToggle}
          >
            {sortDesc ? <FaSortAmountDown size={14} /> : <FaSortAmountUp size={14} />}
            {sortDesc ? 'Maior valor' : 'Menor valor'}
          </FilterButton>
        </FilterGroup>
        
        <ResultsCount>
          Mostrando <span>{sortedPrizes.length}</span> prêmios
        </ResultsCount>
      </FiltersBar>
      
      {loading ? (
        <LoadingSkeletonGrid>
          {Array.from({ length: 6 }, (_, index) => (
            <LoadingSkeletonCard key={index}>
              <SkeletonImage />
              <SkeletonBadge />
              <SkeletonContent>
                <SkeletonTitle />
                <SkeletonDescription />
                <SkeletonDescription />
                <SkeletonFooter>
                  <SkeletonDate />
                  <SkeletonPrice />
                </SkeletonFooter>
              </SkeletonContent>
            </LoadingSkeletonCard>
          ))}
        </LoadingSkeletonGrid>
      ) : sortedPrizes.length > 0 ? (
        <PrizesGrid>
          {sortedPrizes.map((prize: IPrize, index: number) => (
            <Link href={`/dashboard/criador/premios/detalhes/${prize.prizeCode}`} key={prize.prizeCode || prize._id}>
              <PrizeCard 
                key={prize._id}
                initial="hidden"
                animate="visible"
                custom={index}
                variants={cardVariants}
                whileHover={{ y: -8, boxShadow: '0 18px 38px rgba(106, 17, 203, 0.15)' }}
              >
                <PrizeImageContainer>
                  <PrizeImage src={prize.image} alt={prize.name} />
                  <PrizeOverlay>
                    <PrizeValue>
                      <FaMoneyBillWave />
                      {formatPrizeValue(prize.value)}
                    </PrizeValue>
                  </PrizeOverlay>
                  <CategoryBadge>
                    <FaTrophy />
                    Premiado
                  </CategoryBadge>
                </PrizeImageContainer>
                
                <PrizeContent>
                  <PrizeName>{prize.name}</PrizeName>
                  <PrizeDescription>{prize.description}</PrizeDescription>
                  
                  <PrizeFooter>
                    <PrizeDate>
                      <FaCalendarAlt size={14} />
                      {formatDate(prize.createdAt)}
                    </PrizeDate>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <Button onClick={(e) => {
                        e.preventDefault();
                        handleEdit(prize.prizeCode);
                      }}>
                        <FaEdit size={16} />
                        <span>Editar</span>
                      </Button>
                      <FormatPrizeValueBox>
                        <FaMoneyBillWave /> 
                        {formatPrizeValue(prize.value)}
                      </FormatPrizeValueBox>
                    </div>
                  </PrizeFooter>
                </PrizeContent>
              </PrizeCard>
            </Link>
          ))}
        </PrizesGrid>
      ) : (
        <EmptyState>
          <EmptyStateIcon>
            <FaGift />
          </EmptyStateIcon>
          <EmptyStateTitle>Nenhum prêmio encontrado</EmptyStateTitle>
          <EmptyStateText>
            Adicione prêmios para usá-los em suas campanhas de rifas. Os prêmios criados poderão ser facilmente selecionados ao configurar novas rifas.
          </EmptyStateText>
          <Link href="/dashboard/criador/premios/adicionar">
            <AddButton>
              <FaPlus />
              Adicionar Prêmio
            </AddButton>
          </Link>
        </EmptyState>
      )}
    </CreatorDashboard>
  );
}