'use client';

import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { IRifa } from '../../models/Rifa';
import SecurityModal from '../auth/SecurityModal';
import ImageModal from '../ui/ImageModal';
import rifaAPI from '../../services/rifaAPI';

// Atualizando a interface IRifa para incluir as propriedades extras
interface CampanhaDetalheProps {
  campanha: IRifa & {
    instantPrizes?: Array<{
      number: string;
      value: number;
      winner: string | null;
    }>;
    regulamento?: string;
    codigoSorteio?: string;
    premiacaoPrincipal?: string;
    valorPremio?: string;
    // Adicionando suporte para múltiplas imagens
    images?: string[];
  };
}

// Componente principal
const CampanhaDetalhes: React.FC<CampanhaDetalheProps> = ({ campanha }) => {
  // Valor mínimo R$12,00, então se cada número custa R$1,00, são 12 números mínimo
  const numeroMinimo = Math.max(12, Math.ceil(12 / campanha.price));
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
  
  // Criando 100 títulos premiados fixos de R$500,00 cada
  const fixedPrizes = Array.from({ length: 100 }, (_, index) => ({
    number: String(1000 + index).padStart(6, '0'),
    value: 500,
    winner: null
  }));
  
  // Imagens do carrossel (usando a imagem principal como primeira e adicionando imagens extras se disponíveis)
  const carouselImages = campanha.images;
  
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
  const dataSorteio = new Date(campanha.drawDate).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  // Função para incrementar quantidade
  const incrementar = () => {
    setAnimateValue(true);
    setQuantidadeSelecionada(prev => prev + 1);
    setTimeout(() => setAnimateValue(false), 300);
  };
  
  // Função para decrementar quantidade
  const decrementar = () => {
    if (quantidadeSelecionada > numeroMinimo) {
      setAnimateValue(true);
      setQuantidadeSelecionada(prev => prev - 1);
      setTimeout(() => setAnimateValue(false), 300);
    }
  };

  // Função para adicionar quantidade em lote
  const adicionarLote = (quantidade: number) => {
    setAnimateValue(true);
    setQuantidadeSelecionada(prev => prev + quantidade);
    setTimeout(() => setAnimateValue(false), 300);
  };
  
  // Função para resetar a quantidade para o mínimo
  const resetarQuantidade = () => {
    setAnimateValue(true);
    setQuantidadeSelecionada(numeroMinimo);
    setTimeout(() => setAnimateValue(false), 300);
  };
  
  // Calcular valor total
  const valorTotal = (campanha.price * quantidadeSelecionada).toFixed(2);

  // Estado para armazenar as estatísticas dos números
  const [rifaStats, setRifaStats] = useState({
    totalNumbers: campanha.totalNumbers,
    available: campanha.totalNumbers,
    reserved: 0,
    sold: 0,
    percentComplete: 0
  });
  
  // Buscar estatísticas dos números ao carregar o componente
  useEffect(() => {
    async function loadStats() {
      try {
        if (campanha._id) {
          //const stats = await rifaAPI.getRifaStats(campanha._id.toString());
          //setRifaStats(stats);
        }
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error);
      }
    }
    
    loadStats();
  }, [campanha._id]);
  
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
  
  // Função para carregar mais prêmios
  const loadMorePrizes = () => {
    // Adiciona mais 20 prêmios ou até o limite máximo de 100 prêmios
    setVisiblePrizes(prev => Math.min(prev + 20, 100));
  };
  
  return (
    <Container>
      {/* Banner da campanha */}
      <Banner style={{ backgroundImage: `url(${campanha.image})` }}>
        {/* Código do sorteio */}
        <BannerOverlay>
          <CodigoSorteio>
            {campanha.codigoSorteio || `RA${campanha._id}/01`}
          </CodigoSorteio>
          
          {/* Título da campanha */}
          <Titulo>{campanha.title}</Titulo>
          
          {/* Subtítulo/prêmio principal */}
          <SubTitulo>{campanha.premiacaoPrincipal || campanha.title}</SubTitulo>
          
          {/* Botões de ação */}
          <BotoesAcao>
            <BotaoCompartilhar>
              <i className="fas fa-share-alt"></i> Compartilhar
            </BotaoCompartilhar>
            <BotaoFavorito>
              <i className="fas fa-heart"></i>
            </BotaoFavorito>
            <PulsingTag>Adquira já</PulsingTag>
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
                {carouselImages.map((img, index) => (
                  <CarrosselSlide key={index}>
                    <CarrosselImagem 
                      src={img} 
                      alt={`${campanha.title} - imagem ${index+1}`}
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
                {carouselImages.map((_, index) => (
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
              {carouselImages.map((img, index) => (
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
          
          {/* Painel de compra */}
          <CompraContainer>
            {/* Mensagem incentivo */}
            <MensagemIncentivo>
              <i className="fas fa-trophy"></i> Quanto mais títulos, mais chances de ganhar!
            </MensagemIncentivo>
            
            {/* Seletor de quantidade estilo moderno */}
            <QuantidadeSelector>
              <QuantidadeLabel>Quantidade de títulos:</QuantidadeLabel>
              <QuantidadeControle>
                <BotoesEsquerda>
                  <BotaoReset onClick={resetarQuantidade} disabled={quantidadeSelecionada <= numeroMinimo}>
                    <i className="fas fa-times"></i>
                  </BotaoReset>
                  <BotaoMenos onClick={decrementar} disabled={quantidadeSelecionada <= numeroMinimo}>-</BotaoMenos>
                </BotoesEsquerda>
                <QuantidadeNumero >{quantidadeSelecionada}</QuantidadeNumero>
                <BotaoMais onClick={incrementar}>+</BotaoMais>
              </QuantidadeControle>
              
              {/* Opções de lotes */}
              <SeletorLotes>
                {opcoes.map((opcao) => (
                  <OpcaoLote 
                    key={opcao} 
                    onClick={() => adicionarLote(opcao)}
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
                <ValorTotal >
                  R$ {valorTotal}
                </ValorTotal>
              </ValorTotalContainer>
            </QuantidadeSelector>
            
            {/* Botão de participar */}
            <BotaoParticipar>
              Participar agora
              <i className="fas fa-chevron-right"></i>
            </BotaoParticipar>
            
            {/* Informação de segurança */}
            <SegurancaInfo onClick={() => setShowSecurityModal(true)}>
              <i className="fas fa-shield-alt"></i> Compra 100% segura e criptografada
            </SegurancaInfo>
          </CompraContainer>
        </MobileContainer>
        
        {/* Modal de Segurança */}
        <SecurityModal 
          isOpen={showSecurityModal}
          onClose={() => setShowSecurityModal(false)}
        />
        
        {/* Modal de Imagem em tela cheia */}
        <ImageModal 
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          images={carouselImages}
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
              <p>{campanha.regulamento || campanha.description}</p>
              
              <h4>PREMIAÇÃO:</h4>
              <p>{campanha.premiacaoPrincipal} (SUGESTÃO DE USO DO PRÊMIO LÍQUIDO {campanha.valorPremio})</p>
              
              <h4>COMO FUNCIONA:</h4>
              <p>
                Você escolhe a quantidade de números que deseja adquirir (mínimo {numeroMinimo}). 
                O sistema irá gerar aleatoriamente os números para você entre os disponíveis para esta campanha.
                Quanto mais números adquirir, maiores são suas chances de ganhar!
              </p>
              
              {campanha.instantPrizes && campanha.instantPrizes.length > 0 && (
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
              )}
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
              
              <ListaPremios>
                {/* Exibe apenas os prêmios visíveis com base no estado atual */}
                {fixedPrizes.slice(0, visiblePrizes).map((premio, index) => (
                  <ItemPremio key={index}>
                    <NumeroPremio>{premio.number}</NumeroPremio>
                    <ValorPremio>R$ {premio.value.toFixed(2)}</ValorPremio>
                    <StatusPremio>
                      <StatusIndicator />
                      Disponível
                    </StatusPremio>
                  </ItemPremio>
                ))}
              </ListaPremios>
              
              {/* Botão "Ver mais" que aparece apenas se houver mais itens para mostrar */}
              {visiblePrizes < 100 && (
                <BotaoVerMais onClick={loadMorePrizes}>
                  Ver mais <span>({Math.min(20, 100 - visiblePrizes)} de {100 - visiblePrizes} restantes)</span>
                </BotaoVerMais>
              )}
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

const MobileContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  
  @media (min-width: 992px) {
    flex-direction: row;
    align-items: flex-start;
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
    grid-template-columns: repeat(4, 1fr);
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
  min-width: 200px; /* Tamanho reduzido para manter como miniatura */
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
  
  i {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const QuantidadeSelector = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const QuantidadeLabel = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const QuantidadeControle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border: 2px solid ${({ theme }) => theme.colors.gray.light};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background-color: ${({ theme }) => theme.colors.background};
`;

const BotoesEsquerda = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const QuantidadeNumero = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  min-width: 80px;
  text-align: center;
  transition: transform 0.15s ease, color 0.15s ease;
  

`;

const BotaoMais = styled.button`
  width: 40px;
  height: 40px;
  background: ${({ theme }) => theme.colors.gradients.purple};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: 50%;
  font-size: 1.4rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${({ theme }) => theme.shadows.gold};
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 5px 20px rgba(106, 17, 203, 0.5);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const BotaoMenos = styled(BotaoMais)<{ disabled: boolean }>`
  background: ${({ disabled, theme }) => disabled ? 
    '#e0e0e0' : 
    theme.colors.gradients.purple
  };
  box-shadow: ${({ disabled, theme }) => disabled ? 
    'none' : 
    theme.shadows.gold
  };
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  
  &:hover {
    transform: ${({ disabled }) => disabled ? 'none' : 'scale(1.1)'};
    box-shadow: ${({ disabled }) => disabled ? 
      'none' : 
      '0 5px 20px rgba(106, 17, 203, 0.5)'
    };
  }
`;

const BotaoReset = styled(BotaoMais)<{ disabled: boolean }>`
  background: ${({ disabled, theme }) => disabled ? 
    '#e0e0e0' : 
    theme.colors.gradients.action
  };
  box-shadow: ${({ disabled, theme }) => disabled ? 
    'none' : 
    '0 5px 15px rgba(255, 65, 108, 0.3)'
  };
  width: 32px;
  height: 32px;
  font-size: 0.9rem;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  
  &:hover {
    transform: ${({ disabled }) => disabled ? 'none' : 'scale(1.1)'};
    box-shadow: ${({ disabled }) => disabled ? 
      'none' : 
      '0 5px 20px rgba(255, 65, 108, 0.5)'
    };
  }
`;

const SeletorLotes = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const OpcaoLote = styled.div<{ $popular?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem 0.5rem;
  border: 2px solid ${({ theme, $popular }) => $popular 
    ? theme.colors.success 
    : theme.colors.gray.light};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 700;
  font-size: 1.2rem;
  background-color: ${({ theme, $popular }) => $popular 
    ? 'rgba(76, 175, 80, 0.1)' 
    : theme.colors.background};
  position: relative;
  ${({ $popular }) => $popular && `
    transform: scale(1.05);
    box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);
  `}
  
  &:hover {
    transform: translateY(-3px) ${({ $popular }) => $popular ? 'scale(1.05)' : ''};
    box-shadow: ${({ theme, $popular }) => $popular 
      ? '0 8px 20px rgba(76, 175, 80, 0.5)' 
      : theme.shadows.md};
    border-color: ${({ theme, $popular }) => $popular 
      ? theme.colors.success
      : theme.colors.primary};
    color: ${({ theme, $popular }) => $popular 
      ? theme.colors.success
      : theme.colors.primary};
  }
  
  &:active {
    transform: translateY(0) ${({ $popular }) => $popular ? 'scale(1.05)' : ''};
  }
`;

const TextoSelecionar = styled.span`
  font-size: 0.75rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 0.25rem;
`;

const ValorTotalContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 2px solid ${({ theme }) => theme.colors.gray.light};
`;

const ValorTotalLabel = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1.1rem;
`;

const ValorTotal = styled.div`
  font-size: 1.5rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.primary};
  transition: transform 0.15s ease;
  

`;

const BotaoParticipar = styled.button`
  width: 100%;
  padding: 1.25rem;
  background: ${({ theme }) => theme.colors.gradients.action};
  color: white;
  font-size: 1.25rem;
  font-weight: 700;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1rem;
  box-shadow: 0 8px 20px rgba(255, 65, 108, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  i {
    font-size: 1rem;
    transition: transform 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 25px rgba(255, 65, 108, 0.4);
    
    i {
      transform: translateX(3px);
    }
  }
  
  &:active {
    transform: translateY(-1px);
  }
`;

const PulsingTag = styled.div`
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  font-weight: 700;
  font-size: 0.85rem;
  padding: 0.5rem 1.2rem;
  border-radius: 50px;
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.3);
  animation: pulse-glow 2s infinite ease-in-out;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  position: relative;
  margin-left: 10px;
  backdrop-filter: blur(3px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  
  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    background: #fff;
    border-radius: 50%;
    margin-right: 8px;
    box-shadow: 0 0 0 rgba(255, 255, 255, 0.7);
    animation: pulse-dot 2s infinite;
  }
  
  @keyframes pulse-glow {
    0% { 
      opacity: 0.85; 
      transform: scale(0.98); 
      box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3);
    }
    50% { 
      opacity: 1; 
      transform: scale(1); 
      box-shadow: 0 7px 20px rgba(40, 167, 69, 0.6), inset 0 1px 3px rgba(255, 255, 255, 0.5);
    }
    100% { 
      opacity: 0.85; 
      transform: scale(0.98); 
      box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3);
    }
  }
  
  @keyframes pulse-dot {
    0% {
      box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
    }
    70% {
      box-shadow: 0 0 0 6px rgba(255, 255, 255, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
    }
  }
  
  @media (max-width: 480px) {
    font-size: 0.75rem;
    padding: 0.4rem 0.9rem;
  }
`;

const SegurancaInfo = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #28a745;
  background-color: rgba(40, 167, 69, 0.1);
  border: 1px solid rgba(40, 167, 69, 0.2);
  border-radius: 8px;
  padding: 0.75rem;
  width: 100%;
  margin-top: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(40, 167, 69, 0.15);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(40, 167, 69, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  i {
    color: #28a745;
    font-size: 1rem;
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

const ListaPremios = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ItemPremio = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.gray.light};
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const NumeroPremio = styled.div`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ValorPremio = styled.div`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
`;

const StatusPremio = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.success};
  text-align: right;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
`;

const StatusIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.success};
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
  background-color: ${({ theme }) => theme.colors.success};
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 20px;
  box-shadow: 0 3px 8px rgba(76, 175, 80, 0.4);
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

export default CampanhaDetalhes; 