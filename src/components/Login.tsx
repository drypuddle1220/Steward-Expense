import React, { useState } from "react";

import styles from "./Login.module.css"; // Import the CSS Module

interface LoginProps {
	showForm: boolean;
	onClose: () => void;
}

const Login: React.FC<LoginProps> = ({ showForm, onClose }) => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log("Email:", email, "Password:", password);
	};

	return (
		<div className={styles["login-page"]}>
			{showForm && (
				<div className={styles["login-modal"]}>
					<h2>Login</h2>
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
						<button className={styles.btn} type='submit'>
							Sign In
						</button>
					</form>

					<button className={styles.btn} onClick={onClose}>
						Close
					</button>
				</div>
			)}
		</div>
	);
};

export default Login;
