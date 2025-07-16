'use client';

import React from 'react';
import styled, { keyframes } from 'styled-components';

interface TableLoadingStateProps {
  columns: number;
  rows?: number;
  showMobile?: boolean;
  className?: string;
}

// Animations
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
    opacity: 0.5;
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
`;

// Desktop Loading Components
const LoadingContainer = styled.div`
  width: 100%;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  
  @media (max-width: 640px) {
    display: none;
  }
`;

const LoadingTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
`;

const LoadingThead = styled.thead`
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`;

const LoadingHeaderRow = styled.tr``;

const LoadingHeaderCell = styled.th`
  padding: 14px 16px;
  text-align: left;
  background-color: #f8fafc;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`;

const LoadingHeaderSkeleton = styled.div`
  height: 16px;
  background: linear-gradient(
    90deg,
    #e2e8f0 25%,
    #f1f5f9 37%,
    #e2e8f0 63%
  );
  background-size: 400% 100%;
  animation: ${shimmer} 1.5s ease-in-out infinite;
  border-radius: 4px;
  width: ${() => Math.random() * 40 + 60}%;
`;

const LoadingTbody = styled.tbody``;

const LoadingRow = styled.tr<{ $index: number }>`
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  background-color: ${props => props.$index % 2 === 0 ? 'transparent' : 'rgba(0, 0, 0, 0.01)'};
  
  &:last-child {
    border-bottom: none;
  }
`;

const LoadingCell = styled.td`
  padding: 14px 16px;
  vertical-align: middle;
`;

const LoadingCellSkeleton = styled.div<{ $width?: string; $delay?: number }>`
  height: 14px;
  background: linear-gradient(
    90deg,
    #e2e8f0 25%,
    #f1f5f9 37%,
    #e2e8f0 63%
  );
  background-size: 400% 100%;
  animation: ${shimmer} 1.5s ease-in-out infinite;
  animation-delay: ${props => props.$delay || 0}ms;
  border-radius: 4px;
  width: ${props => props.$width || `${Math.random() * 30 + 70}%`};
`;

// Mobile Loading Components
const MobileLoadingContainer = styled.div`
  display: none;
  
  @media (max-width: 640px) {
    display: block;
  }
`;

const MobileLoadingCard = styled.div<{ $index: number }>`
  margin-bottom: 8px;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  animation: ${float} 3s ease-in-out infinite;
  animation-delay: ${props => props.$index * 0.1}s;
`;

const MobileLoadingHeader = styled.div`
  padding: 14px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MobileLoadingTitle = styled.div`
  height: 18px;
  background: linear-gradient(
    90deg,
    #e2e8f0 25%,
    #f1f5f9 37%,
    #e2e8f0 63%
  );
  background-size: 400% 100%;
  animation: ${shimmer} 1.5s ease-in-out infinite;
  border-radius: 4px;
  width: 60%;
`;

const MobileLoadingIcon = styled.div`
  width: 20px;
  height: 20px;
  background: linear-gradient(
    90deg,
    #e2e8f0 25%,
    #f1f5f9 37%,
    #e2e8f0 63%
  );
  background-size: 400% 100%;
  animation: ${shimmer} 1.5s ease-in-out infinite;
  animation-delay: 200ms;
  border-radius: 4px;
`;

const MobileLoadingBody = styled.div`
  padding: 0 14px 14px 14px;
`;

const MobileLoadingItem = styled.div`
  display: flex;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  
  &:last-child {
    border-bottom: none;
  }
`;

const MobileLoadingLabel = styled.div`
  flex: 0 0 120px;
  height: 12px;
  background: linear-gradient(
    90deg,
    #e2e8f0 25%,
    #f1f5f9 37%,
    #e2e8f0 63%
  );
  background-size: 400% 100%;
  animation: ${shimmer} 1.5s ease-in-out infinite;
  border-radius: 3px;
  width: 80px;
`;

const MobileLoadingValue = styled.div<{ $delay?: number }>`
  flex: 1;
  height: 12px;
  background: linear-gradient(
    90deg,
    #e2e8f0 25%,
    #f1f5f9 37%,
    #e2e8f0 63%
  );
  background-size: 400% 100%;
  animation: ${shimmer} 1.5s ease-in-out infinite;
  animation-delay: ${props => props.$delay || 0}ms;
  border-radius: 3px;
  width: ${() => Math.random() * 40 + 50}%;
`;

// Loading Indicator
const LoadingIndicator = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(106, 17, 203, 0.6),
    transparent
  );
  animation: ${shimmer} 2s ease-in-out infinite;
  z-index: 10;
`;

const LoadingWrapper = styled.div`
  position: relative;
  min-height: 400px; // Altura mínima para evitar layout shift
`;

const TableLoadingState: React.FC<TableLoadingStateProps> = ({
  columns,
  rows = 5,
  showMobile = true,
  className
}) => {
  // Gerar dados fictícios para as linhas
  const skeletonRows = Array.from({ length: rows }, (_, index) => ({
    id: index,
    cells: Array.from({ length: columns }, (_, cellIndex) => ({
      id: cellIndex,
      width: cellIndex === 0 ? '25%' : 
             cellIndex === 1 ? '20%' : 
             cellIndex === columns - 1 ? '15%' : 
             `${Math.random() * 20 + 15}%`,
      delay: cellIndex * 50
    }))
  }));

  const mobileItems = Array.from({ length: 3 }, (_, index) => ({
    id: index,
    fields: Array.from({ length: 4 }, (_, fieldIndex) => ({
      id: fieldIndex,
      delay: fieldIndex * 100
    }))
  }));

  return (
    <LoadingWrapper className={className}>
      <LoadingIndicator />
      
      {/* Desktop Loading */}
      <LoadingContainer>
        <LoadingTable>
          <LoadingThead>
            <LoadingHeaderRow>
              {Array.from({ length: columns }, (_, index) => (
                <LoadingHeaderCell key={index}>
                  <LoadingHeaderSkeleton />
                </LoadingHeaderCell>
              ))}
            </LoadingHeaderRow>
          </LoadingThead>
          <LoadingTbody>
            {skeletonRows.map((row, rowIndex) => (
              <LoadingRow key={row.id} $index={rowIndex}>
                {row.cells.map((cell) => (
                  <LoadingCell key={cell.id}>
                    <LoadingCellSkeleton 
                      $width={cell.width}
                      $delay={cell.delay}
                    />
                  </LoadingCell>
                ))}
              </LoadingRow>
            ))}
          </LoadingTbody>
        </LoadingTable>
      </LoadingContainer>

      {/* Mobile Loading */}
      {showMobile && (
        <MobileLoadingContainer>
          {mobileItems.map((item, index) => (
            <MobileLoadingCard key={item.id} $index={index}>
              <MobileLoadingHeader>
                <MobileLoadingTitle />
                <MobileLoadingIcon />
              </MobileLoadingHeader>
              <MobileLoadingBody>
                {item.fields.map((field) => (
                  <MobileLoadingItem key={field.id}>
                    <MobileLoadingLabel />
                    <MobileLoadingValue $delay={field.delay} />
                  </MobileLoadingItem>
                ))}
              </MobileLoadingBody>
            </MobileLoadingCard>
          ))}
        </MobileLoadingContainer>
      )}
    </LoadingWrapper>
  );
};

export default TableLoadingState; 