'use client';

import React, { ReactNode } from 'react';
import DashboardLayout from './DashboardLayout';
import { FaHome, FaTicketAlt, FaChartLine } from 'react-icons/fa';

// Define the menu items specific to creator dashboard
const creatorMenuItems = [
  {
    id: 'home',
    label: 'Início',
    path: '/dashboard/criador',
    icon: <FaHome />
  },
  {
    id: 'minhas-rifas',
    label: 'Minhas Rifas',
    path: '/dashboard/criador/minhas-rifas',
    icon: <FaTicketAlt />
  },
  {
    id: 'nova-rifa',
    label: 'Nova Rifa',
    path: '/dashboard/criador/nova-rifa',
    icon: <FaTicketAlt />
  },
  {
    id: 'vendas',
    label: 'Vendas',
    path: '/dashboard/criador/vendas',
    icon: <FaChartLine />
  },
  // {
  //   id: 'premios',
  //   label: 'Prêmios',
  //   disabled: true,
  //   path: '/dashboard/criador/premios',
  //   icon: <FaChartLine />,
  // }

];

interface CreatorDashboardProps {
  children: ReactNode;
  additionalMenuItems?: Array<{
    id: string;
    label: string;
    path: string;
    icon: React.ReactNode;
    subMenuItems?: Array<{
      id: string;
      label: string;
      path: string;
      icon?: React.ReactNode;
    }>;
  }>;
}

const CreatorDashboard: React.FC<CreatorDashboardProps> = ({ children, additionalMenuItems = [] }) => {
  // Combine default items with any additional items provided by the parent
  const allMenuItems = [...creatorMenuItems, ...additionalMenuItems];
  
  return (
    <DashboardLayout 
      menuItems={allMenuItems} 
      dashboardTitle="Painel do Criador"
    >
      {children}
    </DashboardLayout>
  );
};

export default CreatorDashboard; 