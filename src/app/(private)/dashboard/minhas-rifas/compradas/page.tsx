'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ParticipantDashboard from '@/components/dashboard/ParticipantDashboard';
import { FaTicketAlt, FaSearch, FaFilter } from 'react-icons/fa';
import CustomDropdown from '@/components/common/CustomDropdown';

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 15px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    width: 100%;
  }
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  font-weight: 700;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.2rem;
  }
`;

const FiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    width: 100%;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 350px;
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 12px 10px 38px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-size: 0.9rem;
  background-color: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #6a11cb;
    box-shadow: 0 0 0 2px rgba(106, 17, 203, 0.1);
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
    opacity: 0.7;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  pointer-events: none;
`;

const FilterDropdownContainer = styled.div`
  width: 100%;
  max-width: 200px;
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const RifaList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const RifaCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  display: flex;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    border-radius: 10px;
  }
`;

const RifaImage = styled.div`
  width: 160px;
  min-width: 160px;
  background-size: cover;
  background-position: center;
  
  @media (max-width: 768px) {
    width: 100%;
    height: 140px;
  }
`;

const RifaContent = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const RifaTitle = styled.h3`
  margin: 0 0 8px;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const RifaInfo = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  margin-bottom: 12px;
`;

const RifaMeta = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  margin-bottom: 8px;
`;

const ProgressContainer = styled.div`
  margin-top: auto;
  padding-top: 12px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background-color: ${({ theme }) => theme.colors?.gray?.light || '#e5e7eb'};
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $percent: number }>`
  height: 100%;
  background: linear-gradient(90deg, #6a11cb, #2575fc);
  width: ${props => props.$percent}%;
  border-radius: 3px;
`;

const ProgressText = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  margin-top: 6px;
`;

const ViewButton = styled.button`
  padding: 8px 16px;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 12px;
  align-self: flex-start;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(106, 17, 203, 0.3);
  }
  
  @media (max-width: 768px) {
    align-self: stretch;
    text-align: center;
  }
`;

const NoResultsContainer = styled.div`
  padding: 40px 20px;
  text-align: center;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
`;

const NoResultsIcon = styled.div`
  font-size: 2.5rem;
  color: ${({ theme }) => theme.colors?.gray?.medium || '#9ca3af'};
  margin-bottom: 16px;
`;

const NoResultsTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  margin: 0 0 8px;
`;

const NoResultsText = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  margin: 0;
`;

// Mock data
const mockRifas = [
  {
    id: '1',
    title: 'iPhone 15 Pro Max - 256GB',
    image: 'https://placehold.co/600x400/6a11cb/FFFFFF/png?text=iPhone+15',
    price: 20,
    drawDate: new Date(2025, 6, 15),
    status: 'active',
    progress: 62,
    seller: 'Tech Store',
  },
  {
    id: '2',
    title: 'MacBook Pro 16" M3 Pro',
    image: 'https://placehold.co/600x400/2575fc/FFFFFF/png?text=MacBook+Pro',
    price: 25,
    drawDate: new Date(2025, 7, 20),
    status: 'active',
    progress: 32,
    seller: 'Apple Reseller',
  },
  {
    id: '3',
    title: 'PlayStation 5 + 2 Controles',
    image: 'https://placehold.co/600x400/10b981/FFFFFF/png?text=PS5',
    price: 15,
    drawDate: new Date(2025, 4, 30),
    status: 'completed',
    progress: 100,
    seller: 'Game Shop',
    winningNumber: '238',
    won: true
  },
];

export default function MinhasRifasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Filter rifas based on search term and status
  const filteredRifas = mockRifas
    .filter(rifa => {
      if (!searchTerm) return true;
      
      return rifa.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
             rifa.seller.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .filter(rifa => {
      if (statusFilter === 'all') return true;
      return rifa.status === statusFilter;
    });
    
  return (
    <ParticipantDashboard>
      <PageHeader>
        <PageTitle>Meus Bilhetes</PageTitle>
      </PageHeader>
      
      <FiltersContainer>
        <SearchContainer>
          <SearchIcon>
            <FaSearch size={14} />
          </SearchIcon>
          <SearchInput 
            placeholder="Buscar por nome da rifa..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>
        
        <FilterDropdownContainer>
          <CustomDropdown
            options={[
              { value: 'all', label: 'Todos os Status' },
              { value: 'active', label: 'Em Andamento' },
              { value: 'completed', label: 'Finalizadas' }
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Filtrar por Status"
          />
        </FilterDropdownContainer>
      </FiltersContainer>
      
      <RifaList>
        {isLoading ? (
          <NoResultsContainer>
            <NoResultsText>Carregando seus bilhetes...</NoResultsText>
          </NoResultsContainer>
        ) : filteredRifas.length > 0 ? (
          filteredRifas.map(rifa => (
            <RifaCard key={rifa.id}>
              <RifaImage style={{ backgroundImage: `url(${rifa.image})` }} />
              <RifaContent>
                <RifaTitle>{rifa.title}</RifaTitle>
                
                <RifaMeta>
                  <span>Valor: R$ {rifa.price.toFixed(2)}</span>
                  <span>Sorteio: {rifa.drawDate.toLocaleDateString('pt-BR')}</span>
                </RifaMeta>
                
                <RifaInfo>
                  Vendedor: {rifa.seller}
                </RifaInfo>
                
                {rifa.status === 'active' && (
                  <ProgressContainer>
                    <ProgressBar>
                      <ProgressFill $percent={rifa.progress} />
                    </ProgressBar>
                    <ProgressText>
                      <span>{rifa.progress}% vendido</span>
                      <span>Sorteio em {Math.ceil((rifa.drawDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} dias</span>
                    </ProgressText>
                  </ProgressContainer>
                )}
                
                {rifa.status === 'completed' && (
                  <RifaInfo>
                    {rifa.won 
                      ? <strong style={{ color: '#10b981' }}>Você ganhou! Número sorteado: {rifa.winningNumber}</strong>
                      : `Concluído - Número sorteado: ${rifa.winningNumber}`
                    }
                  </RifaInfo>
                )}
                
                <ViewButton>
                  Ver detalhes
                </ViewButton>
              </RifaContent>
            </RifaCard>
          ))
        ) : (
          <NoResultsContainer>
            <NoResultsIcon>
              <FaTicketAlt />
            </NoResultsIcon>
            <NoResultsTitle>
              Nenhum bilhete encontrado
            </NoResultsTitle>
            <NoResultsText>
              Você ainda não comprou bilhetes de rifas ou não existem rifas que correspondam aos critérios de pesquisa.
            </NoResultsText>
          </NoResultsContainer>
        )}
      </RifaList>
    </ParticipantDashboard>
  );
} 