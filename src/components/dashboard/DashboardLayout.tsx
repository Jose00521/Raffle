'use client';

import React, { useState, useEffect, useRef } from 'react';
import styled, { css } from 'styled-components';
import { FaBars, FaTimes, FaAngleDown, FaAngleRight, FaUserCircle, FaChevronDown, FaUser, FaCog, FaSignOutAlt, FaPlusCircle, FaTrophy } from 'react-icons/fa';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

// Types
interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  subMenuItems?: Array<{
    id: string;
    label: string;
    path: string;
    icon?: React.ReactNode;
  }>;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  menuItems: MenuItem[];
  dashboardTitle: string;
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

const NavItem = styled.li<{ $active?: boolean }>`
  margin: 0;
  position: relative;
  
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

const NavLink = styled(Link)<{ $isCollapsed: boolean; $active?: boolean }>`
  display: flex;
  align-items: center;
  padding: ${props => props.$isCollapsed ? '14px 0' : '14px 16px'};
  text-decoration: none;
  color: ${props => props.$active ? '#ffffff' : 'rgba(255, 255, 255, 0.8)' as string};
  font-weight: ${props => props.$active ? '500' : '400'};
  transition: all 0.2s ease;
  position: relative;
  justify-content: ${props => props.$isCollapsed ? 'center' : 'flex-start'};
  letter-spacing: 0.3px;
  border-radius: 6px;
  margin: 0 ${props => props.$isCollapsed ? '8px' : '10px'};

  ${props => props.$active && activeNavItemStyles}

  &:hover {
    background-color: rgba(255, 255, 255, 0.1) as string;
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

const NavLabel = styled.span<{ $isCollapsed: boolean }>`
  opacity: ${props => props.$isCollapsed ? 0 : 1};
  transition: opacity 0.2s ease;
  white-space: nowrap;
  display: ${props => props.$isCollapsed ? 'none' : 'block'};
  font-size: 0.9rem;
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
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
  padding: 0;
  margin: 0 10px;
  max-height: ${props => props.$isOpen ? '500px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: rgba(0, 0, 0, 0.08) as string;
  border-radius: 6px;
  
  ${props => props.$isCollapsed && `
    position: absolute;
    left: 100%;
    top: 0;
    width: 200px;
    background: linear-gradient(135deg, #5a01bc 0%, #1565ec 100%);
    border-radius: 6px;
    box-shadow: 5px 0 15px rgba(0, 0, 0, 0.2) as string;
    opacity: 0;
    visibility: hidden;
    transform: translateX(5px);
    transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s ease;
    z-index: 200;
    margin: 0;
    padding: 5px 0;
  `}
`;

const SubMenuItem = styled.li<{ $active?: boolean }>`
  position: relative;
  
  ${props => props.$active && css`
    ${activeNavItemStyles}
  `}
`;

const SubMenuLink = styled(Link)<{ $active?: boolean }>`
  padding: 10px 10px 10px 44px;
  display: flex;
  align-items: center;
  text-decoration: none;
  color: ${props => props.$active ? '#ffffff' : 'rgba(255, 255, 255, 0.6)' as string};
  font-size: 0.85rem;
  transition: all 0.2s ease;
  position: relative;
  font-weight: ${props => props.$active ? '500' : '400'};
  margin: 2px 0;
  border-radius: 4px;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05) as string;
    color: white;
  }
  
  &::before {
    content: '';
    position: absolute;
    left: 20px;
    top: 50%;
    transform: translateY(-50%) as string;
    width: 5px;
    height: 5px;
    background-color: ${props => props.$active ? '#60a5fa' : 'rgba(255, 255, 255, 0.3)' as string};
    border-radius: 50%;
    transition: background-color 0.2s ease;
  }
  
  &:hover::before {
    background-color: ${props => props.$active ? '#60a5fa' : 'rgba(255, 255, 255, 0.5)' as string};
  }
`;

const SubMenuLinkCollapsed = styled(Link)<{ $active?: boolean }>`
  padding: 10px 14px;
  display: flex;
  align-items: center;
  text-decoration: none;
  color: ${props => props.$active ? '#ffffff' : 'rgba(255, 255, 255, 0.7)'};
  font-size: 0.85rem;
  transition: all 0.2s ease;
  font-weight: ${props => props.$active ? '500' : '400'};
  border-radius: 4px;
  margin: 2px 6px;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: white;
  }
  
  ${props => props.$active && css`
    background-color: rgba(96, 165, 250, 0.08);
    color: white;
  `}
`;

const NavItemWithSubmenu = styled.div<{ $isCollapsed: boolean; $hasOpenSubmenu: boolean; $active?: boolean }>`
  position: relative;
  
  ${props => props.$isCollapsed && props.$hasOpenSubmenu && `
    & > ${SubMenuContainer} {
      opacity: 1;
      visibility: visible;
      transform: translateX(0);
    }
  `}
  
  ${props => !props.$isCollapsed && props.$active && css`
    ${activeNavItemStyles}
  `}
`;

const MenuToggle = styled.button<{ $isOpen: boolean }>`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6) as string;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s ease;
  border-radius: 4px;
  
  &:hover {
    color: white;
    background-color: rgba(255, 255, 255, 0.05) as string;
  }
  
  svg {
    transform: ${props => props.$isOpen ? 'rotate(-180deg)' : 'rotate(0)'};
    transition: transform 0.3s ease;
    width: 12px;
    height: 12px;
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

// Dashboard Layout Component
const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  menuItems,
  dashboardTitle
}) => {
  // Use localStorage to persist sidebar state
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
  const [openSubmenuIds, setOpenSubmenuIds] = useState<string[]>([]);
  const [hoverItem, setHoverItem] = useState<string | null>(null);
  const pathname = usePathname();
  const { data: session } = useSession();
  const router = useRouter();
  
  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', isCollapsed.toString());
    }
  }, [isCollapsed]);
  
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
        return prev.filter(menuId => menuId !== id);
      } else {
        // Close other open submenus when opening a new one
        return [id];
      }
    });
  };
  
  const isSubmenuOpen = (id: string) => openSubmenuIds.includes(id);
  
  const handleNavLinkClick = (item: MenuItem, event: React.MouseEvent) => {
    // If the item has submenu
    if (item.subMenuItems && item.subMenuItems.length > 0) {
      if (isCollapsed) {
        // If collapsed, navigate to the first submenu item
        if (item.subMenuItems.length > 0) {
          router.push(item.subMenuItems[0].path);
        }
      } else {
        // If expanded, toggle the submenu
        toggleSubmenu(item.id, event);
      }
      return;
    }
    
    // If the sidebar is collapsed and on mobile, close it after click
    if (!isCollapsed && isMobileView) {
      setIsCollapsed(true);
    }
    
    // Navigate to the path
    router.push(item.path);
  };
  
  const handleSubMenuMouseEnter = (id: string) => {
    if (isCollapsed) {
      setOpenSubmenuIds(prev => [...prev, id]);
    }
  };
  
  const handleSubMenuMouseLeave = (id: string) => {
    if (isCollapsed) {
      // Delay hiding the submenu to make it easier to move mouse into it
      setTimeout(() => {
        setOpenSubmenuIds(prev => prev.filter(menuId => menuId !== id));
      }, 300);
    }
  };
  
  const handleNavItemMouseEnter = (id: string) => {
    setHoverItem(id);
  };
  
  const handleNavItemMouseLeave = () => {
    setHoverItem(null);
  };

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
          {menuItems.map((item) => {
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
                      onClick={(e) => handleNavLinkClick(item, e)}
                      onMouseEnter={() => handleNavItemMouseEnter(item.id)}
                      onMouseLeave={handleNavItemMouseLeave}
                    >
                      <NavIcon>{item.icon}</NavIcon>
                      <NavLabel $isCollapsed={isCollapsed}>{item.label}</NavLabel>
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
                      {item.subMenuItems.map(subItem => {
                        const subItemActive = pathname === subItem.path;
                        return (
                          <SubMenuItem 
                            key={subItem.id} 
                            $active={subItemActive}
                          >
                            {isCollapsed ? (
                              <SubMenuLinkCollapsed
                                href={subItem.path}
                                $active={subItemActive}
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
                onMouseEnter={() => handleNavItemMouseEnter(item.id)}
                onMouseLeave={handleNavItemMouseLeave}
              >
                <NavLink 
                  href={item.path}
                  $isCollapsed={isCollapsed}
                  $active={Boolean(pathname === item.path)}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(item.path);
                    if (isMobileView && !isCollapsed) {
                      setIsCollapsed(true);
                    }
                  }}
                >
                  <NavIcon>{item.icon}</NavIcon>
                  <NavLabel $isCollapsed={isCollapsed}>{item.label}</NavLabel>
                  {isCollapsed && hoverItem === item.id && (
                    <Tooltip $visible={true}>
                      {item.label}
                    </Tooltip>
                  )}
                </NavLink>
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
          <ActionButtons>
            <ActionButton onClick={() => router.push("/dashboard/criador/nova-rifa")}>
              <FaPlusCircle size={12} /> Nova Rifa
            </ActionButton>
            <ActionButton onClick={() => router.push("/dashboard/criador/premios")}>
              <FaTrophy size={12} /> Prêmios
            </ActionButton>
          </ActionButtons>
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
        <UserMenuItem onClick={() => signOut()}>
          <UserMenuIcon><FaSignOutAlt /></UserMenuIcon>
          Sair
        </UserMenuItem>
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

export default React.memo(DashboardLayout); 