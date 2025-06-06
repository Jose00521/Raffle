'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import CreatorDashboard from '@/components/dashboard/CreatorDashboard';
import { FaPlus, FaSearch, FaEllipsisV, FaEye, FaEdit, FaTrash, FaChartLine, FaTicketAlt, FaPowerOff } from 'react-icons/fa';
import Link from 'next/link';
import ToggleSwitch from '@/components/common/ToggleSwitch';
import campaignAPIClient from '@/API/campaignAPIClient';
import { CampaignStatusEnum, ICampaign } from '@/models/interfaces/ICampaignInterfaces';

// Styled Components
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

const Title = styled.h1`
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

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ActionButton = styled.button`
  padding: 10px 16px;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(106, 17, 203, 0.3);
  }
  
  @media (max-width: 768px) {
    flex: 1;
    justify-content: center;
  }
  
  a {
    display: flex;
    align-items: center;
    gap: 8px;
    color: white;
    text-decoration: none;
  }
`;

const FiltersContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 15px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
  }
`;

const SearchBar = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
  
  @media (max-width: 768px) {
    max-width: 100%;
    width: 100%;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  font-size: 0.9rem;
  pointer-events: none;
`;

const SearchInput = styled.input`
  width: 100%;
  height: 46px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 0 15px 0 40px;
  font-size: 0.9rem;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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

const TabsContainer = styled.div`
  display: flex;
  gap: 10px;
     transition: all 0.3s;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    height: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 10px 20px;
  background: ${props => props.$active ? 'white' : 'transparent'};
  border: none;
  border-bottom: 3px solid ${props => props.$active ? '#6a11cb' : 'transparent'};
  font-weight: ${props => props.$active ? '600' : '400'};
  color: ${props => props.$active ? '#6a11cb' : '#666'};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    color: #6a11cb;
  }
`;

const RifaCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const RifaCard = styled.div`
  background: white;
  border-radius: 12px;
  
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    border-radius: 10px;
    
    &:hover {
      transform: translateY(-3px);
    }
  }
`;

const RifaImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 180px;
  
  @media (max-width: 768px) {
    height: 160px;
  }
  
  @media (max-width: 480px) {
    height: 140px;
  }
`;

const RifaImage = styled.div<{ $imageUrl: string }>`
  width: 100%;
  height: 100%;
  background-image: url(${props => props.$imageUrl});
  background-size: cover;
  background-position: center;
`;

const RifaBadge = styled.div<{ $status: string }>`
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  
  ${({ $status }) => {
    if ($status === 'ACTIVE') {
      return `
        background-color: rgba(16, 185, 129, 0.9);
        color: white;
        animation: pulse 3s infinite ease-in-out;
        
        @keyframes pulse {
          0% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }
      `;
    } else if ($status === 'COMPLETED') {
      return `
        background-color: rgba(106, 17, 203, 0.9);
        color: white;
      `;
    } else if ($status === 'PENDING' || $status === 'SCHEDULED') {
      return `
        background-color: rgba(59, 130, 246, 0.9);
        color: white;
      `;
    } else {
      return `
        background-color: rgba(107, 114, 128, 0.9);
        color: white;
      `;
    }
  }}
`;

const RifaContent = styled.div`
  padding: 15px;
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: space-between;
  
  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const RifaUpperContent = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  margin-bottom: 15px;
`;

const RifaTitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const RifaTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  margin-left: 10px;
  flex-shrink: 0;

  padding: 4px 8px;
  border-radius: 20px;
  transition: all 0.2s ease;
  

  
  @media (max-width: 768px) {
    padding: 3px 6px;
  }
`;

const StatusLabel = styled.span`
  font-size: 0.8rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  margin-right: 8px;
  
  @media (max-width: 480px) {
    display: none;
  }
`;

const RifaMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  margin-bottom: 10px;
`;

const RifaStats = styled.div`
  margin: 15px 0;
  padding: 10px;
  background-color: ${({ theme }) => theme.colors?.background || '#f5f7fa'};
  border-radius: 8px;
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 0.85rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const StatLabel = styled.span`
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
`;

const StatValue = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
`;

const ProgressBar = styled.div`
  height: 8px;
  background-color: ${({ theme }) => theme.colors?.gray?.light || '#e5e7eb'};
  border-radius: 4px;
  overflow: hidden;
  margin-top: 15px;
`;

const ProgressFill = styled.div<{ $percent: number }>`
  height: 100%;
  width: ${props => props.$percent}%;
  background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%);
  border-radius: 4px;
  transition: width 1s ease;
