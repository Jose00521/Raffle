// src/app/admin/setup/[token]/page.tsx
'use client';

import adminAPIClient from '@/API/admin/adminAPIClient';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function AdminSetupPage() {
  const { token } = useParams();
  const router = useRouter();
  const [isValidToken, setIsValidToken] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      setLoading(true);
      const response = await adminAPIClient.validateInvite(token as string);
      if (!response.success) {
        router.push('/404');
        return;
      }
      setIsValidToken(true);
      setLoading(false);
    } catch (error) {
      router.push('/404');
    }
  };

  if (loading) return <div>Verificando acesso...</div>;
  if (!isValidToken) return null;

  return (
    <>
      <h1>Cadastro de Admin</h1>
      <p>Token: {token}</p>
      <p>isValidToken: {isValidToken.toString()}</p>
    </>
  );
}