'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import CreatorDashboard from '@/components/dashboard/CreatorDashboard';
import { FaTicketAlt, FaMoneyBillWave, FaUsers, FaTrophy, FaSearch, FaFilter, FaDownload, FaCalendarAlt, FaEye, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaTimes, FaCreditCard } from 'react-icons/fa';
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

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: 2.5fr 1fr 1fr 1.2fr auto;
  gap: 20px;
  align-items: end;
  
  @media (max-width: 1400px) {
    grid-template-columns: 2fr 1fr 1fr 1.2fr;
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
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 1400px) {
    grid-column: 1 / -1;
    justify-self: start;
    min-width: 160px;
    margin-top: 8px;
  }
  
  @media (max-width: 1200px) {
    grid-column: 1 / -1;
    justify-self: start;
    min-width: 160px;
    margin-top: 8px;
  }
  
  @media (max-width: 768px) {
    grid-column: 1 / -1;
    justify-self: start;
    min-width: 160px;
    margin-top: 8px;
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

export default function CreatorDashboardHome() {
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
  const [isLoading, setIsLoading] = useState(false);
  const [sales, setSales] = useState<any[]>([]);
  const [paginationData, setPaginationData] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<{title: string, campaignCode: string}[]>([]);
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
  
  return (
    <CreatorDashboard>
          <PageContent>
            <StatCard>
              <CardHeader>
            <CardTitle>Total de Rifas</CardTitle>
                <CardIcon $color="#6a11cb">
                  <FaTicketAlt />
                </CardIcon>
              </CardHeader>
          <CardValue>24</CardValue>
              <CardTrend $positive={true}>
            +5 desde o mês passado
              </CardTrend>
            </StatCard>
            
            <StatCard>
              <CardHeader>
                <CardTitle>Total de Vendas</CardTitle>
                <CardIcon $color="#0ea5e9">
                  <FaMoneyBillWave />
                </CardIcon>
              </CardHeader>
              <CardValue>R$ 24.320</CardValue>
              <CardTrend $positive={true}>
                +R$ 4.500 desde o mês passado
              </CardTrend>
            </StatCard>
            
            <StatCard>
              <CardHeader>
                <CardTitle>Participantes</CardTitle>
                <CardIcon $color="#10b981">
                  <FaUsers />
                </CardIcon>
              </CardHeader>
              <CardValue>152</CardValue>
              <CardTrend $positive={true}>
                +34 desde o mês passado
              </CardTrend>
            </StatCard>
            
            <StatCard>
              <CardHeader>
                <CardTitle>Rifas Finalizadas</CardTitle>
                <CardIcon $color="#f59e0b">
                  <FaTrophy />
                </CardIcon>
              </CardHeader>
              <CardValue>3</CardValue>
              <CardTrend $positive={false}>
                Mesmo número do mês passado
              </CardTrend>
            </StatCard>
          </PageContent>
          
          <Section>
            <SectionHeader>
              <SectionTitle>Desempenho de Vendas</SectionTitle>
            </SectionHeader>
            
            <ChartContainer>
              {/* Aqui seria implementado um gráfico real com biblioteca como Chart.js, Recharts, etc. */}
              <div style={{ color: '#666', fontStyle: 'italic' }}>
                Gráfico de desempenho de vendas (será implementado com Chart.js)
              </div>
            </ChartContainer>
          </Section>
          
            <Section>
              <SectionHeader>
                <SectionTitle>Vendas Recentes</SectionTitle>
                <SectionLink href="/dashboard/criador/vendas">
                  Ver todas
                </SectionLink>
              </SectionHeader>
              
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
                id="campaign-filter"
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
                id="status-filter"
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
            <ClearFiltersButton onClick={() => {
              setSearchTerm('');
              setActiveTab('');
              setViewMode('');
              setDateRangeFilter({ startDate: null, endDate: null });
            }}>
              Limpar Filtros
            </ClearFiltersButton>
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
            </Section>
      
      {selectedBuyer && (
        <BuyerDetailsModal
          isOpen={isModalOpen}
          onClose={closeBuyerModal}
          buyer={selectedBuyer}
        />
      )}
    </CreatorDashboard>
  );
} 