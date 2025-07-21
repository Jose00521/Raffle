import mongoose from 'mongoose';
import { generateEntityCode } from './utils/idGenerator';
const Schema = mongoose.Schema;
import { ICreator, IRegularUser, IUser, IAdmin } from './interfaces/IUserInterfaces';
import { SecureDataUtils } from '@/utils/encryption';
import { maskCEP, maskComplement, maskNumber, maskStreet, maskCNPJ, maskCPF, maskEmail, maskPhone } from '@/utils/maskUtils';

/**
 * Base User Schema - Shared fields 
 */
const UserSchema = new Schema<IUser>({
  userCode: {
    type: String,
  },
  profilePicture: {
    type: String,
  },
  password: {
    type: String,
    select: false // Não retorna por padrão nas consultas
  },
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    index: true // Índice para buscas por nome
  },

  birthDate: {
    type: Date,
    index: true // Permite consultas por faixa etária
  },

  // CAMPOS TEMPORÁRIOS (só para receber dados)
  cpf: {
    type: String,
    select: false,  // ← Nunca aparece nas consultas
    required: false // ← Opcional (só existe durante criação)
  },
  email: {
    type: String,
    select: false,  // ← Nunca aparece nas consultas  
    required: false
  },
  phone: {
    type: String,
    select: false,  // ← Nunca aparece nas consultas
    required: false
  },


    // CPF - estrutura tripla
    cpf_encrypted: {
      type:{
        encrypted: String,
        iv: String,
        tag: String,
        keyVersion: String,
        aad: String
      },
      default: undefined
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
    type:{
      encrypted: String,
      iv: String,
      tag: String,
      keyVersion: String,
      aad: String
    },
    default: undefined
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
    type:{
      encrypted: String,
      iv: String,
      tag: String,
      keyVersion: String,
      aad: String
    },
    default: undefined
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


  address: {
    // ===== CAMPOS TEMPORÁRIOS (para criptografia) =====
    street: { type: String, select: false },
    number: { type: String, select: false },
    complement: { type: String, select: false },
    zipCode: { type: String, select: false },
    
    // ===== DADOS SENSÍVEIS CRIPTOGRAFADOS =====
    street_encrypted: {
      type: {
        encrypted: String,
        iv: String,
        tag: String,
        keyVersion: String,
        aad: String
      },
      default: undefined
    },
    number_encrypted: {
      type: {
        encrypted: String,
        iv: String,
        tag: String,
        keyVersion: String,
        aad: String
      },
      default: undefined
    },
    complement_encrypted: {
      type: {
        encrypted: String,
        iv: String,
        tag: String,
        keyVersion: String,
        aad: String
      },
      default: undefined
    },
    zipCode_encrypted: {
      type: {
        encrypted: String,
        iv: String,
        tag: String,
        keyVersion: String,
        aad: String
      },
      default: undefined
    },
    
    // ===== HASHES PARA BUSCA =====
    zipCode_hash: {
      type: String,
      index: true // Para busca por região
    },
    
    // ===== DADOS MASCARADOS (para exibição) =====
    street_display: { type: String, default: '' },
    number_display: { type: String, default: '' },
    complement_display: { type: String, default: '' },
    zipCode_display: { type: String, default: '' },
    
    // ===== DADOS NÃO-SENSÍVEIS (para filtros) =====
    city: { type: String, index: true },
    state: { type: String, index: true },
    neighborhood: String,
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


// MIDDLEWARE PRE-SAVE: Auto-criptografia
UserSchema.pre('save', async function(this: any, next) {

  try {

    
    // CRIPTOGRAFAR CPF
    if (this.cpf && !this.cpf_encrypted) {
      console.log('🔒 Criptografando CPF...');
      this.cpf_encrypted = SecureDataUtils.encryptCPF(this.cpf);
      this.cpf_hash = SecureDataUtils.hashDocument(this.cpf);
      this.cpf_display = maskCPF(this.cpf);
      this.cpf = undefined;
    }
    
    // CRIPTOGRAFAR EMAIL
    if (this.email && !this.email_encrypted) {
      console.log('🔒 Criptografando EMAIL...');
      this.email_encrypted = SecureDataUtils.encryptEmail(this.email);
      this.email_hash = SecureDataUtils.hashEmail(this.email);
      this.email_display = maskEmail(this.email);
      this.email = undefined;
    }
    
    // CRIPTOGRAFAR TELEFONE
    if (this.phone && !this.phone_encrypted) {
      console.log('🔒 Criptografando PHONE...');
      this.phone_encrypted = SecureDataUtils.encryptPhone(this.phone);
      this.phone_hash = SecureDataUtils.hashPhone(this.phone);
      this.phone_display = maskPhone(this.phone);
      this.phone = undefined;
    }

    // CRIPTOGRAFAR ENDEREÇO
if (this.address) {
  if (this.address.street && !this.address.street_encrypted) {
    this.address.street_encrypted = SecureDataUtils.encryptStreet(this.address.street);
    this.address.street_display = maskStreet(this.address.street);
    this.address.street = undefined;
  }
  
  if (this.address.number && !this.address.number_encrypted) {
    this.address.number_encrypted = SecureDataUtils.encryptNumber(this.address.number);
    this.address.number_display = maskNumber(this.address.number);
    this.address.number = undefined;
  }
  
  if (this.address.complement && !this.address.complement_encrypted) {
    this.address.complement_encrypted = SecureDataUtils.encryptComplement(this.address.complement);
    this.address.complement_display = maskComplement(this.address.complement);
    this.address.complement = undefined;
  }
  
  if (this.address.zipCode && !this.address.zipCode_encrypted) {
    this.address.zipCode_encrypted = SecureDataUtils.encryptZipCode(this.address.zipCode);
    this.address.zipCode_hash = SecureDataUtils.hashZipCode(this.address.zipCode);
    this.address.zipCode_display = maskCEP(this.address.zipCode);
    this.address.zipCode = undefined;
  }
}
    
    console.log('✅ PRE-SAVE CONCLUÍDO COM SUCESSO');
    next();
  } catch (error) {
    console.error('❌ ERRO NO PRE-SAVE:', error);
    next(error as Error);
  }
});


// Índices compostos para consultas comuns
UserSchema.index({ role: 1, createdAt: -1 }); // Facilita consultas por tipo e ordenadas por data
UserSchema.index({ name: 1, role: 1 }); // Otimiza busca por nome dentro de cada tipo
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
  return this.findOne({ email_hash: SecureDataUtils.hashEmail(email) });
};

// Modelo base
const User = mongoose.models.User || mongoose.model('User', UserSchema);

/**
 * Schema para Usuário Regular/Participante
 */
const RegularUserSchema = new Schema<IRegularUser>({

  birthDate: {
    type: Date,
    index: true // Permite consultas por faixa etária
  },
  socialName: String,

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
const CreatorSchema = new Schema<ICreator>({
  // Campo discriminador para o tipo de pessoa (física ou jurídica)
  personType: {
    type: String,
    enum: ['individual', 'company'],
    required: true,
    index: true
  },
  // Campos comuns para todos os tipos de criador
  birthDate: {
    type: Date, // Obrigatório tanto para PF quanto para representante de PJ
    index: true
  },

    // CAMPO TEMPORÁRIO PARA CNPJ
    cnpj: {
      type: String,
      select: false,
      required: false
    },
    // CNPJ - estrutura tripla
    cnpj_encrypted: {
      type:{
        encrypted: String,
        iv: String,
        tag: String,
        keyVersion: String,
        aad: String
      },
      default: undefined
    },
    cnpj_hash: {
      type: String,
      unique: true,
      sparse: true,
      index: true // Para busca rápida
    },
    cnpj_display: {
      type: String,
      default: ''
    },
  // Representante legal (usado apenas para PJ)
  legalRepresentative: {
    type: String,
    required: function(this: any) { return this.personType === 'company'; }
  },
  companyName: {
    type: String,
    required: function(this: any) { return this.personType === 'company'; }
  },
  legalName: {
    type: String,
    required: function(this: any) { return this.personType === 'company'; }
  },
  companyCategory: {
    type: String,
    required: function(this: any) { return this.personType === 'company'; }
  },
  //gateway
  defaultGateway: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserPaymentGateway'
  },

  gateways: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserPaymentGateway'
  }],
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
    campaignsCompleted: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    lastRaffleCreated: Date
  },
  consents: {
    marketingEmails: { type: Boolean, default: false },
    termsAndConditions: { type: Boolean, default: true },
    dataSharing: { type: Boolean, default: false }
  },
});

