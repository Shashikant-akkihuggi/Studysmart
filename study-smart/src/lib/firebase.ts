"use client";

import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  type Auth,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  type Firestore,
} from "firebase/firestore";

export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
};
export type { FirebaseUser };

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const hasConfig = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

const isBrowser = typeof window !== "undefined";

let firebaseApp: FirebaseApp | undefined;

function getApp(): FirebaseApp {
  if (firebaseApp) return firebaseApp;
  if (!hasConfig) {
    throw new Error(
      "[firebase] Missing NEXT_PUBLIC_FIREBASE_* environment variables. Set them in .env.local."
    );
  }
  firebaseApp =
    getApps().length > 0
      ? getApps()[0]
      : initializeApp(firebaseConfig as Record<string, string>);
  return firebaseApp;
}

export const auth: Auth = isBrowser && hasConfig
  ? getAuth(getApp())
  : ({} as unknown as Auth);

export const db: Firestore = isBrowser && hasConfig
  ? getFirestore(getApp())
  : ({} as unknown as Firestore);

export const googleProvider: GoogleAuthProvider = isBrowser && hasConfig
  ? (() => {
      const p = new GoogleAuthProvider();
      p.setCustomParameters({ prompt: "select_account" });
      return p;
    })()
  : ({} as unknown as GoogleAuthProvider);
