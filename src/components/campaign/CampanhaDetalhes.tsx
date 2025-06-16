'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { CampaignStatusEnum, ICampaign } from '@/models/interfaces/ICampaignInterfaces';
import SecurityModal from '../auth/SecurityModal';
import ImageModal from '../ui/ImageModal';
import PremioCategory from './PremioCategory';
import { useRouter } from 'next/navigation';
import { IPrize } from '@/models/interfaces/IPrizeInterfaces';
import { INumberPackageCampaign, useCampaignSelection } from '@/hooks/useCampaignSelection';
import { toast } from 'react-toastify';
import QuickSignupModal from '@/components/campaign/QuickSignupModal';
import { formatCurrency } from '@/utils/formatNumber';



// Atualizando a interface IRifa para incluir as propriedades extras
interface CampanhaDetalheProps {
  campanhaDetalhes: ICampaign
}


// Componente principal
const CampanhaDetalhes: React.FC<CampanhaDetalheProps> = ({ campanhaDetalhes }) => {
  // Valor mínimo R$12,00, então se cada número custa R$1,00, são 12 números mínimo
  const initialized = useRef(false);

  const router = useRouter();
  const numeroMinimo = Math.max(12, Math.ceil(12 / (campanhaDetalhes?.individualNumberPrice || 0)));
  const [quantidadeSelecionada, setQuantidadeSelecionada] = useState(numeroMinimo);
  const [activeTab, setActiveTab] = useState('titulos');
  const [animateValue, setAnimateValue] = useState(false);
  // Estado para o carrossel de imagens
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);

  // Estados para controle de swipe/deslize
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  
  // Estado para controle de paginação dos títulos premiados
  const [visiblePrizes, setVisiblePrizes] = useState(20);
  // Estado para guardar o pacote promocional ativo
  const [activePacote, setActivePacote] = useState<number | null>(null);
  
  // Pacotes promocionais disponíveis
  const { selection, selectPackage, selectPackageFunction, clearSelection, updateQuantity } = useCampaignSelection(campanhaDetalhes as ICampaign);

  // Novo estado para o modal de cadastro rápido
  const [showSignupModal, setShowSignupModal] = useState(false);
  
  const handleParticipate = useCallback(() => {
    // Validar quantidade mínima
    if (selection?.quantity && selection?.quantity < campanhaDetalhes?.minNumbersPerUser) {
      toast.warning(`Selecione no mínimo ${campanhaDetalhes?.minNumbersPerUser} números`);
      return;
    }
    
    // Verificar se o usuário está logado, se não estiver, mostrar o modal de cadastro
    const isLoggedIn = false; // Aqui você deve verificar se o usuário está logado de verdade
    
    if (!isLoggedIn) {
      setShowSignupModal(true);
      return;
    }
    
    // Se o usuário estiver logado, continuar com o fluxo normal
    proceedWithPurchase();
    
  }, [selection, campanhaDetalhes]);
  
  // Função para continuar com a compra após o login/cadastro
  const proceedWithPurchase = () => {
    // Salvar seleção no localStorage para recuperar na página de pagamento
    localStorage.setItem('raffle_selection', JSON.stringify(selection));

    console.log('selection', selection);
    
    // Navegar para a página de pagamento com parâmetros na URL
    router.push(`/pagamento/${campanhaDetalhes.campaignCode}?qty=${selection?.quantity}&pkg=${selection?.campaignCode || ''}&total=${selection?.totalPrice}`);
  };
  
  
  // First, enhance the fixedPrizes array with additional information for a more luxurious display
  const fixedPrizes = [
    ...Array.from({ length: 20 }, (_, index) => ({
      number: String(1001 + index).padStart(6, '0'),
      value: 2000,
      winner: null,
      category: 'diamante',
      chance: '98%',
      emoji: '💎'
    })),
    ...Array.from({ length: 30 }, (_, index) => ({
      number: String(1101 + index).padStart(6, '0'),
      value: 1000,
      winner: null,
      category: 'master',
      chance: '85%',
      emoji: '🏆'
    })),
    ...Array.from({ length: 50 }, (_, index) => ({
      number: String(1201 + index).padStart(6, '0'),
    value: 500,
      winner: null,
      category: 'premiado',
      chance: '75%',
      emoji: '🎖️'
    }))
  ];

  useEffect(() => {
    if (!initialized.current && 
      campanhaDetalhes?.minNumbersPerUser && 
      campanhaDetalhes?.individualNumberPrice) {
    
    initialized.current = true;

    console.log('campanhaDetalhes', {
      isActive: true,
      quantity: campanhaDetalhes.minNumbersPerUser,
      price: campanhaDetalhes.individualNumberPrice,
      name: 'Pacote Mínimo',
      totalPrice: campanhaDetalhes.individualNumberPrice * campanhaDetalhes.minNumbersPerUser
    });
      
    selectPackageFunction({
        isActive: true,
        campaignCode: campanhaDetalhes.campaignCode,
        quantity: campanhaDetalhes.minNumbersPerUser,
        price: campanhaDetalhes.individualNumberPrice,
        name: 'Pacote Mínimo',
        totalPrice: campanhaDetalhes.individualNumberPrice * campanhaDetalhes.minNumbersPerUser
      });
    }
 
  }, [campanhaDetalhes, selectPackage]);
  
  // Imagens do carrossel (usando a imagem principal como primeira e adicionando imagens extras se disponíveis)
  const carouselImages = [campanhaDetalhes?.coverImage, ...(campanhaDetalhes?.images || [])];
  
  // Função para trocar para a próxima imagem
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
  };

  // Função para trocar para a imagem anterior
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  // Troca de imagem automática se autoplay estiver ativo
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isAutoplay) {
      intervalId = setInterval(() => {
        nextImage();
      }, 5000); // Troca a cada 5 segundos
    }

    return () => clearInterval(intervalId);
  }, [isAutoplay, currentImageIndex]);

  // Pause no autoplay quando o usuário interagir com o carrossel
  const handleUserInteraction = () => {
    setIsAutoplay(false);
    // Reinicia o autoplay após 10 segundos de inatividade
    setTimeout(() => setIsAutoplay(true), 10000);
  };
  
  // Opções de quantidade para compra em lotes
  const opcoes = [50, 100, 250, 500, 700, 1000];
  
  // Formatar data de sorteio
  const dataSorteio = new Date(campanhaDetalhes?.drawDate || '').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  

  
  // Calcular valor total
  const valorTotal = ((campanhaDetalhes?.individualNumberPrice || 0) * quantidadeSelecionada).toFixed(2);

  // Estado para armazenar as estatísticas dos números
  const [rifaStats, setRifaStats] = useState({
    totalNumbers: campanhaDetalhes?.totalNumbers,
    available: campanhaDetalhes?.stats?.available,
    reserved: 0,
    sold: 0,
    percentComplete: 0
  });
  
  // Buscar estatísticas dos números ao carregar o componente
  useEffect(() => {
    async function loadStats() {
      try {
        if (campanhaDetalhes?.campaignCode) {
          //const stats = await rifaAPI.getRifaStats(campanha._id.toString());
          //setRifaStats(stats);
        }
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error);
      }
    }
    
    loadStats();
  }, [campanhaDetalhes?.campaignCode]);
  
  // Calculando o progresso da rifa usando rifaStats
  const progresso = rifaStats.percentComplete;
  
  // Funções para handling de swipe/deslize no carrossel
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const isClickedRef = useRef(false);
  
  // Detectar se é mobile ou desktop para controlar comportamento do modal
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Verificar imediatamente
    checkDevice();
    
    // Adicionar listener para redimensionamento
    window.addEventListener('resize', checkDevice);
    
    // Limpar listener
    return () => window.removeEventListener('resize', checkDevice);
  }, []);
  
  // Função modificada para diferenciar drag de clique
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    handleUserInteraction();
    
    // Não iniciar drag se o clique foi em um botão de navegação
    if ((e.target as Element).closest('.navegacao-seta')) {
      return;
    }
    
    setIsDragging(true);
    isClickedRef.current = true;
    
    // Captura posição inicial (funciona para touch e mouse)
    const clientX = 'touches' in e 
      ? (e as React.TouchEvent).touches[0].clientX 
      : (e as React.MouseEvent).clientX;
    
    setTouchStartX(clientX);
    setTouchEndX(clientX);
  };
  
  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    
    // Captura posição atual (funciona para touch e mouse)
    const clientX = 'touches' in e 
      ? (e as React.TouchEvent).touches[0].clientX 
      : (e as React.MouseEvent).clientX;
    
    setTouchEndX(clientX);
    
    // Se moveu significativamente, não é um clique
    if (Math.abs(clientX - touchStartX) > 10) {
      isClickedRef.current = false;
    }
    
    // Calcula e aplica o offset para arrastar visualmente o slide
    const offset = clientX - touchStartX;
    setDragOffset(offset);
    
    // Previne scroll da página durante o deslize
    e.preventDefault();
  };
  
  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const diff = touchEndX - touchStartX;
    const threshold = 100; // Mínimo de pixels para considerar como swipe
    
    if (diff > threshold) {
      // Swipe para direita - slide anterior
      prevImage();
    } else if (diff < -threshold) {
      // Swipe para esquerda - próximo slide
      nextImage();
    } else if (isClickedRef.current && !isMobile) {
      // Foi um clique genuíno e não estamos em mobile
      setShowImageModal(true);
    }
    
    // Reset dos estados
    setIsDragging(false);
    setDragOffset(0);
    isClickedRef.current = false;
  };
  
  // Função para cancelar o dragging se o mouse sair da área
  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragOffset(0);
    }
  };
  
  // Add state variables for each category's visible items
  // Add this inside the CampanhaDetalhes component function, near other state variables
  const [visibleDiamante, setVisibleDiamante] = useState(10);
  const [visibleMaster, setVisibleMaster] = useState(10);
  const [visiblePremiado, setVisiblePremiado] = useState(10);
  
  // Verificar a distribuição das categorias
  useEffect(() => {
    const diamante = fixedPrizes.filter(p => p.category === 'diamante').length;
    const master = fixedPrizes.filter(p => p.category === 'master').length;
    const premiado = fixedPrizes.filter(p => p.category === 'premiado').length;
    
    console.log('Total de prêmios por categoria:', { diamante, master, premiado });
  }, []);
  
  // Modify the original loadMorePrizes function to be per-category
  const loadMoreDiamante = () => {
    const diamantePrizes = fixedPrizes.filter(p => p.category === 'diamante').length;
    setVisibleDiamante(prev => Math.min(prev + 10, diamantePrizes));
  };
  
  const loadMoreMaster = () => {
    const masterPrizes = fixedPrizes.filter(p => p.category === 'master').length;
    setVisibleMaster(prev => Math.min(prev + 10, masterPrizes));
  };
  
  const loadMorePremiado = () => {
    const premiadoPrizes = fixedPrizes.filter(p => p.category === 'premiado').length;
    setVisiblePremiado(prev => Math.min(prev + 10, premiadoPrizes));
  };
  
  // Create styled component for a more subtle "ver mais" button
  const VerMaisButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: auto;
    padding: 0.5rem 1rem;
    margin: 0.75rem auto;
    background: transparent;
    color: ${({ theme }) => theme.colors.primary};
    border: 1px dashed ${({ theme }) => `${theme.colors.primary}30`};
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background: ${({ theme }) => `${theme.colors.primary}08`};
      border: 1px dashed ${({ theme }) => `${theme.colors.primary}60`};
    }
    
    i {
      margin-left: 0.5rem;
      font-size: 0.8rem;
    }
  `;

  // Componente para renderizar uma categoria de prêmios
  // const PremioCategory = ({ ... entire component implementation ... }) => { ... }

  // Handler para o botão "Meus Números"
  const handleMeusNumerosClick = () => {
    // Implementar a lógica para mostrar os números do usuário
    console.log("Meus Números clicado");
  };
  
  return (
    <Container>
      {/* Banner da campanha */}
      <Banner style={{ backgroundImage: `url(${campanhaDetalhes?.coverImage || ''})` }}>
        {/* Botão Meus Números */}
        <MeusTitulosButton onClick={handleMeusNumerosClick}>
          <i className="fas fa-ticket-alt"></i> Meus Números
        </MeusTitulosButton>
        
        {/* Código do sorteio */}
        <BannerOverlay>
          <CodigoSorteio>
            {campanhaDetalhes?.campaignCode}
          </CodigoSorteio>
          
          {/* Título da campanha */}
          <Titulo>{campanhaDetalhes?.title}</Titulo>
          
          {/* Subtítulo/prêmio principal */}
          <SubTitulo>{(campanhaDetalhes?.prizeDistribution?.[0]?.prizes?.[0] as IPrize)?.name || campanhaDetalhes?.title}</SubTitulo>
          
          {/* Botões de ação */}
          <BotoesAcao>
            <BotaoCompartilhar>
              <i className="fas fa-share-alt"></i> Compartilhar
            </BotaoCompartilhar>
            <BotaoFavorito>
              <i className="fas fa-heart"></i>
            </BotaoFavorito>
            
          </BotoesAcao>
        </BannerOverlay>
      </Banner>
      
      {/* Progresso */}
      <ProgressoContainer>
        <ProgressoInfo>
          <ProgressoTexto>
            <span>{progresso}% vendido</span>
            <span>Restam: {rifaStats.available} números</span>
          </ProgressoTexto>
          <ProgressoValor>{dataSorteio}</ProgressoValor>
        </ProgressoInfo>
        <ProgressoBar>
          <ProgressoBarFill style={{ width: `${progresso}%` }} />
        </ProgressoBar>
      </ProgressoContainer>
      
      {/* Conteúdo principal */}
      <Conteudo>
        {/* Mobile layout - hide on desktop */}
        <MobileContainer>
          <PainelImagem>
            {/* Novo componente de carrossel de imagens com suporte a swipe */}
            <CarrosselContainer 
              onClick={handleUserInteraction}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove as any}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleTouchStart}
              onMouseMove={handleTouchMove as any}
              onMouseUp={handleTouchEnd}
              onMouseLeave={handleMouseLeave}
            >
              <CarrosselWrapper 
                style={{ 
                  transform: `translateX(calc(-${currentImageIndex * 100}% + ${isDragging ? dragOffset : 0}px))`,
                  transition: isDragging ? 'none' : 'transform 0.5s ease'
                }}
              >
                {carouselImages.map((img: string | File, index: number) => (
                  <CarrosselSlide key={index}>
                    <CarrosselImagem 
                      src={img} 
                      alt={`${campanhaDetalhes?.title} - imagem ${index+1}`}
                      draggable={false}
                    />
                    {!isMobile && <ZoomIndicator><i className="fas fa-search-plus"></i></ZoomIndicator>}
                  </CarrosselSlide>
                ))}
              </CarrosselWrapper>
              
              {/* <CarrosselOverlay>
                <PrecoDestaque>
                  R$ {campanha.price.toFixed(2)}
                </PrecoDestaque>
              </CarrosselOverlay> */}
              
              <CarrosselSetas>
                <SetaNavegacao 
                  className="navegacao-seta"
                  onClick={(e) => { 
                    e.stopPropagation();
                    prevImage();
                  }}
                >
                  <i className="fas fa-chevron-left"></i>
                </SetaNavegacao>
                <SetaNavegacao 
                  className="navegacao-seta"
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    nextImage();
                  }}
                >
                  <i className="fas fa-chevron-right"></i>
                </SetaNavegacao>
              </CarrosselSetas>
              
              <IndicadoresPontos>
                {carouselImages.map((_:string | File, index:number) => (
                  <PontoIndicador 
                    key={index} 
                    className="navegacao-seta"
                    $ativo={index === currentImageIndex}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                      handleUserInteraction();
                    }}
                  />
                ))}
              </IndicadoresPontos>
            </CarrosselContainer>
            
            {/* Miniaturas das imagens */}
            <MiniaturasContainer>
              {carouselImages.map((img: string | File, index: number) => (
                <MiniaturaBotao
                  key={index}
                  $ativo={index === currentImageIndex}
                  onClick={() => {
                    setCurrentImageIndex(index);
                    handleUserInteraction();
                  }}
                >
                  <MiniaturaImagem src={img} alt={`Miniatura ${index + 1}`} />
                </MiniaturaBotao>
              ))}
            </MiniaturasContainer>
          </PainelImagem>
          
          {/* Mobile purchase container */}
          {
            campanhaDetalhes?.status === CampaignStatusEnum.SCHEDULED ? (
              <></>
            ):(
              <CompraContainer>
            {/* Mensagem incentivo */}
            <MensagemIncentivo>
              <i className="fas fa-trophy"></i> Quanto mais títulos, mais chances de ganhar!
            </MensagemIncentivo>
            
            {/* Pacotes Promocionais - Nova seção */}
            <PacotesPromocionaisContainer>
              <PacotesPromocionaisTitulo>
                <i className="fas fa-tags"></i> Aumente suas chances de ganhar com os pacotes promocionais!
              </PacotesPromocionaisTitulo>
              
              <PacotesPromocionaisGrid>
                {campanhaDetalhes?.numberPackages.map((pacote: INumberPackageCampaign) => (
                  <PacotePromocional 
                    key={pacote.quantity} 
                    $melhorOferta={pacote.highlight}
                    $ativo={selection?.quantity === pacote.quantity}
                    onClick={() => selectPackage(pacote)}
                  >
                    {pacote.highlight && <PacoteMelhorOferta><i className="fas fa-star"></i> Melhor oferta</PacoteMelhorOferta>}
                    <PacoteQuantidade>{pacote.quantity} cotas</PacoteQuantidade>
                    <PacoteDescricaoValor>{formatCurrency(campanhaDetalhes?.individualNumberPrice * pacote.quantity || 0)}</PacoteDescricaoValor>
                    <PacotePreco>{formatCurrency(pacote.price || 0)}</PacotePreco>
                    <PacoteEconomia>Economia de {formatCurrency((pacote.quantity * campanhaDetalhes?.individualNumberPrice) - pacote.price || 0)}</PacoteEconomia>
                  </PacotePromocional>
                ))}
              </PacotesPromocionaisGrid>
            </PacotesPromocionaisContainer>
            
            {/* Seletor de quantidade estilo moderno */}
            <QuantidadeSelector>
              <QuantidadeLabel>Quantidade de títulos:</QuantidadeLabel>
              <QuantidadeControle>
                <BotoesEsquerda>
                  <BotaoReset onClick={() => clearSelection()} disabled={selection?.quantity && selection.quantity <= (campanhaDetalhes?.minNumbersPerUser || 0) || false}>
                    <i className="fas fa-undo-alt"></i>
                  </BotaoReset>
                  <BotaoMenos onClick={() => selection?.quantity && selection.quantity > (campanhaDetalhes?.minNumbersPerUser || 0) && updateQuantity(selection.quantity - 1)} disabled={selection?.quantity && selection.quantity <= (campanhaDetalhes?.minNumbersPerUser || 0) || false}>
                    <span>−</span>
                  </BotaoMenos>
                </BotoesEsquerda>
                <QuantidadeNumero>
                  <span>{selection?.quantity}</span>
                </QuantidadeNumero>
                <BotaoMais onClick={() => selection?.quantity && updateQuantity(selection.quantity + 1)}>
                  <span>+</span>
                </BotaoMais>
              </QuantidadeControle>
              
              {/* Opções de lotes */}
              <SeletorLotes>
                {opcoes.map((opcao) => (
                  <OpcaoLote 
                    key={opcao} 
                    onClick={() => selection?.quantity && updateQuantity(selection.quantity + opcao)}
                    $popular={opcao === 100}
                  >
                    +{opcao}
                    {opcao === 100 && <PopularTag>Mais Popular</PopularTag>}
                    <TextoSelecionar>Adicionar</TextoSelecionar>
                  </OpcaoLote>
                ))}
              </SeletorLotes>
              
              {/* Valor total */}
              <ValorTotalContainer>
                <ValorTotalLabel>Total:</ValorTotalLabel>
                <ValorTotal>
                  {formatCurrency(selection?.totalPrice || 0)}
                </ValorTotal>
              </ValorTotalContainer>
            </QuantidadeSelector>
            
            {/* Botão de participar */}
            <BotaoParticipar 
              id="botao-comprar"
              onClick={handleParticipate}
            >
              Participar agora
              <i className="fas fa-chevron-right"></i>
            </BotaoParticipar>
            
            {/* Informação de segurança */}
            <SegurancaInfo onClick={() => setShowSecurityModal(true)}>
              <i className="fas fa-shield-alt"></i> Compra 100% segura e criptografada
            </SegurancaInfo>
          </CompraContainer>
            )
          }
        </MobileContainer>
        
        {/* Desktop layout - with the structure requested */}
        <DesktopContainer>
          {/* Images at the top */}
          <PainelImagem>
            {/* New carousel de imagens with swipe support */}
            <CarrosselContainer 
              onClick={handleUserInteraction}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove as any}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleTouchStart}
              onMouseMove={handleTouchMove as any}
              onMouseUp={handleTouchEnd}
              onMouseLeave={handleMouseLeave}
            >
              <CarrosselWrapper 
                style={{ 
                  transform: `translateX(calc(-${currentImageIndex * 100}% + ${isDragging ? dragOffset : 0}px))`,
                  transition: isDragging ? 'none' : 'transform 0.5s ease'
                }}
              >
                {carouselImages.map((img: string | File, index: number) => (
                  <CarrosselSlide key={index}>
                    <CarrosselImagem 
                      src={img} 
                      alt={`${campanhaDetalhes?.title} - imagem ${index+1}`}
                      draggable={false}
                    />
                    {!isMobile && <ZoomIndicator><i className="fas fa-search-plus"></i></ZoomIndicator>}
                  </CarrosselSlide>
                ))}
              </CarrosselWrapper>
              
              <CarrosselSetas>
                <SetaNavegacao 
                  className="navegacao-seta"
                  onClick={(e) => { 
                    e.stopPropagation();
                    prevImage();
                  }}
                >
                  <i className="fas fa-chevron-left"></i>
                </SetaNavegacao>
                <SetaNavegacao 
                  className="navegacao-seta"
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    nextImage();
                  }}
                >
                  <i className="fas fa-chevron-right"></i>
                </SetaNavegacao>
              </CarrosselSetas>
              
              <IndicadoresPontos>
                {carouselImages.map((_:string | File, index:number) => (
                  <PontoIndicador 
                    key={index} 
                    className="navegacao-seta"
                    $ativo={index === currentImageIndex}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                      handleUserInteraction();
                    }}
                  />
                ))}
              </IndicadoresPontos>
            </CarrosselContainer>
            
            {/* Miniaturas das imagens */}
            <MiniaturasContainer>
              {carouselImages.map((img: string | File, index: number) => (
                <MiniaturaBotao
                  key={index}
                  $ativo={index === currentImageIndex}
                  onClick={() => {
                    setCurrentImageIndex(index);
                    handleUserInteraction();
                  }}
                >
                  <MiniaturaImagem src={img} alt={`Miniatura ${index + 1}`} />
                </MiniaturaBotao>
              ))}
            </MiniaturasContainer>
          </PainelImagem>
          
          {/* Row layout below the images */}

            {/* Left side - Promotional packages */}
            {
              campanhaDetalhes?.status === CampaignStatusEnum.SCHEDULED ? (
                <></>
              ):(
                <SelectionRowContainer>
            {/* Left side - Promotional packages */}
              
            <PacotesPromocionaisContainer >
                  <PacotesPromocionaisTitulo>
                    <i className="fas fa-tags"></i> Pacotes promocionais
                  </PacotesPromocionaisTitulo>
                  <PacotesPromocionaisGrid>
                {campanhaDetalhes?.numberPackages ?(
                  campanhaDetalhes?.numberPackages.map((pacote: INumberPackageCampaign) => (
                    
                    <PacotePromocional 
                      key={pacote.quantity} 
                      $melhorOferta={pacote.highlight}
                      $ativo={selection?.quantity === pacote.quantity}
                      onClick={() => selectPackage(pacote)}
                    >
                      {pacote.highlight && <PacoteMelhorOferta><i className="fas fa-star"></i> Melhor oferta</PacoteMelhorOferta>}
                      <PacoteQuantidade>{pacote.quantity} cotas</PacoteQuantidade>
                      <PacoteDescricaoValor>{formatCurrency(campanhaDetalhes?.individualNumberPrice * pacote.quantity || 0)}</PacoteDescricaoValor>
                      <PacotePreco>{formatCurrency(pacote.price || 0)}</PacotePreco>
                      <PacoteEconomia>Economia de {formatCurrency((pacote.quantity * campanhaDetalhes?.individualNumberPrice) - pacote.price || 0)}</PacoteEconomia>
                    </PacotePromocional>
                  ))
                ):(
                  <PacotePromocional>
                    <PacoteQuantidade>Nenhum pacote promocional disponível</PacoteQuantidade>
                  </PacotePromocional>
                )}
              </PacotesPromocionaisGrid>
            </PacotesPromocionaisContainer>
            
            {/* Right side - Quantity selector */}
            <CompraDesktop>
              <MensagemIncentivo>
                <i className="fas fa-trophy"></i> Quanto mais títulos, mais chances de ganhar!
              </MensagemIncentivo>
              
              <QuantidadeSelector>
                <QuantidadeLabel>Quantidade de títulos:</QuantidadeLabel>
                <QuantidadeControle>
                  <BotoesEsquerda>
                    <BotaoReset onClick={() => clearSelection()} disabled={selection?.quantity && selection.quantity <= (campanhaDetalhes?.minNumbersPerUser || 0) || false}>
                      <i className="fas fa-undo-alt"></i>
                    </BotaoReset>
                    <BotaoMenos onClick={() => selection?.quantity && selection.quantity > (campanhaDetalhes?.minNumbersPerUser || 0) && updateQuantity(selection.quantity - 1)} disabled={selection?.quantity && selection.quantity <= (campanhaDetalhes?.minNumbersPerUser || 0) || false}>
                      <span>−</span>
                    </BotaoMenos>
                  </BotoesEsquerda>
                  <QuantidadeNumero>
                    <span>{selection?.quantity}</span>
                  </QuantidadeNumero>
                  <BotaoMais onClick={() => selection?.quantity && updateQuantity(selection.quantity + 1)}>
                    <span>+</span>
                  </BotaoMais>
                </QuantidadeControle>
                
                {/* Opções de lotes */}
                <SeletorLotes>
                  {opcoes.map((opcao) => (
                    <OpcaoLote 
                      key={opcao} 
                      onClick={() => selection?.quantity && updateQuantity(selection.quantity + opcao)}
                      $popular={opcao === 100}
                    >
                      +{opcao}
                      {opcao === 100 && <PopularTag>Mais Popular</PopularTag>}
                      <TextoSelecionar>Adicionar</TextoSelecionar>
                    </OpcaoLote>
                  ))}
                </SeletorLotes>
                
                {/* Valor total */}
                <ValorTotalContainer>
                  <ValorTotalLabel>Total:</ValorTotalLabel>
                  <ValorTotal>
                    {formatCurrency(selection?.totalPrice || 0)}
                  </ValorTotal>
                </ValorTotalContainer>
              </QuantidadeSelector>
              
              {/* Botão de participar */}
              <BotaoParticipar 
                id="botao-comprar-desktop"
                onClick={handleParticipate}
              >
                Participar agora
                <i className="fas fa-chevron-right"></i>
              </BotaoParticipar>
              
              {/* Informação de segurança */}
              <SegurancaInfo onClick={() => setShowSecurityModal(true)}>
                <i className="fas fa-shield-alt"></i> Compra 100% segura e criptografada
              </SegurancaInfo>
            </CompraDesktop>
          </SelectionRowContainer>
              )
            }
            
        </DesktopContainer>
        
        {/* Modal de Segurança */}
        <SecurityModal 
          isOpen={showSecurityModal}
          onClose={() => setShowSecurityModal(false)}
        />
        
        {/* Modal de Imagem em tela cheia */}
        <ImageModal 
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          images={campanhaDetalhes?.images as string[] || []}
          currentIndex={1}
        />
        
        {/* Abas de conteúdo */}
        <Abas>
          <TabsContainer>
            <TabButton 
              $ativo={activeTab === 'titulos'} 
              onClick={() => setActiveTab('titulos')}
            >
              <i className="fas fa-trophy"></i> Títulos premiados
            </TabButton>
            <TabButton 
              $ativo={activeTab === 'regulamento'} 
              onClick={() => setActiveTab('regulamento')}
            >
              <i className="fas fa-file-alt"></i> Descrição/Regulamento
            </TabButton>
          </TabsContainer>
          
          {/* Conteúdo da aba de regulamento */}
          <TabContent $visivel={activeTab === 'regulamento'}>
            <Regulamento>
              <h3>Descrição/Regulamento</h3>
              <p>{campanhaDetalhes?.regulation || campanhaDetalhes?.description}</p>
              
              <h4>PREMIAÇÃO:</h4>
              <p>{(campanhaDetalhes?.prizeDistribution?.[0]?.prizes?.[0] as IPrize)?.name} (SUGESTÃO DE USO DO PRÊMIO LÍQUIDO {(campanhaDetalhes?.prizeDistribution?.[0]?.prizes?.[0] as IPrize)?.value})</p>
              
              <h4>COMO FUNCIONA:</h4>
              <p>
                Você escolhe a quantidade de números que deseja adquirir (mínimo {numeroMinimo}). 
                O sistema irá gerar aleatoriamente os números para você entre os disponíveis para esta campanha.
                Quanto mais números adquirir, maiores são suas chances de ganhar!
              </p>
              
              {/* {campanha.instantPrizes && campanha.instantPrizes.length > 0 && (
                <>
                  <h4>INSTANTÂNEAS:</h4>
                  <p>
                    100 TÍTULOS PREMIADOS DE R$ 500,00
                  </p>
                  <PremiosList>
                    {fixedPrizes.slice(0, 10).map(prize => prize.number).join(', ')}
                    {fixedPrizes.length > 10 ? '...' : ''}
                  </PremiosList>
                </>
              )} */}
            </Regulamento>
          </TabContent>
          
          {/* Conteúdo da aba de títulos premiados */}
          <TabContent $visivel={activeTab === 'titulos'}>
            <TitulosPremiadosInfo>
              <TitulosPremiadosLista>
                <PremiadosInfoBox $type="total">
                  <PremiadosLabel>Total</PremiadosLabel>
                  <PremiadosValor>100</PremiadosValor>
                </PremiadosInfoBox>
                <PremiadosInfoBox $type="disponivel">
                  <PremiadosLabel>Disponíveis</PremiadosLabel>
                  <PremiadosValor>100</PremiadosValor>
                </PremiadosInfoBox>
                <PremiadosInfoBox $type="sorteado">
                  <PremiadosLabel>Sorteados</PremiadosLabel>
                  <PremiadosValor>0</PremiadosValor>
                </PremiadosInfoBox>
              </TitulosPremiadosLista>
              
              {/* Categoria Diamante */}
              <PremiosCategoryTitle>Títulos Premium</PremiosCategoryTitle>
              
              <PremioCategory 
                category="diamante"
                title="Diamante"
                icon="fa-gem"
                prizeValue={2000}
                quantity={20}
                prizes={fixedPrizes}
                visibleItems={visibleDiamante}
                onLoadMore={loadMoreDiamante}
                foundTitles={foundTitles}
              />
              
              {/* Categoria Master */}
              <PremioCategory 
                category="master"
                title="Master"
                icon="fa-trophy"
                prizeValue={1000}
                quantity={30}
                prizes={fixedPrizes}
                visibleItems={visibleMaster}
                onLoadMore={loadMoreMaster}
                foundTitles={foundTitles}
              />
              
              {/* Categoria Premiados */}
              <PremioCategory 
                category="premiado"
                title="Premiado"
                icon="fa-award"
                prizeValue={500}
                quantity={50}
                prizes={fixedPrizes}
                visibleItems={visiblePremiado}
                onLoadMore={loadMorePremiado}
                foundTitles={foundTitles}
              />
              
              {/* Títulos Encontrados Section */}
             
            </TitulosPremiadosInfo>
          </TabContent>
        </Abas>
        
        {/* Informações legais */}
        <InformacoesLegais>
          <h4>
            <i className="fas fa-shield-alt"></i> Capitalizadora
          </h4>
          <p>
            Título de Capitalização da Modalidade Filantropia Premiável de Contribuição Única, 
            emitido pela VIACAP Capitalização S/A, CNPJ XX.XXX.XXX/0001-XX, aprovado pelo Processo SUSEP 
            que consta no Título. É proibida a venda de título de capitalização a menores de dezesseis anos.
          </p>
        </InformacoesLegais>
      </Conteudo>
      
      {/* Modal de cadastro rápido */}
      <QuickSignupModal 
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        campanha={campanhaDetalhes}
        campaignSelection={selection as INumberPackageCampaign}
        onSuccess={proceedWithPurchase}
      />
    </Container>
  );
};

// Novos componentes estilizados com design mobile-first
const Container = styled.div`
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 0;
  background-color: ${({ theme }) => theme.colors.background};
  
  @media (min-width: 1024px) {
    max-width: 1280px;
  }
