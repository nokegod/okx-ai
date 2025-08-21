// Firebase Web configuration
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
firebase.initializeApp(firebaseConfig);

// Export Firebase services
const db = firebase.firestore();
const rtdb = firebase.database();
const auth = firebase.auth();

// Export to global scope
window.firebase = firebase;
window.db = db;
window.rtdb = rtdb;
window.auth = auth;
