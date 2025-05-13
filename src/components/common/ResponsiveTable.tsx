'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { FaSort, FaSortUp, FaSortDown, FaChevronRight, FaChevronDown } from 'react-icons/fa';

export interface ColumnDefinition {
  id: string;
  header: string | React.ReactNode;
  accessor: (row: any, index: number) => React.ReactNode;
  sortable?: boolean;
  minWidth?: string;
  maxWidth?: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  mobileLabel?: string;
  priority?: number; // Used for responsive visibility (higher = more important)
}

interface ResponsiveTableProps {
  columns: ColumnDefinition[];
  data: any[];
  className?: string;
  noDataMessage?: string;
  rowKeyField?: string;
  isLoading?: boolean;
  onRowClick?: (row: any) => void;
  expandableContent?: (row: any) => React.ReactNode;
  initialSortBy?: { id: string; desc: boolean };
  stickyHeader?: boolean;
  zebra?: boolean;
}

type SortDirection = 'asc' | 'desc' | 'none';

interface TableState {
  sortBy: {
    id: string;
    direction: SortDirection;
  } | null;
  expandedRows: Set<string | number>;
}

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);

  @media (max-width: 768px) {
    border-radius: 8px;
  }
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background-color: rgba(0, 0, 0, 0.02);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.2);
    }
  }
`;

const StyledTable = styled.table<{ $stickyHeader?: boolean }>`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin: 0;
  
  ${props => props.$stickyHeader && `
    position: relative;
    
    thead {
      position: sticky;
      top: 0;
      z-index: 10;
    }
    
    th {
      background-color: white;
      position: sticky;
      top: 0;
    }
  `}
`;

const TableHead = styled.thead`
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`;

const TableHeaderRow = styled.tr``;

const TableHeaderCell = styled.th<{
  $sortable?: boolean;
  $align?: string;
  $width?: string;
  $minWidth?: string;
  $maxWidth?: string;
}>`
  padding: 14px 16px;
  text-align: ${props => props.$align || 'left'};
  font-weight: 600;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  white-space: nowrap;
  cursor: ${props => props.$sortable ? 'pointer' : 'default'};
  transition: background-color 0.2s ease;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  width: ${props => props.$width || 'auto'};
  min-width: ${props => props.$minWidth || 'auto'};
  max-width: ${props => props.$maxWidth || 'none'};
  
  &:hover {
    ${props => props.$sortable && `
      background-color: rgba(0, 0, 0, 0.02);
    `}
  }
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SortIcon = styled.span`
  display: inline-flex;
  align-items: center;
  margin-left: 6px;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr<{ 
  $clickable?: boolean; 
  $isExpanded?: boolean;
  $zebra?: boolean;
  $index: number;
}>`
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  background-color: ${props => {
    if (props.$isExpanded) return 'rgba(106, 17, 203, 0.03)';
    if (props.$zebra && props.$index % 2 !== 0) return 'rgba(0, 0, 0, 0.01)';
    return 'transparent';
  }};
  transition: background-color 0.2s ease;
  
  ${props => props.$clickable && `
    cursor: pointer;
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.02);
    }
  `}
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.td<{ $align?: string }>`
  padding: 14px 16px;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  text-align: ${props => props.$align || 'left'};
  vertical-align: middle;
  
  @media (max-width: 768px) {
    padding: 12px 14px;
    font-size: 0.85rem;
  }
`;

const ExpandButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  
  &:hover {
    color: ${({ theme }) => theme.colors?.primary || '#6a11cb'};
  }
`;

const ExpandedContent = styled.tr`
  background-color: rgba(106, 17, 203, 0.02);
`;

const ExpandedCell = styled.td`
  padding: 0 16px 16px;
`;

const ExpandedContentInner = styled.div`
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid rgba(0, 0, 0, 0.05);
`;

const NoDataContainer = styled.tr``;

const NoDataCell = styled.td`
  padding: 30px 20px;
  text-align: center;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  font-size: 0.9rem;
`;

const MobileTableContainer = styled.div`
  display: none;
  
  @media (max-width: 640px) {
    display: block;
  }
`;

const MobileTableWrapper = styled.div``;

const MobileTableRow = styled.div<{ $clickable?: boolean; $isExpanded?: boolean; $zebra?: boolean; $index: number }>`
  margin-bottom: 8px;
  border-radius: 8px;
  background-color: ${props => {
    if (props.$isExpanded) return 'rgba(106, 17, 203, 0.03)';
    if (props.$zebra && props.$index % 2 !== 0) return 'rgba(0, 0, 0, 0.01)';
    return 'white';
  }};
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: transform 0.2s ease;
  
  ${props => props.$clickable && `
    cursor: pointer;
    
    &:active {
      transform: scale(0.99);
    }
  `}
