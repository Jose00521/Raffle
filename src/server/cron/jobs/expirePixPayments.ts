import mongoose from 'mongoose';
import { PaymentStatusEnum, PaymentMethodEnum } from '@/models/interfaces/IPaymentInterfaces';
import Payment from '@/models/Payment';
import logger from '@/lib/logger/logger';

/**
 * Job para expirar pagamentos PIX
 * - Verifica PIX com status PENDING/INITIALIZED
 * - Expira PIX cuja data de expiração já passou
 * - Atualiza status para EXPIRED (não remove o documento)
 */
export async function expirePixPayments() {
  logger.info('Iniciando verificação de PIX expirados');
  
  try {
    // Encontrar todos os PIX pendentes cuja data de expiração já passou
    const now = new Date();
    const pixToExpire = await Payment!.find({
      paymentMethod: PaymentMethodEnum.PIX,
      status: { $in: [PaymentStatusEnum.PENDING, PaymentStatusEnum.INITIALIZED] },
      expiresAt: { $lte: now }
    }).populate('userId', 'name email userCode')
      .populate('campaignId', 'title campaignCode');
    
    if (pixToExpire.length === 0) {
      logger.info('Nenhum PIX para expirar');
      return;
    }
    
    logger.info(`Encontrados ${pixToExpire.length} PIX para expirar`);
    
    // Iniciar sessão para transação
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Atualizar cada PIX para o status EXPIRED
      for (const payment of pixToExpire) {
        payment.status = PaymentStatusEnum.EXPIRED;
        payment.updatedAt = now;
        await payment.save({ session });
        
        const paymentCode = payment.paymentCode || '';
        const campaignCode = (payment.campaignId as any)?.campaignCode || '';
        
        logger.info(`PIX ${paymentCode} expirado com sucesso`, {
          paymentId: payment._id,
          paymentCode,
          campaignCode,
          amount: payment.amount,
          expiredAt: now.toISOString()
        });
        
        // TODO: Aqui você pode adicionar:
        // - Liberar números reservados
        // - Enviar notificação para o usuário
        // - Limpar cache relacionado
        // - Etc.
      }
      
      // Commit da transação
      await session.commitTransaction();
      logger.info(`${pixToExpire.length} PIX expirados com sucesso`);
      
    } catch (error) {
      // Rollback em caso de erro
      await session.abortTransaction();
      logger.error('Erro ao expirar PIX', { error });
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    logger.error('Erro ao processar job de expiração de PIX', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}

export default expirePixPayments; 