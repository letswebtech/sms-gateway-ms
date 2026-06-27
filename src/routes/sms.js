const express = require('express');
const Joi = require('joi');
const { sendOtpViaSms } = require('../services/fcmService');
const { authMiddleware } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

const sendSchema = Joi.object({
  phone: Joi.string()
    .pattern(/^\+[1-9]\d{6,14}$/)
    .required()
    .messages({
      'string.pattern.base': 'phone must be in E.164 format e.g. +919876543210',
    }),
  otp: Joi.string().alphanum().min(4).max(8).required(),
  template: Joi.string().max(320).optional(),
});

/**
 * POST /api/sms/send
 * Headers: Authorization: Bearer <API_SECRET_KEY>
 * Body:    { phone, otp, template? }
 *
 * Called by any of your backend services
 */
router.post('/send', authMiddleware, async (req, res) => {
  const { error, value } = sendSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { phone, otp, template } = value;

  try {
    const result = await sendOtpViaSms(phone, otp, template);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    logger.error('SMS send failed', { error: err.message, phone });

    if (err.statusCode === 400 || err.statusCode === 401 || err.statusCode === 403 || err.statusCode === 404) {
      return res.status(err.statusCode).json({
        error: err.message,
        code: err.code || 'SMS_REQUEST_INVALID',
      });
    }

    if (err.message.includes('timeout')) {
      return res.status(504).json({
        error: 'Gateway timeout – SMS relay app did not respond in time',
        code: 'DELIVERY_TIMEOUT',
      });
    }

    return res.status(500).json({
      error: 'Failed to send SMS',
      code: 'SMS_FAILED',
    });
  }
});

module.exports = router;
