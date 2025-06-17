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

  // Use pino-pretty only in development and when available
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  let config: pino.LoggerOptions;
  
  if (isDevelopment) {
    try {
      // Check if pino-pretty is available (only in development)
      require.resolve('pino-pretty');
      config = {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            colorizeObjects: true,
            colorizeScopes: true,
          },
        },
      };
    } catch {
      // Fallback to JSON output if pino-pretty not available
      config = {
        level: process.env.LOG_LEVEL || 'info',
      };
    }
  } else {
    // Production configuration - just JSON output
    config = {
      level: process.env.LOG_LEVEL || 'info',
    };
  }

  loggerInstance = pino(config);

  return loggerInstance;
}

const logger = createLogger();

export default logger;
