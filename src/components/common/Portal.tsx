'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
  rootId?: string;
}

export const Portal: React.FC<PortalProps> = ({ 
  children, 
  rootId = 'dropdown-portal-root'
}) => {
  const [mounted, setMounted] = useState(false);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Verificar se estamos no browser (não no servidor)
    if (typeof window === 'undefined') return;

    // Verificar se já existe um elemento portal
    let root = document.getElementById(rootId);
    
    // Se não existir, criar um novo
    if (!root) {
      root = document.createElement('div');
      root.id = rootId;
      // Configurar estilos importantes
      root.style.position = 'fixed';
      root.style.top = '0';
      root.style.left = '0';
      root.style.width = '100%';
      root.style.height = '0';
      root.style.overflow = 'visible';
      root.style.zIndex = '9999';
      root.style.pointerEvents = 'none'; // Permitir cliques através do container
      document.body.appendChild(root);
    }
    
    setPortalRoot(root);
    setMounted(true);
    
    // Limpar ao desmontar
    return () => {
      setMounted(false);
      // Remover o elemento portal se estiver vazio e ainda existir
      if (root && root.childNodes.length === 0 && document.body.contains(root)) {
        document.body.removeChild(root);
      }
    };
  }, [rootId]);

  // Não renderizar nada no servidor ou se não estiver montado
  if (!mounted || typeof window === 'undefined' || !portalRoot) return null;
  
  return createPortal(
    <div style={{ pointerEvents: 'auto' }}>{children}</div>, 
    portalRoot
  );
};