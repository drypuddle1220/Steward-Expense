import { initializeApp } from "firebase/app";
import {
	getAuth,
	GoogleAuthProvider,
	setPersistence,
	browserSessionPersistence,
} from "firebase/auth";
import { getDatabase } from "firebase/database";

/**Steward Expense app's Firebase configuration, 
which helps firebase identify which database we need to connect to. 
*/
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
const googleProvider = new GoogleAuthProvider(); // Google Provider, gives us the ability to use google sign in.
const database = getDatabase(app); // Firebase Realtime Database

// Set persistence (example with local persistence)

setPersistence(auth, browserSessionPersistence)
	.then(() => {
		// Proceed to the sign-in logic
		console.log("Persistence is set to 'local'.");
	})
	.catch((error) => {
		console.error("Error setting persistence:", error);
	});

/**
 * Parameter auth: object from firebase, representing the authentication instance
 * Parameter browserLocalPersistence: Specify the mode of persistence,
 * 	-> browserLocalPersistence = Auth state presists even after browser closes.
 * 	-> browserSessionPersistence = Auth state only store in session, ends when tab closed.
 * 	-> none = persists with page cycle, refresh = re-login
 */

export { auth, googleProvider, database };
