
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB1-AkQ7JXj1BIb2suHCnU6YuTgkYpOWDc",
  authDomain: "berdeairdlsl.firebaseapp.com",
  projectId: "berdeairdlsl",
  storageBucket: "berdeairdlsl.firebasestorage.app",
  messagingSenderId: "37723362379",
  appId: "1:37723362379:web:c0addd0c174a16663ea9ce",
  measurementId: "G-2TERVSSESX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);