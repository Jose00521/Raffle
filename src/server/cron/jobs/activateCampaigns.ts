// src/server/cron/jobs/activateCampaigns.ts
import mongoose from 'mongoose';
import { CampaignStatusEnum } from '@/models/interfaces/ICampaignInterfaces';
import Campaign from '@/models/Campaign';
import logger from '@/lib/logger/logger';
import { container } from '@/server/container/container';
import { SocketService } from '@/server/lib/socket/SocketService';

/**
 * Job para ativar campanhas agendadas
 * - Verifica campanhas com status SCHEDULED
 * - Ativa campanhas cuja data de ativação agendada já passou
 * - Notifica criadores via Socket.IO
 */
export async function activateCampaigns() {
  logger.info('Iniciando verificação de campanhas agendadas');
  
  try {
    // Encontrar todas as campanhas agendadas (SCHEDULED) cujo tempo de ativação já passou
    const now = new Date();
    const campaignsToActivate = await Campaign.find({
      status: CampaignStatusEnum.SCHEDULED,
      scheduledActivationDate: { $lte: now },
      canceled: false
    }).populate('createdBy', 'name email userCode');
    
    if (campaignsToActivate.length === 0) {
      logger.info('Nenhuma campanha para ativar');
      return;
    }
    
    logger.info(`Encontradas ${campaignsToActivate.length} campanhas para ativar`);
    
    // Obter serviço de Socket.IO para enviar notificações
    const socketService = container.resolve<SocketService>('socketService');
    
    // Verificar se o SocketService está inicializado
    if (!socketService.isInitialized()) {
      logger.error('SocketService não inicializado, as notificações não serão enviadas');
    }
    
    // Iniciar sessão para transação
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Atualizar cada campanha para o status ACTIVE
      for (const campaign of campaignsToActivate) {
        campaign.status = CampaignStatusEnum.ACTIVE;
        campaign.activatedAt = now;
        await campaign.save({ session });
        
        const creatorId = campaign.createdBy?.userCode || '';
        const campaignId = campaign.campaignCode || '';
        
        logger.info(`Campanha ${campaignId} ativada com sucesso`, {
          campaignId: campaign._id,
          title: campaign.title
        });
        
        // Enviar notificação via Socket.IO para o criador da campanha
        try {
          if (socketService.isInitialized() && creatorId) {
            logger.info(`Tentando notificar criador ${creatorId} sobre ativação da campanha ${campaignId}`);
            
            socketService.notifyCampaignCreator(
              creatorId,
              campaign.createdBy?.role,
              campaignId,
              'campaign:activated',
              {
                data: campaign.toObject(),
                message: `Sua campanha "${campaign.title}" foi ativada automaticamente!`,
                status: 'ACTIVE',
                activatedAt: now.toISOString()
              }
            );
            
          } else {
            logger.warn(`Não foi possível enviar notificação: SocketService não inicializado ou creatorId vazio`);
          }
        } catch (notificationError) {
          logger.error(`Erro ao enviar notificação para a campanha ${campaignId}:`, notificationError);
          // Não interromper o processo por causa de erro na notificação
        }
      }
      
      // Commit da transação
      await session.commitTransaction();
      logger.info(`${campaignsToActivate.length} campanhas ativadas com sucesso`);
    } catch (error) {
      // Rollback em caso de erro
      await session.abortTransaction();
      logger.error('Erro ao ativar campanhas agendadas', { error });
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    logger.error('Erro ao processar job de ativação de campanhas', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}

export default activateCampaigns;