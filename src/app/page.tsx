import React from 'react';
import Layout from '../components/layout/Layout';
import Hero from '../components/home/Hero';
import FeaturedCampaigns from '../components/home/FeaturedCampaigns';
import HowItWorks from '../components/home/HowItWorks';
import LatestWinners from '../components/home/LatestWinners';
import { CampaignStatusEnum, ICampaign } from '@/models/interfaces/ICampaignInterfaces';

// Sample data - in a real app, this would be fetched from an API
const sampleRifas = [
  {
    _id: '1',
    title: 'EDIÇÃO 58 - MERCEDES-AMG C 63 S E PERFORMANCE F1 EDITION BRB 0KM',
    description: 'Concorra a esse incrível Mercedes-AMG C 63 S E PERFORMANCE F1 EDITION BRB 0KM. Um dos carros mais desejados do momento, com potência impressionante e design espetacular.',
    price: 1.00, // R$1,00 por número
    createdBy: null,
    canceled: false,
    scheduledActivationDate: null,
    winner: [],
    activatedAt: null,
    prizes:[  
      {
        _id: '1',
        name: 'MERCEDES-AMG C 63 S E PERFORMANCE F1 EDITION BRB 0KM',
        description: 'Concorra a esse incrível Mercedes-AMG C 63 S E PERFORMANCE F1 EDITION BRB 0KM. Um dos carros mais desejados do momento, com potência impressionante e design espetacular.',
        value: 'R$ 500.000,00',
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
      }
    ],
    totalNumbers: 1000000, // 1 milhão de números
    winnerNumber: 251760,
    winnerUser: null,
    numberPackages: [],
    drawDate: new Date('2023-12-20'),
    status: CampaignStatusEnum.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
    regulation: `O RIFA APP é um Título de Capitalização da Modalidade Filantropia Premiável, de pagamento único, emitido pela CAPITALIZAÇÃO S.A., Sociedade de Capitalização inscrita no CNPJ sob o Número XX.XXX.XXX/0001-XX. A contratação deste título é apropriada principalmente na hipótese de o consumidor estar interessado em contribuir com entidades beneficentes de assistência sociais, certificadas nos termos da legislação vigente, e participar de sorteio(s). Cada título custa R$ 1,00 e o valor mínimo de compra é R$ 12,00.`,
    campaignCode: 'RA1234/58',
  }
];

export default function Home() {
  return (
    <Layout>
      <Hero />
      <FeaturedCampaigns campaigns={sampleRifas} />
      <HowItWorks />
      <LatestWinners />
    </Layout>
  );
}
