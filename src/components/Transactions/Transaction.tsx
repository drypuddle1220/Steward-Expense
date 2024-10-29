import React, { useEffect, useState } from "react";
import styles from "./Transaction.module.css";
import Navbar from "../Dashboard/Navbar";
import nav from "../Dashboard/Navbar.module.css";
import { useNavigate } from "react-router-dom";
import { auth } from "../../../Backend/config/firebaseConfig";
import { FirestoreService } from "../../../Backend/config/firestoreService";
import { Transaction as TransactionType } from "../../types";
import { getDatabase, ref, onValue } from "firebase/database";
import InputButton from "../InputExpense/InputButton";

// Create a single instance of FirestoreService
const firestoreService = new FirestoreService();

const Transaction: React.FC = () => {
	const [transactions, setTransactions] = useState<TransactionType[]>([]);
	const [loading, setLoading] = useState(true);
	const [userData, setUserData] = useState<any>(null);
	const [filter, setFilter] = useState('all');
	const [searchTerm, setSearchTerm] = useState('');
	const navigate = useNavigate();

	useEffect(() => {
		const loadData = async () => {
			if (auth.currentUser) {
				try {
					// Load user data from Firestore
					const userDataResult = await FirestoreService.getUserData(auth.currentUser.uid);
					if (userDataResult) {
						setUserData(userDataResult);
					}

					// Load transactions
					const transactions = await FirestoreService.getTransactions(auth.currentUser.uid);
					setTransactions(transactions.map(t => ({
						...t,
						userId: auth.currentUser!.uid,
						currency: t.currency || 'USD',
						status: t.status || 'completed',
						date: t.date.toDate() // Convert Firestore Timestamp to Date
					})) as TransactionType[]);
				} catch (error) {
					console.error('Error loading data:', error);
				} finally {
					setLoading(false);
				}
			} else {
				setLoading(false);
			}
		};

		loadData();
	}, []);

	const filteredTransactions = transactions.filter(transaction => {
		const matchesFilter = filter === 'all' || transaction.type === filter;
		const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
			transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
		return matchesFilter && matchesSearch;
	});

	if (loading) {
		return <div className={styles.progress_bar}>Loading...</div>;
	}

	return (
		<div className={styles.transaction}>
			<aside className={nav.sidebar}>
				<div className={nav.logo}>
					<img src='src/assets/steward_logo.png' alt='Steward Logo' className={nav.stewardlogo} />
				</div>
				<nav className={nav.navigation}>
					<Navbar />
					<InputButton />
				</nav>
				<div className={nav.userInfo}>
					<img src='src/components/Dashboard/Avatars/Avatar1.png' alt='User Avatar' className={nav.stewardlogo} />
					{userData && (
						<>
							<h5>Welcome, {userData.firstName}!</h5>
							<p>{userData.email}</p>
						</>
					)}
				</div>
			</aside>

			<main className={styles.mainContent}>
				<div className={styles.header}>
					<h1>Transactions</h1>
					<div className={styles.controls}>
						<div className={styles.searchBar}>
							<input
								type="text"
								placeholder="Search transactions..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
						<div className={styles.filterButtons}>
							<button 
								className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
								onClick={() => setFilter('all')}
							>
								All
							</button>
							<button 
								className={`${styles.filterBtn} ${filter === 'income' ? styles.active : ''}`}
								onClick={() => setFilter('income')}
							>
								Income
							</button>
							<button 
								className={`${styles.filterBtn} ${filter === 'expense' ? styles.active : ''}`}
								onClick={() => setFilter('expense')}
							>
								Expenses
							</button>
						</div>
					</div>
				</div>

				<div className={styles.transactionList}>
					{filteredTransactions.map((transaction) => (
						<div 
							key={transaction.id} 
							className={`${styles.transactionCard} ${styles[transaction.type]}`}
						>
							<div className={styles.transactionIcon}>
								{/* Add icon based on category */}
								📊
							</div>
							<div className={styles.transactionDetails}>
								<h3>{transaction.category}</h3>
								<p>{transaction.description}</p>
								<span className={styles.date}>
									{transaction.date instanceof Date 
										? transaction.date.toLocaleDateString() 
										: transaction.date}
								</span>
							</div>
							<div className={styles.transactionAmount}>
								<span className={transaction.type === 'income' ? styles.income : styles.expense}>
									{transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
								</span>
								<span className={styles.paymentMethod}>{transaction.paymentMethod}</span>
							</div>
						</div>
					))}
				</div>
			</main>
		</div>
	);
};

export default Transaction;

