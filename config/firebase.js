const admin = require('firebase-admin');
const logger = require('../src/utils/logger');

let initialized = false;

function initializeFirebase() {
  if (initialized) return;

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Railway / Railway env vars escape \n literally – handle both cases
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });

  initialized = true;
  logger.info('Firebase Admin SDK initialized');
}

module.exports = { initializeFirebase, admin };