`;

const MobileContainer = styled.div`
display: flex;
flex-direction: column;
gap: 1.5rem;
margin-bottom: 1.5rem;

@media (min-width: 992px) {
  display: none; // Hide on desktop
}
`;

// Add a desktop container with the new layout
const DesktopContainer = styled.div`
display: none; // Hidden on mobile
flex-direction: column;
gap: 1.5rem;
margin-bottom: 1.5rem;

@media (min-width: 992px) {
  display: flex;
}
`;

// Create a row container for the promotional packages and quantity selector
const SelectionRowContainer = styled.div`
display: flex;
gap: 1.5rem;

> * {
  flex: 1; // Make both children take equal space
}
`;

// Add styled component for desktop purchase container
const CompraDesktop = styled.div`
display: flex;
flex-direction: column;
gap: 1.5rem;
background-color: ${({ theme }) => theme.colors.white};
padding: 1.5rem;
border-radius: ${({ theme }) => theme.borderRadius.lg};
box-shadow: ${({ theme }) => theme.shadows.md};
`;

const Banner = styled.div`
  background: ${({ theme }) => theme.colors.gradients.dark};
  position: relative;
  color: ${({ theme }) => theme.colors.white};
  padding: 0;
  height: 40vh;
  max-height: 400px;
  min-height: 250px;
  background-size: cover;
  background-position: center;
  overflow: hidden;
  
  @media (min-width: 768px) {
    border-radius: 0 0 20px 20px;
  }
