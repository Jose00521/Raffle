'use client';

import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { FaTicketAlt, FaSearch, FaUser, FaTrophy, FaCalendarCheck, FaShieldAlt, FaTimes, FaCopy, FaEye, FaEyeSlash, FaCheckCircle, FaClock, FaMoneyBill } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import FormInput from '../common/FormInput';
import { useHookFormMask } from 'use-mask-input';
import { toast } from 'react-toastify';
import { formatCurrency } from '@/utils/formatNumber';
import { CertificationSectionCompact } from '../ui/CertificationSection';
import Modal from '../ui/Modal';
import Image from 'next/image';

// Schema de validação para o CPF
import { MyNumbersFormData, myNumbersSchema } from '@/zod/mynumbers.schema';
import { ICampaign } from '@/models/interfaces/ICampaignInterfaces';
import participantCampaignAPI from '@/API/participant/participantCampaignAPIClient';
import { IPayment, PaymentStatusEnum } from '@/models/interfaces/IPaymentInterfaces';
import { IUser } from '@/models/interfaces/IUserInterfaces';

interface MeusNumerosModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignCode?: string;
  campaign?: ICampaign;
}

// Dados mockados para demonstração
const mockUserNumbers = [
{
    purchases: [
      {
        id: 1,
        campaignCode: 'RIFA2024001',
        campaignTitle: 'Porsche Panamera',

        numbers: ['001234', '001235', '001236', '001237', '001238'],

        status: 'confirmed',
        paymentMethod: 'PIX'
      },
    ]
  }
];

