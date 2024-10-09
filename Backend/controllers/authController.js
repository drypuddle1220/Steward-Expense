import { auth } from "../config/db"; // Firebase Auth initialized in db.js
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
} from "firebase/auth";

// Function to create a new user
export const register = async (email, password) => {
	try {
		const userCredential = await createUserWithEmailAndPassword(
			auth,
			email,
			password
		);
		const user = userCredential.user;
		console.log("User registered:", user);
		return user;
	} catch (error) {
		console.error("Error registering user:", error.message);
		throw error;
	}
};

// Function to log in an existing user
export const login = async (email, password) => {
	try {
		const userCredential = await signInWithEmailAndPassword(
			auth,
			email,
			password
		);
		const user = userCredential.user;
		console.log("User logged in:", user);
		return user;
	} catch (error) {
		console.error("Error logging in:", error.message);
		throw error;
	}
};

export { register, login };
