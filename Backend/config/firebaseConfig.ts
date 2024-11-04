import { initializeApp } from "firebase/app";
import {
	getAuth,
	GoogleAuthProvider,
	setPersistence,
	browserSessionPersistence,
} from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from 'firebase/firestore';

/**Steward Expense app's Firebase configuration, 
which helps firebase identify which database we need to connect to. 
*/
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Firebase Authentication
const googleProvider = new GoogleAuthProvider(); // Google Provider, gives us the ability to use google sign in.
const database = getDatabase(app); // Firebase Realtime Database
const db = getFirestore(app); // Initialize Firestore

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

export { auth, googleProvider, database, db };
