'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styled from 'styled-components';
import { FaArrowLeft, FaTrophy, FaEdit, FaTrash, FaCalendarAlt, FaBarcode, FaClock, FaInfoCircle, FaDollarSign, FaCheck } from 'react-icons/fa';
import { IPrize } from '@/models/interfaces/IPrizeInterfaces';
import ImageCarousel from '@/components/ui/ImageCarousel';
import ImageModal from '@/components/ui/ImageModal';
import CreatorDashboard from '@/components/dashboard/CreatorDashboard';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import PrizeDetailSkeleton from '@/components/ui/PrizeDetailSkeleton';
import { toast, ToastContainer } from 'react-toastify';
import creatorPrizeAPIClient from '@/API/creator/creatorPrizeAPIClient';
import LoadingScreen from '@/components/common/LoadingScreen';

// ======== ENHANCED PROFESSIONAL UI COMPONENTS ========

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

const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border: none;
  background-color: #f8fafc;
  color: #475569;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  
  &:hover {
    background-color: #f1f5f9;
    color: #4f46e5;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    width: 38px;
    height: 38px;
  }
`;

const HeaderContent = styled.div`
  margin-left: 18px;
`;

const HeaderTitle = styled.h1`
  font-size: 22px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  letter-spacing: -0.01em;
  
  svg {
    color: #6366f1;
  }
`;

const HeaderSubtitle = styled.div`
  font-size: 14px;
  color: #64748b;
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  svg {
    font-size: 12px;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-left: auto;
  
  @media (max-width: 768px) {
    gap: 8px;
  }
`;

const Button = styled.button<{ $variant?: 'primary' | 'danger' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 42px;
  padding: 0 18px;
  border-radius: 10px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 1px solid transparent;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  
  ${({ $variant }) => $variant === 'danger' 
    ? `
      color: #ef4444;
      background-color: #fef2f2;
      border-color: #fee2e2;
      
      &:hover {
        background-color: #fee2e2;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.08);
      }
    ` 
    : `
      color: white;
      background: linear-gradient(to right, #4f46e5, #6366f1);
      
      &:hover {
        background: linear-gradient(to right, #4338ca, #4f46e5);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
      }
    `
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    padding: 0 14px;
    
    span {
      display: none;
    }
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 72px 0;
  color: #64748b;
`;

const LoadingSpinner = styled.div`
  margin-bottom: 16px;
  
  svg {
    animation: spin 1s linear infinite;
    color: #6366f1;
    filter: drop-shadow(0 4px 6px rgba(99, 102, 241, 0.1));
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background-color: #fef2f2;
  color: #ef4444;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #fee2e2;
  text-align: center;
  max-width: 500px;
  margin: 40px auto;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.08);
  
  svg {
    margin-right: 8px;
  }
`;

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

const ImageSection = styled.div`
  background-color: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.06);
  position: relative;
  padding: 0;
  
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
  
  /* Improved styling for carousel container */
  > div {
    width: 100%;
  }
  
  /* Make images clickable with cursor pointer */
  img {
    cursor: pointer;
  }
  
  /* Add zoom indicator on hover */
  .carousel-slide {
    position: relative;
    
    &:hover .zoom-indicator {
      opacity: 1;
    }
  }
  
  .zoom-indicator {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.5);
    color: white;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    font-size: 24px;
    z-index: 5;
  }
  
  /* Improved styling for thumbnails */
  > div > div:last-child {
    padding: 16px;
    background: #f8fafc;
    border-top: 1px solid rgba(226, 232, 240, 0.6);
  }
`;

const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  
  @media (min-width: 992px) {
    padding-top: 10px; /* Align better with the carousel */
  }
`;

const Card = styled.div`
  background-color: white;
  border-radius: 16px;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
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

const CardTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  
  svg {
    color: #6366f1;
  }
`;

const CardContent = styled.div`
  padding: 28px;
`;

const PrizeName = styled.h1`
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 20px;
  color: #0f172a;
  line-height: 1.3;
  letter-spacing: -0.01em;
  
  @media (min-width: 768px) {
    font-size: 32px;
  }
`;

const PrizeValue = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 22px;
  font-weight: 600;
  padding: 12px 20px;
  border-radius: 12px;
  color: #4f46e5;
  background: linear-gradient(to right, rgba(99, 102, 241, 0.08), rgba(99, 102, 241, 0.15));
  margin-bottom: 28px;
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.1);
  
  svg {
    color: #6366f1;
  }
`;

const PrizeDescription = styled.div`
  font-size: 16px;
  line-height: 1.7;
  color: #475569;
  background-color: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(226, 232, 240, 0.6);
  
  p {
    margin-top: 0;
    margin-bottom: 16px;
  }
  
  p:last-child {
    margin-bottom: 0;
  }
`;

const DetailsList = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(1, 1fr);
  }
`;

const DetailItem = styled.div`
  padding: 20px;
  background: linear-gradient(to right, rgba(248, 250, 252, 0.6), rgba(241, 245, 249, 0.8));
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 0.6);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  width: 100%;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border-color: rgba(99, 102, 241, 0.2);
  }