`;

const BannerOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const MeusTitulosButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.95);
  color: #2d3748;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
  z-index: 10;
  
  &:hover {
    background: rgba(255, 255, 255, 1);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    border-color: rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }
  
  i {
    font-size: 0.75rem;
    opacity: 0.8;
  }
  
  @media (max-width: 768px) {
    top: 0.75rem;
    right: 0.75rem;
    padding: 0.4rem 0.6rem;
    font-size: 0.75rem;
    
    i {
      font-size: 0.7rem;
    }
  }
`;

const CodigoSorteio = styled.div`
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
  color: ${({ theme }) => theme.colors.white};
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  margin-bottom: 1rem;
  font-weight: 600;
  font-size: 0.9rem;
  width: fit-content;
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

const Titulo = styled.h1`
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  
  @media (min-width: 768px) and (max-width: 1200px) {
    font-size: 2rem;
  }
  
  @media (min-width: 768px) {
    font-size: 2.5rem;
  }
`;

const SubTitulo = styled.h2`
  font-size: 1.2rem;
  font-weight: 600;
  opacity: 0.9;
  margin-bottom: 1.5rem;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  
  @media (min-width: 768px) and (max-width: 1200px) {
    font-size: 1.3rem;
    margin-bottom: 1.2rem;
  }
  
  @media (min-width: 768px) {
    font-size: 1.5rem;
  }
