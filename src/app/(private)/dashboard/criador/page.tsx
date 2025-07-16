'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import CreatorDashboard from '@/components/dashboard/CreatorDashboard';
import { FaTicketAlt, FaMoneyBillWave, FaUsers, FaTrophy, FaSearch, FaFilter, FaDownload, FaCalendarAlt, FaEye, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaTimes, FaCreditCard, FaSync } from 'react-icons/fa';
import CustomDropdown from '@/components/common/CustomDropdown';
import ResponsiveTable, { ColumnDefinition } from '@/components/common/ResponsiveTable';
import BuyerDetailsModal from '@/components/common/BuyerDetailsModal';
import Pagination from '@/components/common/Pagination';
import EmptyStateDisplay from '@/components/common/EmptyStateDisplay';
import DateRangePicker from '@/components/common/DateRangePicker';
import { formatLocalDateToISOString, formatLocalDateToEndOfDayISOString } from '@/utils/dateUtils';
import { usePagination } from '@/hooks/usePagination';
import Link from 'next/link';
import creatorPaymentAPIClient from '@/API/creator/creatorPaymentAPIClient';
import { useSession } from 'next-auth/react';
import { formatCurrency } from '@/utils/formatNumber';
import { SiPix } from 'react-icons/si';
import { PaymentStatusEnum } from '@/models/interfaces/IPaymentInterfaces';
import { useRouter } from 'next/navigation';

import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

import debounce from 'lodash/debounce';

// Styled Components for statistics cards
const PageContent = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  
  @media (min-width: 480px) {
  grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
`;

const StatCard = styled.div`
  background: white;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
  }
  
  @media (min-width: 768px) {
    padding: 18px;
    border-radius: 12px;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  
  @media (min-width: 768px) {
    margin-bottom: 16px;
  }
`;

const CardTitle = styled.h3`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  margin: 0;
  
  @media (min-width: 768px) {
    font-size: 0.85rem;
  }
`;

const CardIcon = styled.div<{ $color: string }>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background-color: ${props => props.$color || '#6a11cb'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.9rem;
  
  @media (min-width: 768px) {
    width: 36px;
    height: 36px;
    font-size: 1rem;
    border-radius: 10px;
  }
`;

const CardValue = styled.div`
  font-size: 1.35rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  
  @media (min-width: 768px) {
    font-size: 1.5rem;
  }
`;

const CardTrend = styled.div<{ $positive?: boolean }>`
  display: flex;
  align-items: center;
  margin-top: 8px;
  font-size: 0.75rem;
  font-weight: 500;
  color: ${props => props.$positive ? '#10b981' : '#ef4444'};
  
  @media (min-width: 768px) {
    font-size: 0.8rem;
    margin-top: 10px;
  }
`;

const Section = styled.section`
  margin-top: 24px;
  
  @media (min-width: 768px) {
  margin-top: 30px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  @media (min-width: 768px) {
  margin-bottom: 15px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.05rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  margin: 0;
  
  @media (min-width: 768px) {
    font-size: 1.15rem;
  }
`;

const SectionLink = styled(Link)`
  color: ${({ theme }) => theme.colors?.primary || '#6a11cb'};
  font-size: 0.75rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  text-decoration: none;
  padding: 6px;
  margin: -6px;
  
  &:hover {
    text-decoration: underline;
  }
  
  @media (min-width: 768px) {
    font-size: 0.8rem;
  }
`;

const ChartContainer = styled.div`
  background: white;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (min-width: 768px) {
    padding: 18px;
    border-radius: 12px;
    height: 300px;
  }
`;


// Styled Components for sales table
const FiltersContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
  border: 1px solid rgba(0, 0, 0, 0.05);
`;

const FiltersHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
`;

const FiltersTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ActiveFiltersCount = styled.span`
  background: linear-gradient(135deg, #6a11cb 0%, #8b5cf6 100%);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 12px;
  min-width: 20px;
  text-align: center;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    
    button {
      width: 100%;
    }
  }
`;

// Skeleton Loading Components
const SkeletonBase = styled.div`
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 8px;
  
  @keyframes skeleton-loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

const SkeletonStatCard = styled(StatCard)`
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    animation: shimmer 1.5s infinite;
  }
  
  @keyframes shimmer {
    0% { left: -100%; }
    100% { left: 100%; }
  }
