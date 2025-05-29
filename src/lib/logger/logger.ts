import pino from 'pino';
import { EventEmitter } from 'events';

// Increase default max listeners to prevent warnings
// This is a global setting that affects all EventEmitter instances
EventEmitter.defaultMaxListeners = 20;

// Create a singleton logger instance
let loggerInstance: pino.Logger | null = null;

function createLogger(): pino.Logger {
  if (loggerInstance) {
    return loggerInstance;
  }

  loggerInstance = pino({
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

  return loggerInstance;
}

const logger = createLogger();

export default logger;
