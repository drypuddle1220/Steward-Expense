import React, { useState } from "react";
import styles from "./Login.module.css";
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
} from "firebase/auth";
import { ref, set } from "firebase/database";
import { auth, database } from "../../Backend/config/firebaseConfig";

interface LoginProps {
	showForm: boolean; // Whether the form is visible
	onClose: () => void; // Function to close the form
}

const Login: React.FC<LoginProps> = ({ showForm, onClose }) => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [isCreatingAccount, setIsCreatingAccount] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault(); // Prevent default form submission behavior

		if (isCreatingAccount) {
			// Handle account creation
			console.log("Registering user...");
			if (password !== confirmPassword) {
				alert("Passwords do not match!");
				return;
			}

			// Call the registration logic
			await handleRegister();
		} else {
			await handleSignIn();
		}
	};

	const handleRegister = async () => {
		try {
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				email,
				password
			);
			const user = userCredential.user;

			// Save user data to the Realtime Database
			const userRef = ref(database, "users/" + user.uid);
			await set(userRef, {
				email: email,
				firstName: firstName,
				lastName: lastName,
				last_login: Date.now(),
			});

			alert("User registered successfully");
			onClose(); // Optionally close the form after successful registration
		} catch (error) {
			console.error("Error registering user:", error);
			alert(error);
		}
	};

	const handleSignIn = async () => {
		try {
			await signInWithEmailAndPassword(auth, email, password);
			alert("Sign-in successful!");
			//We can redirect here to the main dashboard page.... for now is empty.
		} catch (error) {
			console.error("Error signing in:", error);
			alert(error);
		}
	};

	const toggleCreateAccount = () => {
		setIsCreatingAccount(!isCreatingAccount);
	};

	return (
		<div className={styles["login-page"]}>
			{showForm && (
				<div className={styles["login-modal"]}>
					<h2>{isCreatingAccount ? "Create Account" : "Login"}</h2>
					<form onSubmit={handleSubmit}>
						<div>
							<label>Email</label>
							<input
								type='email'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</div>
						<div>
							<label>Password</label>
							<input
								type='password'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>
						{isCreatingAccount && (
							<div>
								<label>Confirm Password</label>
								<input
									type='password'
									value={confirmPassword}
									onChange={(e) =>
										setConfirmPassword(e.target.value)
									}
									required
								/>
								<label>First Name</label>
								<input
									type='text'
									value={firstName}
									onChange={(e) =>
										setFirstName(e.target.value)
									}
									required
								/>
								<label>Last Name</label>
								<input
									type='text'
									value={lastName}
									onChange={(e) =>
										setLastName(e.target.value)
									}
									required
								/>
							</div>
						)}
						<button className={styles.btn} type='submit'>
							{isCreatingAccount ? "Create Account" : "Sign In"}
						</button>
					</form>

					<button
						className={styles.btn}
						onClick={toggleCreateAccount}
					>
						{isCreatingAccount
							? "Already have an account? Sign In"
							: "Don't have an account? Create one"}
					</button>
				</div>
			)}
		</div>
	);
};

export default Login;
