'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styled from 'styled-components';
import { 
  FaArrowLeft, FaChartLine, FaTrophy, FaTicketAlt,
  FaCalendarAlt, FaUsers, FaMoneyBillWave, FaPercentage,
  FaSpinner, FaEye, FaExternalLinkAlt, FaInfoCircle, FaGift,
  FaWhatsapp, FaEnvelope, FaPhone, FaCheck, FaShippingFast, 
  FaTimes, FaLongArrowAltRight, FaTrash
} from 'react-icons/fa';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';
import CreatorDashboard from '@/components/dashboard/CreatorDashboard';
import BuyerDetailsModal from '@/components/common/BuyerDetailsModal';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import ResponsiveTable, { ColumnDefinition } from '@/components/common/ResponsiveTable';
import campaignAPIClient from '@/API/participant/participantCampaignAPIClient';
import { CampaignStatusEnum, ICampaign } from '@/models/interfaces/ICampaignInterfaces';
import creatorCampaignAPI from '@/API/creator/creatorCampaignAPIClient';

// Componentes estilizados
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
  flex-wrap: wrap;
  
  @media (max-width: 600px) {
    gap: 12px;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  }
`;

const PageTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
  margin-left: auto;
  
  @media (max-width: 480px) {
    margin-left: 0;
    width: 100%;
    margin-top: 8px;
    
    > a {
      width: 100%;
      justify-content: center;
    }
  }
`;

const PublicLinkButton = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  box-shadow: 0 2px 8px rgba(106, 17, 203, 0.3);
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(106, 17, 203, 0.4);
  }
  
  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 0.8rem;
  }
`;

const CampaignInfoCard = styled.div`
  display: flex;
  gap: 28px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  padding: 28px;
  margin-bottom: 32px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
    padding: 24px;
  }
  
  @media (max-width: 480px) {
    padding: 20px;
    margin-bottom: 24px;
    gap: 16px;
  }
`;

const CampaignImageContainer = styled.div`
  width: 180px;
  height: 180px;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
  align-self: flex-start;
  
  @media (max-width: 768px) {
    width: 120px;
    height: 120px;
  }
  
  @media (max-width: 480px) {
    width: 100px;
    height: 100px;
  }
`;

const CampaignImage = styled.div<{ $imageUrl: string }>`
  width: 100%;
  height: 100%;
  background-image: url(${props => props.$imageUrl});
  background-size: cover;
  background-position: center;
  border-radius: 8px;
`;

const CampaignDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const CampaignTitle = styled.h2`
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0 0 8px;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const CampaignDescription = styled.p`
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  margin: 0 0 16px;
  line-height: 1.6;
`;

const CampaignMetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: auto;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const CampaignMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  span {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
    
    @media (max-width: 480px) {
      font-size: 0.85rem;
    }
  }
  
  strong {
    font-weight: 600;
    color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  }
`;

const TableActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'outline' }>`
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => {
    if (props.$variant === 'outline') return 'transparent';
    if (props.$variant === 'secondary') return '#e5e7eb';
    return 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)';
  }};
  color: ${props => props.$variant === 'outline' ? '#6a11cb' : (props.$variant === 'secondary' ? '#333' : 'white')};
  border: ${props => props.$variant === 'outline' ? '1px solid #6a11cb' : 'none'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  overflow-x: auto;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding-bottom: 2px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  
  &::-webkit-scrollbar {
    height: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }
  
  @media (max-width: 480px) {
    gap: 0;
  }
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 12px 20px;
  background: ${props => props.$active ? 'white' : 'transparent'};
  border: none;
  border-bottom: 3px solid ${props => props.$active ? '#6a11cb' : 'transparent'};
  font-weight: ${props => props.$active ? '600' : '400'};
  color: ${props => props.$active ? '#6a11cb' : '#666'};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    color: #6a11cb;
  }
  
  @media (max-width: 480px) {
    padding: 10px 15px;
    font-size: 0.9rem;
    gap: 6px;
  }
`;

const MainStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 32px;
  
  @media (max-width: 900px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 24px;
  }
`;

