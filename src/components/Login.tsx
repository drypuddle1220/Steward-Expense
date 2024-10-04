import React, { useState } from "react";
import styles from "./Login.module.css"; // Import the CSS Module

interface LoginProps {
	showForm: boolean;
	onClose: () => void;
}

const Login: React.FC<LoginProps> = ({ showForm, onClose }) => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isCreatingAccount, setIsCreatingAccount] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (isCreatingAccount) {
			if (password !== confirmPassword) {
				alert("Passwords do not match!");
				return;
			}

			try {
				const response = await fetch("/api/register", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						email,
						password,
					}),
				});

				const data = await response.json();
				if (response.ok) {
					console.log("Account created successfully", data);
					// Redirect to login or other page
				} else {
					alert("Error: " + data.message);
				}
			} catch (error) {
				console.error("Error creating account:", error);
				alert("There was an error creating the account.");
			}
		}
	};

	const toggleCreateAccount = () => {
		setIsCreatingAccount(!isCreatingAccount); // Toggle between sign in and create account
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
						{isCreatingAccount && ( //if isCreatingAccount is true, then we will render this extra input field
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
						{isCreatingAccount //Here we use a ternary operator to toggle between the appropriate text.
							? "Already have an account? Sign In"
							: "Don't have an account? Create one"}
					</button>
				</div>
			)}
		</div>
	);
};

export default Login;
