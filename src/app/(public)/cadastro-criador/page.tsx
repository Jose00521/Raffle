'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaUser, FaEnvelope, FaPhone, FaBuilding, FaIdCard, FaMapMarkerAlt, FaCity, FaGlobe, FaLock } from 'react-icons/fa';

const PageContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ee 100%);
  padding: 2rem 1rem;
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  width: 100%;
`;

const Logo = styled.div`
  font-size: 1.8rem;
  font-weight: 800;
  color: #6a11cb;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LogoIcon = styled.div`
  background: linear-gradient(135deg, #6a11cb 0%, #8e44ad 100%);
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
`;

const BackLink = styled(Link)`
  color: #666;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(5px);
  
  &:hover {
    color: #6a11cb;
    background: rgba(255, 255, 255, 0.8);
  }
`;

const ContentContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FormContainer = styled.div`
  width: 100%;
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
  font-size: 2.2rem;
  color: #333;
  margin-bottom: 0.75rem;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const PageSubtitle = styled.p`
  font-size: 1.1rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
`;

const Form = styled.form`
  width: 100%;
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

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 0.5rem;
`;

const InputLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #666;
  font-size: 0.9rem;
`;

const InputContainer = styled.div`
  position: relative;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6a11cb;
  opacity: 0.7;
  z-index: 1;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.9rem 1rem 0.9rem 2.75rem;
  border-radius: 8px;
  border: 2px solid rgba(106, 17, 203, 0.1);
  font-size: 1rem;
  transition: all 0.2s ease;
  background-color: #f5f5f5;
  color: #333;
  
  &:focus {
    outline: none;
    background-color: white;
    border-color: #6a11cb;
    box-shadow: 0 0 0 3px rgba(106, 17, 203, 0.1);
  }
  
  &::placeholder {
    color: #a3a3a3;
    opacity: 0.7;
  }
`;

const ErrorText = styled.p`
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  margin-left: 0.5rem;
  font-weight: 500;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #6a11cb 0%, #8e44ad 100%);
  color: white;
  border: none;
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(106, 17, 203, 0.2);
  }