const StatCard = styled.div<{ $color?: string }>`
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  padding: 24px;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid rgba(226, 232, 240, 0.8);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  }
  
  @media (max-width: 900px) {
    padding: 20px;
  }
  
  @media (max-width: 480px) {
    padding: 20px;
  }
  
  h3 {
    font-size: 0.95rem;
    font-weight: 500;
    margin: 0 0 12px;
    color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
    display: flex;
    align-items: center;
    gap: 10px;
    
    svg {
      color: ${props => props.$color || '#6a11cb'};
      font-size: 1.1rem;
    }
    
    @media (max-width: 480px) {
      font-size: 0.9rem;
      margin: 0 0 10px;
    }
  }
  
  h2 {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0;
    color: ${props => props.$color || props.theme?.colors?.text?.primary || '#333'};
    
    @media (max-width: 900px) {
      font-size: 1.6rem;
    }
    
    @media (max-width: 480px) {
      font-size: 1.5rem;
    }
  }
  
  p {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
    margin: 8px 0 0;
    
    @media (max-width: 480px) {
      font-size: 0.85rem;
      margin: 6px 0 0;
    }
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  margin: 0 0 16px;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
    margin: 0 0 12px;
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

const TableContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
  margin-bottom: 32px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  
  @media (max-width: 768px) {
    padding: 24px;
  }
  
  @media (max-width: 480px) {
    padding: 20px;
    margin-bottom: 24px;
    border-radius: 16px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th {
    background-color: #f5f7fa;
    text-align: left;
    padding: 12px 16px;
    font-size: 0.9rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    white-space: nowrap;
  }
  
  td {
    padding: 12px 16px;
    font-size: 0.9rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    
    @media (max-width: 600px) {
      padding: 10px 12px;
    }
  }
  
  tr:last-child td {
    border-bottom: none;
  }
  
  tbody tr:hover {
    background-color: rgba(0, 0, 0, 0.01);
  }
`;

// Modal para entrega de prêmio
const DeliveryModal = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  
  @media (max-width: 480px) {
    padding: 10px;
  }
`;

const DeliveryModalContent = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 0;
  
  @media (max-width: 520px) {
    max-width: 100%;
    border-radius: 12px;
  }
`;

const DeliveryModalHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  background: white;
  border-radius: 16px 16px 0 0;
  
  @media (max-width: 480px) {
    padding: 16px 20px;
  }
  
  h2 {
    margin: 0;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    gap: 10px;
    
    @media (max-width: 480px) {
      font-size: 1.1rem;
    }
    
    svg {
      color: #6a11cb;
    }
  }
`;

const DeliveryModalBody = styled.div`
  padding: 24px;
  
  @media (max-width: 480px) {
    padding: 16px;
  }
`;

const DeliveryModalFooter = styled.div`
  padding: 16px 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  position: sticky;
  bottom: 0;
  background: white;
  border-radius: 0 0 16px 16px;
  
  @media (max-width: 480px) {
    padding: 12px 16px;
    flex-direction: column-reverse;
    
    button {
      width: 100%;
    }
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  padding: 0;
  color: #666;
  cursor: pointer;
  
  &:hover {
    color: #333;
  }
`;

const PrizeInfo = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  
  @media (max-width: 500px) {
    flex-direction: column;
  }
`;

const PrizeThumb = styled.div<{ $imageUrl: string }>`
  width: 80px;
  height: 80px;
  border-radius: 8px;
  background-image: url(${props => props.$imageUrl});
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
  
  @media (max-width: 480px) {
    width: 70px;
    height: 70px;
  }
`;

const PrizeName = styled.div`
  h3 {
    margin: 0 0 4px;
    font-size: 1.1rem;
    
    @media (max-width: 480px) {
      font-size: 1rem;
    }
  }
  
  p {
    margin: 0;
    color: #666;
    font-size: 0.9rem;
    
    @media (max-width: 480px) {
      font-size: 0.85rem;
    }
  }
`;

const WinnerInfoTitle = styled.h4`
  margin: 0 0 12px;
  font-size: 0.95rem;
  color: #666;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    color: #6a11cb;
  }
`;

const WinnerInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px 20px;
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 10px;
  }
`;

const InfoItem = styled.div`
  h5 {
    margin: 0 0 4px;
    font-size: 0.8rem;
    color: #666;
    font-weight: normal;
    
    @media (max-width: 480px) {
      font-size: 0.75rem;
      margin: 0 0 3px;
    }
  }
  
  p {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 500;
    
    @media (max-width: 480px) {
      font-size: 0.9rem;
    }
  }
