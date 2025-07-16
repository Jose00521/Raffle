'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import CreatorDashboard from '@/components/dashboard/CreatorDashboard';
import { FaPlus, FaSearch, FaEllipsisV, FaEye, FaEdit, FaTrash, FaChartLine, FaTicketAlt, FaPowerOff } from 'react-icons/fa';
import Link from 'next/link';
import ToggleSwitch from '@/components/common/ToggleSwitch';
import creatorCampaignAPI from '@/API/creator/creatorCampaignAPIClient';
import { CampaignStatusEnum, ICampaign } from '@/models/interfaces/ICampaignInterfaces';
import { useSocket } from '@/context/SocketContext';
import { toast, ToastContainer } from 'react-toastify';
import { formatCurrency } from '@/utils/formatters';

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
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const RifaCard = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid rgba(226, 232, 240, 0.5);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
    border-color: rgba(106, 17, 203, 0.2);
    
    &::before {
      opacity: 1;
    }
  }
  
  @media (max-width: 768px) {
    border-radius: 12px;
    
    &:hover {
      transform: translateY(-4px);
    }
  }
`;

const RifaImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  
  @media (max-width: 768px) {
    height: 180px;
  }
  
  @media (max-width: 480px) {
    height: 160px;
  }
`;

const RifaImage = styled.div<{ $imageUrl: string }>`
  width: 100%;
  height: 100%;
  background-image: url(${props => props.$imageUrl});
  background-size: cover;
  background-position: center;
  transition: transform 0.5s ease;
  
  ${RifaCard}:hover & {
    transform: scale(1.05);
  }
`;

const RifaBadge = styled.div<{ $status: string }>`
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  ${({ $status }) => {
    if ($status === 'ACTIVE') {
      return `
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(5, 150, 105, 0.95) 100%);
        color: white;
        animation: blink 2s ease infinite;
  
        @keyframes blink {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
      `;
    } else if ($status === 'COMPLETED') {
      return `
        background: linear-gradient(135deg, rgba(106, 17, 203, 0.95) 0%, rgba(79, 70, 229, 0.95) 100%);
        color: white;
      `;
    } else if ($status === 'PENDING' || $status === 'SCHEDULED') {
      return `
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(37, 99, 235, 0.95) 100%);
        color: white;
      `;
    } else if ($status === 'cancelada') {
      return `
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 0.95) 100%);
        color: white;
      `;
    } else {
      return `
        background: linear-gradient(135deg, rgba(107, 114, 128, 0.95) 0%, rgba(75, 85, 99, 0.95) 100%);
        color: white;
      `;
    }
  }}
`;

const RifaContent = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
  position: relative;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const RifaUpperContent = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  margin-bottom: 20px;
`;

const RifaTitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 12px;
`;

const RifaTitle = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
  flex: 1;
  line-height: 1.4;
  letter-spacing: -0.02em;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  background: rgba(248, 250, 252, 0.8);
  padding: 8px 12px;
  border-radius: 12px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(226, 232, 240, 0.6);
  
  @media (max-width: 768px) {
    padding: 6px 10px;
  }
`;

const StatusLabel = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  margin-right: 8px;
  
  @media (max-width: 480px) {
    display: none;
  }
`;

const RifaMeta = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 16px;
  align-items: center;
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 16px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(226, 232, 240, 0.6);
`;

const MetaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  
  .label {
    font-size: 0.75rem;
    font-weight: 500;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .value {
    font-weight: 700;
    color: #1e293b;
    font-size: 0.9rem;
  }
`;

const RifaStats = styled.div`
  margin: 16px 0 20px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.8) 100%);
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 0.6);
  backdrop-filter: blur(4px);
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.85rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const StatLabel = styled.span`
  color: #64748b;
  font-weight: 500;
`;

const StatValue = styled.span`
  font-weight: 700;
  color: #1e293b;
  
  &.highlight {
    color: #6366f1;
  }
  
  &.success {
    color: #059669;
  }
  
  &.warning {
    color: #d97706;
  }
`;

const ProgressSection = styled.div`
  margin-top: 16px;
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const ProgressLabel = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: #475569;
`;

const ProgressPercentage = styled.span`
  font-size: 0.9rem;
  font-weight: 700;
  color: #6366f1;