`;

export default function CadastroCriador() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    nomeEmpresa: '',
    cnpj: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    senha: '',
    confirmarSenha: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nome) newErrors.nome = "Nome é obrigatório";
    if (!formData.email) newErrors.email = "Email é obrigatório";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }
    
    if (!formData.telefone) newErrors.telefone = "Telefone é obrigatório";
    if (!formData.nomeEmpresa) newErrors.nomeEmpresa = "Nome da empresa é obrigatório";
    if (!formData.cnpj) newErrors.cnpj = "CNPJ é obrigatório";
    if (!formData.endereco) newErrors.endereco = "Endereço é obrigatório";
    if (!formData.cidade) newErrors.cidade = "Cidade é obrigatória";
    if (!formData.estado) newErrors.estado = "Estado é obrigatório";
    if (!formData.cep) newErrors.cep = "CEP é obrigatório";
    
    if (!formData.senha) newErrors.senha = "Senha é obrigatória";
    else if (formData.senha.length < 8) {
      newErrors.senha = "Senha deve ter pelo menos 8 caracteres";
    }
    
    if (!formData.confirmarSenha) newErrors.confirmarSenha = "Confirmação de senha é obrigatória";
    else if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = "As senhas não conferem";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      console.log("Dados do formulário:", formData);
      
      // Simulação de cadastro bem-sucedido
      setTimeout(() => {
        router.push('/cadastro-sucesso');
      }, 1000);
    }
  };
  
  return (
    <PageContainer>
      <ContentWrapper>
        <Header>
          <Logo>
            <LogoIcon>R</LogoIcon>
            Rifa.com
          </Logo>
          <BackLink href="/cadastro-tipo">
            ← Voltar
          </BackLink>
        </Header>
        
        <ContentContainer>
          <FormContainer>
            <FormHeader>
              <PageTitle>Cadastro de Criador</PageTitle>
              <PageSubtitle>
                Preencha os campos abaixo para se cadastrar como criador de campanhas 
                e começar a criar suas próprias rifas.
              </PageSubtitle>
            </FormHeader>
            
            <Form onSubmit={handleSubmit}>
              <FormSection>
                <SectionTitle>Informações Pessoais</SectionTitle>
                <InputGrid>
                  <FormGroup>
                    <InputLabel htmlFor="nome">Nome Completo*</InputLabel>
                    <InputContainer>
                      <InputIcon><FaUser /></InputIcon>
                      <Input
                        id="nome"
                        name="nome"
                        type="text"
                        placeholder="Digite seu nome completo"
                        value={formData.nome}
                        onChange={handleChange}
                      />
                    </InputContainer>
                    {errors.nome && <ErrorText>{errors.nome}</ErrorText>}
                  </FormGroup>
                  
                  <FormGroup>
                    <InputLabel htmlFor="email">Email*</InputLabel>
                    <InputContainer>
                      <InputIcon><FaEnvelope /></InputIcon>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Digite seu email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </InputContainer>
                    {errors.email && <ErrorText>{errors.email}</ErrorText>}
                  </FormGroup>
                  
                  <FormGroup>
                    <InputLabel htmlFor="telefone">Telefone*</InputLabel>
                    <InputContainer>
                      <InputIcon><FaPhone /></InputIcon>
                      <Input
                        id="telefone"
                        name="telefone"
                        type="text"
                        placeholder="(00) 00000-0000"
                        value={formData.telefone}
                        onChange={handleChange}
                      />
                    </InputContainer>
                    {errors.telefone && <ErrorText>{errors.telefone}</ErrorText>}
                  </FormGroup>
                </InputGrid>
              </FormSection>
              
              <FormSection>
                <SectionTitle>Informações da Empresa/Negócio</SectionTitle>
                <InputGrid>
                  <FormGroup>
                    <InputLabel htmlFor="nomeEmpresa">Nome da Empresa*</InputLabel>
                    <InputContainer>
                      <InputIcon><FaBuilding /></InputIcon>
                      <Input
                        id="nomeEmpresa"
                        name="nomeEmpresa"
                        type="text"
                        placeholder="Digite o nome da sua empresa"
                        value={formData.nomeEmpresa}
                        onChange={handleChange}
                      />
                    </InputContainer>
                    {errors.nomeEmpresa && <ErrorText>{errors.nomeEmpresa}</ErrorText>}
                  </FormGroup>
                  
                  <FormGroup>
                    <InputLabel htmlFor="cnpj">CNPJ*</InputLabel>
                    <InputContainer>
                      <InputIcon><FaIdCard /></InputIcon>
                      <Input
                        id="cnpj"
                        name="cnpj"
                        type="text"
                        placeholder="00.000.000/0000-00"
                        value={formData.cnpj}
                        onChange={handleChange}
                      />
                    </InputContainer>
                    {errors.cnpj && <ErrorText>{errors.cnpj}</ErrorText>}
                  </FormGroup>
                  
                  <FormGroup>
                    <InputLabel htmlFor="endereco">Endereço*</InputLabel>
                    <InputContainer>
                      <InputIcon><FaMapMarkerAlt /></InputIcon>
                      <Input
                        id="endereco"
                        name="endereco"
                        type="text"
                        placeholder="Digite o endereço completo"
                        value={formData.endereco}
                        onChange={handleChange}
                      />
                    </InputContainer>
                    {errors.endereco && <ErrorText>{errors.endereco}</ErrorText>}
                  </FormGroup>
                  
                  <FormGroup>
                    <InputLabel htmlFor="cidade">Cidade*</InputLabel>
                    <InputContainer>
                      <InputIcon><FaCity /></InputIcon>
                      <Input
                        id="cidade"
                        name="cidade"
                        type="text"
                        placeholder="Digite sua cidade"
                        value={formData.cidade}
                        onChange={handleChange}
                      />
                    </InputContainer>
                    {errors.cidade && <ErrorText>{errors.cidade}</ErrorText>}
                  </FormGroup>
                  
                  <FormGroup>
                    <InputLabel htmlFor="estado">Estado*</InputLabel>
                    <InputContainer>
                      <InputIcon><FaGlobe /></InputIcon>
                      <Input
                        id="estado"
                        name="estado"
                        type="text"
                        placeholder="Digite seu estado"
                        value={formData.estado}
                        onChange={handleChange}
                      />
                    </InputContainer>
                    {errors.estado && <ErrorText>{errors.estado}</ErrorText>}
                  </FormGroup>
                  
                  <FormGroup>
                    <InputLabel htmlFor="cep">CEP*</InputLabel>
                    <InputContainer>
                      <InputIcon><FaMapMarkerAlt /></InputIcon>
                      <Input
                        id="cep"
                        name="cep"
                        type="text"
                        placeholder="00000-000"
                        value={formData.cep}
                        onChange={handleChange}
                      />
                    </InputContainer>
                    {errors.cep && <ErrorText>{errors.cep}</ErrorText>}
                  </FormGroup>
                </InputGrid>
              </FormSection>
              
              <FormSection>
                <SectionTitle>Senha de Acesso</SectionTitle>
                <InputGrid>
                  <FormGroup>
                    <InputLabel htmlFor="senha">Senha*</InputLabel>
                    <InputContainer>
                      <InputIcon><FaLock /></InputIcon>
                      <Input
                        id="senha"
                        name="senha"
                        type="password"
                        placeholder="Digite sua senha"
                        value={formData.senha}
                        onChange={handleChange}
                      />
                    </InputContainer>
                    {errors.senha && <ErrorText>{errors.senha}</ErrorText>}
                  </FormGroup>
                  
                  <FormGroup>
                    <InputLabel htmlFor="confirmarSenha">Confirmar Senha*</InputLabel>
                    <InputContainer>
                      <InputIcon><FaLock /></InputIcon>
                      <Input
                        id="confirmarSenha"
                        name="confirmarSenha"
                        type="password"
                        placeholder="Confirme sua senha"
                        value={formData.confirmarSenha}
                        onChange={handleChange}
                      />
                    </InputContainer>
                    {errors.confirmarSenha && <ErrorText>{errors.confirmarSenha}</ErrorText>}
                  </FormGroup>
                </InputGrid>
              </FormSection>
              
              <FormActions>
                <SubmitButton type="submit">
                  Cadastrar como Criador
                </SubmitButton>
              </FormActions>
            </Form>
          </FormContainer>
        </ContentContainer>
      </ContentWrapper>
    </PageContainer>
  );
} 