export const CRON_CONFIG = {
    ACTIVATE_CAMPAIGNS: {
      schedule: '* * * * *', // Executa a cada minuto
      enabled: true
    },
    EXPIRE_PIX_PAYMENTS: {
      schedule: '*/2 * * * *', // Executa a cada 2 minutos
      enabled: true
    },
    RELEASE_EXPIRE_NUMBERS: {
      schedule: '* * * * *', // Executa a cada 2 minutos
      enabled: true
    }
  };