`;

const ContactButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  margin-top: 16px;
  margin-bottom: 24px;
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr 1fr;
  }
  
  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const ContactButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &.whatsapp {
    background-color: #25d366;
    color: white;
    
    &:hover {
      background-color: #22c35e;
    }
  }
  
  &.email {
    background-color: #ea4335;
    color: white;
    
    &:hover {
      background-color: #d73a2c;
    }
  }
  
  &.phone {
    background-color: #0073ea;
    color: white;
    
    &:hover {
      background-color: #0065cc;
    }
  }
`;

const ActionButtonPrimary = styled.button<{ $variant?: 'success' | 'danger' | 'default' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  background-color: ${props => {
    if (props.$variant === 'success') return '#10b981';
    if (props.$variant === 'danger') return '#ef4444';
    return '#6a11cb';
  }};
  color: white;
  
  &:hover {
    filter: brightness(1.1);
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 480px) {
    padding: 10px 14px;
    font-size: 0.85rem;
  }
`;

const ActionButtonSecondary = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.9rem;
  background: transparent;
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f5f5f5;
  }
  
  @media (max-width: 480px) {
    padding: 10px 14px;
    font-size: 0.85rem;
  }
`;

// Melhorar o estilo dos cards de prêmios
const PrizeCard = styled.div<{ $found?: boolean }>`
  background: white;
  border-radius: 16px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  padding: 24px;
  display: flex;
  gap: 24px;
  align-items: flex-start;
  margin-bottom: 24px;
  position: relative;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  
  ${props => props.$found ? `
    border-color: rgba(16, 185, 129, 0.2);
  ` : ''}
  
  &:hover {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    padding: 20px;
  }
  
  @media (max-width: 480px) {
    padding: 16px;
    gap: 16px;
    border-radius: 12px;
    margin-bottom: 16px;
  }
`;

const PrizeImage = styled.div<{ $imageUrl: string }>`
  width: 120px;
  height: 120px;
  border-radius: 12px;
  background-image: url(${props => props.$imageUrl});
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
  }
`;

const PrizeContent = styled.div`
  flex: 1;
  width: 100%;
  
  h3 {
    font-size: 1.3rem;
    margin: 0 0 8px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
    
    @media (max-width: 600px) {
      font-size: 1.2rem;
    }
    
    @media (max-width: 480px) {
      font-size: 1.1rem;
    }
  }
  
  p {
    color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
    margin: 0 0 16px;
    font-size: 0.95rem;
    line-height: 1.5;
    
    @media (max-width: 480px) {
      font-size: 0.9rem;
      margin: 0 0 12px;
    }
  }
`;

const PrizeStatus = styled.div<{ $found?: boolean; $delivered?: boolean }>`
  position: absolute;
  top: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  border-radius: 20px;
  
  ${props => {
    if (props.$delivered) return `
      background-color: #10b981;
      color: white;
    `;
    if (props.$found) return `
      background-color: #f59e0b;
      color: white;
    `;
    return `
      background-color: #e5e7eb;
      color: #6b7280;
    `;
  }}
  
  @media (max-width: 768px) {
    position: static;
    align-self: flex-start;
    margin-bottom: 12px;
    display: inline-flex;
  }
`;

const PrizeDeliveryInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 0.85rem;
  color: ${props => props.theme.colors?.text?.secondary || '#666'};
  
  svg {
    color: #10b981;
  }
  
  span {
    font-weight: 500;
  }
`;

const PrizeWinner = styled.div`
  background-color: #f9fafb;
  border-radius: 10px;
  padding: 16px;
  margin-top: 16px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  
  @media (max-width: 480px) {
    padding: 12px;
  }
  
  h4 {
    font-size: 1rem;
    margin: 0 0 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #1f2937;
    
    @media (max-width: 480px) {
      font-size: 0.9rem;
      margin: 0 0 10px;
    }
    
    svg {
      color: #6366f1;
    }
  }
`;

const PrizeWinnerDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px 20px;
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 10px;
  }
`;

const WinnerDetail = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  span:first-child {
    font-size: 0.8rem;
    color: ${props => props.theme.colors?.text?.secondary || '#666'};
  }
  
  span:last-child {
    font-weight: 500;
    font-size: 0.95rem;
  }
`;

const PrizeActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
  
  @media (max-width: 600px) {
    flex-direction: column;
    
    button {
      width: 100%;
    }
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
`;

const LoadingSpinner = styled.div`
  margin-bottom: 16px;
  
  svg {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Dados de exemplo para a página de visualização
const mockCampaign = {
  id: '1',
  title: 'iPhone 15 Pro Max - 256GB',
  status: 'ativa',
  totalNumbers: 1000,
  price: 25,
  initialDate: new Date(2023, 6, 15),
  drawDate: new Date(2023, 9, 20),
  image: 'https://placehold.co/600x400/6a11cb/FFFFFF/png?text=iPhone+15',
  description: 'Concorra a um iPhone 15 Pro Max com 256GB de armazenamento, na cor Titanium. O aparelho é novo, lacrado com nota fiscal e garantia Apple.',
  stats: {
    sold: 783,
    available: 217,
    reserved: 52,
    percentSold: 78.3,
    totalValue: 19575
  }
};

const mockSales = [
  { id: '1', buyer: 'Maria Silva', numbers: ['045', '046', '047'], quantity: 3, value: 75, date: new Date(2023, 8, 10, 14, 30), paymentMethod: 'Pix', paymentStatus: 'Aprovado' },
  { id: '2', buyer: 'José Santos', numbers: ['123', '124'], quantity: 2, value: 50, date: new Date(2023, 8, 11, 9, 15), paymentMethod: 'Cartão', paymentStatus: 'Aprovado' },
  { id: '3', buyer: 'Ana Oliveira', numbers: ['532'], quantity: 1, value: 25, date: new Date(2023, 8, 12, 18, 5), paymentMethod: 'Pix', paymentStatus: 'Aprovado' },
  { id: '4', buyer: 'Carlos Pereira', numbers: ['678', '679', '680', '681'], quantity: 4, value: 100, date: new Date(2023, 8, 13, 10, 22), paymentMethod: 'Boleto', paymentStatus: 'Pendente' },
  { id: '5', buyer: 'Fernanda Costa', numbers: ['789'], quantity: 1, value: 25, date: new Date(2023, 8, 14, 16, 50), paymentMethod: 'Pix', paymentStatus: 'Aprovado' },
  { id: '6', buyer: 'Bruno Almeida', numbers: ['234', '235'], quantity: 2, value: 50, date: new Date(2023, 8, 15, 11, 45), paymentMethod: 'Cartão', paymentStatus: 'Aprovado' },
  { id: '7', buyer: 'Juliana Ferreira', numbers: ['890', '891', '892'], quantity: 3, value: 75, date: new Date(2023, 8, 16, 13, 20), paymentMethod: 'Pix', paymentStatus: 'Aprovado' }
];

const mockInstantPrizes = [
  { 
    id: '1', 
    name: 'Vale Compras R$100', 
    description: 'Vale compras no valor de R$100 para utilizar em lojas parceiras.',
    image: 'https://placehold.co/200x200/10b981/FFFFFF/png?text=Vale+Compras',
    number: '042',
    found: true,
    delivered: true,
    deliveryDate: new Date(2023, 8, 16, 10, 25),
    winner: {
      name: 'Fernanda Costa',
      email: 'fernanda@email.com',
      phone: '(11) 98765-4321',
      date: new Date(2023, 8, 14, 16, 50),
      address: 'Rua das Flores, 123 - Jardim Primavera, São Paulo/SP'
    }
  },
  { 
    id: '2', 
    name: 'Echo Dot 5ª Geração', 
    description: 'Smart speaker Amazon Echo Dot 5ª geração na cor preta.',
    image: 'https://placehold.co/200x200/6366f1/FFFFFF/png?text=Echo+Dot',
    number: '238',
    found: true,
    delivered: false,
    winner: {
      name: 'Bruno Almeida',
      email: 'bruno@email.com',
      phone: '(11) 91234-5678',
      date: new Date(2023, 8, 15, 11, 45),
      address: 'Av. Paulista, 1000 - Bela Vista, São Paulo/SP'
    }
  },
  { 
    id: '3', 
    name: 'Fones Bluetooth', 
    description: 'Fones de ouvido bluetooth sem fio com estojo carregador.',
    image: 'https://placehold.co/200x200/f59e0b/FFFFFF/png?text=Fones',
    number: '675',
    found: false
  }
];

// Dados para os gráficos
const pieData = [
  { name: 'Vendidos', value: 783 },
  { name: 'Reservados', value: 52 },
  { name: 'Disponíveis', value: 217 }
];

const COLORS = ['#6a11cb', '#f59e0b', '#e5e7eb'];

const salesByDayData = [
  { date: '10/09', sales: 3 },
  { date: '11/09', sales: 5 },
  { date: '12/09', sales: 2 },
  { date: '13/09', sales: 7 },
  { date: '14/09', sales: 4 },
  { date: '15/09', sales: 6 },
  { date: '16/09', sales: 3 },
  { date: '17/09', sales: 5 },
  { date: '18/09', sales: 8 },
  { date: '19/09', sales: 10 }
];

export default function CampanhaDetalhesPage() {
  const params = useParams();
  const id = params?.id as string;
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [campaign, setCampaign] = useState<ICampaign>({} as ICampaign);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBuyer, setCurrentBuyer] = useState<any>(null);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [currentPrize, setCurrentPrize] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  useEffect(() => {
    // Simular carregamento dos dados
    const fetchCampaign = async () => {
      const response = await creatorCampaignAPI.getCampaignById(id as string);
      console.log('response',response);
      if (response.success) {
        setCampaign(response.data);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    }
    
    fetchCampaign();
  }, [id]);
  
  const handleOpenModal = (buyer: any) => {
    // Adaptar o formato do buyer para o BuyerDetailsModal
    const adaptedBuyer = {
      customer: buyer.name || buyer.buyer,
      email: buyer.email || 'cliente@exemplo.com',
      phone: buyer.phone || '(11) 99999-9999',
      address: buyer.address || 'Rua Exemplo, 123',
      campaign: campaign.title,
      date: buyer.date || buyer.purchaseDate,
      numbers: buyer.numbers ? (Array.isArray(buyer.numbers) ? buyer.numbers.length : 1) : 1,
      payment: {
        amount: buyer.total || buyer.value || 0,
        method: buyer.paymentMethod || 'Pix',
        status: 'success'
      }
    };
    
    setCurrentBuyer(adaptedBuyer);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenDeliveryModal = (prize: any) => {
    setCurrentPrize(prize);
    setIsDeliveryModalOpen(true);
  };
  
  const handleCloseDeliveryModal = () => {
    setIsDeliveryModalOpen(false);
    setCurrentPrize(null);
  };
  
  const handleMarkAsDelivered = () => {
    // Aqui implementaria a atualização do status de entrega do prêmio
    // Por enquanto, apenas fechamos o modal
    handleCloseDeliveryModal();
  };
  
  const formatPhoneForWhatsApp = (phone: string) => {
    // Remove caracteres não numéricos
    return phone.replace(/\D/g, '');
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!id) return;
    
    try {
      setIsDeleting(true);
      
      const response = await creatorCampaignAPI.deleteCampaign(id as string);
      
      if (response.success) {
        setShowDeleteModal(false);
        router.push('/dashboard/criador/minhas-rifas');
      } else {
        console.error('Erro ao excluir a campanha:', response.message);
      }
    } catch (err) {
      console.error('Erro ao excluir a campanha:', err);
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  // Definição das colunas da tabela de vendas
  const salesColumns: ColumnDefinition[] = [
    {
      id: 'buyer',
      header: 'Comprador',
      accessor: (row: any) => row.buyer,
      sortable: true,
      priority: 1, // Principal coluna para visualização mobile
      mobileLabel: 'Comprador'
    },
    {
      id: 'paymentMethod',
      header: 'Forma de Pagamento',
      accessor: (row: any) => row.paymentMethod || 'Pix',
      sortable: true,
      priority: 3,
      mobileLabel: 'Pagamento'
    },
    {
      id: 'paymentStatus',
      header: 'Status',
      accessor: (row: any) => (
        <span style={{ 
          color: (row.paymentStatus || 'Aprovado') === 'Aprovado' ? '#10b981' : 
                (row.paymentStatus || '') === 'Pendente' ? '#f59e0b' : '#ef4444',
          fontWeight: 500
        }}>
          {row.paymentStatus || 'Aprovado'}
        </span>
      ),
      sortable: true,
      priority: 4,
      mobileLabel: 'Status'
    },
    {
      id: 'quantity',
      header: 'Quantidade',
      accessor: (row: any) => row.quantity,
      sortable: true,
      align: 'center',
      width: '100px',
      priority: 2,
      mobileLabel: 'Qtd.'
    },
    {
      id: 'value',
      header: 'Valor',
      accessor: (row: any) => `R$ ${row.value.toFixed(2)}`,
      sortable: true,
      align: 'right',
      width: '120px',
      priority: 5,
      mobileLabel: 'Valor'
    },
    {
      id: 'date',
      header: 'Data',
      accessor: (row: any) => row.date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      sortable: true,
      width: '180px',
      priority: 6,
      mobileLabel: 'Data'
    },
    {
      id: 'actions',
      header: 'Ações',
      accessor: (row: any) => (
        <ActionButton 
          $variant="primary"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenModal(row);
          }}
        >
          <FaEye size={12} /> Detalhes
        </ActionButton>
      ),
      align: 'center',
      width: '100px',
      priority: 0 // Não mostrar na versão mobile da tabela como coluna separada
    }
  ];
  
  if (isLoading) {
    return (
      <CreatorDashboard>
        <LoadingContainer>
          <LoadingSpinner>
            <FaSpinner size={32} />
          </LoadingSpinner>
          <div>Carregando detalhes da campanha...</div>
        </LoadingContainer>
      </CreatorDashboard>
    );
  }
  
  return (
    <CreatorDashboard>
      <PageWrapper>
        <PageHeader>
          <Link href="/dashboard/criador/minhas-rifas" passHref>
            <BackButton>
              <FaArrowLeft />
            </BackButton>
          </Link>
          <PageTitle>Detalhes da Campanha</PageTitle>
          <HeaderActions>
            <PublicLinkButton href={`/campanhas/${id}`} target="_blank">
              <FaExternalLinkAlt size={12} />
              Ver Página Pública
            </PublicLinkButton>
            <PublicLinkButton 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                handleDeleteClick();
              }}
              style={{ 
                background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
              }}
            >
              <FaTrash size={12} />
              Excluir
            </PublicLinkButton>
          </HeaderActions>
        </PageHeader>
        
        <CampaignInfoCard>
          <CampaignImageContainer>
            <CampaignImage $imageUrl={campaign.coverImage as string} />
          </CampaignImageContainer>
          <CampaignDetails>
            <CampaignTitle>{campaign.title}</CampaignTitle>
            <CampaignDescription>{campaign.description}</CampaignDescription>
            <CampaignMetaGrid>
              <CampaignMeta>
                <FaCalendarAlt color="#6a11cb" />
                <span>Início: <strong>{new Date(campaign.scheduledActivationDate ? campaign.scheduledActivationDate : campaign.createdAt).toLocaleDateString('pt-BR')}</strong></span>
              </CampaignMeta>
              <CampaignMeta>
                <FaCalendarAlt color="#f59e0b" />
                <span>Sorteio: <strong>{new Date(campaign.drawDate).toLocaleDateString('pt-BR')}</strong></span>
              </CampaignMeta>
              <CampaignMeta>
                <FaTicketAlt color="#10b981" />
                <span>Valor: <strong>R$ {campaign.individualNumberPrice.toFixed(2)}</strong></span>
              </CampaignMeta>
              <CampaignMeta>
                <FaUsers color="#6366f1" />
                <span>Status: <strong>{
                campaign.status === CampaignStatusEnum.ACTIVE ? 'Ativa' : 
                campaign.status === CampaignStatusEnum.COMPLETED ? 'Concluída' : 
                campaign.status === CampaignStatusEnum.SCHEDULED ? 'Agendada' : 
                campaign.status === CampaignStatusEnum.PENDING ? 'Pendente' : 'Cancelada'}</strong></span>
              </CampaignMeta>
            </CampaignMetaGrid>
          </CampaignDetails>
        </CampaignInfoCard>
        
        <TabsContainer>
          <Tab 
            $active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')}
          >
            <FaChartLine /> Visão Geral
          </Tab>
          <Tab 
            $active={activeTab === 'sales'} 
            onClick={() => setActiveTab('sales')}
          >
            <FaMoneyBillWave /> Vendas
          </Tab>
          <Tab 
            $active={activeTab === 'prizes'} 
            onClick={() => setActiveTab('prizes')}
          >
            <FaTrophy /> Prêmios Instantâneos
          </Tab>
        </TabsContainer>
        
        {activeTab === 'overview' && (
          <>
            <MainStats>
              <StatCard>
                <h3><FaTicketAlt color="#6a11cb" /> Total de Números</h3>
                <h2>{campaign.totalNumbers.toLocaleString()}</h2>
                <p>R$ {campaign.individualNumberPrice.toFixed(2)} / número</p>
              </StatCard>
              
              <StatCard $color="#10b981">
                <h3><FaTicketAlt color="#10b981" /> Vendidos</h3>
                <h2>{campaign?.stats?.sold?.toLocaleString()}</h2>
                <p>{campaign?.stats?.percentComplete?.toFixed(1)}% do total</p>
              </StatCard>
              
              {/* <StatCard $color="#f59e0b">
                <h3><FaTicketAlt color="#f59e0b" /> Reservados</h3>
                <h2>{campaign?.stats?.reserved?.toLocaleString()}</h2>
                <p>{((campaign?.stats?.reserved / campaign?.totalNumbers) * 100).toFixed(1)}% do total</p>
              </StatCard> */}
              
              <StatCard $color="#6366f1">
                <h3><FaMoneyBillWave color="#6366f1" /> Valor Arrecadado</h3>
                <h2>R$ {campaign?.stats?.totalRevenue?.toLocaleString()}</h2>
                <p>Meta: R$ {campaign?.returnExpected?.toLocaleString()}</p>
              </StatCard>
            </MainStats>
            
            <ChartsGrid>
              <ChartCard>
                <h3>Distribuição dos Números</h3>
                <ResponsiveContainer width="100%" height="90%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Quantidade']} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
              
              <ChartCard>
                <h3>Vendas por Dia</h3>
                <ResponsiveContainer width="100%" height="90%">
                  <AreaChart data={salesByDayData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [value, 'Vendas']} />
                    <Area type="monotone" dataKey="sales" stroke="#6a11cb" fill="#6a11cb" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </ChartsGrid>
            
            <SectionTitle>
              <FaMoneyBillWave /> Últimas Vendas
            </SectionTitle>
            
            <ResponsiveTable
              columns={salesColumns}
              data={mockSales.slice(0, 5)}
              noDataMessage="Nenhuma venda registrada"
              rowKeyField="id"
              zebra={true}
            />
          </>
        )}
        
        {activeTab === 'sales' && (
          <>
            <SectionTitle>
              <FaMoneyBillWave /> Todas as Vendas
            </SectionTitle>
            
            <ResponsiveTable
              columns={salesColumns}
              data={mockSales}
              noDataMessage="Nenhuma venda registrada"
              rowKeyField="id"
              zebra={true}
              stickyHeader={true}
            />
          </>
        )}
        
        {activeTab === 'prizes' && (
          <>
            <SectionTitle>
              <FaTrophy /> Todos os Prêmios Instantâneos
            </SectionTitle>
            
            {mockInstantPrizes.map(prize => (
              <PrizeCard key={prize.id} $found={prize.found}>
                <PrizeImage $imageUrl={prize.image} />
                <PrizeContent>
                  <h3>
                    {prize.name}
                    {prize.delivered && <FaCheck size={16} style={{ color: "#10b981" }} />}
                  </h3>
                  <p>{prize.description}</p>
                  
                  {prize.found && prize.winner && (
                    <PrizeWinner>
                      <h4>
                        <FaUsers /> Dados do Ganhador
                      </h4>
                      <PrizeWinnerDetails>
                        <WinnerDetail>
                          <span>Nome:</span>
                          <span>{prize.winner.name}</span>
                        </WinnerDetail>
                        <WinnerDetail>
                          <span>Email:</span>
                          <span>{prize.winner.email}</span>
                        </WinnerDetail>
                        <WinnerDetail>
                          <span>Telefone:</span>
                          <span>{prize.winner.phone}</span>
                        </WinnerDetail>
                        <WinnerDetail>
                          <span>Número premiado:</span>
                          <span>{prize.number}</span>
                        </WinnerDetail>
                      </PrizeWinnerDetails>
                      
                      {prize.delivered ? (
                        <PrizeDeliveryInfo>
                          <FaCheck size={14} />
                          <span>Prêmio entregue em {prize.deliveryDate?.toLocaleDateString('pt-BR')}</span>
                        </PrizeDeliveryInfo>
                      ) : (
                        <PrizeActions>
                          <ActionButtonPrimary onClick={() => handleOpenDeliveryModal(prize)}>
                            <FaShippingFast /> Entregar Prêmio
                          </ActionButtonPrimary>
                          <ActionButtonSecondary onClick={() => handleOpenModal({
                            name: prize.winner?.name,
                            email: prize.winner?.email,
                            phone: prize.winner?.phone,
                            numbers: [prize.number],
                            purchaseDate: prize.winner?.date
                          })}>
                            <FaEye size={12} /> Ver Detalhes
                          </ActionButtonSecondary>
                        </PrizeActions>
                      )}
                    </PrizeWinner>
                  )}
                </PrizeContent>
                <PrizeStatus 
                  $found={prize.found}
                  $delivered={prize.delivered}
                >
                  {prize.delivered ? 'Entregue' : (prize.found ? 'Encontrado' : 'Não Encontrado')}
                </PrizeStatus>
              </PrizeCard>
            ))}
          </>
        )}
        
        {currentBuyer && (
          <BuyerDetailsModal 
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            buyer={currentBuyer}
          />
        )}
        
        {/* Modal de Entrega de Prêmio */}
        {currentPrize && (
          <DeliveryModal $isOpen={isDeliveryModalOpen}>
            <DeliveryModalContent>
              <DeliveryModalHeader>
                <h2><FaShippingFast /> Entrega de Prêmio</h2>
                <CloseButton onClick={handleCloseDeliveryModal}>×</CloseButton>
              </DeliveryModalHeader>
              
              <DeliveryModalBody>
                <PrizeInfo>
                  <PrizeThumb $imageUrl={currentPrize.image} />
                  <PrizeName>
                    <h3>{currentPrize.name}</h3>
                    <p>Número premiado: <strong>{currentPrize.number}</strong></p>
                  </PrizeName>
                </PrizeInfo>
                
                <WinnerInfoTitle>
                  <FaUsers /> Informações do Ganhador
                </WinnerInfoTitle>
                
                <WinnerInfoGrid>
                  <InfoItem>
                    <h5>Nome</h5>
                    <p>{currentPrize.winner?.name}</p>
                  </InfoItem>
                  <InfoItem>
                    <h5>Telefone</h5>
                    <p>{currentPrize.winner?.phone}</p>
                  </InfoItem>
                  <InfoItem>
                    <h5>Email</h5>
                    <p>{currentPrize.winner?.email}</p>
                  </InfoItem>
                  <InfoItem>
                    <h5>Data da Premiação</h5>
                    <p>{currentPrize.winner?.date.toLocaleDateString('pt-BR')}</p>
                  </InfoItem>
                </WinnerInfoGrid>
                
                <InfoItem style={{ marginBottom: '16px' }}>
                  <h5>Endereço</h5>
                  <p>{currentPrize.winner?.address}</p>
                </InfoItem>
                
                <WinnerInfoTitle>
                  <FaLongArrowAltRight /> Contato com o Ganhador
                </WinnerInfoTitle>
                
                <ContactButtons>
                  <ContactButton 
                    href={`https://wa.me/${formatPhoneForWhatsApp(currentPrize.winner?.phone)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whatsapp"
                  >
                    <FaWhatsapp /> WhatsApp
                  </ContactButton>
                  <ContactButton 
                    href={`mailto:${currentPrize.winner?.email}`}
                    className="email"
                  >
                    <FaEnvelope /> Email
                  </ContactButton>
                  <ContactButton 
                    href={`tel:${formatPhoneForWhatsApp(currentPrize.winner?.phone)}`}
                    className="phone"
                  >
                    <FaPhone /> Ligar
                  </ContactButton>
                </ContactButtons>
              </DeliveryModalBody>
              
              <DeliveryModalFooter>
                <ActionButtonSecondary onClick={handleCloseDeliveryModal}>
                  <FaTimes /> Cancelar
                </ActionButtonSecondary>
                <ActionButtonPrimary $variant="success" onClick={handleMarkAsDelivered}>
                  <FaCheck /> Confirmar Entrega
                </ActionButtonPrimary>
              </DeliveryModalFooter>
            </DeliveryModalContent>
          </DeliveryModal>
        )}
        
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title="Excluir Campanha"
          message={`Tem certeza que deseja excluir a campanha "${campaign?.title}"? Esta ação não pode ser desfeita.`}
          confirmText={isDeleting ? "Excluindo..." : "Sim, Excluir"}
          cancelText="Cancelar"
          type="danger"
          icon={<FaTrash />}
        />
      </PageWrapper>
    </CreatorDashboard>
  );
} 