// Adiciona métodos estáticos ao schema de Creator (antes de criar o modelo)
CreatorSchema.statics = {
  // Método auxiliar para criar criador pessoa física
  createIndividual: function(data: any) {
    return this.create({
      ...data,
      personType: 'individual'
    });
  },

  // Método auxiliar para criar criador pessoa jurídica
  createCompany: function(data: any) {
    return this.create({
      ...data,
      personType: 'company'
    });
  },

  // Método para buscar criadores pessoa física
  findIndividuals: function() {
    return this.find({ role: 'creator', personType: 'individual' });
  },

  // Método para buscar criadores pessoa jurídica
  findCompanies: function() {
    return this.find({ role: 'creator', personType: 'company' });
  }
};

// ✅ ADICIONE no src/models/User.ts no CreatorSchema
CreatorSchema.pre('save', async function(this: any, next) {
  try {
    // CRIPTOGRAFAR CNPJ (específico para Creator)
    if (this.cnpj && !this.cnpj_encrypted) {
      this.cnpj_encrypted = SecureDataUtils.encryptCNPJ(this.cnpj);
      this.cnpj_hash = SecureDataUtils.hashDocument(this.cnpj);
      this.cnpj_display = maskCNPJ(this.cnpj);
      this.cnpj = undefined;
    }
    
    next();
  } catch (error) {
    next(error as Error);
  }
});