`;

const ProgressText = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  margin-top: 5px;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
`;

const RifaActions = styled.div`
  display: flex;
  
  gap: 10px;
  min-height: 38px;
  margin-top: auto;
`;

const RifaActionButton = styled.button<{ $variant?: 'outline' | 'icon' | 'edit' }>`
  padding: ${props => (props.$variant === 'icon' || props.$variant === 'edit') ? '8px' : '8px 12px'};
  background: ${props => {
    if (props.$variant === 'outline') return 'transparent';
    if (props.$variant === 'edit') return '#6366f1';
    return 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)';
  }};
  color: ${props => props.$variant === 'outline' ? '#6a11cb' : 'white'};
  border: ${props => props.$variant === 'outline' ? '1px solid #6a11cb' : 'none'};
  border-radius: 6px;
  font-size: 0.9rem;
  min-height: 38px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease;
  height: 38px;
  text-align: center;
  
  ${props => {
    if (props.$variant === 'icon' || props.$variant === 'edit') {
      return `width: 38px; min-width: 38px;`;
    }
    return `flex: 1;`;
  }}
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => {
      if (props.$variant === 'outline') return '0 4px 12px rgba(106, 17, 203, 0.15)';
      if (props.$variant === 'edit') return '0 4px 12px rgba(99, 102, 241, 0.3)';
      return '0 4px 12px rgba(106, 17, 203, 0.3)';
    }};
  }
  
  a {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    color: inherit;
    text-decoration: none;
    width: 100%;
    height: 100%;
  }
`;

const PopoverContainer = styled.div`
  position: static;
  display: flex;
  height: 38px;
`;

const Popover = styled.div<{ $visible: boolean }>`
  position: absolute;
  top: calc(100% + 5px);
  right: 0;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  z-index: 100;
  min-width: 180px;
  opacity: ${props => props.$visible ? 1 : 0};
  visibility: ${props => props.$visible ? 'visible' : 'hidden'};
  transform: ${props => props.$visible ? 'translateY(0)' as string : 'translateY(-10px)' as string};
  transition: all 0.2s ease;
  pointer-events: ${props => props.$visible ? 'auto' : 'none'};
`;

const PopoverItem = styled.button<{ $danger?: boolean }>`
  padding: 10px 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  font-size: 0.9rem;
  color: ${props => props.$danger ? '#ef4444' : '#333'};
  cursor: pointer;
  
  &:hover {
    background-color: ${'rgba(0, 0, 0, 0.04)' as string};
  }
  
  svg {
    font-size: 1rem;
  }
`;

const EmptyState = styled.div`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%);
  border-radius: 16px;
  padding: 64px 32px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(226, 232, 240, 0.8);
  backdrop-filter: blur(8px);
  margin-top: 20px;
`;

const EmptyStateIcon = styled.div`
  font-size: 3.5rem;
  color: rgba(106, 17, 203, 0.2);
  margin-bottom: 24px;

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

// Skeleton Loader Components
const LoadingSkeletonGrid = styled.div`
  display: grid;
  grid-template-columns: ${'repeat(auto-fill, minmax(300px, 1fr))' as string};
  gap: 20px;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const LoadingSkeletonCard = styled.div`
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100%;
  
  @media (max-width: 768px) {
    border-radius: 10px;
  }
`;

