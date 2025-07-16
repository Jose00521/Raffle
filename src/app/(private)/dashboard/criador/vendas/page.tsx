'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import CreatorDashboard from '@/components/dashboard/CreatorDashboard';
import { FaSearch, FaFilter, FaDownload, FaCalendarAlt, FaEye, FaUser, FaEnvelope, FaCreditCard, FaMoneyBillWave, FaSync, FaTimes } from 'react-icons/fa';
import CustomDropdown from '@/components/common/CustomDropdown';
import ResponsiveTable, { ColumnDefinition } from '@/components/common/ResponsiveTable';
import BuyerDetailsModal from '@/components/common/BuyerDetailsModal';
import EmptyStateDisplay from '@/components/common/EmptyStateDisplay';
import { useRouter } from 'next/navigation';
import { SiPix } from 'react-icons/si';
import { formatCurrency } from '@/utils/formatNumber';
import { PaymentStatusEnum } from '@/models/interfaces/IPaymentInterfaces';
import { useSession } from 'next-auth/react';
import { usePagination } from '@/hooks/usePagination';
import { debounce } from 'lodash';
import { formatLocalDateToEndOfDayISOString, formatLocalDateToISOString } from '@/utils/dateUtils';
import creatorPaymentAPIClient from '@/API/creator/creatorPaymentAPIClient';
import DateRangePicker from '@/components/common/DateRangePicker';
import Pagination from '@/components/common/Pagination';

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
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    width: 100%;
  }
  
  @media (max-width: 480px) {
    gap: 8px;
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
    padding: 8px 12px;
    font-size: 0.9rem;
  }
