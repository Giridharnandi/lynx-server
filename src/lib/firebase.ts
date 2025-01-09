import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD13P3AogZDTd31_o0OpWz-ma3Jxu-BIgY",
  authDomain: "ai-saas-3aca0.firebaseapp.com",
  projectId: "ai-saas-3aca0",
  storageBucket: "ai-saas-3aca0.firebasestorage.app",
  messagingSenderId: "294976082574",
  appId: "1:294976082574:web:c16586bd031920e8072fdf",
  measurementId: "G-HMHNSL816N"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);