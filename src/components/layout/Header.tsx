'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LoginModal from '../auth/LoginModal';
import UserDropdown from '../dashboard/UserDropdown';
import { useSession } from 'next-auth/react';

const HeaderContainer = styled.header`
  background: ${({ theme }) => theme.colors.gradients.purple};
  box-shadow: ${({ theme }) => theme.shadows.md};
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 2rem;
  max-width: 1280px;
  margin: 0 auto;
  position: relative;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 0.8rem 1rem;
  }
`;

const Logo = styled(Link)`
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: 800;
  color: ${({ theme }) => theme.colors.white};
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    transform: scale(1.02);
    transition: transform 0.2s ease;
  }
`;

const LogoIcon = styled.div`
  background: white;
  color: ${({ theme }) => theme.colors.primary};
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const Nav = styled.nav`
  display: flex;
  gap: 0.2rem;
  margin-left: auto;
  margin-right: 2rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  font-size: 1.25rem;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.white};
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const MobileMenu = styled.div<{ $isOpen: boolean }>`
  display: flex;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: linear-gradient(to bottom, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.primaryDark});
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  z-index: 99;
  visibility: ${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};
  opacity: ${({ $isOpen }) => ($isOpen ? '1' : '0')};
  transform: translateY(${({ $isOpen }) => ($isOpen ? '0' : '-20px')});
  transition: opacity 0.3s ease, transform 0.3s ease, visibility 0.3s;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  max-height: ${({ $isOpen }) => ($isOpen ? '90vh' : '0')};
  overflow-y: auto;
`;

const StyledNavLink = styled.div<{ $active?: boolean }>`
  position: relative;
  padding: 0.75rem 1rem;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    right: 50%;
    height: 3px;
    background-color: ${({ theme }) => theme.colors.white};
    border-radius: 2px;
    transition: all 0.3s ease;
    opacity: ${({ $active }) => ($active ? '1' : '0')};
  }
  
  a {
    color: ${({ theme }) => theme.colors.white};
    font-weight: ${({ $active }) => ($active ? '600' : '400')};
    text-decoration: none;
    transition: all 0.2s ease;
    position: relative;
    opacity: ${({ $active }) => ($active ? '1' : '0.85')};
  }
  
  &:hover {
    background: rgba(255,255,255,0.1);
    border-radius: 8px;
    
    &::after {
      left: 10%;
      right: 10%;
      opacity: 1;
    }
    
    a {
      opacity: 1;
    }
  }
`;

const MobileNavLink = styled.div<{ $active?: boolean }>`
  a {
    color: white;
    font-weight: ${({ $active }) => ($active ? '600' : '400')};
    text-decoration: none;
    font-size: 1.1rem;
    padding: 0.75rem 1rem;
    display: block;
    border-radius: 8px;
    background: ${({ $active }) => ($active ? 'rgba(255,255,255,0.2)' : 'transparent')};
    transition: all 0.2s ease;
    
    &:hover {
      background: rgba(255,255,255,0.1);
      transform: translateX(5px);
    }
  }
`;

const AuthButtons = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`;

const LoginButton = styled.a`
  background-color: rgba(255,255,255,0.9);
  color: ${({ theme }) => theme.colors.primary};
  padding: 0.6rem 1.5rem;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  
  &:hover {
    background-color: white;
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0,0,0,0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// Componente estilizado para o Link do Next.js
const StyledLoginLink = styled(Link)`
  background-color: rgba(255,255,255,0.9);
  color: ${({ theme }) => theme.colors.primary};
  padding: 0.6rem 1.5rem;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  
  &:hover {
    background-color: white;
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0,0,0,0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const MobileLoginButton = styled.button`
  width: 100%;
  margin-top: 1rem;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.gradients.purple};
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  }
`;

const UserAvatarButton = styled.button`
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 3px 10px rgba(106, 17, 203, 0.2);
  position: relative;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(106, 17, 203, 0.3);
  }
`;

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();


  // Detecta scroll para adicionar sombra mais forte
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fechar menu quando clicar em um link
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);
  
  // Evitar scroll quando o menu estiver aberto
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);
  
  const isActive = (path: string) => pathname === path;
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
  };

  const openLoginModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setLoginModalOpen(true);
  };

  return (
    <HeaderContainer style={{ boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.2)' : '' }}>
      <HeaderContent>
        <Logo href="/">
          <LogoIcon>R</LogoIcon>
          Rifa.com
        </Logo>
        
        <Nav>
          <StyledNavLink $active={isActive('/')}>
            <Link href="/">Início</Link>
          </StyledNavLink>
          <StyledNavLink $active={isActive('/campanhas')}>
            <Link href="/campanhas">Campanhas</Link>
          </StyledNavLink>
          <StyledNavLink $active={isActive('/como-funciona')}>
            <Link href="/como-funciona">Comunicados</Link>
          </StyledNavLink>
          <StyledNavLink $active={isActive('/cadastro-tipo') || isActive('/cadastro') || isActive('/cadastro-criador')}>
            <Link href="/cadastro-tipo">Cadastrar</Link>
          </StyledNavLink>
          <StyledNavLink $active={isActive('/meus-titulos')}>
            <Link href="/meus-titulos">Meus títulos</Link>
          </StyledNavLink>
          <StyledNavLink $active={isActive('/ganhadores')}>
            <Link href="/ganhadores">Ganhadores</Link>
          </StyledNavLink>
          <StyledNavLink $active={isActive('/contato')}>
            <Link href="/contato">Contato</Link>
          </StyledNavLink>
        </Nav>
        
        <AuthButtons>
        {session?.user ? (
          <UserDropdown 
            isOpen={userDropdownOpen} 
            onClose={() => setUserDropdownOpen(false)} 
          />
        ) : (
          <StyledLoginLink href="#" onClick={openLoginModal}>
            Entrar
          </StyledLoginLink>
        )}
        </AuthButtons>
        
        <MobileMenuButton onClick={toggleMobileMenu} aria-label="Menu">
          {mobileMenuOpen ? '✕' : '☰'}
        </MobileMenuButton>
      </HeaderContent>
      
      <MobileMenu $isOpen={mobileMenuOpen}>
        <MobileNavLink $active={isActive('/')}>
            <Link href="/">Início</Link>
        </MobileNavLink>
        <MobileNavLink $active={isActive('/campanhas')}>
            <Link href="/campanhas">Campanhas</Link>
        </MobileNavLink>
        <MobileNavLink $active={isActive('/comunicados')}>
            <Link href="/comunicados">Comunicados</Link>
        </MobileNavLink>
        <MobileNavLink $active={isActive('/cadastro-tipo') || isActive('/cadastro') || isActive('/cadastro-criador')}>
            <Link href="/cadastro-tipo">Cadastrar</Link>
        </MobileNavLink>
        <MobileNavLink $active={isActive('/meus-titulos')}>
            <Link href="/meus-titulos">Meus títulos</Link>
        </MobileNavLink>
        <MobileNavLink $active={isActive('/ganhadores')}>
            <Link href="/ganhadores">Ganhadores</Link>
        </MobileNavLink>
        
        <MobileLoginButton onClick={openLoginModal}>
          Entrar na conta
        </MobileLoginButton>
      </MobileMenu>
      
      {/* Modal de Login */}
      <LoginModal 
        isOpen={loginModalOpen} 
        onClose={() => setLoginModalOpen(false)} 
      />
    </HeaderContainer>
  );
};

export default Header; 