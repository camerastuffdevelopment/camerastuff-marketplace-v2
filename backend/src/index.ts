import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import { PrismaClient } from '@prisma/client';
import authRouter from './routes/auth';
import listingsRouter from './routes/listings';
import messagesRouter from './routes/messages';
import uploadRouter from './routes/upload';

// Initialize Prisma client with database URL from environment
// Prisma 7 requires datasourceUrl when schema has no url field
const prisma = new PrismaClient({
  // @ts-ignore - datasourceUrl is valid in Prisma 7
  datasourceUrl: config.DATABASE_URL,
});

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(
  cors({
    origin: config.FRONTEND_URL,
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
app.use('/api/auth', authRouter);
app.use('/api/listings', listingsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/upload', uploadRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
const PORT = parseInt(config.PORT, 10) || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Environment: ${config.NODE_ENV}`);
  console.log(`✓ Frontend URL: ${config.FRONTEND_URL}`);
});

export default app;
// Fresh build trigger
