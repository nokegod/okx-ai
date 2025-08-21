const { initializeApp } = require('firebase/app');
const { getFirestore, connectFirestoreEmulator } = require('firebase/firestore');
const { getDatabase, connectDatabaseEmulator } = require('firebase/database');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA5Z5ieEbAcfQX0kxGSn9ldGXhzvAwx_8M",
  authDomain: "chat-294cc.firebaseapp.com",
  databaseURL: "https://chat-294cc-default-rtdb.firebaseio.com",
  projectId: "chat-294cc",
  storageBucket: "chat-294cc.firebasestorage.app",
  messagingSenderId: "913615304269",
  appId: "1:913615304269:web:0274ffaccb8e6b678e4e04",
  measurementId: "G-SJR9NDW86B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Realtime Database
const rtdb = getDatabase(app);

// If in development environment, connect to emulator
if (process.env.NODE_ENV === 'development') {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectDatabaseEmulator(rtdb, 'localhost', 9000);
    console.log('✅ Connected to Firebase emulator');
  } catch (error) {
    console.log('⚠️  Emulator connection failed, using production environment');
  }
}

console.log('🚀 Firebase initialization completed');
console.log('📊 Firestore database:', db);
console.log('⚡ Realtime database:', rtdb);

module.exports = { app, db, rtdb };