`;

const BotoesAcao = styled.div`
  display: flex;
  gap: 1rem;
`;

const BotaoCompartilhar = styled.button`
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
  color: ${({ theme }) => theme.colors.white};
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.75rem 1.25rem;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
  
  i {
    margin-right: 0.5rem;
  }
`;

const BotaoFavorito = styled.button`
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
  color: ${({ theme }) => theme.colors.white};
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
  
  i {
    font-size: 1.2rem;
  }
`;

const ProgressoContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  margin: -10px 1rem 0;
  padding: 1rem;
  border-radius: 15px;
  box-shadow: ${({ theme }) => theme.shadows.md};
  position: relative;
  z-index: 10;
  
  @media (min-width: 768px) {
    margin: -20px 2rem 0;
  }
`;

const ProgressoInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const ProgressoTexto = styled.div`
  display: flex;
  flex-direction: column;
  
  span:first-child {
    font-weight: 700;
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  span:last-child {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const ProgressoValor = styled.div`
  background: ${({ theme }) => theme.colors.gradients.purple};
  color: ${({ theme }) => theme.colors.text.white};
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.9rem;
`;

const ProgressoBar = styled.div`
  width: 100%;
  height: 10px;
  background-color: ${({ theme }) => theme.colors.gray.light};
  border-radius: 10px;
  overflow: hidden;
`;

const ProgressoBarFill = styled.div`
  height: 100%;
  background: ${({ theme }) => theme.colors.gradients.purple};
  border-radius: 10px;
  transition: width 1s ease-in-out;
