'use client';
import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import Hero from '../components/home/Hero';
import FeaturedCampaigns from '../components/home/FeaturedCampaigns';
import HowItWorks from '../components/home/HowItWorks';
import LatestWinners from '../components/home/LatestWinners';
import { CampaignStatusEnum, ICampaign } from '@/models/interfaces/ICampaignInterfaces';
import participantCampaignAPI from '@/API/participant/participantCampaignAPIClient';

// Sample data - in a real app, this would be fetched from an API

export default function Home() {


  const [campanhas, setCampanhas] = useState<ICampaign[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchCampanhas = async () => {
      try {
        const response = await participantCampaignAPI.getActiveCampaignsPublic();
        console.log("data",response);
        setCampanhas(response.data as ICampaign[]);
      } catch (error) { 
        setCampanhas([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchCampanhas();
  }, []);


  return (
    <Layout>
      <Hero />
      <FeaturedCampaigns campaigns={campanhas} />
      <HowItWorks />
      <LatestWinners />
    </Layout>
  );
}