`;

const MobileRowHeader = styled.div<{ $isExpanded?: boolean }>`
  display: flex;
  padding: 14px;
  border-bottom: ${props => props.$isExpanded ? '1px solid rgba(0, 0, 0, 0.05)' : 'none'};
`;

const MobileRowTitle = styled.div`
  flex: 1;
  font-weight: 600;
  font-size: 0.95rem;
`;

const MobileRowBody = styled.div`
  padding: 0 14px 14px 14px;
`;

const MobileRowItem = styled.div`
  padding: 8px 0;
  display: flex;
  flex-wrap: wrap;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  
  &:last-child {
    border-bottom: none;
  }
`;

const MobileRowLabel = styled.div`
  flex: 0 0 120px;
  font-size: 0.8rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
`;

const MobileRowValue = styled.div`
  flex: 1;
  font-size: 0.85rem;
`;

const LoadingOverlay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  font-size: 0.9rem;
`;

const DesktopTable = styled.div`
  @media (max-width: 640px) {
    display: none;
  }
`;

const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  columns,
  data,
  className,
  noDataMessage = "No data available",
  rowKeyField = 'id',
  isLoading = false,
  onRowClick,
  expandableContent,
  initialSortBy,
  stickyHeader = false,
  zebra = true
}) => {
  const [tableState, setTableState] = useState<TableState>({
    sortBy: initialSortBy ? { id: initialSortBy.id, direction: initialSortBy.desc ? 'desc' : 'asc' } : null,
    expandedRows: new Set(),
  });
  
  // Sort data if sortBy is set
  const sortedData = React.useMemo(() => {
    if (!tableState.sortBy) return data;
    
    return [...data].sort((a, b) => {
      const column = columns.find(col => col.id === tableState.sortBy!.id);
      if (!column) return 0;
      // Get the values to compare
      const aValue = a[tableState.sortBy!.id];
      const bValue = b[tableState.sortBy!.id];
      
      // Compare based on type
      if (aValue === bValue) return 0;
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (typeof aValue === 'string') {
        const result = aValue.localeCompare(bValue);
        return tableState.sortBy!.direction === 'asc' ? result : -result;
      } else {
        const result = aValue < bValue ? -1 : 1;
        return tableState.sortBy!.direction === 'asc' ? result : -result;
      }
    });
  }, [data, tableState.sortBy, columns]);
  
  const handleSort = (columnId: string) => {
    setTableState(prevState => {
      if (!prevState.sortBy || prevState.sortBy.id !== columnId) {
        return {
          ...prevState,
          sortBy: { id: columnId, direction: 'asc' }
        };
      } else {
        const nextDir = prevState.sortBy.direction === 'asc' ? 'desc' : 
                       (prevState.sortBy.direction === 'desc' ? 'none' : 'asc');
                       
        return {
          ...prevState,
          sortBy: nextDir === 'none' ? null : { id: columnId, direction: nextDir }
        };
      }
    });
  };
  
  const toggleRowExpanded = (rowKey: string | number) => {
    setTableState(prevState => {
      const newExpandedRows = new Set(prevState.expandedRows);
      
      if (newExpandedRows.has(rowKey)) {
        newExpandedRows.delete(rowKey);
      } else {
        newExpandedRows.add(rowKey);
      }
      
      return {
        ...prevState,
        expandedRows: newExpandedRows
      };
    });
  };
  
  const renderSortIcon = (columnId: string) => {
    if (!tableState.sortBy || tableState.sortBy.id !== columnId) {
      return <FaSort size={12} />;
    }
    
    return tableState.sortBy.direction === 'asc' 
      ? <FaSortUp size={12} /> 
      : <FaSortDown size={12} />;
  };
  
  // For mobile view, determine the main column to use as title
  const mobileTitleColumn = columns.find(col => col.priority === 1) || columns[0];
  
  // Filter visible columns for mobile based on priority
  const visibleMobileColumns = columns.filter(col => col.id !== mobileTitleColumn.id && col.priority !== 0);
  
  if (isLoading) {
    return (
      <TableContainer className={className}>
        <LoadingOverlay>Loading data...</LoadingOverlay>
      </TableContainer>
    );
  }
  
  return (
    <TableContainer className={className}>
      <DesktopTable>
        <StyledTable $stickyHeader={stickyHeader}>
          <TableHead>
            <TableHeaderRow>
              {expandableContent && (
                <TableHeaderCell $width="40px" />
              )}
              {columns.map((column) => (
                <TableHeaderCell
                  key={column.id}
                  $sortable={column.sortable}
                  onClick={() => column.sortable && handleSort(column.id)}
                  $align={column.align}
                  $width={column.width}
                  $minWidth={column.minWidth}
                  $maxWidth={column.maxWidth}
                >
                  <HeaderContent>
                    {column.header}
                    {column.sortable && (
                      <SortIcon>
                        {renderSortIcon(column.id)}
                      </SortIcon>
                    )}
                  </HeaderContent>
                </TableHeaderCell>
              ))}
            </TableHeaderRow>
          </TableHead>
          <TableBody>
            {sortedData.length > 0 ? (
              sortedData.map((row, index) => {
                const rowKey = row[rowKeyField] || index;
                const isExpanded = expandableContent && tableState.expandedRows.has(rowKey);
                
                return (
                  <React.Fragment key={rowKey}>
                    <TableRow 
                      $clickable={!!onRowClick} 
                      onClick={() => onRowClick && onRowClick(row)}
                      $isExpanded={isExpanded}
                      $zebra={zebra}
                      $index={index}
                    >
                      {expandableContent && (
                        <TableCell>
                          <ExpandButton
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRowExpanded(rowKey);
                            }}
                          >
                            {isExpanded ? <FaChevronDown size={14} /> : <FaChevronRight size={14} />}
                          </ExpandButton>
                        </TableCell>
                      )}
                      {columns.map((column) => (
                        <TableCell 
                          key={`${rowKey}-${column.id}`} 
                          $align={column.align}
                        >
                          {column.accessor(row, index)}
                        </TableCell>
                      ))}
                    </TableRow>
                    {expandableContent && isExpanded && (
                      <ExpandedContent>
                        <ExpandedCell colSpan={columns.length + 1}>
                          <ExpandedContentInner>
                            {expandableContent(row)}
                          </ExpandedContentInner>
                        </ExpandedCell>
                      </ExpandedContent>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <NoDataContainer>
                <NoDataCell colSpan={columns.length + (expandableContent ? 1 : 0)}>
                  {noDataMessage}
                </NoDataCell>
              </NoDataContainer>
            )}
          </TableBody>
        </StyledTable>
      </DesktopTable>
      
      {/* Mobile Version */}
      <MobileTableContainer>
        <MobileTableWrapper>
          {sortedData.length > 0 ? (
            sortedData.map((row, index) => {
              const rowKey = row[rowKeyField] || index;
              const isExpanded = expandableContent && tableState.expandedRows.has(rowKey);
              
              return (
                <MobileTableRow 
                  key={rowKey}
                  $clickable={!!onRowClick} 
                  onClick={() => onRowClick && onRowClick(row)}
                  $isExpanded={isExpanded}
                  $zebra={zebra}
                  $index={index}
                >
                  <MobileRowHeader 
                    $isExpanded={isExpanded || visibleMobileColumns.length > 0}
                    onClick={(e) => {
                      if (expandableContent) {
                        e.stopPropagation();
                        toggleRowExpanded(rowKey);
                      }
                    }}
                  >
                    <MobileRowTitle>
                      {mobileTitleColumn.accessor(row, index)}
                    </MobileRowTitle>
                    {expandableContent && (
                      <ExpandButton>
                        {isExpanded ? <FaChevronDown size={14} /> : <FaChevronRight size={14} />}
                      </ExpandButton>
                    )}
                  </MobileRowHeader>
                  
                  {(isExpanded || visibleMobileColumns.length > 0) && (
                    <MobileRowBody>
                      {visibleMobileColumns.map(column => (
                        <MobileRowItem key={`${rowKey}-${column.id}`}>
                          <MobileRowLabel>
                            {column.mobileLabel || column.header}
                          </MobileRowLabel>
                          <MobileRowValue>
                            {column.accessor(row, index)}
                          </MobileRowValue>
                        </MobileRowItem>
                      ))}
                      
                      {expandableContent && isExpanded && (
                        <ExpandedContentInner>
                          {expandableContent(row)}
                        </ExpandedContentInner>
                      )}
                    </MobileRowBody>
                  )}
                </MobileTableRow>
              );
            })
          ) : (
            <NoDataContainer>
              <NoDataCell>
                {noDataMessage}
              </NoDataCell>
            </NoDataContainer>
          )}
        </MobileTableWrapper>
      </MobileTableContainer>
    </TableContainer>
  );
};

export default ResponsiveTable; 