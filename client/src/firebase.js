// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBdcd8UUEPNa8YdMMADWCUGTcWCgq4VjjY",
  authDomain: "flexxgymmanager.firebaseapp.com",
  projectId: "flexxgymmanager",
  storageBucket: "flexxgymmanager.firebasestorage.app",
  messagingSenderId: "944129148432",
  appId: "1:944129148432:web:a125a746595d3e47deec95",
  measurementId: "G-K2HME8BF8P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export initialized services
export const db = getFirestore(app);
export const auth = getAuth(app);
