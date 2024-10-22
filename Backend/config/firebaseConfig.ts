import { initializeApp } from "firebase/app";
import {
	getAuth,
	GoogleAuthProvider,
	setPersistence,
	browserLocalPersistence,
	browserSessionPersistence,
} from "firebase/auth";
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
const googleProvider = new GoogleAuthProvider(); // Google Provider
const database = getDatabase(app); // Firebase Realtime Database

// Set persistence (example with local persistence)
setPersistence(auth, browserLocalPersistence)
	.then(() => {
		// Proceed to the sign-in logic
		console.log("Persistence is set to 'local'.");
	})
	.catch((error) => {
		console.error("Error setting persistence:", error);
	});

export { auth, googleProvider, database };
