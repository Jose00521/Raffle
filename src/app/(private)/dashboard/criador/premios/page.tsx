'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaGift, FaPlus, FaSearch, FaTrophy, FaFilter, FaSortAmountDown, FaSortAmountUp, FaMoneyBillWave } from 'react-icons/fa';
import ParticipantDashboard from '@/components/dashboard/ParticipantDashboard';
import { IPrize } from '@/models/interfaces/IPrizeInterfaces';
import { motion } from 'framer-motion';
import CreatorDashboard from '@/components/dashboard/CreatorDashboard';
import InputWithIcon from '@/components/common/InputWithIcon';
import Link from 'next/link';
import prizeAPIClient from '@/API/prizeAPIClient';
import { ApiResponse } from '@/server/utils/errorHandler/api';

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
  margin-bottom: 24px;
  
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
  gap: 12px;
  
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
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px rgba(106, 17, 203, 0.1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 12px rgba(106, 17, 203, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const FiltersBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
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
  background-color: ${props => props.$active ? 'rgba(106, 17, 203, 0.1)' : 'transparent'};
  color: ${props => props.$active ? '#6a11cb' : '#666'};
  border: ${props => props.$active ? '1px solid rgba(106, 17, 203, 0.3)' : '1px solid rgba(0, 0, 0, 0.1)'};
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.$active ? 'rgba(106, 17, 203, 0.15)' : 'rgba(0, 0, 0, 0.05)'};
  }
`;

const PrizesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const PrizeCard = styled(motion.div)`
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  cursor: pointer;
`;

const PrizeImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
`;

const PrizeImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.3s ease;
  
  ${PrizeCard}:hover & {
    transform: scale(1.05);
  }
`;

const PrizeOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px 16px 16px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 100%);
  color: white;
`;

const PrizeValue = styled.div`
  font-weight: 700;
  font-size: 1.1rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`;

const PrizeContent = styled.div`
  padding: 16px;
`;

const PrizeName = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 8px;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
`;

const PrizeDescription = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  margin: 0;
  line-height: 1.4;
`;

const CategoryBadge = styled.span`
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  backdrop-filter: blur(4px);
`;

const EmptyState = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 48px 24px;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
`;

const EmptyStateIcon = styled.div`
  font-size: 3rem;
  color: #d1d5db;
  margin-bottom: 16px;
`;

const EmptyStateTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 8px;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
`;

const EmptyStateText = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  margin: 0 0 24px;
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

// Componente para mostrar o valor do prêmio com cor e formatação específicas
const FormatPrizeValueBox = styled.div`
  font-size: 0.9rem;
  font-weight: 700;
  color: #6a11cb;
  background: rgba(106, 17, 203, 0.1);
  padding: 5px 10px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
`;

export default function PrizesDashboard() {
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
  
  // Função para extrair o valor numérico de uma string (ex: R$ 1.500,00 -> 1500)
  const extractNumericValue = (valueString: string): number => {
    try {
      // Remove qualquer caractere que não seja dígito
      const numericString = valueString.replace(/[^\d]/g, '');
      
      // Converte para número
      const value = parseInt(numericString, 10);
      
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
  
  // Formatar valor do prêmio para exibição
  const formatPrizeValue = (value: string): string => {
    // Verificar se o valor já está formatado como moeda
    if (value.includes('R$')) {
      return value;
    }
    
    // Tenta converter para número
    const numericValue = extractNumericValue(value);
    
    // Formata como moeda brasileira
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(numericValue / 100); // Divide por 100 se o valor estiver em centavos
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
            <FaFilter size={12} />
            Filtrar
          </FilterButton>
          
          <FilterButton 
            $active={true}
            onClick={handleSortToggle}
          >
            {sortDesc ? <FaSortAmountDown size={12} /> : <FaSortAmountUp size={12} />}
            Ordenar por valor
          </FilterButton>
        </FilterGroup>
        
        <div>
          <span style={{ fontSize: '0.85rem', color: '#666' }}>
            {sortedPrizes.length} prêmios encontrados
          </span>
        </div>
      </FiltersBar>
      
      {loading ? (
        <div>Carregando...</div>
      ) : sortedPrizes.length > 0 ? (
        <PrizesGrid>
          {sortedPrizes.map((prize: IPrize, index: number) => (
            <Link href={`/dashboard/criador/premios/detalhes/${prize._id}`} key={prize._id}>
            <PrizeCard 
              key={prize._id}
              initial="hidden"
              animate="visible"
              custom={index}
              variants={cardVariants}
              whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.12)' }}
            >
              <PrizeImageContainer>
                <PrizeImage src={prize.image} alt={prize.name} />
                <PrizeOverlay>
                  <PrizeValue>{formatPrizeValue(prize.value)}</PrizeValue>
                </PrizeOverlay>
                <CategoryBadge>Premiado</CategoryBadge>
              </PrizeImageContainer>
              
              <PrizeContent>
                <PrizeName>{prize.name}</PrizeName>
                <PrizeDescription>{prize.description}</PrizeDescription>
                <FormatPrizeValueBox>
                  <FaMoneyBillWave /> {formatPrizeValue(prize.value)}
                </FormatPrizeValueBox>
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
            Comece adicionando prêmios para suas rifas.
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