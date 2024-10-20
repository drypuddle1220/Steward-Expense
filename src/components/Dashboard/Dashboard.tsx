// Dashboard.tsx
import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { auth } from "../../../Backend/config/firebaseConfig"; // Adjust import path
import styles from "./Dashboard.module.css";
import landing from "../LandingPage/LandingPage.module.css";
import Visualizer from "../Visualizer/visualizer";
import InputButton from "../InputExpense/InputButton";


const Dashboard: React.FC = () => {
	const [userData, setUserData] = useState<any>(null);
	const navigate = useNavigate();

	useEffect(() => {
		const user = auth.currentUser;
		if (user) {
			// Fetch user-specific data
			const database = getDatabase();
			const userRef = ref(database, "users/" + user.uid);

			onValue(userRef, (snapshot) => {
				const data = snapshot.val();
				setUserData(data);
			});
		} else {
			// Redirect to login if no user is signed in
			navigate("/login");
		}
	}, [navigate]);

	if (!userData) return <p>Loading...</p>;

	return (
		<div className={styles.dashboard}>
			<aside className={styles.sidebar}>
			
				<div className={styles.logo}>
					<img
						src='src/assets/steward_logo.png'
						alt='Steward Logo'
						className={styles.stewardlogo}
					/>
					<h5> Steward </h5>
				</div>

				<div className = {styles.inputbutton}>
					<InputButton/>
				</div>
				
				<nav className={styles.navigation}>
					<ul>
						<li>Dashboard</li>
						<li>Purchase</li>
						<li>Accounts</li>
						<li>Reports</li>
					</ul>
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
					<div className={styles.card}>Total Income</div>
					<div className={styles.card}>Total Expense</div>
					<div className={styles.card}>Total Savings</div>
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
