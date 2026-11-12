import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000,http://localhost:3001')
  .split(',')
  .map(origin => origin.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in development for smooth testing
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-role', 'x-user-email']
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request logger in development
if (process.env.NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
    });
    next();
  });
}

// Health Check API
app.get('/api/health', async (req, res) => {
  const dbStatus = await db.testConnection();
  
  res.status(dbStatus.connected ? 200 : 503).json({
    status: dbStatus.connected ? 'healthy' : 'degraded',
    service: 'NeedBridge AI Backend API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    uptime_seconds: Math.floor(process.uptime()),
    database: {
      connected: dbStatus.connected,
      name: dbStatus.database || process.env.DB_NAME,
      server_time: dbStatus.time || null,
      error: dbStatus.error || null
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/payments', paymentRoutes);

// Root informational endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to NeedBridge AI REST API',
    documentation: '/api/health',
    endpoints: {
      auth: '/api/auth',
      requests: '/api/requests',
      donations: '/api/donations',
      ai: '/api/ai',
      payments: '/api/payments'
    }
  });
});

// 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, async () => {
    console.log(`====================================================`);
    console.log(` NeedBridge AI Backend Server running on port ${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(` Health check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);

    const dbCheck = await db.testConnection();
    if (dbCheck.connected) {
      console.log(`✓ Connected to PostgreSQL (${dbCheck.database}) on port ${process.env.DB_PORT || 5433}`);
    } else {
      console.warn(`✗ PostgreSQL connection error:`, dbCheck.error);
    }
  });
}

export default app;

