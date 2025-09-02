import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

// Your Firebase project configuration.
export const firebaseConfig = {
  apiKey: "AIzaSyDNRQV7vXa2kDWCUKVWoa2PakhxYjCdY1E",
  authDomain: "grocery-92674.firebaseapp.com",
  databaseURL: "https://grocery-92674-default-rtdb.firebaseio.com",
  projectId: "grocery-92674",
  storageBucket: "grocery-92674.appspot.com",
  messagingSenderId: "865543442470",
  appId: "1:865543442470:web:9ac2e0be0564d85f2216e7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the database service
export const database = getDatabase(app);

// Get a reference to the auth service
export const auth = getAuth(app);