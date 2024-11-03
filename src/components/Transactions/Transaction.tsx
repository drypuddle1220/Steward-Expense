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
import { 
    AttachMoney, 
    ShoppingCart, 
    Home, 
    DirectionsCar,
    Restaurant,
    LocalHospital,
    School,
    FlightTakeoff,
    // ... import other icons as needed
} from '@mui/icons-material';
import {DateRangePicker} from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file

const Transaction: React.FC = () => {

	//The following useState hooks manage the state of the transactions, user data, and loading.
	const [transactions, setTransactions] = useState<TransactionType[]>([]);
	const [loading, setLoading] = useState(true); //This is the loading state, which is true by default.
	const [userData, setUserData] = useState<any>(null); //This is the user data, which is null by default.
	const [filter, setFilter] = useState('all'); //This is the default filter, which is all transactions.
	const [searchTerm, setSearchTerm] = useState(''); //This is the search term, which is the search input in the search bar.
	const navigate = useNavigate();
	const [currentPage, setCurrentPage] = useState(1);

	// State for date range picker
	const [dateRange, setDateRange] = useState<{
		startDate: Date;
		endDate: Date;
		key: string;
	}[]>([
		{
			startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
			endDate: new Date(),
			key: 'selection'
		}
	]);
	const [showDatePicker, setShowDatePicker] = useState(false);

	// Create a single instance of FirestoreService
	const firestoreService = new FirestoreService();

	//The following useEffect hook loads the data from the database.
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
	//This is the function that filters the transactions based on the filter and search term.
	const filteredTransactions = transactions.filter(transaction => {
		const transactionDate = new Date(transaction.date);
		const withinDateRange = transactionDate >= dateRange[0].startDate && 
							   transactionDate <= dateRange[0].endDate;
		
		const matchesFilter = filter === 'all' || transaction.type === filter;

		const searchFields = [transaction.description,
			transaction.category,
			transaction.paymentMethod,
			transaction.amount.toString(),
			...transaction.tags || [] // Include tags if they exist]
		 ]?.map((field: string) => field.toLowerCase());

		 const matchesSearch = searchTerm.split(' ').every((term: string) => 
			searchFields.some((field: string) => field.includes(term))
		);

		 
		return matchesFilter && matchesSearch && withinDateRange;
	});

	//This line sorts the transactions by date, from newest to oldest.
	filteredTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); 

	// Separate the layout rendering from the data loading 
	
	const renderTransactionSkeleton = () => (
		<div className={styles.transactionCard}>
			<div className={styles.transactionIcon}>
				<div className={styles.skeleton}></div>
			</div>
			<div className={styles.transactionDetails}>
				<div className={styles.skeleton}></div>
				<div className={styles.skeleton}></div>
			</div>
			<div className={styles.transactionAmount}>
				<div className={styles.skeleton}></div>
			</div>
		</div>
	);

	const getCategoryIcon = (category: string) => {
		const lowerCategory = category.toLowerCase();
		
		switch (lowerCategory) {
			case 'salary':
				return <AttachMoney />;
			case 'groceries':
				return <ShoppingCart />;
			case 'housing':
				return <Home />;
			case 'transportation':
				return <DirectionsCar />;
			case 'dining':
				return <Restaurant />;
			case 'medical':
				return <LocalHospital />;
			case 'education':
				return <School />;
			case 'travel':
				return <FlightTakeoff />;
			// ... add more cases
			default:
				return <AttachMoney />;
		}
	};

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
					{userData ? (
						<>
							<h5>Welcome, {userData.firstName}!</h5>
							<p>{userData.email}</p>
						</>
					) : (
						<>
							<div className={styles.skeleton}></div>
							<div className={styles.skeleton}></div>
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
								onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
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
								className={styles.filterBtn}
								onClick={() => setShowDatePicker(!showDatePicker)}
							>
								Date Range
							</button>
							{showDatePicker && (
								<div className={styles.datePickerContainer}>
									<DateRangePicker
										ranges={dateRange}
										onChange={(item: any) => {
											if (item.selection.startDate && item.selection.endDate) {
												setDateRange([item.selection]);
											}
										}}
										months={2}
										direction="horizontal"
									/>
								</div>
							)}
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
					{loading ? (
						// Show skeleton loading state
						Array(10).fill(null).map((_, index) => (
							<React.Fragment key={index}>
								{renderTransactionSkeleton()}
							</React.Fragment>
						))
					) : (
						<>
							{filteredTransactions.map((transaction) => (
								<div 
									key={transaction.id} 
									className={`${styles.transactionCard} ${styles[transaction.type]}`}
								>
									<div className={styles.transactionIcon}>
										{getCategoryIcon(transaction.category)}
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
						</>
					)}
				</div>
			</main>
		</div>
	);
};

export default Transaction;

