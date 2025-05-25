import React from 'react';
import { TabGroup } from '@/components/ui/TabGroup';
import { IndividualForm } from '@/components/forms/IndividualForm';
import { CompanyForm } from '@/components/forms/CompanyForm';
import { CreatorInput } from '@/zod/creator.schema';

export default function RegisterPage() {
  const tabs = [
    { id: 'individual', label: 'Pessoa Física', icon: 'user' },
    { id: 'company', label: 'Pessoa Jurídica', icon: 'building' }
  ];

  const handleSubmit = async (data: CreatorInput) => {
    // Aqui implementaremos a lógica para enviar os dados para a API
    console.log('Dados do formulário:', data);
    
    try {
      // Exemplo de envio para uma API
      const response = await fetch('/api/creators', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao cadastrar usuário');
      }
      
      // Redirecionar para página de sucesso ou login
      window.location.href = '/cadastro/sucesso';
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      // Implementar tratamento de erro
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Cadastro de Criador</h1>
          <p className="text-gray-600 mt-2">
            Preencha o formulário abaixo para criar sua conta e começar a criar suas rifas
          </p>
        </div>
        
        <TabGroup tabs={tabs}>
          <TabGroup.Tab id="individual">
            <IndividualForm onSubmit={handleSubmit} />
          </TabGroup.Tab>
          
          <TabGroup.Tab id="company">
            <CompanyForm onSubmit={handleSubmit} />
          </TabGroup.Tab>
        </TabGroup>
      </div>
    </main>
  );
} 