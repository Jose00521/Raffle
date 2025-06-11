import { 
  IPaymentGateway,
  CreateTransactionData,
  PaymentTransactionResponse,
  PaymentDetailsResponse,
  PaymentGatewayStatus
} from '@/models/interfaces/IPaymentGatewayInterfaces';
import { PaymentGatewayFactory } from './gateways/PaymentGatewayFactory';
import UserPaymentGateway from '@/models/UserPaymentGateway';
import { DBConnection } from '@/server/lib/dbConnect';

/**
 * Serviço gerenciador para múltiplos gateways de pagamento
 * Implementa o padrão Strategy + Factory para escolher e usar gateways
 */
export class PaymentGatewayManagerService {
  private static dbConnection = new DBConnection();

  /**
   * Obtém o gateway principal ativo do usuário
   */
  static async getUserDefaultGateway(userId: string): Promise<IPaymentGateway | null> {
    try {
      await this.dbConnection.connect();
      
      if (!UserPaymentGateway) {
        throw new Error('UserPaymentGateway model não disponível');
      }

      const gatewayConfig = await UserPaymentGateway.getUserDefaultGateway(userId);
      
      if (!gatewayConfig) {
        return null;
      }

      // Descriptografar credenciais
      const decryptedCredentials = UserPaymentGateway.decryptCredentials(gatewayConfig.credentials);
      
      // Criar gateway com credenciais descriptografadas
      const gatewayConfigWithDecryption = {
        ...gatewayConfig,
        credentials: decryptedCredentials
      };

      return PaymentGatewayFactory.createGateway(gatewayConfigWithDecryption);
    } catch (error) {
      console.error('Erro ao obter gateway padrão:', error);
      return null;
    }
  }

  /**
   * Obtém um gateway específico do usuário por ID
   */
  static async getUserGatewayById(userId: string, gatewayId: string): Promise<IPaymentGateway | null> {
    try {
      await this.dbConnection.connect();
      
      if (!UserPaymentGateway) {
        throw new Error('UserPaymentGateway model não disponível');
      }

      const gatewayConfig = await UserPaymentGateway.findOne({
        _id: gatewayId,
        userId,
        status: PaymentGatewayStatus.ACTIVE
      });
      
      if (!gatewayConfig) {
        return null;
      }

      // Descriptografar credenciais
      const decryptedCredentials = UserPaymentGateway.decryptCredentials(gatewayConfig.credentials);
      
      // Criar gateway com credenciais descriptografadas
      const gatewayConfigWithDecryption = {
        ...gatewayConfig.toObject(),
        credentials: decryptedCredentials
      };

      return PaymentGatewayFactory.createGateway(gatewayConfigWithDecryption);
    } catch (error) {
      console.error('Erro ao obter gateway específico:', error);
      return null;
    }
  }

  /**
   * Lista todos os gateways do usuário
   */
  static async getUserGateways(userId: string) {
    try {
      await this.dbConnection.connect();
      
      if (!UserPaymentGateway) {
        throw new Error('UserPaymentGateway model não disponível');
      }

      const gateways = await UserPaymentGateway.findUserGateways(userId);
      
      // Retornar dados seguros (sem credenciais)
      return gateways.map(gateway => ({
        id: gateway._id,
        gatewayType: gateway.gatewayType,
        displayName: gateway.displayName,
        isDefault: gateway.isDefault,
        status: gateway.status,
        enabledMethods: gateway.settings.enabledMethods,
        testMode: gateway.settings.testMode,
        lastValidatedAt: gateway.lastValidatedAt,
        validationError: gateway.validationError,
        createdAt: gateway.createdAt,
        updatedAt: gateway.updatedAt
      }));
    } catch (error) {
      console.error('Erro ao listar gateways do usuário:', error);
      return [];
    }
  }

