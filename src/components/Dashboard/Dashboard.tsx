// Dashboard.tsx
import React, { useEffect, useState } from "react"; //Reach hooks (UseState, useEffect)
import { getDatabase, ref, onValue } from "firebase/database"; //Firebase database functions.
import { useNavigate } from "react-router-dom";
import { auth } from "../../../Backend/config/firebaseConfig"; // Adjust import path
import styles from "./Dashboard.module.css";
import Visualizer from "../Visualizer/visualizer";
import InputButton from "../InputExpense/InputButton";
import Navbar from "./Navbar";

//React,FC = React.FunctionComponent which is a typescript type used to define function components.
const Dashboard: React.FC = () => {
	//State and navigation setput:
	const [userData, setUserData] = useState<any>(null); //Here we create a state variable for user data. initialized to null to begin with
	const navigate = useNavigate(); //Used this to redirect user if not signed in.

	/**
	 * Checks if user is logged in
	 * If logged in -> Fetch user data from firebase
	 * If not -> Redirect to log-in
	 * 
	 * User returns the following : 
	 *  Example of what auth.currentUser returns when a user is logged in
		const user = {
			uid: "abc123xyz789",        // Unique user ID
			email: "user@example.com",  // User's email address
			emailVerified: true,        // Whether email is verified
			displayName: "John Doe",    // User's display name (if set)
			photoURL: "https://...",    // URL of user's profile photo (if set)
			phoneNumber: "+1234567890", // Phone number (if provided)
			metadata: {
        creationTime: "...",    // When the account was created
        lastSignInTime: "..."   // When the user last signed in
    }
}
	 */
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

	//The following is the component of Dashboard:
	//Leftside is navigation sidebar, right side is main container that contains the dashboard visuals.
	return (
		<div className={styles.dashboard}>
			<aside className={styles.sidebar}>
				<div className={styles.logo}>
					<img
						src='src/assets/steward_logo.png'
						alt='Steward Logo'
						className={styles.stewardlogo}
					/>
				</div>

				<nav className={styles.navigation}>
					<Navbar />
				</nav>
				<div className={styles.userInfo}>
					<img
						src='src/components/Dashboard/Avatars/Avatar1.png'
						alt='User Avatar'
						className={styles.stewardlogo}
					/>
					<h5>Welcome, {userData.firstName}!</h5>
					<p>{userData.email}</p>
				</div>
			</aside>

			<main className={styles.dashboardContent}>
				<section className={styles.topCards}>
					<div className={styles.card}>Total Income: $4,300</div>
					<div className={styles.card}>Total Expense: $3,000</div>
					<div className={styles.card}>Total Savings: $1,300</div>
				</section>

				<section className={styles.charts}>
					<div
						className={`${styles.chart} ${styles.card} ${styles.fullWidthChart}`}
					>
						<Visualizer.BarChartComponent />
					</div>
					<div className={`${styles.chart} ${styles.card}`}>
						<Visualizer.PieChartComponent />
					</div>
					<div className={`${styles.chart} ${styles.card}`}>
						<Visualizer.LineChartComponent />
					</div>
				</section>
			</main>
		</div>
	);
};

export default Dashboard;
