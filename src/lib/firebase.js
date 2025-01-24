import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, setDoc, doc } from 'firebase/firestore';




const firebaseConfig = {
  apiKey: "AIzaSyC0kLxRiw__uRm4AphkGbZX2h4o5Mqi29M",
  authDomain: "inkhub-admin-v2.firebaseapp.com",
  projectId: "inkhub-admin-v2",
  storageBucket: "inkhub-admin-v2.firebasestorage.app",
  messagingSenderId: "313666062878",
  appId: "1:313666062878:web:39692b1b66db96cb08bc0f",
  measurementId: "G-JR6GD05DHE"
};

console.log("API Key:", process.env.AUTH_DOMAIN);

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, setDoc, doc };
