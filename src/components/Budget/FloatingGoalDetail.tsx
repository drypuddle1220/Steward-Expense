import React, { useState } from "react";
import styles from "./FloatingGoalDetail.module.css";
import { X } from "lucide-react";
import BudgetProgressBar from "./ProgressBar";
import SavingsProgressBar from "./ProgressBar";
import { Timestamp } from "firebase/firestore";

interface Transaction {
	id: string;
	amount: number;
	description: string;
	date: Date;
	tags: string[];
	type: string;
}

interface FloatingGoalDetailProps {
	isVisible: boolean;
	onClose: () => void;
	goal: BudgetGoal | SavingsGoalData;
	type: "budget" | "savings";
	transactions?: Transaction[];
}

interface BudgetGoal {
	id: string;
	title: string;
	currentAmount: number;
	targetAmount: number;
	tags: string[] | { name: string; amount: number; color: string }[];
}

interface SavingsGoalData {
	id: string;
	title: string;
	targetAmount: number;
	amountSaved: number;
	createdAt: Date;
	contributions?: Array<{
		amount: number;
		date: Date;
	}>;
}

const FloatingGoalDetail: React.FC<FloatingGoalDetailProps> = ({
	isVisible,
	onClose,
	goal,
	type,
	transactions,
}) => {
	const [isClosing, setIsClosing] = useState(false);

	const handleClose = () => {
		setIsClosing(true);
		setTimeout(() => {
			onClose();
			setIsClosing(false);
		}, 300); // Match animation duration
	};

	if (!isVisible) return null;

	return (
		<div className={`${styles.overlay} ${isClosing ? styles.closing : ""}`}>
			<div
				className={`${styles.container} ${
					isClosing ? styles.closing : ""
				}`}
			>
				<div className={styles.header}>
					<h2>{goal.title}</h2>
					<button
						onClick={handleClose}
						className={styles.closeButton}
					>
						<X size={24} />
					</button>
				</div>

				<div className={styles.content}>
					{type === "budget" ? (
						<BudgetGoalDetail
							goal={goal as BudgetGoal}
							transactions={transactions}
						/>
					) : (
						<SavingsGoalDetail goal={goal as SavingsGoalData} />
					)}
				</div>
			</div>
		</div>
	);
};

const BudgetGoalDetail: React.FC<{
	goal: BudgetGoal;
	transactions?: Transaction[];
}> = ({ goal, transactions }) => {
	const percentageUsed = Math.round(
		(goal.currentAmount / goal.targetAmount) * 100
	);

	// Filter transactions to only show those matching the goal's tags
	const relevantTransactions = transactions?.filter(
		(transaction) =>
			transaction.type === "expense" &&
			transaction.tags?.some((tag) =>
				goal.tags.some((goalTag) =>
					typeof goalTag === "string"
						? goalTag === tag
						: goalTag.name === tag
				)
			)
	);

	return (
		<>
			<div className={styles.summary}>
				<div className={styles.amounts}>
					<span className={styles.current}>
						${goal.currentAmount.toLocaleString()}
					</span>
					<span className={styles.separator}>/</span>
					<span className={styles.target}>
						${goal.targetAmount.toLocaleString()}
					</span>
				</div>
				<div className={styles.progress}>
					<BudgetProgressBar.BudgetProgressBar
						tags={
							goal.tags as {
								name: string;
								amount: number;
								color: string;
							}[]
						}
						total={goal.targetAmount}
					/>
				</div>
			</div>

			<div className={styles.transactionsList}>
				<h3>Related Transactions</h3>
				{relevantTransactions && relevantTransactions.length > 0 ? (
					relevantTransactions.map((transaction) => (
						<div
							key={transaction.id}
							className={styles.transactionItem}
						>
							<div className={styles.transactionMain}>
								<div className={styles.transactionInfo}>
									<span className={styles.description}>
										{transaction.description}
									</span>
									<span className={styles.amount}>
										-${transaction.amount.toLocaleString()}
									</span>
								</div>
								<span className={styles.date}>
									{new Date(
										transaction.date
									).toLocaleDateString()}
								</span>
							</div>
							<div className={styles.tags}>
								{transaction.tags?.map((tag) => (
									<span key={tag} className={styles.tag}>
										{tag}
									</span>
								))}
							</div>
						</div>
					))
				) : (
					<div className={styles.noTransactions}>
						<p>No related transactions found</p>
						<p>
							Transactions matching this goal's categories will
							appear here
						</p>
					</div>
				)}
			</div>
		</>
	);
};

const SavingsGoalDetail: React.FC<{ goal: SavingsGoalData }> = ({ goal }) => {
	const totalContributions =
		goal.contributions?.reduce((sum, c) => sum + c.amount, 0) || 0;
	const remainingAmount = goal.targetAmount - goal.amountSaved;
	const percentageComplete = Math.round(
		(goal.amountSaved / goal.targetAmount) * 100
	);

	return (
		<>
			<div className={styles.summary}>
				<div className={styles.summaryStats}>
					<div className={styles.statItem}>
						<span className={styles.statLabel}>Total Saved</span>
						<span className={styles.statValue}>
							${goal.amountSaved.toLocaleString()}
						</span>
					</div>
					<div className={styles.statItem}>
						<span className={styles.statLabel}>Remaining</span>
						<span className={styles.statValue}>
							${remainingAmount.toLocaleString()}
						</span>
					</div>
					<div className={styles.statItem}>
						<span className={styles.statLabel}>Progress</span>
						<span className={styles.statValue}>
							{percentageComplete}%
						</span>
					</div>
				</div>

				<SavingsProgressBar.SavingsProgressBar
					savedAmount={goal.amountSaved}
					total={goal.targetAmount}
				/>
			</div>

			<div className={styles.contributionsList}>
				<div className={styles.contributionsHeader}>
					<h3>Contribution History</h3>
					<span className={styles.totalContributions}>
						{goal.contributions?.length || 0} contributions
					</span>
				</div>

				{goal.contributions && goal.contributions.length > 0 ? (
					<div className={styles.contributionsContainer}>
						<div className={styles.contributionsTableHeader}>
							<span>Amount</span>
							<span>Date</span>
							<span>Progress at Time</span>
						</div>
						{goal.contributions
							.sort(
								(a, b) =>
									new Date(b.date).getTime() -
									new Date(a.date).getTime()
							)
							.map((contribution, index) => {
								const runningTotal =
									goal.contributions
										?.slice(0, index + 1)
										.reduce(
											(sum, c) => sum + c.amount,
											0
										) || 0;
								const progressAtTime = Math.round(
									(runningTotal / goal.targetAmount) * 100
								);

								return (
									<div
										key={index}
										className={styles.contributionItem}
									>
										<span
											className={
												styles.contributionAmount
											}
										>
											+$
											{contribution.amount.toLocaleString()}
										</span>
										<span
											className={styles.contributionDate}
										>
											{contribution.date instanceof
											Timestamp
												? contribution.date
														.toDate()
														.toLocaleDateString(
															"en-US",
															{
																month: "short",
																day: "numeric",
																year: "numeric",
															}
														)
												: new Date(
														contribution.date
												  ).toLocaleDateString()}
										</span>
										<span
											className={
												styles.contributionProgress
											}
										>
											{progressAtTime}%
										</span>
									</div>
								);
							})}
					</div>
				) : (
					<div className={styles.noContributions}>
						<p>No contributions yet</p>
						<p className={styles.noContributionsSubtext}>
							Start adding to your savings to track your progress
						</p>
					</div>
				)}
			</div>
		</>
	);
};

export default FloatingGoalDetail;