`;

const ProgressBar = styled.div`
  height: 8px;
  background: linear-gradient(90deg, rgba(226, 232, 240, 0.8) 0%, rgba(203, 213, 225, 0.8) 100%);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const ProgressFill = styled.div<{ $percent: number }>`
  height: 100%;
  width: ${props => props.$percent}%;
  background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%);
  border-radius: 8px;
  transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
    animation: shimmer 2s infinite;
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const ProgressDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  margin-top: 6px;
  color: #64748b;
  
  .numbers {
    font-weight: 600;
    color: #475569;
  }
`;

const RifaActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid rgba(226, 232, 240, 0.6);
`;

const RifaActionButton = styled.button<{ $variant?: 'outline' | 'icon' | 'edit' | 'primary' | 'secondary' }>`
  padding: ${props => (props.$variant === 'icon' || props.$variant === 'edit') ? '10px' : '10px 16px'};
  background: ${props => {
    if (props.$variant === 'outline') return 'transparent';
    if (props.$variant === 'edit') return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
    if (props.$variant === 'secondary') return 'linear-gradient(135deg, #64748b 0%, #475569 100%)';
    return 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)';
  }};
  color: ${props => props.$variant === 'outline' ? '#6366f1' : 'white'};
  border: ${props => props.$variant === 'outline' ? '2px solid #6366f1' : 'none'};
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 42px;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  ${props => {
    if (props.$variant === 'icon' || props.$variant === 'edit') {
      return `width: 42px; min-width: 42px;`;
    }
    return `flex: 1;`;
  }}
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => {
      if (props.$variant === 'outline') return '0 8px 20px rgba(99, 102, 241, 0.2)';
      if (props.$variant === 'edit') return '0 8px 20px rgba(245, 158, 11, 0.3)';
      if (props.$variant === 'secondary') return '0 8px 20px rgba(100, 116, 139, 0.3)';
      return '0 8px 20px rgba(99, 102, 241, 0.4)';
    }};
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(0);
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
  grid-template-columns: ${'repeat(auto-fill, minmax(350px, 1fr))' as string};
  gap: 20px;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const LoadingSkeletonCard = styled.div`
  background-color: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100%;
  border: 1px solid rgba(226, 232, 240, 0.5);
  
  @media (max-width: 768px) {
    border-radius: 12px;
  }
`;

const SkeletonImage = styled.div`
  height: 200px;
  background: linear-gradient(-90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%);
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
    height: 180px;
  }
  
  @media (max-width: 480px) {
    height: 160px;
  }
`;

const SkeletonBadge = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 80px;
  height: 26px;
  border-radius: 20px;
  background: linear-gradient(-90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%);
  background-size: 400% 400%;
  animation: shimmer 1.8s ease-in-out infinite;
  animation-delay: 0.1s;
`;

const SkeletonContent = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: space-between;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const SkeletonUpperContent = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  margin-bottom: 20px;
`;

const SkeletonTitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 12px;
`;

const SkeletonTitle = styled.div`
  height: 28px;
  flex: 1;
  background: linear-gradient(-90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%);
  background-size: 400% 400%;
  animation: shimmer 1.8s ease-in-out infinite;
  animation-delay: 0.1s;
  border-radius: 6px;
`;

const SkeletonToggle = styled.div`
  width: 100px;
  height: 36px;
  border-radius: 12px;
  background: linear-gradient(-90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%);
  background-size: 400% 400%;
  animation: shimmer 1.8s ease-in-out infinite;
  animation-delay: 0.2s;
`;

const SkeletonMeta = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 16px;
  margin-bottom: 16px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(226, 232, 240, 0.6);
`;

const SkeletonMetaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SkeletonMetaLabel = styled.div`
  height: 12px;
  width: 60px;
  background: linear-gradient(-90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%);
  background-size: 400% 400%;
  animation: shimmer 1.8s ease-in-out infinite;
  animation-delay: 0.3s;
  border-radius: 4px;
`;

const SkeletonMetaValue = styled.div`
  height: 16px;
  width: 80px;
  background: linear-gradient(-90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%);
  background-size: 400% 400%;
  animation: shimmer 1.8s ease-in-out infinite;
  animation-delay: 0.35s;
  border-radius: 4px;
`;

const SkeletonStats = styled.div`
  margin: 16px 0 20px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.8) 100%);
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 0.6);
`;

const SkeletonStatRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const SkeletonStatLabel = styled.div`
  height: 16px;
  width: 120px;
  background: linear-gradient(-90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%);
  background-size: 400% 400%;
  animation: shimmer 1.8s ease-in-out infinite;
  border-radius: 4px;
`;

const SkeletonStatValue = styled.div`
  height: 16px;
  width: 100px;
  background: linear-gradient(-90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%);
  background-size: 400% 400%;
  animation: shimmer 1.8s ease-in-out infinite;
  border-radius: 4px;
`;

const SkeletonProgressSection = styled.div`
  margin-top: 16px;
`;

const SkeletonProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const SkeletonProgressLabel = styled.div`
  height: 14px;
  width: 120px;
  background: linear-gradient(-90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%);
  background-size: 400% 400%;
  animation: shimmer 1.8s ease-in-out infinite;
  animation-delay: 0.4s;
  border-radius: 4px;
`;

const SkeletonProgressPercentage = styled.div`
  height: 16px;
  width: 40px;
  background: linear-gradient(-90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%);
  background-size: 400% 400%;
  animation: shimmer 1.8s ease-in-out infinite;
  animation-delay: 0.45s;
  border-radius: 4px;
`;

const SkeletonProgressBar = styled.div`
  height: 8px;
  border-radius: 8px;
  background: linear-gradient(-90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%);
  background-size: 400% 400%;
  animation: shimmer 1.8s ease-in-out infinite;
  animation-delay: 0.4s;
`;

const SkeletonProgressDetails = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
`;

const SkeletonProgressDetailItem = styled.div`
  height: 12px;
  width: 80px;
  background: linear-gradient(-90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%);
  background-size: 400% 400%;
  animation: shimmer 1.8s ease-in-out infinite;
  animation-delay: 0.5s;
  border-radius: 4px;
`;

const SkeletonActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid rgba(226, 232, 240, 0.6);
  height: 42px;
`;

const SkeletonButton = styled.div<{ $width?: string }>`
  flex: ${props => props.$width ? '0' : '1'};
  width: ${props => props.$width || 'auto'};
  height: 42px;
  border-radius: 10px;
  background: linear-gradient(-90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%);
  background-size: 400% 400%;
  animation: shimmer 1.8s ease-in-out infinite;
  animation-delay: 0.6s;
`;

const StyledToggleSwitch = styled(ToggleSwitch)`
  transform: scale(0.9);
`;

interface CampaignWithStats extends ICampaign {
  bitmapStats: {
    availableCount: number;
    takenCount: number;
    totalNumbers: number;
    availablePercentage: number;
    takenPercentage: number;
    isSharded: boolean;
    shardInfo: {
      shardCount: number;
      shardSize: number;
      shardsWithAvailableNumbers: number;
    };
  };
}

