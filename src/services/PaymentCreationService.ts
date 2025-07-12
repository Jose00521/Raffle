import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import paymentAPIClient from '@/API/paymentAPIClient';
import { PaymentMethodEnum } from '@/models/interfaces/IPaymentInterfaces';
import { ICampaign } from '@/models/interfaces/ICampaignInterfaces';
import { INumberPackageCampaign } from '@/models/interfaces/ICampaignInterfaces';
import { IUser } from '@/models/interfaces/IUserInterfaces';

// 🎯 Interfaces do serviço
interface CheckoutData {
  campanha: ICampaign;
  campaignSelection: INumberPackageCampaign;
  foundUser: Partial<IUser>;
}

interface Pix {
  pixCode: string;
  pixQrCode: string;
  numbers: number[];
  expiresAt: string | null;
  paymentCode: string;
}

interface PaymentCreationParams {
  parsedData: CheckoutData;
  idempotencyKey: string;
  attempt: number;
}

interface PaymentCreationResult {
  success: boolean;
  pix?: Pix;
  shouldRetry?: boolean;
  shouldReload?: boolean;
  error?: string;
}

// 🏭 Serviço para criação de pagamentos
export class PaymentCreationService {
  
  // 🔧 Gerar ou reutilizar chave de idempotência
  static generateOrReuseIdempotencyKey(existingKey?: string | null): string {
    if (existingKey) {
      console.log('[PAYMENT_SERVICE] Reutilizando chave:', existingKey);
      return existingKey;
    }
    
    const newKey = uuidv4();
    sessionStorage.setItem('paymentIdempotencyKey', newKey);
    console.log('[PAYMENT_SERVICE] Nova chave de idempotência:', newKey);
    return newKey;
  }

  // 🏗️ Construir payload do pagamento
  static buildPaymentPayload(parsedData: CheckoutData, idempotencyKey: string) {
    console.log('parsedData buildPaymentPayload',parsedData);
    return {
      userCode: parsedData.foundUser.userCode || '',
      name: parsedData.foundUser.name || '',
      email: parsedData.foundUser.email || '',
      cpf: parsedData.foundUser.cpf || '',
      phone: parsedData.foundUser.phone || '',
      address: {
        zipCode: parsedData.foundUser.address?.zipCode || '',
        street: parsedData.foundUser.address?.street || '',
        number: parsedData.foundUser.address?.number || '',
        complement: parsedData.foundUser.address?.complement || '',
        neighborhood: parsedData.foundUser.address?.neighborhood || '',
        city: parsedData.foundUser.address?.city || '',
        state: parsedData.foundUser.address?.state || '',
      },
      paymentMethod: PaymentMethodEnum.PIX,
      amount: (parsedData.campaignSelection.totalPrice || 0) * 100,
      // ✅ expiresAt será definido automaticamente pelo hook pre-save do modelo
      campanha: parsedData.campanha,
      selectedPackage: parsedData.campaignSelection,
      idempotencyKey
    };
  }

  // 💾 Salvar dados do pagamento criado
  static savePaymentData(pixData: Pix, parsedData: CheckoutData): void {
    // Salva PIX
    sessionStorage.setItem('pix', JSON.stringify(pixData));
    
    // Salva snapshot do checkout
    const checkoutSnapshot = {
      amount: (parsedData.campaignSelection.totalPrice || 0) * 100,
      campaignCode: parsedData.campanha.campaignCode,
      userCode: parsedData.foundUser.userCode,
      quantity: parsedData.campaignSelection.quantity,
      price: parsedData.campaignSelection.price,
      timestamp: Date.now()
    };
    sessionStorage.setItem('lastCheckoutData', JSON.stringify(checkoutSnapshot));
    
    console.log('[PAYMENT_SERVICE] Dados salvos no sessionStorage');
  }

  // 🔄 Tratar resposta de idempotência
  static handleIdempotencyResponse(message: string): PaymentCreationResult {
    console.log('[PAYMENT_SERVICE] Detectado pagamento duplicado/idempotente');
    
    // Tenta recuperar dados do sessionStorage
    const existingPixData = sessionStorage.getItem('pix');
    if (existingPixData) {
      console.log('[PAYMENT_SERVICE] Recuperando PIX do sessionStorage');
      const pixData = JSON.parse(existingPixData);
      toast.success('Pagamento recuperado com sucesso!');
      return { success: true, pix: pixData };
    }
    
    // Se não tem dados locais, força reload
    console.log('[PAYMENT_SERVICE] Sem dados locais, forçando reload');
    sessionStorage.removeItem('pix');
    sessionStorage.removeItem('paymentIdempotencyKey');
    sessionStorage.removeItem('lastCheckoutData');
    toast.info('Recarregando dados do pagamento...');
    
    return { success: false, shouldReload: true };
  }

  // 🔄 Verificar se deve fazer retry
  static shouldRetryPayment(error: any, attempt: number): boolean {
    return (
      attempt < 3 && 
      (error.name === 'NetworkError' || error.message?.includes('fetch'))
    );
  }

  // 🚀 Criar pagamento PIX
  static async createPixPayment(params: PaymentCreationParams): Promise<PaymentCreationResult> {
    const { parsedData, idempotencyKey, attempt } = params;
    
    try {
      console.log(`[PAYMENT_SERVICE] Tentativa ${attempt} - Criando pagamento...`);
      
      const payload = this.buildPaymentPayload(parsedData, idempotencyKey);
      const response = await paymentAPIClient.createPixPayment(payload);

      if (response.success) {
        console.log('[PAYMENT_SERVICE] Pagamento criado com sucesso');
        console.log('[PAYMENT_SERVICE] Dados da resposta:', {
          hasData: !!response.data,
          pixCode: response.data?.pixCode,
          pixQrCode: response.data?.pixQrCode,
          paymentCode: response.data?.paymentCode,
          numbers: response.data?.numbers,
          expiresAt: response.data?.expiresAt
        });
        
        this.savePaymentData(response.data, parsedData);
        //toast.success('Pagamento PIX gerado com sucesso!');
        
        return { success: true, pix: response.data };
      } else {
        console.error('[PAYMENT_SERVICE] Erro na resposta:', response.message);
        console.error('[PAYMENT_SERVICE] Resposta completa:', response);
        
        // Verifica se é caso de idempotência
        if (response.message?.includes('duplicado') || 
            response.message?.includes('idempotência') ||
            response.message?.includes('já processado')) {
          return this.handleIdempotencyResponse(response.message);
        }
        
        toast.error(response.message || 'Erro ao criar pagamento');
        return { success: false, error: response.message };
      }

    } catch (error: any) {
      console.error('[PAYMENT_SERVICE] Erro na criação do pagamento:', error);
      
      // Verifica se deve fazer retry
      if (this.shouldRetryPayment(error, attempt)) {
        console.log(`[PAYMENT_SERVICE] Agendando retry em 2s... (tentativa ${attempt + 1})`);
        toast.info('Reconectando... Tentando novamente.');
        return { success: false, shouldRetry: true };
      }
      
      toast.error('Erro ao criar pagamento. Tente novamente.');
      return { success: false, error: error.message };
    }
  }
} 