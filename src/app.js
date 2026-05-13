require('dotenv').config();
const setupSwagger = require('./config/swagger');
    
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const auditRoutes = require('./routes/audit.routes');           // 👈 add
const uploadRoutes = require('./routes/upload.routes');
const flagRoutes = require('./routes/flag.routes');
const { errorHandler, notFound } = require('./middleware/error.middleware');
const { sendSuccess } = require('./utils/response');

const app = express();

// ─── Connect to MongoDB ──────────────────────────────────────
connectDB();

// ─── Security headers ────────────────────────────────────────
app.use(helmet());

// ─── CORS ────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);

// ─── Request logging ─────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ─── Body parsing ────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── Rate limiters ───────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});

app.use(globalLimiter);

// ─── Health check ────────────────────────────────────────────
app.get('/health', (req, res) => {
  sendSuccess(res, {
    message: 'Server is running',
    data: {
      status: 'ok',
      env: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
  });
});

// ─── API routes ──────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/audits', auditRoutes);                           // 👈 add
app.use('/api/upload', uploadRoutes);
app.use('/api/flags', flagRoutes);

setupSwagger(app);

// ─── 404 + global error handler ─────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start server ────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`[SERVER] Running on http://localhost:${PORT} (${process.env.NODE_ENV})`);
});

module.exports = app;
