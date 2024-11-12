// import React, { useState } from "react";
// import styles from "./NewGoalForm.module.css"; // Reuse existing form styles
// import { Plus } from "lucide-react";

// interface AddSavingsFormProps {
// 	isVisible: boolean;
// 	onClose: () => void;
// 	onSubmit: (amount: number) => Promise<void>;
// 	currentAmount: number;
// 	targetAmount: number;
// }

// const AddSavingsForm: React.FC<AddSavingsFormProps> = ({
// 	isVisible,
// 	onClose,
// 	onSubmit,
// 	currentAmount,
// 	targetAmount,
// }) => {
// 	const [amount, setAmount] = useState<string>("");
// 	const [isSubmitting, setIsSubmitting] = useState(false);
// 	const remainingAmount = targetAmount - currentAmount;

// 	const handleSubmit = async (e: React.FormEvent) => {
// 		e.preventDefault();
// 		if (!amount || isSubmitting) return;

// 		setIsSubmitting(true);
// 		try {
// 			await onSubmit(Number(amount));
// 			setAmount("");
// 			onClose();
// 		} catch (error) {
// 			console.error("Error adding savings:", error);
// 		} finally {
// 			setIsSubmitting(false);
// 		}
// 	};

// 	if (!isVisible) return null;

// 	return (
// 		<div className={styles.modalOverlay}>
// 			<div className={styles.modalContent}>
// 				<h2>Add to Savings</h2>
// 				<form onSubmit={handleSubmit}>
// 					<div className={styles.formGroup}>
// 						<label htmlFor='amount'>Amount to Add</label>
// 						<input
// 							type='number'
// 							id='amount'
// 							value={amount}
// 							onChange={(e) => setAmount(e.target.value)}
// 							placeholder={`Remaining to goal: $${remainingAmount.toLocaleString()}`}
// 							min='0'
// 							max={remainingAmount}
// 							required
// 						/>
// 					</div>

// 					<div className={styles.formActions}>
// 						<button
// 							type='button'
// 							onClick={onClose}
// 							className={styles.cancelBtn}
// 						>
// 							Cancel
// 						</button>
// 						<button
// 							type='submit'
// 							disabled={isSubmitting}
// 							className={styles.submitBtn}
// 						>
// 							{isSubmitting ? "Adding..." : "Add to Savings"}
// 						</button>
// 					</div>
// 				</form>
// 			</div>
// 		</div>
// 	);
// };

// export default AddSavingsForm;
