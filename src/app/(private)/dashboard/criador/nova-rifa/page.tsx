'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import CreatorDashboard from '@/components/dashboard/CreatorDashboard';
import RaffleFormFields, { RaffleFormData } from '@/components/campaign/RaffleFormFields';
import { FaSave, FaArrowLeft, FaLightbulb, FaTrophy, FaImage, FaPen } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import campaignAPIClient from '@/API/participant/participantCampaignAPIClient';
import { ICampaign } from '@/models/interfaces/ICampaignInterfaces';
import { ApiResponse } from '@/server/utils/errorHandler/api';
import { toast, ToastContainer } from 'react-toastify';
import creatorCampaignAPI from '@/API/creator/creatorCampaignAPIClient';
// Styled Components
const Container = styled.div`
  max-width: 1200px;
  width: 100%;
  padding: 32px 12px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 120px);
  justify-content: flex-start;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 20px;
  }
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.8rem;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  font-weight: 700;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const BackLink = styled(Link)`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors?.primary || '#6a11cb'};
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 0.8;
    transform: translateX(-3px);
  }
`;

const TopTipsContainer = styled.div`
  margin-bottom: 24px;
  background: linear-gradient(120deg, rgba(106, 17, 203, 0.08) 0%, rgba(37, 117, 252, 0.08) 100%);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
  position: relative;

  @media (max-width: 768px) {
    padding: 24px;
    margin-bottom: 16px;
  }
`;

const TopTipsTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.3rem;
  color: ${({ theme }) => theme.colors?.primary || '#6a11cb'};
  margin: 0 0 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(106, 17, 203, 0.15);
  
  svg {
    font-size: 1.4rem;
  }
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
    margin-bottom: 16px;
    padding-bottom: 14px;
  }
`;

const TopTipsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
  padding-top: 8px;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const TipCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 100%;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const TipContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const TipIconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  box-shadow: 0 4px 10px rgba(106, 17, 203, 0.3);
  margin-bottom: 8px;
`;

const TipTitle = styled.h4`
  margin: 0 0 8px;
  font-size: 1.05rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
`;

const TipText = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  line-height: 1.5;
`;

const PageContent = styled.div`
  display: flex;
  gap: 40px;
  position: relative;
  z-index: 1;
  margin-bottom: 40px;
  
  @media (max-width: 1024px) {
    flex-direction: column;
    gap: 32px;
    margin-bottom: 32px;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  width: 100%;
  max-width: 1150px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    gap: 24px;
  }
`;

const FormContainer = styled.div`
  flex: 1;
  background: white;
  border-radius: 16px;
  background-color: transparent;
  position: relative;;

  
  @media (max-width: 768px) {
    
  }
`;

const SideTipsContainer = styled.div`
  width: 320px;
  background: linear-gradient(135deg, rgba(106, 17, 203, 0.05) 0%, rgba(37, 117, 252, 0.05) 100%);
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  align-self: flex-start;
  position: sticky;
  top: 32px;
  height: fit-content;
  
  @media (max-width: 1024px) {
    width: 100%;
    position: static;
    padding: 24px;
    margin-bottom: 16px;
  }
`;

const SideTipsTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 20px;
  color: ${({ theme }) => theme.colors?.primary || '#6a11cb'};
  display: flex;
  align-items: center;
  gap: 10px;
  
  svg {
    font-size: 1.2rem;
  }
`;

const TipsList = styled.ul`
  margin: 0;
  padding: 0 0 0 20px;
  
  li {
    margin-bottom: 16px;
    color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
    font-size: 0.9rem;
    line-height: 1.6;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const ButtonContainer = styled.div`
  margin-top: 48px;
  display: flex;
  justify-content: flex-end;
  padding: 0 16px 16px;
  
  @media (max-width: 768px) {
    justify-content: center;
    margin-top: 40px;
    padding: 0 8px 8px;
  }
`;

const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 18px 36px;
  font-weight: 600;
  font-size: 1.05rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(106, 17, 203, 0.3);
  }
  
  &:disabled {
    background: #9ca3af;
    transform: none;
    box-shadow: none;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    padding: 16px 28px;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 22px;
  height: 22px;
  border: 3px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const SuccessOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  text-align: center;
  backdrop-filter: blur(10px);
`;

const SuccessMessage = styled.div`
  max-width: 500px;
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(106, 17, 203, 0.08);
  
  h2 {
    font-size: 1.8rem;
    margin-bottom: 20px;
    color: ${({ theme }) => theme.colors?.primary || '#6a11cb'};
    font-weight: 700;
  }
  
  p {
    margin-bottom: 32px;
    color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
    line-height: 1.7;
    font-size: 1.05rem;
  }
  
  @media (max-width: 768px) {
    padding: 32px;
    
    h2 {
      font-size: 1.5rem;
      margin-bottom: 16px;
    }
    
    p {
      font-size: 0.95rem;
      margin-bottom: 24px;
    }
  }
`;

const SuccessActions = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  
  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const ActionButton = styled.button`
  padding: 14px 28px;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(106, 17, 203, 0.3);
  }
  
  @media (max-width: 480px) {
    width: 100%;
    padding: 12px 24px;
  }
