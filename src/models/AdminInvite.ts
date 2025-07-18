import mongoose from 'mongoose';
import { AdminPermission } from './interfaces/IUserInterfaces';

export interface IAdminInvite {
  token: string;
  email?: string;
  expiresAt: Date;
  isUsed: boolean;
  createdBy: string;
  createdAt: Date;
  usedAt?: Date;
  usedBy?: mongoose.Types.ObjectId;
  permissions: AdminPermission[];
  metadata?: {
    ipCreated?: string;
    userAgentCreated?: string;
    ipUsed?: string;
    userAgentUsed?: string;
  };
}

const AdminInviteSchema = new mongoose.Schema<IAdminInvite>({
  // Token único de 64 caracteres
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Email do convidado (opcional mas recomendado)
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  
  // Data de expiração (obrigatória)
  expiresAt: {
    type: Date,
    required: true,
  },
  
  // Se já foi utilizado
  isUsed: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Quem criou o convite
  createdBy: {
    type: String, // ou ObjectId se tiver user
    required: true
  },
  
  // Quando foi usado
  usedAt: Date,
  
  // Quem usou (ID do admin criado)
  usedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Permissões que o admin terá
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
  
  // Metadados de segurança
  metadata: {
    ipCreated: String,
    userAgentCreated: String,
    ipUsed: String,
    userAgentUsed: String
  }
}, {
  timestamps: true
});

// Índice composto para consultas eficientes
AdminInviteSchema.index({ token: 1, isUsed: 1, expiresAt: 1 });

// TTL index para auto-remoção de convites expirados após 30 dias
AdminInviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 60 * 60 });

export default mongoose.models.AdminInvite || 
               mongoose.model<IAdminInvite>('AdminInvite', AdminInviteSchema); 