'use client';

import React, { ReactNode } from 'react';
import DashboardLayout from './DashboardLayout';
import { FaHome, FaTicketAlt, FaClipboardList, FaTrophy } from 'react-icons/fa';

// Define the menu items specific to participant dashboard
const participantMenuItems = [
  {
    id: 'home',
    label: 'Início',
    path: '/dashboard/participante',
    icon: <FaHome />
  },
  {
    id: 'rifas',
    label: 'Rifas Disponíveis',
    path: '/dashboard/participante/rifas',
    icon: <FaTicketAlt />
  },
  {
    id: 'minhas-rifas',
    label: 'Minhas Rifas',
    path:'',
    icon: <FaClipboardList />,
    subMenuItems: [
      {
        id: 'minhas-rifas-compradas',
        label: 'Compradas',
        path: '/dashboard/participante/minhas-rifas/compradas',
        icon: <FaTicketAlt /> 
      }
    ]
  },
  {
    id: 'premios',
    label: 'Prêmios',
    path: '/dashboard/participante/premios',
    icon: <FaTrophy />
  }
];

interface ParticipantDashboardProps {
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

const ParticipantDashboard: React.FC<ParticipantDashboardProps> = ({ children, additionalMenuItems = [] }) => {
  // Combine default items with any additional items provided by the parent
  const allMenuItems = [...participantMenuItems, ...additionalMenuItems];
  
  return (
    <DashboardLayout 
      menuItems={allMenuItems} 
      dashboardTitle="Painel do Participante"
    >
      {children}
    </DashboardLayout>
  );
};

export default ParticipantDashboard; 