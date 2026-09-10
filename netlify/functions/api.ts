import 'dotenv/config';
import serverless from 'serverless-http';
import express, { Request, Response, NextFunction } from 'express';
import { apiRouter } from '../../src/server/api';
import { initDatabase, getDbConfig } from '../../src/server/db';

const app = express();

// CORS Headers for API
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Strip Netlify internal prefix if present
app.use((req, _res, next) => {
  if (req.url.startsWith('/.netlify/functions/api')) {
    req.url = req.url.replace('/.netlify/functions/api', '') || '/';
  }
  next();
});

// Middleware to ensure database pool is ready
let dbInitialized = false;
app.use(async (_req: Request, _res: Response, next: NextFunction) => {
  const config = getDbConfig();
  if (config.isConfigured && !dbInitialized) {
    try {
      await initDatabase();
      dbInitialized = true;
    } catch (err: any) {
      console.error('[Netlify Function MySQL init error]:', err.message);
    }
  }
  next();
});

// Mount router at both /api and root to handle any redirect permutation
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Netlify Function Error]:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Une erreur interne est survenue sur la fonction Netlify.',
  });
});

const serverlessHandler = serverless(app);

export const handler = async (event: any, context: any) => {
  // Prevent Lambda from waiting for MySQL pool keepalive handles
  context.callbackWaitsForEmptyEventLoop = false;
  return serverlessHandler(event, context);
};
