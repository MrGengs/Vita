// Firebase Web Config — VITA Project (vita-id)
// IMPORTANT: Replace YOUR_API_KEY and YOUR_APP_ID from Firebase Console
// Go to: Firebase Console → Project Settings → General → Your apps → Web app
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "vita-id.firebaseapp.com",
  databaseURL: "https://vita-id-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "vita-id",
  storageBucket: "vita-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Service instances
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();
const rtdb = firebase.database();

// Firestore settings
db.settings({ experimentalForceLongPolling: false });

console.log('[VITA] Firebase initialized — project: vita-id');