const SkeletonImage = styled.div`
  height: 180px;
  background: ${'linear-gradient(-90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%)' as string};
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
  
  @media (max-width: 768px) {
    height: 160px;
  }
  
  @media (max-width: 480px) {
    height: 140px;
  }
`;

const SkeletonBadge = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 60px;
  height: 24px;
  border-radius: 20px;
  background: ${'linear-gradient(-90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%)' as string};
  background-size: 400% 400%;
  animation: shimmer 1.8s ease-in-out infinite;
  animation-delay: 0.1s;
`;

const SkeletonContent = styled.div`
  padding: 15px;
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: space-between;
  
  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const SkeletonUpperContent = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  margin-bottom: 15px;
`;

const SkeletonTitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const SkeletonTitle = styled.div`
  height: 24px;
  flex: 1;
  background: ${'linear-gradient(-90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%)' as string};
  background-size: 400% 400%;
  animation: shimmer 1.8s ease-in-out infinite;
  animation-delay: 0.1s;
  border-radius: 4px;
`;

const SkeletonToggle = styled.div`
  width: 40px;
  height: 20px;
  margin-left: 10px;
  border-radius: 10px;
  background: ${'linear-gradient(-90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%)' as string};
  background-size: 400% 400%;
  animation: shimmer 1.8s ease-in-out infinite;
  animation-delay: 0.2s;
`;

const SkeletonMeta = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const SkeletonMetaText = styled.div`
  height: 16px;
  width: 100px;
  background: ${'linear-gradient(-90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%)' as string};
  background-size: 400% 400%;
  animation: shimmer 1.8s ease-in-out infinite;
  animation-delay: 0.3s;
  border-radius: 4px;
`;

const SkeletonStats = styled.div`
  margin: 15px 0;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 8px;
`;

const SkeletonStatRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
`;

const SkeletonStatLabel = styled.div`
  height: 16px;
  width: 100px;
  background: ${'linear-gradient(-90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%)' as string};
  background-size: 400% 400%;
  animation: shimmer 1.8s ease-in-out infinite;
  border-radius: 4px;
`;

const SkeletonStatValue = styled.div`
  height: 16px;
  width: 80px;
  background: ${'linear-gradient(-90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%)' as string};
  background-size: 400% 400%;
  animation: shimmer 1.8s ease-in-out infinite;
  border-radius: 4px;
`;

const SkeletonProgressBar = styled.div`
  height: 8px;
  border-radius: 4px;
  margin-top: 15px;
  background: ${'linear-gradient(-90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%)' as string};
  background-size: 400% 400%;
  animation: shimmer 1.8s ease-in-out infinite;
  animation-delay: 0.4s;
`;

const SkeletonProgressText = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
`;

const SkeletonProgressTextItem = styled.div`
  height: 14px;
  width: 80px;
  background: ${'linear-gradient(-90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%)' as string};
  background-size: 400% 400%;
  animation: shimmer 1.8s ease-in-out infinite;
  animation-delay: 0.5s;
  border-radius: 4px;
`;

const SkeletonActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: auto;
  height: 38px;
`;

const SkeletonButton = styled.div<{ $width?: string }>`
  flex: ${props => props.$width ? '0' : '1'};
  width: ${props => props.$width || 'auto'};
  border-radius: 6px;
  background: ${'linear-gradient(-90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%)' as string};
  background-size: 400% 400%;
  animation: shimmer 1.8s ease-in-out infinite;
  animation-delay: 0.6s;
`;

const StyledToggleSwitch = styled(ToggleSwitch)`
  transform: scale(0.85);
`;

