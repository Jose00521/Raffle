'use client';

import React, { ReactNode } from 'react';
import DashboardLayout from './DashboardLayout';
import { FaHome, FaTicketAlt, FaChartLine ,FaTrophy, FaPlusCircle, FaUsers, FaMoneyBill, FaMoneyBillAlt, FaCreditCard} from 'react-icons/fa';

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
    icon: <FaUsers />
  },
    {
    id: 'premios',
    label: 'Prêmios',
    path: '/dashboard/criador/premios',
    icon: <FaTrophy />,
  },

  {
    id: 'pagamentos',
    label: 'Pagamentos',
    icon: <FaCreditCard />,
    subMenuItems: [
      {
        id: 'gateways',
        label: 'Gateways',
        path: '/dashboard/criador/pagamentos/gateways',
        icon: <FaMoneyBillAlt />
      }
    ]
  }

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
      showComposeButton={true}
    >
      {children}
    </DashboardLayout>
  );
};

export default CreatorDashboard; 