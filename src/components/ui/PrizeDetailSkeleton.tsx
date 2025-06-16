import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FaTrophy, FaInfoCircle, FaBarcode, FaCalendarAlt, FaClock, FaCheck } from 'react-icons/fa';
import CreatorDashboard from '@/components/dashboard/CreatorDashboard';

// Animações refinadas para o skeleton
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
    opacity: 0.7;
  }
`;

const breathe = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.01);
    opacity: 0.6;
  }
`;

// Componentes base do skeleton
const SkeletonBase = styled.div`
  background: linear-gradient(90deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%);
  background-size: 400px 100%;
  animation: ${shimmer} 2s infinite ease-in-out;
  border-radius: 8px;
`;

const SkeletonPulse = styled.div`
  background: linear-gradient(90deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%);
  background-size: 400px 100%;
  animation: ${shimmer} 2s infinite ease-in-out;
  border-radius: 8px;
`;

const SkeletonImage = styled.div`
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 25%, #cbd5e1 50%, #e2e8f0 75%, #f1f5f9 100%);
  background-size: 400% 400%;
  animation: ${breathe} 3s infinite ease-in-out;
  border-radius: 12px;
`;

// Layout principal
const Container = styled.div`
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: 0 24px;
  
  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

// Header com estilo consistente
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
  width: 42px;
  height: 42px;
  border-radius: 10px;
  margin-right: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  
  &::before {
    content: '';
    width: 14px;
    height: 14px;
    background-color: #94a3b8;
    border-radius: 2px;
  }
`;

const HeaderContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const HeaderTitle = styled(SkeletonBase)`
  height: 26px;
  width: 220px;
  border-radius: 6px;
`;

const HeaderSubtitle = styled(SkeletonBase)`
  height: 16px;
  width: 160px;
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
  width: 100px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &::before {
    content: '';
    width: 12px;
    height: 12px;
    background-color: #94a3b8;
    border-radius: 2px;
  }
  
  &::after {
    content: '';
    width: 40px;
    height: 10px;
    background-color: #94a3b8;
    border-radius: 2px;
  }
`;

// Layout de conteúdo principal
const ContentLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
  
  @media (min-width: 992px) {
    grid-template-columns: 1.2fr minmax(0, 1fr);
    gap: 56px;
    align-items: start;
  }
`;

// Seção de imagens
const ImageSection = styled.div`
  background-color: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.06);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(to right, #4f46e5, #6366f1);
    z-index: 10;
  }
  
  @media (min-width: 992px) {
    position: sticky;
    top: 24px;
  }
`;

const ImageCarouselSkeleton = styled(SkeletonImage)`
  width: 100%;
  height: 400px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%);
    border-radius: 50%;
    opacity: 0.6;
  }
  
  @media (max-width: 768px) {
    height: 280px;
  }
`;

const ThumbnailsSkeleton = styled.div`
  padding: 16px;
  background: #f8fafc;
  border-top: 1px solid rgba(226, 232, 240, 0.6);
  display: flex;
  gap: 8px;
  overflow-x: auto;
`;

const ThumbnailSkeleton = styled(SkeletonPulse)`
  width: 60px;
  height: 60px;
  border-radius: 8px;
  flex-shrink: 0;
`;

// Seção de conteúdo
const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  
  @media (min-width: 992px) {
    padding-top: 10px;
  }
`;

// Cards de conteúdo
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
`;

const CardTitleIcon = styled.div`
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  border-radius: 3px;
`;

const CardTitleText = styled(SkeletonBase)`
  height: 20px;
  width: 180px;
`;

const CardContent = styled.div`
  padding: 28px;
`;

// Componentes de conteúdo do prêmio
const PrizeNameSkeleton = styled(SkeletonBase)`
  height: 36px;
  width: 280px;
  margin-bottom: 20px;
  border-radius: 8px;
  
  @media (max-width: 768px) {
    height: 32px;
    width: 100%;
  }
`;

const PrizeValueSkeleton = styled(SkeletonPulse)`
  height: 48px;
  width: 180px;
  margin-bottom: 28px;
  border-radius: 12px;
  background: linear-gradient(90deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.05) 50%, rgba(99, 102, 241, 0.1) 100%);
  background-size: 400px 100%;
  animation: ${shimmer} 2s infinite ease-in-out;
`;

const PrizeDescriptionSkeleton = styled.div`
  background-color: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(226, 232, 240, 0.6);
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const DescriptionLine = styled(SkeletonBase)<{ $width?: string }>`
  height: 16px;
  width: ${props => props.$width || '100%'};
  border-radius: 4px;
`;

// Lista de detalhes
const DetailsList = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
`;

const DetailItem = styled.div`
  padding: 20px;
  background: linear-gradient(to right, rgba(248, 250, 252, 0.6), rgba(241, 245, 249, 0.8));
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 0.6);
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DetailLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DetailLabelIcon = styled.div`
  width: 12px;
  height: 12px;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  border-radius: 2px;
`;

const DetailLabelText = styled(SkeletonBase)`
  height: 14px;
  width: 100px;
`;

const DetailValue = styled(SkeletonBase)`
  height: 18px;
  width: 140px;
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
          </ThumbnailsSkeleton>
        </ImageSection>
        
        <ContentSection>
          <Card>
            <CardContent>
              <PrizeNameSkeleton />
              <PrizeValueSkeleton />
              <PrizeDescriptionSkeleton>
                <DescriptionLine />
                <DescriptionLine $width="85%" />
                <DescriptionLine $width="92%" />
                <DescriptionLine $width="70%" />
              </PrizeDescriptionSkeleton>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>
                <CardTitleIcon />
                <CardTitleText />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DetailsList>
                <DetailItem>
                  <DetailLabel>
                    <DetailLabelIcon />
                    <DetailLabelText />
                  </DetailLabel>
                  <DetailValue />
                </DetailItem>
                
                <DetailItem>
                  <DetailLabel>
                    <DetailLabelIcon />
                    <DetailLabelText />
                  </DetailLabel>
                  <DetailValue />
                </DetailItem>
                
                <DetailItem>
                  <DetailLabel>
                    <DetailLabelIcon />
                    <DetailLabelText />
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
    return (
      <CreatorDashboard>
        {content}
      </CreatorDashboard>
    );
  }

  return content;
};

export default PrizeDetailSkeleton; 