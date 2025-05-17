'use client';

import React, { useState, useEffect, useRef } from 'react';
import styled, { css } from 'styled-components';
import { FaBars, FaTimes, FaAngleDown, FaAngleRight, FaUserCircle, FaChevronDown, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { FaTrophy } from 'react-icons/fa';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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

const Sidebar = styled.aside<{ $isCollapsed: boolean }>`
  width: ${props => props.$isCollapsed ? '80px' : '260px'};
  background: ${({ theme }) => theme.colors.primary || '#6a11cb'};
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  transition: width 0.3s ease;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
  overflow-x: hidden;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 5px;
  }

  @media (max-width: 768px) {
    transform: ${props => props.$isCollapsed ? 'translateX(-100%)' : 'translateX(0)'};
    width: 240px;
    position: fixed;
    z-index: 1000;
  }
  
  @media (max-width: 480px) {
    width: 220px;
  }
`;

const SidebarHeader = styled.div`
  height: 80px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  @media (max-width: 768px) {
    height: 70px;
    padding: 0 16px;
  }
  
  @media (max-width: 480px) {
    height: 60px;
    padding: 0 12px;
  }
`;

const SidebarTitle = styled.h2<{ $isCollapsed: boolean }>`
  font-size: 1rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
  opacity: ${props => props.$isCollapsed ? 0 : 1};
  transition: opacity 0.2s ease;
  display: ${props => props.$isCollapsed ? 'none' : 'block'};
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;

const SidebarToggle = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: all 0.2s ease;
  margin-right: ${props => props.children === 'FaTimes' ? '0' : '15px'};

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  @media (max-width: 768px) {
    position: ${props => props.children === 'FaTimes' ? 'absolute' : 'static'};
    right: ${props => props.children === 'FaTimes' ? '10px' : '0'};
    top: ${props => props.children === 'FaTimes' ? '10px' : '0'};
    width: 36px;
    height: 36px;
    font-size: 1.1rem;
  }
  
  @media (max-width: 480px) {
    width: 32px;
    height: 32px;
    font-size: 1rem;
  }
`;

const NavMenu = styled.ul`
  list-style: none;
  padding: 20px 0;
  margin: 0;
  
  @media (max-width: 768px) {
    padding: 15px 0;
  }
  
  @media (max-width: 480px) {
    padding: 12px 0;
  }
`;

const NavItem = styled.li<{ $active?: boolean }>`
  margin-bottom: 5px;
  
  ${props => props.$active && css`
    background-color: rgba(255, 255, 255, 0.15);
  `}
  
  @media (max-width: 480px) {
    margin-bottom: 3px;
  }
`;

const NavLink = styled(Link)<{ $isCollapsed: boolean; $active?: boolean }>`
  display: flex;
  align-items: center;
  padding: ${props => props.$isCollapsed ? '15px 0' : '15px 20px'};
  text-decoration: none;
  color: white;
  transition: all 0.2s ease;
  border-radius: ${props => props.$isCollapsed ? '0' : '8px'};
  position: relative;
  justify-content: ${props => props.$isCollapsed ? 'center' : 'flex-start'};

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  ${props => props.$active && css`
    color: white;
    font-weight: 600;
    
    &:before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 4px;
      background-color: white;
      border-radius: 0 2px 2px 0;
    }
  `}
  
  @media (max-width: 768px) {
    padding: ${props => props.$isCollapsed ? '12px 0' : '12px 16px'};
  }
  
  @media (max-width: 480px) {
    padding: ${props => props.$isCollapsed ? '10px 0' : '10px 12px'};
    font-size: 0.9rem;
  }
`;

const NavIcon = styled.span`
  margin-right: ${props => props.children ? '20px' : '0'};
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  
  svg {
    width: 20px;
    height: 20px;
  }
  
  @media (max-width: 768px) {
    margin-right: ${props => props.children ? '16px' : '0'};
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
  
  @media (max-width: 480px) {
    margin-right: ${props => props.children ? '14px' : '0'};
    
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
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const MainContent = styled.main<{ $isCollapsed: boolean }>`
  flex: 1;
  padding: 20px;
  margin-left: ${props => props.$isCollapsed ? '80px' : '260px'};
  transition: margin-left 0.3s ease;
  
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
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  
  @media (max-width: 768px) {
    margin-bottom: 15px;
    padding-bottom: 12px;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 12px;
    padding-bottom: 10px;
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
  margin: 0;
  max-height: ${props => props.$isOpen ? '500px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
  background-color: rgba(0, 0, 0, 0.1);
  
  ${props => props.$isCollapsed && `
    position: absolute;
    left: 100%;
    top: 0;
    width: 200px;
    background-color: #2575fc;
    border-radius: 0 8px 8px 0;
    box-shadow: 5px 0 15px rgba(0, 0, 0, 0.1);
    opacity: 0;
    visibility: hidden;
    transform: translateX(10px);
    transition: opacity 0.3s ease, transform 0.3s ease, visibility 0.3s ease;
    z-index: 200;
  `}
`;

const SubMenuItem = styled.li<{ $active?: boolean }>`
  ${props => props.$active && css`
    background-color: rgba(255, 255, 255, 0.1);
  `}
`;

const SubMenuLink = styled(Link)<{ $active?: boolean }>`
  padding: 10px 20px 10px 46px;
  display: flex;
  align-items: center;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.85rem;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: white;
  }
  
  ${props => props.$active && css`
    color: white;
    font-weight: 600;
    background-color: rgba(255, 255, 255, 0.05);
    
    &:before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 4px;
      background-color: white;
      border-radius: 0 2px 2px 0;
    }
  `}
`;

const SubMenuLinkCollapsed = styled(Link)<{ $active?: boolean }>`
  padding: 10px 15px;
  display: flex;
  align-items: center;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.85rem;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: white;
  }
  
  ${props => props.$active && css`
    color: white;
    font-weight: 600;
    background-color: rgba(255, 255, 255, 0.1);
  `}
