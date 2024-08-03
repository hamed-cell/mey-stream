// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Votre configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAl_epGJe65CEzw8NlXgV8pquXSeR_Lrj0",
  authDomain: "streamgame-mey.firebaseapp.com",
  databaseURL: "https://streamgame-mey-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "streamgame-mey",
  storageBucket: "streamgame-mey.appspot.com",
  messagingSenderId: "556174520662",
  appId: "1:556174520662:web:a5e927768ed3a8ba8426f7",
  measurementId: "G-71CWCHR944"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
