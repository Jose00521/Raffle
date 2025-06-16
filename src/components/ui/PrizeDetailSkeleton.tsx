import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FaTrophy, FaInfoCircle, FaBarcode, FaCalendarAlt, FaClock, FaCheck } from 'react-icons/fa';
import CreatorDashboard from '@/components/dashboard/CreatorDashboard';

// Animação de shimmer suave para o skeleton
const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
`;

const breathe = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.02);
    opacity: 0.6;
  }
`;

const SkeletonBase = styled.div`
  background: linear-gradient(90deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%);
  background-size: 400px 100%;
  animation: ${shimmer} 2.5s infinite ease-in-out;
  border-radius: 8px;
`;

const SkeletonPulse = styled.div`
  background: linear-gradient(90deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%);
  background-size: 400px 100%;
  animation: ${shimmer} 2.5s infinite ease-in-out;
  border-radius: 8px;
`;

const SkeletonImage = styled.div`
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 25%, #cbd5e1 50%, #e2e8f0 75%, #f1f5f9 100%);
  background-size: 400% 400%;
  animation: ${breathe} 3s infinite ease-in-out;
  border-radius: 8px;
`;

const Container = styled.div`
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: 0 24px;
  
  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 24px 0;
  margin-bottom: 40px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 120px;
    height: 2px;
    background: linear-gradient(to right, #6366f1, #818cf8);
  }
  
  @media (max-width: 768px) {
    padding: 20px 0;
    margin-bottom: 32px;
  }
`;

const BackButton = styled(SkeletonPulse)`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  margin-right: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  
  &::before {
    content: '';
    width: 16px;
    height: 16px;
    background-color: #94a3b8;
    border-radius: 2px;
  }
`;

const HeaderContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const HeaderTitle = styled(SkeletonBase)`
  height: 32px;
  width: 240px;
  border-radius: 6px;
`;

const HeaderSubtitle = styled(SkeletonBase)`
  height: 18px;
  width: 180px;
  border-radius: 4px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const ActionButton = styled(SkeletonPulse)`
  width: 110px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &::before {
    content: '';
    width: 14px;
    height: 14px;
    background-color: #94a3b8;
    border-radius: 2px;
  }
  
  &::after {
    content: '';
    width: 50px;
    height: 12px;
    background-color: #94a3b8;
    border-radius: 2px;
  }
`;

const ContentLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: start;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 32px;
  }
`;

const ImageSection = styled.div`
  position: sticky;
  top: 24px;
`;

const ImageCarouselSkeleton = styled(SkeletonImage)`
  width: 100%;
  height: 420px;
  border-radius: 20px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.3);
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%);
    border-radius: 16px;
    opacity: 0.6;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 20px;
    right: 20px;
    width: 48px;
    height: 28px;
    background: linear-gradient(135deg, rgba(148, 163, 184, 0.9) 0%, rgba(100, 116, 139, 0.9) 100%);
    border-radius: 14px;
    opacity: 0.8;
  }
`;

const ThumbnailsSkeleton = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  padding: 0 8px;
`;

const ThumbnailSkeleton = styled(SkeletonImage)`
  width: 72px;
  height: 72px;
  border-radius: 12px;
  position: relative;
  border: 1px solid rgba(226, 232, 240, 0.4);
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 28px;
    height: 28px;
    background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%);
    border-radius: 6px;
    opacity: 0.7;
  }
  
  &:first-child {
    border: 2px solid #6366f1;
    box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.2);
  }
`;

const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Card = styled.div`
  background-color: white;
  border-radius: 16px;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.06);
  overflow: hidden;
`;

const CardHeader = styled.div`
  padding: 20px 28px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.6);
  background-color: #f8fafc;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(to bottom, #4f46e5, #6366f1);
  }
`;

const CardTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  
  svg {
    color: #6366f1;
  }
`;

const CardTitleText = styled(SkeletonBase)`
  height: 20px;
  width: 200px;
  border-radius: 4px;
`;

