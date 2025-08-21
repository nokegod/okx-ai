const admin = require('firebase-admin');

if (!admin.apps.length) {
  try {
    // In Cloud Functions environment, Firebase configures automatically
    admin.initializeApp({
      projectId: "chat-294cc",
      databaseURL: "https://chat-294cc-default-rtdb.firebaseio.com",
      storageBucket: "chat-294cc.firebasestorage.app"
    });
    console.log('Firebase Admin initialized with default config');
  } catch (error) {
    console.log('Firebase Admin initialization error:', error.message);
  }
}

const db = admin.firestore();
const rtdb = admin.database();

module.exports = { admin, db, rtdb };
