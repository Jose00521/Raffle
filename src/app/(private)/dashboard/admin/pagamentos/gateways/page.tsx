'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaSearch, FaPlus, FaCreditCard, FaFilter, FaSortAmountDown } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import GatewayList from '@/components/gateway/template/GatewayList';
import GatewayFilters from '@/components/gateway/GatewayFilters';
import GatewayStatistics from '@/components/gateway/template/GatewayStatistics';
import GatewayFormModal from '@/components/gateway/template/GatewayFormModal';
import { Gateway, mockGatewayData } from '@/mocks/gatewayMocks';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import { toast } from 'react-toastify';

const PageContainer = styled.div`
  padding: 1.5rem;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  svg {
    color: #4f46e5;
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-end;
  }
`;

const Button = styled(motion.button)<{ $variant?: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    color: white;
    border: none;
    
    &:hover {
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
    }
  ` : `
    background: white;
    color: #4f46e5;
    border: 1px solid #e2e8f0;
    
    &:hover {
      border-color: #4f46e5;
      background: #f8fafc;
    }
  `}
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  margin: 1.5rem 0;
  gap: 0.75rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchInput = styled.div`
  display: flex;
  align-items: center;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 0 1rem;
  flex: 1;
  height: 2.75rem;
  
  input {
    border: none;
    background-color: transparent;
    padding: 0.625rem 0;
    width: 100%;
    font-size: 0.875rem;
    color: #1a202c;
    
    &::placeholder {
      color: #a0aec0;
    }
    
    &:focus {
      outline: none;
    }
  }
  
  svg {
    color: #a0aec0;
    margin-right: 0.5rem;
    min-width: 1rem;
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const FilterButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  background: white;
  color: #4b5563;
  border: 1px solid #e2e8f0;
  height: 2.75rem;
  
  &:hover {
    background: #f8fafc;
  }
`;

const ContentSection = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 1.25rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.div``;

const SidebarContent = styled.div`
  @media (max-width: 1024px) {
    grid-row: 1;
  }
`;

export default function GatewaysPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Usando dados mock para demonstração
  const { gateways, statistics } = mockGatewayData;
  
  // Atualizar filtro para considerar os novos campos
  const filteredGateways = gateways.filter(gateway => 
    gateway.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    gateway.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gateway.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    // Verificar métodos de pagamento suportados
    gateway.supportedMethods.some(method => 
      method.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      method.method.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  
  const handleAddGateway = async (formData: FormData) => {
    try {
      // Simular envio para API
      console.log('Dados do novo gateway:', Object.fromEntries(formData.entries()));
      
      // Processar os campos JSON
      const credentialFields = JSON.parse(formData.get('credentialFields') as string);
      const settingFields = JSON.parse(formData.get('settingFields') as string);
      const supportedMethods = JSON.parse(formData.get('supportedMethods') as string);
      
      console.log('Campos de credenciais:', credentialFields);
      console.log('Campos de configuração:', settingFields);
      console.log('Métodos suportados:', supportedMethods);
      
      // Verificar se há arquivo de logo
      const logo = formData.get('logo');
      if (logo instanceof File) {
        console.log('Logo:', logo.name, logo.size, logo.type);
      }
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Gateway adicionado com sucesso!');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao adicionar gateway:', error);
      toast.error('Erro ao adicionar gateway. Por favor tente novamente.');
    }
  };
  
  return (
    <AdminDashboard>
      <PageContainer>
        <PageHeader>
          <Title>
            <FaCreditCard />
            Gateways de Pagamento
          </Title>
          
          <ButtonsContainer>
            <Button 
              $variant="secondary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/dashboard/admin/pagamentos')}
            >
              <FaSortAmountDown />
              Relatórios
            </Button>
            
            <Button 
              $variant="primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsModalOpen(true)}
            >
              <FaPlus />
              Adicionar Gateway
            </Button>
          </ButtonsContainer>
        </PageHeader>
        
        <SearchContainer>
          <SearchInput>
            <FaSearch />
            <input 
              type="text"
              placeholder="Buscar gateway por nome, descrição, provedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchInput>
          
          <FilterButton
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter />
            Filtros
          </FilterButton>
        </SearchContainer>
        
        {showFilters && <GatewayFilters />}
        
        <ContentSection>
          <MainContent>
            <GatewayList gateways={filteredGateways as Gateway[]} />
          </MainContent>
          
          <SidebarContent>
            <GatewayStatistics statistics={statistics} />
          </SidebarContent>
        </ContentSection>
        
        <GatewayFormModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddGateway}
        />
      </PageContainer>
    </AdminDashboard>
  );
}
