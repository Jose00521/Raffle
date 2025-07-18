// src/scripts/create-admin-invite.ts
import crypto from 'crypto';

import dotenv from 'dotenv';
dotenv.config({ path: '.env.example' });

import { DBConnection, dbInstance } from '@/server/lib/dbConnect';
import AdminInvite from '@/models/AdminInvite';
import { container } from '@/server/container/container';

interface CreateInviteOptions {
  email?: string;
  expiresInHours?: number;
  permissions?: string[];
  createdBy?: string;
}

// 🕐 Utilitários de tempo
export const TIME_PRESETS = {
  '30min': 0.5,
  '1h': 1,
  '2h': 2,
  '6h': 6,
  '12h': 12,
  '24h': 24,
  '72h': 72,
  '1week': 168
};

export function calculateExpirationDate(hours: number): Date {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + (hours * 60 * 60 * 1000));
  return expiresAt;
}

export function formatDuration(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)} minutos`;
  } else if (hours < 24) {
    return `${hours}h`;
  } else if (hours < 168) {
    return `${Math.round(hours / 24)} dias`;
  } else {
    return `${Math.round(hours / 168)} semanas`;
  }
}

export async function createAdminInvite(options: CreateInviteOptions = {}) {
  await dbInstance.connect();
  
  const {
    email,
    expiresInHours = 1,
    permissions = ['FULL_ACCESS'],
    createdBy = 'SYSTEM'
  } = options;

  // Gerar token seguro
  const token = crypto.randomBytes(32).toString('hex');
  
  // ✅ Usar utilitário para calcular expiração
  const expiresAt = calculateExpirationDate(expiresInHours);

  // Criar registro na collection
  const invite = await AdminInvite.create({
    token,
    email,
    expiresAt,
    permissions,
    createdBy,
    isUsed: false
  });

  const inviteLink = `${process.env.NEXTAUTH_URL}/cadastro-admin/${token}`;
  
  console.log('🎟️ CONVITE ADMIN CRIADO');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🔗 Link: ${inviteLink}`);
  console.log(`📧 Email: ${email || 'Não especificado'}`);
  console.log(`⏰ Criado: ${new Date().toLocaleString('pt-BR')}`);
  console.log(`⏰ Expira: ${expiresAt.toLocaleString('pt-BR')}`);
  console.log(`🕐 Duração: ${formatDuration(expiresInHours)}`);
  console.log(`🔑 Permissões: ${permissions.join(', ')}`);
  console.log(`🆔 ID: ${invite._id}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  return { invite, inviteLink };
}

// Uso via linha de comando
async function main() {
  const args = process.argv.slice(2);
  const email = args[0];
  const durationInput = args[1];
  
  // Determinar duração (aceita presets ou números)
  let expiresInHours: number;
  
  if (durationInput && TIME_PRESETS[durationInput as keyof typeof TIME_PRESETS]) {
    expiresInHours = TIME_PRESETS[durationInput as keyof typeof TIME_PRESETS];
  } else {
    expiresInHours = parseFloat(durationInput) || 1; // Default 1 hora
  }
  
  console.log('🚀 CRIANDO CONVITE ADMIN...');
  console.log(`📧 Email: ${email || 'Não especificado'}`);
  console.log(`⏰ Duração: ${formatDuration(expiresInHours)}`);
  console.log('');
  
  await createAdminInvite({
    email,
    expiresInHours,
    permissions: ['FULL_ACCESS']
  });
  
  console.log('');
  console.log('💡 EXEMPLOS DE USO:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('npm run create-admin                    # 1h por padrão');
  console.log('npm run create-admin admin@test.com     # 1h com email');
  console.log('npm run create-admin admin@test.com 30min');
  console.log('npm run create-admin admin@test.com 2h');
  console.log('npm run create-admin admin@test.com 24h');
  console.log('npm run create-admin admin@test.com 0.5  # 30 minutos');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  process.exit(0);
}

if (require.main === module) {
  main().catch(console.error);
}