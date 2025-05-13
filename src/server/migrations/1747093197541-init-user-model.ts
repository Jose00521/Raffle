// Import your schemas here
import type { Connection } from 'mongoose'
import path from 'path'
import { fileURLToPath } from 'url'

export async function up (connection: Connection): Promise<void> {
  // Verificar se o modelo já existe
  if (connection.modelNames().includes('User')) {
    console.log('Modelo User já existe, pulando...');
    return;
  }

  // Importar o modelo User do projeto
  try {
    // Tentar importar diretamente
    const { default: UserModel } = await import('../../models/User');
    
    // Obter o schema do modelo
    const UserSchema = UserModel.schema;
    
    // Registrar o modelo no Mongoose com a conexão da migração
    const User = connection.model('User', UserSchema);
    console.log('Modelo User criado com sucesso!');
  } catch (error) {
    console.error('Erro ao importar e registrar o modelo User:', error);
    throw error;
  }
}

export async function down (connection: Connection): Promise<void> {
  // Remover o modelo da coleção atual
  if (connection.modelNames().includes('User')) {
    // Dropar a coleção
    await connection.collections['users'].drop();
    console.log('Modelo User removido com sucesso!');
  }
}