// Mock data for demonstration
const mockCampaigns = [
  {
    id: '1',
    title: 'iPhone 15 Pro Max - 256GB',
    image: 'https://placehold.co/600x400/6a11cb/FFFFFF/png?text=iPhone+15',
    status: 'ativa',
    previousStatus: 'ativa',
    canceled: false,
    createdAt: new Date(2025, 3, 10),
    drawDate: new Date(2025, 6, 15),
    price: 20,
    totalNumbers: 1000,
    stats: {
      available: 330,
      reserved: 50,
      sold: 620,
      percentSold: 62
    },
    totalSales: 12400
  },
  {
    id: '2',
    title: 'MacBook Pro 16" M3 Pro',
    image: 'https://placehold.co/600x400/2575fc/FFFFFF/png?text=MacBook+Pro',
    status: 'ativa',
    previousStatus: 'ativa',
    canceled: false,
    createdAt: new Date(2025, 4, 5),
    drawDate: new Date(2025, 7, 20),
    price: 25,
    totalNumbers: 800,
    stats: {
      available: 464,
      reserved: 80,
      sold: 256,
      percentSold: 32
    },
    totalSales: 6400
  },
  {
    id: '3',
    title: 'PlayStation 5 + 2 Controles',
    image: 'https://placehold.co/600x400/10b981/FFFFFF/png?text=PS5',
    status: 'finalizada',
    previousStatus: 'finalizada',
    canceled: false,
    createdAt: new Date(2025, 2, 15),
    drawDate: new Date(2025, 4, 30),
    price: 15,
    totalNumbers: 500,
    stats: {
      available: 0,
      reserved: 0,
      sold: 500,
      percentSold: 100
    },
    totalSales: 7500,
    winnerNumber: '238'
  },
  {
    id: '4',
    title: 'Samsung S24 Ultra',
    image: 'https://placehold.co/600x400/6a11cb/FFFFFF/png?text=S24+Ultra',
    status: 'futura',
    previousStatus: 'futura',
    canceled: false,
    createdAt: new Date(2025, 5, 1),
    drawDate: new Date(2025, 8, 10),
    price: 18,
    totalNumbers: 700,
    stats: {
      available: 700,
      reserved: 0,
      sold: 0,
      percentSold: 0
    },
    totalSales: 0
  }
];

