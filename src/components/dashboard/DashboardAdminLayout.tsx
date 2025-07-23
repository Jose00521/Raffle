'use client';

import React, { useState, useEffect, useRef } from 'react';
import styled, { css } from 'styled-components';
import { FaBars, FaTimes, FaAngleDown, FaAngleRight, FaUserCircle, FaChevronDown, FaUser, FaCog, FaSignOutAlt, FaPlusCircle, FaTrophy, FaPen } from 'react-icons/fa';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { AdminPermissionsEnum } from '@/models/interfaces/IUserInterfaces';

// Types
interface MenuItem {
  id: string;
  label: string;
  path?: string;
  icon: React.ReactNode;
  permissions?: AdminPermissionsEnum[];
  subMenuItems?: Array<{
    id: string;
    label: string;
    path: string;
    icon?: React.ReactNode;
    permissions?: AdminPermissionsEnum[];
  }>;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  menuItems: MenuItem[];
  dashboardTitle: string;
  showComposeButton?: boolean;
}

// Styled Components with improved responsivity
const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background || '#f5f7fa'};
  
  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

// Adicionar um componente Tooltip
const Tooltip = styled.div<{ $visible: boolean }>`
  position: absolute;
  left: 75px;
  top: 50%;
  transform: translateY(-50%);
  background-color: #2c2c2c;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  white-space: nowrap;
  pointer-events: none;
  opacity: ${props => props.$visible ? 1 : 0};
  visibility: ${props => props.$visible ? 'visible' : 'hidden'};
  transition: all 0.2s ease;
  z-index: 1000;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15) as string;
  font-weight: 500;
  
  &::before {
    content: '';
    position: absolute;
    left: -6px;
    top: 50%;
    transform: translateY(-50%) as string;
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
    border-right: 6px solid #2c2c2c;
  }
`;

const Sidebar = styled.aside<{ $isCollapsed: boolean }>`
  width: ${props => props.$isCollapsed ? '80px' : '260px'};
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.15) as string;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
  overflow-x: hidden;
  overflow-y: auto;
  border-right: 1px solid rgba(255, 255, 255, 0.05) as string;

  &::-webkit-scrollbar {
    width: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.1) as string;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }

  @media (max-width: 768px) {
    transform: ${props => props.$isCollapsed ? 'translateX(-100%)' : 'translateX(0)'};
    width: 230px;
    position: fixed;
    z-index: 1000;
  }
  
  @media (max-width: 480px) {
    width: 220px;
  }
`;

const SidebarHeader = styled.div`
  height: 70px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  
  @media (max-width: 768px) {
    height: 65px;
    padding: 0 16px;
  }
  
  @media (max-width: 480px) {
    height: 60px;
    padding: 0 14px;
  }
`;

const SidebarToggle = styled.button`
  background: rgba(255, 255, 255, 0.05) as string;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  transition: all 0.2s ease;
  margin-right: ${props => props.children === 'FaTimes' ? '0' : '12px'};

  &:hover {
    background-color: rgba(255, 255, 255, 0.1) as string;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 16px;
    height: 16px;
    opacity: 0.9;
  }

  @media (max-width: 768px) {
    position: ${props => props.children === 'FaTimes' ? 'absolute' : 'static'};
    right: ${props => props.children === 'FaTimes' ? '10px' : '0'};
    top: ${props => props.children === 'FaTimes' ? '10px' : '0'};
    width: 30px;
    height: 30px;
  }
  
  @media (max-width: 480px) {
    width: 28px;
    height: 28px;
  }
`;

const SidebarTitle = styled.h2<{ $isCollapsed: boolean }>`
  font-size: 1rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
  opacity: ${props => props.$isCollapsed ? 0 : 1};
  transition: opacity 0.2s ease;
  display: ${props => props.$isCollapsed ? 'none' : 'block'};
  letter-spacing: 0.5px;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;

const NavMenu = styled.ul`
  list-style: none;
  padding: 12px 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  
  @media (max-width: 768px) {
    padding: 10px 0;
  }
  
  @media (max-width: 480px) {
    padding: 8px 0;
  }
`;

const NavItem = styled.li<{ $active?: boolean, $disabled?: boolean }>`
  margin: 0;
  position: relative;
  opacity: ${props => props.$disabled ? 0.5 : 1};
  pointer-events: ${props => props.$disabled ? 'none' : 'auto'};
  
  &:hover ${Tooltip} {
    opacity: 1;
    visibility: visible;
  }
