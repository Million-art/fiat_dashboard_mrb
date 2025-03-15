import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyDenzRNdT2yigG8yxisdK_1A1IH_DfH9Mo",
  authDomain: "mrjohn-8ee8b.firebaseapp.com",
  databaseURL: "https://mrjohn-8ee8b-default-rtdb.firebaseio.com",
  projectId: "mrjohn-8ee8b",
  storageBucket: "mrjohn-8ee8b.firebasestorage.app",
  messagingSenderId: "662877699866",
  appId: "1:662877699866:web:451ade51fbfafafed236a3",
  measurementId: "G-BBLWJYWS31"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Firebase Storage
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Firebase Authentication
const auth = getAuth(app);
const functions = getFunctions(app);
export { db, storage, auth, functions };