`;

const SecondaryButton = styled(ActionButton)`
  background: white;
  border: 1px solid rgba(106, 17, 203, 0.2);
  color: #6a11cb;
  
  &:hover {
    background: rgba(106, 17, 203, 0.05);
    box-shadow: 0 4px 12px rgba(106, 17, 203, 0.1);
  }
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
  
  @media (max-width: 768px) {
    width: 100%;
  }
  
  @media (max-width: 480px) {
    gap: 8px;
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const StatCard = styled.div`
  background: white;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  
  @media (min-width: 768px) {
    padding: 18px;
  border-radius: 12px;
  }
`;

const StatTitle = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  margin-bottom: 10px;
  
  @media (min-width: 768px) {
    font-size: 0.9rem;
  }
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  
  @media (min-width: 768px) {
    font-size: 1.75rem;
  }
`;

const StatMeta = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  margin-top: 5px;
  
  @media (min-width: 768px) {
    font-size: 0.85rem;
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

const DetailRow = styled.div`
  display: flex;
  margin-bottom: 8px;
  font-size: 0.85rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.div`
  font-weight: 500;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  width: 120px;
`;

const DetailValue = styled.div`
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
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

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  gap: 20px;
  align-items: end;
  
  @media (max-width: 1400px) {
    grid-template-columns: 2fr 1fr 1fr 1fr auto;
    gap: 16px;
  }
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
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
export default function VendasPage() {
  const [activeTab, setActiveTab] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('');
  const [dateRange, setDateRange] = useState('todas');
  const [dateRangeFilter, setDateRangeFilter] = useState<{startDate: Date | null, endDate: Date | null}>({
    startDate: null,
    endDate: null
  });
  const [selectedBuyer, setSelectedBuyer] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sales, setSales] = useState<any[]>([]);
  const [paginationData, setPaginationData] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<{title: string, campaignCode: string}[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data: session } = useSession();
  

  const router = useRouter();
    // Inicializa o hook de paginação
    const pagination = usePagination({
      totalItems: paginationData?.totalItems || 0,
      initialPage: 1,
      initialPageSize: 10,
      pageSizeOptions: [5, 10, 25, 50]
    });
    
    // Paginar os dados filtrados

    const { 
      currentPage, 
      totalPages, 
      pageSize, 
      pageSizeOptions, 
      setCurrentPage, 
      setPageSize } = pagination;

        // Função para forçar atualização manual dos dados
  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      const params = {
        page: currentPage,
        pageSize: pageSize,
        searchTerm: searchTerm,
        campaignId: activeTab,
        status: viewMode,
        startDate: formatLocalDateToISOString(dateRangeFilter.startDate),
        endDate: formatLocalDateToEndOfDayISOString(dateRangeFilter.endDate)
      }

      console.log(params);


      const response = await creatorPaymentAPIClient.getCreatorPaymentsById(session?.user.id as string, params);
      
      if(response.success) {

      const { paginationData, campaigns, sales } = response.data || { paginationData: null, campaigns: [], sales: [] };
 
      setSales(sales);
      setPaginationData(paginationData);
      setCampaigns(campaigns);

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
        page: currentPage,
        pageSize: pageSize,
        searchTerm: searchTerm,
        campaignId: activeTab,
        status: viewMode,
        startDate: formatLocalDateToISOString(dateRangeFilter.startDate),
        endDate: formatLocalDateToEndOfDayISOString(dateRangeFilter.endDate)
      }

      console.log(params);


      const response = await creatorPaymentAPIClient.getCreatorPaymentsById(session?.user.id as string, params);
      
      if(response.success) {

      const { paginationData, campaigns, sales } = response.data || { paginationData: null, campaigns: [], sales: [] };
 
      setSales(sales);
      setPaginationData(paginationData);
      setCampaigns(campaigns);


      }

      setIsLoading(false);
    }
    fetchSales();
    // Simulate data loading
  }, [currentPage, pageSize, activeTab, viewMode, dateRangeFilter]);
  
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
  
  // Handler for opening buyer details modal
  const openBuyerModal = (sale: any) => {
    setSelectedBuyer(sale);
    setIsModalOpen(true);
  };
  
  const closeBuyerModal = () => {
    setIsModalOpen(false);
  };

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
  
  // Expandable content for the table
  const expandableContent = (sale: any) => (
    <div>
      <DetailRow>
        <DetailLabel>Email:</DetailLabel>
        <DetailValue>{sale.email}</DetailValue>
      </DetailRow>
      <DetailRow>
        <DetailLabel>Números:</DetailLabel>
        <DetailValue>{sale.numbers} números adquiridos</DetailValue>
      </DetailRow>
      <DetailRow>
        <DetailLabel>Método:</DetailLabel>
        <DetailValue>{sale.payment.method}</DetailValue>
      </DetailRow>
      {/* Details button only on mobile, hidden with CSS */}
    </div>
  );
  
  return (
    <CreatorDashboard>
      <PageHeader>
        <Title>Registro de Vendas</Title>
        <ActionButtons>
          <SecondaryButton>
            <FaDownload size={14} />
            Exportar
          </SecondaryButton>
        </ActionButtons>
      </PageHeader>

      <StatsContainer>
        <StatCard>
          <StatTitle>Total de Vendas</StatTitle>
          <StatValue>R$ {32}</StatValue>
          <StatMeta>De {32} transações</StatMeta>
        </StatCard>
        
        <StatCard>
          <StatTitle>Números Vendidos</StatTitle>
          <StatValue>{32}</StatValue>
          <StatMeta>
            Média de {32} por venda
          </StatMeta>
        </StatCard>
        
        <StatCard>
          <StatTitle>Pagamentos</StatTitle>
          <StatValue>{32}</StatValue>
          <StatMeta>
            {32} pendentes • {32} estornados
          </StatMeta>
        </StatCard>
      </StatsContainer>
      
        
        <FiltersContainer>
          <FiltersHeader>
            <FiltersTitle>
              <FaFilter /> Filtros
              <ActiveFiltersCount>
                  {[
                    searchTerm.trim() !== '',
                    activeTab !== '',
                    viewMode !== '',
                    dateRangeFilter.startDate !== null || dateRangeFilter.endDate !== null
                  ].filter(Boolean).length}
                </ActiveFiltersCount>
              </FiltersTitle>
            </FiltersHeader>
          <FiltersGrid>
            <SearchBar>
              <SearchIcon>
                <FaSearch />
              </SearchIcon>
              <SearchInput 
                type="text" 
                placeholder="Buscar por cliente, campanha, email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchBar>
            
            <FilterWrapper>
              <FilterLabel>Campanha:</FilterLabel>
              <CustomDropdown
                id="campaign-filter-vendas"
                options={campaignOptions}
                value={activeTab}
                onChange={setActiveTab}
                placeholder="Todas as Campanhas"
                className="custom-dropdown"
              />
            </FilterWrapper>
            
            <FilterWrapper>
              <FilterLabel>Status:</FilterLabel>
              <CustomDropdown
                id="status-filter-vendas"
                options={statusOptions}
                value={viewMode}
                onChange={setViewMode}
                placeholder="Todos os Status"
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
                setViewMode('');
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
      
      <>
            <ResponsiveTable
              columns={columns}
              data={sales}
              rowKeyField="id"
              noDataMessage="Nenhuma venda encontrada"
              zebra={true}
              isLoading={isLoading}
              useCustomEmptyState={true}
              emptyStateType="payments"
              emptyStateProps={{
                hasFilters: searchTerm.trim() !== '' || activeTab !== '' || viewMode !== '' || dateRangeFilter.startDate !== null || dateRangeFilter.endDate !== null,
                onClearFilters: () => {
                  setSearchTerm('');
                  setActiveTab('');
                  setViewMode('');
                  setDateRangeFilter({ startDate: null, endDate: null });
                },
                onActionClick: () => router.push('/dashboard/criador/nova-rifa')
              }}
            />
            
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={paginationData?.totalItems || 0}
              pageSizeOptions={pageSizeOptions}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </>
              
      
      {isModalOpen && selectedBuyer && (
        <BuyerDetailsModal
          isOpen={isModalOpen}
          buyer={selectedBuyer}
          onClose={closeBuyerModal}
        />
      )}
    </CreatorDashboard>
  );
} 