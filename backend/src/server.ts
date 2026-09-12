import http from 'http';
import { createApp } from './app';
import { pool, checkDatabaseHealth } from './config/database';
import { env } from './config/env';
import { logger } from './utils/logger';

const app = createApp();
const server = http.createServer(app);

async function startServer() {
  try {
    // 1. Check database connectivity
    logger.info('🔍 Checking database connection...');
    const isHealthy = await checkDatabaseHealth();
    if (isHealthy) {
      logger.info('✅ Connected to PostgreSQL / Supabase successfully.');
    } else {
      logger.warn('⚠️ Could not connect to PostgreSQL on startup. Backend will retry on incoming requests.');
    }

    // 2. Start HTTP server
    server.listen(env.PORT, () => {
      logger.info(`⚔️ Life RPG Backend Engine listening on http://localhost:${env.PORT}`);
      logger.info(`⚡ Environment: ${env.NODE_ENV}`);
      logger.info(`🛡️ Zero-Crash Error Handling Layer Active`);
    });
  } catch (error: any) {
    logger.error('❌ Failed to start server:', error.message);
  }
}

// ==========================================
// Zero-Crash & Graceful Shutdown Handlers
// ==========================================

// Catch unhandled Promise rejections safely
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('💥 [Unhandled Rejection]:', {
    reason: reason?.message || reason,
    stack: reason?.stack,
  });
});

// Catch uncaught exceptions safely
process.on('uncaughtException', (error: Error) => {
  logger.error('💥 [Uncaught Exception]:', {
    message: error.message,
    stack: error.stack,
  });
});

// Graceful shutdown on termination signals
const shutdown = async (signal: string) => {
  logger.info(`🛑 Received ${signal}. Initiating graceful shutdown...`);
  server.close(async () => {
    logger.info('🔒 HTTP server closed.');
    try {
      await pool.end();
      logger.info('🔌 Database pool connections drained.');
    } catch (err: any) {
      logger.error('⚠️ Error closing database pool:', err.message);
    }
    process.exit(0);
  });

  // Force shutdown after 10s if dangling connections linger
  setTimeout(() => {
    logger.error('⚠️ Forcing shutdown after timeout.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

startServer();