export default function MinhasRifasPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<CampaignWithStats[]>([]);

  const { notifications } = useSocket();
  
  useEffect(() => {
    // Simulate data loading
    const fetchCampaigns = async () => {
      const response = await creatorCampaignAPI.getActiveCampaigns();
      setCampaigns(response.data);
      setIsLoading(false);
    };
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (notifications.length > 0) {
      // Pegar a notificação mais recente
      const notification = notifications[0];
      console.log('notification', notification);
      // Atualizar a campanha na lista
      setCampaigns(prevCampaigns => 
        prevCampaigns.map(campaign => 
          campaign.campaignCode === notification.data.campaignCode
            ? { ...campaign, status: notification.status as CampaignStatusEnum }
            : campaign
        )
      );
    }
  }, [notifications]);
  
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
  const toggleCampaignStatus = async (id: string) => {

    setCampaigns(prev => prev.map((campaign: CampaignWithStats) => {
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

    const response = await creatorCampaignAPI.toggleCampaignStatus(id);


    if(response.success){

      toast.success('Status da campanha atualizado com sucesso');
    }else{
      setCampaigns(prev => prev.map((campaign: CampaignWithStats) => {
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
      toast.error('Erro ao atualizar status da campanha');
    }
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
                      <SkeletonMetaItem>
                        <SkeletonMetaLabel />
                        <SkeletonMetaValue />
                      </SkeletonMetaItem>
                      <SkeletonMetaItem>
                        <SkeletonMetaLabel />
                        <SkeletonMetaValue />
                      </SkeletonMetaItem>
                      <SkeletonMetaItem>
                        <SkeletonMetaLabel />
                        <SkeletonMetaValue />
                      </SkeletonMetaItem>
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
                      <SkeletonStatRow>
                        <SkeletonStatLabel />
                        <SkeletonStatValue />
                      </SkeletonStatRow>
                    </SkeletonStats>
                    
                    <SkeletonProgressSection>
                      <SkeletonProgressHeader>
                        <SkeletonProgressLabel />
                        <SkeletonProgressPercentage />
                      </SkeletonProgressHeader>
                      <SkeletonProgressBar />
                      <SkeletonProgressDetails>
                        <SkeletonProgressDetailItem />
                        <SkeletonProgressDetailItem />
                      </SkeletonProgressDetails>
                    </SkeletonProgressSection>
                  </SkeletonUpperContent>
                  
                  <SkeletonActions>
                    <SkeletonButton />
                    <SkeletonButton />
                    <SkeletonButton $width="42px" />
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
                        {campaign.title}
                      </RifaTitle>
                      {campaign.status !== CampaignStatusEnum.COMPLETED && (
                        <StatusContainer>
                          <StatusLabel>Status</StatusLabel>
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
                      <MetaItem>
                        <div className="label">Criada em</div>
                        <div className="value">{new Date(campaign.createdAt).toLocaleDateString('pt-BR')}</div>
                      </MetaItem>
                      <MetaItem>
                        <div className="label">Preço</div>
                        <div className="value">R$ {formatCurrency(campaign.individualNumberPrice)}</div>
                      </MetaItem>
                      <MetaItem>
                        <div className="label">Vencedores</div>
                        <div className="value">{campaign.winnerPositions}</div>
                      </MetaItem>
                    </RifaMeta>
                    
                    <RifaStats>
                      {campaign.status === CampaignStatusEnum.SCHEDULED && campaign.scheduledActivationDate && (
                        <StatRow>
                          <StatLabel>Ativação Agendada</StatLabel>
                          <StatValue className="highlight">
                            {new Date(campaign.scheduledActivationDate).toLocaleDateString('pt-BR')} às{' '}
                            {new Date(campaign.scheduledActivationDate).toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </StatValue>
                        </StatRow>
                      )}
                      <StatRow>
                        <StatLabel>Data do Sorteio</StatLabel>
                        <StatValue className="warning">{new Date(campaign.drawDate).toLocaleDateString('pt-BR')}</StatValue>
                      </StatRow>
                      <StatRow>
                        <StatLabel>Números Totais</StatLabel>
                        <StatValue>{campaign.totalNumbers?.toLocaleString('pt-BR')}</StatValue>
                      </StatRow>
                      <StatRow>
                        <StatLabel>Receita Total</StatLabel>
                        <StatValue className="success">R$ {campaign.stats?.totalRevenue?.toFixed(2) || '0,00'}</StatValue>
                      </StatRow>
                    </RifaStats>
                    
                    <ProgressSection>
                      <ProgressHeader>
                        <ProgressLabel>Progresso de Vendas</ProgressLabel>
                        <ProgressPercentage>{Number(campaign.bitmapStats?.takenPercentage.toPrecision(4)) || 0}%</ProgressPercentage>
                      </ProgressHeader>
                      <ProgressBar>
                        <ProgressFill $percent={Number(campaign.bitmapStats?.takenPercentage.toPrecision(4)) || 0} />
                      </ProgressBar>
                      <ProgressDetails>
                        <span className="numbers">
                          {campaign.bitmapStats?.takenCount?.toLocaleString('pt-BR') || 0} vendidos
                        </span>
                        <span className="numbers">
                          {(campaign.bitmapStats?.availableCount || 0)?.toLocaleString('pt-BR')} restantes
                        </span>
                      </ProgressDetails>
                    </ProgressSection>
                  </RifaUpperContent>
                  
                  <RifaActions>
                    {/* Botão Ver */}
                    <RifaActionButton $variant="primary">
                      <Link href={`/dashboard/criador/campanha/${campaign.campaignCode}`}>
                        <FaEye size={14} /> Ver Detalhes
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
              <Link href="/dashboard/criador/nova-rifa">
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