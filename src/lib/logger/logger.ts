import pino from 'pino';
import { EventEmitter } from 'events';

// Increase default max listeners to prevent warnings
// This is a global setting that affects all EventEmitter instances
EventEmitter.defaultMaxListeners = 50;

// Create a singleton logger instance
let loggerInstance: pino.Logger | null = null;

function createLogger(): pino.Logger {
  if (loggerInstance) {
    return loggerInstance;
  }

  // Use pino-pretty only in development
  const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production';

  
  let config: pino.LoggerOptions;
  
  if (isDevelopment) {
    config = {
      level: process.env.LOG_LEVEL || 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          colorizeObjects: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    };
    console.log('Using pino-pretty for development');
  } else {
    // Production configuration - just JSON output
    config = {
      level: process.env.LOG_LEVEL || 'info',
    };
    console.log('Using JSON output for production');
  }

  loggerInstance = pino(config);

  return loggerInstance;
}

const logger = createLogger();

export default logger;
