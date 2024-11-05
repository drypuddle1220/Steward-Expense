import React, { useEffect, useState } from "react";
import styles from "./Transaction.module.css";
import Navbar from "../Dashboard/Navbar";
import nav from "../Dashboard/Navbar.module.css";
import { auth } from "../../../Backend/config/firebaseConfig";
import { FirestoreService } from "../../../Backend/config/firestoreService";
import { Transaction as TransactionType } from "../../types";
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
	TrendingUp,
    // ... import other icons as needed
} from '@mui/icons-material';
import {DateRangePicker} from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import EditTransactionCard from "./EditTransactionCard";
import MeatballMenu from "./MeatballMenu";
import { Pencil, Trash2 } from 'lucide-react';

const Transaction: React.FC = () => {

	// State Management
	// ---------------
	// Track all transactions loaded from Firestore
	const [transactions, setTransactions] = useState<TransactionType[]>([]);
	// Loading state for showing skeleton screens
	const [loading, setLoading] = useState(true);
	// Store user profile data
	const [userData, setUserData] = useState<any>(null);
	// Filter state: 'all', 'income', or 'expense'
	const [filter, setFilter] = useState('all');
	// Search input state for filtering transactions
	const [searchTerm, setSearchTerm] = useState('');
	
	// Add these state variables after other state declarations
	const [editingTransaction, setEditingTransaction] = useState<TransactionType | null>(null);
	const [showEditForm, setShowEditForm] = useState(false);

	// Date Range Picker Configuration
	// ------------------------------
	// State for managing date range selection
	const [dateRange, setDateRange] = useState<{
		startDate: Date;
		endDate: Date;
		key: string;
	}[]>([
		{
			// Default to current month's start date
			startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
			endDate: new Date(),
			key: 'selection'
		}
	]);
	// Toggle visibility of date picker
	const [showDatePicker, setShowDatePicker] = useState(false);

	// Data Loading Effect
	// ------------------
	useEffect(() => {
		const loadData = async () => {
			if (auth.currentUser) {
				try {
					// Load user profile data
					const userDataResult = await FirestoreService.getUserData(auth.currentUser.uid);
					if (userDataResult) {
						setUserData(userDataResult);
					}

					// Load and transform transactions
					// Adds default values and converts Firestore timestamps to Date objects
					const transactions = await FirestoreService.getTransactions(auth.currentUser.uid);
					setTransactions(transactions.map(t => ({
						...t,
						userId: auth.currentUser!.uid,
						currency: t.currency || 'USD',
						status: t.status || 'completed',
						date: t.date.toDate()
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

	// Transaction Filtering Logic
	// -------------------------
	const filteredTransactions = transactions.filter(transaction => {
		// Convert transaction date for comparison
		const transactionDate = new Date(transaction.date);
		
		// Check if transaction falls within selected date range
		const withinDateRange = transactionDate >= dateRange[0].startDate && 
							   transactionDate <= dateRange[0].endDate;
		
		// Check if transaction matches selected type filter
		const matchesFilter = filter === 'all' || transaction.type === filter;

		// Create searchable fields array and convert to lowercase
		const searchFields = [transaction.description,
			transaction.category,
			transaction.paymentMethod,
			transaction.amount.toString(),
			...transaction.tags || []
		]?.map((field: string) => field.toLowerCase());

		// Multi-word search: each word must match at least one field
		const matchesSearch = searchTerm.split(' ').every((term: string) => 
			searchFields.some((field: string) => field.includes(term))
		);

		return matchesFilter && matchesSearch && withinDateRange;
	});

	// Sort transactions by date (newest first)
	filteredTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

	// Loading State Components
	// -----------------------
	// Render skeleton loading placeholder for transactions
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

	// Category Icon Mapping
	// --------------------
	// Maps transaction categories to their corresponding Material-UI icons
	const getCategoryIcon = (category: string) => {
		const lowerCategory = category.toLowerCase();
		
		switch (lowerCategory) {
			case 'salary':
				return <AttachMoney />;	
			case 'food':
				return <Restaurant />;
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
			case 'investments':
				return <TrendingUp />;
			case 'education':
				return <School />;
			case 'travel':
				return <FlightTakeoff />;
			// ... add more cases
			default:
				return <AttachMoney />;
		}
	};

	async function handleDelete(id: string): Promise<void> {
		if (!auth.currentUser) {
			alert("Please log in to delete transactions");
			return;
		}
		
		try {
			await FirestoreService.deleteTransaction(auth.currentUser.uid, id);
			setTransactions(prevTransactions => 
				prevTransactions.filter(transaction => transaction.id !== id)
			);
		} catch (error) {
			console.error('Error deleting transaction:', error);
			alert('Failed to delete transaction');
		}
	}

	// Add this handler function
	const handleEdit = (transaction: TransactionType) => {
		if (!transaction.id) {
			console.error('Transaction ID is missing');
			return;
		}
		setEditingTransaction(transaction);
		setShowEditForm(true);
	};

	// Component Render
	// ---------------
	return (
		<div className={styles.transaction}>
			<aside className={nav.sidebar}>
				<div className={nav.logo}>
					<img src='src/assets/steward_logo.png' alt='Steward Logo' className={nav.stewardlogo} />
				</div>
				<nav className={nav.navigation}>
					<Navbar />
					<InputButton setTransactions={setTransactions} />
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
						// Show skeleton loading state while data is being fetched
						Array(10).fill(null).map((_, index) => (
							<React.Fragment key={index}>
								{renderTransactionSkeleton()}
							</React.Fragment>
						))
					) : (
						// Render actual transactions once data is loaded
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
										{transaction.tags && transaction.tags.length > 0 && (
										<div className={styles.tagContainer}>
											{transaction.tags.map((tag: string, index: number) => (
												<span 
													key={`${transaction.id}-tag-${index}`} 
													className={styles.tag}
												>
													#{tag}
												</span>
											))}
										</div>
									)}
										<span className={styles.date}>
											{transaction.date instanceof Date 
												? transaction.date.toLocaleDateString() 
												: transaction.date}
										</span>
										
									</div>
									
									<div className={styles.transactionAmount}>
										<div><MeatballMenu options={[
												{
													label: 'Edit',
													onClick: () => handleEdit(transaction),
													icon: <Pencil size={16} />,
												},
												{
													label: 'Delete',
													onClick: () => handleDelete(transaction.id),
													icon: <Trash2 size={16} />,
													variant: 'danger'
												}
											]} /></div>
									
										<div className={styles.actions}>
											
										</div>
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
			<EditTransactionCard
				isVisible={showEditForm}
				onClose={() => {
					setShowEditForm(false);
					setEditingTransaction(null);
				}}
				transaction={editingTransaction}
				setTransactions={setTransactions}
			/>
			<div className={`${styles.overlay} ${showEditForm ? styles.visible : styles.hidden}`}></div>
		</div>
	);
};

export default Transaction;

