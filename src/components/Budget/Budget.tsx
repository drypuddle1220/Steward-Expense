import React, { useEffect, useState } from "react";
import styles from "./Budget.module.css";
import Sidebar from "../Sidebar/sidebar";
import BudgetProgressBar from "./ProgressBar";
import SavingsProgressBar from "./ProgressBar";
import NewGoalForm from "./NewGoalForm";
import { FirestoreService } from "../../../Backend/config/firestoreService";
import { auth } from "../../../Backend/config/firebaseConfig";
import MeatballMenu from "../Transactions/MeatballMenu";
import { Pencil, Trash2, Plus } from "lucide-react";
import FloatingGoalDetail from "./FloatingGoalDetail";
import { Timestamp } from "firebase/firestore";
import ReactConfetti from "react-confetti";

// Interfaces
interface BudgetGoal {
	id: string;
	title: string;
	currentAmount: number;
	targetAmount: number;
	tags: {
		name: string;
		amount: number;
		color: string;
	}[];
}

interface NewGoalData {
	title: string;
	targetAmount: number;
	tags?: string[];
}

interface BudgetGoalData {
	id: string;
	title: string;
	targetAmount: number;
	tags: string[];
	type: string;
	createdAt: Date;
}

interface SavingsGoalData {
	id: string;
	title: string;
	targetAmount: number;
	amountSaved: number;
	contributions?: Array<{
		amount: number;
		date: Date;
	}>;
	createdAt: Date;
}

interface Transaction {
	id: string;
	amount: number;
	type: string;
	tags?: string[];
	description: string;
	date: any;
}

