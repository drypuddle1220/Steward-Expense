// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyD-BO9kO4cTYs4JDXxBh4gJkOclMnM9o9Y",
	authDomain: "steward-expense-tracking.firebaseapp.com",
	projectId: "steward-expense-tracking",
	storageBucket: "steward-expense-tracking.appspot.com",
	messagingSenderId: "742963302756",
	appId: "1:742963302756:web:2908dcf19bbc4fe7642a71",
	measurementId: "G-0Q6FLK0CVD",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Firebase Authentication
const database = getDatabase(app); // Firebase Realtime Database

export { auth, database };
