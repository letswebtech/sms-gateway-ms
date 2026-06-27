require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { initializeFirebase } = require('../config/firebase');
const smsRoutes = require('./routes/sms');
const callbackRoutes = require('./routes/callback');
const gatewayRoutes = require('./routes/gateway');
const logger = require('./utils/logger');
const { getPendingCount } = require('./services/deliveryTracker');

// ── Bootstrap ────────────────────────────────────────────────────────────────
initializeFirebase();

const app = express();
app.set('trust proxy', 1); // Railway sits behind a proxy

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(express.json());

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests – try again later' },
});
app.use('/api/sms', limiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/sms', smsRoutes);
app.use('/api/callback', callbackRoutes);
app.use('/api/gateway', gatewayRoutes);

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    pendingDeliveries: getPendingCount(),
    gatewayConfigured: !!process.env.GATEWAY_FCM_TOKEN,
    uptime: Math.floor(process.uptime()),
  });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed' || (err instanceof SyntaxError && err.status === 400 && 'body' in err)) {
    logger.warn('Malformed JSON payload', { error: err.message });
    return res.status(400).json({ error: 'Invalid JSON in request body' });
  }

  if (err.statusCode && err.statusCode >= 400 && err.statusCode < 500) {
    logger.warn('Client error', { statusCode: err.statusCode, error: err.message, code: err.code });
    return res.status(err.statusCode).json({ error: err.message, code: err.code });
  }

  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  return res.status(500).json({ error: 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT) || 3000;
app.listen(PORT, () => {
  logger.info(`SMS Gateway microservice running on port ${PORT}`);
});
