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

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (isCreatingAccount) {
			console.log("Creating account: ", email, password, confirmPassword);
			if (password != confirmPassword) {
				alert("Passwords do not match!");
				return;
			}
		} else {
			console.log("Logging in: ", email, password);
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
