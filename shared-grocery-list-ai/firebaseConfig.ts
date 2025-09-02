
// FIX: Switched from a namespace import to named imports for 'firebase/app' to resolve module resolution errors. The Firebase v9+ modular SDK uses named exports for these functions.
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// Your Firebase project configuration.
export const firebaseConfig = {
  apiKey: "AIzaSyDNRQV7vXa2kDWCUKVWoa2PakhxYjCdY1E",
  authDomain: "grocery-92674.firebaseapp.com",
  databaseURL: "https://grocery-92674-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "grocery-92674",
  storageBucket: "grocery-92674.appspot.com",
  messagingSenderId: "865543442470",
  appId: "1:865543442470:web:9ac2e0be0564d85f2216e7"
};

// Initialize Firebase
// This check prevents re-initializing the app on hot reloads.
// FIX: Replaced calls via the incorrect namespace with direct calls to the imported functions.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();


// Get a reference to the database service
export const database = getDatabase(app);

// Get a reference to the auth service
export const auth = getAuth(app);