`;

const activeNavItemStyles = css`
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 4px;
    bottom: 4px;
    width: 3px;
    background: #60a5fa;
    border-radius: 0 2px 2px 0;
  }
  
  background-color: rgba(96, 165, 250, 0.08);
`;

const NavLink = styled(Link)<{ $isCollapsed: boolean; $active?: boolean; $hasSubmenu?: boolean }>`
  display: flex;
  align-items: center;
  padding: ${props => props.$isCollapsed ? '14px 0' : '14px 16px'};
  text-decoration: none;
  color: ${props => props.$active ? '#ffffff' : 'rgba(255, 255, 255, 0.8)'};
  font-weight: ${props => props.$active ? '500' : '400'};
  transition: all 0.2s ease;
  position: relative;
  justify-content: ${props => props.$isCollapsed ? 'center' : 'flex-start'};
  letter-spacing: 0.3px;
  border-radius: 6px;
  margin: 0 ${props => props.$isCollapsed ? '8px' : '10px'};

  ${props => props.$active && activeNavItemStyles}
  
  /* Estilo especial para itens com submenu */
  ${props => props.$hasSubmenu && !props.$isCollapsed && css`
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      right: 40px;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 4px;
      background: rgba(255, 255, 255, 0.4);
      border-radius: 50%;
      transition: all 0.3s ease;
    }
    
    &:hover::after {
      background: rgba(255, 255, 255, 0.7);
      transform: translateY(-50%) scale(1.5);
    }
  `}

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
  }
  
  &:active {
    transform: translateY(1px);
  }
  
  @media (max-width: 768px) {
    padding: ${props => props.$isCollapsed ? '12px 0' : '12px 16px'};
  }
  
  @media (max-width: 480px) {
    padding: ${props => props.$isCollapsed ? '10px 0' : '10px 14px'};
    font-size: 0.9rem;
  }
`;

const NavIcon = styled.span`
  margin-right: ${props => props.children ? '14px' : '0'};
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  transition: all 0.2s ease;
  color: inherit;
  
  svg {
    width: 18px;
    height: 18px;
    transition: all 0.2s ease;
    opacity: 0.9;
  }
  
  @media (max-width: 768px) {
    margin-right: ${props => props.children ? '12px' : '0'};
  }
  
  @media (max-width: 480px) {
    margin-right: ${props => props.children ? '10px' : '0'};
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const NavLabel = styled.span<{ $isCollapsed: boolean; $hasSubmenu?: boolean }>`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  display: ${props => props.$isCollapsed ? 'none' : 'block'};
  transition: all 0.2s ease;
  font-size: 0.9rem;
  
  /* Adicionar ícone de pasta para itens com submenu */
  ${props => props.$hasSubmenu && css`

  `}
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const MainContent = styled.main<{ $isCollapsed: boolean }>`
  flex: 1;
  padding: 20px;
  margin-left: ${props => props.$isCollapsed ? '68px' : '250px'};
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  @media (max-width: 768px) {
    margin-left: 0;
    padding: 15px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
  }
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    margin-bottom: 15px;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 12px;
  }
`;

const WelcomeHeader = styled.div`
  background: linear-gradient(135deg, rgba(106, 17, 203, 0.02) 0%, rgba(37, 117, 252, 0.05) 100%);
  border-radius: 12px;
  padding: 14px 18px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid rgba(106, 17, 203, 0.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.01);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.03);
    border: 1px solid rgba(106, 17, 203, 0.08);
  }
  
  @media (max-width: 768px) {
    padding: 12px 16px;
    margin-bottom: 16px;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  @media (max-width: 480px) {
    padding: 10px 14px;
    margin-bottom: 14px;
  }
`;

const GreetingSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const Greeting = styled.h2`
  margin: 0 0 3px 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text?.primary || '#333'};
  display: flex;
  align-items: center;
  gap: 5px;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const UserName = styled.span`
  font-weight: 700;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserRole = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SubGreeting = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text?.secondary || '#777'};
  opacity: 0.85;
  
  @media (max-width: 480px) {
    font-size: 0.75rem;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: white;
  border: 1px solid rgba(106, 17, 203, 0.1);
  border-radius: 8px;
  color: #6a11cb;
  font-weight: 500;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  svg {
    opacity: 0.8;
    transition: all 0.2s ease;
  }
  
  &:hover {
    background: rgba(106, 17, 203, 0.02);
    border-color: rgba(106, 17, 203, 0.15);
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(106, 17, 203, 0.08);
    
    svg {
      opacity: 1;
    }
  }
  
  @media (max-width: 768px) {
    flex: 1;
    justify-content: center;
  }
  
  @media (max-width: 480px) {
    padding: 7px 10px;
    font-size: 0.8rem;
  }
`;