`;

const SkeletonCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  
  @media (min-width: 768px) {
    margin-bottom: 16px;
  }
`;

const SkeletonCardTitle = styled(SkeletonBase)`
  height: 16px;
  width: 80px;
  
  @media (min-width: 768px) {
    height: 18px;
    width: 90px;
  }
`;

const SkeletonCardIcon = styled(SkeletonBase)`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  
  @media (min-width: 768px) {
    width: 36px;
    height: 36px;
    border-radius: 10px;
  }
`;

const SkeletonCardValue = styled(SkeletonBase)`
  height: 32px;
  width: 120px;
  margin-bottom: 8px;
  
  @media (min-width: 768px) {
    height: 36px;
    width: 140px;
    margin-bottom: 10px;
  }
`;

const SkeletonCardTrend = styled(SkeletonBase)`
  height: 14px;
  width: 160px;
  
  @media (min-width: 768px) {
    height: 16px;
    width: 180px;
  }
`;

const SkeletonFiltersContainer = styled(FiltersContainer)`
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    animation: shimmer 1.5s infinite;
  }
`;

const SkeletonFilterTitle = styled(SkeletonBase)`
  height: 20px;
  width: 80px;
  margin-bottom: 20px;
`;

const SkeletonFilterInput = styled(SkeletonBase)`
  height: 52px;
  width: 100%;
  border-radius: 10px;
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1.5fr auto;
  gap: 20px;
  align-items: end;
  
  @media (max-width: 1400px) {
    grid-template-columns: 2fr 1.5fr auto;
    gap: 16px;
  }
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    
    ${ButtonsContainer} {
      grid-column: 1 / -1;
      margin-top: 8px;
    }
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
    
    ${ButtonsContainer} {
      grid-column: 1 / -1;
      margin-top: 8px;
    }
  }
`;

const SearchBar = styled.div`
  position: relative;
  width: 100%;
  
  @media (max-width: 1200px) {
    grid-column: 1 / -1;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  font-size: 1rem;
  pointer-events: none;
  z-index: 1;
`;

const SearchInput = styled.input`
  width: 100%;
  height: 52px;
  border-radius: 10px;
  border: 2px solid rgba(0, 0, 0, 0.08);
  padding: 0 20px 0 48px;
  font-size: 1rem;
  background-color: #fafbfc;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
  transition: all 0.3s ease;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  
  &:focus {
    outline: none;
    border-color: #6a11cb;
    background-color: white;
    box-shadow: 0 0 0 4px rgba(106, 17, 203, 0.08);
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
    opacity: 0.8;
  }
`;

const FilterWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  /* Padronizar altura dos elementos de filtro */
  .custom-dropdown button,
  .date-range-input {
    height: 52px !important;
    border-radius: 10px !important;
    border: 2px solid rgba(0, 0, 0, 0.08) !important;
    background-color: #fafbfc !important;
    font-size: 1rem !important;
    
    &:focus {
      background-color: white !important;
      border-color: #6a11cb !important;
      box-shadow: 0 0 0 4px rgba(106, 17, 203, 0.08) !important;
    }
  }
`;

const FilterLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  margin-bottom: 4px;
`;

const ClearFiltersButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 2px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 52px;
  min-width: 140px;
  white-space: nowrap;
  
  &:hover {
    background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
    border-color: rgba(0, 0, 0, 0.12);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const RefreshButton = styled.button<{ $isLoading?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: ${({ $isLoading }) => $isLoading ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  height: 52px;
  min-width: 140px;
  white-space: nowrap;
  opacity: ${({ $isLoading }) => $isLoading ? 0.7 : 1};
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #5a0fb5 0%, #1e5ce6 100%);
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(106, 17, 203, 0.3);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(106, 17, 203, 0.3);
  }
  
  svg {
    animation: ${({ $isLoading }) => $isLoading ? 'spin 1s linear infinite' : 'none'};
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const PaymentMethodContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PaymentMethodIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  min-width: 28px;
  min-height: 28px;
  border-radius: 6px;
  background-color: rgba(0, 0, 0, 0.04);
`;

const ViewButton = styled.button`
  padding: 6px 12px;
  background-color: rgba(106, 17, 203, 0.1);
  color: #6a11cb;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(106, 17, 203, 0.15);
    transform: translateY(-1px);
  }
`;

// Add a new styled component for the mobile details button
const MobileViewButton = styled.button`
  padding: 4px 8px;
  background-color: rgba(106, 17, 203, 0.1);
  color: #6a11cb;
  border: none;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  display: none;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  margin-left: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(106, 17, 203, 0.15);
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    display: inline-flex;
  }
`;

const StatusTag = styled.span<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  
  ${({ $status }) => {
    if ($status === 'APPROVED') {
      return `
        background-color: rgba(16, 185, 129, 0.1);
        color: #10b981;
      `;
    } else if ($status === 'PENDING') {
      return `
        background-color: rgba(245, 158, 11, 0.1);
        color: #f59e0b;
      `;
    } else if ($status === 'REFUNDED' || $status === 'FAILED' || $status === 'EXPIRED') {
      return `
        background-color: rgba(239, 68, 68, 0.1);
        color: #ef4444;
      `;
    } else {
      return `
        background-color: rgba(107, 114, 128, 0.1);
        color: #6b7280;
      `;
    }
  }}
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  height: 320px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  }
  
  @media (max-width: 900px) {
    height: 300px;
    padding: 20px;
  }
  
  @media (max-width: 768px) {
    height: 280px;
  }
  
  @media (max-width: 480px) {
    height: 260px;
    padding: 20px;
  }
  
  h3 {
    margin: 0 0 20px;
    font-size: 1.05rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
    
    @media (max-width: 480px) {
      font-size: 0.95rem;
      margin: 0 0 16px;
    }
  }
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
    margin-bottom: 28px;
  }
`;

// Skeleton components for charts (defined after ChartCard)
const SkeletonChartCard = styled(ChartCard)`
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    animation: shimmer 1.5s infinite;
  }
`;

const SkeletonChartTitle = styled(SkeletonBase)`
  height: 20px;
  width: 180px;
  margin-bottom: 20px;
  
  @media (max-width: 480px) {
    height: 18px;
    width: 160px;
    margin-bottom: 16px;
  }
`;

const SkeletonChart = styled(SkeletonBase)`
  height: calc(100% - 60px);
  width: 100%;
  border-radius: 12px;
  
  @media (max-width: 480px) {
    height: calc(100% - 50px);
  }
`;

export default function CreatorDashboardHome() {
  const [activeTab, setActiveTab] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState<{startDate: Date | null, endDate: Date | null}>({
    startDate: new Date(),
    endDate: new Date()
  });
  const [selectedBuyer, setSelectedBuyer] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sales, setSales] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<{title: string, campaignCode: string}[]>([]);
  const [statsData, setStatsData] = useState<any>({});
  const [salesByDayData, setSalesByDayData] = useState<any[]>([]);
  const [totalCampaignsCount, setTotalCampaignsCount] = useState<number>(0);
  const [totalCampaignsCountCompleted, setTotalCampaignsCountCompleted] = useState<number>(0);
  const { data: session } = useSession();
  

  const router = useRouter();

  // Função para forçar atualização manual dos dados
  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      const params = {
        pageSize: 5,
        searchTerm: searchTerm,
        campaignId: activeTab,
        startDate: formatLocalDateToISOString(dateRangeFilter.startDate),
        endDate: formatLocalDateToEndOfDayISOString(dateRangeFilter.endDate)
      };

      const response = await creatorPaymentAPIClient.getLatestCreatorPaymentsById(session?.user.id as string, params);
      
      if(response.success) {
        const { campaigns, sales, stats, salesByDay, totalCampaignsCount, totalCampaignsCountCompleted } = response.data || { 
          paginationData: null, 
          campaigns: [], 
          sales: [], 
          stats: { totalParticipants: 0 }, 
          salesByDay: [] 
        };
   
        setSales(sales);
        setCampaigns(campaigns);
        setStatsData(stats);
        setSalesByDayData(salesByDay);
        setTotalCampaignsCount(totalCampaignsCount);
        setTotalCampaignsCountCompleted(totalCampaignsCountCompleted);
      }
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  
  useEffect(() => {
    debounce(() => {
      setIsLoading(true);
    }, 1000);
    const fetchSales = async () => {
      const params = {
        pageSize: 5,
        searchTerm: searchTerm,
        campaignId: activeTab,
        startDate: formatLocalDateToISOString(dateRangeFilter.startDate),
        endDate: formatLocalDateToEndOfDayISOString(dateRangeFilter.endDate)
      }

      console.log(params);


      const response = await creatorPaymentAPIClient.getLatestCreatorPaymentsById(session?.user.id as string, params);
      
      if(response.success) {

      const { campaigns, sales, stats, salesByDay, totalCampaignsCount, totalCampaignsCountCompleted } = response.data || { paginationData: null, campaigns: [], sales: [], stats: { totalParticipants: 0 }, salesByDay: [] };
 
      setSales(sales);
      setCampaigns(campaigns);
      setStatsData(stats);
      setSalesByDayData(salesByDay);
      setTotalCampaignsCount(totalCampaignsCount);
      setTotalCampaignsCountCompleted(totalCampaignsCountCompleted);
      }

      setIsLoading(false);
    }
    fetchSales();
    // Simulate data loading
  }, [activeTab, dateRangeFilter]);
  

  
  // Calculate statistics
  // const totalSales = filteredSales.reduce((sum, sale) => sum + sale.payment.amount, 0);
  // const totalNumbers = filteredSales.reduce((sum, sale) => sum + sale.numbers, 0);
  // const totalPayments = {
  //   success: filteredSales.filter(sale => sale.payment.status === 'success').length,
  //   pending: filteredSales.filter(sale => sale.payment.status === 'pending').length,
  //   refunded: filteredSales.filter(sale => sale.payment.status === 'refunded').length
  // };
  
  // Get unique campaigns for filter dropdown
  const campaignOptions = [
    { value: '', label: 'Todas as Campanhas' },
    ...campaigns.map(campaign => ({ value: campaign.campaignCode, label: campaign.title }))
  ];

  const statusOptions = [
    { value: '', label: 'Todos os Status' },
    { value: PaymentStatusEnum.APPROVED, label: 'Pagos' },
    { value: PaymentStatusEnum.PENDING, label: 'Pendentes' },
    { value: PaymentStatusEnum.EXPIRED, label: 'Expirado' },  
    { value: PaymentStatusEnum.REFUNDED, label: 'Estornados' },
    { value: PaymentStatusEnum.FAILED, label: 'Falhou' },
  ];

  const getPaymentIcon = (method: string) => {
    method = method.toLowerCase();
    if (method.includes('pix')) {
      return <SiPix size={16} />;
    } else if (method.includes('CREDIT_CARD') || method.includes('DEBIT_CARD') || method.includes('CREDIT_CARD')) {
      return <FaCreditCard size={16} />;
    } else {
      return <FaMoneyBillWave size={16} />;
    }
  };
  
  const openBuyerModal = (sale: any) => {
    setSelectedBuyer(sale);
    setIsModalOpen(true);
  };
  
  const closeBuyerModal = () => {
    setIsModalOpen(false);
  };
  
  // Column definitions for the table
  const columns: ColumnDefinition[] = [
    {
      id: 'date',
      header: 'Data',
      accessor: (row) => (
        <>
          {new Date(row.approvedAt || row.createdAt).toLocaleDateString('pt-BR')}
          <br />
          <span style={{ fontSize: '0.8rem', color: '#666' }}>
            {new Date(row.approvedAt || row.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </>
      ),
      sortable: true,
      width: '120px',
      priority: 2,
      mobileLabel: 'Data'
    },
    {
      id: 'customer',
      header: 'Cliente',
      accessor: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div>{row.customerInfo.name}</div>
          <MobileViewButton onClick={() => openBuyerModal(row)}>
            <FaEye size={10} /> Ver detalhes
          </MobileViewButton>
        </div>
      ),
      sortable: true,
      priority: 1,
      mobileLabel: 'Cliente'
    },
    {
      id: 'campaign',
      header: 'Campanha',
      accessor: (row) => row.campaignId?.title || "N/A",
      sortable: true,
      priority: 3,
      mobileLabel: 'Campanha'
    },
    {
      id: 'numbers',
      header: 'Números',
      accessor: (row) => row.numbersQuantity,
      sortable: true,
      width: '100px',
      priority: 3,
      mobileLabel: 'Números'
    },
    {
      id: 'amount',
      header: 'Valor',
      accessor: (row) => formatCurrency(row.amount),
      sortable: true,
      width: '120px',
      priority: 2,
      mobileLabel: 'Valor'
    },
    {
      id: 'amountReceived',
      header: 'Valor Recebido',
      accessor: (row) => formatCurrency(row.amountReceived),
      sortable: true,
      width: '120px',
      priority: 2,
      mobileLabel: 'Valor Recebido'
    },
    {
      id: 'method',
      header: 'Método',
      accessor: (row) => (
        <PaymentMethodContainer>
        <PaymentMethodIcon>
          {getPaymentIcon(row.paymentMethod)}
        </PaymentMethodIcon>
        {row.paymentMethod}
      </PaymentMethodContainer>
      ),
      sortable: true,
      priority: 0,
      mobileLabel: 'Método'
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (row) => (
        <StatusTag $status={row.status}>
          {row.status === 'APPROVED' && 'Pago'}
          {row.status === 'INITIALIZED' && 'Iniciado'}
          {row.status === 'EXPIRED' && 'Expirado'}
          {row.status === 'PENDING' && 'Pendente'}
          {row.status === 'REFUNDED' && 'Estornado'}
          {row.status === 'FAILED' && 'Falhou'}
        </StatusTag>
      ),
      sortable: true,
      width: '120px',
      priority: 2,
      mobileLabel: 'Status'
    },
    {
      id: 'actions',
      header: 'Ações',
      accessor: (row) => (
        <ViewButton onClick={() => openBuyerModal(row)}>
          <FaEye size={12} /> Detalhes
        </ViewButton>
      ),
      width: '100px',
      priority: 0,
      mobileLabel: 'Ações'
    }
  ];
  
  // Componente Skeleton para os primeiros cards estáticos
  const SkeletonStaticCards = () => (
    <PageContent>
      <SkeletonStatCard>
        <SkeletonCardHeader>
          <SkeletonCardTitle />
          <SkeletonCardIcon />
        </SkeletonCardHeader>
        <SkeletonCardValue />
        <SkeletonCardTrend />
      </SkeletonStatCard>

      <SkeletonStatCard>
        <SkeletonCardHeader>
          <SkeletonCardTitle />
          <SkeletonCardIcon />
        </SkeletonCardHeader>
        <SkeletonCardValue />
        <SkeletonCardTrend />
      </SkeletonStatCard>
    </PageContent>
  );

  // Componente Skeleton para filtros
  const SkeletonFilters = () => (
    <Section>
      <SkeletonFiltersContainer>
        <FiltersHeader>
          <SkeletonFilterTitle />
        </FiltersHeader>
        <FiltersGrid>
          <FilterWrapper>
            <FilterLabel>Campanha:</FilterLabel>
            <SkeletonFilterInput />
          </FilterWrapper>
          
          <FilterWrapper>
            <FilterLabel>Período:</FilterLabel>
            <SkeletonFilterInput />
          </FilterWrapper>
          
          <ButtonsContainer>
            <SkeletonFilterInput style={{ minWidth: '140px', height: '52px' }} />
            <SkeletonFilterInput style={{ minWidth: '140px', height: '52px' }} />
          </ButtonsContainer>
        </FiltersGrid>
      </SkeletonFiltersContainer>
    </Section>
  );

  // Componente Skeleton para estatísticas dinâmicas
  const SkeletonDynamicStats = () => (
    <PageContent>
      <SkeletonStatCard>
        <SkeletonCardHeader>
          <SkeletonCardTitle />
          <SkeletonCardIcon />
        </SkeletonCardHeader>
        <SkeletonCardValue />
        <SkeletonCardTrend />
      </SkeletonStatCard>

      <SkeletonStatCard>
        <SkeletonCardHeader>
          <SkeletonCardTitle />
          <SkeletonCardIcon />
        </SkeletonCardHeader>
        <SkeletonCardValue />
        <SkeletonCardTrend />
      </SkeletonStatCard>

      <SkeletonStatCard>
        <SkeletonCardHeader>
          <SkeletonCardTitle />
          <SkeletonCardIcon />
        </SkeletonCardHeader>
        <SkeletonCardValue />
        <SkeletonCardTrend />
      </SkeletonStatCard>
      
      <SkeletonStatCard>
        <SkeletonCardHeader>
          <SkeletonCardTitle />
          <SkeletonCardIcon />
        </SkeletonCardHeader>
        <SkeletonCardValue />
        <SkeletonCardTrend />
      </SkeletonStatCard>
    </PageContent>
  );

  // Componente Skeleton para gráficos
  const SkeletonCharts = () => (
    <Section>
      <ChartsGrid>
        <SkeletonChartCard>
          <SkeletonChartTitle />
          <SkeletonChart />
        </SkeletonChartCard>

        <SkeletonChartCard>
          <SkeletonChartTitle />
          <SkeletonChart />
        </SkeletonChartCard>
      </ChartsGrid>
    </Section>
  );

  return (
    <CreatorDashboard>

      {/* Skeleton ou conteúdo real baseado no loading */}
      {isLoading ? (
        <>
          <SkeletonStaticCards />
          <SkeletonFilters />
          <SkeletonDynamicStats />
          <SkeletonCharts />
        </>
      ) : (
        <>
              {/* Cards estáticos sempre visíveis */}
      <PageContent>
        <StatCard>
          <CardHeader>
            <CardTitle>Total de Rifas</CardTitle>
            <CardIcon $color="#6a11cb">
              <FaTicketAlt />
            </CardIcon>
          </CardHeader>
          <CardValue>{totalCampaignsCount}</CardValue>
          <CardTrend $positive={true}>
            
          </CardTrend>
        </StatCard>
        
        <StatCard>
          <CardHeader>
            <CardTitle>Rifas Finalizadas</CardTitle>
            <CardIcon $color="#f59e0b">
              <FaTrophy />
            </CardIcon>
          </CardHeader>
          <CardValue>{totalCampaignsCountCompleted}</CardValue>
          <CardTrend $positive={false}>
            
          </CardTrend>
        </StatCard>
      </PageContent>
          <Section>
            <FiltersContainer>
              <FiltersHeader>
                <FiltersTitle>
                  <FaFilter /> Filtros
                  <ActiveFiltersCount>
                    {[
                      searchTerm.trim() !== '',
                      activeTab !== '',
                      dateRangeFilter.startDate !== null || dateRangeFilter.endDate !== null
                    ].filter(Boolean).length}
                  </ActiveFiltersCount>
                </FiltersTitle>
              </FiltersHeader>
              <FiltersGrid>
                <FilterWrapper>
                  <FilterLabel>Campanha:</FilterLabel>
                  <CustomDropdown
                    id="campaign-filter-dashboard"
                    options={campaignOptions}
                    value={activeTab}
                    onChange={setActiveTab}
                    placeholder="Todas as Campanhas"
                    className="custom-dropdown"
                  />
                </FilterWrapper>
                
                <FilterWrapper>
                  <FilterLabel>Período:</FilterLabel>
                  <DateRangePicker
                    value={dateRangeFilter}
                    onChange={setDateRangeFilter}
                    placeholder="Selecione o período"
                  />
                </FilterWrapper>
                
                <ButtonsContainer>
                  <ClearFiltersButton onClick={() => {
                    setSearchTerm('');
                    setActiveTab('');
                    setDateRangeFilter({ startDate: null, endDate: null });
                  }}>
                    <FaTimes />
                    Limpar Filtros
                  </ClearFiltersButton>
                  
                  <RefreshButton 
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    $isLoading={isRefreshing}
                  >
                    <FaSync />
                    {isRefreshing ? 'Atualizando...' : 'Atualizar'}
                  </RefreshButton>
                </ButtonsContainer>
              </FiltersGrid>
            </FiltersContainer>
          </Section>

          {!statsData.vendas ? (
            <SkeletonDynamicStats />
          ) : (
            <PageContent>
              <StatCard>
                <CardHeader>
                  <CardTitle>Receita Bruta</CardTitle>
                  <CardIcon $color="#0ea5e9">
                    <FaMoneyBillWave />
                  </CardIcon>
                </CardHeader>
                <CardValue>{formatCurrency(statsData.valores.bruto)}</CardValue>
                <CardTrend $positive={true}>
                  Comparado ao período anterior
                </CardTrend>
              </StatCard>

              <StatCard>
                <CardHeader>
                  <CardTitle>Receita Líquida</CardTitle>
                  <CardIcon $color="#0ea5e9">
                    <FaMoneyBillWave />
                  </CardIcon>
                </CardHeader>
                <CardValue>{formatCurrency(statsData.valores.liquido)}</CardValue>
                <CardTrend $positive={true}>
                  Comparado ao período anterior
                </CardTrend>
              </StatCard>

              <StatCard>
                <CardHeader>
                  <CardTitle>Quantidade de Vendas</CardTitle>
                  <CardIcon $color="#0ea5e9">
                    <FaMoneyBillWave />
                  </CardIcon>
                </CardHeader>
                <CardValue>{statsData.vendas.total}</CardValue>
                <CardTrend $positive={true}>
                  Comparado ao período anterior
                </CardTrend>
              </StatCard>
              
              <StatCard>
                <CardHeader>
                  <CardTitle>Participantes</CardTitle>
                  <CardIcon $color="#10b981">
                    <FaUsers />
                  </CardIcon>
                </CardHeader>
                <CardValue>{statsData.vendas.participantesUnicos}</CardValue>
                <CardTrend $positive={true}>
                  Comparado ao período anterior
                </CardTrend>
              </StatCard>
            </PageContent>
          )}

          <Section>
            {/* Gráfico com duas linhas: Faturamento e Vendas */}
            <ChartsGrid>
              <ChartCard>
                <h3>Desempenho de Vendas</h3>
                <ResponsiveContainer width="100%" height="90%">
                  <LineChart 
                    data={salesByDayData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#9CA3AF' }}
                    />
                    <YAxis 
                      yAxisId="valorLiquido"
                      orientation="left"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#9CA3AF' }}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <YAxis 
                      yAxisId="sales"
                      orientation="right"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#9CA3AF' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                      }}
                      formatter={(value: any, name: string) => {
                        if (name === 'Faturamento') {
                          return [formatCurrency(value), name];
                        }
                        return [value, name];
                      }}
                      labelFormatter={(label) => `Data: ${label}`}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      iconType="line"
                      wrapperStyle={{ 
                        paddingTop: '20px',
                        fontSize: '14px'
                      }}
                    />
                    
                    {/* Linha do Faturamento (Azul) */}
                    <Line 
                      yAxisId="valorLiquido"
                      type="monotone" 
                      dataKey="valorLiquido" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2, fill: '#fff' }}
                      name="Faturamento"
                    />
                    
                    {/* Linha das Vendas (Verde) */}
                    <Line 
                      yAxisId="sales"
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2, fill: '#fff' }}
                      name="Vendas"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard>
                <h3>Desempenho de Participantes</h3>
                <ResponsiveContainer width="100%" height="90%">
                  <LineChart 
                    data={salesByDayData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#9CA3AF' }}
                    />
                    <YAxis 
                      yAxisId="participantesUnicos"
                      orientation="left"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#9CA3AF' }}
                      tickFormatter={(value) => value}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                      }}
                      formatter={(value: any, name: string) => {
                        if (name === 'Participantes') {
                          return [value, name];
                        }
                        return [value, name];
                      }}
                      labelFormatter={(label) => `Data: ${label}`}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      iconType="line"
                      wrapperStyle={{ 
                        paddingTop: '20px',
                        fontSize: '14px'
                      }}
                    />
                    
                    {/* Linha dos Participantes (Roxo) */}
                    <Line 
                      yAxisId="participantesUnicos"
                      type="monotone" 
                      dataKey="participantesUnicos" 
                      stroke="#8B5CF6" 
                      strokeWidth={3}
                      dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2, fill: '#fff' }}
                      name="Participantes"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </ChartsGrid>
          </Section>
        </>
      )}

      {/* Modal de detalhes do comprador */}
      <BuyerDetailsModal
        isOpen={isModalOpen}
        onClose={closeBuyerModal}
        buyer={selectedBuyer}
      />
    </CreatorDashboard>
  );
} 