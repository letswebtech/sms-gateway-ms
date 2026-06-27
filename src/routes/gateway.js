const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * POST /api/gateway/register
 * Called by the Flutter gateway app on startup / FCM token refresh.
 *
 * Body: { fcmToken }
 *
 * In production you may want to persist this to a DB instead of process.env.
 * For simplicity, we update the in-process env and log it so you can update
 * your Railway env var manually (or use a DB-backed approach).
 */
router.post('/register', authMiddleware, (req, res) => {
  const { fcmToken } = req.body;

  if (!fcmToken || typeof fcmToken !== 'string' || fcmToken.length < 20) {
    return res.status(400).json({ error: 'Valid fcmToken is required' });
  }

  // Update in-memory (survives until next deploy)
  process.env.GATEWAY_FCM_TOKEN = fcmToken;
  logger.info('Gateway FCM token updated', { tokenPrefix: fcmToken.slice(0, 12) + '...' });

  return res.status(200).json({ registered: true });
});

/**
 * GET /api/gateway/status
 */
router.get('/status', authMiddleware, (req, res) => {
  const hasToken = !!process.env.GATEWAY_FCM_TOKEN;
  return res.json({
    gatewayConfigured: hasToken,
    tokenPrefix: hasToken ? process.env.GATEWAY_FCM_TOKEN.slice(0, 12) + '...' : null,
  });
});

module.exports = router;
