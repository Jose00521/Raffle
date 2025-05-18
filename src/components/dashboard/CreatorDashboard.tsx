'use client';

import React, { ReactNode } from 'react';
import DashboardLayout from './DashboardLayout';
import { FaHome, FaTicketAlt, FaChartLine ,FaTrophy, FaPlusCircle} from 'react-icons/fa';

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
    id: 'vendas',
    label: 'Vendas',
    path: '/dashboard/criador/vendas',
    icon: <FaChartLine />
  },
  {
    id: 'ganhadores',
    label: 'Ganhadores',
    path: '/dashboard/criador/ganhadores',
    icon: <FaTrophy />
  },
    {
    id: 'premios',
    label: 'Prêmios',
    path: '/dashboard/criador/premios',
    icon: <FaTrophy />,
  },
  {
    id: 'nova-rifa',
    label: 'Nova Rifa',
    path: '/dashboard/criador/nova-rifa',
    icon: <FaPlusCircle />
  },

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