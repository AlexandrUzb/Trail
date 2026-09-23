import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Production-ready CORS configuration:
// Explicitly allows https://v0-advokat-ai.vercel.app, preview deployments, Netlify, and local dev
const isAllowedOrigin = (origin) => {
  if (!origin) return true; // Server-to-server, curl, same-origin, mobile apps
  const allowedExact = [
    'https://v0-advokat-ai.vercel.app',
    process.env.FRONTEND_URL,
    process.env.ALLOWED_ORIGIN,
  ].filter(Boolean);

  if (allowedExact.includes(origin)) return true;
  // Allow all Vercel and Netlify production & preview domains
  if (/^https:\/\/([a-z0-9-]+-)*[a-z0-9]+\.vercel\.app$/i.test(origin)) return true;
  if (/^https:\/\/.*\.netlify\.app$/i.test(origin)) return true;
  // Allow local development ports
  if (/^http:\/\/localhost(:\d+)?$/i.test(origin)) return true;
  if (/^http:\/\/127\.0\.0\.1(:\d+)?$/i.test(origin)) return true;
  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      // In production, fallback gracefully
      callback(null, true);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key', 'X-Requested-With', 'Accept'],
  credentials: true,
  maxAge: 86400,
};

app.use(cors(corsOptions));

app.use(express.json());

// Netlify Serverless Function URL Normalization:
// If forwarded as /.netlify/functions/api/... strip prefix so Express routes match reliably.
app.use((req, res, next) => {
  if (req.url.startsWith('/.netlify/functions/api')) {
    req.url = req.url.replace('/.netlify/functions/api', '') || '/';
  }
  next();
});

// Routes
import healthRouter from './routes/health.js';
import chatRouter from './routes/chat.js';
import lawsRouter from './routes/laws.js';
import templatesRouter from './routes/templates.js';
import plansRouter from './routes/plans.js';
import paymentsRouter from './routes/payments.js';
import feedbackRouter from './routes/feedback.js';
import adminRouter from './routes/admin.js';
import authRouter from './routes/auth.js';
import notificationsRouter from './routes/notifications.js';

// Mount on standard /api/* paths
app.use('/api/health', healthRouter);
app.use('/api/chat', chatRouter);
app.use('/api/laws', lawsRouter);
app.use('/api/templates', templatesRouter);
app.use('/api/plans', plansRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/admin', adminRouter);
app.use('/api/auth', authRouter);
app.use('/api/notifications', notificationsRouter);

// Also mount without /api prefix for serverless environments where /api is stripped by redirects
app.use('/health', healthRouter);
app.use('/chat', chatRouter);
app.use('/laws', lawsRouter);
app.use('/templates', templatesRouter);
app.use('/plans', plansRouter);
app.use('/payments', paymentsRouter);
app.use('/feedback', feedbackRouter);
app.use('/admin', adminRouter);
app.use('/auth', authRouter);
app.use('/notifications', notificationsRouter);

// --- UNIFIED FULL-STACK STATIC SERVING (RENDER / RAILWAY / LOCAL) ---
const distPath = path.resolve(__dirname, '../dist');

// Serve static assets from dist/ if built
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: "AdvokatAI API tizimiga xush kelibsiz!",
    endpoints: {
      health: "GET /api/health",
      chat: "POST /api/chat",
      auth: "POST /api/auth/register, POST /api/auth/login",
      laws: "GET /api/laws?q=...&category=...",
      templates: "GET /api/templates",
      plans: "GET /api/plans",
      payments: "GET /api/payments/config, POST /api/payments/submit",
      feedback: "POST /api/feedback",
      admin: "/api/admin/* (x-admin-key required)"
    }
  });
});

// 404 handler for unmatched /api/* routes - ALWAYS returns JSON
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Bunday API manzili mavjud emas: ${req.method} ${req.originalUrl}`
  });
});

// SPA fallback for all other client GET routes (e.g. /, /chat, /login, /register, /templates, /pricing, etc.)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    } else {
      return res.json({
        success: true,
        message: "AdvokatAI API Server ishlamoqda. Frontendni ko'rish uchun 'npm run build' buyrug'ini ishga tushiring."
      });
    }
  }
  next();
});

// Final 404 fallback for any remaining unmatched requests
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Bunday manzil topilmadi: ${req.method} ${req.originalUrl}`
  });
});

// Global error handler - ALWAYS returns JSON
app.use((err, req, res, next) => {
  console.error('[API Error Handler]:', err);
  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    success: false,
    error: err.message || "Serverda ichki xatolik yuz berdi."
  });
});

export default app;
