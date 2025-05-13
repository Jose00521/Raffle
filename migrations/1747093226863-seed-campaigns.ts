// Import your schemas here
import type { Connection } from 'mongoose'

export async function up (connection: Connection): Promise<void> {
  // Verificar se o modelo Campaign existe
  if (!connection.modelNames().includes('Campaign')) {
    console.error('Modelo Campaign não encontrado, não é possível criar seeds');
    return;
  }

  const Campaign = connection.model('Campaign');

  // Verificar se já existem campanhas
  const campaignCount = await Campaign.countDocuments();
  if (campaignCount > 0) {
    console.log(`Já existem ${campaignCount} campanhas no sistema, pulando seed...`);
    return;
  }

  const campaigns = [
    {
      title: 'EDIÇÃO 58 - MERCEDES-AMG C 63 S E PERFORMANCE F1 EDITION BRB 0KM',
      description: 'Concorra a esse incrível Mercedes-AMG C 63 S E PERFORMANCE F1 EDITION BRB 0KM. Um dos carros mais desejados do momento, com potência impressionante e design espetacular.',
      price: 1.00,
      image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      totalNumbers: 1000000,
      winnerNumber: 251760,
      winnerUser: null,
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
      drawDate: new Date('2023-12-20'),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      regulation: `O RIFA APP é um Título de Capitalização da Modalidade Filantropia Premiável, de pagamento único, emitido pela CAPITALIZAÇÃO S.A., Sociedade de Capitalização inscrita no CNPJ sob o Número XX.XXX.XXX/0001-XX. A contratação deste título é apropriada principalmente na hipótese de o consumidor estar interessado em contribuir com entidades beneficentes de assistência sociais, certificadas nos termos da legislação vigente, e participar de sorteio(s). Cada título custa R$ 1,00 e o valor mínimo de compra é R$ 12,00.`,
      campaignCode: 'RA1234/58',
      mainPrize: 'CAMARO C 63 S E PERFORMANCE F1 EDITION BRB 0KM',
      valuePrize: 'R$ 800.000,00',
      returnExpected:'R$ 1.000.000,00'
    },
    {
      title: '50 MIL REAIS NO PIX',
      description: 'Concorra a cinquenta mil reais em dinheiro para realizar seus sonhos! O valor será transferido via PIX diretamente para sua conta.',
      price: 1.00,
      image: 'https://images.unsplash.com/photo-1621155346337-1d19476ba7d6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      totalNumbers: 100000,
      winnerNumber: 251760,
      winnerUser: null,
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
      drawDate: new Date('2023-11-15'),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      regulation: `O RIFA APP é um Título de Capitalização da Modalidade Filantropia Premiável, de pagamento único, emitido pela CAPITALIZAÇÃO S.A., Sociedade de Capitalização inscrita no CNPJ sob o Número XX.XXX.XXX/0001-XX. A contratação deste título é apropriada principalmente na hipótese de o consumidor estar interessado em contribuir com entidades beneficentes de assistência sociais, certificadas nos termos da legislação vigente, e participar de sorteio(s). Cada título custa R$ 1,00 e o valor mínimo de compra é R$ 12,00.`,
      campaignCode: 'RA1234/58',
      mainPrize: 'MERCEDES-AMG C 63 S E PERFORMANCE F1 EDITION BRB 0KM',
      valuePrize: 'R$ 500.000,00',
      returnExpected:'R$ 1.000.000,00'
    },
    {
      title: 'HB20 2025 0KM + CG 160 Titan 2025 0KM',
      description: 'Concorra a um HB20 2025 0KM + CG 160 Titan 2025 0KM. Dois veículos novos para você escolher utilizar ou vender!',
      price: 1.00,
      image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      totalNumbers: 500000,
      winnerNumber: 251760,
      winnerUser: null,
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
      drawDate: new Date('2023-12-10'),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      regulation: `O RIFA APP é um Título de Capitalização da Modalidade Filantropia Premiável, de pagamento único, emitido pela CAPITALIZAÇÃO S.A., Sociedade de Capitalização inscrita no CNPJ sob o Número XX.XXX.XXX/0001-XX. A contratação deste título é apropriada principalmente na hipótese de o consumidor estar interessado em contribuir com entidades beneficentes de assistência sociais, certificadas nos termos da legislação vigente, e participar de sorteio(s). Cada título custa R$ 1,00 e o valor mínimo de compra é R$ 12,00.`,
      campaignCode: 'RA1234/58',
      mainPrize: 'CIVIC C 63 S E PERFORMANCE F1 EDITION BRB 0KM',
      valuePrize: 'R$ 200.000,00',
      returnExpected:'R$ 1.000.000,00'
    }
  ];

  // Inserir campanhas no banco de dados
  try {
    await Campaign.insertMany(campaigns);
    console.log(`✅ ${campaigns.length} campanhas criadas com sucesso!`);
  } catch (error) {
    console.error('❌ Erro ao inserir campanhas:', error);
    throw error;
  }
}

export async function down (connection: Connection): Promise<void> {
  // Verificar se o modelo Campaign existe
  if (!connection.modelNames().includes('Campaign')) {
    console.log('Modelo Campaign não encontrado, nada a reverter');
    return;
  }

  const Campaign = connection.model('Campaign');

  // Remover campanhas criadas pelo seed
  // Podemos identificar pelo título que é bem único
  const titles = [
    'EDIÇÃO 58 - MERCEDES-AMG C 63 S E PERFORMANCE F1 EDITION BRB 0KM',
    '50 MIL REAIS NO PIX',
    'HB20 2025 0KM + CG 160 Titan 2025 0KM'
  ];

  try {
    const result = await Campaign.deleteMany({ title: { $in: titles } });
    console.log(`✅ ${result.deletedCount} campanhas removidas com sucesso!`);
  } catch (error) {
    console.error('❌ Erro ao remover campanhas:', error);
    throw error;
  }
}