const MobileMenuToggle = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text?.primary || '#333'};
  cursor: pointer;
  font-size: 1.5rem;
  display: none;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 768px) {
    display: flex;
    font-size: 1.25rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text?.primary || '#333'};
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const UserSection = styled.div`
  position: relative;
`;

const Overlay = styled.div<{ $visible: boolean }>`
  display: ${props => props.$visible ? 'block' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 99;
`;

const UserToggle = styled.button`
  background: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  min-width: 40px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  color: #6a11cb;
  transition: all 0.2s ease;
  overflow: hidden;
  padding: 0;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(106, 17, 203, 0.2);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(106, 17, 203, 0.2), 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  svg {
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
    width: 24px;
    height: 24px;
  }
`;

const SubMenuContainer = styled.ul<{ $isOpen: boolean; $isCollapsed: boolean }>`
  list-style: none;
  padding: 0 0 0 20px;
  margin: 0 10px 0 20px; /* Aumenta a margem esquerda para criar hierarquia */
  max-height: ${props => props.$isOpen ? '300px' : '0'};
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border-radius: 8px;
  opacity: ${props => props.$isOpen ? 1 : 0};
  transform: ${props => props.$isOpen ? 'translateY(0)' : 'translateY(-8px)'};
  position: relative;
  

  
  ${props => props.$isCollapsed && `
    position: absolute;
    left: calc(100% + 8px);
    top: 0;
    width: 220px;
    background: linear-gradient(135deg, #5a01bc 0%, #1565ec 100%);
    border-radius: 8px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25), 0 4px 12px rgba(90, 1, 188, 0.3);
    opacity: ${props.$isOpen ? 1 : 0};
    visibility: ${props.$isOpen ? 'visible' : 'hidden'};
    transform: ${props.$isOpen ? 'translateX(0) scale(1)' : 'translateX(-8px) scale(0.95)'};
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    z-index: 200;
    margin: 0;
    padding: 8px 0;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-left: none;
    

  `}
`;

const SubMenuItem = styled.li<{ $active?: boolean; $index?: number; $disabled?: boolean }>`
  position: relative;

  opacity: ${props => props.$disabled ? 0.5 : 1};
  pointer-events: ${props => props.$disabled ? 'none' : 'auto'};
  

  
  ${props => props.$active && css`
    ${activeNavItemStyles}
  `}
`;

const SubMenuLink = styled(Link)<{ $active?: boolean; $disabled?: boolean }>`
  padding: 12px 12px 12px 24px; /* Mais indentação para hierarquia */
  display: flex;
  align-items: center;
  text-decoration: none;
  color: ${props => props.$active ? '#ffffff' : 'rgba(255, 255, 255, 0.7)'};
  font-size: 0.85rem; /* Tamanho menor para indicar hierarquia */
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  font-weight: ${props => props.$active ? '500' : '400'};
  margin: 1px 8px;
  border-radius: 6px;
  opacity: ${props => props.$disabled ? 0.5 : 1};
  pointer-events: ${props => props.$disabled ? 'none' : 'auto'};
  

  
  &:hover {
    background-color: rgba(255, 255, 255, 0.08);
    color: white;
    transform: translateX(2px);
    padding-left: 26px;
    

  }
  
  ${props => props.$active && css`
    background-color: rgba(96, 165, 250, 0.15);
    
    
    &::after {
      background: #60a5fa;
      width: 16px;
      height: 2px;
    }
  `}
`;

const SubMenuLinkCollapsed = styled(Link)<{ $active?: boolean; $disabled?: boolean }>`
  padding: 12px 16px 12px 20px;
  display: flex;
  align-items: center;
  text-decoration: none;
  color: ${props => props.$active ? '#ffffff' : 'rgba(255, 255, 255, 0.8)'};
  font-size: 0.85rem; /* Tamanho menor para hierarquia */
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  font-weight: ${props => props.$active ? '500' : '400'};
  border-radius: 6px;
  margin: 2px 8px;
  position: relative;
  opacity: ${props => props.$disabled ? 0.5 : 1};
  pointer-events: ${props => props.$disabled ? 'none' : 'auto'};

  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
    transform: translateX(2px);
    

  }
  
  ${props => props.$active && css`
    background-color: rgba(96, 165, 250, 0.15);
    color: white;
    
    
    &::after {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 60%;
      background: #60a5fa;
      border-radius: 0 2px 2px 0;
    }
  `}
`;

