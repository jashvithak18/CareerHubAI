// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyANTF5DTKy1y2q-c8OfUzE9kRiZl6s5YOs",
  authDomain: "careerhubai.firebaseapp.com",
  projectId: "careerhubai",
  storageBucket: "careerhubai.firebasestorage.app",
  messagingSenderId: "1080628947571",
  appId: "1:1080628947571:web:b712e55b60fe612cc7d806",
  measurementId: "G-VNGW3018CX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { auth, provider };
