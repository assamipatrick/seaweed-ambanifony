import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// Configuration Firebase
// Ces valeurs doivent être remplacées par vos propres credentials Firebase
// Disponibles dans: Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDEMO_API_KEY_REPLACE_ME",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "seafarm-demo.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://seafarm-demo-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "seafarm-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "seafarm-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
export const database = getDatabase(app);

// Initialize Authentication
export const auth = getAuth(app);

export default app;
