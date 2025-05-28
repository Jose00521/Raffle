import pino from 'pino';

const logger = pino({
  transport: {
    targets: [
      {
        level: 'info',
        target: 'pino-pretty',
        options: {
          colorize: true,
          colorizeObjects: true,
          colorizeScopes: true,
        },
      },
    ],
  },
});

export default logger;
