'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaUser, FaEnvelope, FaPhone, FaBuilding, FaIdCard, FaMapMarkerAlt, FaCity, FaGlobe, FaLock } from 'react-icons/fa';
import InputWithIcon from '../../components/common/InputWithIcon';
import Button from '../../components/common/Button';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f9fa;
`;

const ContentContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
  
  @media (min-width: 768px) {
    padding: 4rem 2rem;
  }
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 800px;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  
  @media (min-width: 768px) {
    padding: 3rem;
  }
`;

const FormHeader = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

const PageTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.75rem;
  
  @media (min-width: 768px) {
    font-size: 2.2rem;
  }
`;

const PageSubtitle = styled.p`
  font-size: 1rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
  
  @media (min-width: 768px) {
    font-size: 1.1rem;
  }
`;

const FormSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e4e4e7;
`;

const InputGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const FullWidthInput = styled.div`
  grid-column: 1 / -1;
`;

const FormActions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2rem;
  gap: 1rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
  }
`;

const BackLink = styled(Link)`
  color: #666;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    color: #6a11cb;
  }
`;

const RegistrationPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    cnpj: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    password: '',
    confirmPassword: '',
  });
  
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    cnpj: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    password: '',
    confirmPassword: '',
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simples validação
    const errors = { ...formErrors };
    let hasError = false;
    
    // Validar campos obrigatórios
    Object.keys(formData).forEach(key => {
      if (!formData[key as keyof typeof formData]) {
        errors[key as keyof typeof formErrors] = 'Este campo é obrigatório';
        hasError = true;
      } else {
        errors[key as keyof typeof formErrors] = '';
      }
    });
    
    // Validar email
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido';
      hasError = true;
    }
    
    // Validar senha
    if (formData.password && formData.password.length < 8) {
      errors.password = 'A senha deve ter pelo menos 8 caracteres';
      hasError = true;
    }
    
    // Validar confirmação de senha
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'As senhas não coincidem';
      hasError = true;
    }
    
    setFormErrors(errors);
    
    if (!hasError) {
      // Enviar dados para API
      console.log('Dados do formulário:', formData);
      
      // Simular redirecionamento após cadastro
      setTimeout(() => {
        router.push('/cadastro-sucesso');
      }, 1000);
    }
  };
  
  return (
    <PageContainer>
      <ContentContainer>
        <FormContainer>
          <FormHeader>
            <PageTitle>Cadastro de Criador</PageTitle>
            <PageSubtitle>
              Preencha os campos abaixo para se cadastrar como criador de campanhas e começar a criar suas próprias rifas.
            </PageSubtitle>
          </FormHeader>
          
          <form onSubmit={handleSubmit}>
            <FormSection>
              <SectionTitle>Informações Pessoais</SectionTitle>
              <InputGrid>
                <InputWithIcon
                  id="name"
                  name="name"
                  label="Nome Completo"
                  icon={<FaUser />}
                  placeholder="Digite seu nome completo"
                  value={formData.name}
                  onChange={handleChange}
                  error={formErrors.name}
                  required
                />
                
                <InputWithIcon
                  id="email"
                  name="email"
                  label="Email"
                  icon={<FaEnvelope />}
                  placeholder="Digite seu email"
                  value={formData.email}
                  onChange={handleChange}
                  error={formErrors.email}
                  required
                />
                
                <InputWithIcon
                  id="phone"
                  name="phone"
                  label="Telefone"
                  icon={<FaPhone />}
                  placeholder="Digite seu telefone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={formErrors.phone}
                  required
                />
              </InputGrid>
            </FormSection>
            
            <FormSection>
              <SectionTitle>Informações da Empresa/Negócio</SectionTitle>
              <InputGrid>
                <InputWithIcon
                  id="companyName"
                  name="companyName"
                  label="Nome da Empresa"
                  icon={<FaBuilding />}
                  placeholder="Digite o nome da sua empresa"
                  value={formData.companyName}
                  onChange={handleChange}
                  error={formErrors.companyName}
                  required
                />
                
                <InputWithIcon
                  id="cnpj"
                  name="cnpj"
                  label="CNPJ"
                  icon={<FaIdCard />}
                  placeholder="Digite o CNPJ da empresa"
                  value={formData.cnpj}
                  onChange={handleChange}
                  error={formErrors.cnpj}
                  required
                />
                
                <InputWithIcon
                  id="address"
                  name="address"
                  label="Endereço"
                  icon={<FaMapMarkerAlt />}
                  placeholder="Digite o endereço completo"
                  value={formData.address}
                  onChange={handleChange}
                  error={formErrors.address}
                  required
                />
                
                <InputWithIcon
                  id="city"
                  name="city"
                  label="Cidade"
                  icon={<FaCity />}
                  placeholder="Digite sua cidade"
                  value={formData.city}
                  onChange={handleChange}
                  error={formErrors.city}
                  required
                />
                
                <InputWithIcon
                  id="state"
                  name="state"
                  label="Estado"
                  icon={<FaGlobe />}
                  placeholder="Digite seu estado"
                  value={formData.state}
                  onChange={handleChange}
                  error={formErrors.state}
                  required
                />
                
                <InputWithIcon
                  id="zipCode"
                  name="zipCode"
                  label="CEP"
                  icon={<FaMapMarkerAlt />}
                  placeholder="Digite seu CEP"
                  value={formData.zipCode}
                  onChange={handleChange}
                  error={formErrors.zipCode}
                  required
                />
              </InputGrid>
            </FormSection>
            
            <FormSection>
              <SectionTitle>Senha de Acesso</SectionTitle>
              <InputGrid>
                <InputWithIcon
                  id="password"
                  name="password"
                  label="Senha"
                  icon={<FaLock />}
                  placeholder="Digite sua senha"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={formErrors.password}
                  required
                />
                
                <InputWithIcon
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirme a Senha"
                  icon={<FaLock />}
                  placeholder="Confirme sua senha"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={formErrors.confirmPassword}
                  required
                />
              </InputGrid>
            </FormSection>
            
            <FormActions>
              <BackLink href="/cadastro-tipo">
                ← Voltar
              </BackLink>
              
              <Button type="submit" $primary $size="lg">
                Cadastrar como Criador
              </Button>
            </FormActions>
          </form>
        </FormContainer>
      </ContentContainer>
    </PageContainer>
  );
};

export default RegistrationPage; 