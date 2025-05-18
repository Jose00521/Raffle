import mongoose from 'mongoose';
import { generateEntityCode } from './utils/idGenerator';
const Schema = mongoose.Schema;

/**
 * Interfaces
 */
export interface IAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface IBankAccount {
  bank: string;
  agency: string;
  account: string;
  accountType: 'checking' | 'savings';
  pixKey?: string;
}

export interface IBaseUser {
  _id?: string;
  userCode?: string; // Código único no formato Snowflake ID
  email: string;
  password: string;
  name: string;
  phone: string;
  address: IAddress;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IParticipant extends IBaseUser {
  role: 'participant';
  cpf: string;
  birthDate: Date;
  socialName?: string;
  purchasedNumbers: {
    rifaId: string;
    numbers: number[];
  }[];
  statistics: {
    participationCount: number;
    totalSpent: number;
    rafflesWon: number;
    lastParticipation?: Date;
  };
  consents: {
    marketingEmails: boolean;
    termsAndConditions: boolean;
    dataSharing: boolean;
  };
}

export interface IVerification {
    // Campos para verificação documental
    verification?: {
      status: 'pending' | 'under_review' | 'approved' | 'rejected';
      documents?: {
        identityFront?: { path: string; uploadedAt: Date; verified: boolean };
        identityBack?: { path: string; uploadedAt: Date; verified: boolean };
        identitySelfie?: { path: string; uploadedAt: Date; verified: boolean };
        companyDocuments?: Array<{
          type: 'contract' | 'registration' | 'license' | 'other';
          path: string;
          description?: string;
          uploadedAt: Date;
          verified: boolean;
        }>;
      };
      verificationNotes?: string;
      rejectionReason?: string;
      reviewedAt?: Date;
      reviewedBy?: mongoose.Types.ObjectId | string;
      expiresAt?: Date;
    };
}
  
export interface ICreator extends IBaseUser {
  role: 'creator';
  personType: 'individual' | 'company';
  cpf?: string;
  cnpj?: string;
  companyName?: string;
  legalName?: string;
  legalRepresentative?: string;
  bankAccount: Array<IBankAccount>;
  verification: IVerification;
  statistics: {
    rafflesCreated: number;
    activeRaffles: number;
    totalRevenue: number;
    conversionRate: number | null;
    lastRaffleCreated?: Date;
  };
  settings: {
    allowCommissions: boolean;
    commissionPercentage: number;
    receiveReports: boolean;
  };
}

export type IUser = IParticipant | ICreator;

/**
 * Base User Schema - Shared fields 
 */
const UserSchema = new Schema({
  userCode: {
    type: String,
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    select: false // Não retorna por padrão nas consultas
  },
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    index: true // Índice para buscas por nome
  },
  phone: {
    type: String,
    required: [true, 'Telefone é obrigatório'],
    trim: true
  },
  address: {
    street: String,
    number: String,
    complement: String,
    neighborhood: String,
    city: String,
    state: String,
    zipCode: {
      type: String,
      required: [true, 'CEP é obrigatório']
    }
  },
  
  isActive: {
    type: Boolean,
    default: true,
    index: true // Facilita filtrar usuários ativos/inativos
  },
  lastLogin: {
    type: Date
  }
}, {
  discriminatorKey: 'role', // Campo discriminador para o tipo de usuário
  collection: 'users',
  timestamps: true, // Rastreia criação e atualizações automaticamente
  strict: true, // Não permite campos não definidos no schema
});

// Adiciona um hook pre-save para gerar automaticamente o código do usuário
UserSchema.pre('save', function(this: any, next) {
  // Só gera o código se ele ainda não existir e se estiver no servidor
  if (!this.userCode && typeof window === 'undefined') {
    this.userCode = generateEntityCode(this._id, 'US');
  }
  next();
});

// Índices compostos para consultas comuns
UserSchema.index({ role: 1, createdAt: -1 }); // Facilita consultas por tipo e ordenadas por data
UserSchema.index({ name: 1, role: 1 }); // Otimiza busca por nome dentro de cada tipo
UserSchema.index({ email: 1 }, { unique: true }); // Índice para autenticação e unicidade
UserSchema.index({ userCode: 1 }, { unique: true, sparse: true }); // Índice para busca por código
UserSchema.index({ 'address.city': 1, 'address.state': 1 }); // Para filtrar por localização
UserSchema.index({ isActive: 1, role: 1 }); // Para filtrar usuários ativos por tipo
UserSchema.index({ name: 'text', email: 'text' }); // Para pesquisa por texto
UserSchema.index({ createdAt: 1 }); // Para relatórios por período
UserSchema.index({ lastLogin: 1 }); // Para identificar usuários inativos

// Métodos estáticos para User
UserSchema.statics.findByUserCode = function(userCode: string) {
  return this.findOne({ userCode });
};

UserSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

// Modelo base
const User = mongoose.models.User || mongoose.model('User', UserSchema);

/**
 * Schema de Participante
 */
