'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ParticipantDashboard from '@/components/dashboard/ParticipantDashboard';
import { ICampaign } from '@/models/Campaign';
import rifaAPI from '@/services/rifaAPI';
import { FaSearch } from 'react-icons/fa';

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 8px;
  padding: 0 15px;
  height: 46px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 400px;
  
  svg {
    color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
    margin-right: 10px;
  }
`;

const SearchInput = styled.input`
  border: none;
  flex: 1;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  outline: none;
  background: transparent;
  
  &::placeholder {
    color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
    opacity: 0.7;
  }
`;

const RifaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  grid-column: 1 / -1;
`;

const RifaCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
`;

const RifaImage = styled.div<{ $imageUrl: string }>`
  height: 160px;
  background-image: url(${props => props.$imageUrl});
  background-size: cover;
  background-position: center;
  position: relative;
`;

const RifaBadge = styled.div<{ $status: 'active' | 'completed' | 'ending' }>`
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  
  ${({ $status }) => {
    if ($status === 'active') {
      return `
        background-color: #10b981;
        color: white;
      `;
    } else if ($status === 'completed') {
      return `
        background-color: #6b7280;
        color: white;
      `;
    } else {
      return `
        background-color: #f59e0b;
        color: white;
      `;
    }
  }}
`;

const RifaContent = styled.div`
  padding: 15px;
`;

const RifaTitle = styled.h3`
  margin: 0 0 10px;
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
`;

const RifaPrice = styled.div`
  font-weight: 700;
  color: ${({ theme }) => theme.colors?.primary || '#6a11cb'};
  margin-bottom: 10px;
`;

const RifaDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
`;

const RifaButton = styled.button`
  width: 100%;
  padding: 10px;
  margin-top: 15px;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(106, 17, 203, 0.3);
    transform: translateY(-2px);
  }
`;

const ProgressBar = styled.div`
  height: 6px;
  background-color: ${({ theme }) => theme.colors?.gray?.light || '#e5e7eb'};
  border-radius: 3px;
  overflow: hidden;
  margin-top: 10px;
`;

const Progress = styled.div<{ $percent: number }>`
  height: 100%;
  width: ${props => props.$percent || 0}%;
  background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%);
  border-radius: 3px;
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 5px;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
`;

export default function RifasPage() {
  const [rifas, setRifas] = useState<ICampaign[]>([]);
  const [filteredRifas, setFilteredRifas] = useState<ICampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchRifas = async () => {
      try {
        const response = await rifaAPI.getCampanhasAtivas();
        
        // Handle different response formats
        if (response && typeof response === 'object' && 'data' in response) {
          // Response is an object with data property
          setRifas(Array.isArray(response.data) ? response.data : []);
          setFilteredRifas(Array.isArray(response.data) ? response.data : []);
        } else if (Array.isArray(response)) {
          // Response is directly an array
          setRifas(response);
          setFilteredRifas(response);
        } else {
          setRifas([]);
          setFilteredRifas([]);
        }
      } catch (error) {
        console.error('Erro ao buscar rifas:', error);
        setRifas([]);
        setFilteredRifas([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRifas();
  }, []);

  // Filter rifas based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredRifas(rifas);
      return;
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filtered = rifas.filter(rifa => 
      rifa.title.toLowerCase().includes(lowerCaseSearchTerm) || 
      rifa.description.toLowerCase().includes(lowerCaseSearchTerm)
    );
    
    setFilteredRifas(filtered);
  }, [searchTerm, rifas]);

  // Determine status based on draw date and completion percentage
  const getRifaStatus = (rifa: ICampaign) => {
    if (!rifa.isActive || rifa.winnerNumber !== null) {
      return 'completed';
    }
    
    const today = new Date();
    const drawDate = new Date(rifa.drawDate);
    const daysUntilDraw = Math.ceil((drawDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const completionPercentage = rifa.stats?.percentComplete || 0;
    
    if (daysUntilDraw <= 3 || completionPercentage >= 90) {
      return 'ending';
    }
    
    return 'active';
  };

  return (
    <ParticipantDashboard>
      <PageHeader>
        <SearchBar>
          <FaSearch />
          <SearchInput 
            placeholder="Pesquisar rifas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBar>
      </PageHeader>
      
      <RifaGrid>
        {isLoading ? (
          <EmptyState>Carregando rifas disponíveis...</EmptyState>
        ) : filteredRifas.length > 0 ? (
          filteredRifas.map((rifa) => {
            const status = getRifaStatus(rifa) as 'active' | 'completed' | 'ending';
            const progressPercent = rifa.stats?.percentComplete || 0;
            const available = rifa.stats?.available || rifa.totalNumbers;
            
            return (
              <RifaCard key={rifa._id}>
                <RifaImage $imageUrl={rifa.image}>
                  <RifaBadge $status={status}>
                    {status === 'active' && 'Ativo'}
                    {status === 'completed' && 'Concluído'}
                    {status === 'ending' && 'Finalizando'}
                  </RifaBadge>
                </RifaImage>
                
                <RifaContent>
                  <RifaTitle>{rifa.title}</RifaTitle>
                  <RifaPrice>R$ {rifa.price.toFixed(2)} por número</RifaPrice>
                  
                  <ProgressBar>
                    <Progress $percent={progressPercent} />
                  </ProgressBar>
                  
                  <ProgressLabel>
                    <span>{progressPercent}% vendido</span>
                    <span>{available} disponíveis</span>
                  </ProgressLabel>
                  
                  <RifaDetails>
                    <div>Sorteio: {new Date(rifa.drawDate).toLocaleDateString('pt-BR')}</div>
                    <div>{rifa.totalNumbers} números</div>
                  </RifaDetails>
                  
                  <RifaButton>Participar</RifaButton>
                </RifaContent>
              </RifaCard>
            );
          })
        ) : (
          <EmptyState>
            Nenhuma rifa encontrada. Tente com outros termos de pesquisa.
          </EmptyState>
        )}
      </RifaGrid>
    </ParticipantDashboard>
  );
} 