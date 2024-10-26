import React, { useEffect, useState } from "react";
import styles from "./Transaction.module.css";
import { getDatabase, onValue, ref, set } from "firebase/database";
import Navbar from "../Dashboard/Navbar";
import nav from "../Dashboard/Navbar.module.css";
import { useNavigate } from "react-router-dom";
import { auth } from "../../../Backend/config/firebaseConfig";
const Transaction: React.FC = () => {
	const [userData, setUserData] = useState<any>(null);
	const navigate = useNavigate();
	useEffect(() => {
		const user = auth.currentUser;
		if (user) {
			if (!user.emailVerified) {
				auth.signOut();
				alert("Please verify your email address before logging in.");
				navigate("/dashboard");
			} else {
				// Fetch user-specific data
				const database = getDatabase(); //Initialize database
				const userRef = ref(database, "users/" + user.uid); //Create a reference to the user's data in the database.

				//Set up a listener to respon to changes at user reference.
				onValue(userRef, (snapshot) => {
					//This function is called whenever there is a change in userRef data, including when the inital fetch happens.
					const data = snapshot.val(); //Records the data.
					setUserData(data); //Update the component state with fetched user data. Put into userData above.
				});
			}
		} else {
			// Redirect to login if no user is signed in
			navigate("/login");
		}
	}, [navigate]);

	if (!userData) {
		return <div className={styles.progress_bar}></div>;
	} // Add a progress bar component

	return (
		<div className={styles.transaction}>
			<aside className={nav.sidebar}>
				<div className={nav.logo}>
					<img
						src='src/assets/steward_logo.png'
						alt='Steward Logo'
						className={nav.stewardlogo}
					/>
				</div>

				<nav className={nav.navigation}>
					<Navbar />
				</nav>
				<div className={nav.userInfo}>
					<img
						src='src/components/Dashboard/Avatars/Avatar1.png'
						alt='User Avatar'
						className={nav.stewardlogo}
					/>
					<h5>Welcome, {userData.firstName}!</h5>
					<p>{userData.email}</p>
				</div>
			</aside>
			<main className={styles.parent}>
				<div className={styles.transaction_menu}></div>
				<div className={styles.transactions_container}>
					<h2>Transaction History</h2>
					<table className={styles.transactions_table}>
						<thead>
							<tr>
								<th>Type</th>
								<th>Amount</th>
								<th>Payment Method</th>
								<th>Status</th>
								<th>Activity</th>
								<th>Date</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>
									<span className={styles.icon_sent}>⬆️</span>{" "}
									Sent
								</td>
								<td>-500.00 IDR</td>
								<td>Credit Card ****6969</td>
								<td>
									<span className={styles.status_success}>
										✔️ Success
									</span>
								</td>
								<td>Sending money to Raihan Fikri</td>
								<td>Aug 28, 2023 3:40 PM</td>
							</tr>
							<tr>
								<td>
									<span className={styles.icon_sent}>⬆️</span>{" "}
									Sent
								</td>
								<td>-200.00 IDR (20 USD)</td>
								<td>Wire Transfer ****9830</td>
								<td>
									<span className={styles.status_success}>
										✔️ Success
									</span>
								</td>
								<td>Sending money to Bani Zuhilmin</td>
								<td>Aug 28, 2023 3:40 PM</td>
							</tr>
							<tr>
								<td>
									<span className={styles.icon_sent}>⬇️</span>{" "}
									Received
								</td>
								<td>+1,500 USD</td>
								<td>Bank Transfer ****6663</td>
								<td>
									<span className={styles.status_success}>
										✔️ Success
									</span>
								</td>
								<td>Received money from Andrew</td>
								<td>Aug 28, 2023 3:40 PM</td>
							</tr>
						</tbody>
					</table>
				</div>
			</main>
		</div>
	);
};

export default Transaction;
