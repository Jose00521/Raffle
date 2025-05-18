'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { SocketProvider } from '@/lib/socket/socketContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout para a área de dashboard protegida
 * Verifica autenticação e fornece o contexto do Socket.io para as páginas
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session, status } = useSession();

  // Verificar autenticação
  if (status === 'loading') {
    return <div>Carregando...</div>;
  }

  if (status === 'unauthenticated') {
    redirect('/login?callbackUrl=/dashboard');
  }

  return (
    <SocketProvider namespace="/stats">
      <div className="dashboard-container">
        {/* Cabeçalho do Dashboard */}
        <header className="dashboard-header">
          <div className="logo">RifaApp</div>
          <div className="user-info">
            <span>Olá, {session?.user?.name}</span>
          </div>
        </header>

        <div className="dashboard-content">
          {/* Barra lateral com navegação */}
          <aside className="dashboard-sidebar">
            <nav>
              <ul>
                <li>
                  <a href="/dashboard">Painel</a>
                </li>
                {/* Mostrar links específicos com base no papel do usuário */}
                {session?.user?.role === 'creator' && (
                  <>
                    <li>
                      <a href="/dashboard/criador/campanhas">Minhas Campanhas</a>
                    </li>
                    <li>
                      <a href="/dashboard/criador/estatisticas">Estatísticas</a>
                    </li>
                  </>
                )}
                {session?.user?.role === 'participant' && (
                  <>
                    <li>
                      <a href="/dashboard/participante/meus-numeros">Meus Números</a>
                    </li>
                    <li>
                      <a href="/dashboard/participante/estatisticas">Minhas Participações</a>
                    </li>
                  </>
                )}
                {session?.user?.role === 'admin' && (
                  <>
                    <li>
                      <a href="/dashboard/admin/usuarios">Usuários</a>
                    </li>
                    <li>
                      <a href="/dashboard/admin/campanhas">Todas Campanhas</a>
                    </li>
                  </>
                )}
                <li>
                  <a href="/api/auth/signout">Sair</a>
                </li>
              </ul>
            </nav>
          </aside>

          {/* Conteúdo principal */}
          <main className="dashboard-main">{children}</main>
        </div>
      </div>
    </SocketProvider>
  );
} 