/**
 * Winston Logger Configuration
 * 
 * Provides structured logging with different log levels and transports.
 */

import winston from 'winston';
import path from 'path';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Tell winston about our colors
winston.addColors(colors);

// Define format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console(),
  
  // Error log file
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'error.log'),
    level: 'error',
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  
  // Combined log file
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'combined.log'),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
];

// Create logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  levels,
  format,
  transports,
});

export default logger;

// Helper functions for common log patterns
export const logError = (message: string, error?: Error | unknown, context?: any) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  logger.error(message, {
    error: errorMessage,
    stack: errorStack,
    context,
  });
};

export const logWarn = (message: string, context?: any) => {
  logger.warn(message, { context });
};

export const logInfo = (message: string, context?: any) => {
  logger.info(message, { context });
};

export const logDebug = (message: string, context?: any) => {
  logger.debug(message, { context });
};

export const logHttp = (message: string, context?: any) => {
  logger.http(message, { context });
};
