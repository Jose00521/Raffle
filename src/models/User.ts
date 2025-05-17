import mongoose from 'mongoose';
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
  
export interface ICreator extends IBaseUser {
  role: 'creator';
  personType: 'individual' | 'company';
  cpf?: string;
  cnpj?: string;
  companyName?: string;
  legalName?: string;
  legalRepresentative?: string;
  bankAccount: Array<IBankAccount>;
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
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    trim: true,
    lowercase: true,
    index: true // Índice para autenticação rápida
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
  timestamps: true, // Rastreia criação e atualizações automaticamente
  strict: true, // Não permite campos não definidos no schema
});

// Índices compostos para consultas comuns
UserSchema.index({ role: 1, createdAt: -1 }); // Facilita consultas por tipo e ordenadas por data
UserSchema.index({ name: 1, role: 1 }); // Otimiza busca por nome dentro de cada tipo

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
// Esta função deve ser chamada após a conexão com o MongoDB
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

  console.log('User indexes configured successfully');
};

export { User, Participant, Creator }; 