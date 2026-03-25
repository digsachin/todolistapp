import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your actual Firebase config from the Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDhNANHZLQcM7BeDbJsLtF3bwVbx0UpHIc",
  authDomain: "todo-954cb.firebaseapp.com",
  projectId: "todo-954cb",
  storageBucket: "todo-954cb.firebasestorage.app",
  messagingSenderId: "19744374307",
  appId: "1:19744374307:web:c5f6b3f1bad681b85fbb96"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
