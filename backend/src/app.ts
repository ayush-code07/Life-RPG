import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import apiRouter from './routes';

export function createApp(): Application {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin:
        env.CORS_ORIGIN === '*'
          ? '*'
          : env.CORS_ORIGIN.split(',').map((s) => s.trim()),
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    })
  );

  // Body parsers
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // HTTP request logger
  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
  }

  // API Route mounting
  app.use('/api', apiRouter);

  // Root welcome route
  app.get('/', (req, res) => {
    res.json({
      name: 'Life RPG Backend Engine',
      version: '1.0.0',
      status: 'operational',
      docs: {
        health: '/api/health',
        profile: '/api/profile/me',
        attributes: '/api/attributes',
        items: '/api/items',
      },
    });
  });

  // 404 Handler
  app.use(notFoundHandler);

  // Global Zero-Crash Error Handler
  app.use(errorHandler);

  return app;
}
