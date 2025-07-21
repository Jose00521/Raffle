'use client';

import React from 'react';
import styled from 'styled-components';
import AdminLoginForm from '@/components/admin/AdminLoginForm';
import Head from 'next/head';

const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  padding: 1rem;
`;

const AdminLoginPage = () => {
  return (
    <PageContainer>
      <Head>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="googlebot" content="noindex, nofollow" />
        <meta name="referrer" content="no-referrer" />
        <title>Sistema Interno</title>
      </Head>
      <AdminLoginForm />
    </PageContainer>
  );
};

export default AdminLoginPage; 