const NavItemWithSubmenu = styled.div<{ $isCollapsed: boolean; $hasOpenSubmenu: boolean; $active?: boolean }>`
  position: relative;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  
  ${props => props.$isCollapsed && `
    &:hover {
      & > ${SubMenuContainer} {
        opacity: 1;
        visibility: visible;
        transform: translateX(0) scale(1);
        transition-delay: 0.1s;
      }
    }
    
    &:not(:hover) {
      & > ${SubMenuContainer} {
        transition-delay: 0.2s;
      }
    }
  `}
  
  ${props => !props.$isCollapsed && props.$active && css`
    ${activeNavItemStyles}
    
    &::before {
      animation: slideIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    
    @keyframes slideIn {
      from {
        transform: scaleY(0);
        opacity: 0;
      }
      to {
        transform: scaleY(1);
        opacity: 1;
      }
    }
  `}
`;

const MenuToggle = styled.button<{ $isOpen: boolean }>`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border-radius: 6px;
  
  &:hover {
    color: white;
    background-color: rgba(255, 255, 255, 0.1);
    transform: translateY(-50%) scale(1.1);
  }
  
  &:active {
    transform: translateY(-50%) scale(0.95);
  }
  
  svg {
    transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0)'};
    transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    width: 14px;
    height: 14px;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
  }
`;

// User Dropdown
const UserMenuDropdown = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border-radius: 10px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
  width: 220px;
  z-index: 100;
  overflow: hidden;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.$isOpen ? 'translateY(0)' : 'translateY(-10px)'};
  transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: -8px;
    right: 15px;
    width: 16px;
    height: 16px;
    background: white;
    transform: rotate(45deg);
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    border-left: 1px solid rgba(0, 0, 0, 0.05);
  }
  
  @media (max-width: 768px) {
    width: 200px;
    right: -10px;
    
    &::before {
      right: 20px;
    }
  }
  
  @media (max-width: 480px) {
    width: 180px;
    right: -15px;
    
    &::before {
      right: 25px;
    }
  }
`;

const UserInfo = styled.div`
  padding: 15px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  min-width: 40px;
  min-height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(106, 17, 203, 0.2);
  text-align: center;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  width: calc(100% - 52px);
  overflow: hidden;
`;

const UserEmail = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserMenuItems = styled.div`
  padding: 8px 0;
`;

const UserMenuItem = styled.a`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 15px;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  text-decoration: none;
  transition: background-color 0.2s ease;
  font-size: 0.9rem;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
    padding: 8px 12px;
    gap: 10px;
  }
`;

const UserMenuDivider = styled.div`
  height: 1px;
  background-color: rgba(0, 0, 0, 0.06);
  margin: 8px 0;
