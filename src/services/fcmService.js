const { v4: uuidv4 } = require('uuid');
const { admin } = require('../../config/firebase');
const { waitForDelivery } = require('./deliveryTracker');
const logger = require('../utils/logger');
const { createError } = require('../utils/httpError');

/**
 * Sends a data-only FCM message to the Flutter gateway app.
 * The app reads `phone` and `otp` from the data payload and sends the real SMS.
 *
 * @param {string} phone  - E.164 phone number e.g. "+919876543210"
 * @param {string} otp    - One-time password string
 * @param {string} [template] - Optional SMS template override
 * @returns {Promise<{ messageId: string, status: string }>}
 */
async function sendOtpViaSms(phone, otp, template) {
  const gatewayToken = process.env.GATEWAY_FCM_TOKEN;
  if (!gatewayToken) {
    throw createError(502, 'Gateway is not configured yet', 'GATEWAY_NOT_CONFIGURED');
  }

  const messageId = uuidv4();
  const smsBody = template
    ? template.replace('{otp}', otp).replace('{phone}', phone)
    : `Your verification code is ${otp}. Valid for 10 minutes. Do not share it.`;

  const fcmMessage = {
    token: gatewayToken,
    data: {
      type: 'SEND_SMS',
      messageId,
      phone,
      otp,
      body: smsBody,
    },
    android: {
      priority: 'high',
      // TTL of 0 – deliver immediately or drop; OTPs are time-sensitive
      ttl: 0,
    },
  };

  logger.info(`Dispatching SMS OTP via FCM`, { messageId, phone: maskPhone(phone) });

  // Register the pending delivery BEFORE sending FCM to avoid a race condition
  const deliveryPromise = waitForDelivery(messageId, parseInt(process.env.DELIVERY_TIMEOUT_MS) || 30_000);

  await admin.messaging().send(fcmMessage);
  logger.debug(`FCM message accepted`, { messageId });

  // Wait for the Flutter app callback
  const result = await deliveryPromise;
  logger.info(`SMS delivered`, { messageId, phone: maskPhone(phone) });

  return result;
}

function maskPhone(phone) {
  if (!phone || phone.length < 6) return '***';
  return phone.slice(0, -6).replace(/./g, '*') + phone.slice(-4);
}

module.exports = { sendOtpViaSms };
