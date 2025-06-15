import mongoose from 'mongoose';
import { IUser } from './interfaces/IUserInterfaces';
import { EncryptionService, SecureDataUtils } from '@/utils/encryption';
import { maskCPF, maskEmail, maskPhone } from '@/utils/maskUtils';

// Verificar se estamos no servidor
const isServer = typeof window === 'undefined';

/**
 * Schema de usuário com criptografia automática
 */
const SecureUserSchema = isServer ? new mongoose.Schema<IUser>({
  userCode: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  
  // DADOS BÁSICOS
  name: {
    type: String,
    required: true,
    index: true
  },
  
  socialName: String,
  
  // DADOS SENSÍVEIS CRIPTOGRAFADOS
  // CPF - estrutura tripla
  cpf_encrypted: {
    encrypted: String,
    iv: String,
    tag: String,
    keyVersion: String
  },
  cpf_hash: {
    type: String,
    unique: true,
    sparse: true,
    index: true // Para busca rápida
  },
  cpf_display: {
    type: String,
    default: ''
  },
  
  // EMAIL - estrutura tripla
  email_encrypted: {
    encrypted: String,
    iv: String,
    tag: String,
    keyVersion: String
  },
  email_hash: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  email_display: {
    type: String,
    default: ''
  },
  
  // TELEFONE - estrutura tripla
  phone_encrypted: {
    encrypted: String,
    iv: String,
    tag: String,
    keyVersion: String
  },
  phone_hash: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  phone_display: {
    type: String,
    default: ''
  },
  
  // SENHA (bcrypt - não criptografada)
  password: {
    type: String,
    required: true,
    select: false // Por segurança, não retorna por padrão
  },
  
  // ENDEREÇO (pode ser criptografado se necessário)
  address: {
    street: String,
    number: String,
    complement: String,
    neighborhood: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'BR' }
  },
  
  // DADOS NÃO SENSÍVEIS
  role: {
    type: String,
    enum: ['user', 'participant', 'creator', 'admin'],
    default: 'participant',
    required: true,
    index: true
  },
  
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  birthDate: Date,
  
  // METADADOS
  lastLogin: Date,
  
  // ESTATÍSTICAS
  statistics: {
    participationCount: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    rafflesWon: { type: Number, default: 0 },
    lastParticipation: Date
  },
  
  // CONSENTIMENTOS
  consents: {
    marketingEmails: { type: Boolean, default: false },
    termsAndConditions: { type: Boolean, default: true },
    dataSharing: { type: Boolean, default: false }
  }
}, {
  timestamps: true,
  collection: 'secure_users'
}) : null;

