'use client';

import React from 'react';
import Layout from '../components/layout/Layout';
import { SuccessPageComponent } from '../components/ui/SuccessPage';

const mockData = {
  campaignTitle: "Sorteio iPhone 15 Pro Max 256GB",
  quantity: 10,
  totalPrice: 250.00,
  isCombo: true,
  comboName: "Combo Especial 10 Números",
  userName: "João Silva"
};

export default function SuccessTestPage() {
  return (
    <Layout hideHeader={false} hideFooter={false}>
      <SuccessPageComponent data={mockData} />
    </Layout>
  );
} 