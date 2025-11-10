import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAWS6tYSbGdBbZgmfAb52NJHOCjbh0aH5A",
  authDomain: "oxis-shop.firebaseapp.com",
  projectId: "oxis-shop",
  storageBucket: "oxis-shop.firebasestorage.app",
  messagingSenderId: "904243571485",
  appId: "1:904243571485:web:cae631b7412190b3970ff4",
  measurementId: "G-MJEGX46598",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
// Initialize Auth
export const auth = getAuth(app);
export default app;
