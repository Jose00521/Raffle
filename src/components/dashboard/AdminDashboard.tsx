'use client';

import React, { ReactNode } from 'react';
import DashboardLayout from './DashboardLayout';
import { FaCreditCard, FaHome, FaMoneyBillAlt, FaUser, FaUsers } from 'react-icons/fa';

// Define the menu items specific to participant dashboard
const adminMenuItems = [
    {
        id: 'home',
        label: 'Início',
        path: '/dashboard/admin',
        icon: <FaHome />
    },
    {
        id: 'usuarios',
        label: 'Usuários',
        path: '/dashboard/admin/usuarios',
        icon: <FaUsers />
    },
    {
        id: 'criadores',
        label: 'Criadores',
        path: '/dashboard/admin/criadores',
        icon: <FaUser />
    },
    {
        id: 'pagamentos',
        label: 'Pagamentos',
        icon: <FaCreditCard />,
        subMenuItems: [
          {
            id: 'gateways',
            label: 'Gateways',
            path: '/dashboard/admin/pagamentos/gateways',
            icon: <FaMoneyBillAlt />
          }
        ]
      }
];

interface AdminDashboardProps {
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

const AdminDashboard: React.FC<AdminDashboardProps> = ({ children, additionalMenuItems = [] }) => {
  // Combine default items with any additional items provided by the parent
  const allMenuItems = [...adminMenuItems, ...additionalMenuItems];
  
  return (
    <DashboardLayout 
      menuItems={allMenuItems} 
      dashboardTitle="Painel do Administrador"
      showComposeButton={false}
    >
      {children}
    </DashboardLayout>
  );
};

export default AdminDashboard; 