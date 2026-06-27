const express = require('express');
const { resolveDelivery } = require('../services/deliveryTracker');
const { authMiddleware } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * POST /api/callback/delivery
 * Called by the Flutter SMS gateway app after it attempts to send the SMS.
 *
 * Body: { messageId, success, error? }
 */
router.post('/delivery', authMiddleware, (req, res) => {
  const { messageId, success, error } = req.body;

  if (!messageId || typeof success !== 'boolean') {
    return res.status(400).json({ error: 'messageId and success (bool) are required' });
  }

  const resolved = resolveDelivery(messageId, success, error);

  if (!resolved) {
    // Already timed out or unknown – not a critical error
    logger.warn('Delivery callback for unknown/expired message', { messageId });
    return res.status(200).json({ acknowledged: false });
  }

  return res.status(200).json({ acknowledged: true });
});

module.exports = router;
