import 'reflect-metadata';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { nextAuthOptions } from '@/lib/auth/nextAuthOptions';
import { PaymentGatewayService } from '@/server/services/PaymentGatewayService';
import Payment from '@/models/Payment';
import Campaign from '@/models/Campaign';
import { User } from '@/models/User';
import { PaymentMethodEnum, PaymentStatusEnum } from '@/models/interfaces/IPaymentInterfaces';
import { DBConnection } from '@/server/lib/dbConnect';
import { generateEntityCode } from '@/models/utils/idGenerator';

interface CreatePixRequest {
  campaignId: string;
  numbers: number[];
  customerInfo: {
    name: string;
    email: string;
    document: string;
    phone: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(nextAuthOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Conectar ao banco
    const dbConnection = new DBConnection();
    await dbConnection.connect();

    // Parsear dados da requisição
    const body: CreatePixRequest = await request.json();
    const { campaignId, numbers, customerInfo } = body;

    // Validações básicas
    if (!campaignId || !numbers || !Array.isArray(numbers) || numbers.length === 0) {
      return NextResponse.json(
        { error: 'Dados inválidos: campaignId e numbers são obrigatórios' },
        { status: 400 }
      );
    }

    if (!customerInfo || !customerInfo.name || !customerInfo.email || 
        !customerInfo.document || !customerInfo.phone) {
      return NextResponse.json(
        { error: 'Informações do cliente são obrigatórias' },
        { status: 400 }
      );
    }

    // Buscar campanha
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return NextResponse.json(
        { error: 'Campanha não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se a campanha está ativa
    if (campaign.status !== 'active') {
      return NextResponse.json(
        { error: 'Campanha não está ativa' },
        { status: 400 }
      );
    }

    // Buscar usuário
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Calcular valores
    const ticketPrice = campaign.ticketPrice;
    const totalAmount = ticketPrice * numbers.length; // em centavos

    // Validar valor mínimo do gateway
    if (!PaymentGatewayService.validateAmount(totalAmount)) {
      return NextResponse.json(
        { 
          error: `Valor mínimo de R$ ${PaymentGatewayService.getMinimumAmount() / 100} não atingido`,
          minimumAmount: PaymentGatewayService.getMinimumAmount()
        },
        { status: 400 }
      );
    }

    // Preparar dados para o gateway
    const gatewayData = {
      campaignId,
      userId: session.user.id,
      amount: totalAmount,
      customerInfo: {
        name: customerInfo.name,
        email: customerInfo.email,
        document: PaymentGatewayService.formatCpf(customerInfo.document),
        phone: PaymentGatewayService.formatPhone(customerInfo.phone)
      },
      items: [{
        title: `${campaign.title} - ${numbers.length} números`,
        quantity: numbers.length,
        unitPrice: ticketPrice,
        tangible: false
      }]
    };

    // Criar transação no gateway
    const gatewayResponse = await PaymentGatewayService.createPixTransaction(gatewayData);

    // Salvar pagamento no banco
    if (!Payment) {
      throw new Error('Modelo Payment não está disponível');
    }

    const payment = new Payment({
      campaignId,
      userId: session.user.id,
      processorTransactionId: gatewayResponse.id,
      amount: totalAmount,
      paymentMethod: PaymentMethodEnum.PIX,
      status: PaymentStatusEnum.PENDING,
      numbers,
      paymentProcessor: 'PaymentGateway',
      customerInfo: {
        name: customerInfo.name,
        email: customerInfo.email,
        document: customerInfo.document,
        phone: customerInfo.phone
      },
      metadata: {
        gatewayCustomId: gatewayResponse.customId,
        pixQrCode: gatewayResponse.pixQrCode,
        pixCode: gatewayResponse.pixCode,
        expiresAt: gatewayResponse.expiresAt
      }
    });

    await payment.save();

    // Retornar dados do PIX
    return NextResponse.json({
      success: true,
      payment: {
        id: payment._id,
        paymentCode: payment.paymentCode,
        amount: payment.amount,
        status: payment.status,
        pixQrCode: gatewayResponse.pixQrCode,
        pixCode: gatewayResponse.pixCode,
        expiresAt: gatewayResponse.expiresAt
      }
    });

  } catch (error) {
    console.error('Erro ao criar PIX:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
} 