`;

const Conteudo = styled.div`
  padding: 1rem;
  
  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

const PainelImagem = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  
  @media (min-width: 992px) {
    flex: 1;
  }
`;

const CarrosselContainer = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.md};
  cursor: pointer;
`;

const CarrosselWrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.5s ease;
`;

const CarrosselSlide = styled.div`
  flex-shrink: 0;
  width: 100%;
  height: 100%;
  cursor: pointer; /* Indicar que é clicável */
  position: relative;
  
  @media (max-width: 767px) {
    cursor: default;
  }
`;

const CarrosselImagem = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const CarrosselOverlay = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 5;
`;

const CarrosselSetas = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ${CarrosselContainer}:hover & {
    opacity: 1;
  }
`;

const SetaNavegacao = styled.button`
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: scale(1.1);
  }
`;

const IndicadoresPontos = styled.div`
  position: absolute;
  bottom: 15px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
`;

const PontoIndicador = styled.button<{ $ativo: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: none;
  background-color: ${({ $ativo }) => 
    $ativo ? 'white' : 'rgba(255, 255, 255, 0.5)'
  };
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.2);
    background-color: white;
  }
`;

const MiniaturasContainer = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  scrollbar-width: thin;
  -webkit-overflow-scrolling: touch;
  
  /* Esconde a scrollbar mas mantém a funcionalidade */
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.gray.light};
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.gray.dark};
    border-radius: 10px;
  }
  
  /* Para desktop, volta para grid em vez de scroll horizontal */
  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    overflow-x: visible;
  }
`;

const MiniaturaBotao = styled.button<{ $ativo: boolean }>`
  padding: 0;
  border: ${({ $ativo, theme }) => 
    $ativo ? `2px solid ${theme.colors.primary}` : '2px solid transparent'
  };
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  aspect-ratio: 16/9;
  min-width: 200px ; /* Tamanho reduzido para manter como miniatura */
  max-width: 200px; /* Tamanho máximo fixo */
  width: 20%; /* Aproximadamente 5 itens visíveis */
  flex-shrink: 0;
  
  @media (min-width: 768px) {
    min-width: unset;
    max-width: unset;
    width: auto;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const MiniaturaImagem = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PrecoDestaque = styled.div`
  background: ${({ theme }) => theme.colors.gradients.action};
  color: ${({ theme }) => theme.colors.text.white};
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-weight: 800;
  font-size: 1.2rem;
  box-shadow: 0 5px 15px rgba(255, 65, 108, 0.4);
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0% {
      transform: scale(1);
      box-shadow: 0 5px 15px rgba(255, 65, 108, 0.4);
    }
    50% {
      transform: scale(1.05);
      box-shadow: 0 5px 20px rgba(255, 65, 108, 0.6);
    }
    100% {
      transform: scale(1);
      box-shadow: 0 5px 15px rgba(255, 65, 108, 0.4);
    }
  }
`;

const CompraContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.white};
  padding: 1.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  width: 100%;
  
  @media (max-width: 576px) {
    padding: 1rem;
    border-radius: 12px;
  }
  
  @media (min-width: 992px) {
    flex: 1;
  }
`;

const MensagemIncentivo = styled.div`
  margin-bottom: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 576px) {
    font-size: 0.6rem;
    margin-bottom: 0.75rem;
    gap: 0.2rem;
  }
  
  i {
    color: ${({ theme }) => theme.colors.primary};
    
    @media (max-width: 576px) {
      font-size: 0.75rem;
    }
  }
`;

// Create a more sophisticated, premium look for PacotesPromocionaisContainer
const PacotesPromocionaisContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 2rem;
  height: fit-content;
  padding: 1.75rem;
  border-radius: 14px;
  background-color: white;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.04);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: linear-gradient(90deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
    border-radius: 14px 14px 0 0;
  }

  @media (max-width: 576px) {
    padding: 1rem;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }
  
  @media (min-width: 992px) {
    margin-bottom: 0;
  }
`;

// Refine the title with a more premium, sophisticated style
const PacotesPromocionaisTitulo = styled.div`
  font-size: 1.15rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #FBFBFD;
  padding: 1rem 1.25rem;
  border-radius: 10px;
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  i {
    color: ${({ theme }) => theme.colors.warning};
    font-size: 1.1rem;
  }

  @media (max-width: 576px) {
    font-size: 0.85rem;
    padding: 0.75rem 1rem;
    margin-bottom: 0.75rem;
    
    i {
      font-size: 0.9rem;
    }
  }
`;

// Add more separation between packages
const PacotesPromocionaisGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
  position: relative;
  padding-top: 10px;

  @media (max-width: 576px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.4rem;
  }
  
  @media (min-width: 577px) and (max-width: 1200px) {
    gap: 1rem;
  }
`;

// Create premium package style with better distinction
const PacotePromocional = styled.button<{ $melhorOferta?: boolean; $ativo?: boolean }>`
  padding: 1.5rem 1.25rem;
  border-radius: 12px;
  overflow:hidden;
  background: ${({ $melhorOferta, $ativo, theme }) => {
    if ($ativo) return `linear-gradient(120deg, rgba(106, 17, 203, 0.07), rgba(106, 17, 203, 0.12))`;
    return $melhorOferta 
      ? `linear-gradient(120deg, rgba(255, 255, 255, 1), rgba(252, 248, 240, 1))`
      : 'white';
  }};
  border: 2px solid ${({ $melhorOferta, $ativo, theme }) => {
    if ($ativo) return `rgba(106, 17, 203, 0.5)`;
    return $melhorOferta ? `rgba(255, 184, 0, 0.3)` : `rgba(0, 0, 0, 0.08)`;
  }};
  position: relative;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  text-align: center;
  box-shadow: ${({ $melhorOferta, $ativo }) => {
    if ($ativo) return `0 8px 20px rgba(106, 17, 203, 0.15), 0 2px 6px rgba(106, 17, 203, 0.1)`;
    return $melhorOferta 
      ? '0 8px 20px rgba(255, 184, 0, 0.12), 0 2px 6px rgba(255, 184, 0, 0.06)' 
      : '0 4px 12px rgba(0, 0, 0, 0.03)';
  }};

  @media (max-width: 576px) {
    padding: 0.6rem 0.5rem;
    border-radius: 8px;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: ${({ $ativo, $melhorOferta }) => $ativo || $melhorOferta ? '4px' : '0'};
    background: ${({ $ativo, $melhorOferta, theme }) => 
      $ativo 
        ? `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary})` 
        : $melhorOferta 
          ? `linear-gradient(90deg, ${theme.colors.warning}, #FFDA44)` 
          : 'transparent'
    };
    border-radius: 0 0 12px 12px;
    transition: height 0.3s ease;
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ $melhorOferta, $ativo }) => {
      if ($ativo) return `0 12px 28px rgba(106, 17, 203, 0.2), 0 4px 8px rgba(106, 17, 203, 0.15)`;
      return $melhorOferta 
        ? '0 12px 28px rgba(255, 184, 0, 0.15), 0 4px 8px rgba(255, 184, 0, 0.08)' 
        : '0 8px 20px rgba(0, 0, 0, 0.08)';
    }};
    border-color: ${({ $melhorOferta, $ativo, theme }) => {
      if ($ativo) return `rgba(106, 17, 203, 0.6)`;
      return $melhorOferta ? `rgba(255, 184, 0, 0.5)` : `rgba(106, 17, 203, 0.3)`;
    }};

    &::after {
      height: ${({ $ativo, $melhorOferta }) => $ativo || $melhorOferta ? '6px' : '3px'};
      background: ${({ $ativo, $melhorOferta, theme }) => 
        $ativo 
          ? `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary})` 
          : `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary})`
      };
    }
  }
`;

// Refine quantity styling
const PacoteQuantidade = styled.div`
  font-size: 1.5rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.75rem;
  letter-spacing: -0.01em;

  @media (max-width: 576px) {
    font-size: 0.85rem;
    margin-bottom: 0.3rem;
  }
  
  @media (min-width: 577px) and (max-width: 1200px) {
    font-size: 1.3rem;
    margin-bottom: 0.6rem;
  }
`;

// More premium price styling
const PacotePreco = styled.div`
  font-size: 1.35rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  display: inline-block;
  padding-bottom: 0.5rem;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 2px;
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
    transition: width 0.3s ease;
  }

  @media (max-width: 576px) {
    font-size: 1.05rem;
    margin-bottom: 0.35rem;
    padding-bottom: 0.35rem;
    
    &::after {
      width: 30px;
      height: 1.5px;
    }
  }
  
  @media (min-width: 577px) and (max-width: 1200px) {
    font-size: 1.2rem;
  }
`;

// Enhanced visual separation for economy badge
const PacoteEconomia = styled.div`
  font-size: 0.85rem;
  font-weight: 700;
  color: white;
  background-color: ${({ theme }) => theme.colors.success};
  padding: 0.35rem 1rem;
  border-radius: 20px;
  margin-top: 0.7rem;
  box-shadow: 0 3px 8px rgba(40, 167, 69, 0.15);
  letter-spacing: 0.02em;

  @media (max-width: 576px) {
    font-size: 0.65rem;
    padding: 0.25rem 0.75rem;
    margin-top: 0.5rem;
  }
