import { useState, useMemo } from 'react';

interface UsePaginationProps {
  totalItems: number;
  initialPage?: number;
  initialPageSize?: number;
  pageSizeOptions?: number[];
}

interface UsePaginationReturn {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  pageSizeOptions: number[];
  firstItemIndex: number;
  lastItemIndex: number;
  
  // Métodos
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  
  // Helpers para UI
  canGoToPrevPage: boolean;
  canGoToNextPage: boolean;
  
  // Função para paginar dados
  paginateData: <T>(data: T[]) => T[];
}

export function usePagination({
  totalItems,
  initialPage = 1,
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 25, 50, 100]
}: UsePaginationProps): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Recalcular página atual se o tamanho da página mudar
  const handlePageSizeChange = (newPageSize: number) => {
    const firstItemCurrentPage = (currentPage - 1) * pageSize + 1;
    const newPage = Math.max(1, Math.ceil(firstItemCurrentPage / newPageSize));
    setPageSize(newPageSize);
    setCurrentPage(newPage);
  };

  // Calcular o número total de páginas
  const totalPages = useMemo(() => 
    Math.max(1, Math.ceil(totalItems / pageSize)),
    [totalItems, pageSize]
  );

  // Garantir que a página atual esteja sempre dentro dos limites válidos
  useMemo(() => {
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  }, [currentPage, totalPages]);

  // Índices do primeiro e último item na página atual
  const firstItemIndex = (currentPage - 1) * pageSize;
  const lastItemIndex = Math.min(firstItemIndex + pageSize, totalItems);

  // Verificações de navegação
  const canGoToPrevPage = currentPage > 1;
  const canGoToNextPage = currentPage < totalPages;

  // Funções de navegação
  const nextPage = () => {
    if (canGoToNextPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (canGoToPrevPage) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToFirstPage = () => {
    setCurrentPage(1);
  };

  const goToLastPage = () => {
    setCurrentPage(totalPages);
  };

  // Função para paginar qualquer array de dados
  const paginateData = <T>(data: T[]): T[] => {
    return data.slice(firstItemIndex, lastItemIndex);
  };

  return {
    currentPage,
    pageSize,
    totalPages,
    pageSizeOptions,
    firstItemIndex,
    lastItemIndex,
    setCurrentPage,
    setPageSize: handlePageSizeChange,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    canGoToPrevPage,
    canGoToNextPage,
    paginateData
  };
} 