const ParticipantSchema = new Schema({
  cpf: {
    type: String,
    required: [true, 'CPF é obrigatório'],
    unique: true,
    sparse: true // Índice esparso
  },
  birthDate: {
    type: Date,
    required: [true, 'Data de nascimento é obrigatória'],
    index: true // Permite consultas por faixa etária
  },
  socialName: String,
  purchasedNumbers: [
    {
      rifaId: {
        type: String,
        required: true,
      },
      numbers: [
        {
          type: Number,
        },
      ],
    },
  ],
  statistics: {
    participationCount: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    rafflesWon: { type: Number, default: 0 },
    lastParticipation: Date
  },
  consents: {
    marketingEmails: { type: Boolean, default: false },
    termsAndConditions: { type: Boolean, default: true },
    dataSharing: { type: Boolean, default: false }
  }
});

/**
 * Schema de Criador
 */
const CreatorSchema = new Schema({
  personType: {
    type: String,
    enum: ['individual', 'company'],
    required: true,
    index: true // Índice para filtrar por tipo de pessoa
  },
  cpf: {
    type: String,
    required: function(this: any): boolean { return this.personType === 'individual'; },
    unique: true,
    sparse: true // Índice esparso
  },
  cnpj: {
    type: String,
    required: function(this: any): boolean { return this.personType === 'company'; },
    unique: true,
    sparse: true // Índice esparso
  },
  companyName: String,
  legalName: String,
  legalRepresentative: String,
  bankAccount: [{
    bank: { type: String, required: true },
    agency: { type: String, required: true },
    account: { type: String, required: true },
    accountType: { 
      type: String, 
      enum: ['checking', 'savings'],
      required: true
    },
    pixKey: String
  }],
    // Adicionar estrutura para verificação documental
    verification: {
      status: {
        type: String,
        enum: ['pending', 'under_review', 'approved', 'rejected'],
        default: 'pending',
        index: true
      },
      documents: {
        identityFront: { 
          path: String,
          uploadedAt: Date,
          verified: Boolean
        },
        identityBack: { 
          path: String,
          uploadedAt: Date,
          verified: Boolean
        },
        identitySelfie: { 
          path: String,
          uploadedAt: Date,
          verified: Boolean
        },
        companyDocuments: [{
          type: { 
            type: String,
            enum: ['contract', 'registration', 'license', 'other']
          },
          path: String,
          description: String,
          uploadedAt: Date,
          verified: Boolean
        }]
      },
      verificationNotes: String,
      rejectionReason: String,
      reviewedAt: Date,
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      expiresAt: Date
    },
  statistics: {
    rafflesCreated: { type: Number, default: 0 },
    activeRaffles: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    lastRaffleCreated: Date
  },
  settings: {
    allowCommissions: { type: Boolean, default: false },
    commissionPercentage: { type: Number, default: 0 },
    receiveReports: { type: Boolean, default: true }
  }
});

// Criar modelos utilizando discriminators
const Participant = User.discriminator('participant', ParticipantSchema);
const Creator = User.discriminator('creator', CreatorSchema);

// Configurar índices adicionais após a inicialização do mongoose
export const setupUserIndexes = async () => {
  const db = mongoose.connection.db;
  
  if (!db) {
    console.error('Database connection not established');
    return;
  }
  
  // Índice único parcial para CPFs apenas em participantes
  await db.collection('users').createIndex(
    { cpf: 1 },
    { 
      unique: true,
      partialFilterExpression: { role: "participant" },
      background: true
    }
  );

  // Índice único parcial para CPFs de criadores pessoa física
  await db.collection('users').createIndex(
    { cpf: 1 },
    { 
      unique: true,
      partialFilterExpression: { 
        role: "creator",
        personType: "individual"
      },
      background: true
    }
  );

  // Índice único parcial para CNPJs de criadores pessoa jurídica
  await db.collection('users').createIndex(
    { cnpj: 1 },
    { 
      unique: true,
      partialFilterExpression: { 
        role: "creator",
        personType: "company" 
      },
      background: true
    }
  );
  
  // Índices adicionais para otimização de consultas específicas
  await db.collection('users').createIndex(
    { 'statistics.participationCount': -1, role: 1 },
    { background: true }
  );
  
  await db.collection('users').createIndex(
    { 'statistics.rafflesWon': -1, role: 1 },
    { background: true }
  );
  
  await db.collection('users').createIndex(
    { 'statistics.totalSpent': -1, role: 1 },
    { background: true }
  );
  
  await db.collection('users').createIndex(
    { 'statistics.rafflesCreated': -1, role: 1 },
    { background: true }
  );
  
  await db.collection('users').createIndex(
    { 'statistics.activeRaffles': -1, role: 1 },
    { background: true }
  );
  
  // await db.collection('users').createIndex(
  //   { 'consents.marketingEmails': 1, role: 1 },
  //   { background: true }
  // );
  
  console.log('User indexes configured successfully');
};

export { User, Participant, Creator }; 