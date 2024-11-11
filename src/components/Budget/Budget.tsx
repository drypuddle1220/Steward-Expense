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
	createdAt: Date;
}

// interface NewGoalFormProps {
// 	isVisible: boolean;
// 	onClose: () => void;
// 	onSubmit: (goalData: NewGoalData) => Promise<void>;
// 	type: "budget" | "savings";
// 	initialData?: BudgetGoal | null;
// }

const Budget: React.FC = () => {
	const [budgetGoals, setBudgetGoals] = useState<BudgetGoal[]>([]);
	const [savingsGoals, setSavingsGoals] = useState<SavingsGoalData[]>([]);
	const [loading, setLoading] = useState(true);
	const [showNewBudgetForm, setShowNewBudgetForm] = useState(false);
	const [showNewSavingsForm, setShowNewSavingsForm] = useState(false);
	const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
	const [editingGoal, setEditingGoal] = useState<BudgetGoal | null>(null);
	const [editingSavingsGoal, setEditingSavingsGoal] =
		useState<SavingsGoalData | null>(null);
	useEffect(() => {
		const loadAllData = async () => {
			const user = auth.currentUser;
			if (!user) return;

			try {
				// Get all transactions
				const transactions = await FirestoreService.getTransactions(
					user.uid
				);

				// Get budget goals
				const budgetGoalsData = (await FirestoreService.getBudgetGoals(
					user.uid
				)) as BudgetGoalData[];

				const savingsGoalsData =
					(await FirestoreService.getSavingsGoals(
						user.uid
					)) as SavingsGoalData[];

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

	const BudgetGoalItem: React.FC<{ goal: BudgetGoal }> = ({ goal }) => {
		const percentageUsed = Math.round(
			(goal.currentAmount / goal.targetAmount) * 100
		);
		const isOverBudget = percentageUsed > 100;

		return (
			<div className={styles.goalItem}>
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

	const SavingsGoalItem: React.FC<{ goal: SavingsGoalData }> = ({ goal }) => {
		const [isSuccess, setIsSuccess] = useState(false);
		const [isAdding, setIsAdding] = useState(false);
		const [amount, setAmount] = useState("");

		const handleAddSavings = async (e: React.FormEvent) => {
			e.preventDefault();
			if (!amount || !auth.currentUser) return;

			try {
				await FirestoreService.updateSavingsGoal(
					auth.currentUser.uid,
					goal.id,
					{
						...goal,
						amountSaved: goal.amountSaved + Number(amount),
					}
				);

				setIsSuccess(true);
				setIsAdding(false);
				setAmount("");

				await refreshSavingsData();

				setTimeout(() => {
					setIsSuccess(false);
				}, 1500);
			} catch (error) {
				console.error("Error updating savings:", error);
			}
		};

		const percentageSaved = Math.round(
			(goal.amountSaved / goal.targetAmount) * 100
		);
		const remainingAmount = goal.targetAmount - goal.amountSaved;

		return (
			<div className={styles.goalItem}>
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
								onClick: () => handleEditSavings(goal),
								icon: <Pencil size={16} />,
								variant: "edit",
							},
							{
								label:
									pendingDeleteId === goal.id
										? "Confirm Delete"
										: "Delete",
								onClick: () => handleDeleteSavings(goal.id),
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
								onChange={(e) => setAmount(e.target.value)}
								placeholder='Enter amount'
								className={styles.savingsInput}
							/>
							<button
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
						onClick={() => setIsAdding(!isAdding)}
					>
						<Plus className={styles.addSavingsIcon} size={20} />
						{isAdding ? "Cancel" : "Add to Savings"}
					</button>
				</div>
			</div>
		);
	};

	const AddButton: React.FC<{ onClick: () => void; label: string }> = ({
		onClick,
		label,
	}) => (
		<button className={styles.addButton} onClick={onClick}>
			<span className={styles.addIcon}></span>
			<span>{label}</span>
		</button>
	);

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
		)) as SavingsGoalData[];
		setSavingsGoals(savingsGoals);
		setLoading(false);
	};

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
				await FirestoreService.addSavingsGoal(user.uid, {
					title: goalData.title,
					targetAmount: goalData.targetAmount,
					amountSaved: goalData.amountSaved || 0,
					createdAt: new Date(),
					type: "savings",
				});
			}

			await refreshSavingsData();
			setShowNewSavingsForm(false);
			setEditingSavingsGoal(null);

			return (
				<NewGoalForm
					key={Date.now()}
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
			);
		} catch (error) {
			console.error("Error saving user data:", error);
		}
	};

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
					{loading ? (
						<div>Loading...</div>
					) : (
						budgetGoals.map((goal, index) => (
							<BudgetGoalItem key={index} goal={goal} />
						))
					)}
				</div>

				<div className={styles.container}>
					<div className={styles.sectionHeader}>
						<h3>Savings Tracker</h3>
						<AddButton
							onClick={() => setShowNewSavingsForm(true)}
							label='New Savings Goal'
						/>
					</div>
					{loading ? (
						<div>Loading...</div>
					) : (
						savingsGoals.map((goal, index) => (
							<SavingsGoalItem key={index} goal={goal} />
						))
					)}
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
			</div>
		</div>
	);
};

export default Budget;