export default function MinhasRifasPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<ICampaign[]>([]);
  
  useEffect(() => {
    // Simulate data loading
    const fetchCampaigns = async () => {
      const response = await campaignAPIClient.getCampanhasAtivas();
      setCampaigns(response.data);
      setIsLoading(false);
    };
    fetchCampaigns();
  }, []);
  
  // Filter campaigns based on active tab and search term
  const filteredCampaigns = campaigns
  .filter(campaign => {
    if (activeTab === 'all') return true;
    if (activeTab === 'cancelada') return campaign.canceled;
    return campaign.status === activeTab && !campaign.canceled;
  })
  .filter(campaign => {
    if (!searchTerm.trim()) return true;
    return campaign.title.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  // Função para alternar o status cancelado/ativo da campanha
  const toggleCampaignStatus = (id: string) => {
    setCampaigns(prev => prev.map((campaign: ICampaign) => {
      if (campaign.campaignCode === id) {
        // Se a campanha estiver cancelada, restaura para o status anterior
        // Caso contrário, marca como cancelada
        return {
          ...campaign,
          canceled: !campaign.canceled
        };
      }
      return campaign;
    }));
  };
  
  return (
    <CreatorDashboard>
      <div>
        <PageHeader>
          <Title>Minhas Rifas</Title>
          <ActionButtons>
            <ActionButton>
              <Link href="/dashboard/criador/nova-rifa">
                <FaPlus size={14} />
                Nova Rifa
              </Link>
            </ActionButton>
          </ActionButtons>
        </PageHeader>
        
        <FiltersContainer>
          <SearchBar>
            <SearchIcon>
              <FaSearch size={14} />
            </SearchIcon>
            <SearchInput 
              placeholder="Buscar rifa..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBar>
        </FiltersContainer>
        
        <TabsContainer>
          <Tab 
            $active={activeTab === 'all'} 
            onClick={() => setActiveTab('all')}
          >
            Todas
          </Tab>
          <Tab 
            $active={activeTab === 'ACTIVE'} 
            onClick={() => setActiveTab('ACTIVE')}
          >
            Ativas
          </Tab>
          <Tab 
            $active={activeTab === 'SCHEDULED'} 
            onClick={() => setActiveTab('SCHEDULED')}
          >
            Agendadas
          </Tab>
          <Tab 
            $active={activeTab === 'PENDING'} 
            onClick={() => setActiveTab('PENDING')}
          >
            Pendentes
          </Tab>
          <Tab 
            $active={activeTab === 'COMPLETED'} 
            onClick={() => setActiveTab('COMPLETED')}
          >
            Finalizadas
          </Tab>
          <Tab 
            $active={activeTab === 'cancelada'} 
            onClick={() => setActiveTab('cancelada')}
          >
            Canceladas
          </Tab>
        </TabsContainer>
        
        {isLoading ? (
          <LoadingSkeletonGrid>
            {Array.from({ length: 6 }, (_, index) => (
              <LoadingSkeletonCard key={index}>
                <SkeletonImage />
                <SkeletonBadge />
                <SkeletonContent>
                  <SkeletonUpperContent>
                    <SkeletonTitleRow>
                      <SkeletonTitle />
                      <SkeletonToggle />
                    </SkeletonTitleRow>
                    
                    <SkeletonMeta>
                      <SkeletonMetaText />
                      <SkeletonMetaText />
                    </SkeletonMeta>
                    
                    <SkeletonStats>
                      <SkeletonStatRow>
                        <SkeletonStatLabel />
                        <SkeletonStatValue />
                      </SkeletonStatRow>
                      <SkeletonStatRow>
                        <SkeletonStatLabel />
                        <SkeletonStatValue />
                      </SkeletonStatRow>
                      <SkeletonStatRow>
                        <SkeletonStatLabel />
                        <SkeletonStatValue />
                      </SkeletonStatRow>
                    </SkeletonStats>
                    
                    <SkeletonProgressBar />
                    <SkeletonProgressText>
                      <SkeletonProgressTextItem />
                      <SkeletonProgressTextItem />
                    </SkeletonProgressText>
                  </SkeletonUpperContent>
                  
                  <SkeletonActions>
                    <SkeletonButton />
                    <SkeletonButton />
                    <SkeletonButton $width="38px" />
                  </SkeletonActions>
                </SkeletonContent>
              </LoadingSkeletonCard>
            ))}
          </LoadingSkeletonGrid>
        ) : filteredCampaigns.length > 0 ? (
          <RifaCardsGrid>
            {filteredCampaigns.map((campaign) => (
              <RifaCard key={campaign.campaignCode}>
                <RifaImageContainer>
                  <RifaImage $imageUrl={campaign.coverImage as string} />
                  <RifaBadge $status={campaign.canceled ? 'cancelada' : campaign.status}>
                    {campaign.canceled && 'Cancelada'}
                    {!campaign.canceled && campaign.status === CampaignStatusEnum.ACTIVE && 'Ativa'}
                    {!campaign.canceled && campaign.status === CampaignStatusEnum.COMPLETED && 'Finalizada'}
                    {!campaign.canceled && campaign.status === CampaignStatusEnum.SCHEDULED && 'Agendada'}
                    {!campaign.canceled && campaign.status === CampaignStatusEnum.PENDING && 'Pendente'}
                  </RifaBadge>
                </RifaImageContainer>
                
                <RifaContent>
                  <RifaUpperContent>
                    <RifaTitleRow>
                      <RifaTitle title={campaign.title}>
                        {campaign.title.length > 24 
                          ? `${campaign.title.substring(0, 24)}...` 
                          : campaign.title}
                      </RifaTitle>
                      {campaign.status !== CampaignStatusEnum.COMPLETED && (
                        <StatusContainer>
                          {/* <StatusLabel>Ativa</StatusLabel> */}
                          <StyledToggleSwitch 
                            checked={!campaign.canceled}
                            onChange={() => toggleCampaignStatus(campaign.campaignCode as string)}
                            size="medium"
                            colorOn={(campaign.status === CampaignStatusEnum.SCHEDULED)
                              || (campaign.status === CampaignStatusEnum.PENDING)
                              ? '#3b82f6' : '#10b981'}
                            colorOff="#ef4444"
                          />
                        </StatusContainer>
                      )}
                    </RifaTitleRow>
                    
                    <RifaMeta>
                      <div>Criada em {new Date(campaign.createdAt).toLocaleDateString('pt-BR')}</div>
                      <div>R$ {campaign.individualNumberPrice.toFixed(2)}</div>
                    </RifaMeta>
                    
                    <RifaStats>
                      <StatRow>
                        <StatLabel>Data do Sorteio:</StatLabel>
                        <StatValue>{new Date(campaign.drawDate).toLocaleDateString('pt-BR')}</StatValue>
                      </StatRow>
                      <StatRow>
                        <StatLabel>Números Totais:</StatLabel>
                        <StatValue>{campaign.totalNumbers}</StatValue>
                      </StatRow>
                      <StatRow>
                        <StatLabel>Vendas Totais:</StatLabel>
                        <StatValue>R$ {campaign.stats?.totalRevenue.toFixed(2)}</StatValue>
                      </StatRow>
                      {campaign.status === CampaignStatusEnum.COMPLETED && campaign.winnerNumber && (
                        <StatRow>
                          <StatLabel>Número Vencedor:</StatLabel>
                          <StatValue>{campaign.winnerNumber}</StatValue>
                        </StatRow>
                      )}
                    </RifaStats>
                    
                    <ProgressBar>
                      <ProgressFill $percent={campaign.stats?.percentComplete || 0} />
                    </ProgressBar>
                    <ProgressText>
                      <span>{campaign.stats?.percentComplete}% vendido</span>
                      <span>{campaign.stats?.sold}/{campaign.totalNumbers} números</span>
                    </ProgressText>
                  </RifaUpperContent>
                  
                  <RifaActions>
                    {/* Botão Ver */}
                    <RifaActionButton>
                      <Link href={`/dashboard/criador/campanha/${campaign.campaignCode}`}>
                        <FaEye size={14} /> Ver
                      </Link>
                    </RifaActionButton>
                    
                    {/* Botão Sortear (apenas se não estiver finalizada e não estiver cancelada) */}
                    {campaign.status !== CampaignStatusEnum.COMPLETED && !campaign.canceled && (
                      <RifaActionButton $variant="outline">
                        <Link href={`/dashboard/criador/campanha/${campaign.campaignCode}/sortear`}>
                          <FaTicketAlt size={14} /> Sortear
                        </Link>
                      </RifaActionButton>
                    )}
                    
                    {/* Botão Editar */}
                    <RifaActionButton $variant="edit">
                      <Link href={`/dashboard/criador/campanha/${campaign.campaignCode}/editar`}>
                        <FaEdit size={14} />
                      </Link>
                    </RifaActionButton>
                  </RifaActions>
                </RifaContent>
              </RifaCard>
            ))}
          </RifaCardsGrid>
        ) : (
          <EmptyState>
            <EmptyStateIcon>
              <FaTicketAlt />
            </EmptyStateIcon>
            <EmptyStateTitle>Nenhuma rifa encontrada</EmptyStateTitle>
            <EmptyStateText>
              Crie sua primeira campanha para começar a vender números e organizar sorteios. Suas campanhas aparecerão aqui para fácil gerenciamento.
            </EmptyStateText>
            <ActionButton>
              <Link href="/dashboard/criador/nova-campanha">
                <FaPlus size={14} />
                Criar Campanha
              </Link>
            </ActionButton>
          </EmptyState>
        )}
      </div>
    </CreatorDashboard>
  );
} 