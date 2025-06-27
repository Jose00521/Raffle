'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { CampaignStatusEnum, ICampaign } from '@/models/interfaces/ICampaignInterfaces';
import SecurityModal from '../auth/SecurityModal';
import ImageModal from '../ui/ImageModal';
import PremioCategory from './PremioCategory';
import { useRouter, usePathname } from 'next/navigation';
import { IPrize } from '@/models/interfaces/IPrizeInterfaces';
import { INumberPackageCampaign, useCampaignSelection } from '@/hooks/useCampaignSelection';
import { toast } from 'react-toastify';
import QuickSignupModal from '@/components/campaign/QuickSignupModal';
import { formatCurrency } from '@/utils/formatNumber';
import { CertificationSectionCompact } from '../ui/CertificationSection';
import { useSession } from 'next-auth/react';
import LoginModal from '../auth/LoginModal';

// Atualizando a interface IRifa para incluir as propriedades extras
interface CampanhaDetalheProps {
  campanhaDetalhes: ICampaign
}

// Componente principal
/*
EXEMPLO DE FUNCIONAMENTO DOS PRÊMIOS POR POSIÇÃO:

1. Para campanhas com múltiplas distribuições (1º, 2º, 3º lugar):
   prizeDistribution: [
     { position: 1, prizes: [{ name: "Carro", value: 75000 }] },
     { position: 2, prizes: [{ name: "Moto", value: 25000 }] },
     { position: 3, prizes: [{ name: "R$", value: 5000 }] }
   ]
   Resultado: 🏆 1º R$ 75.000,00  2º R$ 25.000,00  3º R$ 5.000,00

2. Para campanhas com múltiplos prêmios iguais:
   prizeDistribution: [
     { position: 1, prizes: [
       { name: "Carro 1", value: 75000 },
       { name: "Carro 2", value: 75000 },
       { name: "Carro 3", value: 75000 }
     ]}
   ]
   Resultado: 🏆 1º R$ 75.000,00  2º R$ 75.000,00  3º R$ 75.000,00

3. Para campanha com prêmio único (comportamento atual):
   prizeDistribution: [
     { position: 1, prizes: [{ name: "Carro", value: 75000 }] }
   ]
   Resultado: Não mostra a seção de prêmios por posição

NOVA FUNCIONALIDADE - SEÇÃO DE IMAGENS DOS PRÊMIOS:
- Aparece logo abaixo do carrossel de imagens
- Layout horizontal discreto com scroll em mobile
- Mostra mini-imagens dos prêmios por posição (1º, 2º, 3º)
- Badge dourado com a posição no canto superior direito
- Nome do prêmio (truncado) e valor abaixo da imagem
- Indicador "+X mais" para prêmios adicionais
- Ocupa pouco espaço vertical, máximo horizontal
- Visual limpo e minimalista
*/
const CampanhaDetalhes: React.FC<CampanhaDetalheProps> = ({ campanhaDetalhes }) => {
  // Valor mínimo R$12,00, então se cada número custa R$1,00, são 12 números mínimo
  const initialized = useRef(false);

  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const numeroMinimo = Math.max(12, Math.ceil(12 / (campanhaDetalhes?.individualNumberPrice || 0)));
  const [quantidadeSelecionada, setQuantidadeSelecionada] = useState(numeroMinimo);
  const [activeTab, setActiveTab] = useState('titulos');
  // Estado para o carrossel de imagens
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  // Estado para controlar se a imagem atual é vertical
  const [isCurrentImageVertical, setIsCurrentImageVertical] = useState(false);

  // Estados para controle de swipe/deslize
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  
  // Estado para controle de paginação dos títulos premiados
  const [visiblePrizes, setVisiblePrizes] = useState(20);
  // Estado para guardar o pacote promocional ativo
  const [activePacote, setActivePacote] = useState<number | null>(null);
  
  // Novo estado para o menu lateral
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  
  // Pacotes promocionais disponíveis
  const { selection, selectPackage, selectPackageFunction, clearSelection, updateQuantity } = useCampaignSelection(campanhaDetalhes as ICampaign);

  const handleParticipate = useCallback(() => {
    // Validar quantidade mínima
    if (selection?.quantity && selection?.quantity < campanhaDetalhes?.minNumbersPerUser) {
      toast.warning(`Selecione no mínimo ${campanhaDetalhes?.minNumbersPerUser} números`);
      return;
    }
    
    // Verificar se o usuário está logado, se não estiver, mostrar o modal de cadastro
    const isLoggedIn = false; // Aqui você deve verificar se o usuário está logado de verdade
    
    if (!isLoggedIn) {
      setLoginModalOpen(true);
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
  
  // Função para verificar a orientação da imagem atual
  const checkImageOrientation = (index: number) => {
    // Criar uma imagem temporária para verificar as dimensões reais
    const img = new Image();
    img.onload = () => {
      const isVertical = img.naturalHeight > img.naturalWidth;
      setIsCurrentImageVertical(isVertical);
    };
    
    // Definir a URL da imagem para carregar
    if (typeof carouselImages[index] === 'string') {
      img.src = carouselImages[index] as string;
    }
  };
  
  // Função para trocar para a próxima imagem
  const nextImage = () => {
    const newIndex = (currentImageIndex + 1) % carouselImages.length;
    setCurrentImageIndex(newIndex);
    checkImageOrientation(newIndex);
  };

  // Função para trocar para a imagem anterior
  const prevImage = () => {
    const newIndex = (currentImageIndex - 1 + carouselImages.length) % carouselImages.length;
    setCurrentImageIndex(newIndex);
    checkImageOrientation(newIndex);
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

  // Estados para input editável de quantidade
  const [isEditingQuantity, setIsEditingQuantity] = useState(false);
  const [tempQuantity, setTempQuantity] = useState('');
  
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

  const prizeValue = ()=>{

    const sumPerPosition: number[] = []	;
    campanhaDetalhes?.prizeDistribution?.forEach(prize => {
      const value = prize.prizes?.reduce((acc, curr) => {
        return acc + Number((curr as IPrize).value);
      }, 0);
      sumPerPosition.push(value);
    });
    return sumPerPosition.reduce((acc, curr) => acc + curr, 0);
  };


  // Componente para renderizar uma categoria de prêmios
  // const PremioCategory = ({ ... entire component implementation ... }) => { ... }

  // Handler para o botão "Meus Números"
  const handleMeusNumerosClick = () => {
    // Implementar a lógica para mostrar os números do usuário
    console.log("Meus Números clicado");
  };

  // Funções para input editável de quantidade
  const handleQuantityClick = () => {
    setIsEditingQuantity(true);
    setTempQuantity((selection?.quantity || 0).toString());
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Apenas números
    const maxQuantity = campanhaDetalhes?.maxNumbersPerUser || 999999;
    const maxDigits = maxQuantity.toString().length;
    
    // Limitar à quantidade de dígitos do valor máximo
    if (value.length > maxDigits) {
      return;
    }
    
    setTempQuantity(value);
  };

  const handleQuantitySubmit = () => {
    const newQuantity = parseInt(tempQuantity) || 0;
    const minQuantity = campanhaDetalhes?.minNumbersPerUser || 1;
    const maxQuantity = campanhaDetalhes?.maxNumbersPerUser || 999999;

    if (newQuantity < minQuantity) {
      toast.warning(`Quantidade mínima é ${minQuantity} números`);
      setTempQuantity(minQuantity.toString());
      updateQuantity(minQuantity);
    } else if (newQuantity > maxQuantity) {
      toast.warning(`Quantidade máxima é ${maxQuantity} números`);
      setTempQuantity(maxQuantity.toString());
      updateQuantity(maxQuantity);
    } else {
      updateQuantity(newQuantity);
    }
    
    setIsEditingQuantity(false);
  };

  const handleQuantityKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleQuantitySubmit();
    } else if (e.key === 'Escape') {
      setIsEditingQuantity(false);
      setTempQuantity((selection?.quantity || 0).toString());
    }
  };

  const handleQuantityBlur = () => {
    handleQuantitySubmit();
  };
  
  // Função para verificar se um caminho está ativo
  const isActive = (path: string) => pathname === path;
  
  // Função para abrir o modal de login
  const openLoginModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setLoginModalOpen(true);
    setMenuOpen(false);
  };

  // Função para alternar o menu lateral
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Fechar o menu quando clicar em um link
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Evitar scroll quando o menu estiver aberto
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <Container>

      
      {/* Menu lateral */}
      <SideMenu $isOpen={menuOpen}>
        <SideMenuHeader>
          <SideMenuLogo>
            <LogoIcon>R</LogoIcon>
            Rifa.com
          </SideMenuLogo>
          <CloseButton onClick={toggleMenu}>×</CloseButton>
        </SideMenuHeader>
        
        <SideMenuNav>
          <SideMenuLink $active={isActive('/')}>
            <Link href="/">Início</Link>
          </SideMenuLink>
          <SideMenuLink $active={isActive('/campanhas')}>
            <Link href="/campanhas">Campanhas</Link>
          </SideMenuLink>
          <SideMenuLink $active={isActive('/como-funciona')}>
            <Link href="/como-funciona">Comunicados</Link>
          </SideMenuLink>
          <SideMenuLink $active={isActive('/cadastro-tipo') || isActive('/cadastro') || isActive('/cadastro-criador')}>
            <Link href="/cadastro-tipo">Cadastrar</Link>
          </SideMenuLink>
          <SideMenuLink $active={isActive('/meus-titulos')}>
            <Link href="/meus-titulos">Meus títulos</Link>
          </SideMenuLink>
          <SideMenuLink $active={isActive('/ganhadores')}>
            <Link href="/ganhadores">Ganhadores</Link>
          </SideMenuLink>
          <SideMenuLink $active={isActive('/contato')}>
            <Link href="/contato">Contato</Link>
          </SideMenuLink>
        </SideMenuNav>
        
        <SideMenuFooter>
          {session?.user ? (
            <SideMenuButton onClick={() => router.push('/dashboard')}>
              Minha Conta
            </SideMenuButton>
          ) : (
            <SideMenuButton onClick={() => router.push('/login')}>
              Entrar na conta
            </SideMenuButton>
          )}
        </SideMenuFooter>
      </SideMenu>
      
      {/* Overlay para fechar o menu quando clicar fora */}
      {menuOpen && <Overlay onClick={toggleMenu} />}
      
      {/* Banner da campanha */}
      <Banner style={{ backgroundImage: `url(${campanhaDetalhes?.coverImage || ''})` }}>

        
                <BannerOverlay>
                      {/* Botão do menu hamburger */}
      <MenuButton onClick={toggleMenu} $isOpen={menuOpen}>
        <span></span>
        <span></span>
        <span></span>
      </MenuButton>

      <MeusTitulosButton onClick={handleMeusNumerosClick}>
            <i className="fas fa-ticket-alt"></i> Meus Números
          </MeusTitulosButton>
          {/* Título principal posicionado no canto inferior esquerdo */}
          <TituloContainer>
            {/* Header pequeno com botão verde e código acima do título */}
            <HeaderPequeno>
              <BotaoVerdePequeno>Adquira já!</BotaoVerdePequeno>
              <CodigoSorteioTitulo>{campanhaDetalhes?.campaignCode}</CodigoSorteioTitulo>
            </HeaderPequeno>
            
            <Titulo>{campanhaDetalhes?.title}</Titulo>
            <SubTitulo>
              IMAGEM ILUSTRATIVA - VALOR DO PRÊMIO {formatCurrency(Number(prizeValue()) || 0)}
            </SubTitulo>
            
            {/* Mostrar prêmios por posição se houver múltiplos */}
            {campanhaDetalhes?.prizeDistribution && (
              campanhaDetalhes.prizeDistribution.length > 1 || 
              (campanhaDetalhes.prizeDistribution[0]?.prizes && campanhaDetalhes.prizeDistribution[0].prizes.length > 1)
            ) && (
              <PremiosPorPosicao>
                {/* Se há múltiplas distribuições (1º, 2º, 3º lugar) */}
                {campanhaDetalhes.prizeDistribution.length > 1 ? (
                  <>
                    {campanhaDetalhes.prizeDistribution.slice(0, 3).map((distribution, index) => (
                      <PremioItem key={index}>
                        <PosicaoNumero>{index + 1}º</PosicaoNumero>
                        <div>
                          <PremioValor>{formatCurrency(Number((distribution.prizes?.[0] as IPrize)?.value) || 0)}</PremioValor>
                          <PremioNome>{(distribution.prizes?.[0] as IPrize)?.name || `${index + 1}º Prêmio`}</PremioNome>
                        </div>
                      </PremioItem>
                    ))}
                    {campanhaDetalhes.prizeDistribution.length > 3 && (
                      <PremioItem>
                        <PosicaoNumero $isExtra>+{campanhaDetalhes.prizeDistribution.length - 3}</PosicaoNumero>
                        <PremioTexto>outros prêmios</PremioTexto>
                      </PremioItem>
                    )}
                  </>
                ) : (
                  /* Se há múltiplos prêmios na mesma categoria (ex: 3 carros iguais) */
                  campanhaDetalhes.prizeDistribution[0]?.prizes?.slice(0, 3).map((prize, index) => (
                    <PremioItem key={index}>
                      <PosicaoNumero>{index + 1}º</PosicaoNumero>
                      <div>
                        <PremioValor>{formatCurrency(Number((prize as IPrize)?.value) || 0)}</PremioValor>
                        <PremioNome>{(prize as IPrize)?.name || `${index + 1}º Prêmio`}</PremioNome>
                      </div>
                    </PremioItem>
                  ))
                )}
                {/* Mostrar quantos prêmios adicionais há */}
                {campanhaDetalhes.prizeDistribution.length === 1 && 
                  campanhaDetalhes.prizeDistribution[0]?.prizes && 
                  campanhaDetalhes.prizeDistribution[0].prizes.length > 3 && (
                   <PremioItem>
                     <PosicaoNumero $isExtra>+{campanhaDetalhes.prizeDistribution[0].prizes.length - 3}</PosicaoNumero>
                     <PremioTexto>outros prêmios</PremioTexto>
                   </PremioItem>
                 )}
              </PremiosPorPosicao>
            )}
          </TituloContainer>
        </BannerOverlay>
        
      </Banner>
      
      {/* Progresso */}
      {/*<ProgressoContainer>
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
      </ProgressoContainer>*/}
      
      {/* Conteúdo principal */}
      <Conteudo>
        {/* Mobile layout - hide on desktop */}
                {/* Seção da data do sorteio */}
                <SorteioContainer>
          <SorteioInfo>
            <SorteioTexto>Sorteio</SorteioTexto>
            <SorteioData>{dataSorteio}</SorteioData>
          </SorteioInfo>
          
          <SorteioInfo>
            <SorteioTexto>Por apenas</SorteioTexto>
            <SorteioValor>{formatCurrency(campanhaDetalhes?.individualNumberPrice || 0)}</SorteioValor>
          </SorteioInfo>
        </SorteioContainer>
        <MobileContainer>
          <PainelImagem>
            {/* Novo componente de carrossel de imagens com suporte a swipe */}
            <CarrosselContainer 
              $isVertical={isCurrentImageVertical}
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
                      onLoad={(e) => {
                        const target = e.target as HTMLImageElement;
                        const isVertical = target.naturalHeight > target.naturalWidth;
                        
                        // Atualizar o estado apenas se for a imagem atual
                        if (index === currentImageIndex) {
                          setIsCurrentImageVertical(isVertical);
                        }
                      }}
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
            
            {/* Seção de Prêmios por Posição com Imagens */}
            {campanhaDetalhes?.prizeDistribution && (
              campanhaDetalhes.prizeDistribution.length > 1 || 
              (campanhaDetalhes.prizeDistribution[0]?.prizes && campanhaDetalhes.prizeDistribution[0].prizes.length > 1)
            ) && (
              <PremiosSecaoWrapper>
                <PremiosSecaoHeader>
                  <PremiosSecaoHeaderLeft>
                    <PremiosSecaoIcone>🏆</PremiosSecaoIcone>
                    <PremiosSecaoTitleWrapper>
                      <PremiosSecaoTitulo>Múltiplos Ganhadores</PremiosSecaoTitulo>
                      <PremiosSecaoSubtitulo>
                        {campanhaDetalhes.prizeDistribution.length > 1 
                          ? `${campanhaDetalhes.prizeDistribution.length} posições premiadas`
                          : `${campanhaDetalhes.prizeDistribution[0]?.prizes?.length || 0} ganhadores`
                        }
                      </PremiosSecaoSubtitulo>
                    </PremiosSecaoTitleWrapper>
                  </PremiosSecaoHeaderLeft>
                </PremiosSecaoHeader>
                <PremiosImagensContainer>
                {/* Se há múltiplas distribuições (2º lugar em diante) */}
                {campanhaDetalhes.prizeDistribution.length > 1 ? (
                  campanhaDetalhes.prizeDistribution.slice(1).map((distribution, index) => (
                    <PremioImagemItem key={index}>
                      <PremioImagemWrapper>
                        <PremioImagem 
                          src={(distribution.prizes?.[0] as IPrize)?.images?.[0] || campanhaDetalhes.coverImage} 
                          alt={`Prêmio ${index + 2}º lugar`}
                        />
                        <PosicaoBadge>{index + 2}º</PosicaoBadge>
                      </PremioImagemWrapper>
                      <PremioImagemInfo>
                        <PremioImagemNome>{(distribution.prizes?.[0] as IPrize)?.name || `${index + 2}º Lugar`}</PremioImagemNome>
                        <PremioImagemValor>{formatCurrency(Number((distribution.prizes?.[0] as IPrize)?.value) || 0)}</PremioImagemValor>
                      </PremioImagemInfo>
                    </PremioImagemItem>
                  ))
                ) : (
                  /* Se há múltiplos prêmios na mesma categoria (2º lugar em diante) */
                  campanhaDetalhes.prizeDistribution[0]?.prizes?.slice(1).map((prize, index) => (
                    <PremioImagemItem key={index}>
                      <PremioImagemWrapper>
                        <PremioImagem 
                          src={(prize as IPrize)?.images?.[0] || campanhaDetalhes.coverImage} 
                          alt={`Prêmio ${index + 2}º lugar`}
                        />
                        <PosicaoBadge>{index + 2}º</PosicaoBadge>
                      </PremioImagemWrapper>
                      <PremioImagemInfo>
                        <PremioImagemNome>{(prize as IPrize)?.name || `${index + 2}º Lugar`}</PremioImagemNome>
                        <PremioImagemValor>{formatCurrency(Number((prize as IPrize)?.value) || 0)}</PremioImagemValor>
                      </PremioImagemInfo>
                    </PremioImagemItem>
                  ))
                )}
                
                {/* Mostrar indicador de mais prêmios se necessário */}
                {((campanhaDetalhes.prizeDistribution.length > 1 && campanhaDetalhes.prizeDistribution.length > 4) ||
                  (campanhaDetalhes.prizeDistribution.length === 1 && campanhaDetalhes.prizeDistribution[0]?.prizes && campanhaDetalhes.prizeDistribution[0].prizes.length > 4)) && (
                  <PremioMaisItem>
                    <PremioMaisIcone>+</PremioMaisIcone>
                    <PremioMaisTexto>
                      {campanhaDetalhes.prizeDistribution.length > 1 
                        ? `${campanhaDetalhes.prizeDistribution.length - 4} mais`
                        : `${(campanhaDetalhes.prizeDistribution[0]?.prizes?.length || 0) - 4} mais`
                      }
                    </PremioMaisTexto>
                  </PremioMaisItem>
                )}
              </PremiosImagensContainer>
              </PremiosSecaoWrapper>
            )}
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
            {
              campanhaDetalhes.enablePackages ? (
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
                    
                    {/* Adicionar tag de desconto */}
                    {(() => {
                      const valorOriginal = campanhaDetalhes?.individualNumberPrice * pacote.quantity || 0;
                      const valorComDesconto = pacote.price || 0;
                      const descontoPercentual = Math.round(((valorOriginal - valorComDesconto) / valorOriginal) * 100);
                      return descontoPercentual > 0 ? (
                        <DescontoTag>{descontoPercentual}% OFF</DescontoTag>
                      ) : null;
                    })()}
                    
                    <PacoteQuantidade>{pacote.quantity} cotas</PacoteQuantidade>
                    <PacoteDescricaoValor>{formatCurrency(campanhaDetalhes?.individualNumberPrice * pacote.quantity || 0)}</PacoteDescricaoValor>
                    <PacotePreco>{formatCurrency(pacote.price || 0)}</PacotePreco>
                    <PacoteEconomia>Economize {formatCurrency((pacote.quantity * campanhaDetalhes?.individualNumberPrice) - pacote.price || 0)}</PacoteEconomia>
                  </PacotePromocional>
                ))}
              </PacotesPromocionaisGrid>
            </PacotesPromocionaisContainer>
              ):(
                <></>
              )
            }
            
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
                <QuantidadeNumero onClick={handleQuantityClick}>
                  <span style={{ visibility: isEditingQuantity ? 'hidden' : 'visible' }}>
                    {selection?.quantity}
                  </span>
                  {isEditingQuantity && (
                    <QuantidadeInput
                      type="text"
                      value={tempQuantity}
                      onChange={handleQuantityChange}
                      onKeyDown={handleQuantityKeyDown}
                      onBlur={handleQuantityBlur}
                                             autoFocus
                       maxLength={campanhaDetalhes?.maxNumbersPerUser?.toString().length || 6}
                       placeholder="Digite a quantidade"
                     />
                   )}
                   
                  </QuantidadeNumero>
                  <BotaoMais onClick={() => selection?.quantity && updateQuantity(selection.quantity + 1)} $disabled={selection?.quantity && !!campanhaDetalhes?.maxNumbersPerUser && selection.quantity >= (campanhaDetalhes?.maxNumbersPerUser || 0) || false}>
                  <span>+</span>
                </BotaoMais>
              </QuantidadeControle>
              
              {/* Opções de lotes */}
              <SeletorLotes>
                {opcoes.map((opcao) => (
                  <OpcaoLote 
                    key={opcao} 
                    onClick={() => selection?.quantity && updateQuantity(selection.quantity + opcao)}
                    $disabled={selection?.quantity && campanhaDetalhes?.maxNumbersPerUser && selection.quantity+opcao > (campanhaDetalhes?.maxNumbersPerUser || 0) || false}
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
                  {isEditingQuantity? formatCurrency(Number(tempQuantity) * (campanhaDetalhes?.individualNumberPrice || 0)):formatCurrency(selection?.totalPrice || 0)}
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
            <CertificationSectionCompact />
            
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
              $isVertical={isCurrentImageVertical}
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
                      onLoad={(e) => {
                        const target = e.target as HTMLImageElement;
                        const isVertical = target.naturalHeight > target.naturalWidth;
                        
                        // Atualizar o estado apenas se for a imagem atual
                        if (index === currentImageIndex) {
                          setIsCurrentImageVertical(isVertical);
                        }
                      }}
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
            
            {/* Seção de Prêmios por Posição com Imagens */}
            {campanhaDetalhes?.prizeDistribution && (
              campanhaDetalhes.prizeDistribution.length > 1 || 
              (campanhaDetalhes.prizeDistribution[0]?.prizes && campanhaDetalhes.prizeDistribution[0].prizes.length > 1)
            ) && (
              <PremiosSecaoWrapper>
                <PremiosSecaoHeader>
                  <PremiosSecaoHeaderLeft>
                    <PremiosSecaoIcone>🏆</PremiosSecaoIcone>
                    <PremiosSecaoTitleWrapper>
                      <PremiosSecaoTitulo>Múltiplos Ganhadores</PremiosSecaoTitulo>
                      <PremiosSecaoSubtitulo>
                        {campanhaDetalhes.prizeDistribution.length > 1 
                          ? `${campanhaDetalhes.prizeDistribution.length} posições premiadas`
                          : `${campanhaDetalhes.prizeDistribution[0]?.prizes?.length || 0} ganhadores`
                        }
                      </PremiosSecaoSubtitulo>
                    </PremiosSecaoTitleWrapper>
                  </PremiosSecaoHeaderLeft>
                </PremiosSecaoHeader>
                <PremiosImagensContainer>
                {/* Se há múltiplas distribuições (2º lugar em diante) */}
                {campanhaDetalhes.prizeDistribution.length > 1 ? (
                  campanhaDetalhes.prizeDistribution.slice(1).map((distribution, index) => (
                    <PremioImagemItem key={index}>
                      <PremioImagemWrapper>
                        <PremioImagem 
                          src={(distribution.prizes?.[0] as IPrize)?.images?.[0] || campanhaDetalhes.coverImage} 
                          alt={`Prêmio ${index + 2}º lugar`}
                        />
                        <PosicaoBadge>{index + 2}º</PosicaoBadge>
                      </PremioImagemWrapper>
                      <PremioImagemInfo>
                        <PremioImagemNome>{(distribution.prizes?.[0] as IPrize)?.name || `${index + 2}º Lugar`}</PremioImagemNome>
                        <PremioImagemValor>{formatCurrency(Number((distribution.prizes?.[0] as IPrize)?.value) || 0)}</PremioImagemValor>
                      </PremioImagemInfo>
                    </PremioImagemItem>
                  ))
                ) : (
                  /* Se há múltiplos prêmios na mesma categoria (2º lugar em diante) */
                  campanhaDetalhes.prizeDistribution[0]?.prizes?.slice(1).map((prize, index) => (
                    <PremioImagemItem key={index}>
                      <PremioImagemWrapper>
                        <PremioImagem 
                          src={(prize as IPrize)?.images?.[0] || campanhaDetalhes.coverImage} 
                          alt={`Prêmio ${index + 2}º lugar`}
                        />
                        <PosicaoBadge>{index + 2}º</PosicaoBadge>
                      </PremioImagemWrapper>
                      <PremioImagemInfo>
                        <PremioImagemNome>{(prize as IPrize)?.name || `${index + 2}º Lugar`}</PremioImagemNome>
                        <PremioImagemValor>{formatCurrency(Number((prize as IPrize)?.value) || 0)}</PremioImagemValor>
                      </PremioImagemInfo>
                    </PremioImagemItem>
                  ))
                )}
                
                {/* Mostrar indicador de mais prêmios se necessário */}
                {((campanhaDetalhes.prizeDistribution.length > 1 && campanhaDetalhes.prizeDistribution.length > 4) ||
                  (campanhaDetalhes.prizeDistribution.length === 1 && campanhaDetalhes.prizeDistribution[0]?.prizes && campanhaDetalhes.prizeDistribution[0].prizes.length > 4)) && (
                  <PremioMaisItem>
                    <PremioMaisIcone>+</PremioMaisIcone>
                    <PremioMaisTexto>
                      {campanhaDetalhes.prizeDistribution.length > 1 
                        ? `${campanhaDetalhes.prizeDistribution.length - 4} mais`
                        : `${(campanhaDetalhes.prizeDistribution[0]?.prizes?.length || 0) - 4} mais`
                      }
                    </PremioMaisTexto>
                  </PremioMaisItem>
                )}
              </PremiosImagensContainer>
              </PremiosSecaoWrapper>
            )}
          </PainelImagem>
          
          {/* Row layout below the images */}

            {/* Left side - Promotional packages */}
            {
              campanhaDetalhes?.status === CampaignStatusEnum.SCHEDULED ? (
                <></>
              ):(
                <SelectionRowContainer>
            {/* Left side - Promotional packages */}
              
            {
              campanhaDetalhes.enablePackages ? (
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
                    
                    {/* Adicionar tag de desconto */}
                    {(() => {
                      const valorOriginal = campanhaDetalhes?.individualNumberPrice * pacote.quantity || 0;
                      const valorComDesconto = pacote.price || 0;
                      const descontoPercentual = Math.round(((valorOriginal - valorComDesconto) / valorOriginal) * 100);
                      return descontoPercentual > 0 ? (
                        <DescontoTag>{descontoPercentual}% OFF</DescontoTag>
                      ) : null;
                    })()}
                    
                    <PacoteQuantidade>{pacote.quantity} cotas</PacoteQuantidade>
                    <PacoteDescricaoValor>{formatCurrency(campanhaDetalhes?.individualNumberPrice * pacote.quantity || 0)}</PacoteDescricaoValor>
                    <PacotePreco>{formatCurrency(pacote.price || 0)}</PacotePreco>
                    <PacoteEconomia>Economize {formatCurrency((pacote.quantity * campanhaDetalhes?.individualNumberPrice) - pacote.price || 0)}</PacoteEconomia>
                  </PacotePromocional>
                ))}
              </PacotesPromocionaisGrid>
            </PacotesPromocionaisContainer>
              ):(
                <></>
              )
            }
            
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
                  <QuantidadeNumero onClick={handleQuantityClick}>
                    <span style={{ visibility: isEditingQuantity ? 'hidden' : 'visible' }}>
                      {selection?.quantity}
                    </span>
                    {isEditingQuantity && (
                      <QuantidadeInput
                        type="text"
                        value={tempQuantity}
                        onChange={handleQuantityChange}
                        onKeyDown={handleQuantityKeyDown}
                        onBlur={handleQuantityBlur}
                                                  autoFocus
                          maxLength={campanhaDetalhes?.maxNumbersPerUser?.toString().length || 6}
                          placeholder="Digite a quantidade"
                        />
                      )}
                   
                    </QuantidadeNumero>
                    <BotaoMais onClick={() => selection?.quantity && updateQuantity(selection.quantity + 1)} $disabled={!!selection?.quantity && !!campanhaDetalhes?.maxNumbersPerUser && selection.quantity >= (campanhaDetalhes?.maxNumbersPerUser || 0)}>
                    <span>+</span>
                  </BotaoMais>
                </QuantidadeControle>
                
                {/* Opções de lotes */}
                <SeletorLotes>
                  {opcoes.map((opcao) => (
                    <OpcaoLote 
                      key={opcao} 
                      onClick={() => selection?.quantity && updateQuantity(selection.quantity + opcao)}
                      $disabled={selection?.quantity && campanhaDetalhes?.maxNumbersPerUser && selection.quantity+opcao > (campanhaDetalhes?.maxNumbersPerUser || 0) || false}
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
                    {isEditingQuantity? formatCurrency(Number(tempQuantity) * (campanhaDetalhes?.individualNumberPrice || 0)):formatCurrency(selection?.totalPrice || 0)}
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
              <CertificationSectionCompact />
              
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
          images={carouselImages as string[] || []}
          currentIndex={currentImageIndex}
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
            emitido pela VIACAP Capitalização S/A, CNPJ 88.076.302/0001-94, aprovado pelo Processo SUSEP que consta no Título
            . É proibida a venda de título de capitalização a menores de dezesseis anos.
          </p>
        </InformacoesLegais>
      </Conteudo>
      
      {/* Modal de cadastro rápido */}
      <QuickSignupModal 
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
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
  background: linear-gradient(0deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  
  @media (min-width: 768px) {
    padding: 1.5rem;
  }
`;

const MeusTitulosButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.95);
  color: #2d3748;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
  white-space: nowrap;
  justify-self: center;
  
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
    padding: 0.4rem 0.8rem;
    font-size: 0.75rem;
    gap: 0.3rem;
    
    i {
      font-size: 0.7rem;
    }
  }
`;

const HeaderPequeno = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  
  @media (min-width: 768px) {
    gap: 1rem;
    margin-bottom: 0.75rem;
  }
`;

const BotaoVerdePequeno = styled.div`
  background: #10b981;
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  box-shadow: 0 1px 4px rgba(16, 185, 129, 0.3);
  animation: blink 2s ease infinite;
  
  @keyframes blink {
    0%, 100% { opacity: 0; }
    50% { opacity: 1; }
  }
  
  @media (min-width: 768px) {
    font-size: 0.7rem;
    padding: 0.3rem 0.6rem;
  }
`;

const CodigoSorteioTitulo = styled.div`
  background-color: rgba(255, 255, 255, 0.9);
  color: #2d3748;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.65rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  
  @media (min-width: 768px) {
    font-size: 0.7rem;
    padding: 0.3rem 0.6rem;
  }
`;

const TituloContainer = styled.div`
  position: absolute;
  bottom: 1.5rem;
  left: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  z-index: 2;
  
  @media (min-width: 768px) {
    left: 1.5rem;
    right: 1.5rem;
    bottom: 5rem;
  }
`;

const Titulo = styled.h1`
  font-size: 1.4rem;
  
  font-weight: 800;
  margin-bottom: 0.3rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  line-height: 1.1;
  
  @media (min-width: 768px) {
    font-size: 2rem;
    margin-bottom: 0.75rem;
  }
`;

const SubTitulo = styled.h2`
  font-size: 0.7rem;
  font-weight: 500;
  margin-bottom: 1rem;
  opacity: 0.9;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  line-height: 1.3;
  
  @media (min-width: 768px) {
    font-size: 0.7rem !important;
    margin-bottom: 1rem;
  }
`;

const ValoresContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  width: 100%;
  gap: 2rem;
`;

const ValorEsquerda = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const ValorDireita = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
`;

const ValorLabel = styled.div`
  background: #ff4444;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(255, 68, 68, 0.3);
  
  @media (min-width: 768px) {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
  }
`;

const ValorPrincipal = styled.div`
  font-size: 2.5rem;
  font-weight: 900;
  color: white;
  text-shadow: 0 3px 6px rgba(0, 0, 0, 0.5);
  line-height: 1;
  
  @media (min-width: 768px) {
    font-size: 3.5rem;
  }
`;

const ValorNumero = styled.div`
  font-size: 2.5rem;
  font-weight: 900;
  color: white;
  line-height: 1;
  margin-bottom: 0.2rem;
  
  @media (min-width: 768px) {
    font-size: 3.5rem;
  }
`;

// Seção de data do sorteio e preço - estilo atualizado
const SorteioContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
  width: 100%;
  position: relative;
  z-index: 2;
  transform: translateY(-50%);
  border: 1px solid rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  gap: 2rem;
  
  @media (max-width: 576px) {
    padding: 0.6rem 1rem;
    gap: 1.5rem;
    transform: translateY(-40%);
    border-radius: 10px;
  }
`;

const SorteioInfo = styled.div<{ $position?: 'left' | 'right' }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  
  &:first-child::after {
    content: '';
    position: absolute;
    right: -1.25rem;
    top: 50%;
    transform: translateY(-50%);
    height: 70%;
    width: 1px;
    background: rgba(0, 0, 0, 0.1);
    
    @media (max-width: 576px) {
      right: -0.75rem;
    }
  }
`;

const SorteioTexto = styled.div`
  font-size: 0.7rem;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.2rem;
  
  @media (min-width: 768px) {
    font-size: 0.75rem;
  }
`;

const SorteioData = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #2d3748;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  @media (min-width: 768px) {
    font-size: 1.2rem;
  }
`;

const SorteioValor = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #2d3748;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  @media (min-width: 768px) {
    font-size: 1.2rem;
  }
`;

// Estilo atualizado para os prêmios por posição
const PremiosPorPosicao = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
  
  @media (min-width: 768px) {
    gap: 0.7rem;
    margin-top: 0.6rem;
  }
`;

const PremioItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: white;
  padding: 0.4rem 0.6rem;
  border-radius: 8px;
  border-left: 3px solid #6a11cb;
  box-shadow: 0 2px 6px rgba(106, 17, 203, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(106, 17, 203, 0.12);
  }
  
  @media (min-width: 768px) {
    padding: 0.5rem 0.8rem;
    gap: 0.5rem;
    border-radius: 10px;
  }
`;

const PosicaoNumero = styled.div<{ $isExtra?: boolean }>`
  background: ${({ $isExtra }) => $isExtra ? 
    '#6a11cb' : 
    '#6a11cb'
  };
  color: white;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 0.2rem 0.4rem;
  border-radius: 6px;
  min-width: 1.4rem;
  text-align: center;
  
  @media (min-width: 768px) {
    font-size: 0.7rem;
    padding: 0.25rem 0.45rem;
    min-width: 1.6rem;
  }
`;

const PremioValor = styled.div`
  font-size: 0.7rem;
  font-weight: 700;
  color: #6a11cb;
  display: flex;
  flex-direction: column;
  
  @media (min-width: 768px) {
    font-size: 0.8rem;
  }
`;

const PremioNome = styled.div`
  font-size: 0.6rem;
  font-weight: 500;
  color: #666666;
  margin-top: 0.1rem;
  
  @media (min-width: 768px) {
    font-size: 0.65rem;
  }
`;

const PremioTexto = styled.div`
  font-size: 0.65rem;
  font-weight: 600;
  color: #666666;
  
  @media (min-width: 768px) {
    font-size: 0.7rem;
  }
`;

// Componentes para a seção de prêmios com imagens
const PremiosSecaoWrapper = styled.div`
  background: white;
  border: 1px solid rgba(106, 17, 203, 0.1);
  border-radius: 16px;
  padding: 1.25rem;
  margin: 1rem 0;
  box-shadow: 0 4px 20px rgba(106, 17, 203, 0.08);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(to right, #6a11cb, #2575fc);
  }
  
  @media (min-width: 768px) {
    padding: 1.5rem;
    border-radius: 20px;
  }
`;

const PremiosSecaoHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(106, 17, 203, 0.1);
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const PremiosSecaoHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const PremiosSecaoIcone = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  background: rgba(106, 17, 203, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: #6a11cb;
  
  @media (max-width: 768px) {
    width: 2rem;
    height: 2rem;
    font-size: 1rem;
    border-radius: 8px;
  }
`;

const PremiosSecaoTitleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const PremiosSecaoTitulo = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0;
  color: #333333;
  letter-spacing: -0.025em;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const PremiosSecaoSubtitulo = styled.p`
  font-size: 0.875rem;
  color: #666666;
  margin: 0;
  font-weight: 500;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const PremiosImagensContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  padding: 0;
  
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const PremioImagemItem = styled.div`
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid rgba(106, 17, 203, 0.08);
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.3s ease;
  gap: 1rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(to bottom, #6a11cb, #2575fc);
    border-radius: 4px 0 0 4px;
  }
  
  &:hover {
    background: white;
    border-color: rgba(106, 17, 203, 0.15);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px -5px rgba(106, 17, 203, 0.08);
  }
  
  @media (max-width: 640px) {
    padding: 0.875rem;
    gap: 0.75rem;
  }
`;

const PremioImagemWrapper = styled.div`
  position: relative;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  flex-shrink: 0;
  background: #f0f2f5;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 15px rgba(106, 17, 203, 0.1);
  }
  
  @media (min-width: 768px) {
    width: 4rem;
    height: 4rem;
    border-radius: 16px;
  }
`;

const PremioImagem = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PosicaoBadge = styled.div`
  position: absolute;
  top: -6px;
  right: -6px;
  background: #6a11cb;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(106, 17, 203, 0.2);
  min-width: 24px;
  text-align: center;
  z-index: 2;
  letter-spacing: -0.025em;
  line-height: 1;
  
  @media (max-width: 640px) {
    font-size: 0.7rem;
    padding: 0.2rem 0.4rem;
    min-width: 20px;
  }
`;

const PremioImagemInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  gap: 0.5rem;
`;

const PremioImagemNome = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #333333;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: -0.025em;
  
  @media (max-width: 640px) {
    font-size: 0.8rem;
  }
`;

const PremioImagemValor = styled.div`
  font-size: 0.875rem;
  font-weight: 700;
  color: #6a11cb;
  padding: 0.25rem 0;
  align-self: flex-start;
  letter-spacing: -0.025em;
  line-height: 1;
  
  @media (max-width: 640px) {
    font-size: 0.8rem;
  }
`;

const PremioMaisItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(106, 17, 203, 0.03);
  border: 2px dashed rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  padding: 1.5rem 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  gap: 0.75rem;
  text-align: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(148, 163, 184, 0.3);
    transform: translateY(-2px);
  }
  
  @media (max-width: 640px) {
    padding: 1.25rem 0.875rem;
    gap: 0.5rem;
  }
`;

const PremioMaisIcone = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: rgba(148, 163, 184, 0.1);
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 300;
  border: 2px dashed rgba(148, 163, 184, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${PremioMaisItem}:hover & {
    background: rgba(148, 163, 184, 0.15);
    border-color: rgba(148, 163, 184, 0.4);
    color: #cbd5e1;
  }
  
  @media (max-width: 640px) {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.25rem;
  }
`;

const PremioMaisTexto = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #cbd5e1;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: -0.025em;
  
  ${PremioMaisItem}:hover & {
    color: #f1f5f9;
  }
  
  @media (max-width: 640px) {
    font-size: 0.8rem;
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

const CarrosselContainer = styled.div<{ $isVertical?: boolean }>`
  position: relative;
  width: 100%;
  aspect-ratio: ${props => props.$isVertical ? '4/3' : '9/16'};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.md};
  cursor: pointer;
  
  @media (max-width: 768px) {
    aspect-ratio: ${props => props.$isVertical ? '3/4' : '16/9'};
    max-height: ${props => props.$isVertical ? '80vh' : 'auto'};
    min-height: 300px;
  }
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
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 767px) {
    cursor: default;
  }
`;

const CarrosselImagem = styled.img<{ $isVertical?: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: ${props => props.$isVertical ? 'cover' : 'cover'};
  
  @media (max-width: 768px) {
    object-fit: cover;
    max-height: 70vh;
  }
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
  gap: 0.5rem;
  margin-top: 0.75rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  scrollbar-width: thin;
  -webkit-overflow-scrolling: touch;
  width: 100%;
  position: relative;
  
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
  
  /* Efeito de sombra para indicar que há mais conteúdo */
  mask-image: linear-gradient(to right, black 0%, black 95%, transparent 100%);
  -webkit-mask-image: linear-gradient(to right, black 0%, black 95%, transparent 100%);

  @media (max-width: 768px){
    display: flex;
  flex-wrap: nowrap;
  }
  
  /* Para desktop, mostra até 5 miniaturas com scroll suave */
  @media (min-width: 768px) {
  dis
    flex-wrap:none;
    gap:none;
    grid-template-colums: repeat(8,1fr) !important;
    scrollbar-width: none ;

      overflow-x: none;
    -webkit-overflow-scrolling: none;
    padding: 0.5rem 0;

      &::-webkit-scrollbar {
    height: none;
  }
  
  &::-webkit-scrollbar-track {
    background: none;
    border-radius: none;
  }
  
  &::-webkit-scrollbar-thumb {
    background: none;
    border-radius: none;
  }
  
  /* Efeito de sombra para indicar que há mais conteúdo */
  mask-image: none;
  -webkit-mask-image: none;
    
    /* Mostra 2 miniaturas completas e parte da terceira */
    &::after {
      content: '';
      flex: 0 0 20px;
    }
      
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
  min-width: 120px; /* Tamanho reduzido para manter como miniatura */
  max-width: 120px; /* Tamanho máximo fixo */
  width: 30%; /* Aproximadamente 3 itens visíveis */
  flex-shrink: 0;
  
  @media (min-width: 768px) {
    min-width: 150px;
    max-width: 150px;
    width: 20%;
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
    font-size: 0.7rem;
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
    background-color: transparent;
    border: none;
    box-shadow: none;
    padding: 0;
    gap: 0.75rem;
    margin-bottom: 1.5rem;

    &::before {
      display: none;
    }
  }
  
  @media (min-width: 992px) {
    margin-bottom: 0;
  }
`;

// Enhanced promotional title with premium design
const PacotesPromocionaisTitulo = styled.div`
  font-size: 0,8rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, 
    rgba(255, 184, 0, 0.08) 0%, 
    rgba(255, 184, 0, 0.03) 50%, 
    rgba(255, 255, 255, 0.95) 100%
  );
  padding: 1.25rem 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 184, 0, 0.15);
  box-shadow: 
    0 4px 12px rgba(255, 184, 0, 0.1),
    0 1px 3px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  line-height: 1.3;



  &::after {
    content: '';
    position: absolute;
    top: -50%;
    right: -30px;
    width: 80px;
    height: 80px;
    background: radial-gradient(circle, 
      rgba(255, 184, 0, 0.1) 0%, 
      transparent 70%
    );
    border-radius: 50%;
  }

  i {
    color: ${({ theme }) => theme.colors.warning};
    font-size: 1.3rem;
    filter: drop-shadow(0 2px 4px rgba(255, 184, 0, 0.3));
    z-index: 2;
    position: relative;
  }

  @media (max-width: 576px) {
    font-size: 0.7rem;
    padding: 1rem 1.25rem;
    margin-bottom: 1rem;
    gap: 0.6rem;
    border-radius: 10px;
    line-height: 1.25;
    
    &::after {
      width: 60px;
      height: 60px;
      right: -20px;
    }
    
    i {
      font-size: 1.1rem;
    }
  }

  @media (max-width: 400px) {
    font-size: 0.7rem;
    padding: 0.9rem 1rem;
    gap: 0.5rem;
    
    i {
      font-size: 1rem;
    }
  }
`;

// Perfectly aligned grid for promotional packages
const PacotesPromocionaisGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(auto-fit, 1fr);
  gap: 1.25rem;
  position: relative;
  padding-top: 10px;
  align-items: stretch;

  @media (max-width: 576px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.4rem;
  }
  
  @media (min-width: 577px) and (max-width: 1200px) {
    gap: 1rem;
  }
`;

// Create premium package style with perfect alignment
const PacotePromocional = styled.button<{ $melhorOferta?: boolean; $ativo?: boolean }>`
  padding: ${({ $melhorOferta }) => $melhorOferta ? '2rem 1.25rem 1.5rem' : '2rem 1.25rem 1.5rem'};
  border-radius: 12px;
  overflow: visible;
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
  display: grid;
  grid-template-rows: auto auto auto 1fr auto;
  gap: 0.4rem;
  align-items: start;
  justify-items: center;
  cursor: pointer;
  text-align: center;
  height: 100%;
  min-height: 180px;
  box-shadow: ${({ $melhorOferta, $ativo }) => {
    if ($ativo) return `0 8px 20px rgba(106, 17, 203, 0.15), 0 2px 6px rgba(106, 17, 203, 0.1)`;
    return $melhorOferta 
      ? '0 8px 20px rgba(255, 184, 0, 0.12), 0 2px 6px rgba(255, 184, 0, 0.06)' 
      : '0 4px 12px rgba(0, 0, 0, 0.03)';
  }};

  @media (max-width: 576px) {
    padding: ${({ $melhorOferta }) => $melhorOferta ? '1rem 0.5rem 0.6rem' : '1rem 0.5rem 0.6rem'};
    border-radius: 8px;
    min-height: 150px;
    gap: 0.25rem;
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

// Perfectly aligned quantity styling
const PacoteQuantidade = styled.div`
  font-size: 1.5rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.primary};
  letter-spacing: -0.01em;
  grid-row: 1;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2rem;

  @media (max-width: 576px) {
    font-size: 0.85rem;
    height: 1.5rem;
  }
  
  @media (min-width: 577px) and (max-width: 1200px) {
    font-size: 1.3rem;
    height: 1.8rem;
  }
`;

// Perfectly aligned premium price styling
const PacotePreco = styled.div`
  font-size: 1.35rem;
  font-weight: 800;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  grid-row: 3;
  margin: 0;
  height: 2.5rem;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0.2rem;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 2px;
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
    transition: width 0.3s ease;
  }

  @media (max-width: 576px) {
    font-size: 1.05rem;
    height: 2rem;
    
    &::after {
      width: 30px;
      height: 1.5px;
      bottom: 0.1rem;
    }
  }
  
  @media (min-width: 577px) and (max-width: 1200px) {
    font-size: 1.2rem;
    height: 2.2rem;
  }
`;

// Perfectly aligned economy badge
const PacoteEconomia = styled.div`
  font-size: 0.85rem;
  font-weight: 700;
  color: white;
  background-color: ${({ theme }) => theme.colors.success};
  padding: 0.35rem 1rem;
  border-radius: 20px;
  box-shadow: 0 3px 8px rgba(40, 167, 69, 0.15);
  letter-spacing: 0.02em;
  grid-row: 5;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2rem;
  align-self: end;

  @media (max-width: 576px) {
    font-size: 0.6rem;
    padding: 0.25rem 0.75rem;
    height: 1.6rem;
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

// Perfectly aligned unit price info
const PacoteDescricaoValor = styled.div`
  font-size: 0.85rem;
  text-decoration: line-through;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;
  opacity: 0.9;
  grid-row: 2;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 1.2rem;

  @media (max-width: 576px) {
    font-size: 0.7rem;
    height: 1rem;
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
  cursor: pointer;
  transition: transform 0.2s ease;
  
  span {
    position: relative;
    display: inline-block;
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text; /* Standard syntax */
    width: 100% !important; 
    text-align: center;
    
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

const BotaoMais = styled(ControlButton)<{ $disabled?: boolean }>`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.secondary} 100%);
  color: white;
  font-size: 1.8rem;
  opacity: ${({ $disabled }) => $disabled ? 0.5 : 1};
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
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

// Input editável para quantidade
const QuantidadeInput = styled.input`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: transparent;
  border: none;
  outline: none;
  font-size: 2.5rem;
  font-weight: 800;
  text-align: center;
  width: 100%;
  height: auto;
  color: ${({ theme }) => theme.colors.primary};
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  padding: 0.2rem;
  margin: 0;
  min-width: 120px;
  
  &::placeholder {
    font-size: 1rem;
    font-weight: 500;
    opacity: 0.6;
    -webkit-text-fill-color: rgba(106, 17, 203, 0.6);
  }

  @media (max-width: 576px) {
    font-size: 1.2rem;
    width: 80%;
    min-width: 80px;
    padding: 0.1rem;
    
    &::placeholder {
      font-size: 0.7rem;
    }
  }
`;

// Dica de edição
const EditHint = styled.div`
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.7rem;
  color: rgba(106, 17, 203, 0.6);
  font-weight: 500;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ${QuantidadeNumero}:hover & {
    opacity: 1;
  }

  @media (max-width: 576px) {
    font-size: 0.6rem;
    bottom: -15px;
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
const OpcaoLote = styled.div<{ $popular?: boolean, $disabled?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 0.5rem;
  border: 1px solid ${({ theme, $popular }) => $popular 
    ? `rgba(106, 17, 203, 0.4)` 
    : `rgba(0, 0, 0, 0.08)`};
  opacity: ${({ $disabled }) => $disabled ? 0.5 : 1};
  pointer-events: ${({ $disabled }) => $disabled ? 'none' : 'auto'};
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

  @media (max-width: 768px) {
    padding: 0.6rem 0.3rem;
    font-size: 1rem;
    border-radius: 8px;

      &:hover {
    transform: none!important;
    box-shadow: none !important;
    border-color: none !important;
    background-color: none !important;
  }
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

    @media (max-width: 768px) {
    font-size: 0.7rem;
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
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 0.35rem;
  margin-bottom: 0.75rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.25rem;
    margin-bottom: 0.5rem;
  }
  
  @media (min-width: 769px) and (max-width: 1200px) {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.3rem;
  }
`;

// Make the prize cards more compact
const PremioCard = styled.div<{ $category: string; $found?: boolean }>`
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  background: ${({ $found }) => $found ? '#f9f9f9' : 'white'};
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  
  // More subtle shadow for a cleaner look
  box-shadow: ${({ $category, $found }) => {
    const baseStyle = $found ? '0 1px 4px rgba(0, 0, 0, 0.03)' : '';
    
    switch($category) {
      case 'diamante':
        return $found 
          ? `${baseStyle}, inset 0 0 0 1px rgba(153, 33, 232, 0.1)`
          : '0 1px 6px rgba(153, 33, 232, 0.04), 0 1px 3px rgba(153, 33, 232, 0.01)';
      case 'master':
        return $found 
          ? `${baseStyle}, inset 0 0 0 1px rgba(244, 107, 69, 0.1)`
          : '0 1px 6px rgba(244, 107, 69, 0.04), 0 1px 3px rgba(244, 107, 69, 0.01)';
      default:
        return $found 
          ? `${baseStyle}, inset 0 0 0 1px rgba(17, 153, 142, 0.1)`
          : '0 1px 6px rgba(17, 153, 142, 0.04), 0 1px 3px rgba(17, 153, 142, 0.01)';
    }
  }};
  
  transform: perspective(800px) rotateX(0) rotateY(0);
  transform-style: preserve-3d;
  
  &:hover {
    transform: ${({ $found }) => $found ? 'none' : 'perspective(800px) rotateX(0.3deg) rotateY(-0.5deg) translateY(-1px)'};
    box-shadow: ${({ $category, $found }) => {
      if ($found) return; // No hover effect for found titles
      
      switch($category) {
        case 'diamante':
          return '0 4px 10px rgba(153, 33, 232, 0.08), 0 2px 4px rgba(153, 33, 232, 0.04)';
        case 'master':
          return '0 4px 10px rgba(244, 107, 69, 0.08), 0 2px 4px rgba(244, 107, 69, 0.04)';
        default:
          return '0 4px 10px rgba(17, 153, 142, 0.08), 0 2px 4px rgba(17, 153, 142, 0.04)';
      }
    }};
    
    .card-shine {
      opacity: ${({ $found }) => $found ? 0 : 0.3};
    }
    
    .card-prize {
      transform: ${({ $found }) => $found ? 'none' : 'translateZ(6px)'};
    }
  }
`;

// Thinner top bar
const CardTopBar = styled.div<{ $category: string }>`
  height: 1.5px;
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
    height: 1px;
  }
`;

// More compact content layout
const CardContent = styled.div`
  padding: 0.3rem;
  display: grid;
  grid-template-areas: 
    "number tag"
    "prize prize"
    "status status";
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 0.1rem;
  position: relative;
  
  @media (max-width: 768px) {
    padding: 0.15rem;
    gap: 0.05rem;
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
    rgba(255, 255, 255, 0.15) 0%,
    rgba(255, 255, 255, 0) 60%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
`;

// Smaller number text
const CardNumber = styled.div`
  grid-area: number;
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  transition: transform 0.3s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  padding: 0.1rem 0.2rem;
  background: #f7f7ff;
  border-radius: 3px;
  border: 1px dashed rgba(106, 17, 203, 0.1);
  
  @media (max-width: 768px) {
    font-size: 0.4rem;
    padding: 0.05rem 0.1rem;
    border-radius: 2px;
  }
`;

// Smaller emoji
const CardEmoji = styled.span`
  font-size: 0.6rem;
  margin-right: 0.15rem;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    font-size: 0.4rem;
    margin-right: 0.05rem;
  }
`;

// Smaller prize amount text
const CardPrize = styled.div<{ $category: string }>`
  grid-area: prize;
  font-size: 0.85rem;
  font-weight: 800;
  transition: transform 0.3s ease;
  letter-spacing: -0.02em;
  margin: 0.03rem 0;
  
  @media (max-width: 768px) {
    font-size: 0.5rem;
    margin: 0.01rem 0;
  }
  
  @media (min-width: 769px) and (max-width: 1200px) {
    font-size: 0.75rem;
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
  font-size: 0.5rem;
  font-weight: 600;
  color: #2ecc71;
  
  @media (max-width: 768px) {
    font-size: 0.35rem;
  }
  
  i {
    font-size: 0.55rem;
    margin-right: 0.1rem;
    
    @media (max-width: 768px) {
      font-size: 0.35rem;
      margin-right: 0.05rem;
    }
  }
  
  span {
    color: ${({ theme }) => theme.colors.text.secondary};
    background: ${({ theme }) => theme.colors.background};
    padding: 0.08rem 0.2rem;
    border-radius: 6px;
    font-size: 0.45rem;
    
    @media (max-width: 768px) {
      font-size: 0.3rem;
      padding: 0.03rem 0.08rem;
      border-radius: 2px;
    }
  }
`;

// Smaller tag
const CardTag = styled.div<{ $category: string }>`
  grid-area: tag;
  position: relative;
  padding: 0.08rem 0.2rem;
  font-size: 0.4rem;
  font-weight: 700;
  color: white;
  z-index: 2;
  border-radius: 2px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.08);
  
  @media (max-width: 768px) {
    padding: 0.03rem 0.08rem;
    font-size: 0.25rem;
    border-radius: 1px;
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
  gap: 0.4rem;
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
  
  border-radius: 6px;
  padding: 0.5rem 0.6rem;
  margin-bottom: 0.4rem;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.01);
  
  @media (max-width: 768px) {
    padding: 0.3rem 0.4rem;
    margin-bottom: 0.3rem;
    gap: 0.3rem;
    border-radius: 4px;
  }
`;

const CategoryIconWrapper = styled.div<{ $category: string }>`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  
  @media (max-width: 768px) {
    width: 18px;
    height: 18px;
    border-radius: 9px;
  }
  
  // Glass effect
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  
  // Inner glow effect
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 12px;
    padding: 0.5px;
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
      border-radius: 9px;
      padding: 0.25px;
    }
  }
  
  i {
    font-size: 0.75rem;
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
      font-size: 0.6rem;
    }
  }
`;

// Smaller, more compact category info
const CategoryInfo = styled.div`
  flex: 1;
`;

const CategoryName = styled.div<{ $category: string }>`
  font-size: 0.8rem;
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
    font-size: 0.6rem;
  }
`;

const CategoryMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.1rem;
  
  @media (max-width: 768px) {
    gap: 0.3rem;
    margin-top: 0.05rem;
  }
`;

const CategoryMetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.15rem;
  font-size: 0.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
  
  @media (max-width: 768px) {
    font-size: 0.4rem;
    gap: 0.1rem;
  }
  
  i {
    font-size: 0.55rem;
    opacity: 0.7;
    
    @media (max-width: 768px) {
      font-size: 0.45rem;
    }
  }
`;

const PremiosCategoryTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 800;
  margin: 1rem 0 0.6rem;
  letter-spacing: -0.02em;
  padding-bottom: 0.4rem;
  position: relative;
  
  @media (max-width: 768px) {
    font-size: 0.7rem;
    margin: 0.6rem 0 0.4rem;
    padding-bottom: 0.3rem;
  }
  
  &:first-of-type {
    margin-top: 0.25rem;
    
    @media (max-width: 768px) {
      margin-top: 0.2rem;
    }
  }
  
  // Elegant underline with gradient
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 40px;
    height: 1.5px;
    border-radius: 0.75px;
    background: ${({ theme }) => theme.colors.primary};
    transition: width 0.3s ease;
    
    @media (max-width: 768px) {
      width: 30px;
      height: 1px;
    }
  }
  
  &:hover::after {
    width: 60px;
    
    @media (max-width: 768px) {
      width: 40px;
    }
  }
`;

const BotaoVerMais = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: auto;
  padding: 0.3rem 0.5rem;
  margin: 0.4rem auto;
  background: transparent;
  color: ${({ theme }) => theme.colors.primary};
  border: 1px dashed ${({ theme }) => `${theme.colors.primary}30`};
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.6rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => `${theme.colors.primary}08`};
    border: 1px dashed ${({ theme }) => `${theme.colors.primary}60`};
  }
  
  i {
    margin-left: 0.3rem;
    font-size: 0.55rem;
  }
  
  @media (max-width: 768px) {
    font-size: 0.5rem;
    padding: 0.25rem 0.4rem;
    
    i {
      font-size: 0.45rem;
      margin-left: 0.25rem;
    }
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

// Componentes para as informações organizadas
const InfoContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin: -2rem 1rem 2rem;
  position: relative;
  z-index: 10;
  
  @media (min-width: 768px) {
    margin: -2rem 2rem 2rem;
    gap: 1.5rem;
  }
`;

const InfoCard = styled.div<{ $destaque?: boolean }>`
  background: ${({ $destaque }) => $destaque ? 
    'linear-gradient(135deg, #ff4444, #ff6b6b)' : 
    'white'
  };
  color: ${({ $destaque }) => $destaque ? 'white' : '#2d3748'};
  padding: 1.25rem 1rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: ${({ $destaque }) => $destaque ? 
    '0 8px 25px rgba(255, 68, 68, 0.3)' : 
    '0 4px 15px rgba(0, 0, 0, 0.1)'
  };
  transform: ${({ $destaque }) => $destaque ? 'scale(1.05)' : 'scale(1)'};
  transition: all 0.3s ease;
  
  &:hover {
    transform: ${({ $destaque }) => $destaque ? 'scale(1.08)' : 'scale(1.03)'};
    box-shadow: ${({ $destaque }) => $destaque ? 
      '0 12px 30px rgba(255, 68, 68, 0.4)' : 
      '0 8px 20px rgba(0, 0, 0, 0.15)'
    };
  }
  
  @media (max-width: 576px) {
    padding: 1rem 0.75rem;
  }
`;

const InfoIcon = styled.div`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  
  @media (max-width: 576px) {
    font-size: 1.2rem;
    margin-bottom: 0.3rem;
  }
`;

const InfoTitle = styled.div`
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.8;
  margin-bottom: 0.3rem;
  
  @media (max-width: 576px) {
    font-size: 0.7rem;
  }
`;

const InfoValue = styled.div`
  font-size: 1.1rem;
  font-weight: 800;
  
  @media (min-width: 768px) {
    font-size: 1.3rem;
  }
  
  @media (max-width: 576px) {
    font-size: 0.9rem;
  }
`;

// Botão do menu hamburger
const MenuButton = styled.button<{ $isOpen: boolean }>`
  position: relative;
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  z-index: 101;
  backdrop-filter: blur(5px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  padding: 0;
  
  &:hover {
    background: rgba(0, 0, 0, 0.7);
    transform: scale(1.05);
  }
  
  span {
    display: block;
    width: 18px;
    height: 2px;
    background-color: white;
    transition: all 0.3s ease;
    
    &:nth-child(1) {
      transform: ${({ $isOpen }) => $isOpen ? 'rotate(45deg) translate(5px, 5px)' : 'rotate(0)'};
    }
    
    &:nth-child(2) {
      opacity: ${({ $isOpen }) => $isOpen ? '0' : '1'};
    }
    
    &:nth-child(3) {
      transform: ${({ $isOpen }) => $isOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'rotate(0)'};
    }
  }
`;

// Overlay para fechar o menu quando clicar fora
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99;
  backdrop-filter: blur(3px);
`;

// Menu lateral
const SideMenu = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.secondary} 100%);
  z-index: 100;
  transform: translateX(${({ $isOpen }) => $isOpen ? '0' : '-100%'});
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
`;

// Cabeçalho do menu lateral
const SideMenuHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

// Logo no menu lateral
const SideMenuLogo = styled.div`
  font-size: 1.5rem;
  font-weight: 800;
  color: white;
  display: flex;
  align-items: center;
  gap: 10px;
`;

// Ícone do logo
const LogoIcon = styled.div`
  background: white;
  color: ${({ theme }) => theme.colors.primary};
  width: 30px;
  height: 30px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

// Botão para fechar o menu
const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

// Navegação no menu lateral
const SideMenuNav = styled.nav`
  flex: 1;
  overflow-y: auto;
  padding: 20px 0;
`;

// Links no menu lateral
const SideMenuLink = styled.div<{ $active?: boolean }>`
  a {
    color: white;
    text-decoration: none;
    font-size: 1rem;
    padding: 12px 20px;
    display: block;
    transition: all 0.2s ease;
    background: ${({ $active }) => $active ? 'rgba(255, 255, 255, 0.15)' : 'transparent'};
    font-weight: ${({ $active }) => $active ? '600' : '400'};
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: white;
      opacity: ${({ $active }) => $active ? '1' : '0'};
      transition: opacity 0.2s ease;
    }
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
      padding-left: 25px;
      
      &::before {
        opacity: 0.5;
      }
    }
  }
`;

// Rodapé do menu lateral
const SideMenuFooter = styled.div`
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

// Botão no rodapé do menu lateral
const SideMenuButton = styled.button`
  width: 100%;
  padding: 12px;
  background: white;
  color: ${({ theme }) => theme.colors.primary};
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  }
`;

// Adicionar o componente de tag de desconto
const DescontoTag = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  background: #4CAF50;
  color: white;
  font-size: 0.6rem;
  font-weight: 700;
  padding: 0.35rem 0.6rem;
  border-radius: 7px 0 7px 0;
  z-index: 2;
  
  @media (max-width: 576px) {
    font-size: 0.6rem;
    padding: 0.1rem 0.4rem;
  }
`;

export default CampanhaDetalhes; 