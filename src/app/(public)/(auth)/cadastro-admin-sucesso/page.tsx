'use client';

import React, { useEffect } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaCheckCircle, FaShieldAlt, FaUserShield, FaLock, FaUserCog } from 'react-icons/fa';
import { motion } from 'framer-motion';

const PageContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  padding: 1rem;
`;

const ContentBox = styled(motion.div)`
  max-width: 600px;
  width: 90%;
  background: white;
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  padding: 3rem;
  text-align: center;
  overflow: hidden;
  position: relative;
  
  @media (max-width: 768px) {
    width: 95%;
    padding: 2rem 1.5rem;
  }
`;

const TopDecoration = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 8px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  z-index: 1;
`;

const SuccessIcon = styled(motion.div)`
  color: #10b981;
  font-size: 5rem;
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 2.5rem;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const ActionButton = styled(Link)`
  display: inline-block;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  font-weight: 600;
  padding: 0.9rem 2.2rem;
  border-radius: 50px;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(79, 70, 229, 0.3);
  }
`;

const HomeLink = styled.a`
  color: #666;
  text-decoration: none;
  display: inline-block;
  margin-top: 1.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    color: #4f46e5;
  }
`;

const SecurityInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
`;

const SecurityTitle = styled.div`
  font-size: 0.9rem;
  color: #444;
  margin-bottom: 0.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const SecurityItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #777;
  
  svg {
    color: #4f46e5;
  }
`;

const AdminCadastroSucesso = () => {
  const router = useRouter();
  
  // Redirecionar para a página de login do admin após 30 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/secure-portal-access/a7x92z');
    }, 30000);
    
    return () => clearTimeout(timer);
  }, [router]);
  
  return (
    <PageContainer>
      <ContentBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <TopDecoration />
        
        <SuccessIcon
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20,
            delay: 0.2
          }}
        >
          <FaCheckCircle />
        </SuccessIcon>
        
        <Title>Administrador Cadastrado com Sucesso!</Title>
        <Subtitle>
          Parabéns! Seu cadastro como administrador foi realizado com sucesso.
          Você já pode acessar o painel administrativo e gerenciar o sistema.
        </Subtitle>
        
        <ActionButton href="/secure-portal-access/a7x92z">
          Acessar Painel Administrativo
        </ActionButton>
        
        <div>
          <HomeLink href="/">Voltar para a página inicial</HomeLink>
        </div>
        
        <SecurityInfo>
          <SecurityTitle>
            <FaShieldAlt /> Informações de Segurança
          </SecurityTitle>
          <SecurityItem>
            <FaUserShield /> Seu acesso de administrador foi configurado com sucesso
          </SecurityItem>
          <SecurityItem>
            <FaLock /> Autenticação em múltiplos fatores disponível
          </SecurityItem>
          <SecurityItem>
            <FaUserCog /> Gerencie suas permissões no painel administrativo
          </SecurityItem>
        </SecurityInfo>
      </ContentBox>
    </PageContainer>
  );
};

export default AdminCadastroSucesso; 