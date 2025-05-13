// Import your schemas here
import type { Connection } from 'mongoose'
import path from 'path'

export async function up (connection: Connection): Promise<void> {
  // Verificar se o modelo já existe
  if (connection.modelNames().includes('Campaign')) {
    console.log('Modelo Campaign já existe, pulando...');
    return;
  }

  // Importar o modelo Campaign do projeto
  try {
    // Tentar importar diretamente
    const { default: CampaignModel } = await import('../../models/Campaign');
    
    // Obter o schema do modelo
    const CampaignSchema = CampaignModel.schema;
    
    // Registrar o modelo no Mongoose com a conexão da migração
    const Campaign = connection.model('Campaign', CampaignSchema);
    console.log('Modelo Campaign criado com sucesso!');
  } catch (error) {
    console.error('Erro ao importar e registrar o modelo Campaign:', error);
    throw error;
  }
}

export async function down (connection: Connection): Promise<void> {
  // Remover o modelo da coleção atual
  if (connection.modelNames().includes('Campaign')) {
    // Dropar a coleção
    await connection.collections['campaigns'].drop();
    console.log('Modelo Campaign removido com sucesso!');
  }
}