// Interface do modelo com métodos seguros
interface SecureUserModel extends mongoose.Model<IUser> {
  findByCPF(cpf: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  findByPhone(phone: string): Promise<IUser | null>;
  findByUserCode(userCode: string): Promise<IUser | null>;
  createSecureUser(userData: Partial<IUser>): Promise<IUser>;
  getDecryptedData(user: IUser): Promise<Partial<IUser>>;
}

if (isServer && SecureUserSchema) {
  // MIDDLEWARE PRE-SAVE: Auto-criptografia
  SecureUserSchema.pre('save', async function(this: any, next) {
    try {
      // CRIPTOGRAFAR CPF
      if (this.cpf && !this.cpf_encrypted) {
        this.cpf_encrypted = SecureDataUtils.encryptCPF(this.cpf);
        this.cpf_hash = SecureDataUtils.hashForSearch(this.cpf);
        this.cpf_display = maskCPF(this.cpf);
        this.cpf = undefined; // Remove campo original
      }
      
      // CRIPTOGRAFAR EMAIL
      if (this.email && !this.email_encrypted) {
        this.email_encrypted = SecureDataUtils.encryptEmail(this.email);
        this.email_hash = SecureDataUtils.hashForSearch(this.email);
        this.email_display = maskEmail(this.email);
        this.email = undefined;
      }
      
      // CRIPTOGRAFAR TELEFONE
      if (this.phone && !this.phone_encrypted) {
        this.phone_encrypted = SecureDataUtils.encryptPhone(this.phone);
        this.phone_hash = SecureDataUtils.hashForSearch(this.phone);
        this.phone_display = maskPhone(this.phone);
        this.phone = undefined;
      }
      
      next();
    } catch (error) {
      next(error as Error);
    }
  });
  
  // MÉTODOS ESTÁTICOS SEGUROS
  SecureUserSchema.statics.findByCPF = async function(cpf: string) {
    const hash = SecureDataUtils.hashForSearch(cpf);
    return this.findOne({ cpf_hash: hash });
  };
  
  SecureUserSchema.statics.findByEmail = async function(email: string) {
    const hash = SecureDataUtils.hashForSearch(email);
    return this.findOne({ email_hash: hash });
  };
  
  SecureUserSchema.statics.findByPhone = async function(phone: string) {
    const hash = SecureDataUtils.hashForSearch(phone);
    return this.findOne({ phone_hash: hash });
  };
  
  SecureUserSchema.statics.findByUserCode = function(userCode: string) {
    return this.findOne({ userCode });
  };
  
  // CRIAR USUÁRIO COM CRIPTOGRAFIA AUTOMÁTICA
  SecureUserSchema.statics.createSecureUser = async function(userData: Partial<IUser>) {
    const user = new this(userData);
    await user.save();
    return user;
  };
  
  // DESCRIPTOGRAFAR DADOS QUANDO NECESSÁRIO
  SecureUserSchema.statics.getDecryptedData = async function(user: IUser) {
    try {
      const decrypted: Partial<IUser> = {
        ...user.toObject(),
      };
      
      // Descriptografar apenas quando necessário
      if (user.cpf_encrypted) {
        decrypted.cpf = SecureDataUtils.decryptCPF(user.cpf_encrypted);
      }
      
      if (user.email_encrypted) {
        decrypted.email = EncryptionService.decrypt(user.email_encrypted);
      }
      
      if (user.phone_encrypted) {
        decrypted.phone = EncryptionService.decrypt(user.phone_encrypted);
      }
      
      return decrypted;
    } catch (error) {
      console.error('[DECRYPTION_ERROR]', error);
      throw new Error('Erro ao descriptografar dados do usuário');
    }
  };
  
  // MÉTODO PARA DADOS MASCARADOS (PARA API PÚBLICA)
  SecureUserSchema.methods.getDisplayData = function() {
    return {
      userCode: this.userCode,
      name: this.name,
      socialName: this.socialName,
      cpf: this.cpf_display,
      email: this.email_display,
      phone: this.phone_display,
      address: this.address,
      role: this.role,
      isActive: this.isActive,
      statistics: this.statistics
    };
  };
  
  // MÉTODO PARA RE-CRIPTOGRAFAR (ROTAÇÃO DE CHAVES)
  SecureUserSchema.methods.reencryptData = async function() {
    if (this.cpf_encrypted && EncryptionService.needsReencryption(this.cpf_encrypted)) {
      this.cpf_encrypted = EncryptionService.reencrypt(this.cpf_encrypted);
    }
    
    if (this.email_encrypted && EncryptionService.needsReencryption(this.email_encrypted)) {
      this.email_encrypted = EncryptionService.reencrypt(this.email_encrypted);
    }
    
    if (this.phone_encrypted && EncryptionService.needsReencryption(this.phone_encrypted)) {
      this.phone_encrypted = EncryptionService.reencrypt(this.phone_encrypted);
    }
    
    await this.save();
  };
}

// Verificar se o modelo já foi compilado
const SecureUser = isServer 
  ? ((mongoose.models.SecureUser as unknown as SecureUserModel) || 
    mongoose.model<IUser, SecureUserModel>('SecureUser', SecureUserSchema as any))
  : null;

export default SecureUser; 