`;

// Improved "best offer" badge
const PacoteMelhorOferta = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.warning}, #FFDA44);
  color: #1A1A1A;
  padding: 0.3rem 0.8rem;
  border-radius: 0 10px 0 10px;
  font-weight: 700;
  font-size: 0.75rem;
  box-shadow: 0 4px 10px rgba(255, 184, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 0.25rem;
  border-left: 1px solid rgba(255, 255, 255, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.8);
  z-index: 5;
  
  i {
    font-size: 0.7rem;
    color: #1A1A1A;
  }

  @media (max-width: 576px) {
    font-size: 0.55rem;
    padding: 0.2rem 0.45rem;
    border-radius: 0 8px 0 8px;
    
    i {
      font-size: 0.55rem;
    }
  }
`;

// More distinct unit price info
const PacoteDescricaoValor = styled.div`
  font-size: 0.85rem;
  text-decoration: line-through;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 0.25rem;
  font-weight: 500;
  opacity: 0.9;
  padding-top: 0.25rem;

  @media (max-width: 576px) {
    font-size: 0.7rem;
    margin-top: 0.15rem;
    padding-top: 0.15rem;
  }
`;

// Enhanced quantity selector container
const QuantidadeSelector = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  margin-bottom: 2rem;
  padding: 1.75rem;
  border-radius: 14px;
  background-color: white;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.04);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: linear-gradient(90deg, ${({ theme }) => theme.colors.secondary}, ${({ theme }) => theme.colors.accent || theme.colors.primary});
    border-radius: 14px 14px 0 0;
  }

  @media (max-width: 576px) {
    padding: 1rem;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  @media (min-width: 992px) {
    margin-bottom: 0;
  }
`;

// More premium section label
const QuantidadeLabel = styled.div`
  font-size: 1.15rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  letter-spacing: -0.01em;

  @media (max-width: 576px) {
    font-size: 0.7rem;
    padding-bottom: 0.3rem;
  }
`;

// Improved quantity control with better contrast
const QuantidadeControle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-radius: 12px;
  background: #FBFBFD;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(106, 17, 203, 0.08);
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08), 0 2px 5px rgba(0, 0, 0, 0.04);
  }

  @media (max-width: 576px) {
    padding: 0.5rem 0.6rem;
    border-radius: 6px;
  }
`;

// Enhance the quantity number display
const QuantidadeNumero = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  min-width: 100px;
  text-align: center;
  color: ${({ theme }) => theme.colors.primary}; /* Fallback color */
  position: relative;
  padding: 0 1rem;
  
  span {
    position: relative;
    display: inline-block;
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text; /* Standard syntax */
    
    &::before {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 0;
      width: 100%;
      height: 3px;
      border-radius: 2px;
      background: linear-gradient(90deg, 
        ${({ theme }) => theme.colors.primary}88,
        ${({ theme }) => theme.colors.secondary}88
      );
    }
  }

  @media (max-width: 576px) {
    font-size: 1.2rem;
    min-width: 45px;
    padding: 0 0.3rem;
    
    span::before {
      bottom: -3px;
      height: 1.5px;
    }
  }
`;

// Make the control buttons more distinct
const ControlButton = styled.button`
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50%;
    box-shadow: 0 5px 15px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.1);
    opacity: 0;
    transition: opacity 0.25s ease;
  }
  

  
  &:active {
    transform: translateY(-1px);
  }
  
  span {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-weight: 600;
  }
  
  i {
    position: relative;
    z-index: 2;
    font-size: 0.9rem;
  }
`;

const BotaoMais = styled(ControlButton)`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.secondary} 100%);
  color: white;
  font-size: 1.8rem;
  
  border: 1px solid rgba(255,255,255,0.4);
  

  
  &:active {
    box-shadow: 0 4px 12px rgba(106, 17, 203, 0.25);
  }

  @media (max-width: 576px) {
    width: 24px;
    height: 24px;
    font-size: 0.9rem;
  }
`;

// Enhance BotaoMenos with better contrast
const BotoesEsquerda = styled.div`
  display: flex;
  align-items: center;
  gap: 0.85rem;

  @media (max-width: 576px) {
    gap: 0.5rem;
  }
`;

const BotaoMenos = styled(ControlButton)<{ disabled: boolean }>`
  width: 42px;
  height: 42px;
  font-size: 1.8rem;
  background: ${({ disabled }) => disabled ? 
    'linear-gradient(135deg, #f0f0f0, #e2e2e2)' : 
    'linear-gradient(135deg, #f8f8ff, #efefff)'
  };
  color: ${({ disabled, theme }) => disabled ? 
    '#aaa' : 
    theme.colors.primary
  };

  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ disabled }) => disabled ? 0.7 : 1};
  border: 1px solid ${({ disabled }) => disabled ? 
    'rgba(0,0,0,0.05)' : 
    'rgba(106, 17, 203, 0.2)'
  };
  


  @media (max-width: 576px) {
    width: 28px;
    height: 28px;
    font-size: 1.2rem;
  }
`;

// Better contrast for reset button
const BotaoReset = styled(ControlButton)<{ disabled: boolean }>`
  width: 36px;
  height: 36px;
  font-size: 0.95rem;
  background: ${({ disabled }) => disabled ? 
    'linear-gradient(135deg, #f0f0f0, #e2e2e2)' : 
    'linear-gradient(135deg, #fff0f0, #ffebeb)'
  };
  color: ${({ disabled }) => disabled ? 
    '#aaa' : 
    '#e74c3c'
  };
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ disabled }) => disabled ? 0.7 : 1};
  border: 1px solid ${({ disabled }) => disabled ? 
    'rgba(0,0,0,0.05)' : 
    'rgba(231, 76, 60, 0.2)'
  };


  @media (max-width: 576px) {
    width: 24px;
    height: 24px;
    font-size: 0.7rem;
  }
`;

// Enhanced lot options
const SeletorLotes = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 0.5rem;
  
  @media (max-width: 576px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }
  
  @media (min-width: 577px) and (max-width: 1200px) {
    gap: 0.8rem;
  }
`;

// Better contrast for lot options
const OpcaoLote = styled.div<{ $popular?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 0.5rem;
  border: 1px solid ${({ theme, $popular }) => $popular 
    ? `rgba(106, 17, 203, 0.4)` 
    : `rgba(0, 0, 0, 0.08)`};
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 700;
  font-size: 1.4rem;
  position: relative;
  background-color: ${({ $popular }) => $popular 
    ? `rgba(106, 17, 203, 0.04)` 
    : 'white'};
  box-shadow: ${({ $popular }) => $popular 
    ? '0 6px 18px rgba(106, 17, 203, 0.1)' 
    : '0 3px 10px rgba(0, 0, 0, 0.04)'};
  ${({ $popular }) => $popular && `
    transform: scale(1.05);
  `}
  
  @media (min-width: 577px) and (max-width: 1200px) {
    padding: 0.8rem 0.4rem;
    font-size: 1.25rem;
  }
  
  &:hover {
    transform: translateY(-4px) ${({ $popular }) => $popular ? 'scale(1.05)' : ''};
    box-shadow: 0 8px 24px rgba(106, 17, 203, 0.15);
    border-color: rgba(106, 17, 203, 0.4);
    background-color: rgba(106, 17, 203, 0.04);
  }
  
  &:active {
    transform: translateY(-1px) ${({ $popular }) => $popular ? 'scale(1.05)' : ''};
  }

  @media (max-width: 576px) {
    padding: 0.6rem 0.3rem;
    font-size: 1rem;
    border-radius: 8px;
  }
`;

const TextoSelecionar = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  margin-top: 0.35rem;
  padding: 0.25rem 0.75rem;
  background-color: rgba(106, 17, 203, 0.08);
  border-radius: 15px;

  @media (max-width: 576px) {
    font-size: 0.65rem;
    padding: 0.15rem 0.5rem;
    margin-top: 0.25rem;
  }
`;

// Better contrast for total value display
const ValorTotalContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.75rem;
  background-color: #F8F8FE;
  border-radius: 12px;
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
  box-shadow: 0 4px 12px rgba(106, 17, 203, 0.12);
  margin-top: 0.75rem;

  @media (max-width: 576px) {
    padding: 0.75rem 1rem;
    border-radius: 8px;
    border-left-width: 3px;
    margin-top: 0.5rem;
  }
`;

const ValorTotalLabel = styled.div`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.15rem;

  @media (max-width: 576px) {
    font-size: 0.85rem;
  }
`;

const ValorTotal = styled.div`
  font-size: 1.8rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.primary};
  transition: transform 0.15s ease;
  text-shadow: 0 1px 1px rgba(106, 17, 203, 0.15);
  
  @media (max-width: 576px) {
    font-size: 1.2rem;
  }

  @media (min-width: 577px) and (max-width: 1200px) {
    font-size: 1.5rem;
  }
`;

// More premium CTA button
const BotaoParticipar = styled.button`
  width: 100%;
  padding: 1.35rem;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.secondary} 100%);
  color: white;
  font-size: 1.35rem;
  font-weight: 700;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1rem;
  box-shadow: 0 8px 25px rgba(106, 17, 203, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
  
  @media (max-width: 576px) {
    padding: 1rem;
    font-size: 1rem;
    margin-bottom: 0.75rem;
    border-radius: 8px;
    gap: 0.35rem;
  }
  
  @media (min-width: 577px) and (max-width: 1200px) {
    padding: 1.15rem;
    font-size: 1.2rem;
    margin-bottom: 0.8rem;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(255, 255, 255, 0.1) 50%, 
      transparent 100%
    );
    transform: translateX(-100%);
    transition: transform 0.5s ease;
  }
  
  i {
    font-size: 1.1rem;
    transition: transform 0.3s ease;
    
    @media (max-width: 576px) {
      font-size: 0.9rem;
    }
  }
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 30px rgba(106, 17, 203, 0.4);
    
    i {
      transform: translateX(4px);
    }
  
  &::before {
      transform: translateX(100%);
    }
  }
  
  &:active {
    transform: translateY(-2px);
  }