`;

const NavItemWithSubmenu = styled.div<{ $isCollapsed: boolean; $hasOpenSubmenu: boolean }>`
  position: relative;
  
  ${props => props.$isCollapsed && props.$hasOpenSubmenu && `
    & > ${SubMenuContainer} {
      opacity: 1;
      visibility: visible;
      transform: translateX(0);
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
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  cursor: pointer;
  z-index: 10;
  opacity: 0.8;
  transition: transform 0.3s ease, opacity 0.3s ease;
  
  &:hover {
    opacity: 1;
  }
  
  svg {
    transform: ${props => props.$isOpen ? 'rotate(-180deg)' : 'rotate(0)'};
    transition: transform 0.3s ease;
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

const UserName = styled.div`
  font-weight: 600;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [openSubmenuIds, setOpenSubmenuIds] = useState<string[]>([]);
  const pathname = usePathname();

  // Check if it's mobile view
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobileView(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      } else if (window.innerWidth < 1024) {
        // Em telas médias, manter o sidebar colapsado por padrão
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
        return [...prev, id];
      }
    });
  };
  
  const isSubmenuOpen = (id: string) => openSubmenuIds.includes(id);

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
                <NavItem key={item.id} $active={Boolean(isActive)}>
                  <NavItemWithSubmenu $isCollapsed={isCollapsed} $hasOpenSubmenu={isOpen}>
                    <NavLink 
                      href={!isCollapsed ? '#' : item.path}
                      $isCollapsed={isCollapsed}
                      $active={Boolean(isActive)}
                      onClick={(e) => !isCollapsed && toggleSubmenu(item.id, e)}
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
                    </NavLink>
                    
                    <SubMenuContainer $isOpen={isOpen} $isCollapsed={isCollapsed}>
                      {item.subMenuItems.map(subItem => (
                        <SubMenuItem 
                          key={subItem.id} 
                          $active={pathname === subItem.path}
                        >
                          {isCollapsed ? (
                            <SubMenuLinkCollapsed
                              href={subItem.path}
                              $active={pathname === subItem.path}
                            >
                              {subItem.icon && <NavIcon>{subItem.icon}</NavIcon>}
                              {subItem.label}
                            </SubMenuLinkCollapsed>
                          ) : (
                            <SubMenuLink
                              href={subItem.path}
                              $active={pathname === subItem.path}
                            >
                              {subItem.icon && <NavIcon>{subItem.icon}</NavIcon>}
                              {subItem.label}
                            </SubMenuLink>
                          )}
                        </SubMenuItem>
                      ))}
                    </SubMenuContainer>
                  </NavItemWithSubmenu>
                </NavItem>
              );
            }
            
            // Regular item without submenu
            return (
              <NavItem key={item.id} $active={Boolean(pathname === item.path)}>
                <NavLink 
                  href={item.path}
                  $isCollapsed={isCollapsed}
                  $active={Boolean(pathname === item.path)}
                >
                  <NavIcon>{item.icon}</NavIcon>
                  <NavLabel $isCollapsed={isCollapsed}>{item.label}</NavLabel>
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
            <PageTitle>{getPageTitleFromPath(pathname)}</PageTitle>
          </div>
          
          <UserSection>
            <UserToggle onClick={toggleUserDropdown}>
              <FaUserCircle size={24} />
            </UserToggle>
            
            <UserDropdown 
              isOpen={isUserDropdownOpen} 
              onClose={() => setIsUserDropdownOpen(false)}
            />
          </UserSection>
        </TopBar>
        
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

  return (
    <UserMenuDropdown ref={dropdownRef} $isOpen={isOpen}>
      <UserInfo>
        <UserAvatar>JD</UserAvatar>
        <UserDetails>
          <UserName>John Doe</UserName>
          <UserEmail>john.doe@example.com</UserEmail>
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
        <UserMenuItem href="/logout">
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

export default DashboardLayout; 