const MeusNumerosModal: React.FC<MeusNumerosModalProps> = ({ isOpen, onClose, campaignCode, campaign }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<{
    user: Partial<IUser>;
    campaign: Partial<ICampaign>;
    paymentCurrentCampaign: Partial<IPayment>[];
    otherPayments: Partial<IPayment>[];
  } | null>(null);
  const [showNumbers, setShowNumbers] = useState<{ [key: number]: boolean }>({});

  const { register, handleSubmit, formState: { errors, isValid }, setError, watch } = useForm<MyNumbersFormData>({
    resolver: zodResolver(myNumbersSchema),
    mode: 'all',
    shouldFocusError: true,
    defaultValues: {
      cpf: ''
    }
  });

  const registerWithMask = useHookFormMask(register);

  // Consultar números pelo CPF
  const onSubmit = async (data: MyNumbersFormData) => {
    setIsLoading(true);
    
    try {
      const result = await participantCampaignAPI.getMyNumbers(data.cpf, campaignCode || '');

      console.log('result', result);
      
      if (result.success) {
        setUserData(result.data);
      } else {
        setError('cpf', { message: result.message });
        setUserData(null);
      }
    } catch (error) {
      toast.error('Erro ao consultar números. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Copiar número para clipboard
  const copyNumber = (number: string) => {
    navigator.clipboard.writeText(number);
  };

  // Alternar visualização dos números
  const toggleShowNumbers = (purchaseId: number) => {
    setShowNumbers(prev => ({
      ...prev,
      [purchaseId]: !prev[purchaseId]
    }));
  };

  // Resetar dados ao fechar
  const handleClose = () => {
    setUserData(null);
    setShowNumbers({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="650px">
      <ModalContent>
        <CloseButton onClick={handleClose}>
          <FaTimes />
        </CloseButton>
        
        <ModalHeader>
          <HeaderContent>
            <ModalLogo>
              <FaTicketAlt />
            </ModalLogo>
            <HeaderText>
              <ModalTitle>Meus Números</ModalTitle>
              <ModalSubtitle>
                {!userData ? 'Digite seu CPF para consultar seus números' : `Olá, ${userData.user.name}!`}
              </ModalSubtitle>
            </HeaderText>
          </HeaderContent>
        </ModalHeader>

        {!userData ? (
          <FormContainer onSubmit={handleSubmit(onSubmit)}>
            <SearchSection>
              <FormInput
                id="cpf"
                icon={<FaUser />}
                label="CPF"
                placeholder="000.000.000-00"
                error={errors.cpf?.message}
                {...registerWithMask('cpf', ['999.999.999-99'], {
                  required: 'CPF é obrigatório'
                })}
              />
            </SearchSection>

            <SearchButton type="submit" disabled={isLoading || !isValid}>
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  <span>Consultando...</span>
                </>
              ) : (
                <>
                  <FaSearch />
                  <span>Consultar Números</span>
                </>
              )}
            </SearchButton>

            <SecurityInfo>
              <FaShieldAlt />
              Seus dados são protegidos e não serão compartilhados
            </SecurityInfo>
            <SecurityFooter>
              <SecurityText>
                <span><FaShieldAlt />Proteção Nível Militar: Seus dados são guardados com criptografia AES-512 - o mesmo padrão usado por bancos e governos para máxima segurança</span>
              </SecurityText>
              
              <TrustLogos>
                <LogoItem>
                  <Image 
                    src="/icons/loterias-caixa-logo.svg" 
                    alt="Loteria Federal" 
                    width={80} 
                    height={80}
                    className="logo-image"
                  />
                </LogoItem>
                
                <LogoItem>
                  <Image 
                    src="/icons/pix-banco-central.svg" 
                    alt="PIX Banco Central" 
                    width={80} 
                    height={80}
                    className="logo-image"
                  />
                </LogoItem>
              </TrustLogos>
            </SecurityFooter>
          </FormContainer>
        ) : (
          <ResultsContainer>
            {/* Compras da campanha atual */}
            {userData.paymentCurrentCampaign && userData.paymentCurrentCampaign.length > 0 && (
              <>
                <PurchasesTitle>
                  <FaTrophy /> Compras nesta campanha
                </PurchasesTitle>
                <PurchasesList>
                  {userData.paymentCurrentCampaign.map((purchase) => (
                    <PurchaseCard key={purchase.paymentCode}>
                      <PurchaseHeader>
                        <PurchaseInfo>
                        <CampaignImageContainer>
                          {userData.campaign.coverImage ? (
                        <CampaignImage 
                          src={userData.campaign.coverImage as string} 
                          alt={userData.campaign.title || 'Campanha'} 
                        />
                      ) : (
                        <CampaignImagePlaceholder>
                          <i className="fas fa-image" />
                        </CampaignImagePlaceholder>
                      )}
                          </CampaignImageContainer>
                          <CampaignInfo>
                            <CampaignTitle>{userData.campaign.title}</CampaignTitle>
                            <PurchaseDetails>
                              {purchase.purchaseAt && (
                                <DetailItem>
                                  <FaCalendarCheck />
                                  <span>Data:</span> {new Date(purchase.purchaseAt).toLocaleDateString('pt-BR')}
                                </DetailItem>
                              )}
                              {purchase.amount && (
                                <DetailItem>
                                  <FaTicketAlt />
                                  <span>Valor:</span> {formatCurrency(purchase.amount)}
                                </DetailItem>
                              )}
                              {purchase.paymentMethod && (
                                <DetailItem>
                                  <FaMoneyBill />
                                  <span>Pagamento:</span> {purchase.paymentMethod}
                                </DetailItem>
                              )}
                              {purchase.numbersQuantity && (
                                <DetailItem>
                                  <FaTicketAlt />
                                  <span>Quantidade:</span> {purchase.numbersQuantity} números
                                </DetailItem>
                              )}
                            </PurchaseDetails>
                          </CampaignInfo>
                        </PurchaseInfo>
                        <PurchaseStatus $status={purchase.status || ''}>
                          {purchase.status === PaymentStatusEnum.APPROVED ? (
                            <>
                              <FaCheckCircle /> Confirmado
                            </>
                          ) : (
                            <>
                              <FaClock /> Pendente
                            </>
                          )}
                        </PurchaseStatus>
                      </PurchaseHeader>

                      <NumbersSection>
                        {/* <NumbersHeader>
                          <NumbersCount>
                            {purchase.numbersQuantity} números adquiridos
                          </NumbersCount>
                          <ToggleButton 
                            onClick={() => toggleShowNumbers(purchase.paymentCode)}
                            $visible={true}
                          >
                            {showNumbers[purchase.paymentCode] ? <FaEyeSlash /> : <FaEye />}
                            {showNumbers[purchase.paymentCode] ? 'Ocultar' : 'Mostrar'}
                          </ToggleButton>
                        </NumbersHeader> */}
                        
                        {/* {showNumbers[purchase.paymentCode] && (
                          <NumbersGrid $hasMoreNumbers={purchase.numbersQuantity> 30}>
                            {purchase.numbers.map((number: string, index: number) => (
                              <NumberChip 
                                key={index}
                                onClick={() => copyNumber(number)}
                                title="Clique para copiar"
                              >
                                <span>{number}</span>
                                <FaCopy />
                              </NumberChip>
                            ))}
                          </NumbersGrid>
                        )} */}
                        
                        <DrawInfo>
                          <FaTrophy />
                          <p>
                            <strong>Sorteio:</strong> {userData.campaign.drawDate ? 
                              new Date(userData.campaign.drawDate).toLocaleDateString('pt-BR') : 
                              'Data a definir'
                            }
                            <br />
                            Seus números já estão reservados. Caso você ganhe, nossa equipe entrará em contato via WhatsApp!
                          </p>
                        </DrawInfo>
                      </NumbersSection>
                    </PurchaseCard>
                  ))}
                </PurchasesList>
              </>
            )}

            {/* Outras campanhas */}
            {userData.otherPayments && userData.otherPayments.length > 0 && (
              <>
                <SectionDivider>
                  <span>Outras campanhas</span>
                </SectionDivider>
                
                <PurchasesList>
                  {userData.otherPayments.map((purchase, index: number) => (
                    <PurchaseCard key={index}>
                      <PurchaseHeader>
                        <PurchaseInfo>
                          <CampaignImageContainer>
                          {(purchase.campaignId as Partial<ICampaign>)?.coverImage ? (
                        <CampaignImage 
                          src={(purchase.campaignId as Partial<ICampaign>)?.coverImage as string} 
                          alt={(purchase.campaignId as Partial<ICampaign>)?.title || 'Campanha'} 
                        />
                      ) : (
                        <CampaignImagePlaceholder>
                          <i className="fas fa-image" />
                        </CampaignImagePlaceholder>
                      )}
                          </CampaignImageContainer>
                          <CampaignInfo>
                            <CampaignTitle>{(purchase.campaignId as any)?.title}</CampaignTitle>
                            <PurchaseDetails>
                              {purchase.purchaseAt && (
                                <DetailItem>
                                  <FaCalendarCheck />
                                  <span>Data:</span> {new Date(purchase.purchaseAt).toLocaleDateString('pt-BR')}
                                </DetailItem>
                              )}
                              {purchase.amount && (
                                <DetailItem>
                                  <FaTicketAlt />
                                  <span>Valor:</span> {formatCurrency(purchase.amount)}
                                </DetailItem>
                              )}
                              {purchase.paymentMethod && (
                                <DetailItem>
                                  <FaMoneyBill />
                                  <span>Pagamento:</span> {purchase.paymentMethod}
                                </DetailItem>
                              )}
                              {purchase.numbersQuantity && (
                                <DetailItem>
                                  <FaTicketAlt />
                                  <span>Quantidade:</span> {purchase.numbersQuantity} números
                                </DetailItem>
                              )}
                            </PurchaseDetails>
                          </CampaignInfo>
                        </PurchaseInfo>
                        <PurchaseStatus $status={purchase.status || ''}>
                          {purchase.status === PaymentStatusEnum.APPROVED ? (
                            <>
                              <FaCheckCircle /> Confirmado
                            </>
                          ) : (
                            <>
                              <FaClock /> Pendente
                            </>
                          )}
                        </PurchaseStatus>
                      </PurchaseHeader>

                      <NumbersSection>
                        <DrawInfo>
                          <FaTrophy />
                          <p>
                            <strong>Campanha:</strong> {(purchase.campaignId as any)?.title}
                            <br />
                            <strong>Sorteio:</strong> {(purchase.campaignId as any)?.drawDate ? 
                              new Date((purchase.campaignId as any).drawDate).toLocaleDateString('pt-BR') : 
                              'Data a definir'
                            }
                          </p>
                        </DrawInfo>
                      </NumbersSection>
                    </PurchaseCard>
                  ))}
                </PurchasesList>
              </>
            )}

            <BackButton onClick={() => setUserData(null)}>
              <FaSearch /> Nova Consulta
            </BackButton>
          </ResultsContainer>
        )}
      </ModalContent>
    </Modal>
  );
};


const CampaignImageContainer = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid #e2e8f0;
  
  @media (max-width: 480px) {
    width: 60px;
    height: 60px;
    border-radius: 6px;
  }
`;

const CampaignImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const CampaignImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 1.5rem;
`;

const TrustLogos = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  
  @media (max-width: 576px) {
    gap: 1.25rem;
  }
`;

const LogoItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  
  .logo-image {
    filter: brightness(1.1);
    transition: all 0.2s ease;
    
    &:hover {
      transform: scale(1.05);
    }
  }
  
  .logo-text {
    font-size: 0.55rem;
    color: #6c757d;
    font-weight: 500;
    text-align: center;
    line-height: 1.1;
  }
  
  @media (max-width: 576px) {
    gap: 0.25rem;
    
    .logo-text {
      font-size: 0.5rem;
    }
  }
`;

const SecurityFooter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1rem;
  padding: 0.50rem;
  background: linear-gradient(135deg, #f8fffe 0%, #ffffff 100%);
  border-radius: 8px;
  border: 1px solid rgba(46, 204, 113, 0.1);
  
  @media (max-width: 576px) {
    margin-top: 0.75rem;
    padding: 0.6rem;
    gap: 0.6rem;
  }
`;

const SecurityText = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  color: #4a5568;
  text-align: center;
  line-height: 1.4;
  font-weight: 500;
  
  span {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-align: center;
    
    svg {
      color: #27ae60;
      font-size: 1rem;
      flex-shrink: 0;
      filter: drop-shadow(0 1px 2px rgba(39, 174, 96, 0.2));
      margin-right: 0.2rem;
    }
  }
  
  @media (max-width: 576px) {
    font-size: 0.65rem;
    
    span {
      gap: 0.4rem;
      
      svg {
        font-size: 0.9rem;
        margin-right: 0.15rem;
      }
    }
  }
  
  @media (max-width: 480px) {
    span {
      flex-direction: column;
      gap: 0.3rem;
      
      svg {
        font-size: 1.1rem;
        margin-right: 0;
      }
    }
  }
`;

// Styled Components
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const ModalContent = styled.div`
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 100px);
  padding-top: 8px;
  
  @media (max-width: 768px) {
    max-height: calc(100vh - 60px);
    padding-top: 6px;
  }
`;

const ModalDecoration = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
  background-size: 200% 200%;
  animation: ${gradientMove} 3s ease infinite;
  border-radius: 12px 12px 0 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  position: absolute;
  top: 12px;
  right: 15px;
  cursor: pointer;
  color: #999;
  transition: all 0.2s;
  z-index: 5;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #333;
    background: rgba(0, 0, 0, 0.05);
    transform: scale(1.05);
  }
  
  @media (max-width: 480px) {
    top: 10px;
    right: 12px;
    width: 26px;
    height: 26px;
    font-size: 16px;
  }
`;

const ModalHeader = styled.div`
  margin-bottom: 20px;
  animation: ${fadeIn} 0.4s ease;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 15px;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  
  @media (max-width: 480px) {
    gap: 10px;
  }
`;

const ModalLogo = styled.div`
  width: 45px;
  height: 45px;
  border-radius: 12px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(106, 17, 203, 0.2);
  color: white;
  font-size: 20px;
  flex-shrink: 0;
  
  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
    font-size: 18px;
    border-radius: 10px;
  }
`;

const HeaderText = styled.div`
  flex: 1;
  text-align: left;
`;

const ModalTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.4rem;
  margin: 0 0 4px 0;
  font-weight: 700;
  line-height: 1.2;
  
  @media (max-width: 480px) {
    font-size: 1.2rem;
  }
`;

const ModalSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.3;
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const SearchSection = styled.div`
  position: relative;
`;

const SearchButton = styled.button`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px 24px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 4px 15px rgba(106, 17, 203, 0.3);
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(106, 17, 203, 0.4);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    padding: 12px 16px;
      border-radius: 8px;
    font-size: 0.8rem;
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const SecurityInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.success};
  font-size: 0.9rem;
  font-weight: 500;
  padding: 12px;
  background: rgba(40, 167, 69, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(40, 167, 69, 0.2);

  @media (max-width: 780px) {
    font-size: 0.6rem;
  }
`;

const ResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  max-height: calc(70vh - 100px);
`;

const SectionDivider = styled.div`
  display: flex;
  align-items: center;
  margin: 1rem 0;
  
  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(0, 0, 0, 0.1);
  }
  
  span {
    padding: 0 1rem;
    font-size: 0.85rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text.secondary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const PurchasesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const PurchasesTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &::before {
    content: '';
    width: 4px;
    height: 20px;
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
    border-radius: 2px;
  }
`;

const PurchaseCard = styled.div`
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const PurchaseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const PurchaseInfo = styled.div`
  flex: 1;
  display: flex;
  gap: 15px;
  align-items: center;
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const CampaignInfo = styled.div`
  flex: 1;
`;

const CampaignTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 8px;
`;

const PurchaseDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 5px;
  }
`;

const DetailItem = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: 5px;
  
  svg {
    color: ${({ theme }) => theme.colors.primary};
    font-size: 0.9rem;
  }
  
  span {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const PurchaseStatus = styled.div<{ $status: string }>`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 5px;
  
  ${({ $status, theme }) => $status === PaymentStatusEnum.APPROVED ? css`
    background: rgba(40, 167, 69, 0.1);
    color: ${theme.colors.success};
    border: 1px solid rgba(40, 167, 69, 0.3);
  ` : css`
    background: rgba(255, 193, 7, 0.1);
    color: #856404;
    border: 1px solid rgba(255, 193, 7, 0.3);
  `}
  
  svg {
    font-size: 0.9rem;
  }
`;

const NumbersSection = styled.div`
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding: 15px 20px;
  background: rgba(250, 250, 250, 0.5);
`;

const NumbersHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const NumbersCount = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ToggleButton = styled.button<{ $visible: boolean }>`
  background: ${({ $visible, theme }) => $visible ? 
    `rgba(106, 17, 203, 0.1)` : 
    'transparent'
  };
  border: 1px solid ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primary};
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    background: rgba(106, 17, 203, 0.1);
  }