`;

// Enhanced security info
const SegurancaInfo = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: #1a5928;
  background-color: rgba(40, 167, 69, 0.08);
  border: 1px solid rgba(40, 167, 69, 0.2);
  border-radius: 10px;
  padding: 0.85rem;
  width: 100%;
  margin-top: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
  
  @media (max-width: 576px) {
    font-size: 0.75rem;
    padding: 0.65rem;
    gap: 0.35rem;
    margin-top: 0.5rem;
    border-radius: 8px;
  }
  
  &:hover {
    background-color: rgba(40, 167, 69, 0.12);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(40, 167, 69, 0.15);
  }
  
  &:active {
    transform: translateY(-1px);
  }
  
  i {
    color: #1a5928;
    font-size: 1.1rem;
    
    @media (max-width: 576px) {
      font-size: 0.9rem;
    }
  }
`;

const Abas = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  margin-bottom: 2rem;
  overflow: hidden;
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.gray.light};
`;

const TabButton = styled.button<{ $ativo: boolean }>`
  flex: 1;
  padding: 1.25rem 1rem;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 700;
  color: ${({ $ativo, theme }) => $ativo ? theme.colors.primary : theme.colors.text.secondary};
  position: relative;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  i {
    font-size: 1rem;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: ${({ $ativo, theme }) => 
      $ativo ? theme.colors.gradients.purple : 'transparent'
    };
    transition: all 0.3s ease;
  }
  
  @media (min-width: 768px) {
    font-size: 1rem;
    padding: 1.25rem 1.5rem;
  }
`;

const TabContent = styled.div<{ $visivel: boolean }>`
  padding: 1.5rem;
  display: ${({ $visivel }) => $visivel ? 'block' : 'none'};
  
  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

const Regulamento = styled.div`
  h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: 1.25rem;
  }
  
  h4 {
    font-size: 1.2rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text.primary};
    margin: 1.5rem 0 0.75rem;
  }
  
  p {
    font-size: 1rem;
    line-height: 1.6;
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-bottom: 1rem;
  }
`;

const PremiosList = styled.div`
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.6;
  border: 1px solid ${({ theme }) => theme.colors.gray.light};
`;

const TitulosPremiadosInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const TitulosPremiadosLista = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
`;

const PremiadosInfoBox = styled.div<{ $type: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  
  ${({ $type, theme }) => {
    if ($type === 'total') {
      return `
        background: ${theme.colors.gradients.purple};
      `;
    } else if ($type === 'disponivel') {
      return `
        background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      `;
    } else {
      return `
        background: ${theme.colors.gradients.action};
      `;
    }
  }}
`;

const PremiadosLabel = styled.div`
  color: white;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
`;

const PremiadosValor = styled.div`
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

// Adjust the ListaPremiosGrid for a smaller, tighter layout with 2 columns on mobile
const ListaPremiosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.4rem;
    margin-bottom: 1rem;
  }
  
  @media (min-width: 769px) and (max-width: 1200px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 0.65rem;
  }
`;

// Make the prize cards more compact
const PremioCard = styled.div<{ $category: string; $found?: boolean }>`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: ${({ $found }) => $found ? '#f9f9f9' : 'white'};
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  
  // More subtle shadow for a cleaner look
  box-shadow: ${({ $category, $found }) => {
    const baseStyle = $found ? '0 2px 8px rgba(0, 0, 0, 0.05)' : '';
    
    switch($category) {
      case 'diamante':
        return $found 
          ? `${baseStyle}, inset 0 0 0 1px rgba(153, 33, 232, 0.2)`
          : '0 4px 12px rgba(153, 33, 232, 0.08), 0 2px 6px rgba(153, 33, 232, 0.04)';
      case 'master':
        return $found 
          ? `${baseStyle}, inset 0 0 0 1px rgba(244, 107, 69, 0.2)`
          : '0 4px 12px rgba(244, 107, 69, 0.08), 0 2px 6px rgba(244, 107, 69, 0.04)';
      default:
        return $found 
          ? `${baseStyle}, inset 0 0 0 1px rgba(17, 153, 142, 0.2)`
          : '0 4px 12px rgba(17, 153, 142, 0.08), 0 2px 6px rgba(17, 153, 142, 0.04)';
    }
  }};
  
  transform: perspective(800px) rotateX(0) rotateY(0);
  transform-style: preserve-3d;
  
  &:hover {
    transform: ${({ $found }) => $found ? 'none' : 'perspective(800px) rotateX(1deg) rotateY(-2deg) translateY(-2px)'};
    box-shadow: ${({ $category, $found }) => {
      if ($found) return; // No hover effect for found titles
      
      switch($category) {
        case 'diamante':
          return '0 10px 20px rgba(153, 33, 232, 0.12), 0 6px 10px rgba(153, 33, 232, 0.08)';
        case 'master':
          return '0 10px 20px rgba(244, 107, 69, 0.12), 0 6px 10px rgba(244, 107, 69, 0.08)';
        default:
          return '0 10px 20px rgba(17, 153, 142, 0.12), 0 6px 10px rgba(17, 153, 142, 0.08)';
      }
    }};
    
    .card-shine {
      opacity: ${({ $found }) => $found ? 0 : 0.6};
    }
    
    .card-prize {
      transform: ${({ $found }) => $found ? 'none' : 'translateZ(12px)'};
    }
  }
`;

// Thinner top bar
const CardTopBar = styled.div<{ $category: string }>`
  height: 3px;
  background: ${({ $category }) => {
    switch($category) {
      case 'diamante':
        return 'linear-gradient(90deg, #9921e8, #5f72bd)';
      case 'master':
        return 'linear-gradient(90deg, #f46b45, #eea849)';
      default:
        return 'linear-gradient(90deg, #11998e, #38ef7d)';
    }
  }};
  
  @media (max-width: 768px) {
    height: 1.5px;
  }
`;

// More compact content layout
const CardContent = styled.div`
  padding: 0.6rem;
  display: grid;
  grid-template-areas: 
    "number tag"
    "prize prize"
    "status status";
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 0.25rem;
  position: relative;
  
  @media (max-width: 768px) {
    padding: 0.25rem;
    gap: 0.1rem;
  }
`;

// Remove the sparkle for a cleaner layout
const CardSparkle = styled.div`
  display: none;
`;

const CardShine = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.3) 0%,
    rgba(255, 255, 255, 0) 60%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
`;

// Smaller number text
const CardNumber = styled.div`
  grid-area: number;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  transition: transform 0.3s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  padding: 0.25rem 0.4rem;
  background: #f7f7ff;
  border-radius: 6px;
  border: 1px dashed rgba(106, 17, 203, 0.2);
  
  @media (max-width: 768px) {
    font-size: 0.5rem;
    padding: 0.1rem 0.2rem;
    border-radius: 3px;
  }
`;

// Smaller emoji
const CardEmoji = styled.span`
  font-size: 0.9rem;
  margin-right: 0.3rem;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    font-size: 0.6rem;
    margin-right: 0.15rem;
  }
`;

// Smaller prize amount text
const CardPrize = styled.div<{ $category: string }>`
  grid-area: prize;
  font-size: 1.2rem;
  font-weight: 800;
  transition: transform 0.3s ease;
  letter-spacing: -0.02em;
  margin: 0.1rem 0;
  
  @media (max-width: 768px) {
    font-size: 0.65rem;
    margin: 0.02rem 0;
  }
  
  @media (min-width: 769px) and (max-width: 1200px) {
    font-size: 1.1rem;
  }
  
  background: ${({ $category }) => {
    switch($category) {
      case 'diamante':
        return 'linear-gradient(135deg, #9921e8, #5f72bd)';
      case 'master':
        return 'linear-gradient(135deg, #f46b45, #eea849)';
      default:
        return 'linear-gradient(135deg, #11998e, #38ef7d)';
    }
  }};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

// Combined status and chance into one row
const CardStatus = styled.div`
  grid-area: status;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  font-size: 0.7rem;
  font-weight: 600;
  color: #2ecc71;
  
  @media (max-width: 768px) {
    font-size: 0.45rem;
  }
  
  i {
    font-size: 0.8rem;
    margin-right: 0.2rem;
    
    @media (max-width: 768px) {
      font-size: 0.5rem;
      margin-right: 0.1rem;
    }
  }
  
  span {
    color: ${({ theme }) => theme.colors.text.secondary};
    background: ${({ theme }) => theme.colors.background};
    padding: 0.15rem 0.4rem;
    border-radius: 10px;
    font-size: 0.65rem;
    
    @media (max-width: 768px) {
      font-size: 0.4rem;
      padding: 0.05rem 0.15rem;
      border-radius: 4px;
    }
  }
`;

// Smaller tag
const CardTag = styled.div<{ $category: string }>`
  grid-area: tag;
  position: relative;
  padding: 0.15rem 0.35rem;
  font-size: 0.6rem;
  font-weight: 700;
  color: white;
  z-index: 2;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: 0.05rem 0.15rem;
    font-size: 0.35rem;
    border-radius: 2px;
  }
  
  background: ${({ $category }) => {
    switch($category) {
      case 'diamante':
        return 'linear-gradient(135deg, #9921e8, #5f72bd)';
      case 'master':
        return 'linear-gradient(135deg, #f46b45, #eea849)';
      default:
        return 'linear-gradient(135deg, #11998e, #38ef7d)';
    }
  }};
`;

