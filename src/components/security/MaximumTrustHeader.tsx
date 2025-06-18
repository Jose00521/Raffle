import React from 'react';
import styled from 'styled-components';

const TrustContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.5rem;
  background: linear-gradient(to right, rgba(248, 250, 252, 0.8), rgba(241, 245, 249, 0.8));
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  flex-wrap: wrap;
`;

const TrustItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.7rem;
  color: #475569;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(226, 232, 240, 0.5);
  white-space: nowrap;

  svg {
    width: 12px;
    height: 12px;
    color: #10b981;
  }

  @media (max-width: 480px) {
    font-size: 0.65rem;
    padding: 1px 5px;
    
    svg {
      width: 10px;
      height: 10px;
    }
  }
`;

const MaximumTrustHeader = () => {
  return (
    <TrustContainer>
      <TrustItem>
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91c4.59-1.15 8-5.86 8-10.91V5l-8-3zm6 9.09c0 4-2.55 7.7-6 8.83c-3.45-1.13-6-4.82-6-8.83v-4.7l6-2.25l6 2.25v4.7z"/>
        </svg>
        AMBIENTE SEGURO
      </TrustItem>
      <TrustItem>
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2s-2 .9-2 2s.9 2 2 2z"/>
        </svg>
        AES-512
      </TrustItem>
      <TrustItem>
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12c5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.7c0 4.67-3.13 8.95-7 10.18c-3.87-1.23-7-5.51-7-10.18V6.3l7-3.12zM11 7v6l4.75 2.85l.75-1.23l-4-2.37V7h-1.5z"/>
        </svg>
        SSL
      </TrustItem>
      <TrustItem>
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12c5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.7c0 4.67-3.13 8.95-7 10.18c-3.87-1.23-7-5.51-7-10.18V6.3l7-3.12zM11 7v6l4.75 2.85l.75-1.23l-4-2.37V7h-1.5z"/>
        </svg>
        LGPD
      </TrustItem>
    </TrustContainer>
  );
};

export default MaximumTrustHeader; 