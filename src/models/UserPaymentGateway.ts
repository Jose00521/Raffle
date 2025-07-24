import mongoose from 'mongoose';
import { IUserPaymentGateway, PaymentGatewayStatus } from './interfaces/IPaymentGatewayInterfaces';
import crypto from 'crypto';

// Verificar se estamos no servidor
const isServer = typeof window === 'undefined';

const UserPaymentGatewaySchema = isServer ? new mongoose.Schema<IUserPaymentGateway>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    gatewayCode: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String,
      default: ''
    },
    // Referência ao template do gateway
    templateRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PaymentGatewayTemplate',
      required: true
    },
    templateCode: {
      type: String,
      required: true,
      index: true
    },
    isDefault: {
      type: Boolean,
      default: false,
      index: true
    },
    status: {
      type: String,
      enum: Object.values(PaymentGatewayStatus),
      default: PaymentGatewayStatus.ACTIVE,
      required: true
    },
    // Configurações dinâmicas baseadas no template
    credentials: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    },
    settings: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    },
    lastValidatedAt: Date,
    validationError: String
  },
  {
    timestamps: true,
    collection: 'user_payment_gateways'
  }
) : null;

// Definir interface do modelo com métodos estáticos
interface UserPaymentGatewayModel extends mongoose.Model<IUserPaymentGateway> {
  findUserGateways(userId: string): Promise<IUserPaymentGateway[]>;
  getUserDefaultGateway(userId: string): Promise<IUserPaymentGateway | null>;
  setDefaultGateway(userId: string, gatewayId: string): Promise<void>;
  encryptCredentials(credentials: any): any;
  decryptCredentials(encryptedCredentials: any): any;
}

if (isServer && UserPaymentGatewaySchema) {
  // Índices compostos
  UserPaymentGatewaySchema.index({ userId: 1, templateCode: 1 }, { unique: true });
  UserPaymentGatewaySchema.index({ userId: 1, isDefault: 1 });
  UserPaymentGatewaySchema.index({ status: 1 });
  UserPaymentGatewaySchema.index({ templateRef: 1 });

  // Hook para garantir apenas um gateway padrão por usuário
  UserPaymentGatewaySchema.pre('save', async function(this: any, next) {
    if (this.isDefault && this.isModified('isDefault')) {
      // Remover flag de padrão de outros gateways do usuário
      await (this.constructor as any).updateMany(
        { 
          userId: this.userId, 
          _id: { $ne: this._id } 
        },
        { isDefault: false }
      );
    }
    next();
  });

  // Hook para criptografar credenciais antes de salvar
  UserPaymentGatewaySchema.pre('save', function(this: any, next) {
    if (this.isModified('credentials')) {
      this.credentials = encryptCredentials(this.credentials);
    }
    next();
  });

  // Métodos estáticos
  UserPaymentGatewaySchema.statics.findUserGateways = function(userId: string) {
    return this.find({ userId })
      .sort({ isDefault: -1, createdAt: -1 });
  };

  UserPaymentGatewaySchema.statics.getUserDefaultGateway = function(userId: string) {
    return this.findOne({ 
      userId, 
      isDefault: true, 
      status: PaymentGatewayStatus.ACTIVE 
    });
  };

  UserPaymentGatewaySchema.statics.setDefaultGateway = async function(userId: string, gatewayId: string) {
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        // Remover flag de padrão de todos os gateways do usuário
        await this.updateMany(
          { userId },
          { isDefault: false },
          { session }
        );

        // Definir o novo gateway como padrão
        await this.findByIdAndUpdate(
          gatewayId,
          { isDefault: true },
          { session }
        );
      });
    } finally {
      await session.endSession();
    }
  };

  // Métodos de criptografia
  UserPaymentGatewaySchema.statics.encryptCredentials = encryptCredentials;
  UserPaymentGatewaySchema.statics.decryptCredentials = decryptCredentials;

  // Método virtual para descriptografar credenciais automaticamente
  UserPaymentGatewaySchema.virtual('decryptedCredentials').get(function(this: any) {
    return decryptCredentials(this.credentials);
  });
}

// Funções de criptografia usando crypto nativo
function encryptCredentials(credentials: any) {
  const algorithm = 'aes-256-gcm';
  const secretKey = process.env.GATEWAY_ENCRYPTION_KEY || 'default-key-change-in-production-32b';
  const key = crypto.scryptSync(secretKey, 'salt', 32);
  
  const encrypted = { ...credentials };
  
  if (credentials.secretKey) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);
    cipher.setAAD(Buffer.from('secretKey', 'utf8'));
    
    let encryptedText = cipher.update(credentials.secretKey, 'utf8', 'hex');
    encryptedText += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    encrypted.secretKey = `${iv.toString('hex')}:${authTag.toString('hex')}:${encryptedText}`;
  }
  
  if (credentials.webhookSecret) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(algorithm, key);
    cipher.setAAD(Buffer.from('webhookSecret', 'utf8'));
    
    let encryptedText = cipher.update(credentials.webhookSecret, 'utf8', 'hex');
    encryptedText += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    encrypted.webhookSecret = `${iv.toString('hex')}:${authTag.toString('hex')}:${encryptedText}`;
  }
  
  return encrypted;
}

function decryptCredentials(encryptedCredentials: any) {
  const algorithm = 'aes-256-gcm';
  const secretKey = process.env.GATEWAY_ENCRYPTION_KEY || 'default-key-change-in-production-32b';
  const key = crypto.scryptSync(secretKey, 'salt', 32);
  
  const decrypted = { ...encryptedCredentials };
  
  if (encryptedCredentials.secretKey && encryptedCredentials.secretKey.includes(':')) {
    try {
      const [ivHex, authTagHex, encryptedText] = encryptedCredentials.secretKey.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      
      const decipher = crypto.createDecipher(algorithm, key);
      decipher.setAAD(Buffer.from('secretKey', 'utf8'));
      decipher.setAuthTag(authTag);
      
      let decryptedText = decipher.update(encryptedText, 'hex', 'utf8');
      decryptedText += decipher.final('utf8');
      
      decrypted.secretKey = decryptedText;
    } catch (error) {
      console.error('Erro ao descriptografar secretKey:', error);
      decrypted.secretKey = '';
    }
  }
  
  if (encryptedCredentials.webhookSecret && encryptedCredentials.webhookSecret.includes(':')) {
    try {
      const [ivHex, authTagHex, encryptedText] = encryptedCredentials.webhookSecret.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      
      const decipher = crypto.createDecipher(algorithm, key);
      decipher.setAAD(Buffer.from('webhookSecret', 'utf8'));
      decipher.setAuthTag(authTag);
      
      let decryptedText = decipher.update(encryptedText, 'hex', 'utf8');
      decryptedText += decipher.final('utf8');
      
      decrypted.webhookSecret = decryptedText;
    } catch (error) {
      console.error('Erro ao descriptografar webhookSecret:', error);
      decrypted.webhookSecret = '';
    }
  }
  
  return decrypted;
}

// Verificar se o modelo já foi compilado
const UserPaymentGateway = isServer 
  ? ((mongoose.models.UserPaymentGateway as unknown as UserPaymentGatewayModel) || 
    mongoose.model<IUserPaymentGateway, UserPaymentGatewayModel>('UserPaymentGateway', UserPaymentGatewaySchema as any))
  : null;

export default UserPaymentGateway; 