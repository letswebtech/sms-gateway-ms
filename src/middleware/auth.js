const logger = require('../utils/logger');

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token || token !== process.env.API_SECRET_KEY) {
    logger.warn('Unauthorized request', { ip: req.ip, path: req.path });
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}

module.exports = { authMiddleware };