`;

const UserMenuIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  flex-shrink: 0;
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

// Animated Container for morphing between states
const AnimatedComposeContainer = styled.div<{ 
  $isCollapsed: boolean; 
  $isOnCreatePage: boolean 
}>`
  display: flex;
  align-items: center;
  padding: ${({ $isCollapsed }) => $isCollapsed ? '16px' : '16px 20px'};
  margin: 16px 12px 24px;
  border: none;
  border-radius: ${({ $isCollapsed }) => $isCollapsed ? '50%' : '28px'};
  cursor: ${({ $isOnCreatePage }) => $isOnCreatePage ? 'default' : 'pointer'};
  position: relative;
  overflow: hidden;
  
  /* Enhanced smooth sizing transitions */
  min-height: 56px;
  height: 56px;
  width: ${({ $isCollapsed }) => $isCollapsed ? '56px' : 'calc(100% - 24px)'};
  max-width: ${({ $isCollapsed }) => $isCollapsed ? '56px' : '200px'};
  justify-content: ${({ $isCollapsed }) => $isCollapsed ? 'center' : 'flex-start'};
  
  /* Morphing background animation */
  background: ${({ $isOnCreatePage }) => 
    $isOnCreatePage 
      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
      : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
  };
  
  /* Morphing shadow animation */
  box-shadow: ${({ $isOnCreatePage }) => 
    $isOnCreatePage 
      ? `0 4px 12px rgba(16, 185, 129, 0.3), 0 2px 4px rgba(16, 185, 129, 0.2)`
      : `0 4px 20px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)`
  };
  
  /* Coordinated smooth transitions */
  transition: 
    width 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    max-width 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    padding 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    border-radius 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    background 0.6s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.6s cubic-bezier(0.4, 0, 0.2, 1),
    border 0.6s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Morphing border */
  border: ${({ $isOnCreatePage }) => 
    $isOnCreatePage 
      ? '2px solid transparent'
      : '2px solid rgba(106, 17, 203, 0.1)'
  };
  
  /* Hover effects */
  &:hover {
    transform: ${({ $isOnCreatePage }) => 
      $isOnCreatePage 
        ? 'translateY(0)'
        : 'translateY(-2px)'
    };
    
    box-shadow: ${({ $isOnCreatePage }) => 
      $isOnCreatePage 
        ? `0 6px 16px rgba(16, 185, 129, 0.4), 0 4px 8px rgba(16, 185, 129, 0.25)`
        : `0 8px 30px rgba(106, 17, 203, 0.25), 0 4px 12px rgba(106, 17, 203, 0.15)`
    };
    
    border-color: ${({ $isOnCreatePage }) => 
      $isOnCreatePage 
        ? 'transparent'
        : 'rgba(106, 17, 203, 0.2)'
    };
  }
  
  /* Active state morphing effect */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: ${({ $isOnCreatePage }) => 
      $isOnCreatePage 
        ? 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)'
        : 'transparent'
    };
    animation: ${({ $isOnCreatePage }) => 
      $isOnCreatePage 
        ? 'shimmer 2s infinite'
        : 'none'
    };
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  /* Ripple effect for click */
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: ${({ $isOnCreatePage }) => 
      $isOnCreatePage 
        ? 'rgba(255, 255, 255, 0.3)'
        : 'rgba(106, 17, 203, 0.2)'
    };
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: width 0.3s ease, height 0.3s ease;
  }
  
  &:active::after {
    width: 120px;
    height: 120px;
  }
  
  @media (max-width: 768px) {
    margin: 12px 8px 20px;
    height: 48px;
    min-height: 48px;
    width: ${({ $isCollapsed }) => $isCollapsed ? '48px' : 'calc(100% - 16px)'};
    max-width: ${({ $isCollapsed }) => $isCollapsed ? '48px' : '180px'};
    border-radius: ${({ $isCollapsed }) => $isCollapsed ? '50%' : '24px'};
    padding: ${({ $isCollapsed }) => $isCollapsed ? '12px' : '12px 16px'};
  }
`;

const AnimatedComposeIcon = styled.div<{ 
  $isCollapsed: boolean; 
  $isOnCreatePage: boolean 
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-right: ${({ $isCollapsed }) => $isCollapsed ? '0' : '12px'};
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  
  /* Morphing color animation */
  color: ${({ $isOnCreatePage }) => 
    $isOnCreatePage 
      ? 'white'
      : '#6a11cb'
  };
  
  /* Coordinated smooth transitions */
  transition: 
    margin-right 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    color 0.6s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Icon rotation animation */
  transform: ${({ $isOnCreatePage }) => 
    $isOnCreatePage 
      ? 'rotate(360deg) scale(1.05)'
      : 'rotate(0deg) scale(1)'
  };
  
  svg {
    filter: ${({ $isOnCreatePage }) => 
      $isOnCreatePage 
        ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))'
        : 'drop-shadow(0 1px 2px rgba(106, 17, 203, 0.2))'
    };
    transition: filter 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  @media (max-width: 768px) {
    font-size: 18px;
    margin-right: ${({ $isCollapsed }) => $isCollapsed ? '0' : '10px'};
  }
`;