// Main Component
const Budget: React.FC = () => {
	// State Variables
	const [budgetGoals, setBudgetGoals] = useState<BudgetGoal[]>([]);
	const [savingsGoals, setSavingsGoals] = useState<SavingsGoalData[]>([]);
	const [loading, setLoading] = useState(true);
	const [showNewBudgetForm, setShowNewBudgetForm] = useState(false);
	const [showNewSavingsForm, setShowNewSavingsForm] = useState(false);
	const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
	const [editingGoal, setEditingGoal] = useState<BudgetGoal | null>(null);
	const [editingSavingsGoal, setEditingSavingsGoal] =
		useState<SavingsGoalData | null>(null);
	const [selectedGoal, setSelectedGoal] = useState<
		BudgetGoal | SavingsGoalData | null
	>(null);
	const [selectedGoalType, setSelectedGoalType] = useState<
		"budget" | "savings" | null
	>(null);
	const [transactions, setTransactions] = useState<Transaction[]>([]);

	// Effect to Load Data
	useEffect(() => {
		const loadAllData = async () => {
			const user = auth.currentUser;
			if (!user) return;

			try {
				// Get all transactions
				const transactions = await FirestoreService.getTransactions(
					user.uid
				);
				setTransactions(
					transactions.map((t) => ({
						...t,
						date: t.date.toDate(),
					}))
				);

				// Get budget goals
				const budgetGoalsData = (await FirestoreService.getBudgetGoals(
					user.uid
				)) as BudgetGoalData[];

				const savingsGoalsData =
					(await FirestoreService.getSavingsGoals(
						user.uid
					)) as unknown as SavingsGoalData[];

				// Process each budget goal
				const processedGoals = budgetGoalsData.map(
					(goal: BudgetGoalData) => {
						// Filter transactions that match this goal's tags
						const matchingTransactions = transactions.filter(
							(transaction) =>
								transaction.type === "expense" &&
								transaction.tags?.some((tag) =>
									goal.tags.includes(tag)
								)
						);

						const currentAmount = matchingTransactions.reduce(
							(total, transaction) => total + transaction.amount,
							0
						);

						// Group amounts by tag with assigned colors
						const colors = [
							"var(--chart-gradient-1)",
							"var(--chart-gradient-2)",
							"var(--chart-gradient-3)",
							"var(--chart-gradient-4)",
							"var(--chart-gradient-5)",
						];
						const tagAmounts = goal.tags.map((tag, index) => ({
							name: tag,
							amount: matchingTransactions
								.filter((t) => t.tags?.includes(tag))
								.reduce((sum, t) => sum + t.amount, 0),
							color: colors[index % colors.length],
						}));

						return {
							id: goal.id,
							title: goal.title,
							currentAmount,
							targetAmount: goal.targetAmount,
							tags: tagAmounts,
						};
					}
				);
				setSavingsGoals(savingsGoalsData);
				setBudgetGoals(processedGoals);
				setLoading(false);
			} catch (error) {
				console.error("Error loading budget data:", error);
				setLoading(false);
			}
		};

		loadAllData();
	}, []);

	// Handlers for Editing and Deleting Goals
	const handleEdit = (goal: BudgetGoal) => {
		setEditingGoal(goal);
		setShowNewBudgetForm(true);
	};

	const handleEditSavings = (goal: SavingsGoalData) => {
		setEditingSavingsGoal(goal);
		setShowNewSavingsForm(true);
	};

	const handleDelete = async (goalId: string) => {
		if (!auth.currentUser) {
			alert("Please log in to delete goals");
			return;
		}
		try {
			await FirestoreService.deleteBudgetGoal(
				auth.currentUser.uid,
				goalId
			);
			await refreshBudgetData();
		} catch (error) {
			console.error("Error deleting budget goal:", error);
		}
	};

	const handleDeleteSavings = async (goalId: string) => {
		if (!auth.currentUser) {
			alert("Please log in to delete goals");
			return;
		}
		try {
			await FirestoreService.deleteSavingsGoal(
				auth.currentUser.uid,
				goalId
			);
			await refreshSavingsData();
		} catch (error) {
			console.error("Error deleting savings goal:", error);
		}
	};

	// Budget Goal Item Component
	const BudgetGoalItem: React.FC<{ goal: BudgetGoal }> = ({ goal }) => {
		const percentageUsed = Math.round(
			(goal.currentAmount / goal.targetAmount) * 100
		);
		const isOverBudget = percentageUsed > 100;

		return (
			<div
				className={styles.goalItem}
				onClick={() => handleGoalClick(goal, "budget")}
				style={{ cursor: "pointer" }}
			>
				<div className={styles.goalHeader}>
					<div className={styles.goalTitleSection}>
						<h4 className={styles.goalTitle}>{goal.title}</h4>
						<span
							className={`${styles.percentageBadge} ${
								isOverBudget ? styles.overBudget : ""
							}`}
						>
							{percentageUsed}% Used
						</span>
					</div>
					<MeatballMenu
						options={[
							{
								label: "Edit",
								onClick: () => handleEdit(goal),
								icon: <Pencil size={16} />,
								variant: "edit",
							},
							{
								label:
									pendingDeleteId === goal.id
										? "Confirm Delete"
										: "Delete",
								onClick: () => handleDelete(goal.id),
								icon: <Trash2 size={16} />,
								variant: "danger",
							},
						]}
					/>
				</div>

				<div className={styles.goalAmount}>
					<span className={styles.currentAmount}>
						${goal.currentAmount.toLocaleString()}
					</span>
					<span className={styles.separator}>/</span>
					<span className={styles.targetAmount}>
						${goal.targetAmount.toLocaleString()}
					</span>
				</div>

				<div className={styles.progressSection}>
					<BudgetProgressBar.BudgetProgressBar
						tags={goal.tags}
						total={goal.targetAmount}
					/>
				</div>

				<div className={styles.tagBreakdown}>
					<div className={styles.tagBreakdownHeader}>
						<span>Category</span>
						<span>Amount</span>
						<span>% of Total</span>
					</div>
					{goal.tags.map((tag) => (
						<div key={tag.name} className={styles.tagItem}>
							<div className={styles.tagLabel}>
								<div
									className={styles.tagColor}
									style={{ backgroundColor: tag.color }}
								/>
								<span>{tag.name}</span>
							</div>
							<span className={styles.tagAmount}>
								${tag.amount.toLocaleString()}
							</span>
							<span className={styles.tagPercentage}>
								{Math.round(
									(tag.amount / goal.targetAmount) * 100
								)}
								%
							</span>
						</div>
					))}
				</div>
			</div>
		);
	};

	// Savings Goal Item Component
	const SavingsGoalItem: React.FC<{ goal: SavingsGoalData }> = ({ goal }) => {
		const [isSuccess, setIsSuccess] = useState(false);
		const [showConfetti, setShowConfetti] = useState(false);
		const [motivationalMessage, setMotivationalMessage] = useState("");
		const [amount, setAmount] = useState("");
		const [isAdding, setIsAdding] = useState(false);

		const handleAddSavings = async (e: React.FormEvent) => {
			e.preventDefault();
			if (!amount || !auth.currentUser) return;

			try {
				const newAmount = goal.amountSaved + Number(amount);
				const previousProgress = Math.floor(
					(goal.amountSaved / goal.targetAmount) * 100
				);
				const newProgress = Math.floor(
					(newAmount / goal.targetAmount) * 100
				);

				const newContribution = {
					amount: Number(amount),
					date: new Date(),
				};

				setIsSuccess(true);
				setIsAdding(false);
				setAmount("");

				if (
					(newProgress >= 25 && previousProgress < 25) ||
					(newProgress >= 50 && previousProgress < 50) ||
					(newProgress >= 75 && previousProgress < 75) ||
					(newProgress >= 100 && previousProgress < 100)
				) {
					setShowConfetti(true);
					setMotivationalMessage(
						getMotivationalMessage(newAmount, goal.targetAmount)
					);
				}

				await FirestoreService.updateSavingsGoal(
					auth.currentUser.uid,
					goal.id,
					{
						...goal,
						amountSaved: newAmount,
						contributions: [
							...(goal.contributions || []),
							newContribution,
						],
					}
				);

				setTimeout(async () => {
					await refreshSavingsData();
				}, 3000);

				setTimeout(() => {
					setShowConfetti(false);
					setIsSuccess(false);
					setMotivationalMessage("");
				}, 5000);
			} catch (error) {
				console.error("Error updating savings:", error);
				setIsSuccess(false);
				setShowConfetti(false);
				setMotivationalMessage("");
			}
		};

		const handleButtonClick = (e: React.MouseEvent) => {
			e.stopPropagation();
			setIsAdding(!isAdding);
		};

		const percentageSaved = Math.round(
			(goal.amountSaved / goal.targetAmount) * 100
		);
		const remainingAmount = goal.targetAmount - goal.amountSaved;
		return (
			<div
				className={styles.goalItem}
				onClick={() => handleGoalClick(goal, "savings")}
				style={{ cursor: "pointer" }}
			>
				{showConfetti && (
					<ReactConfetti
						width={window.innerWidth}
						height={window.innerHeight}
						recycle={false}
						numberOfPieces={200}
						gravity={0.3}
						colors={[
							"#2ecc71",
							"#3498db",
							"#f1c40f",
							"#e74c3c",
							"#9b59b6",
						]}
						style={{
							position: "fixed",
							top: 0,
							left: 0,
							zIndex: 1000,
						}}
					/>
				)}

				{motivationalMessage && (
					<div className={styles.motivationalMessage}>
						{motivationalMessage}
					</div>
				)}

				<div className={styles.goalHeader}>
					<div className={styles.goalTitleSection}>
						<h4 className={styles.goalTitle}>{goal.title}</h4>
						<span className={styles.percentageBadge}>
							{percentageSaved}% Saved
						</span>
					</div>
					<MeatballMenu
						options={[
							{
								label: "Edit",
								onClick: () => {
									handleEditSavings(goal);
								},
								icon: <Pencil size={16} />,
								variant: "edit",
							},
							{
								label:
									pendingDeleteId === goal.id
										? "Confirm Delete"
										: "Delete",
								onClick: () => {
									handleDeleteSavings(goal.id);
								},
								icon: <Trash2 size={16} />,
								variant: "danger",
							},
						]}
					/>
				</div>

				<div className={styles.goalAmount}>
					<span className={styles.currentAmount}>
						${(goal.amountSaved || 0).toLocaleString()}
					</span>
					<span className={styles.separator}>/</span>
					<span className={styles.targetAmount}>
						${(goal.targetAmount || 0).toLocaleString()}
					</span>
				</div>

				<div className={styles.progressSection}>
					<SavingsProgressBar.SavingsProgressBar
						savedAmount={goal.amountSaved}
						total={goal.targetAmount}
					/>
				</div>

				<div className={styles.savingsInfo}>
					<div className={styles.savingsInfoItem}>
						<span>Remaining to save</span>
						<span className={styles.savingsInfoValue}>
							${remainingAmount.toLocaleString()}
						</span>
					</div>
					<div className={styles.savingsInfoItem}>
						<span>Monthly target</span>
						<span className={styles.savingsInfoValue}>
							${Math.ceil(remainingAmount / 12).toLocaleString()}
							/month
						</span>
					</div>
				</div>

				<div className={styles.savingsActions}>
					<div
						className={`${styles.savingsInputContainer} ${
							isAdding ? styles.expanded : ""
						}`}
					>
						<form
							onSubmit={handleAddSavings}
							className={styles.savingsForm}
						>
							<input
								type='number'
								value={amount}
								onClick={(e) => e.stopPropagation()}
								onChange={(e) => setAmount(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "-") e.preventDefault();
								}}
								placeholder='Enter amount'
								className={styles.savingsInput}
							/>
							<button
								onClick={(e) => e.stopPropagation()}
								type='submit'
								className={styles.confirmButton}
							>
								Confirm
							</button>
						</form>
					</div>
					<button
						className={`${styles.addSavingsBtn} ${
							isSuccess ? styles.success : ""
						} ${isAdding ? styles.shifted : ""}`}
						onClick={handleButtonClick}
					>
						<Plus className={styles.addSavingsIcon} size={20} />
						{isAdding ? "Cancel" : "Add to Savings"}
					</button>
				</div>
			</div>
		);
	};

	// Add Button Component
	const AddButton: React.FC<{ onClick: () => void; label: string }> = ({
		onClick,
		label,
	}) => (
		<button className={styles.addButton} onClick={onClick}>
			<span className={styles.addIcon}></span>
			<span>{label}</span>
		</button>
	);

	// Refresh Data Functions
	const refreshBudgetData = async () => {
		setLoading(true);
		const user = auth.currentUser;
		if (!user) return;

		try {
			const transactions = await FirestoreService.getTransactions(
				user.uid
			);
			const budgetGoalsData = (await FirestoreService.getBudgetGoals(
				user.uid
			)) as BudgetGoalData[];

			// Process each budget goal
			const processedGoals = budgetGoalsData.map(
				(goal: BudgetGoalData) => {
					const matchingTransactions = transactions.filter(
						(transaction) =>
							transaction.type === "expense" &&
							transaction.tags?.some((tag) =>
								goal.tags.includes(tag)
							)
					);

					const currentAmount = matchingTransactions.reduce(
						(total, transaction) => total + transaction.amount,
						0
					);

					const colors = [
						"#5dade2",
						"#58d68d",
						"#ec7063",
						"#f7dc6f",
						"#af7ac5",
					];
					const tagAmounts = goal.tags.map((tag, index) => ({
						name: tag,
						amount: matchingTransactions
							.filter((t) => t.tags?.includes(tag))
							.reduce((sum, t) => sum + t.amount, 0),
						color: colors[index % colors.length],
					}));

					return {
						id: goal.id,
						title: goal.title,
						currentAmount,
						targetAmount: goal.targetAmount,
						tags: tagAmounts,
					};
				}
			);

			setBudgetGoals(processedGoals);
		} catch (error) {
			console.error("Error refreshing budget data:", error);
		} finally {
			setLoading(false);
		}
	};

	const refreshSavingsData = async () => {
		setLoading(true);
		const user = auth.currentUser;
		if (!user) return;
		const savingsGoals = (await FirestoreService.getSavingsGoals(
			user.uid
		)) as unknown as SavingsGoalData[];
		setSavingsGoals(savingsGoals);
		setLoading(false);
	};

	// Submit Handlers
	const handleSubmitBudgetGoal = async (goalData: NewGoalData) => {
		const user = auth.currentUser;
		if (!user) return;

		try {
			if (editingGoal) {
				// Update existing goal
				await FirestoreService.updateBudgetGoal(
					user.uid,
					editingGoal.id,
					{
						title: goalData.title,
						targetAmount: goalData.targetAmount,
						tags: goalData.tags,
						type: "budget",
					}
				);
			} else {
				// Create new goal
				await FirestoreService.addBudgetGoal(user.uid, {
					title: goalData.title,
					targetAmount: goalData.targetAmount,
					tags: goalData.tags || [],
					createdAt: new Date(),
					type: "budget",
				});
			}

			setShowNewBudgetForm(false);
			setEditingGoal(null);
			await refreshBudgetData();
		} catch (error) {
			console.error("Error saving budget goal:", error);
		}
	};

	const handleSubmitSavingsGoal = async (goalData: any) => {
		const user = auth.currentUser;
		if (!user) return;
		try {
			if (editingSavingsGoal) {
				await FirestoreService.updateSavingsGoal(
					user.uid,
					editingSavingsGoal.id,
					goalData
				);
			} else {
				if (goalData.amountSaved > 0) {
					const initialContribution = {
						amount: Number(goalData.amountSaved),
						date: Timestamp.fromDate(new Date()),
					};

					await FirestoreService.addSavingsGoal(user.uid, {
						title: goalData.title,
						targetAmount: goalData.targetAmount,
						amountSaved: goalData.amountSaved || 0,
						createdAt: new Date(),
						contributions: [
							{
								...initialContribution,
								date: initialContribution.date.toDate(),
							},
						],
						type: "savings",
					});
				} else {
					await FirestoreService.addSavingsGoal(user.uid, {
						title: goalData.title,
						targetAmount: goalData.targetAmount,
						amountSaved: goalData.amountSaved || 0,
						createdAt: new Date(),
						type: "savings",
					});
				}
			}

			await refreshSavingsData();
			setShowNewSavingsForm(false);
			setEditingSavingsGoal(null);
		} catch (error) {
			console.error("Error saving user data:", error);
		}
	};

	// Goal Click Handlers
	const handleGoalClick = (
		goal: BudgetGoal | SavingsGoalData,
		type: "budget" | "savings"
	) => {
		setSelectedGoal(goal);
		setSelectedGoalType(type);
	};

	const handleCloseFloatingGoal = () => {
		setSelectedGoal(null);
		setSelectedGoalType(null);
	};

	// Render Skeleton loading placeholder for goal items.
	const renderBudgetGoalsSkeleton = () => (
		<div className={styles.goalItem}>
			<div className={styles.goalHeader}>
				<div className={styles.goalTitleSection}>
					<h4 className={styles.skeleton}></h4>{" "}
					{/* Placeholder for goal title */}
					<span className={styles.skeleton}></span>{" "}
					{/* Placeholder for percentage badge */}
				</div>
			</div>

			<div className={styles.goalAmount}>
				<span className={styles.skeleton}></span>{" "}
				{/* Placeholder for current amount */}
				<span className={styles.separator}></span>{" "}
				{/* Placeholder for separator */}
				<span className={styles.skeleton}></span>{" "}
				{/* Placeholder for target amount */}
			</div>

			<div className={styles.progressSection}>
				<div className={styles.skeleton}></div>{" "}
				{/* Placeholder for progress bar */}
			</div>

			<div className={styles.tagBreakdown}>
				<div className={styles.tagBreakdownHeader}>
					<span className={styles.skeleton}></span>{" "}
					{/* Placeholder for category header */}
					<span className={styles.skeleton}></span>{" "}
					{/* Placeholder for amount header */}
					<span className={styles.skeleton}></span>{" "}
					{/* Placeholder for percentage header */}
				</div>
				{Array(1)
					.fill(null)
					.map(
						(
							_,
							index // Placeholder for tag items
						) => (
							<div key={index} className={styles.tagItem}>
								<div className={styles.tagLabel}>
									<div
										className={`${styles.tagColor} ${styles.skeleton}`}
									></div>{" "}
									{/* Placeholder for tag color */}
									<span
										className={styles.skeleton}
									></span>{" "}
									{/* Placeholder for tag name */}
								</div>
								<span className={styles.skeleton}></span>{" "}
								{/* Placeholder for tag amount */}
								<span className={styles.skeleton}></span>{" "}
								{/* Placeholder for tag percentage */}
							</div>
						)
					)}
			</div>
		</div>
	);

	const renderSavingsGoalSkeleton = () => (
		<div className={styles.goalItem}>
			<div className={styles.goalHeader}>
				<div className={styles.goalTitleSection}>
					<h4 className={styles.skeleton}></h4>{" "}
					{/* Placeholder for goal title */}
					<span className={styles.skeleton}></span>{" "}
					{/* Placeholder for percentage badge */}
				</div>
			</div>

			<div className={styles.goalAmount}>
				<span className={styles.skeleton}></span>{" "}
				{/* Placeholder for current amount */}
				<span className={styles.separator}></span>{" "}
				{/* Placeholder for separator */}
				<span className={styles.skeleton}></span>{" "}
				{/* Placeholder for target amount */}
			</div>

			<div className={styles.progressSection}>
				<div className={styles.skeleton}></div>{" "}
				{/* Placeholder for progress bar */}
			</div>

			<div className={styles.savingsInfo}>
				<div className={styles.savingsInfoItem}>
					<span className={styles.skeleton}></span>{" "}
					{/* Placeholder for "Remaining to save" label */}
					<span className={styles.skeleton}></span>{" "}
					{/* Placeholder for remaining amount */}
				</div>
				<div className={styles.savingsInfoItem}>
					<span className={styles.skeleton}></span>{" "}
					{/* Placeholder for "Monthly target" label */}
					<span className={styles.skeleton}></span>{" "}
					{/* Placeholder for monthly target value */}
				</div>
			</div>

			<div className={styles.savingsActions}>
				<div
					className={`${styles.savingsInputContainer} ${styles.expanded}`}
				>
					<form className={styles.savingsForm}>
						<input
							className={`${styles.savingsInput} ${styles.skeleton}`} // Placeholder for input
						/>
						{/* No buttons rendered in the skeleton */}
					</form>
				</div>
			</div>
		</div>
	);

	const getMotivationalMessage = (
		savedAmount: number,
		targetAmount: number
	) => {
		const progress = (savedAmount / targetAmount) * 100;
		if (progress >= 100) return "🎉 Amazing! You've reached your goal!";
		if (progress >= 75) return "💪 Almost there! You're crushing it!";
		if (progress >= 50) return "🌟 Halfway there! Keep going strong!";
		if (progress >= 25) return "🚀 Great progress! You're on your way!";
		return "✨ Every penny counts! Keep it up!";
	};

	// Render
	return (
		<div className={styles.budget}>
			<Sidebar />

			<div className={styles.mainContent}>
				<div className={styles.container}>
					<div className={styles.sectionHeader}>
						<h3>Budget Tracker</h3>
						<AddButton
							onClick={() => setShowNewBudgetForm(true)}
							label='New Budget Goal'
						/>
					</div>
					<div className={styles.goalItemContainer}>
						{loading
							? Array(3)
									.fill(null)
									.map((_, index) => (
										<div key={index}>
											{renderBudgetGoalsSkeleton()}
										</div>
									))
							: budgetGoals.map((goal, index) => (
									<BudgetGoalItem key={index} goal={goal} />
							  ))}
					</div>
				</div>

				<div className={styles.container}>
					<div className={styles.sectionHeader}>
						<h3>Savings Tracker</h3>
						<AddButton
							onClick={() => setShowNewSavingsForm(true)}
							label='New Savings Goal'
						/>
					</div>
					<div className={styles.goalItemContainer}>
						{loading
							? Array(3)
									.fill(null)
									.map((_, index) => (
										<div key={index}>
											{renderSavingsGoalSkeleton()}
										</div>
									))
							: savingsGoals.map((goal, index) => (
									<SavingsGoalItem key={index} goal={goal} />
							  ))}
					</div>
				</div>

				<NewGoalForm
					isVisible={showNewBudgetForm}
					onClose={() => {
						setShowNewBudgetForm(false);
						setEditingGoal(null);
					}}
					onSubmit={handleSubmitBudgetGoal}
					type='budget'
					initialData={editingGoal || undefined}
				/>

				<NewGoalForm
					isVisible={showNewSavingsForm}
					onClose={() => setShowNewSavingsForm(false)}
					onSubmit={handleSubmitSavingsGoal}
					type='savings'
					initialData={
						editingSavingsGoal
							? {
									title: editingSavingsGoal.title,
									targetAmount:
										editingSavingsGoal.targetAmount,
									amountSaved: editingSavingsGoal.amountSaved,
							  }
							: undefined
					}
				/>

				{selectedGoal && selectedGoalType && (
					<FloatingGoalDetail
						isVisible={!!selectedGoal}
						onClose={handleCloseFloatingGoal}
						goal={
							selectedGoal as unknown as
								| BudgetGoal
								| SavingsGoalData
						}
						type={selectedGoalType}
						transactions={transactions.map((t) => ({
							id: t.id,
							amount: t.amount,
							description: t.description,
							date: t.date,
							tags: t.tags || [],
							type: t.type,
						}))}
					/>
				)}
			</div>
		</div>
	);
};

export default Budget;
