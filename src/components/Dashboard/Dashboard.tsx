// Dashboard.tsx
import React, { useEffect, useState } from "react"; //Reach hooks (UseState, useEffect)
import { getDatabase, ref, onValue, set } from "firebase/database"; //Firebase database functions.
import { useNavigate } from "react-router-dom";
import { auth } from "../../../Backend/config/firebaseConfig"; // Adjust import path
import styles from "./Dashboard.module.css";
import Visualizer from "../Visualizer/visualizer";
import InputButton from "../InputExpense/InputButton";
import Navbar from "./Navbar";
import nav from "./Navbar.module.css";
import { FirestoreService } from "../../../Backend/config/firestoreService";

//React,FC = React.FunctionComponent which is a typescript type used to define function components.
const Dashboard: React.FC = () => {
	//State and navigation setup:
	const [transactions, setTransactions] = useState<any[]>([]);
	const [userData, setUserData] = useState<any>(null); //Here we create a state variable for user data. initialized to null to begin with
	const [loading, setLoading] = useState(true); // Add loading state
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
				const loadUserData = async () => {
					try {
						setLoading(true); // Set loading state
						const userData = await FirestoreService.getUserData(user.uid);
						if (userData) {
							setUserData(userData);
						}
					} catch (error) {
						console.error('Error loading user data:', error);
					} finally {
						setLoading(false); // Clear loading state
					}
				};
				loadUserData();
			}
		} else {
			navigate("/login");
		}
	}, [navigate]);

	// Skeleton components
	const CardSkeleton = () => (
		<div className={`${styles.card} ${styles.skeleton}`}>
			<div className={styles.skeletonText}></div>
		</div>
	);

	const ChartSkeleton = () => (
		<div className={`${styles.chart} ${styles.card} ${styles.skeleton}`}>
			<div className={styles.skeletonChart}></div>
		</div>
	);

	//This is the component for the dashboard.
	//It displays the user's data, and the dashboard visuals.
	//The left side is the navigation sidebar, and the right side is the main container that contains the dashboard visuals.
	return (
		<div className={styles.dashboard}>
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
					<InputButton setTransactions={setTransactions} />
				</nav>
				<div className={nav.userInfo}>
					<img
						src='src/components/Dashboard/Avatars/Avatar1.png'
						alt='User Avatar'
						className={nav.stewardlogo}
					/>
					{loading ? (
						<>
							<div className={styles.skeletonText}></div>
							<div className={styles.skeletonText}></div>
						</>
					) : (
						<>
							<h5>Welcome, {userData?.firstName}!</h5>
							<p>{userData?.email}</p>
						</>
					)}
				</div>
			</aside>

			<main className={styles.dashboardContent}>
				<section className={styles.topCards}>
					{loading ? (
						<>
							<CardSkeleton />
							<CardSkeleton />
							<CardSkeleton />
						</>
					) : (
						<>
							<div className={styles.card}>
								Total Income: <span style={{ fontWeight: 'bold', fontSize: '1.2em' }}>$4,300</span>
							</div>
							<div className={styles.card}>
								Total Expense: <span style={{ fontWeight: 'bold', fontSize: '1.2em' }}>$3,000</span>
							</div>
							<div className={styles.card}>
								Total Savings: <span style={{ fontWeight: 'bold', fontSize: '1.2em' }}>$1,300</span>
							</div>
						</>
					)}
				</section>

				<section className={styles.charts}>
					{loading ? (
						<>
							<ChartSkeleton />
							<ChartSkeleton />
							<ChartSkeleton />
						</>
					) : (
						<>
							<div
								className={`${styles.chart} ${styles.fullWidthChart}`}
							>
								<Visualizer.BarChartComponent />
							</div>
							<div className={`${styles.chart}`}>
								<Visualizer.PieChartComponent />
							</div>
							<div className={`${styles.chart}`}>
								<Visualizer.LineChartComponent />
							</div>
						</>
					)}
				</section>
			</main>
		</div>
	);
};

export default Dashboard;