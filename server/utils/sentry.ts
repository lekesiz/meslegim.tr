/**
 * Sentry Error Tracking Configuration
 * 
 * Provides error tracking and performance monitoring for production.
 */

import * as Sentry from '@sentry/node';
import logger from './logger';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import type { Express } from 'express';

/**
 * Initialize Sentry
 */
export function initSentry(app: Express) {
  // Only initialize in production or if SENTRY_DSN is provided
  const sentryDsn = process.env.SENTRY_DSN;
  
  if (!sentryDsn) {
    logger.info('[Sentry] Skipping initialization - SENTRY_DSN not provided');
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    environment: process.env.NODE_ENV || 'development',
    
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Set profilesSampleRate to 1.0 to profile every transaction.
    // Since profilesSampleRate is relative to tracesSampleRate,
    // the final profiling rate can be computed as tracesSampleRate * profilesSampleRate
    // For example, a tracesSampleRate of 0.5 and profilesSampleRate of 0.5 would
    // results in 25% of transactions being profiled (0.5*0.5=0.25)
    profilesSampleRate: 1.0,
    
    integrations: [
      // Enable HTTP calls tracing
      Sentry.httpIntegration(),
      // Enable Express.js middleware tracing
      Sentry.expressIntegration(),
      // Enable Profiling
      nodeProfilingIntegration(),
    ],
    
    // Ignore certain errors
    ignoreErrors: [
      // Browser errors
      'Non-Error promise rejection captured',
      'ResizeObserver loop limit exceeded',
      // Network errors
      'Network request failed',
      'NetworkError',
      // Timeout errors
      'timeout',
      'ETIMEDOUT',
    ],
    
    // Before send hook - filter sensitive data
    beforeSend(event, hint) {
      // Remove sensitive data from event
      if (event.request) {
        // Remove cookies
        delete event.request.cookies;
        
        // Remove authorization headers
        if (event.request.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.cookie;
        }
        
        // Remove sensitive query params
        if (event.request.query_string && typeof event.request.query_string === 'string') {
          event.request.query_string = event.request.query_string
            .replace(/password=[^&]*/gi, 'password=[REDACTED]')
            .replace(/token=[^&]*/gi, 'token=[REDACTED]')
            .replace(/api_key=[^&]*/gi, 'api_key=[REDACTED]');
        }
      }
      
      // Remove sensitive data from extra context
      if (event.extra) {
        const sensitiveKeys = ['password', 'token', 'api_key', 'secret', 'apiKey'];
        for (const key of sensitiveKeys) {
          if (key in event.extra) {
            event.extra[key] = '[REDACTED]';
          }
        }
      }
      
      return event;
    },
  });

  logger.info('[Sentry] Initialized successfully');
}

/**
 * Get Sentry request handler middleware
 */
export function getSentryRequestHandler() {
  // Note: In @sentry/node v10+, handlers are automatically set up via setupExpressErrorHandler
  // This function is kept for backward compatibility
  return (req: any, res: any, next: any) => next();
}

/**
 * Get Sentry tracing middleware
 */
export function getSentryTracingHandler() {
  // Note: Tracing is automatically handled by Sentry.init integrations
  return (req: any, res: any, next: any) => next();
}

/**
 * Setup Sentry error handler for Express
 * Should be called after all routes but before other error handlers
 */
export function setupSentryErrorHandler(app: Express) {
  Sentry.setupExpressErrorHandler(app);
}

/**
 * Manually capture an exception
 */
export function captureException(error: Error | unknown, context?: Record<string, any>) {
  if (context) {
    Sentry.setContext('custom', context);
  }
  Sentry.captureException(error);
}

/**
 * Manually capture a message
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>) {
  if (context) {
    Sentry.setContext('custom', context);
  }
  Sentry.captureMessage(message, level);
}

/**
 * Set user context for error tracking
 */
export function setUserContext(user: { id: string; email?: string; username?: string }) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
}

/**
 * Clear user context
 */
export function clearUserContext() {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(message: string, category: string, data?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
}