`;

const DetailLabel = styled.div`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    font-size: 14px;
    color: #6366f1;
  }
`;

const DetailValue = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// Status badge for additional details
const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #047857;
  background-color: #ecfdf5;
  padding: 4px 8px;
  border-radius: 16px;
  margin-top: 8px;
  border: 1px solid #d1fae5;
  
  svg {
    font-size: 10px;
  }
`;

const CustomCarouselStyles = styled.div`
  /* Custom carousel styles that override the default ImageCarousel component */
  width: 100%;
  
  .carousel-dots {
    position: absolute;
    bottom: 15px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    gap: 8px;
    z-index: 10;
  }
  
  .carousel-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.6);
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &.active {
      background-color: white;
      transform: scale(1.2);
    }
    
    &:hover {
      background-color: white;
    }
  }
  
  .carousel-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.8);
    }
    
    &.prev {
      left: 16px;
    }
    
    &.next {
      right: 16px;
    }
  }
  
  /* Thumbnail styling */
  .carousel-thumbnails {
    display: flex;
    gap: 8px;
    padding: 16px;
    overflow-x: auto;
    background: #f8fafc;
    
    &::-webkit-scrollbar {
      height: 4px;
    }
    
    &::-webkit-scrollbar-track {
      background: #f1f5f9;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }
  }
  
  .carousel-thumbnail {
    width: 70px;
    height: 70px;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.2s ease;
    flex-shrink: 0;
    
    &.active {
      border-color: #4f46e5;
    }
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    &:hover {
      transform: translateY(-2px);
    }
  }
`;

