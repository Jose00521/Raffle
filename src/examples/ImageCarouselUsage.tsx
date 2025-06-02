'use client';

import React, { useState } from 'react';
import ImageCarousel from '@/components/ui/ImageCarousel';
import ImageModal from '@/components/ui/ImageModal';

interface ExampleProps {
  images: string[];
}

/**
 * Exemplo de como usar o componente ImageCarousel
 * 
 * Este exemplo demonstra como integrar o ImageCarousel em componentes existentes
 * incluindo um modal para visualização de imagem ampliada.
 */
const ImageCarouselExample: React.FC<ExampleProps> = ({ images }) => {
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Handler para abrir o modal quando uma imagem é clicada
  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setShowImageModal(true);
  };
  
  return (
    <div>
      <h2>Exemplo Básico</h2>
      <ImageCarousel 
        images={images}
        onImageClick={() => setShowImageModal(true)}
      />
      
      <h2>Com Opções Personalizadas</h2>
      <ImageCarousel 
        images={images}
        showZoomIndicator={true}
        aspectRatio="4/3"
        autoplayInterval={3000}
        showThumbnails={true}
      />
      
      <h2>Com Modal para Visualização Ampliada</h2>
      <ImageCarousel 
        images={images}
        onImageClick={() => setShowImageModal(true)}
        showZoomIndicator={true}
      />
      
      {/* Modal para visualização ampliada da imagem */}
      <ImageModal 
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        images={images}
        currentIndex={currentImageIndex}
      />
      
      <h2>Instruções de Uso</h2>
      <pre>
{`// Importando o componente
import ImageCarousel from '@/components/ui/ImageCarousel';
import ImageModal from '@/components/ui/ImageModal';

// Dentro do seu componente
const [showImageModal, setShowImageModal] = useState(false);

// JSX
<ImageCarousel 
  images={arrayDeImagens}
  onImageClick={() => setShowImageModal(true)}
  showZoomIndicator={true}
  aspectRatio="16/9"  // Padrão, pode ser alterado
/>

// Modal opcional para visualização ampliada
<ImageModal 
  isOpen={showImageModal}
  onClose={() => setShowImageModal(false)}
  images={arrayDeImagens}
  currentIndex={0}  // Índice da imagem a ser mostrada primeiro
/>
`}
      </pre>
    </div>
  );
};

export default ImageCarouselExample; 