  /**
   * Cria uma transação PIX usando o gateway padrão do usuário
   */
  static async createPixTransaction(
    userId: string, 
    data: CreateTransactionData
  ): Promise<PaymentTransactionResponse> {
    const gateway = await this.getUserDefaultGateway(userId);
    
    if (!gateway) {
      throw new Error('Nenhum gateway de pagamento configurado');
    }

    return gateway.createPixTransaction(data);
  }

  /**
   * Cria uma transação PIX usando um gateway específico
   */
  static async createPixTransactionWithGateway(
    userId: string,
    gatewayId: string,
    data: CreateTransactionData
  ): Promise<PaymentTransactionResponse> {
    const gateway = await this.getUserGatewayById(userId, gatewayId);
    
    if (!gateway) {
      throw new Error('Gateway não encontrado ou inativo');
    }

    return gateway.createPixTransaction(data);
  }

  /**
   * Busca detalhes de pagamento usando o gateway padrão
   */
  static async getPaymentDetails(
    userId: string, 
    paymentId: string
  ): Promise<PaymentDetailsResponse> {
    const gateway = await this.getUserDefaultGateway(userId);
    
    if (!gateway) {
      throw new Error('Nenhum gateway de pagamento configurado');
    }

    return gateway.getPaymentDetails(paymentId);
  }

  /**
   * Valida webhook usando todos os gateways do usuário
   */
  static async validateWebhook(
    userId: string,
    payload: any,
    signature?: string
  ): Promise<{ isValid: boolean; gateway?: IPaymentGateway }> {
    try {
      await this.dbConnection.connect();
      
      if (!UserPaymentGateway) {
        throw new Error('UserPaymentGateway model não disponível');
      }

      const gatewayConfigs = await UserPaymentGateway.find({
        userId,
        status: PaymentGatewayStatus.ACTIVE
      });

      for (const config of gatewayConfigs) {
        try {
          const decryptedCredentials = UserPaymentGateway.decryptCredentials(config.credentials);
          
          const gatewayConfigWithDecryption = {
            ...config.toObject(),
            credentials: decryptedCredentials
          };

          const gateway = PaymentGatewayFactory.createGateway(gatewayConfigWithDecryption);
          
          if (gateway.validateWebhook(payload, signature)) {
            return { isValid: true, gateway };
          }
        } catch (error) {
          console.error(`Erro ao validar webhook com gateway ${config.gatewayType}:`, error);
          continue;
        }
      }

      return { isValid: false };
    } catch (error) {
      console.error('Erro na validação de webhook:', error);
      return { isValid: false };
    }
  }

  /**
   * Define um gateway como padrão para o usuário
   */
  static async setDefaultGateway(userId: string, gatewayId: string): Promise<void> {
    try {
      await this.dbConnection.connect();
      
      if (!UserPaymentGateway) {
        throw new Error('UserPaymentGateway model não disponível');
      }

      await UserPaymentGateway.setDefaultGateway(userId, gatewayId);
    } catch (error) {
      console.error('Erro ao definir gateway padrão:', error);
      throw new Error('Falha ao definir gateway padrão');
    }
  }

  /**
   * Verifica se um usuário tem pelo menos um gateway ativo
   */
  static async hasActiveGateway(userId: string): Promise<boolean> {
    try {
      await this.dbConnection.connect();
      
      if (!UserPaymentGateway) {
        return false;
      }

      const count = await UserPaymentGateway.countDocuments({
        userId,
        status: PaymentGatewayStatus.ACTIVE
      });

      return count > 0;
    } catch (error) {
      console.error('Erro ao verificar gateways ativos:', error);
      return false;
    }
  }

  /**
   * Gateway padrão do sistema (fallback)
   * TODO: Implementar gateway padrão do sistema para campanhas sem gateway configurado
   */
  static async getSystemDefaultGateway(): Promise<IPaymentGateway | null> {
    // Por enquanto retorna null, mas pode ser implementado para ter um gateway padrão do sistema
    return null;
  }
} 