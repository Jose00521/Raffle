'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Layout from '../../../../components/layout/Layout';
import CampanhaDetalhes from '@/components/campaign/CampanhaDetalhes';
import { ICampaign } from '../../../../models/Campaign';
import { IUser } from '@/models/User';

// Dados de exemplo para a campanha
const campanhaExemplo: ICampaign = {
  _id: '1',
  title: 'EDIÇÃO 58 - MERCEDES-AMG C 63 S E PERFORMANCE F1 EDITION BRB 0KM',
  description: 'Concorra a esse incrível Mercedes-AMG C 63 S E PERFORMANCE F1 EDITION BRB 0KM. Um dos carros mais desejados do momento, com potência impressionante e design espetacular.',
  price: 1.00, // R$1,00 por número
  image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1650&q=80',
  images:[
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1650&q=80',
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1650&q=80',
    'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1464&q=80',
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1650&q=80',
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1650&q=80',
    'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1464&q=80',
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1650&q=80',
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1650&q=80',
    'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1464&q=80',
  ],
  totalNumbers: 1000000, // 1 milhão de números
  winnerNumber: 251760,
  winnerUser: null,
  drawDate: new Date('2023-12-20'),
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  // Propriedades adicionais para a página de detalhes
  instantPrizes: [
    { number: '0251760', value: 500, winner: null },
    { number: '0978728', value: 500, winner: null },
    { number: '0055966', value: 500, winner: null },
    { number: '0358092', value: 500, winner: null },
    { number: '0411161', value: 500, winner: null },
    { number: '0524875', value: 500, winner: null },
    { number: '0678935', value: 500, winner: null },
    { number: '0742981', value: 500, winner: null },
    { number: '0876523', value: 500, winner: null },
    { number: '0912345', value: 500, winner: null },
  ],
  regulation: `O RIFA APP é um Título de Capitalização da Modalidade Filantropia Premiável, de pagamento único, emitido pela CAPITALIZAÇÃO S.A., Sociedade de Capitalização inscrita no CNPJ sob o Número XX.XXX.XXX/0001-XX. A contratação deste título é apropriada principalmente na hipótese de o consumidor estar interessado em contribuir com entidades beneficentes de assistência sociais, certificadas nos termos da legislação vigente, e participar de sorteio(s). Cada título custa R$ 1,00 e o valor mínimo de compra é R$ 12,00.`,
  campaignCode: 'RA1234/58',
  mainPrize: 'MERCEDES-AMG C 63 S E PERFORMANCE F1 EDITION BRB 0KM',
  valuePrize: 'R$ 500.000,00',
};

export default function CampanhaPage() {
  const params = useParams();
  const campanhaId = params.id as string;
  
  // Em uma aplicação real, aqui você buscaria os dados da campanha pelo ID
  // Esta é uma simulação com dados de exemplo
  const campanha = campanhaExemplo;
  
  return (
    <Layout hideHeader={true}>
      <CampanhaDetalhes campanha={campanha} />
    </Layout>
  );
} 