/**
 * Schema para Usuário Admin
 */
const AdminSchema = new Schema<IAdmin>({
  // Permissões específicas do admin
  permissions: [{
    type: String,
    enum: [
      'GATEWAY_MANAGEMENT',
      'USER_MANAGEMENT', 
      'CAMPAIGN_MANAGEMENT',
      'PAYMENT_MANAGEMENT',
      'SYSTEM_SETTINGS',
      'AUDIT_ACCESS',
      'SECURITY_MANAGEMENT',
      'FULL_ACCESS'
    ],
    required: true
  }],
  
  // Dados da criação via convite
  inviteUsed: {
    inviteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminInvite'
    },
    inviteToken: String,
    usedAt: Date
  },
  
  // Configurações específicas do admin
  adminSettings: {
    notificationPreferences: {
      emailAlerts: { type: Boolean, default: true },
      systemAlerts: { type: Boolean, default: true },
      securityAlerts: { type: Boolean, default: true }
    },
    accessLevel: {
      type: String,
      enum: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'],
      default: 'ADMIN'
    },
    lastPasswordChange: Date,
    mustChangePassword: { type: Boolean, default: false }
  },
  
  // // Auditoria de ações (dados recentes)
  // auditLog: {
  //   lastActions: [{
  //     action: String,
  //     target: String,
  //     targetId: String,
  //     details: mongoose.Schema.Types.Mixed,
  //     timestamp: { type: Date, default: Date.now },
  //     ip: String,
  //     userAgent: String,
  //     result: {
  //       type: String,
  //       enum: ['SUCCESS', 'FAILED', 'PARTIAL'],
  //       default: 'SUCCESS'
  //     }
  //   }],
  //   totalActions: { type: Number, default: 0 },
  //   lastLogin: Date,
  //   loginHistory: [{
  //     timestamp: Date,
  //     ip: String,
  //     userAgent: String,
  //     success: { type: Boolean, default: true },
  //     location: {
  //       country: String,
  //       city: String
  //     }
  //   }]
  // },
  
  // Dados de verificação adicional (2FA, etc)
  security: {
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },
    backupCodes: [{ type: String, select: false }],
    lastSecurityCheck: Date
  },
  
  // Metadados de criação
  metadata: {
    createdBy: { type: String, required: false },
    createdVia: {
      type: String,
      enum: ['INVITE', 'DIRECT', 'MIGRATION'],
      default: 'INVITE'
    },
    ipCreated: String,
    userAgentCreated: String,
    activatedAt: Date,
    deactivatedAt: Date,
    deactivatedBy: String,
    deactivatedReason: String
  }
});