const CardContent = styled.div`
  padding: 28px;
`;

const PrizeName = styled(SkeletonBase)`
  height: 36px;
  width: 85%;
  margin-bottom: 24px;
  border-radius: 8px;
  
  @media (min-width: 768px) {
    height: 40px;
    width: 75%;
  }
`;

const PrizeValue = styled(SkeletonPulse)`
  height: 52px;
  width: 220px;
  border-radius: 16px;
  margin-bottom: 32px;
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 20px;
  
  &::before {
    content: '';
    width: 20px;
    height: 20px;
    background-color: #6366f1;
    border-radius: 4px;
    margin-right: 12px;
  }
  
  &::after {
    content: '';
    width: 120px;
    height: 20px;
    background-color: #6366f1;
    border-radius: 4px;
  }
`;

const PrizeDescription = styled.div`
  background-color: #f8fafc;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  position: relative;
`;

const DescriptionLine = styled(SkeletonBase)`
  height: 18px;
  margin-bottom: 14px;
  border-radius: 4px;
  
  &:nth-child(1) { width: 100%; }
  &:nth-child(2) { width: 95%; }
  &:nth-child(3) { width: 88%; }
  &:nth-child(4) { width: 72%; }
  &:last-child { 
    margin-bottom: 0;
    width: 45%;
  }
`;

const DetailsList = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
  
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  
  &:first-child {
    padding-top: 0;
  }
`;

const DetailLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  
  svg {
    color: #6366f1;
  }
`;

const DetailValue = styled(SkeletonBase)`
  height: 18px;
  width: 140px;
  border-radius: 4px;
`;

const StatusBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  
  svg {
    color: #22c55e;
  }
`;

interface PrizeDetailSkeletonProps {
  withDashboard?: boolean;
}

const PrizeDetailSkeleton: React.FC<PrizeDetailSkeletonProps> = ({ withDashboard = false }) => {
  const content = (
    <Container>
      <Header>
        <BackButton />
        
        <HeaderContent>
          <HeaderTitle />
          <HeaderSubtitle />
        </HeaderContent>
        
        <ActionButtons>
          <ActionButton />
          <ActionButton />
        </ActionButtons>
      </Header>
      
      <ContentLayout>
        <ImageSection>
          <ImageCarouselSkeleton />
          <ThumbnailsSkeleton>
            <ThumbnailSkeleton />
            <ThumbnailSkeleton />
            <ThumbnailSkeleton />
            <ThumbnailSkeleton />
            <ThumbnailSkeleton />
          </ThumbnailsSkeleton>
        </ImageSection>
        
        <ContentSection>
          <Card>
            <CardContent>
              <PrizeName />
              <PrizeValue />
              
              <PrizeDescription>
                <DescriptionLine />
                <DescriptionLine />
                <DescriptionLine />
                <DescriptionLine />
                <DescriptionLine />
              </PrizeDescription>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>
                <FaInfoCircle />
                <CardTitleText />
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <DetailsList>
                <DetailItem>
                  <DetailLabel>
                    <FaBarcode />
                    ID do Prêmio
                  </DetailLabel>
                  <DetailValue />
                  <StatusBadge>
                    <FaCheck />
                    Ativo
                  </StatusBadge>
                </DetailItem>
                
                <DetailItem>
                  <DetailLabel>
                    <FaCalendarAlt />
                    Data de Cadastro
                  </DetailLabel>
                  <DetailValue />
                </DetailItem>
                
                <DetailItem>
                  <DetailLabel>
                    <FaClock />
                    Última Atualização
                  </DetailLabel>
                  <DetailValue />
                </DetailItem>
              </DetailsList>
            </CardContent>
          </Card>
        </ContentSection>
      </ContentLayout>
    </Container>
  );

  if (withDashboard) {
    return <CreatorDashboard>{content}</CreatorDashboard>;
  }

  return content;
};

export default PrizeDetailSkeleton; 