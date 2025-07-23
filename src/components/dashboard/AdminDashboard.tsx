'use client';

import React, { ReactNode } from 'react';
import { FaCreditCard, FaHome, FaMoneyBillAlt, FaUser, FaUsers } from 'react-icons/fa';
import DashboardAdminLayout from './DashboardAdminLayout';
import { AdminPermissionsEnum } from '@/models/interfaces/IUserInterfaces';

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
        icon: <FaUsers />,
        permissions: [AdminPermissionsEnum.USER_MANAGEMENT]
    },
    {
        id: 'criadores',
        label: 'Criadores',
        path: '/dashboard/admin/criadores',
        icon: <FaUser />,
        permissions: [AdminPermissionsEnum.USER_MANAGEMENT]
    },
    {
        id: 'admin-pagamentos',
        label: 'Pagamentos',
        icon: <FaCreditCard />,
        subMenuItems: [
          {
            id: 'admin-pagamentos-gateways',
            label: 'Gateways',
            path: '/dashboard/admin/pagamentos/gateways',
            icon: <FaMoneyBillAlt />,
            permissions: [AdminPermissionsEnum.GATEWAY_MANAGEMENT]
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
    <DashboardAdminLayout 
      menuItems={allMenuItems} 
      dashboardTitle="Painel do Administrador"
      showComposeButton={false}
    >
      {children}
    </DashboardAdminLayout>
  );
};

export default AdminDashboard; 