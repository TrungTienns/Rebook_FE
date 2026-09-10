import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDFdXwcqXO4QcR4p1hXyc_SiltMXjZyfG4",
  authDomain: "rebook-6a752.firebaseapp.com",
  projectId: "rebook-6a752",
  storageBucket: "rebook-6a752.firebasestorage.app",
  messagingSenderId: "713242927897",
  appId: "1:713242927897:web:493da5eee90dcb6dbc1b88",
  measurementId: "G-S2MRPH88NC"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export { auth, googleProvider, facebookProvider };