const AnimatedComposeText = styled.span<{ 
  $isCollapsed: boolean; 
  $isOnCreatePage: boolean 
}>`
  font-weight: 600;
  font-size: 14px;
  position: relative;
  z-index: 1;
  white-space: nowrap;
  overflow: hidden;
  flex: 1;
  
  /* Enhanced visibility transitions */
  opacity: ${({ $isCollapsed }) => $isCollapsed ? 0 : 1};
  transform: ${({ $isCollapsed, $isOnCreatePage }) => {
    if ($isCollapsed) return 'translateX(-10px) scale(0.9)';
    return $isOnCreatePage ? 'translateX(0) scale(1.02)' : 'translateX(0) scale(1)';
  }};
  
  /* Morphing color and shadow animation */
  color: ${({ $isOnCreatePage }) => 
    $isOnCreatePage 
      ? 'white'
      : '#6a11cb'
  };
  
  text-shadow: ${({ $isOnCreatePage }) => 
    $isOnCreatePage 
      ? '0 1px 2px rgba(0,0,0,0.2)'
      : '0 1px 2px rgba(106, 17, 203, 0.1)'
  };
  
  /* Coordinated smooth transitions with stagger */
  transition: 
    opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    color 0.6s cubic-bezier(0.4, 0, 0.2, 1),
    text-shadow 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Delay text animation when expanding */
  transition-delay: ${({ $isCollapsed }) => $isCollapsed ? '0s' : '0.1s'};
  
  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const AnimatedComposeTooltip = styled.div<{ 
  $visible: boolean; 
  $isOnCreatePage: boolean 
}>`
  position: absolute;
  left: 70px;
  top: 50%;
  transform: translateY(-50%);
  background: #1f2937;
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  z-index: 1000;
  opacity: ${({ $visible }) => $visible ? 1 : 0};
  visibility: ${({ $visible }) => $visible ? 'visible' : 'hidden'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  
  /* Scale animation on show */
  transform: ${({ $visible }) => 
    $visible 
      ? 'translateY(-50%) scale(1)'
      : 'translateY(-50%) scale(0.9)'
  };
  
  &::before {
    content: '';
    position: absolute;
    left: -4px;
    top: 50%;
    transform: translateY(-50%);
    border: 4px solid transparent;
    border-right-color: #1f2937;
  }
`;

// Dashboard Layout Component
const DashboardAdminLayout: React.FC<DashboardLayoutProps> = ({
  children,
  menuItems,
  dashboardTitle,
  showComposeButton = true
}) => {
  // Use localStorage to persist sidebar state and open submenus
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Try to get the saved state from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarCollapsed');
      return saved === 'false' ? false : true;
    }
    return true;
  });
  
  const [isMobileView, setIsMobileView] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [openSubmenuIds, setOpenSubmenuIds] = useState<string[]>(() => {
    // Tenta obter os submenus abertos do localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('openSubmenuIds');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [hoverItem, setHoverItem] = useState<string | null>(null);
  const pathname = usePathname();
  const { data: session } = useSession();
  const router = useRouter();
  
  // Save sidebar state and open submenus to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', isCollapsed.toString());
      localStorage.setItem('openSubmenuIds', JSON.stringify(openSubmenuIds));
    }
  }, [isCollapsed, openSubmenuIds]);
  
  // Check if it's mobile view
  useEffect(() => {
    const checkIfMobile = () => {
      const isMobile = window.innerWidth < 768;
      setIsMobileView(isMobile);
      
      // Don't automatically collapse on larger screens
      if (isMobile) {
        setIsCollapsed(true);
      }
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for resize
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };
  
  const toggleSubmenu = (id: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    setOpenSubmenuIds(prev => {
      if (prev.includes(id)) {
        // Se o submenu já está aberto, fecha apenas ele
        return prev.filter(menuId => menuId !== id);
      } else {
        // Adiciona este submenu à lista de submenus abertos
        return [...prev, id];
      }
    });
  };
  
  const isSubmenuOpen = (id: string) => openSubmenuIds.includes(id);
  
  const handleNavLinkClick = (item: MenuItem, event: React.MouseEvent) => {
    // Se o item tem submenu
    if (item.subMenuItems && item.subMenuItems.length > 0) {
      if (isCollapsed) {
        // Se colapsado, navega para o primeiro item do submenu
        if (item.subMenuItems.length > 0) {
          router.push(item.subMenuItems[0].path);
        }
      } else {
        // Se expandido, alterna apenas o submenu clicado
        toggleSubmenu(item.id, event);
      }
      return;
    }
    
    // Se a sidebar está expandida e em modo móvel, fecha-a após o clique
    if (!isCollapsed && isMobileView) {
      setIsCollapsed(true);
    }
    
    // Navega para o caminho sem fechar os submenus
    if(item.path){
      router.push(item.path);
    }
  };
  
  const handleSubMenuMouseEnter = (id: string) => {
    if (isCollapsed) {
      setOpenSubmenuIds(prev => {
        if (!prev.includes(id)) {
          return [...prev, id];
        }
        return prev;
      });
    }
  };
  
  const handleSubMenuMouseLeave = (id: string) => {
    if (isCollapsed) {
      setOpenSubmenuIds(prev => prev.filter(menuId => menuId !== id));
    }
  };
  
  const handleNavItemMouseEnter = (id: string) => {
    setHoverItem(id);
  };
  
  const handleNavItemMouseLeave = () => {
    setHoverItem(null);
  };

  const hasPermission = (permissions: AdminPermissionsEnum[]) => {
    if(permissions.length === 0){
      return true;
    }
    if(session?.user?.permissions?.includes(AdminPermissionsEnum.FULL_ACCESS)){
      return true;
    }

    return permissions.some(permission => session?.user?.permissions?.includes(permission));
  }

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <DashboardContainer>
      <Overlay 
        $visible={isMobileView && !isCollapsed} 
        onClick={() => isMobileView && setIsCollapsed(true)}
      />
      
      <Sidebar $isCollapsed={isCollapsed}>
        <SidebarHeader>
          <SidebarToggle onClick={toggleSidebar}>
            {isCollapsed ? <FaBars /> : <FaTimes />}
          </SidebarToggle>
          <SidebarTitle $isCollapsed={isCollapsed}>
            {dashboardTitle}
          </SidebarTitle>
        </SidebarHeader>
        
    
        
        <NavMenu>
          {menuItems.map((item, index) => {
            const isActive = pathname === item.path || 
                            (item.subMenuItems && item.subMenuItems.some(subItem => subItem.path === pathname));
            
            // If item has submenu
            if (item.subMenuItems && item.subMenuItems.length > 0) {
              const isOpen = isSubmenuOpen(item.id);
              
              return (
                <NavItem 
                  key={item.id} 
                  $active={Boolean(isActive)}
                  onMouseEnter={() => handleSubMenuMouseEnter(item.id)}
                  onMouseLeave={() => handleSubMenuMouseLeave(item.id)}
                >
                  <NavItemWithSubmenu 
                    $isCollapsed={isCollapsed} 
                    $hasOpenSubmenu={isOpen}
                    $active={Boolean(isActive)}
                  >
                    <NavLink 
                      href="#"
                      $isCollapsed={isCollapsed}
                      $active={Boolean(isActive)}
                      $hasSubmenu={true}
                      onClick={(e) => handleNavLinkClick(item, e)}
                      onMouseEnter={() => handleNavItemMouseEnter(item.id)}
                      onMouseLeave={handleNavItemMouseLeave}
                    >
                      <NavIcon>{item.icon}</NavIcon>
                      <NavLabel $isCollapsed={isCollapsed} $hasSubmenu={true}>{item.label}</NavLabel>
                      {!isCollapsed && (
                        <MenuToggle 
                          $isOpen={isOpen}
                          onClick={(e) => toggleSubmenu(item.id, e)}
                        >
                          <FaChevronDown size={12} />
                        </MenuToggle>
                      )}
                      
                      {isCollapsed && hoverItem === item.id && (
                        <Tooltip $visible={true}>
                          {item.label}
                        </Tooltip>
                      )}
                    </NavLink>
                    
                    <SubMenuContainer $isOpen={isOpen} $isCollapsed={isCollapsed}>
                      {item.subMenuItems.map((subItem, subIndex) => {
                        const subItemActive = pathname === subItem.path;
                        return (
                          <SubMenuItem 
                            key={subItem.id} 
                            $active={subItemActive}
                            $disabled={!hasPermission(subItem.permissions || [])}
                            $index={subIndex}
                          >
                            {isCollapsed ? (
                              <SubMenuLinkCollapsed
                                href={subItem.path}
                                $active={subItemActive}
                                $disabled={!hasPermission(subItem.permissions || [])}
                                onClick={(e) => {
                                  e.preventDefault();
                                  router.push(subItem.path);
                                }}
                              >
                                {subItem.icon && <NavIcon>{subItem.icon}</NavIcon>}
                                {subItem.label}
                              </SubMenuLinkCollapsed>
                            ) : (
                              <SubMenuLink
                                href={subItem.path}
                                $active={subItemActive}
                                $disabled={!hasPermission(subItem.permissions || [])}
                                onClick={(e) => {
                                  e.preventDefault();
                                  router.push(subItem.path);
                                }}
                              >
                                {subItem.label}
                              </SubMenuLink>
                            )}
                          </SubMenuItem>
                        );
                      })}
                    </SubMenuContainer>
                  </NavItemWithSubmenu>
                </NavItem>
              );
            }
            
            // Regular item without submenu
            return (
              <NavItem 
                key={item.id} 
                $active={Boolean(pathname === item.path)}
                $disabled={!hasPermission(item.permissions || [])}
                onMouseEnter={() => handleNavItemMouseEnter(item.id)}
                onMouseLeave={handleNavItemMouseLeave}
              >
                {
                    hasPermission(item.permissions || []) ? (
                        <NavLink 
                  href={item.path || ''}
                  $isCollapsed={isCollapsed}
                  $active={Boolean(pathname === item.path)}
                  onClick={(e) => {
                    e.preventDefault();
                    if(item.path){
                      router.push(item.path);
                    }
                    if (isMobileView && !isCollapsed) {
                      setIsCollapsed(true);
                    }
                  }}
                >
                  <NavIcon>{item.icon}</NavIcon>
                  <NavLabel $isCollapsed={isCollapsed} $hasSubmenu={false}>{item.label}</NavLabel>
                  {isCollapsed && hoverItem === item.id && (
                    <Tooltip $visible={true}>
                      {item.label}
                    </Tooltip>
                  )}
                </NavLink>
                    ):(
                        <></>
                    )
                }
              </NavItem>
            );
          })}
        </NavMenu>
      </Sidebar>

      <MainContent $isCollapsed={isCollapsed}>
        <TopBar>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isMobileView && (
              <MobileMenuToggle onClick={toggleSidebar}>
                <FaBars />
              </MobileMenuToggle>
            )}
            <PageTitle>{getPageTitleFromPath(pathname || '')}</PageTitle>
          </div>
          
          <UserSection>
            <UserToggle onClick={(e) => {
              e.stopPropagation();
              toggleUserDropdown();
            }}>
              <FaUserCircle size={24} />
            </UserToggle>
            
            <UserDropdown 
              isOpen={isUserDropdownOpen} 
              onClose={() => setIsUserDropdownOpen(false)}
            />
          </UserSection>
        </TopBar>
        
        <WelcomeHeader>
          <GreetingSection>
            <Greeting>{getGreeting()}, <UserName>{session?.user?.name?.split(' ')[0] || 'Usuário'}</UserName>!</Greeting>
            <SubGreeting>Bem-vindo de volta ao seu painel de controle de rifas</SubGreeting>
          </GreetingSection>
        </WelcomeHeader>
        
        {children}
      </MainContent>
    </DashboardContainer>
  );
};

// Add UserDropdown component implementation
interface UserDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ isOpen, onClose }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Check if dropdown is going beyond viewport
    const adjustDropdownPosition = () => {
      if (dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        
        if (rect.right > viewportWidth) {
          // If dropdown is going beyond right edge, adjust position
          const overflow = rect.right - viewportWidth + 10; // 10px buffer
          dropdownRef.current.style.right = `${overflow}px`;
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Position check after a short delay to ensure the dropdown is visible
      setTimeout(adjustDropdownPosition, 10);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);


  const getUserRole = (role: string) => {
    const roleMap = {
      creator: 'Criador',
      participant: 'Participante',
      user: 'Participante',
      admin: 'Administrador'
    }
    return roleMap[role as keyof typeof roleMap];
    
  }

  return (
    <UserMenuDropdown ref={dropdownRef} $isOpen={isOpen}>
      <UserInfo>
        <UserAvatar>JD</UserAvatar>
        <UserDetails>
          <UserName>{session?.user?.name}</UserName>
          <UserRole>{getUserRole(session?.user?.role || '')}</UserRole>
          <UserEmail>{session?.user?.email}</UserEmail>
        </UserDetails>
      </UserInfo>
      <UserMenuItems>
        <UserMenuItem href="/profile">
          <UserMenuIcon><FaUser /></UserMenuIcon>
          Perfil
        </UserMenuItem>
        <UserMenuItem href="/settings">
          <UserMenuIcon><FaCog /></UserMenuIcon>
          Configurações
        </UserMenuItem>
        <UserMenuDivider />
        {
          session?.user?.role === 'admin' ? (
            <UserMenuItem onClick={() => signOut({redirect: true, callbackUrl: '/secure-portal-access/a7x92z'})}>
              <UserMenuIcon><FaSignOutAlt /></UserMenuIcon>
              Sair
            </UserMenuItem>
          ):(
            <UserMenuItem onClick={() => signOut({redirect: true, callbackUrl: '/login'})}>
              <UserMenuIcon><FaSignOutAlt /></UserMenuIcon>
              Sair
            </UserMenuItem>
          )
        }
      </UserMenuItems>
    </UserMenuDropdown>
  );
};

// Helper function to get page title from path
function getPageTitleFromPath(path: string): string {
  if (path === '/dashboard') return 'Início';
  
  const segments = path.split('/').filter(Boolean);
  if (segments.length > 0) {
    const lastSegment = segments[segments.length - 1];
    // Convert kebab-case or snake_case to Title Case
    return lastSegment
      .replace(/[-_]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  return 'Dashboard';
}

export default React.memo(DashboardAdminLayout); 