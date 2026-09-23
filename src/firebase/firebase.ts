import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';

export const firebaseConfig = {
  apiKey: "AIzaSyDc-Lz848LnAEaeMu5G0gNCH6WHS_YBXf4",
  authDomain: "quan-li-to---3.firebaseapp.com",
  projectId: "quan-li-to---3",
  storageBucket: "quan-li-to---3.appspot.com",
  messagingSenderId: "31928492882",
  appId: "1:31928492882:web:b5edd62805c395d50/581b",
  measurementId: "G-H82DJQ51P9"
};

// Initialize Firebase App singleton
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Try anonymous auth if required by security rules
let currentUser: User | null = null;
onAuthStateChanged(auth, (user) => {
  currentUser = user;
});

export async function ensureAuth(): Promise<User | null> {
  if (currentUser) return currentUser;
  try {
    const cred = await signInAnonymously(auth);
    currentUser = cred.user;
    return cred.user;
  } catch (err) {
    // If anonymous auth is not enabled in Firebase Console, continue unauthenticated
    console.warn('Firebase anonymous auth notice:', err);
    return null;
  }
}
