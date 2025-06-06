'use client';

import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { FaUser, FaSignOutAlt, FaCog } from 'react-icons/fa';

interface UserDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

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
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.div`
  font-weight: 600;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
`;

const UserEmail = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
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
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
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
`;

const UserDropdown: React.FC<UserDropdownProps> = ({ isOpen, onClose }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Skip if the event was already handled by stopPropagation
      if (event.defaultPrevented) return;
      
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Mock user data - in a real app, this would come from authentication context
  const user = {
    name: 'Usuário da Rifa',
    role: 'Participante'
  };

  const handleLogout = () => {
    // Implement logout logic here
    console.log('Logging out...');
    // Redirect to login page or home
    window.location.href = '/';
  };

  return (
    <UserMenuDropdown ref={dropdownRef} $isOpen={isOpen}>
      <UserInfo>
        <UserAvatar>JD</UserAvatar>
        <UserDetails>
          <UserName>{user.name}</UserName>
          <UserEmail>{user.role}</UserEmail>
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
        <UserMenuItem href="/logout" onClick={handleLogout}>
          <UserMenuIcon><FaSignOutAlt /></UserMenuIcon>
          Sair
        </UserMenuItem>
      </UserMenuItems>
    </UserMenuDropdown>
  );
};

export default UserDropdown; 