`;

const NumbersGrid = styled.div<{ $hasMoreNumbers?: boolean }>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 8px;
  animation: ${fadeIn} 0.3s ease;
  position: relative;
  max-height: 250px;
  overflow-y: auto;
  padding: 5px 0;
  
  ${({ $hasMoreNumbers }) => $hasMoreNumbers && `
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 60px;
      background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(250,250,250,1));
      pointer-events: none;
      z-index: 1;
    }
  `}
  
  &::-webkit-scrollbar {
    width: 5px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(106, 17, 203, 0.3);
    border-radius: 10px;
  }
`;

const NumberChip = styled.button`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(106, 17, 203, 0.3);
    
    &::before {
      left: 100%;
    }
  }
  
  svg {
    opacity: 0.7;
    font-size: 0.8rem;
  }
`;

const DrawInfo = styled.div`
  background: rgba(106, 17, 203, 0.05);
  border-radius: 8px;
  padding: 12px 15px;
  margin-top: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  
  svg {
    color: ${({ theme }) => theme.colors.primary};
    font-size: 1.2rem;
    flex-shrink: 0;
  }
  
  p {
    font-size: 0.85rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    margin: 0;
    line-height: 1.4;
    
    strong {
      color: ${({ theme }) => theme.colors.text.primary};
      font-weight: 600;
    }
  }
`;

const BackButton = styled.button`
  background: rgba(106, 17, 203, 0.1);
  border: 1px solid ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primary};
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: center;
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    font-size: 1rem;
  }
  
  &:hover {
    background: rgba(106, 17, 203, 0.2);
    transform: translateY(-1px);
  }
`;

export default MeusNumerosModal; 