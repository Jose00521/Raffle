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

  // Simple check: if we're not in production, use pino-pretty
  const isProduction = process.env.NODE_ENV === 'production';

    // Use pino-pretty only in development
    const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production';
  
    console.log('Logger Configuration:', {
      NODE_ENV: process.env.NODE_ENV,
      isDevelopment,
      timestamp: new Date().toISOString()
    });
  
  let config: pino.LoggerOptions;
  
  if (!isProduction) {
    // Development/other - use pino-pretty
    config = {
      level: process.env.LOG_LEVEL || 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    };
  } else {
    // Production - JSON output
    config = {
      level: process.env.LOG_LEVEL || 'info',
    };
  }

  loggerInstance = pino(config);
  return loggerInstance;
}

const logger = createLogger();

export default logger;
