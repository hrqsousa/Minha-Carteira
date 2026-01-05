import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// TODO: User must replace this with their own config
const firebaseConfig = {
  apiKey: "AIzaSyD1-ICz1SodOUCg4Kr1EdHQuSxnhCDVDvk",
  authDomain: "minha-carteira-2.firebaseapp.com",
  projectId: "minha-carteira-2",
  storageBucket: "minha-carteira-2.firebasestorage.app",
  messagingSenderId: "938933361120",
  appId: "1:938933361120:web:863b99e78d14a2cbd53385"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Login failed", error);
    throw error;
  }
};

export const logout = () => signOut(auth);