// More compact category headers
const CategoryHeader = styled.div<{ $category: string }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
  
  ${({ $category }) => {
    switch($category) {
      case 'diamante':
        return `
          background: linear-gradient(135deg, rgba(153, 33, 232, 0.05), rgba(95, 114, 189, 0.08));
        `;
      case 'master':
        return `
          background: linear-gradient(135deg, rgba(244, 107, 69, 0.05), rgba(238, 168, 73, 0.08));
        `;
      default:
        return `
          background: linear-gradient(135deg, rgba(17, 153, 142, 0.05), rgba(56, 239, 125, 0.08));
        `;
    }
  }}
  
  border-radius: 10px;
  padding: 0.75rem 1rem;
  margin-bottom: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  
  @media (max-width: 768px) {
    padding: 0.5rem 0.75rem;
    margin-bottom: 0.5rem;
    gap: 0.5rem;
    border-radius: 8px;
  }
`;

const CategoryIconWrapper = styled.div<{ $category: string }>`
  width: 38px;
  height: 38px;
  border-radius: 19px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  
  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
    border-radius: 14px;
  }
  
  // Glass effect
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  
  // Inner glow effect
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 19px;
    padding: 1.5px;
    background: ${({ $category }) => {
      switch($category) {
        case 'diamante':
          return 'linear-gradient(135deg, #9921e8, #5f72bd)';
        case 'master':
          return 'linear-gradient(135deg, #f46b45, #eea849)';
        default:
          return 'linear-gradient(135deg, #11998e, #38ef7d)';
      }
    }};
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: destination-out;
    mask-composite: exclude;
    
    @media (max-width: 768px) {
      border-radius: 14px;
      padding: 1px;
    }
  }
  
  i {
    font-size: 1.1rem;
    z-index: 2;
    background: ${({ $category }) => {
      switch($category) {
        case 'diamante':
          return 'linear-gradient(135deg, #9921e8, #5f72bd)';
        case 'master':
          return 'linear-gradient(135deg, #f46b45, #eea849)';
        default:
          return 'linear-gradient(135deg, #11998e, #38ef7d)';
      }
    }};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    
    @media (max-width: 768px) {
      font-size: 0.85rem;
    }
  }
`;

// Smaller, more compact category info
const CategoryInfo = styled.div`
  flex: 1;
`;

const CategoryName = styled.div<{ $category: string }>`
  font-size: 1.1rem;
  font-weight: 800;
  background: ${({ $category }) => {
    switch($category) {
      case 'diamante':
        return 'linear-gradient(135deg, #9921e8, #5f72bd)';
      case 'master':
        return 'linear-gradient(135deg, #f46b45, #eea849)';
      default:
        return 'linear-gradient(135deg, #11998e, #38ef7d)';
    }
  }};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.01em;
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

const CategoryMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.25rem;
  
  @media (max-width: 768px) {
    gap: 0.5rem;
    margin-top: 0.15rem;
  }
`;

const CategoryMetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.7rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
  
  @media (max-width: 768px) {
    font-size: 0.6rem;
    gap: 0.2rem;
  }
  
  i {
    font-size: 0.75rem;
    opacity: 0.7;
    
    @media (max-width: 768px) {
      font-size: 0.6rem;
    }
  }
`;

const PremiosCategoryTitle = styled.div`
  font-size: 1.1rem;
  font-weight: 800;
  margin: 1.5rem 0 1rem;
  letter-spacing: -0.02em;
  padding-bottom: 0.75rem;
  position: relative;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    margin: 1rem 0 0.75rem;
    padding-bottom: 0.5rem;
  }
  
  &:first-of-type {
    margin-top: 0.5rem;
    
    @media (max-width: 768px) {
      margin-top: 0.35rem;
    }
  }
  
  // Elegant underline with gradient
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 3px;
    border-radius: 1.5px;
    background: ${({ theme }) => theme.colors.primary};
    transition: width 0.3s ease;
    
    @media (max-width: 768px) {
      width: 40px;
      height: 2px;
    }
  }
  
  &:hover::after {
    width: 100px;
    
    @media (max-width: 768px) {
      width: 60px;
    }
  }
`;

const BotaoVerMais = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 1rem;
  margin-top: 1.5rem;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.primary};
  border: 2px solid ${({ theme }) => theme.colors.gray.light};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  span {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-left: 0.5rem;
    font-weight: normal;
  }
  
  &:hover {
    background: ${({ theme }) => theme.colors.gray.light};
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const InformacoesLegais = styled.div`
  padding: 1.5rem;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  
  h4 {
    font-weight: 700;
    margin-bottom: 0.75rem;
    color: ${({ theme }) => theme.colors.text.primary};
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    i {
      color: ${({ theme }) => theme.colors.primary};
    }
  }
  
  p {
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    line-height: 1.6;
  }
`;

const PopularTag = styled.span`
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.secondary} 100%);
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  box-shadow: 0 3px 8px rgba(106, 17, 203, 0.25);
  white-space: nowrap;

  @media (max-width: 576px) {
    font-size: 0.55rem;
    padding: 0.15rem 0.4rem;
    top: -8px;
  }
`;

const ZoomIndicator = styled.div`
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
  font-size: 1.5rem;
  
  ${CarrosselSlide}:hover & {
    opacity: 0.8;
  }
`;

// Create mock data for found titles
const foundTitles = [
  // Examples from Diamante category (using actual numbers from fixedPrizes)
  { number: '001003', name: 'Maria Oliveira', value: 2000, date: '12/05/2023', category: 'diamante' },
  { number: '001008', name: 'Pedro Santos', value: 2000, date: '15/05/2023', category: 'diamante' },
  
  // Examples from Master category (using actual numbers from fixedPrizes)
  { number: '001103', name: 'João Silva', value: 1000, date: '18/05/2023', category: 'master' },
  { number: '001107', name: 'Ana Ferreira', value: 1000, date: '22/05/2023', category: 'master' },
  
  // Examples from Premiado category (using actual numbers from fixedPrizes)
  { number: '001203', name: 'Carlos Souza', value: 500, date: '01/06/2023', category: 'premiado' },
  { number: '001210', name: 'Fernanda Costa', value: 500, date: '05/06/2023', category: 'premiado' },
];

// Create styled components for the found titles section
const FoundTitlesContainer = styled.div`
  margin-bottom: 2rem;
`;

const FoundTitlesHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const FoundTitlesIcon = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 19px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  color: white;
  box-shadow: 0 4px 10px rgba(46, 204, 113, 0.2);
`;

const FoundTitlesTitle = styled.div`
  font-size: 1.1rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const FoundTitlesList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 0.75rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FoundTitleCard = styled.div<{ $category: string }>`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto;
  gap: 0.5rem;
  padding: 1rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-left: 3px solid ${({ $category }) => {
    switch($category) {
      case 'diamante':
        return '#9921e8';
      case 'master':
        return '#f46b45';
      default:
        return '#11998e';
    }
  }};
  
  @media (max-width: 768px) {
    padding: 0.75rem;
    gap: 0.35rem;
    border-radius: 8px;
    border-left-width: 2px;
  }
`;

const FoundTitleNumber = styled.div<{ $category: string }>`
  grid-column: 1;
  grid-row: 1 / span 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  margin-right: 0.75rem;
  background: ${({ $category }) => {
    switch($category) {
      case 'diamante':
        return 'rgba(153, 33, 232, 0.05)';
      case 'master':
        return 'rgba(244, 107, 69, 0.05)';
      default:
        return 'rgba(17, 153, 142, 0.05)';
    }
  }};
  border-radius: 8px;
  font-weight: 700;
  color: ${({ $category }) => {
    switch($category) {
      case 'diamante':
        return '#9921e8';
      case 'master':
        return '#f46b45';
      default:
        return '#11998e';
    }
  }};
  font-size: 1.1rem;
  min-width: 70px;
  text-align: center;
  border: 1px dashed ${({ $category }) => {
    switch($category) {
      case 'diamante':
        return 'rgba(153, 33, 232, 0.3)';
      case 'master':
        return 'rgba(244, 107, 69, 0.3)';
      default:
        return 'rgba(17, 153, 142, 0.3)';
    }
  }};
  
  @media (max-width: 768px) {
    padding: 0.5rem;
    margin-right: 0.5rem;
    font-size: 0.85rem;
    min-width: 55px;
    border-radius: 6px;
  }
  
  span {
    font-size: 0.7rem;
    font-weight: 600;
    color: #7f8c8d;
    margin-top: 0.25rem;
    
    @media (max-width: 768px) {
      font-size: 0.6rem;
      margin-top: 0.15rem;
    }
  }
`;

const FoundTitleName = styled.div`
  grid-column: 2;
  grid-row: 1;
  font-weight: 700;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.text.primary};
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const FoundTitleDetails = styled.div`
  grid-column: 2;
  grid-row: 2;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  @media (max-width: 768px) {
    font-size: 0.7rem;
    gap: 0.5rem;
  }
  
  span {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    
    @media (max-width: 768px) {
      gap: 0.2rem;
    }
    
    i {
      font-size: 0.75rem;
      opacity: 0.7;
      
      @media (max-width: 768px) {
        font-size: 0.65rem;
      }
    }
  }
`;

export default CampanhaDetalhes; 