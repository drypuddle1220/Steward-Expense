// Dashboard.tsx
import React, { useEffect, useState } from "react"; //Reach hooks (UseState, useEffect)
import { useNavigate } from "react-router-dom";
import { Transaction as TransactionType } from "../../types";
import { auth } from "../../../Backend/config/firebaseConfig"; // Adjust import path
import styles from "./Dashboard.module.css";

import { FirestoreService } from "../../../Backend/config/firestoreService";
import { ArrowUpCircle, ArrowDownCircle, PiggyBank } from "lucide-react"; // Add this import
import PieChart from "../Visualizer/PieChart";
import Sidebar from "../Sidebar/sidebar";
import LineChart from "../Visualizer/LineChart";
import BarChart from "../Visualizer/BarChart";

// Add this interface at the top of your file
interface SavingsGoal {
	id: string;
	title: string;
	targetAmount: number;
	amountSaved: number;
	createdAt: Date;
	type: "savings";
}

//React,FC = React.FunctionComponent which is a typescript type used to define function components.
const Dashboard: React.FC = () => {
	//State and navigation setup:
	const [transactions, setTransactions] = useState<any[]>([]);
	const [userData, setUserData] = useState<any>(null); //Here we create a state variable for user data. initialized to null to begin with
	const [loading, setLoading] = useState(true); // Add loading state
	const [totalSavingsAmount, setTotalSavingsAmount] = useState<number>(0);
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

	const totalSaved = async () => {
		if (!userData?.uid) return 0;
		try {
			const savings = await FirestoreService.getSavingsGoals(
				userData.uid
			);
			return savings.reduce(
				(sum, saving) => sum + (saving.amountSaved || 0),
				0
			);
		} catch (error) {
			console.error("Error fetching savings:", error);
			return 0;
		}
	};
	useEffect(() => {
		const loadData = async () => {
			if (auth.currentUser) {
				try {
					// Load user data from Firestore
					const userDataResult = await FirestoreService.getUserData(
						auth.currentUser.uid
					);
					if (userDataResult) {
						setUserData(userDataResult);
					}

					// Load transactions and savings simultaneously
					const [transactions, savings] = await Promise.all([
						FirestoreService.getTransactions(auth.currentUser.uid),
						FirestoreService.getSavingsGoals(auth.currentUser.uid),
					]);

					// Set transactions
					setTransactions(
						transactions.map((t) => ({
							...t,
							userId: auth.currentUser!.uid,
							currency: t.currency || "USD",
							status: t.status || "completed",
							date: t.date.toDate(),
						})) as TransactionType[]
					);

					// Calculate and set total savings
					const totalSavingsAmount = savings.reduce(
						(sum, saving) => sum + (saving.amountSaved || 0),
						0
					);
					setTotalSavingsAmount(totalSavingsAmount);
				} catch (error) {
					console.error("Error loading data:", error);
				} finally {
					setLoading(false);
				}
			} else {
				setLoading(false);
			}
		};

		loadData();
	}, []);
	//This is the function that filters the transactions based on the filter and search term

	const TotalIncome = () => {
		const incometrans = transactions.filter((t) => t.type === "income");

		let res = 0;

		incometrans.forEach((transaction) => {
			res += transaction.amount;
		});

		return parseFloat(res.toFixed(2));
	};

	const TotalExpense = () => {
		const expensetrans = transactions.filter((t) => t.type === "expense");
		let res = 0;

		expensetrans.forEach((transaction) => {
			res += transaction.amount;
		});

		return parseFloat(res.toFixed(2));
	};

	const tot_i = TotalIncome();
	const tot_e = TotalExpense();

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
			<Sidebar />

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
							<div
								className={`${styles.card} ${styles.incomeCard}`}
							>
								<div className={styles.cardContent}>
									<div className={styles.cardIcon}>
										<ArrowUpCircle size={20} />
									</div>
									<div className={styles.cardInfo}>
										<h3>Total Income</h3>
										<p className={styles.amount}>
											${tot_i}
										</p>
									</div>
								</div>
							</div>

							<div
								className={`${styles.card} ${styles.expenseCard}`}
							>
								<div className={styles.cardContent}>
									<div className={styles.cardIcon}>
										<ArrowDownCircle size={20} />
									</div>
									<div className={styles.cardInfo}>
										<h3>Total Expense</h3>
										<p className={styles.amount}>
											${tot_e}
										</p>
									</div>
								</div>
							</div>

							<div
								className={`${styles.card} ${styles.savingsCard}`}
							>
								<div className={styles.cardContent}>
									<div className={styles.cardIcon}>
										<PiggyBank size={20} />
									</div>
									<div className={styles.cardInfo}>
										<h3>Total Savings</h3>
										<p className={styles.amount}>
											${totalSavingsAmount}
										</p>
									</div>
								</div>
							</div>
						</>
					)}
				</section>

				<section className={styles.charts}>
					{loading ? (
						<>
							<div
								className={`${styles.chart} ${styles.fullWidthChart}`}
							>
								<ChartSkeleton />
							</div>
							<div className={styles.goals}>
								<div className={styles.goalSection}>
									<ChartSkeleton />
								</div>
								<div className={styles.goalSection}>
									<ChartSkeleton />
								</div>
							</div>
							<div
								className={`${styles.chart} ${styles.pieChart}`}
							>
								<ChartSkeleton />
							</div>
							<div
								className={`${styles.chart} ${styles.lineChart}`}
							>
								<ChartSkeleton />
							</div>
						</>
					) : (
						<>
							<div
								className={`${styles.chart} ${styles.fullWidthChart}`}
							>
								<BarChart />
							</div>
							<div className={styles.goals}>
								<section className={styles.goalSection}>
									<h3>Budget Goals</h3>
									<div className={styles.goalsList}>
										<div className={styles.goalItem}>
											<div className={styles.goalInfo}>
												<span
													className={styles.goalText}
												>
													Dining out expenses
												</span>
												<span
													className={styles.goalValue}
												>
													$160/$200
												</span>
											</div>
											<div className={styles.progressBar}>
												<div
													className={`${styles.progressFill} ${styles.warning}`}
													style={{ width: "80%" }}
													title='80% of budget used'
												/>
											</div>
										</div>

										<div className={styles.goalItem}>
											<div className={styles.goalInfo}>
												<span
													className={styles.goalText}
												>
													Entertainment budget
												</span>
												<span
													className={styles.goalValue}
												>
													$150/$200
												</span>
											</div>
											<div className={styles.progressBar}>
												<div
													className={`${styles.progressFill} ${styles.success}`}
													style={{ width: "75%" }}
													title='75% of budget used'
												/>
											</div>
										</div>

										<div className={styles.goalItem}>
											<div className={styles.goalInfo}>
												<span
													className={styles.goalText}
												>
													Grocery expenses
												</span>
												<span
													className={styles.goalValue}
												>
													$450/$500
												</span>
											</div>
											<div className={styles.progressBar}>
												<div
													className={`${styles.progressFill} ${styles.info}`}
													style={{ width: "90%" }}
													title='90% of budget used'
												/>
											</div>
										</div>
									</div>
								</section>

								<section className={styles.goalSection}>
									<h3>Savings Goals</h3>
									<div className={styles.goalsList}>
										<div className={styles.goalItem}>
											<div className={styles.goalInfo}>
												<span
													className={styles.goalText}
												>
													Emergency fund
												</span>
												<span
													className={styles.goalValue}
												>
													$3,000/$5,000
												</span>
											</div>
											<div className={styles.progressBar}>
												<div
													className={`${styles.progressFill} ${styles.primary}`}
													style={{ width: "60%" }}
													title='60% of goal reached'
												/>
											</div>
										</div>

										<div className={styles.goalItem}>
											<div className={styles.goalInfo}>
												<span
													className={styles.goalText}
												>
													Retirement savings
												</span>
												<span
													className={styles.goalValue}
												>
													$15,000/$20,000
												</span>
											</div>
											<div className={styles.progressBar}>
												<div
													className={`${styles.progressFill} ${styles.success}`}
													style={{ width: "75%" }}
													title='75% of goal reached'
												/>
											</div>
										</div>

										<div className={styles.goalItem}>
											<div className={styles.goalInfo}>
												<span
													className={styles.goalText}
												>
													Vacation fund
												</span>
												<span
													className={styles.goalValue}
												>
													$800/$2,000
												</span>
											</div>
											<div className={styles.progressBar}>
												<div
													className={`${styles.progressFill} ${styles.warning}`}
													style={{ width: "40%" }}
													title='40% of goal reached'
												/>
											</div>
										</div>
									</div>
								</section>
							</div>
							<div
								className={`${styles.chart} ${styles.pieChart}`}
							>
								<PieChart />
							</div>
							<div
								className={`${styles.chart} ${styles.lineChart}`}
							>
								<LineChart />
							</div>
						</>
					)}
				</section>
			</main>
		</div>
	);
};

export default Dashboard;