// Adiciona métodos estáticos ao schema de Admin (antes de criar o modelo)
AdminSchema.statics = {
  // Método auxiliar para criar usuário admin
  createAdmin: function(data: any) {
    return this.create({
      ...data,
      role: 'admin'
    });
  },

  // Método para buscar usuários admin
  findAdmins: function() {
    return this.find({ role: 'admin' });
  }
};

// ✅ ADICIONE no src/models/User.ts no AdminSchema
AdminSchema.pre('save', async function(this: any, next) {
  try {
    // Admin-specific pre-save logic can be added here
    // Password will be handled by NextAuth or bcrypt in API routes
    next();
  } catch (error) {
    next(error as Error);
  }
});


// Criar modelos utilizando discriminators
let RegularUser: mongoose.Model<IUser>, 
Participant:mongoose.Model<IUser>, 
Creator:mongoose.Model<ICreator>,
Admin:mongoose.Model<IAdmin>;

// Cria o modelo de usuário regular
if (!mongoose.models.user) {
  RegularUser = User.discriminator('user', RegularUserSchema) as mongoose.Model<IUser>;
} else {
  RegularUser = mongoose.models.user as mongoose.Model<IUser>;
}

// Cria o modelo de participante (usando o mesmo schema do usuário regular)
if (!mongoose.models.participant) {
  Participant = User.discriminator('participant', RegularUserSchema) as mongoose.Model<IUser>;
} else {
  Participant = mongoose.models.participant as mongoose.Model<IUser>;
}

// Cria o modelo base de Creator
if (!mongoose.models.creator) {
  Creator = User.discriminator('creator', CreatorSchema) as mongoose.Model<ICreator>;
} else {
  Creator = mongoose.models.creator as mongoose.Model<ICreator>;
}

// Cria o modelo de usuário admin
if (!mongoose.models.admin) {
  Admin = User.discriminator('admin', AdminSchema) as mongoose.Model<IAdmin>;
} else {
  Admin = mongoose.models.admin as mongoose.Model<IAdmin>;
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
    { cpf_hash: 1 },
    { 
      unique: true,
      partialFilterExpression: { role: "participant" },
      background: true
    }
  );

  // Índice único parcial para CPFs de usuários regulares
  await db.collection('users').createIndex(
    { cpf_hash: 1 },
    { 
      unique: true,
      partialFilterExpression: { role: "user" },
      background: true
    }
  );

  // Índice único parcial para CPFs de criadores (independente do tipo)
  await db.collection('users').createIndex(
    { cpf_hash: 1 },
    { 
      unique: true,
      partialFilterExpression: { role: "creator" },
      background: true
    }
  );

  // Índice único parcial para CNPJs de criadores pessoa jurídica
  await db.collection('users').createIndex(
    { cnpj_hash: 1 },
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

export { User, RegularUser, Participant, Creator, Admin } 