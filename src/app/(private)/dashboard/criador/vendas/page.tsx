'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import CreatorDashboard from '@/components/dashboard/CreatorDashboard';
import { FaSearch, FaFilter, FaDownload, FaCalendarAlt, FaEye, FaUser, FaEnvelope } from 'react-icons/fa';
import CustomDropdown from '@/components/common/CustomDropdown';
import ResponsiveTable, { ColumnDefinition } from '@/components/common/ResponsiveTable';
import BuyerDetailsModal from '@/components/common/BuyerDetailsModal';
import EmptyStateDisplay from '@/components/common/EmptyStateDisplay';
import { useRouter } from 'next/navigation';

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

const FiltersContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 15px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    gap: 12px;
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
  z-index: 1;
`;

const SearchInput = styled.input`
  width: 100%;
  height: 46px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 0 15px 0 40px;
  font-size: 0.9rem;
  background-color: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;
  position: relative;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  
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
    if ($status === 'success') {
      return `
        background-color: rgba(16, 185, 129, 0.1);
        color: #10b981;
      `;
    } else if ($status === 'pending') {
      return `
        background-color: rgba(245, 158, 11, 0.1);
        color: #f59e0b;
      `;
    } else if ($status === 'refunded') {
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

// Mock data with added phone and address fields
const mockSales = [
  {
    id: '1',
    date: new Date(2025, 5, 10, 15, 30),
    customer: 'João Silva',
    campaign: 'iPhone 15 Pro Max - 256GB',
    numbers: 5,
    payment: {
      amount: 100.0,
      method: 'Cartão de Crédito',
      status: 'success'
    },
    email: 'joao.silva@example.com',
    phone: '(11) 98765-4321',
    address: 'Av. Paulista, 1000 - São Paulo, SP'
  },
  {
    id: '2',
    date: new Date(2025, 5, 9, 10, 45),
    customer: 'Maria Oliveira',
    campaign: 'MacBook Pro 16" M3 Pro',
    numbers: 3,
    payment: {
      amount: 75.0,
      method: 'PIX',
      status: 'success'
    },
    email: 'maria.oliveira@example.com',
    phone: '(21) 98765-4321',
    address: 'Rua Copacabana, 500 - Rio de Janeiro, RJ'
  },
  {
    id: '3',
    date: new Date(2025, 5, 8, 18, 12),
    customer: 'Carlos Santos',
    campaign: 'Playstation 5 + 2 Controles',
    numbers: 10,
    payment: {
      amount: 150.0,
      method: 'Boleto',
      status: 'pending'
    },
    email: 'carlos.santos@example.com',
    phone: '(31) 98765-4321',
    address: 'Av. do Contorno, 789 - Belo Horizonte, MG'
  },
  {
    id: '4',
    date: new Date(2025, 5, 7, 9, 20),
    customer: 'Ana Pereira',
    campaign: 'iPhone 15 Pro Max - 256GB',
    numbers: 2,
    payment: {
      amount: 40.0,
      method: 'Cartão de Crédito',
      status: 'refunded'
    },
    email: 'ana.pereira@example.com',
    phone: '(41) 98765-4321',
    address: 'Rua XV de Novembro, 123 - Curitiba, PR'
  },
  {
    id: '5',
    date: new Date(2025, 5, 6, 14, 55),
    customer: 'Pedro Almeida',
    campaign: 'MacBook Pro 16" M3 Pro',
    numbers: 8,
    payment: {
      amount: 200.0,
      method: 'PIX',
      status: 'success'
    },
    email: 'pedro.almeida@example.com',
    phone: '(51) 98765-4321',
    address: 'Av. Ipiranga, 456 - Porto Alegre, RS'
  }
];

export default function VendasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [campaignFilter, setCampaignFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('todas');
  const [selectedBuyer, setSelectedBuyer] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Filter sales based on search and filters
  const filteredSales = mockSales
    .filter(sale => {
      if (!searchTerm.trim()) return true;
      
      const lowerSearch = searchTerm.toLowerCase();
      return (
        sale.customer.toLowerCase().includes(lowerSearch) ||
        sale.campaign.toLowerCase().includes(lowerSearch) ||
        sale.email.toLowerCase().includes(lowerSearch)
      );
    })
    .filter(sale => {
      if (campaignFilter === 'all') return true;
      return sale.campaign === campaignFilter;
    })
    .filter(sale => {
      if (statusFilter === 'all') return true;
      return sale.payment.status === statusFilter;
    });
  
  // Calculate statistics
  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.payment.amount, 0);
  const totalNumbers = filteredSales.reduce((sum, sale) => sum + sale.numbers, 0);
  const totalPayments = {
    success: filteredSales.filter(sale => sale.payment.status === 'success').length,
    pending: filteredSales.filter(sale => sale.payment.status === 'pending').length,
    refunded: filteredSales.filter(sale => sale.payment.status === 'refunded').length
  };
  
  // Get unique campaigns for filter dropdown
  const campaignOptions = [
    { value: 'all', label: 'Todas as Campanhas' },
    ...Array.from(new Set(mockSales.map(sale => sale.campaign)))
      .map(campaign => ({ value: campaign, label: campaign }))
  ];
  
  const statusOptions = [
    { value: 'all', label: 'Todos os Status' },
    { value: 'success', label: 'Pagos' },
    { value: 'pending', label: 'Pendentes' },
    { value: 'refunded', label: 'Estornados' }
  ];
  
  // Handler for opening buyer details modal
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
          {row.date.toLocaleDateString('pt-BR')}
          <br />
          <span style={{ fontSize: '0.8rem', color: '#666' }}>
            {row.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
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
          <div>{row.customer}</div>
          <MobileViewButton onClick={() => openBuyerModal(row)}>
            <FaEye size={10} /> Detalhes
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
      accessor: (row) => row.campaign,
      sortable: true,
      priority: 3,
      mobileLabel: 'Campanha'
    },
    {
      id: 'numbers',
      header: 'Números',
      accessor: (row) => row.numbers,
      sortable: true,
      align: 'center',
      width: '100px',
      priority: 3,
      mobileLabel: 'Números'
    },
    {
      id: 'amount',
      header: 'Valor',
      accessor: (row) => `R$ ${row.payment.amount.toFixed(2)}`,
      sortable: true,
      align: 'right',
      width: '120px',
      priority: 2,
      mobileLabel: 'Valor'
    },
    {
      id: 'method',
      header: 'Método',
      accessor: (row) => row.payment.method,
      sortable: true,
      priority: 0,
      mobileLabel: 'Método'
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (row) => (
        <StatusTag $status={row.payment.status}>
          {row.payment.status === 'success' && 'Pago'}
          {row.payment.status === 'pending' && 'Pendente'}
          {row.payment.status === 'refunded' && 'Estornado'}
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
      
      <FiltersContainer>
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
        
        <FilterGroup>
          <CustomDropdown
            id="campaign-filter"
            options={campaignOptions}
            value={campaignFilter}
            onChange={setCampaignFilter}
            placeholder="Todas as Campanhas"
            width="200px"
          />
          
          <CustomDropdown
            id="status-filter"
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Todos os Status"
            width="200px"
          />
        </FilterGroup>
      </FiltersContainer>
      
      <StatsContainer>
        <StatCard>
          <StatTitle>Total de Vendas</StatTitle>
          <StatValue>R$ {totalSales.toFixed(2)}</StatValue>
          <StatMeta>De {filteredSales.length} transações</StatMeta>
        </StatCard>
        
        <StatCard>
          <StatTitle>Números Vendidos</StatTitle>
          <StatValue>{totalNumbers}</StatValue>
          <StatMeta>
            Média de {filteredSales.length ? (totalNumbers / filteredSales.length).toFixed(1) : '0'} por venda
          </StatMeta>
        </StatCard>
        
        <StatCard>
          <StatTitle>Pagamentos</StatTitle>
          <StatValue>{totalPayments.success}</StatValue>
          <StatMeta>
            {totalPayments.pending} pendentes • {totalPayments.refunded} estornados
          </StatMeta>
        </StatCard>
      </StatsContainer>
      
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
          Carregando dados de vendas...
        </div>
      ) : (
        <ResponsiveTable
          columns={columns}
          data={filteredSales}
          expandableContent={expandableContent}
          rowKeyField="id"
          initialSortBy={{ id: 'date', desc: true }}
          noDataMessage="Nenhuma venda encontrada"
          stickyHeader
          zebra
          useCustomEmptyState={true}
          emptyStateType="sales"
          emptyStateProps={{
            hasFilters: searchTerm.trim() !== '' || campaignFilter !== 'all' || statusFilter !== 'all',
            onClearFilters: () => {
              setSearchTerm('');
              setCampaignFilter('all');
              setStatusFilter('all');
            },
            onActionClick: () => router.push('/dashboard/criador/nova-rifa')
          }}
        />
      )}
      
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