/**
 * DeliveryTracker keeps a map of pending SMS deliveries.
 *
 * Flow:
 *   1. FCM message sent → create a pending entry with a timeout
 *   2. Flutter app sends back a /callback when SMS is dispatched
 *   3. Resolve or reject the pending promise accordingly
 */

const logger = require('../utils/logger');

const pending = new Map(); // messageId → { resolve, reject, timer }

function waitForDelivery(messageId, timeoutMs = 30_000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(messageId);
      reject(new Error(`Delivery timeout for message ${messageId}`));
    }, timeoutMs);

    pending.set(messageId, { resolve, reject, timer });
    logger.debug(`Tracking delivery for ${messageId}`);
  });
}

function resolveDelivery(messageId, success, errorMessage) {
  const entry = pending.get(messageId);
  if (!entry) {
    logger.warn(`No pending delivery found for ${messageId}`);
    return false;
  }

  clearTimeout(entry.timer);
  pending.delete(messageId);

  if (success) {
    entry.resolve({ messageId, status: 'sent' });
  } else {
    entry.reject(new Error(errorMessage || 'SMS send failed on device'));
  }
  return true;
}

function getPendingCount() {
  return pending.size;
}

module.exports = { waitForDelivery, resolveDelivery, getPendingCount };
