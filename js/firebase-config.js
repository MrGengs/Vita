// Firebase Web Config — VITA Project (vita-id)
// Nilai sensitif dibaca dari js/env.js (file lokal, tidak di-commit ke git).
// Salin js/env.example.js → js/env.js lalu isi dengan nilai dari Firebase Console.

(function () {
  const env = window.__VITA_ENV__;

  if (!env || env.FIREBASE_API_KEY === 'YOUR_FIREBASE_API_KEY') {
    console.error(
      '[VITA] ⚠️  Firebase API key belum dikonfigurasi!\n' +
      '  → Salin js/env.example.js menjadi js/env.js\n' +
      '  → Isi nilai dari Firebase Console → Project Settings → Your apps'
    );
  }

  const firebaseConfig = {
    apiKey:            env?.FIREBASE_API_KEY            || '',
    authDomain:        'vita-id.firebaseapp.com',
    databaseURL:       'https://vita-id-default-rtdb.asia-southeast1.firebasedatabase.app',
    projectId:         'vita-id',
    storageBucket:     'vita-id.appspot.com',
    messagingSenderId: env?.FIREBASE_MESSAGING_SENDER_ID || '',
    appId:             env?.FIREBASE_APP_ID              || ''
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  // Service instances (global)
  window.db      = firebase.firestore();
  window.auth    = firebase.auth();
  window.storage = firebase.storage();
  window.rtdb    = firebase.database();

  console.log('[VITA] Firebase initialized — project: vita-id');
})();