`;

interface InstantPrizeData {
  type: 'money' | 'item';
  categoryId: string;
  quantity?: number;      // Para money prizes
  number?: string;        // Para item prizes (número temporário)
  value: number;
  prizeId?: string;       // Para item prizes
  name?: string;          // Para item prizes
  image?: string;         // Para item prizes
}


interface InstantPrizesPayload {
  prizes: InstantPrizeData[];
}

export default function NovaRifaPage() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const router = useRouter();
  
  const handleFormSubmit = async ({campaign, instantPrizes}: {campaign: ICampaign, instantPrizes: InstantPrizesPayload}) => {
    setIsSubmitting(true);
    
    try {
      // TODO: Implement the API call to create a new raffle
      console.log("Form data submitted para criar nova rifa:", {campaign, instantPrizes});

      const formData = new FormData();

      formData.append('campaign', JSON.stringify(campaign));
      formData.append('instantPrizes', JSON.stringify(instantPrizes));

      // Adicionar a imagem de capa
      if (campaign.coverImage instanceof File) {
        formData.append('coverImage', campaign.coverImage);
      }
      
      // Adicionar cada imagem separadamente
      if (campaign.images && Array.isArray(campaign.images)) {
        campaign.images.forEach((image, index) => {
          if (image instanceof File) {
            formData.append('images', image);
          }
        });
      }

      console.log("FormData:", formData);
      
      // Simulate API call
      const response: ApiResponse<ICampaign> = await creatorCampaignAPI.createCampaign(formData) as unknown as ApiResponse<ICampaign>;
      console.log("Resposta da API:", response);

      if (response.success) {
        toast.success("Rifa criada com sucesso!");
        goToMyRaffles();
        setShowSuccess(true);
        setIsSubmitting(false);
      } else {
        toast.error(response.message);
        setIsSubmitting(false);
      }
      
      // Show success overlay
      // setShowSuccess(true);
      
    } catch (error) {
      toast.error("Ocorreu um erro ao criar a rifa. Por favor, tente novamente.");
    }
  };
  
  const goToMyRaffles = () => {
    router.push('/dashboard/criador/minhas-rifas');
  };
  
  return (
    <CreatorDashboard>
      <Container>
        <MainContent>
          <PageHeader>
            <HeaderTitle>
              <BackLink href="/dashboard/criador/minhas-rifas">
                <FaArrowLeft />
              </BackLink>
              <Title>Nova Rifa</Title>
            </HeaderTitle>
          </PageHeader>
          
          <TopTipsContainer>
            <TopTipsTitle>
              <FaLightbulb /> Dicas para criar rifas de sucesso
            </TopTipsTitle>
            <TopTipsGrid>
              <TipCard>
                <TipIconWrapper>
                  <FaImage />
                </TipIconWrapper>
                <TipContent>
                  <TipTitle>Imagens de Qualidade</TipTitle>
                  <TipText>
                    Use fotos bem iluminadas e de alta resolução do prêmio. Múltiplas imagens mostrando diferentes ângulos aumentam a confiança dos participantes.
                  </TipText>
                </TipContent>
              </TipCard>
              
              <TipCard>
                <TipIconWrapper>
                  <FaPen />
                </TipIconWrapper>
                <TipContent>
                  <TipTitle>Descrição Detalhada</TipTitle>
                  <TipText>
                    Explique claramente as características do prêmio, seu valor e por que é desejável. Textos bem escritos geram mais engajamento.
                  </TipText>
                </TipContent>
              </TipCard>
              
              <TipCard>
                <TipIconWrapper>
                  <FaTrophy />
                </TipIconWrapper>
                <TipContent>
                  <TipTitle>Prêmios Atrativos</TipTitle>
                  <TipText>
                    Escolha prêmios que sua audiência realmente deseja. Adicione prêmios instantâneos para aumentar o interesse e a participação.
                  </TipText>
                </TipContent>
              </TipCard>
            </TopTipsGrid>
          </TopTipsContainer>
          
          <PageContent>
            <FormContainer>
              <RaffleFormFields 
                onSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
              />
              
              <ButtonContainer>
                <SubmitButton 
                  onClick={() => document.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true }))} 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner /> Criando rifa...
                    </>
                  ) : (
                    <>
                      <FaSave /> Criar Rifa
                    </>
                  )}
                </SubmitButton>
              </ButtonContainer>
            </FormContainer>
            
            <SideTipsContainer>
              <SideTipsTitle>
                <FaLightbulb /> Checklist de Sucesso
              </SideTipsTitle>
              <TipsList>
                <li>Defina um preço competitivo para os números</li>
                <li>Seja transparente sobre as regras do sorteio</li>
                <li>Inclua todas as especificações técnicas do prêmio</li>
                <li>Se for um produto novo, mencione a garantia</li>
                <li>Adicione informações sobre o envio do prêmio</li>
                <li>Compartilhe nas redes sociais para alcançar mais participantes</li>
                <li>Crie um regulamento claro para evitar mal-entendidos</li>
                <li>Estabeleça uma data de sorteio atrativa e viável</li>
              </TipsList>
            </SideTipsContainer>
          </PageContent>
        </MainContent>
        
        {showSuccess && (
          <SuccessOverlay>
            <SuccessMessage>
              <h2>Rifa Criada com Sucesso!</h2>
              <p>
                Parabéns! Sua rifa foi criada e agora está disponível para venda. 
                Compartilhe o link com seus amigos e nas redes sociais para 
                maximizar suas vendas e alcançar mais participantes.
              </p>
              <SuccessActions>
                <ActionButton onClick={goToMyRaffles}>
                  Ver Minhas Rifas
                </ActionButton>
              </SuccessActions>
            </SuccessMessage>
          </SuccessOverlay>
        )}
      </Container>
    </CreatorDashboard>
  );
} 