// Main component
export default function PrizeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const [prize, setPrize] = useState<IPrize | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Funções de formatação de valor monetário
  const extractNumericValue = (valueString: string): number => {
    try {
      // Remove qualquer caractere que não seja dígito, ponto ou vírgula
      const cleanString = valueString.replace(/[^\d,.]/g, '');
      
      // Substitui vírgula por ponto para processamento numérico
      const normalizedString = cleanString.replace(/,/g, '.');
      
      // Converte para número
      const value = parseFloat(normalizedString);
      
      // Retorna 0 se não for um número válido
      return isNaN(value) ? 0 : value;
    } catch (error) {
      console.error("Erro ao extrair valor numérico:", error);
      return 0;
    }
  };

  const formatPrizeValue = (value: string | number): string => {
    if (!value) return 'R$ 0,00';
    
    // Se for um número, converte para string
    const valueString = typeof value === 'number' ? value.toString() : value;
    
    // Verificar se o valor já está formatado como moeda
    if (valueString.includes('R$')) {
      return valueString;
    }
    
    // Tenta converter para número
    const numericValue = extractNumericValue(valueString);
    
    // Formata como moeda brasileira
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(numericValue);
  };
  
  // Fetch prize data
  useEffect(() => {
    const fetchPrize = async () => {
      try {
        console.log('prize id',id);
        const response = await creatorPrizeAPIClient.getPrizeById(id as string);
        console.log('response',response);
        if (!response || response.error) {
          throw new Error(response?.message || 'Erro ao carregar o prêmio');
        }
        setPrize(response.data || response);
      } catch (err) {
        setError('Erro ao carregar o prêmio');
        console.error('Error loading prize:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPrize();
  }, [id]);
  
  const handleBack = () => {
    router.push('/dashboard/criador/premios');
  };
  
  const handleEdit = () => {
    router.push(`/dashboard/criador/premios/${id}`);
  };
  
  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!id) return;
    
    try {
      setIsDeleting(true);
      
      const response = await creatorPrizeAPIClient.deletePrize(id as string);
      console.log('response',response);
      
      // Fechar o modal e redirecionar para a lista de prêmios

      if(response.success){
        setShowDeleteModal(false);
        router.push('/dashboard/criador/premios');
      }

      if(response.error){
        toast.error(response.message);
      }
    } catch (err) {
      console.error('Erro ao excluir o prêmio:', err);
      // Aqui você poderia exibir uma mensagem de erro no modal
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };
  
  // Create a list of all images
  const allImages = prize ? [prize.image, ...(prize.images || [])].filter(Boolean) : [];
  
  // Convert File objects to strings (for display only)
  const getImageUrl = (image: string | File): string => {
    return typeof image === 'string' ? image : URL.createObjectURL(image);
  };
  
  const allImageUrls = allImages.map(getImageUrl);
  
  // Handle image click to open the modal
  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setShowImageModal(true);
  };
  
  // Format date for better display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (isLoading) {
    return (
      <LoadingScreen 
        title="Carregando prêmio"
        subtitle="Buscando todos os detalhes do prêmio"
      />
    );
  }
  
  return (
    <CreatorDashboard>
      <Container>
        <ToastContainer />
        <Header>
          <BackButton onClick={handleBack}>
            <FaArrowLeft size={18} />
          </BackButton>
          
          <HeaderContent>
            <HeaderTitle>
              <FaTrophy />
              Detalhes do Prêmio
            </HeaderTitle>
            {prize && <HeaderSubtitle><FaBarcode size={12} /> {prize.prizeCode}</HeaderSubtitle>}
          </HeaderContent>
          
          {prize && (
            <ActionButtons>
              <Button onClick={handleEdit}>
                <FaEdit size={16} />
                <span>Editar</span>
              </Button>
              
              <Button $variant="danger" onClick={handleDeleteClick}>
                <FaTrash size={16} />
                <span>Excluir</span>
              </Button>
            </ActionButtons>
          )}
        </Header>
        
        {error ? (
          <ErrorMessage>
            <FaInfoCircle />
            {error}
          </ErrorMessage>
        ) : prize ? (
          <ContentLayout>
            <ImageSection>
              <CustomCarouselStyles>
                <ImageCarousel 
                  images={allImageUrls}
                  showZoomIndicator={true}
                  aspectRatio="16/9"
                  showThumbnails={true}
                  autoplayInterval={5000}
                  onImageClick={handleImageClick}
                />
              </CustomCarouselStyles>
            </ImageSection>
            
            <ContentSection>
              <Card>
                <CardContent>
                  <PrizeName>{prize.name}</PrizeName>
                  <PrizeValue>
                    {formatPrizeValue(prize.value)}
                  </PrizeValue>
                  
                  {prize.description && (
                    <PrizeDescription>
                      {prize.description}
                    </PrizeDescription>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>
                    <FaInfoCircle />
                    Informações Detalhadas
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <DetailsList>
                    <DetailItem>
                      <DetailLabel>
                        <FaBarcode />
                        ID do Prêmio
                      </DetailLabel>
                      <DetailValue title={prize.prizeCode}>{prize.prizeCode}</DetailValue>
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
                      <DetailValue>
                        {formatDate(prize.createdAt?.toString())}
                      </DetailValue>
                    </DetailItem>
                    
                    <DetailItem>
                      <DetailLabel>
                        <FaClock />
                        Última Atualização
                      </DetailLabel>
                      <DetailValue>
                        {formatDate(prize.updatedAt?.toString())}
                      </DetailValue>
                    </DetailItem>
                  </DetailsList>
                </CardContent>
              </Card>
            </ContentSection>
          </ContentLayout>
        ) : (
          <ErrorMessage>
            <FaInfoCircle />
            Prêmio não encontrado
          </ErrorMessage>
        )}
        
        {/* Modal de confirmação de exclusão */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title="Confirmar Exclusão"
          message={`Tem certeza que deseja excluir o prêmio "${prize?.name}"? Esta ação não pode ser desfeita.`}
          confirmText={isDeleting ? "Excluindo..." : "Sim, Excluir"}
          cancelText="Cancelar"
          type="danger"
        />
        
        {/* Modal para visualização de imagens em tela cheia */}
        <ImageModal
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          images={allImageUrls}
          currentIndex={currentImageIndex}
          campaignTitle={prize?.name || "Prêmio"}
          campaignPrice={prize?.value ? formatPrizeValue(prize.value) : ""}
        />
      </Container>
    </CreatorDashboard>
  );
} 