import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDqeDRaV5Y3_m8YwYajzj-U3FhprhpU5SM",
  authDomain: "daily-puzzle-game-ab36a.firebaseapp.com",
  projectId: "daily-puzzle-game-ab36a",
  storageBucket: "daily-puzzle-game-ab36a.firebasestorage.app",
  messagingSenderId: "33990487461",
  appId: "1:33990487461:web:d29e09d19699d1b9774c4c"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();