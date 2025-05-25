import mongoose from 'mongoose';
import { generateEntityCode } from './utils/idGenerator';
const Schema = mongoose.Schema;
import { IRegularUser } from './interfaces/IUserInterfaces';
import { IParticipant, IIndividualCreator, ICompanyCreator } from './interfaces/UserModels';

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
// Modifique o hook pre-save em src/models/User.ts
// UserSchema.pre('save', function(this: any, next) {
//   if (!this.userCode && typeof window === 'undefined') {
//     // Só tente gerar o código se o _id já estiver definido
//     if (this._id) {
//       this.userCode = generateEntityCode(this._id, 'US');
//     } else {
//       // Se o _id ainda não estiver disponível, adie a geração para o próximo save
//       console.warn('_id não está disponível para gerar userCode. Será gerado no próximo save.');
//     }
//   }
//   next();
// });
// // Adicione um hook post-save para garantir que o código seja gerado se não foi feito no pre-save
// UserSchema.post('save', async function(this: any, doc, next) {
//   if (!doc.userCode && doc._id && typeof window === 'undefined') {
//     doc.userCode = generateEntityCode(doc._id, 'US');
//     await doc.save(); // Salva novamente para persistir o código
//   }
//   next();
// });

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
 * Schema para Usuário Regular/Participante
 */
const RegularUserSchema = new Schema({
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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rifa',
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
 * Schema Base de Criador (campos comuns)
 */
const BaseCreatorSchema = new Schema({
  // Campo discriminador para o tipo de pessoa (física ou jurídica)
  personType: {
    type: String,
    enum: ['individual', 'company'],
    required: true,
    index: true
  },
  // Campos comuns para todos os tipos de criador
  cpf: {
    type: String,
    required: true, // Obrigatório tanto para PF quanto para representante de PJ
    unique: true,
    sparse: true
  },
  birthDate: {
    type: Date,
    required: true, // Obrigatório tanto para PF quanto para representante de PJ
    index: true
  },
  // Conta bancária
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
  // Verificação documental
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
  // Estatísticas
  statistics: {
    rafflesCreated: { type: Number, default: 0 },
    activeRaffles: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    lastRaffleCreated: Date
  },
  consents: {
    marketingEmails: { type: Boolean, default: false },
    termsAndConditions: { type: Boolean, default: true },
    dataSharing: { type: Boolean, default: false }
  }
}, { discriminatorKey: 'personType' });

/**
 * Schema específico para Criador Pessoa Física
 * Não precisa de campos adicionais, pois os campos necessários (cpf, birthDate)
 * já estão no schema base.
 */
const IndividualCreatorSchema = new Schema({
  // Sem campos adicionais, pois cpf e birthDate já estão no schema base
});

/**
 * Schema específico para Criador Pessoa Jurídica
 */
const CompanyCreatorSchema = new Schema({
  // Campos específicos para pessoa jurídica
  cnpj: {
    type: String,
    required: true,
    unique: true,
    sparse: true
  },
    // Representante legal (usado apenas para PJ)
    representanteLegal: {
      type: String,
      required: function(this: any): boolean { return this.personType === 'company'; }
    },
  companyName: {
    type: String,
    required: true
  },
  legalName: {
    type: String,
    required: true
  },
  companyCategory: {
    type: String,
    required: true
  }
  // Nota: cpf, birthDate e representanteLegal estão no schema base
});

// Criar modelos utilizando discriminators
let RegularUser, Participant, Creator, IndividualCreator, CompanyCreator;

// Cria o modelo de usuário regular
if (!mongoose.models.user) {
  RegularUser = User.discriminator('user', RegularUserSchema);
} else {
  RegularUser = mongoose.models.user;
}

// Cria o modelo de participante (usando o mesmo schema do usuário regular)
if (!mongoose.models.participant) {
  Participant = User.discriminator('participant', RegularUserSchema);
} else {
  Participant = mongoose.models.participant;
}

// Cria o modelo base de Creator
if (!mongoose.models.creator) {
  Creator = User.discriminator('creator', BaseCreatorSchema);
} else {
  Creator = mongoose.models.creator;
}

// Cria os discriminators para tipos de Creator
if (Creator && !mongoose.models.individual) {
  IndividualCreator = Creator.discriminator('individual', IndividualCreatorSchema);
} else if (mongoose.models.individual) {
  IndividualCreator = mongoose.models.individual;
}

if (Creator && !mongoose.models.company) {
  CompanyCreator = Creator.discriminator('company', CompanyCreatorSchema);
} else if (mongoose.models.company) {
  CompanyCreator = mongoose.models.company;
}

// Configurar índices adicionais após a inicialização do mongoose
export const setupUserIndexes = async () => {
  const db = mongoose.connection.db;
  
  if (!db) {
    console.error('Database connection not established');
    return;
  }
  
  // Índice único parcial para CPFs de participantes
  await db.collection('users').createIndex(
    { cpf: 1 },
    { 
      unique: true,
      partialFilterExpression: { role: "participant" },
      background: true
    }
  );

  // Índice único parcial para CPFs de usuários regulares
  await db.collection('users').createIndex(
    { cpf: 1 },
    { 
      unique: true,
      partialFilterExpression: { role: "user" },
      background: true
    }
  );

  // Índice único parcial para CPFs de criadores (independente do tipo)
  await db.collection('users').createIndex(
    { cpf: 1 },
    { 
      unique: true,
      partialFilterExpression: { role: "creator" },
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
  
  // Índices para categorias de empresa
  await db.collection('users').createIndex(
    { categoriaEmpresa: 1 },
    { 
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
  
  console.log('User indexes configured successfully');
};

export { User, RegularUser, Participant, Creator, IndividualCreator, CompanyCreator }; 