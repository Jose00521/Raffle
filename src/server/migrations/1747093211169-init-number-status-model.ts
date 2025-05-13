// Import your schemas here
import type { Connection } from 'mongoose'
import path from 'path'

export async function up (connection: Connection): Promise<void> {
  // Verificar se o modelo já existe
  if (connection.modelNames().includes('NumberStatus')) {
    console.log('Modelo NumberStatus já existe, pulando...');
    return;
  }

  // Importar o modelo NumberStatus do projeto
  try {
    // Tentar importar diretamente
    const { default: NumberStatusModel } = await import('../../models/NumberStatus');
    // Obter o schema do modelo
    const NumberStatusSchema = NumberStatusModel?.schema;
    
    // Registrar o modelo no Mongoose com a conexão da migração
    const NumberStatus = connection.model('NumberStatus', NumberStatusSchema);
    console.log('Modelo NumberStatus criado com sucesso!');
  } catch (error) {
    console.error('Erro ao importar e registrar o modelo NumberStatus:', error);
    throw error;
  }
}

export async function down (connection: Connection): Promise<void> {
  // Remover o modelo da coleção atual
  if (connection.modelNames().includes('NumberStatus')) {
    // Dropar a coleção
    await connection.collections['numberstatuses'].drop();
    console.log('Modelo NumberStatus removido com sucesso!');
  }
}
