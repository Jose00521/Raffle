'use client';

import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FaSearch, FaChevronDown, FaChevronUp, FaCheck, 
  FaExternalLinkAlt, FaInfoCircle, FaTimes
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// ============ INTERFACES ============
interface GatewayTemplate {
  _id: string;
  templateCode: string;
  name: string;
  description: string;
  provider: string;
  logo?: string;
  color?: string;
  documentation?: string;
  status: 'ACTIVE' | 'INACTIVE';
  isPublic: boolean;
  credentialFields: any[];
  settingFields: any[];
  supportedMethods: string[];
  minimumAmount?: number;
  maximumAmount?: number;
  currency: string;
  country: string;
}

interface AdvancedGatewayDropdownProps {
  templates: GatewayTemplate[];
  onSelect: (template: GatewayTemplate) => void;
  selectedTemplate: GatewayTemplate | null;
}

// ============ STYLED COMPONENTS ============
const DropdownContainer = styled.div`
  position: relative;
  width: 100%;
`;

const DropdownHeader = styled.div`
  margin-bottom: 20px;
`;

const DropdownTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DropdownDescription = styled.p`
  font-size: 0.95rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 16px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 16px 20px 16px 48px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  background: white;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
  
  &::placeholder {
    color: #94a3b8;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 1rem;
`;

const ClearButton = styled.button`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    color: #64748b;
    background: #f1f5f9;
  }
`;

const GatewayList = styled.div`
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  max-height: 600px;
  overflow-y: auto;
  overflow-x: hidden;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
    
    &:hover {
      background: #94a3b8;
    }
  }
`;

const GatewayItem = styled(motion.div)<{ $selected?: boolean }>`
  padding: 20px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: #f8fafc;
  }
  
  ${props => props.$selected && `
    background: rgba(99, 102, 241, 0.05);
    border-left: 4px solid #6366f1;
    padding-left: 16px;
  `}
`;

const GatewayHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
`;

const GatewayLogo = styled.div<{ $color?: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.$color || '#6366f1'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.2rem;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transform: rotate(45deg);
    transition: all 0.3s ease;
    opacity: 0;
  }
  
  ${GatewayItem}:hover &::before {
    opacity: 1;
    animation: shimmer 0.8s ease;
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
    100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
  }
`;

const GatewayInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const GatewayName = styled.h4`
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const GatewayProvider = styled.span`
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
`;

const GatewayDescription = styled.p`
  font-size: 0.9rem;
  color: #64748b;
  margin: 8px 0 0 0;
  line-height: 1.4;
`;

const GatewayMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 12px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #64748b;
`;

const MethodTag = styled.span`
  padding: 4px 8px;
  background: #f0f9ff;
  color: #0369a1;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const MethodsList = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const DocumentationLink = styled.a`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #6366f1;
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 500;
  transition: color 0.2s ease;
  
  &:hover {
    color: #4f46e5;
  }
`;

const SelectButton = styled.button<{ $selected?: boolean }>`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 32px;
  height: 32px;
  border: 2px solid ${props => props.$selected ? '#6366f1' : '#e2e8f0'};
  border-radius: 50%;
  background: ${props => props.$selected ? '#6366f1' : 'white'};
  color: ${props => props.$selected ? 'white' : '#94a3b8'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #6366f1;
    background: ${props => props.$selected ? '#5855eb' : '#f8fafc'};
  }
`;

const EmptyState = styled.div`
  padding: 60px 20px;
  text-align: center;
  color: #64748b;
`;

const EmptyStateIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const EmptyStateText = styled.p`
  font-size: 1rem;
  margin: 0;
`;

const ResultsCount = styled.div`
  display: fixed;
  padding: 12px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
`;

// ============ COMPONENTE PRINCIPAL ============
export default function AdvancedGatewayDropdown({ 
  templates, 
  onSelect, 
  selectedTemplate 
}: AdvancedGatewayDropdownProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  
  // Filtrar templates baseado na pesquisa
  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (template: GatewayTemplate) => {
    onSelect(template);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'PIX':
        return '💳';
      case 'CREDIT_CARD':
        return '💳';
      case 'BILLET':
        return '📄';
      default:
        return '💰';
    }
  };

  const getMethodName = (method: string) => {
    switch (method) {
      case 'PIX':
        return 'PIX';
      case 'CREDIT_CARD':
        return 'Cartão';
      case 'BILLET':
        return 'Boleto';
      default:
        return method;
    }
  };

  return (
    <DropdownContainer>
      <DropdownHeader>
        <DropdownTitle>
          <FaSearch />
          Escolha um Gateway
        </DropdownTitle>
        <DropdownDescription>
          Selecione o gateway de pagamento que você deseja configurar. 
          Você pode pesquisar pelo nome ou provedor.
        </DropdownDescription>
      </DropdownHeader>

      <SearchContainer>
        <SearchIcon>
          <FaSearch />
        </SearchIcon>
        <SearchInput
          type="text"
          placeholder="Pesquisar gateways..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <ClearButton onClick={handleClearSearch}>
            <FaTimes />
          </ClearButton>
        )}
      </SearchContainer>

      <GatewayList>
        {filteredTemplates.length > 0 && (
          <ResultsCount>
            {filteredTemplates.length} gateway{filteredTemplates.length !== 1 ? 's' : ''} encontrado{filteredTemplates.length !== 1 ? 's' : ''}
          </ResultsCount>
        )}

        <AnimatePresence mode="wait">
          {filteredTemplates.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EmptyState>
                <EmptyStateIcon>🔍</EmptyStateIcon>
                <EmptyStateText>
                  Nenhum gateway encontrado para "{searchTerm}"
                </EmptyStateText>
              </EmptyState>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {filteredTemplates.map((template, index) => (
                <GatewayItem
                  key={template._id}
                  $selected={selectedTemplate?._id === template._id}
                  onClick={() => handleSelect(template)}
                  initial={{ opacity: 0}}
                  animate={{ opacity: 1}}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 4 }}
                >
                  <SelectButton $selected={selectedTemplate?._id === template._id}>
                    {selectedTemplate?._id === template._id && <FaCheck size={12} />}
                  </SelectButton>

                  <GatewayHeader>
                    <GatewayLogo $color={template.color}>
                      {template.name.charAt(0)}
                    </GatewayLogo>
                    
                    <GatewayInfo>
                      <GatewayName>
                        {template.name}
                        {template.status === 'ACTIVE' && (
                          <span style={{ color: '#10b981', fontSize: '0.8rem' }}>●</span>
                        )}
                      </GatewayName>
                      <GatewayProvider>by {template.provider}</GatewayProvider>
                    </GatewayInfo>
                  </GatewayHeader>

                  <GatewayDescription>
                    {template.description}
                  </GatewayDescription>

                  <GatewayMeta>
                    <MetaItem>
                      <span>Métodos:</span>
                      <MethodsList>
                        {template.supportedMethods.map(method => (
                          <MethodTag key={method}>
                            {getMethodIcon(method)} {getMethodName(method)}
                          </MethodTag>
                        ))}
                      </MethodsList>
                    </MetaItem>

                    {template.documentation && (
                      <DocumentationLink
                        href={template.documentation}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FaExternalLinkAlt />
                        Documentação
                      </DocumentationLink>
                    )}
                  </GatewayMeta>
                </GatewayItem>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </GatewayList>
    </DropdownContainer>
  );
} 