'use client';

import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';

const SectionContainer = styled.section`
  padding: 5rem 2rem;
  background-color: ${({ theme }) => theme.colors.gray.light};
`;

const SectionContent = styled.div`
  max-width: 1280px;
  margin: 0 auto;
`;

const SectionHeader = styled.div`
  margin-bottom: 3rem;
  text-align: center;
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;
`;

const SectionDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
  max-width: 700px;
  margin: 0 auto;
`;

const WinnersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const WinnerCard = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.md};
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const WinnerImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
`;

const WinnerContent = styled.div`
  padding: 1.5rem;
`;

const WinnerInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const WinnerAvatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  margin-right: 1rem;
  border: 3px solid ${({ theme }) => theme.colors.primary};
`;

const WinnerDetails = styled.div`
  flex: 1;
`;

const WinnerName = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.25rem;
`;

const PrizeName = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1rem;
`;

const WinnerMeta = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.gray.light};
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  
  i {
    margin-right: 0.5rem;
  }
`;

const ViewAllLink = styled.div`
  text-align: center;
  margin-top: 3rem;
`;

const ViewAllButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.primary};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
  }
`;

// Sample winners data - in a real app, this would come from an API
const winners = [
  {
    id: 1,
    name: 'Pedro Oliveira',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    prize: 'Honda CB 500F 0KM',
    prizeImage: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    ticketNumber: '583921',
    drawDate: '12/02/2023',
    campaignCode: 'RA3721',
  },
  {
    id: 2,
    name: 'Ana Luíza Santos',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    prize: 'iPhone 15 Pro Max',
    prizeImage: 'https://images.unsplash.com/photo-1695048133142-1a20484bfb8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    ticketNumber: '127834',
    drawDate: '28/03/2023',
    campaignCode: 'RA9532',
  },
  {
    id: 3,
    name: 'Carlos Mendes',
    avatar: 'https://randomuser.me/api/portraits/men/62.jpg',
    prize: 'R$ 50.000,00 em Dinheiro',
    prizeImage: 'https://images.unsplash.com/photo-1621155346337-1d19476ba7d6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    ticketNumber: '459872',
    drawDate: '15/04/2023',
    campaignCode: 'RA8274',
  },
];

const LatestWinners: React.FC = () => {
  return (
    <SectionContainer>
      <SectionContent>
        <SectionHeader>
          <SectionTitle>Últimos Ganhadores</SectionTitle>
          <SectionDescription>
            Conheça algumas das pessoas sortudas que já realizaram seus sonhos com nossas rifas. O próximo pode ser você!
          </SectionDescription>
        </SectionHeader>
        
        <WinnersGrid>
          {winners.map((winner) => (
            <WinnerCard key={winner.id}>
              <WinnerImageContainer>
                <img 
                  src={winner.prizeImage} 
                  alt={winner.prize}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </WinnerImageContainer>
              
              <WinnerContent>
                <WinnerInfo>
                  <WinnerAvatar>
                    <img 
                      src={winner.avatar}
                      alt={winner.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </WinnerAvatar>
                  
                  <WinnerDetails>
                    <WinnerName>{winner.name}</WinnerName>
                    <PrizeName>{winner.prize}</PrizeName>
                  </WinnerDetails>
                </WinnerInfo>
                
                <WinnerMeta>
                  <MetaItem>
                    <i className="fas fa-ticket-alt"></i>
                    {winner.ticketNumber}
                  </MetaItem>
                  
                  <MetaItem>
                    <i className="fas fa-calendar-alt"></i>
                    {winner.drawDate}
                  </MetaItem>
                  
                  <MetaItem>
                    <i className="fas fa-tag"></i>
                    {winner.campaignCode}
                  </MetaItem>
                </WinnerMeta>
              </WinnerContent>
            </WinnerCard>
          ))}
        </WinnersGrid>
        
        <ViewAllLink>
          <Link href="/ganhadores" className="view-all-button">
            Ver Todos os Ganhadores <i className="fas fa-trophy" style={{ marginLeft: '8px' }}></i>
          </Link>
        </ViewAllLink>
      </SectionContent>
    </SectionContainer>
  );
};

export default LatestWinners; 